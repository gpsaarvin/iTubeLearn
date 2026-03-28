"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
      <main
        className={`pt-14 transition-all duration-200 ${
          isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-18"
        }`}
      >
        {children}
        <footer
          className="mt-10 px-4 sm:px-6 py-6 border-t"
          style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <Link
              href="/privacy-policy"
              className="underline-offset-4 hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              Privacy Policy
            </Link>
            <p>
              Contact: <a href="mailto:itubelearn.me@gmail.com" className="underline-offset-4 hover:underline" style={{ color: "var(--text-primary)" }}>itubelearn.me@gmail.com</a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
