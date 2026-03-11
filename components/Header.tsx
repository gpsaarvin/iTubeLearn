"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { FiSearch, FiMenu } from "react-icons/fi";
import { isBlockedQuery } from "@/lib/content-filter";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signInWithGoogle, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const [blockedWarning, setBlockedWarning] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    if (isBlockedQuery(query)) {
      setBlockedWarning(true);
      setTimeout(() => setBlockedWarning(false), 3000);
      return;
    }
    router.push(`/roadmap/generate?topic=${encodeURIComponent(query)}`);
    setSearchQuery("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-[#0f0f0f] border-b border-[#272727]">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-[#272727] rounded-full transition-colors cursor-pointer"
        >
          <FiMenu className="text-white text-xl" />
        </button>
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image src="/logo.svg" alt="iTube" width={90} height={32} className="h-15 w-auto" />
        </div>
      </div>

      {/* Center: Search */}
      <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-[640px] mx-8">
        <div className="flex flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search to generate roadmap..."
            className="w-full px-4 py-2 bg-[#121212] border border-[#303030] rounded-l-full text-white placeholder-[#888] focus:outline-none focus:border-[#1c62b9] text-sm"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#333] transition-colors cursor-pointer"
          >
            <FiSearch className="text-white text-xl" />
          </button>
        </div>
        {blockedWarning && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-red-600 text-white text-sm px-4 py-2 rounded-lg text-center z-50">
            This search contains restricted content. Please search for educational topics.
          </div>
        )}
      </form>

      {/* Right: User */}
      <div className="relative">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="cursor-pointer"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#5a2d82] flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName?.[0] || user.email?.[0] || "U"}
                </div>
              )}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-10 bg-[#282828] rounded-xl shadow-lg py-2 min-w-[200px] border border-[#393939]">
                <div className="px-4 py-3 border-b border-[#393939]">
                  <p className="text-white text-sm font-medium">{user.displayName}</p>
                  <p className="text-[#aaa] text-xs">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#393939] transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 py-1.5 border border-[#3e3e3e] rounded-full text-[#3ea6ff] hover:bg-[#263850] transition-colors text-sm font-medium cursor-pointer"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
