"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  MdDashboard, 
  MdCo2, 
  MdPeople, 
  MdGavel, 
  MdEmojiEvents, 
  MdAnalytics, 
  MdPsychology, 
  MdLogout,
  MdMenu,
  MdClose,
  MdSettings
} from "react-icons/md";
import Lenis from "lenis";
import { gsap } from "gsap";
import Image from "next/image";
import EulerLogo from "@/assets/Euler-Img.svg";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if user session doesn't exist
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Stagger reveal of the main dashboard wrapper on route changes
    gsap.fromTo(".page-content-wrapper", 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [pathname]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse">Verifying session...</div>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { name: "Overview", path: "/dashboard/overview", icon: <MdDashboard size={20} /> },
    { name: "Environmental", path: "/dashboard/environmental", icon: <MdCo2 size={22} /> },
    { name: "Social & CSR", path: "/dashboard/social", icon: <MdPeople size={20} /> },
    { name: "Governance", path: "/dashboard/governance", icon: <MdGavel size={20} /> },
    { name: "Gamification", path: "/dashboard/gamification", icon: <MdEmojiEvents size={20} /> },
    { name: "Reports Builder", path: "/dashboard/reports", icon: <MdAnalytics size={20} /> },
    { name: "AI ESG Advisor", path: "/dashboard/ai-assistant", icon: <MdPsychology size={20} /> },
    { name: "Settings & Admin", path: "/dashboard/settings", icon: <MdSettings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "EM";
  };

  return (
    <div className="flex min-h-screen bg-[#090b11] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background gradients */}
      <div className="fixed top-0 left-0 -z-10 h-full w-full bg-[#090b11]">
        <div className="absolute top-0 right-0 h-[40%] w-[50%] rounded-full bg-emerald-950/10 blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 h-[45%] w-[45%] rounded-full bg-indigo-950/10 blur-[150px]"></div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl md:flex md:flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <Image 
            src={EulerLogo} 
            alt="EcoMerge Logo" 
            className="w-8 h-8 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
          />
          <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            EcoMerge AI
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500/15 to-indigo-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 text-xs font-semibold text-white">
                {getInitials(user.email)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.email}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 py-2 text-xs font-medium text-slate-400 transition hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-400 cursor-pointer"
          >
            <MdLogout size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Top Bar */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 md:hidden bg-slate-950/80 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Image src={EulerLogo} alt="EcoMerge Logo" className="w-8 h-8" />
            <span className="font-bold text-lg text-white">EcoMerge AI</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)}>
            <aside 
              className="absolute left-0 top-0 bottom-0 w-64 bg-[#090b11] border-r border-white/5 flex flex-col p-6 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Image src={EulerLogo} alt="EcoMerge Logo" className="w-8 h-8" />
                <span className="font-bold text-lg text-white">EcoMerge AI</span>
              </div>
              <nav className="flex-1 space-y-1.5">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 text-xs font-semibold text-white">
                    {getInitials(user.email)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{user.email}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 py-2 text-xs font-medium text-slate-400 transition hover:bg-rose-500/5 hover:text-rose-400"
                >
                  <MdLogout size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 page-content-wrapper min-h-[calc(100vh-60px)] md:min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
