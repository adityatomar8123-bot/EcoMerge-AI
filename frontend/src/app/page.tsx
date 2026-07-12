"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import EulerLogo from "@/assets/Euler-Img.svg";
import { 
  MdCo2, 
  MdPeople, 
  MdGavel, 
  MdEmojiEvents, 
  MdArrowForward,
  MdClose,
  MdTrendingUp,
  MdCheckCircle,
  MdStar
} from "react-icons/md";

interface ESGMetricCard {
  id: string;
  title: string;
  category: string;
  score: string;
  color: string;
  bgGlow: string;
  icon: React.ReactNode;
  description: string;
  details: {
    kpi1: string;
    kpi1Val: string;
    kpi2: string;
    kpi2Val: string;
    kpi3: string;
    kpi3Val: string;
    highlight: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const cards: ESGMetricCard[] = [
    {
      id: "env",
      title: "Environmental ledger",
      category: "Carbon Accounting & Scope 1-3",
      score: "82 / 100",
      color: "text-emerald-400 border-emerald-500/20",
      bgGlow: "from-emerald-500/10 to-transparent",
      icon: <MdCo2 size={40} className="text-emerald-400" />,
      description: "Real-time carbon emissions accounting with automated telemetry conversions, emission factors config, and audit-ready tracking.",
      details: {
        kpi1: "Total Emissions",
        kpi1Val: "1,280.5 kgCO2e",
        kpi2: "Reduction Progress",
        kpi2Val: "74% of Target",
        kpi3: "Active Goals",
        kpi3Val: "3 Departments Live",
        highlight: "Automated calculations capture emissions directly from linked ERP purchases, expenses, and fleet operations."
      }
    },
    {
      id: "soc",
      title: "Social responsibility",
      category: "CSR, Inclusion & Engagement",
      score: "74 / 100",
      color: "text-indigo-400 border-indigo-500/20",
      bgGlow: "from-indigo-500/10 to-transparent",
      icon: <MdPeople size={40} className="text-indigo-400" />,
      description: "Corporate responsibility logging and volunteer tracking combined with GRI-compliant employee diversity dashboards.",
      details: {
        kpi1: "Volunteer Work",
        kpi1Val: "1,190 Hours logged",
        kpi2: "Outreach Campaigns",
        kpi2Val: "4 Live Campaigns",
        kpi3: "Inclusion Metric",
        kpi3Val: "46% Female Benchmark",
        highlight: "CSR participations support proof-of-evidence checks and feed directly into employee XP balances upon manager approval."
      }
    },
    {
      id: "gov",
      title: "Corporate governance",
      category: "Audits, Policies & Compliance",
      score: "88 / 100",
      color: "text-pink-400 border-pink-500/20",
      bgGlow: "from-pink-500/10 to-transparent",
      icon: <MdGavel size={40} className="text-pink-400" />,
      description: "Centralized policy acknowledgement registry, automated compliance audits, and overdue violation trackers.",
      details: {
        kpi1: "Active Policies",
        kpi1Val: "3 Registered v1/v2",
        kpi2: "Audit Score Avg",
        kpi2Val: "91.5 / 100 Rating",
        kpi3: "Compliance Issues",
        kpi3Val: "1 High Severity Open",
        highlight: "Violations require owner assignment and due date validation. System flags and alerts owners automatically on deadlines."
      }
    }
  ];

  const selectedClass = cards.find(c => c.id === selectedCardId);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05060b] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans">
      {/* Dynamic Aurora Ambient Background */}
      <div className="fixed top-0 left-0 -z-10 h-full w-full bg-[#05060b]">
        <div className="absolute top-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-900/10 blur-[150px] animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-950/10 blur-[180px] animate-pulse duration-[12000ms]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40%] w-[40%] rounded-full bg-pink-950/5 blur-[160px]"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image 
              src={EulerLogo} 
              alt="EcoMerge Logo" 
              className="w-10 h-10 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-spin-slow"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent tracking-wide">
              EcoSphere ESG
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => router.push("/dashboard/overview")}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] shadow-lg shadow-emerald-500/15 cursor-pointer"
              >
                <span>Launch Platform</span>
                <MdArrowForward />
              </button>
            ) : (
              <Link 
                href="/login"
                className="rounded-lg border border-white/10 bg-white/5 px-4.5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            <MdStar className="animate-spin-slow" />
            <span>Next-Gen Enterprise ESG Operations</span>
          </span>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-none">
            Integrate Sustainability into{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              ERP Workflows
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
            EcoSphere connects day-to-day purchases, logistics, and compliance audits to unified dashboards. Drive ESG accountability through automated carbon accounting and active gamification.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => router.push(user ? "/dashboard/overview" : "/login")}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-500/25 transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
            >
              Get Started Sandbox
            </button>
            <a
              href="#sandbox"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Explore Sandbox Metrics
            </a>
          </div>
        </motion.div>
      </section>

      {/* Interactive Sandbox Grid (Click to Maximize / Minimize with Framer Motion) */}
      <section id="sandbox" className="relative z-10 mx-auto max-w-7xl px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Interactive ESG Sandbox
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Click on any card to maximize it into a full-scale detailed audit view.
          </p>
        </div>

        {/* Card Grid Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <motion.div
              layoutId={`card-container-${card.id}`}
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl transition hover:border-white/20 cursor-pointer group"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Card Ambient Glow */}
              <div className={`absolute inset-0 -z-10 bg-gradient-to-tr ${card.bgGlow} opacity-30`}></div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-xl bg-white/5 p-3 group-hover:scale-110 transition duration-300">
                    {card.icon}
                  </div>
                  <span className={`text-lg font-black tracking-tight ${card.color}`}>
                    {card.score}
                  </span>
                </div>
                
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {card.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition">
                <span>View Audited Details</span>
                <MdArrowForward />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Maximize Card Detail View Overlay */}
        <AnimatePresence>
          {selectedCardId && selectedClass && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
              <motion.div
                layoutId={`card-container-${selectedCardId}`}
                className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900 p-8 shadow-2xl"
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
              >
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCardId(null);
                  }}
                  className="absolute top-5 right-5 rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <MdClose size={20} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-xl bg-white/5 p-3">
                    {selectedClass.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {selectedClass.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-0.5">
                      {selectedClass.title}
                    </h3>
                  </div>
                </div>

                {/* Score Banner */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-6 py-4 mb-6 border border-white/5">
                  <span className="text-sm font-semibold text-slate-400">Audited Module ESG Score</span>
                  <span className={`text-2xl font-black ${selectedClass.color}`}>
                    {selectedClass.score}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {selectedClass.description}
                </p>

                {/* KPI stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg bg-slate-950 p-4 border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{selectedClass.details.kpi1}</span>
                    <span className="block text-sm font-extrabold text-white mt-1">{selectedClass.details.kpi1Val}</span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-4 border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{selectedClass.details.kpi2}</span>
                    <span className="block text-sm font-extrabold text-white mt-1">{selectedClass.details.kpi2Val}</span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-4 border border-white/5 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{selectedClass.details.kpi3}</span>
                    <span className="block text-sm font-extrabold text-white mt-1">{selectedClass.details.kpi3Val}</span>
                  </div>
                </div>

                {/* Highlight banner */}
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4.5 flex items-start gap-3">
                  <MdCheckCircle className="text-emerald-400 mt-0.5 shrink-0" size={18} />
                  <p className="text-xs text-emerald-300/90 leading-relaxed font-medium">
                    {selectedClass.details.highlight}
                  </p>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setSelectedCardId(null)}
                    className="rounded-lg border border-white/10 px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Minimize View
                  </button>
                  <button
                    onClick={() => router.push(user ? "/dashboard/overview" : "/login")}
                    className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-semibold text-white hover:opacity-90 transition cursor-pointer"
                  >
                    Enter Platform
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Gamification Teaser Section */}
      <section className="relative z-10 bg-slate-950/40 border-t border-b border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-5"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 uppercase tracking-widest">
              <MdEmojiEvents />
              <span>ESG Gamification</span>
            </span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Turn Sustainability into a Team Achievement
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Reward eco-friendly habits with levels, XP, and badges. Staff earn points by completing sustainability challenges or participating in company-organized CSR campaigns. Points are redeemable for real perks in the Rewards Hub.
            </p>
            <div className="flex gap-6 pt-2">
              <div>
                <span className="text-2xl font-black text-white">4 Live</span>
                <span className="block text-xs text-slate-500 uppercase mt-0.5">Active Quests</span>
              </div>
              <div className="border-r border-white/10 h-10"></div>
              <div>
                <span className="text-2xl font-black text-white">4 Available</span>
                <span className="block text-xs text-slate-500 uppercase mt-0.5">Auto-unlock Badges</span>
              </div>
              <div className="border-r border-white/10 h-10"></div>
              <div>
                <span className="text-2xl font-black text-white">100%</span>
                <span className="block text-xs text-slate-500 uppercase mt-0.5">Real Perk Store</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl relative"
          >
            <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
              <MdStar />
            </div>
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Challenge completion</h3>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4.5 mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full">Environmental</span>
                <span className="text-xs font-bold text-emerald-400">+200 XP</span>
              </div>
              <h4 className="font-bold text-slate-200 text-sm">Green Commute Challenge</h4>
              <p className="text-xs text-slate-500 mt-1">Walk or cycle instead of driving for 5 days.</p>
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-3">
                <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1.5 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            
            <button
              onClick={() => router.push(user ? "/dashboard/overview" : "/login")}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 active:scale-[0.98] transition cursor-pointer"
            >
              Launch Dashboard to Participate
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030408] py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EcoMerge AI. All Rights Reserved. Audit-ready ESG data registry.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-slate-300">Auditor login</Link>
            <a href="#" className="hover:text-slate-300">Privacy policy</a>
            <a href="#" className="hover:text-slate-300">Terms of service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
