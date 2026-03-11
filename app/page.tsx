"use client";

import { useRouter } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { useAuth } from "@/contexts/AuthContext";

const RECOMMENDED_ROADMAPS = [
  {
    topic: "AI/ML Roadmap",
    keyword: "AI and Machine Learning",
    thumbnail: "https://i.ytimg.com/vi/hhGPiDrUe1c/hqdefault.jpg",
    description: "Complete AI & Machine Learning path",
  },
  {
    topic: "Blockchain Developer",
    keyword: "Blockchain Development",
    thumbnail: "https://i.ytimg.com/vi/gyMwXuJrbJQ/hqdefault.jpg",
    description: "Become a Blockchain developer",
  },
  {
    topic: "Python Roadmap",
    keyword: "Python Programming",
    thumbnail: "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg",
    description: "Learn Python from scratch to advanced",
  },
  {
    topic: "Java Roadmap",
    keyword: "Java Programming",
    thumbnail: "https://i.ytimg.com/vi/eIrMbAQSU34/hqdefault.jpg",
    description: "Complete Java developer roadmap",
  },
  {
    topic: "Web Development",
    keyword: "Full Stack Web Development",
    thumbnail: "https://i.ytimg.com/vi/nu_pCVPKzTk/hqdefault.jpg",
    description: "Full Stack Web Development path",
  },
  {
    topic: "Data Science",
    keyword: "Data Science",
    thumbnail: "https://i.ytimg.com/vi/ua-CiDNNj30/hqdefault.jpg",
    description: "Data Science complete roadmap",
  },
  {
    topic: "React Development",
    keyword: "React.js Development",
    thumbnail: "https://i.ytimg.com/vi/Ke90Tje7VS0/hqdefault.jpg",
    description: "Master React.js from basics to advanced",
  },
  {
    topic: "DevOps Roadmap",
    keyword: "DevOps Engineering",
    thumbnail: "https://i.ytimg.com/vi/0yWAtQ6wYNM/hqdefault.jpg",
    description: "Complete DevOps engineering path",
  },
  {
    topic: "C/C++ Roadmap",
    keyword: "C and C++ Programming",
    thumbnail: "https://i.ytimg.com/vi/vLnPwxZdW4Y/hqdefault.jpg",
    description: "Learn C/C++ programming from scratch",
  },
  {
    topic: "GenAI Roadmap",
    keyword: "Generative AI Development",
    thumbnail: "https://i.ytimg.com/vi/mEsleV16qdo/hqdefault.jpg",
    description: "Generative AI & LLMs development path",
  },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const handleRoadmapClick = (keyword: string) => {
    router.push(`/roadmap/generate?topic=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
        Recommended Roadmaps:
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {RECOMMENDED_ROADMAPS.map((roadmap, index) => (
          <VideoCard
            key={index}
            title={roadmap.topic}
            thumbnail={roadmap.thumbnail}
            channelTitle={roadmap.description}
            onClick={() => handleRoadmapClick(roadmap.keyword)}
          />
        ))}
      </div>

      {!user && (
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to save your roadmaps and track your learning progress
          </p>
        </div>
      )}
    </div>
  );
}
