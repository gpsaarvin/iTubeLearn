import { NextRequest } from "next/server";
import YouTube from "youtube-sr";
import { isBlockedQuery, BLOCKED_MESSAGE } from "@/lib/content-filter";

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description: string;
}

// Shared in-memory cache (same process as main route)
const videoCache = new Map<string, YouTubeVideo>();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ytSearch(q: string): Promise<YouTubeVideo | null> {
  const cached = videoCache.get(q.toLowerCase());
  if (cached) return cached;

  try {
    const results = await YouTube.search(q, { limit: 1, type: "video" });
    const v = results.find((r) => r.id);
    if (v) {
      const video: YouTubeVideo = {
        videoId: v.id || "",
        title: v.title || q,
        thumbnail: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
        channelTitle: v.channel?.name || "",
        description: v.description || "",
      };
      videoCache.set(q.toLowerCase(), video);
      return video;
    }
  } catch {
    // fall through
  }
  return null;
}

async function searchWithRetry(q: string): Promise<YouTubeVideo> {
  let video = await ytSearch(q);
  if (video) return video;

  await delay(2000);
  const simpler = q.split(/\s+/).slice(0, 3).join(" ") + " tutorial";
  video = await ytSearch(simpler);
  if (video) {
    videoCache.set(q.toLowerCase(), video);
    return video;
  }

  return {
    videoId: "",
    title: q,
    thumbnail: "",
    channelTitle: "Search on YouTube",
    description: `Search for "${q}" on YouTube`,
  };
}

// Streaming POST: sends NDJSON (one JSON per line) as each video is found
export async function POST(request: NextRequest) {
  const body = await request.json();
  const queries: string[] = body.queries || [];
  const language: string | undefined = body.language;

  if (!queries.length) {
    return new Response(JSON.stringify({ error: "Missing queries" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Filter out blocked queries
  const safeQueries = queries.filter((q) => !isBlockedQuery(q));
  if (!safeQueries.length) {
    return new Response(JSON.stringify({ error: BLOCKED_MESSAGE }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let needsDelay = false;

      for (let i = 0; i < safeQueries.length; i++) {
        const q = safeQueries[i];
        // Append language to the query if specified (e.g., "python tutorial" → "python tutorial in Tamil")
        const searchQ = language ? `${q} in ${language}` : q;
        const isCached = videoCache.has(searchQ.toLowerCase());

        // Only delay before uncached searches (skip the first one)
        if (needsDelay && !isCached) {
          await delay(3000);
        }

        const video = await searchWithRetry(searchQ);

        const line = JSON.stringify({
          query: q,
          video,
          index: i,
          total: safeQueries.length,
        }) + "\n";

        controller.enqueue(encoder.encode(line));

        // Need delay before next uncached query
        if (!isCached) {
          needsDelay = true;
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
