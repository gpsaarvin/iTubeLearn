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
      className={`fixed top-14 left-0 bottom-0 bg-[#0f0f0f] transition-all duration-200 z-40 overflow-y-auto ${
        isOpen ? "w-60" : "w-[72px]"
      }`}
    >
      <div className="py-3">
        {/* Home */}
        <button
          onClick={() => router.push("/")}
          className={`flex items-center w-full px-3 py-2 hover:bg-[#272727] rounded-lg mx-1 transition-colors cursor-pointer ${
            pathname === "/"
              ? "bg-[#272727]"
              : ""
          }`}
          style={{ width: isOpen ? "calc(100% - 8px)" : "calc(100% - 8px)" }}
        >
          <div className="w-6 flex justify-center">
            {pathname === "/" ? (
              <GoHomeFill className="text-white text-xl" />
            ) : (
              <GoHome className="text-white text-xl" />
            )}
          </div>
          {isOpen && (
            <span className="ml-6 text-sm text-white whitespace-nowrap">Home</span>
          )}
        </button>

        {/* Learning List - only show when user is logged in */}
        {user && isOpen && (
          <div className="mt-4 pt-4 border-t border-[#272727]">
            <h3 className="px-4 mb-2 text-sm text-[#aaa] font-medium">
              Continue learning &gt;
            </h3>
            {learningList.length === 0 ? (
              <p className="px-4 text-xs text-[#666]">No roadmaps added yet</p>
            ) : (
              learningList.map((rm) => (
                <button
                  key={rm.id}
                  onClick={() => router.push(`/roadmap/${rm.id}`)}
                  className={`flex items-center w-full px-4 py-2 hover:bg-[#272727] text-left transition-colors cursor-pointer ${
                    pathname === `/roadmap/${rm.id}` ? "bg-[#272727]" : ""
                  }`}
                >
                  <span className="text-sm text-white truncate font-medium">
                    {rm.topic} Roadmap
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* When sidebar is collapsed, show learning items as icons */}
        {user && !isOpen && learningList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#272727]">
            {learningList.map((rm) => (
              <button
                key={rm.id}
                onClick={() => router.push(`/roadmap/${rm.id}`)}
                className="flex items-center justify-center w-full py-3 hover:bg-[#272727] transition-colors cursor-pointer"
                title={rm.topic}
              >
                <div className="w-6 h-6 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white text-xs font-bold">
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
