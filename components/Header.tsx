"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { FiSearch, FiMenu, FiSun, FiMoon, FiX, FiBookOpen, FiSettings, FiTrash2, FiChevronLeft, FiZap } from "react-icons/fi";
import { isBlockedQuery } from "@/lib/content-filter";
import { removeFromLearning } from "@/lib/firestore";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signInWithGoogle, logout, learningList, refreshLearningList, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeProfilePanel, setActiveProfilePanel] = useState<"menu" | "courses" | "settings">("menu");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [settingsName, setSettingsName] = useState("");
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const router = useRouter();

  const [blockedWarning, setBlockedWarning] = useState(false);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [user?.photoURL]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    if (isBlockedQuery(query)) {
      setBlockedWarning(true);
      setTimeout(() => setBlockedWarning(false), 4500);
      return;
    }
    router.push(`/roadmap/generate?topic=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setMobileSearchOpen(false);
  };

  const openPanel = (panel: "menu" | "courses" | "settings") => {
    setActiveProfilePanel(panel);
    setShowUserMenu(true);
    if (panel === "settings") {
      setSettingsName(user?.displayName || "");
      setSettingsMessage(null);
    }
  };

  const handleRemoveCourse = async (roadmapId: string) => {
    await removeFromLearning(roadmapId);
    await refreshLearningList();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    const nextName = settingsName.trim();
    if (!nextName) {
      setSettingsMessage("Name is required.");
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateUserProfile(nextName);
      setSettingsMessage("Profile updated successfully.");
    } catch {
      setSettingsMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
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
              placeholder="Enter a topic to generate courses..."
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
          {blockedWarning && (
            <div className="fixed top-16 left-2 right-2 bg-red-600 text-white text-sm px-3 py-2 rounded-lg text-center z-70 md:hidden">
              This search contains restricted content. Please search for educational topics.
            </div>
          )}
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
      <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-160 mx-4 lg:mx-8">
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

      {/* Right: Mobile generate button + Theme Toggle + User */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* Mobile generate courses button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full border transition-colors cursor-pointer"
          style={{
            color: "var(--accent)",
            borderColor: "var(--accent)",
            backgroundColor: "var(--accent-bg)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-bg)")}
          title="Generate Courses"
        >
          <FiZap className="text-base animate-generate-courses-glow" />
          <span className="text-xs font-semibold tracking-wide">Generate</span>
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
                onClick={() => {
                  if (showUserMenu) {
                    setShowUserMenu(false);
                    setActiveProfilePanel("menu");
                    return;
                  }
                  openPanel("menu");
                }}
                className="cursor-pointer"
              >
                {user.photoURL && !avatarLoadError ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                    onError={() => setAvatarLoadError(true)}
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
                  className="absolute right-0 top-10 rounded-xl shadow-lg py-2 min-w-70 max-w-80"
                  style={{
                    backgroundColor: "var(--user-menu-bg)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  {activeProfilePanel !== "menu" && (
                    <button
                      onClick={() => setActiveProfilePanel("menu")}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <FiChevronLeft /> Back
                    </button>
                  )}

                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user.displayName}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user.email}</p>
                  </div>

                  {activeProfilePanel === "menu" && (
                    <>
                      <button
                        onClick={() => openPanel("courses")}
                        className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer flex items-center gap-2"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <FiBookOpen /> My courses
                      </button>
                      <button
                        onClick={() => openPanel("settings")}
                        className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer flex items-center gap-2"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <FiSettings /> Settings
                      </button>
                    </>
                  )}

                  {activeProfilePanel === "courses" && (
                    <div className="px-2 py-2">
                      <p className="px-2 mb-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        Manage the courses you registered.
                      </p>
                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {learningList.length === 0 ? (
                          <p className="px-2 py-2 text-xs" style={{ color: "var(--text-dim)" }}>
                            No courses added yet.
                          </p>
                        ) : (
                          learningList.map((course) => (
                            <div
                              key={course.id}
                              className="px-2 py-2 rounded-lg"
                              style={{ backgroundColor: "var(--bg-secondary)" }}
                            >
                              <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                {course.topic}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    router.push(`/roadmap/${course.id}`);
                                    setShowUserMenu(false);
                                    setActiveProfilePanel("menu");
                                  }}
                                  className="px-2 py-1 rounded-md text-xs transition-colors cursor-pointer"
                                  style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-primary)" }}
                                >
                                  Open
                                </button>
                                <button
                                  onClick={() => handleRemoveCourse(course.id)}
                                  className="px-2 py-1 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1"
                                  style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
                                >
                                  <FiTrash2 /> Remove
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeProfilePanel === "settings" && (
                    <form onSubmit={handleSaveProfile} className="px-4 py-3 space-y-3">
                      <div>
                        <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={settingsName}
                          onChange={(e) => setSettingsName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{
                            backgroundColor: "var(--bg-input)",
                            border: "1px solid var(--border-input)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="Your name"
                        />
                      </div>
                      {settingsMessage && (
                        <p className="text-xs" style={{ color: settingsMessage.includes("success") ? "#15803d" : "#dc2626" }}>
                          {settingsMessage}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 cursor-pointer"
                        style={{ backgroundColor: "var(--accent)", color: "var(--bg-primary)" }}
                      >
                        {isSavingProfile ? "Saving..." : "Save changes"}
                      </button>
                    </form>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      setActiveProfilePanel("menu");
                    }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer"
                    style={{ color: "var(--text-primary)", borderTop: "1px solid var(--border-primary)" }}
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
