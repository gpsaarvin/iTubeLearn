"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { FiSearch, FiMenu, FiSun, FiMoon, FiX } from "react-icons/fi";
import { isBlockedQuery } from "@/lib/content-filter";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signInWithGoogle, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
    setMobileSearchOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-2 sm:px-4"
      style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-primary)" }}
    >
      {/* Mobile search expanded overlay */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 flex items-center px-2 z-50 md:hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 rounded-full shrink-0 cursor-pointer"
            style={{ color: "var(--text-primary)" }}
          >
            <FiX className="text-xl" />
          </button>
          <form onSubmit={handleSearch} className="flex flex-1 items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search to generate roadmap..."
              className="w-full px-3 py-2 rounded-l-full text-sm focus:outline-none"
              autoFocus
              style={{
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-input)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-r-full cursor-pointer shrink-0"
              style={{
                backgroundColor: "var(--bg-button)",
                borderTop: "1px solid var(--border-input)",
                borderRight: "1px solid var(--border-input)",
                borderBottom: "1px solid var(--border-input)",
                borderLeft: "none",
                color: "var(--text-primary)",
              }}
            >
              <FiSearch className="text-xl" />
            </button>
          </form>
        </div>
      )}

      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full transition-colors cursor-pointer"
          style={{ color: "var(--text-primary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <FiMenu className="text-xl" />
        </button>
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image src="/logo.svg" alt="iTube" width={90} height={32} className="h-15 w-auto" />
        </div>
      </div>

      {/* Center: Search (hidden on mobile, replaced by icon) */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-[640px] mx-4 lg:mx-8">
        <div className="flex flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search to generate roadmap..."
            className="w-full px-4 py-2 rounded-l-full text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-input)",
              color: "var(--text-primary)",
            }}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-r-full transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--bg-button)",
              borderTop: "1px solid var(--border-input)",
              borderRight: "1px solid var(--border-input)",
              borderBottom: "1px solid var(--border-input)",
              borderLeft: "none",
              color: "var(--text-primary)",
            }}
          >
            <FiSearch className="text-xl" />
          </button>
        </div>
        {blockedWarning && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-red-600 text-white text-sm px-4 py-2 rounded-lg text-center z-50">
            This search contains restricted content. Please search for educational topics.
          </div>
        )}
      </form>

      {/* Right: Mobile search icon + Theme Toggle + User */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* Mobile search button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="p-2 rounded-full transition-colors cursor-pointer md:hidden"
          style={{ color: "var(--text-primary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <FiSearch className="text-xl" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={(e) => toggleTheme(e)}
          className="p-2 rounded-full transition-colors cursor-pointer relative overflow-hidden"
          style={{ color: "var(--text-primary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="relative w-5 h-5">
            <FiSun
              className="absolute inset-0 text-xl"
              style={{
                opacity: theme === "light" ? 1 : 0,
              }}
            />
            <FiMoon
              className="absolute inset-0 text-xl"
              style={{
                opacity: theme === "dark" ? 1 : 0,
              }}
            />
          </div>
        </button>

        {/* User */}
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
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: "var(--purple)" }}
                  >
                    {user.displayName?.[0] || user.email?.[0] || "U"}
                  </div>
                )}
              </button>
              {showUserMenu && (
                <div
                  className="absolute right-0 top-10 rounded-xl shadow-lg py-2 min-w-[200px]"
                  style={{
                    backgroundColor: "var(--user-menu-bg)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.displayName}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full transition-colors text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap"
              style={{
                border: "1px solid var(--border-input)",
                color: "var(--accent)",
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
