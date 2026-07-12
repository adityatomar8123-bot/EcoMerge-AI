"use client";

import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { gsap } from "gsap";
import { 
  MdTrendingUp, 
  MdTrackChanges, 
  MdNotificationsActive, 
  MdWorkspacePremium, 
  MdLeaderboard,
  MdEmojiEvents
} from "react-icons/md";

export default function OverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: () => apiService.getDashboardOverview(),
  });

  // Fetch carbon summary
  const { data: carbon, isLoading: carbonLoading } = useQuery({
    queryKey: ["carbonSummary"],
    queryFn: () => apiService.getCarbonSummary(),
  });

  useEffect(() => {
    if (!dashLoading && dashboard) {
      // GSAP Counter and reveal animation
      const ctx = gsap.context(() => {
        // Stagger cards entry
        gsap.fromTo(".overview-card", 
          { opacity: 0, y: 25, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.08, ease: "power2.out" }
        );

        // Score counter animation
        const scoreVal = { val: 0 };
        gsap.to(scoreVal, {
          val: dashboard.overall_esg_score,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            const el = document.getElementById("esg-score-counter");
            if (el) el.innerText = scoreVal.val.toFixed(1);
          }
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [dashLoading, dashboard]);

  if (dashLoading || carbonLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-slate-400 text-sm animate-pulse">Retrieving ESG telemetry...</p>
      </div>
    );
  }

  if (dashError || !dashboard) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full bg-rose-500/10 p-3 text-rose-500">
          <MdNotificationsActive size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Unable to load dashboard</h3>
        <p className="text-slate-400 max-w-md text-sm">Please verify the backend server is running and reachable on port 8000.</p>
      </div>
    );
  }

  // Bar colors for department scores
  const barColors = ["#10b981", "#6366f1", "#ec4899"];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">ESG Performance Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time indicators and department telemetry across environmental, social, and governance.</p>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 backdrop-blur-md">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Enterprise Mode</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall ESG Score */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall ESG Index</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <MdWorkspacePremium size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span id="esg-score-counter" className="text-4xl font-extrabold text-white">0</span>
            <span className="text-slate-500 text-sm font-semibold">/ 100</span>
          </div>
          <p className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
            <MdTrendingUp />
            <span>Top 5% of Sector Benchmark</span>
          </p>
        </div>

        {/* Carbon Offset Target */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Carbon Reduction Target</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <MdTrackChanges size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{carbon?.target_progress || 74}%</span>
          </div>
          <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${carbon?.target_progress || 74}%` }}
            ></div>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-pink-500/5 blur-2xl group-hover:bg-pink-500/10 transition duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Challenges</span>
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400">
              <MdEmojiEvents size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{dashboard.active_challenges}</span>
            <span className="text-slate-500 text-xs font-semibold">challenges live</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">148 staff participating currently</p>
        </div>

        {/* Unread Notifications */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alerts & Notifications</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <MdNotificationsActive size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{dashboard.notifications}</span>
            <span className="text-slate-500 text-xs font-semibold">pending tasks</span>
          </div>
          <p className="mt-2 text-xs text-amber-400">Compliance acknowledgement required</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Carbon trend line chart */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Carbon Emissions Trend (kgCO2e)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.carbon_trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="kgco2e" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ fill: "#10b981", r: 4 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department scores radar/bar chart */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Department ESG Breakdown</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.department_scores} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {dashboard.department_scores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gamification and Department Table */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Leaderboard snippet */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Sustainability Leaderboard</h3>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <MdLeaderboard />
              <span>Full Standings</span>
            </div>
          </div>
          <div className="space-y-4">
            {dashboard.leaderboard.map((item, idx) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3.5 transition hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? "bg-amber-500/20 text-amber-400" :
                    idx === 1 ? "bg-slate-300/20 text-slate-300" :
                    "bg-amber-700/20 text-amber-600"
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-200">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                  {item.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ESG highlights/announcements */}
        <div className="overview-card rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Active Initiatives</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <h4 className="text-sm font-semibold text-slate-200">Operations Hybrid Shift</h4>
                <p className="text-xs text-slate-400 mt-1">Goal to slash Scope 3 commute emissions by 25% this quarter.</p>
              </div>
              <div className="border-l-2 border-indigo-500 pl-4 py-1">
                <h4 className="text-sm font-semibold text-slate-200">ESG Policy Review</h4>
                <p className="text-xs text-slate-400 mt-1">HR is auditing the compliance training completions. Current progress: 84%.</p>
              </div>
              <div className="border-l-2 border-pink-500 pl-4 py-1">
                <h4 className="text-sm font-semibold text-slate-200">Green Logistics Campaign</h4>
                <p className="text-xs text-slate-400 mt-1">Department contest for paperless documentation is active for 6 more days.</p>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Last refreshed: Just now</span>
            <span>Server status: Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
