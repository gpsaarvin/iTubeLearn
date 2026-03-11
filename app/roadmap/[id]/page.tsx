"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  getRoadmap,
  SavedRoadmap,
  addToLearning,
  removeFromLearning,
  updateRoadmapPhases,
  PhaseWithVideos,
} from "@/lib/firestore";
import { generateRoadmap } from "@/lib/openrouter";
import { searchYouTubeVideos } from "@/lib/youtube";
import { useAuth } from "@/contexts/AuthContext";
import RoadmapView from "@/components/RoadmapView";

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, refreshLearningList } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedRoadmap, setSavedRoadmap] = useState<SavedRoadmap | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRoadmap = useCallback(async () => {
    try {
      const rm = await getRoadmap(id);
      if (rm) {
        setSavedRoadmap(rm);
      } else {
        setError("Roadmap not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const handleRefresh = async () => {
    if (!savedRoadmap) return;
    setIsRefreshing(true);

    try {
      const newRoadmap = await generateRoadmap(savedRoadmap.topic);
      const phasesWithVideos: PhaseWithVideos[] = await Promise.all(
        newRoadmap.phases.map(async (phase) => {
          const topicsWithVideos = await Promise.all(
            phase.topics.map(async (t) => {
              try {
                const videos = await searchYouTubeVideos(t.searchQuery, 1);
                return { ...t, video: videos[0] || undefined };
              } catch {
                return { ...t, video: undefined };
              }
            })
          );
          return { title: phase.title, topics: topicsWithVideos };
        })
      );

      await updateRoadmapPhases(savedRoadmap.id, phasesWithVideos);
      setSavedRoadmap({
        ...savedRoadmap,
        title: newRoadmap.title,
        phases: phasesWithVideos,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh roadmap"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddToLearning = async () => {
    if (savedRoadmap) {
      await addToLearning(savedRoadmap.id);
      setSavedRoadmap({ ...savedRoadmap, addedToLearning: true });
      await refreshLearningList();
    }
  };

  const handleRemoveFromLearning = async () => {
    if (savedRoadmap) {
      await removeFromLearning(savedRoadmap.id);
      setSavedRoadmap({ ...savedRoadmap, addedToLearning: false });
      await refreshLearningList();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <p className="text-lg" style={{ color: "var(--text-primary)" }}>Loading roadmap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 rounded-full font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: "var(--accent)", color: "var(--bg-primary)" }}
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!savedRoadmap) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p style={{ color: "var(--text-muted)" }}>Roadmap not found</p>
      </div>
    );
  }

  return (
    <RoadmapView
      title={savedRoadmap.title}
      phases={savedRoadmap.phases}
      isAddedToLearning={savedRoadmap.addedToLearning}
      onAddToLearning={handleAddToLearning}
      onRemoveFromLearning={handleRemoveFromLearning}
      onRefreshRoadmap={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
}
