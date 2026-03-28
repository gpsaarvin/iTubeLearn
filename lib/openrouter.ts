import { BLOCKED_MESSAGE, isBlockedQuery } from "@/lib/content-filter";

export interface RoadmapPhase {
  title: string;
  topics: {
    title: string;
    description: string;
    searchQuery: string;
  }[];
}

export interface Roadmap {
  title: string;
  phases: RoadmapPhase[];
}

export async function generateRoadmap(topic: string, language?: string | null): Promise<Roadmap> {
  if (isBlockedQuery(topic)) {
    throw new Error(BLOCKED_MESSAGE);
  }

  const langInstruction = language
    ? `\n\nIMPORTANT: The user wants tutorials in ${language}. Every searchQuery MUST include "in ${language}" at the end so that YouTube results are in ${language}. For example: "best Python basics tutorial in ${language}".`
    : "";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `You are an expert course curriculum designer. When given a topic, generate a structured learning roadmap with phases. Each phase should have a title and a list of topics. Each topic should have a title, a short description, and a YouTube search query that would find the best tutorial video for that topic.

IMPORTANT: Respond ONLY with valid JSON in this exact format, no markdown, no code blocks, no extra text:
{
  "title": "Learning [Topic] - Complete Roadmap",
  "phases": [
    {
      "title": "Phase 1: Fundamentals (Month 1)",
      "topics": [
        {
          "title": "Topic Name",
          "description": "Brief description of what to learn",
          "searchQuery": "best tutorial for [specific topic] for beginners 2024"
        }
      ]
    }
  ]
}

Generate 3-5 phases with 3-5 topics each. Make search queries specific enough to find high-quality YouTube tutorials.${langInstruction}`,
        },
        {
          role: "user",
          content: `Generate a comprehensive learning roadmap for: ${topic}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in AI response");
  }

  // Try to parse JSON from the response, handling potential markdown code blocks
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const roadmap: Roadmap = JSON.parse(jsonStr);
  return roadmap;
}
