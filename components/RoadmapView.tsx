"use client";

import { useState, useEffect } from "react";
import { PhaseWithVideos } from "@/lib/firestore";
import { FiRefreshCw, FiExternalLink, FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";
import { MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";

interface RoadmapViewProps {
  title: string;
  phases: PhaseWithVideos[];
  isAddedToLearning: boolean;
  onAddToLearning: () => void;
  onRemoveFromLearning: () => void;
  onRefreshRoadmap: () => void;
  isRefreshing: boolean;
  videosLoading?: boolean;
  videosLoadedCount?: number;
  videosTotalCount?: number;
}

export default function RoadmapView({
  title,
  phases,
  isAddedToLearning,
  onAddToLearning,
  onRemoveFromLearning,
  onRefreshRoadmap,
  isRefreshing,
  videosLoading = false,
  videosLoadedCount = 0,
  videosTotalCount = 0,
}: RoadmapViewProps) {
  const [activeVideo, setActiveVideo] = useState<{
    videoId: string;
    title: string;
  } | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>(
    phases.reduce(
      (acc, _, i) => ({ ...acc, [i]: true }),
      {} as Record<number, boolean>
    )
  );

  // Auto-select first available video when phases update (progressive loading)
  useEffect(() => {
    if (activeVideo?.videoId) return;
    for (const phase of phases) {
      for (const topic of phase.topics) {
        if (topic.video?.videoId) {
          setActiveVideo({ videoId: topic.video.videoId, title: topic.title });
          return;
        }
      }
    }
  }, [phases, activeVideo?.videoId]);

  const togglePhase = (index: number) => {
    setExpandedPhases((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Video Player */}
      <div className="flex-1">
        {activeVideo?.videoId ? (
          <div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=0&rel=0`}
                title={activeVideo.title}
                className="absolute inset-0 w-full h-full no-theme-transition"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex items-start justify-between">
              <h2 className="text-lg font-medium flex-1" style={{ color: "var(--text-primary)" }}>
                {activeVideo.title}
              </h2>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: "var(--bg-hover)",
                  color: "var(--text-primary)",
                }}
              >
                <FiExternalLink /> Watch on YouTube
              </a>
            </div>
          </div>
        ) : (
          <div
            className="w-full aspect-video rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>
              Select a topic to watch the video
            </p>
          </div>
        )}
      </div>

      {/* Roadmap Sidebar */}
      <div className="lg:w-[420px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={isAddedToLearning ? onRemoveFromLearning : onAddToLearning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: isAddedToLearning ? "var(--accent-bg)" : "var(--bg-hover)",
                color: isAddedToLearning ? "var(--accent)" : "var(--text-primary)",
              }}
            >
              {isAddedToLearning ? (
                <>
                  <MdPlaylistAddCheck className="text-lg" /> Added
                </>
              ) : (
                <>
                  <MdPlaylistAdd className="text-lg" /> Add to Learning
                </>
              )}
            </button>
            <button
              onClick={onRefreshRoadmap}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: "var(--bg-hover)",
                color: "var(--text-primary)",
              }}
            >
              <FiRefreshCw className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Video Loading Progress Bar */}
        {videosLoading && videosTotalCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
              <span>Loading tutorials...</span>
              <span>{videosLoadedCount} / {videosTotalCount}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-hover)" }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(videosLoadedCount / videosTotalCount) * 100}%`, backgroundColor: "var(--accent)" }}
              />
            </div>
          </div>
        )}

        {/* Phases */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-200px)]">
          {phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <button
                onClick={() => togglePhase(phaseIndex)}
                className="w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <h3 className="text-sm font-semibold text-left">
                  {phase.title}
                </h3>
                {expandedPhases[phaseIndex] ? (
                  <FiChevronUp />
                ) : (
                  <FiChevronDown />
                )}
              </button>

              {expandedPhases[phaseIndex] && (
                <div className="px-2 pb-2">
                  {phase.topics.map((topic, topicIndex) => {
                    const hasVideo = !!topic.video?.videoId;
                    const isStillLoading = videosLoading && !topic.video;
                    const isActive = activeVideo?.videoId === topic.video?.videoId && hasVideo;

                    return (
                      <div key={topicIndex} className="flex items-start gap-3">
                        <button
                          onClick={() => {
                            if (hasVideo) {
                              setActiveVideo({
                                videoId: topic.video!.videoId,
                                title: topic.title,
                              });
                            }
                          }}
                          className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors ${
                            hasVideo ? "cursor-pointer" : "cursor-default"
                          }`}
                          style={{
                            backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (hasVideo && !isActive) e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          {/* Thumbnail */}
                          <div
                            className="w-[120px] min-w-[120px] aspect-video rounded-lg overflow-hidden relative flex-shrink-0"
                            style={{ backgroundColor: "var(--bg-hover)" }}
                          >
                            {topic.video?.thumbnail ? (
                              <img
                                src={topic.video.thumbnail}
                                alt={topic.title}
                                className="w-full h-full object-cover"
                              />
                            ) : isStillLoading ? (
                              <div
                                className="w-full h-full animate-pulse bg-[length:200%_100%] animate-shimmer"
                                style={{
                                  backgroundImage: `linear-gradient(to right, var(--bg-hover), var(--skeleton), var(--bg-hover))`,
                                }}
                              />
                            ) : (
                              <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.searchQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-full flex flex-col items-center justify-center text-xs transition-colors gap-1"
                                style={{ color: "var(--text-dim)" }}
                              >
                                <FiSearch className="text-base" />
                                <span>Search YouTube</span>
                              </a>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium line-clamp-2" style={{ color: "var(--text-primary)" }}>
                              {topic.video?.title || topic.title}
                            </h4>
                            {isStillLoading ? (
                              <div className="mt-1 space-y-1">
                                <div className="h-2.5 w-24 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton)" }} />
                                <div className="h-2.5 w-16 rounded animate-pulse" style={{ backgroundColor: "var(--skeleton)" }} />
                              </div>
                            ) : (
                              <>
                                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                  {topic.video?.channelTitle || ""}
                                </p>
                                <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "var(--text-dim)" }}>
                                  {topic.description}
                                </p>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
