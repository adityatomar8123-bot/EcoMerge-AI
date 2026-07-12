"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { 
  MdEmojiEvents, 
  MdWorkspacePremium, 
  MdLeaderboard, 
  MdShoppingBag,
  MdCheckCircle,
  MdOfflineBolt
} from "react-icons/md";
import { message } from "antd";

interface Challenge {
  id: string;
  title: string;
  type: string;
  xp_reward: number;
  progress: number;
  target: number;
  unit: string;
  status: "Active" | "Completed";
}

interface Badge {
  id: string;
  name: string;
  description: string;
  xp_threshold: number;
  icon: string;
  unlocked: boolean;
}

interface Reward {
  id: string;
  title: string;
  xp_cost: number;
  stock: number;
  image: string;
}

export default function GamificationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [xp, setXp] = useState(850);
  const [level, setLevel] = useState(4);
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: "ch1", title: "Complete Q3 Compliance Training", type: "Governance", xp_reward: 150, progress: 1, target: 1, unit: "workshop", status: "Active" },
    { id: "ch2", title: "Log 5 Commute Walks instead of Driving", type: "Environmental", xp_reward: 200, progress: 3, target: 5, unit: "walks", status: "Active" },
    { id: "ch3", title: "Participate in Carbon Forestry Event", type: "Social", xp_reward: 250, progress: 0, target: 1, unit: "event", status: "Active" },
  ]);

  const [badges] = useState<Badge[]>([
    { id: "b1", name: "Carbon Zero Hero", description: "Logged first carbon scope reduction entry", xp_threshold: 100, icon: "🌱", unlocked: true },
    { id: "b2", name: "Compliance Champion", description: "Completed all active policy acknowledgements", xp_threshold: 300, icon: "📜", unlocked: true },
    { id: "b3", name: "Outreach Catalyst", description: "Volunteered 10+ hours in CSR activities", xp_threshold: 600, icon: "🤝", unlocked: true },
    { id: "b4", name: "ESG Vanguard", description: "Reached 1,500+ cumulative XP", xp_threshold: 1500, icon: "👑", unlocked: false },
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    { id: "r1", title: "Premium Eco Flask", xp_cost: 300, stock: 14, image: "🧉" },
    { id: "r2", title: "1-Month Public Transit Pass", xp_cost: 500, stock: 6, image: "🎫" },
    { id: "r3", title: "Tree planted in your name", xp_cost: 200, stock: 99, image: "🌳" },
  ]);

  useEffect(() => {
    gsap.fromTo(".game-animate", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
    );
  }, []);

  const handleCompleteChallenge = (id: string, xpReward: number) => {
    setChallenges(prev => 
      prev.map(ch => ch.id === id ? { ...ch, progress: ch.target, status: "Completed" } : ch)
    );
    setXp(prev => {
      const newXp = prev + xpReward;
      message.success(`Challenge completed! +${xpReward} XP awarded.`);
      
      // Calculate level up
      if (newXp >= level * 300) {
        setLevel(l => l + 1);
        message.success(`🎉 Level Up! You reached Level ${level + 1}!`);
      }
      
      return newXp;
    });
  };

  const handleRedeemReward = (id: string, cost: number) => {
    if (xp < cost) {
      message.error("Insufficient XP points for redemption.");
      return;
    }

    setXp(prev => prev - cost);
    setRewards(prev => 
      prev.map(r => r.id === id ? { ...r, stock: r.stock - 1 } : r)
    );
    message.success("Reward successfully redeemed! Receipt code sent to email.");
  };

  const nextLevelXp = level * 300;
  const prevLevelXp = (level - 1) * 300;
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Gamification & Rewards</h1>
        <p className="text-slate-400 text-sm mt-1">Sustainability quests, level progression milestones, and active perks store.</p>
      </div>

      {/* Level and XP progress bar */}
      <div className="game-animate rounded-xl border border-white/5 bg-gradient-to-r from-slate-900/50 to-indigo-950/20 p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 text-2xl font-bold text-white shadow-lg shadow-indigo-500/30">
              Lvl {level}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <span>Active ESG Practitioner</span>
                <MdOfflineBolt className="text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-1">Next badge unlock at {badges.find(b => !b.unlocked)?.xp_threshold || 1500} XP</p>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>{xp} XP Earned</span>
              <span>{nextLevelXp} XP Target</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Badges container */}
        <div className="game-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Earned Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`rounded-xl border p-4 text-center flex flex-col items-center justify-center transition duration-300 ${
                  badge.unlocked 
                    ? "bg-white/5 border-white/10 hover:border-emerald-500/30" 
                    : "bg-slate-950/20 border-white/5 opacity-40 select-none"
                }`}
              >
                <span className="text-3xl mb-2.5">{badge.icon}</span>
                <h4 className="text-xs font-bold text-slate-200">{badge.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-normal">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Challenge lifecycle list */}
        <div className="game-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Sustainability Quests</h3>
          <div className="space-y-4.5">
            {challenges.map((ch) => (
              <div 
                key={ch.id}
                className="rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {ch.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">+{ch.xp_reward} XP</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{ch.title}</h4>
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-3.5">
                    <span>Progress: {ch.progress} / {ch.target} {ch.unit}</span>
                    {ch.status === "Active" ? (
                      <button
                        onClick={() => handleCompleteChallenge(ch.id, ch.xp_reward)}
                        className="rounded bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white transition hover:opacity-90 cursor-pointer"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
                        <MdCheckCircle size={10} />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rewards Store */}
      <div className="game-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Staff Rewards Hub</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div 
              key={reward.id}
              className="rounded-xl border border-white/5 bg-white/5 p-5 flex flex-col items-center justify-between hover:border-indigo-500/30 transition duration-300"
            >
              <div className="text-center">
                <span className="text-5xl block mb-4">{reward.image}</span>
                <h4 className="text-base font-bold text-slate-200">{reward.title}</h4>
                <div className="flex items-center justify-center gap-1 text-indigo-400 font-extrabold text-sm mt-2">
                  <MdOfflineBolt />
                  <span>{reward.xp_cost} XP</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1.5 block">Stock: {reward.stock} left</span>
              </div>
              <button
                onClick={() => handleRedeemReward(reward.id, reward.xp_cost)}
                disabled={reward.stock <= 0}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white mt-5 transition hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-30 cursor-pointer"
              >
                {reward.stock <= 0 ? "Out of Stock" : "Redeem Gift"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
