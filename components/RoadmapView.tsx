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
    if (activeVideo?.videoId) return; // Already have a video selected
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
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex items-start justify-between">
              <h2 className="text-white text-lg font-medium flex-1">
                {activeVideo.title}
              </h2>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 flex items-center gap-1 px-3 py-1.5 bg-[#272727] rounded-full text-white text-xs hover:bg-[#393939] transition-colors whitespace-nowrap"
              >
                <FiExternalLink /> Watch on YouTube
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl bg-[#1a1a1a] flex items-center justify-center">
            <p className="text-[#888] text-lg">
              Select a topic to watch the video
            </p>
          </div>
        )}
      </div>

      {/* Roadmap Sidebar */}
      <div className="lg:w-[420px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-bold">{title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={isAddedToLearning ? onRemoveFromLearning : onAddToLearning}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                isAddedToLearning
                  ? "bg-[#3ea6ff]/20 text-[#3ea6ff]"
                  : "bg-[#272727] text-white hover:bg-[#393939]"
              }`}
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#272727] rounded-full text-white text-sm hover:bg-[#393939] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FiRefreshCw className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Video Loading Progress Bar */}
        {videosLoading && videosTotalCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-[#aaa] mb-1.5">
              <span>Loading tutorials...</span>
              <span>{videosLoadedCount} / {videosTotalCount}</span>
            </div>
            <div className="w-full h-1.5 bg-[#272727] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3ea6ff] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(videosLoadedCount / videosTotalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Phases */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-200px)]">
          {phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="bg-[#1a1a1a] rounded-xl overflow-hidden">
              <button
                onClick={() => togglePhase(phaseIndex)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#222] transition-colors cursor-pointer"
              >
                <h3 className="text-white text-sm font-semibold text-left">
                  {phase.title}
                </h3>
                {expandedPhases[phaseIndex] ? (
                  <FiChevronUp className="text-white" />
                ) : (
                  <FiChevronDown className="text-white" />
                )}
              </button>

              {expandedPhases[phaseIndex] && (
                <div className="px-2 pb-2">
                  {phase.topics.map((topic, topicIndex) => {
                    const hasVideo = !!topic.video?.videoId;
                    const isStillLoading = videosLoading && !topic.video;

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
                          } ${
                            activeVideo?.videoId === topic.video?.videoId && hasVideo
                              ? "bg-[#272727]"
                              : hasVideo
                              ? "hover:bg-[#222]"
                              : ""
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-[120px] min-w-[120px] aspect-video rounded-lg overflow-hidden bg-[#272727] relative flex-shrink-0">
                            {topic.video?.thumbnail ? (
                              <img
                                src={topic.video.thumbnail}
                                alt={topic.title}
                                className="w-full h-full object-cover"
                              />
                            ) : isStillLoading ? (
                              <div className="w-full h-full animate-pulse bg-gradient-to-r from-[#272727] via-[#333] to-[#272727] bg-[length:200%_100%] animate-shimmer" />
                            ) : (
                              <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.searchQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-full flex flex-col items-center justify-center text-[#666] text-xs hover:text-[#3ea6ff] transition-colors gap-1"
                              >
                                <FiSearch className="text-base" />
                                <span>Search YouTube</span>
                              </a>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-xs font-medium line-clamp-2">
                              {topic.video?.title || topic.title}
                            </h4>
                            {isStillLoading ? (
                              <div className="mt-1 space-y-1">
                                <div className="h-2.5 w-24 bg-[#333] rounded animate-pulse" />
                                <div className="h-2.5 w-16 bg-[#333] rounded animate-pulse" />
                              </div>
                            ) : (
                              <>
                                <p className="text-[#aaa] text-[11px] mt-0.5">
                                  {topic.video?.channelTitle || ""}
                                </p>
                                <p className="text-[#666] text-[11px] mt-0.5 line-clamp-1">
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
