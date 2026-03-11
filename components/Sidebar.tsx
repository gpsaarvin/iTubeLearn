"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { GoHome, GoHomeFill } from "react-icons/go";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const { user, learningList } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-14 left-0 bottom-0 transition-all duration-200 z-40 overflow-y-auto ${
        isOpen ? "w-60" : "w-[72px]"
      }`}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="py-3">
        {/* Home */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center w-full px-3 py-2 rounded-lg mx-1 transition-colors cursor-pointer"
          style={{
            width: "calc(100% - 8px)",
            backgroundColor: pathname === "/" ? "var(--bg-hover)" : "transparent",
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => { if (pathname !== "/") e.currentTarget.style.backgroundColor = "var(--bg-hover)"; }}
          onMouseLeave={(e) => { if (pathname !== "/") e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div className="w-6 flex justify-center">
            {pathname === "/" ? (
              <GoHomeFill className="text-xl" />
            ) : (
              <GoHome className="text-xl" />
            )}
          </div>
          {isOpen && (
            <span className="ml-6 text-sm whitespace-nowrap">Home</span>
          )}
        </button>

        {/* Learning List - only show when user is logged in */}
        {user && isOpen && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
            <h3 className="px-4 mb-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Continue learning &gt;
            </h3>
            {learningList.length === 0 ? (
              <p className="px-4 text-xs" style={{ color: "var(--text-dim)" }}>No roadmaps added yet</p>
            ) : (
              learningList.map((rm) => (
                <button
                  key={rm.id}
                  onClick={() => router.push(`/roadmap/${rm.id}`)}
                  className="flex items-center w-full px-4 py-2 text-left transition-colors cursor-pointer"
                  style={{
                    backgroundColor: pathname === `/roadmap/${rm.id}` ? "var(--bg-hover)" : "transparent",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                  onMouseLeave={(e) => {
                    if (pathname !== `/roadmap/${rm.id}`) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span className="text-sm truncate font-medium">
                    {rm.topic} Roadmap
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* When sidebar is collapsed, show learning items as icons */}
        {user && !isOpen && learningList.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
            {learningList.map((rm) => (
              <button
                key={rm.id}
                onClick={() => router.push(`/roadmap/${rm.id}`)}
                className="flex items-center justify-center w-full py-3 transition-colors cursor-pointer"
                title={rm.topic}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: "var(--bg-hover)" }}
                >
                  {rm.topic[0]?.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
