"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateRoadmap, Roadmap } from "@/lib/openrouter";
import { streamSearchYouTubeVideos, YouTubeVideo } from "@/lib/youtube";
import { detectLanguage } from "@/lib/language-detect";
import { PhaseWithVideos, saveRoadmap, addToLearning, getUserRoadmaps, updateRoadmapPhases } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import RoadmapView from "@/components/RoadmapView";
import { isBlockedQuery } from "@/lib/content-filter";

export default function GenerateRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const params = use(searchParams);
  const topic = params.topic || "";
  const router = useRouter();
  const { user, refreshLearningList } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [phases, setPhases] = useState<PhaseWithVideos[]>([]);
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [isAddedToLearning, setIsAddedToLearning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Generating your roadmap...");
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosLoadedCount, setVideosLoadedCount] = useState(0);
  const [videosTotalCount, setVideosTotalCount] = useState(0);

  const hasCheckedExisting = useRef(false);
  const phasesRef = useRef<PhaseWithVideos[]>([]);
  const roadmapIdRef = useRef<string | null>(null);

  const generateAndFetchVideos = useCallback(async () => {
    if (!topic) {
      router.push("/");
      return;
    }

    if (isBlockedQuery(topic)) {
      setError("This topic contains restricted content. Please search for educational or programming topics.");
      setLoading(false);
      return;
    }

    // Check if user already has a roadmap for this topic
    if (user && !hasCheckedExisting.current) {
      hasCheckedExisting.current = true;
      try {
        const existing = await getUserRoadmaps(user.uid);
        const match = existing.find(
          (rm) => rm.topic.toLowerCase() === topic.toLowerCase()
        );
        if (match) {
          router.replace(`/roadmap/${match.id}`);
          return;
        }
      } catch {
        // Continue to generate if check fails
      }
    }

    setLoading(true);
    setError(null);
    setLoadingMessage("Generating your roadmap with AI...");

    // Detect language from the topic (e.g., "python in tamil" → language: "Tamil", cleanTopic: "python")
    const { cleanTopic, language } = detectLanguage(topic);

    try {
      const generatedRoadmap = await generateRoadmap(cleanTopic, language);
      setRoadmap(generatedRoadmap);

      // Create phases immediately with empty videos (show roadmap right away)
      const initialPhases: PhaseWithVideos[] = generatedRoadmap.phases.map(
        (phase) => ({
          title: phase.title,
          topics: phase.topics.map((t) => ({
            ...t,
            video: undefined,
          })),
        })
      );

      setPhases(initialPhases);
      phasesRef.current = initialPhases;
      setLoading(false); // Show roadmap immediately!

      // Save to Firestore immediately (without videos)
      let savedId: string | null = null;
      if (user) {
        savedId = await saveRoadmap(user.uid, topic, generatedRoadmap, initialPhases);
        setRoadmapId(savedId);
        roadmapIdRef.current = savedId;
      }

      // Now progressively load videos in the background
      const allQueries = generatedRoadmap.phases.flatMap((phase) =>
        phase.topics.map((t) => t.searchQuery)
      );
      setVideosTotalCount(allQueries.length);
      setVideosLoading(true);
      setVideosLoadedCount(0);

      // Build a map of searchQuery → phase/topic indices for fast updates
      const queryMap = new Map<string, { phaseIdx: number; topicIdx: number }>();
      generatedRoadmap.phases.forEach((phase, pi) => {
        phase.topics.forEach((t, ti) => {
          queryMap.set(t.searchQuery, { phaseIdx: pi, topicIdx: ti });
        });
      });

      await streamSearchYouTubeVideos(
        allQueries,
        (query: string, video: YouTubeVideo) => {
          const loc = queryMap.get(query);
          if (!loc) return;

          // Update phases immutably
          setPhases((prev) => {
            const updated = prev.map((phase, pi) => {
              if (pi !== loc.phaseIdx) return phase;
              return {
                ...phase,
                topics: phase.topics.map((t, ti) => {
                  if (ti !== loc.topicIdx) return t;
                  return { ...t, video };
                }),
              };
            });
            phasesRef.current = updated;
            return updated;
          });
        },
        (loaded: number, total: number) => {
          setVideosLoadedCount(loaded);
          setVideosTotalCount(total);
        },
        language
      );

      setVideosLoading(false);

      // Save final phases with all videos to Firestore
      const currentId = roadmapIdRef.current;
      if (currentId && user) {
        await updateRoadmapPhases(currentId, phasesRef.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate roadmap");
      setLoading(false);
    }
  }, [topic, user, router]);

  useEffect(() => {
    generateAndFetchVideos();
  }, [generateAndFetchVideos]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hasCheckedExisting.current = true; // Skip duplicate check on refresh
    await generateAndFetchVideos();
    setIsRefreshing(false);
  };

  const handleAddToLearning = async () => {
    if (roadmapId && user) {
      await addToLearning(roadmapId);
      setIsAddedToLearning(true);
      await refreshLearningList();
    }
  };

  const handleRemoveFromLearning = async () => {
    if (roadmapId) {
      const { removeFromLearning } = await import("@/lib/firestore");
      await removeFromLearning(roadmapId);
      setIsAddedToLearning(false);
      await refreshLearningList();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <p className="text-lg" style={{ color: "var(--text-primary)" }}>{loadingMessage}</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Generating roadmap for: <strong style={{ color: "var(--text-primary)" }}>{topic}</strong>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <p className="text-red-400 text-lg">Error: {error}</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-2 rounded-full font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg-primary)" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!roadmap || phases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p style={{ color: "var(--text-muted)" }}>No roadmap generated</p>
      </div>
    );
  }

  return (
    <RoadmapView
      title={roadmap.title}
      phases={phases}
      isAddedToLearning={isAddedToLearning}
      onAddToLearning={handleAddToLearning}
      onRemoveFromLearning={handleRemoveFromLearning}
      onRefreshRoadmap={handleRefresh}
      isRefreshing={isRefreshing}
      videosLoading={videosLoading}
      videosLoadedCount={videosLoadedCount}
      videosTotalCount={videosTotalCount}
      roadmapId={roadmapId || undefined}
    />
  );
}
