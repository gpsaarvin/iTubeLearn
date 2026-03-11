import { NextRequest, NextResponse } from "next/server";
import YouTube from "youtube-sr";
import { isBlockedQuery, BLOCKED_MESSAGE } from "@/lib/content-filter";

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description: string;
}

// In-memory cache: persists across requests while the server is running
const videoCache = new Map<string, YouTubeVideo>();

const EMPTY_VIDEO = (q: string): YouTubeVideo => ({
  videoId: "",
  title: q,
  thumbnail: "",
  channelTitle: "Search on YouTube",
  description: `Search for "${q}" on YouTube`,
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ytSearch(q: string): Promise<YouTubeVideo | null> {
  // Check cache first
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
    // return null
  }
  return null;
}

async function searchWithRetry(q: string): Promise<YouTubeVideo> {
  // Try original query
  let video = await ytSearch(q);
  if (video) return video;

  // Wait and try simplified query
  await delay(2000);
  const simpler = q.split(/\s+/).slice(0, 3).join(" ") + " tutorial";
  video = await ytSearch(simpler);
  if (video) {
    videoCache.set(q.toLowerCase(), video);
    return video;
  }

  return EMPTY_VIDEO(q);
}

// Single query (GET)
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (isBlockedQuery(query)) {
    return NextResponse.json({ error: BLOCKED_MESSAGE }, { status: 403 });
  }

  const video = await searchWithRetry(query);
  return NextResponse.json({
    videos: [video],
  });
}

// Batch queries (POST) - searches all queries with delays to avoid 429
export async function POST(request: NextRequest) {
  const body = await request.json();
  const queries: string[] = body.queries || [];

  if (!queries.length) {
    return NextResponse.json({ error: "Missing queries" }, { status: 400 });
  }

  // Filter out any blocked queries
  const safeQueries = queries.filter((q) => !isBlockedQuery(q));
  if (!safeQueries.length) {
    return NextResponse.json({ error: BLOCKED_MESSAGE }, { status: 403 });
  }

  const results: Record<string, YouTubeVideo> = {};

  // Separate cached vs uncached queries
  const uncached: string[] = [];
  for (const q of safeQueries) {
    const cached = videoCache.get(q.toLowerCase());
    if (cached) {
      results[q] = cached;
    } else {
      uncached.push(q);
    }
  }

  // Fetch uncached queries in small batches with delays
  for (let i = 0; i < uncached.length; i++) {
    const q = uncached[i];

    // Pace requests: 3s between each to stay under YouTube's rate limit
    if (i > 0) {
      await delay(3000);
    }

    const video = await searchWithRetry(q);
    results[q] = video;
  }

  return NextResponse.json({ results });
}
