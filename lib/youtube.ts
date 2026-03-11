export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description: string;
}

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 1
): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(
      `/api/youtube?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    );
    if (res.ok) {
      const data = await res.json();
      return data.videos || [];
    }
  } catch {
    // ignore
  }

  return [
    {
      videoId: "",
      title: query,
      thumbnail: "",
      channelTitle: "Search on YouTube",
      description: `Search for "${query}" on YouTube`,
    },
  ];
}

// Batch search: sends all queries at once, server paces them to avoid rate limits
export async function batchSearchYouTubeVideos(
  queries: string[]
): Promise<Record<string, YouTubeVideo>> {
  try {
    const res = await fetch("/api/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queries }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.results || {};
    }
  } catch {
    // ignore
  }
  return {};
}

// Progressive streaming search: results arrive one at a time via NDJSON stream
export async function streamSearchYouTubeVideos(
  queries: string[],
  onResult: (query: string, video: YouTubeVideo) => void,
  onProgress: (loaded: number, total: number) => void
): Promise<void> {
  try {
    const res = await fetch("/api/youtube/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queries }),
    });

    if (!res.ok || !res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (possibly incomplete) chunk in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const { query, video, index, total } = JSON.parse(line);
          if (video?.videoId) {
            onResult(query, video);
          }
          onProgress(index + 1, total);
        } catch {
          // ignore parse errors
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.trim()) {
      try {
        const { query, video, index, total } = JSON.parse(buffer);
        if (video?.videoId) {
          onResult(query, video);
        }
        onProgress(index + 1, total);
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore stream errors
  }
}
