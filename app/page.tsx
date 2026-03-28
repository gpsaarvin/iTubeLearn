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
  {
    topic: "Node.js Backend",
    keyword: "Node.js Backend Development",
    thumbnail: "https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg",
    description: "Build scalable backend APIs with Node.js",
  },
  {
    topic: "TypeScript Mastery",
    keyword: "TypeScript Programming",
    thumbnail: "https://i.ytimg.com/vi/30LWjhZzg50/hqdefault.jpg",
    description: "Type-safe JavaScript for modern apps",
  },
  {
    topic: "Cybersecurity Basics",
    keyword: "Cybersecurity Fundamentals",
    thumbnail: "https://i.ytimg.com/vi/inWWhr5tnEA/hqdefault.jpg",
    description: "Learn core security practices and tools",
  },
  {
    topic: "Cloud Computing",
    keyword: "Cloud Computing Roadmap",
    thumbnail: "https://i.ytimg.com/vi/2LaAJq1lB1Q/hqdefault.jpg",
    description: "Understand AWS, Azure, and GCP basics",
  },
  {
    topic: "System Design",
    keyword: "System Design Interview",
    thumbnail: "https://i.ytimg.com/vi/bUHFg8CZFws/hqdefault.jpg",
    description: "Design scalable distributed systems",
  },
  {
    topic: "SQL and Databases",
    keyword: "SQL and Database Design",
    thumbnail: "https://i.ytimg.com/vi/HXV3zeQKqGY/hqdefault.jpg",
    description: "Master SQL queries and schema design",
  },
  {
    topic: "Mobile App Development",
    keyword: "Mobile App Development",
    thumbnail: "https://i.ytimg.com/vi/0-S5a0eXPoc/hqdefault.jpg",
    description: "Build Android and iOS apps",
  },
  {
    topic: "UI/UX Design",
    keyword: "UI UX Design",
    thumbnail: "https://i.ytimg.com/vi/c9Wg6Cb_YlU/hqdefault.jpg",
    description: "Design intuitive and modern interfaces",
  },
  {
    topic: "Git and GitHub",
    keyword: "Git and GitHub",
    thumbnail: "https://i.ytimg.com/vi/RGOj5yH7evk/hqdefault.jpg",
    description: "Version control essentials for developers",
  },
  {
    topic: "Data Structures & Algorithms",
    keyword: "Data Structures and Algorithms",
    thumbnail: "https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg",
    description: "Strengthen your coding interview skills",
  },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const displayName = user?.displayName?.trim();
  const firstName = displayName ? displayName.split(" ")[0] : null;
  const welcomeName = firstName || "Learner";

  const handleRoadmapClick = (keyword: string) => {
    router.push(`/roadmap/generate?topic=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Welcome back, {welcomeName}
      </h2>

      <p className="text-sm sm:text-base mb-4 sm:mb-6" style={{ color: "var(--text-secondary)" }}>
        Continue learning with fresh picks for you.
      </p>

      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: "var(--text-primary)" }}>
        Recommended Roadmaps:
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
