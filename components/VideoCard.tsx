"use client";

import Image from "next/image";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  channelTitle?: string;
  description?: string;
  onClick?: () => void;
}

export default function VideoCard({
  title,
  thumbnail,
  channelTitle,
  description,
  onClick,
}: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div
        className="relative aspect-video rounded-xl overflow-hidden"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
            <span className="text-white/60 text-sm text-center px-4">{title}</span>
          </div>
        )}
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-sm font-medium line-clamp-2 leading-5" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {channelTitle && (
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{channelTitle}</p>
        )}
        {description && (
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{description}</p>
        )}
      </div>
    </div>
  );
}
