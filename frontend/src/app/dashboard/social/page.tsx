"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { gsap } from "gsap";
import { 
  MdAdd, 
  MdVolunteerActivism, 
  MdDiversity3, 
  MdSchool, 
  MdHourglassTop,
  MdCheckCircle
} from "react-icons/md";
import { message } from "antd";

interface CSRActivity {
  id: string;
  title: string;
  category: string;
  volunteer_hours: number;
  funds_raised: string;
  participation_rate: number;
  status: "Completed" | "In Progress" | "Scheduled";
}

export default function SocialPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activities, setActivities] = useState<CSRActivity[]>([
    { id: "1", title: "Global Hunger Charity Run", category: "Community Outreach", volunteer_hours: 320, funds_raised: "$12,500", participation_rate: 68, status: "Completed" },
    { id: "2", title: "Carbon Forestry Volunteering", category: "Environmental", volunteer_hours: 480, funds_raised: "$5,000", participation_rate: 42, status: "In Progress" },
    { id: "3", title: "ESG Compliance Workshop Q3", category: "Education", volunteer_hours: 150, funds_raised: "N/A", participation_rate: 91, status: "Completed" },
    { id: "4", title: "Tech Mentoring for Underrepresented Students", category: "Social Equity", volunteer_hours: 240, funds_raised: "N/A", participation_rate: 25, status: "In Progress" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Community Outreach");
  const [newHours, setNewHours] = useState("");
  const [newFunds, setNewFunds] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newStatus, setNewStatus] = useState<"Completed" | "In Progress" | "Scheduled">("Scheduled");

  useEffect(() => {
    gsap.fromTo(".social-animate", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
    );
  }, []);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHours || !newRate) {
      message.error("Please fill in all required fields");
      return;
    }

    const activity: CSRActivity = {
      id: (activities.length + 1).toString(),
      title: newTitle,
      category: newCategory,
      volunteer_hours: parseInt(newHours),
      funds_raised: newFunds || "N/A",
      participation_rate: parseInt(newRate),
      status: newStatus
    };

    setActivities([activity, ...activities]);
    setIsModalOpen(false);
    message.success("CSR activity logged in social ledger!");
    
    // Clear Form
    setNewTitle("");
    setNewHours("");
    setNewFunds("");
    setNewRate("");
    setNewStatus("Scheduled");
  };

  // Charts data
  const diversityData = [
    { name: "Female", value: 46, color: "#ec4899" },
    { name: "Male", value: 50, color: "#6366f1" },
    { name: "Non-Binary", value: 4, color: "#10b981" },
  ];

  const trainingData = [
    { name: "ESG Policy", rate: 94 },
    { name: "Anti-Bribery", rate: 98 },
    { name: "Cybersecurity", rate: 89 },
    { name: "Diversity & Inclusion", rate: 92 },
  ];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Social & Corporate Responsibility</h1>
          <p className="text-slate-400 text-sm mt-1">CSR outreach initiatives, staff engagement analytics, and diversity benchmarks.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
        >
          <MdAdd size={18} />
          <span>Add CSR Activity</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="social-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volunteer Hours</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <MdVolunteerActivism size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">1,190</span>
            <span className="text-slate-500 text-xs font-semibold">hours cumulative</span>
          </div>
          <p className="mt-2 text-xs text-emerald-400">+12% over last quarter</p>
        </div>

        <div className="social-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Training Completion</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <MdSchool size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">93.2%</span>
            <span className="text-slate-500 text-xs font-semibold">avg across modules</span>
          </div>
          <p className="mt-2 text-xs text-indigo-400">Target: 95.0% by end of year</p>
        </div>

        <div className="social-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diversity Ratio</span>
            <div className="rounded-lg bg-pink-500/10 p-2 text-pink-400">
              <MdDiversity3 size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">46% / 54%</span>
            <span className="text-slate-500 text-xs font-semibold">female / male + nb</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">GRI Disclosure compliance verified</p>
        </div>

        <div className="social-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Campaigns</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <MdHourglassTop size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">2</span>
            <span className="text-slate-500 text-xs font-semibold">campaigns running</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Forestry & Tech Mentoring</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Training Completion Rate */}
        <div className="social-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Staff Training Completion Rates</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {trainingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender/Diversity Pie Chart */}
        <div className="social-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Gender Diversity Break</h3>
          <div className="h-56 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diversityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {diversityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {diversityData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-slate-300 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSR activities list */}
      <div className="social-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">CSR & Volunteering Ledger</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((item) => (
            <div 
              key={item.id} 
              className="rounded-xl border border-white/5 bg-white/5 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
                    item.status === "In Progress" ? "bg-amber-500/10 text-amber-400" :
                    "bg-slate-500/10 text-slate-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-100 mb-2">{item.title}</h4>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div>
                    <span className="block text-slate-500 uppercase tracking-widest text-[9px]">Volunteer Hours</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{item.volunteer_hours} hrs</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-widest text-[9px]">Funds Raised</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{item.funds_raised}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase tracking-widest text-[9px]">Staff Participation</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{item.participation_rate}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add CSR Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Create CSR Activity</h3>
            <p className="text-xs text-slate-400 mb-6">Launch a new volunteer task or charity drive within the employee network.</p>
            
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Activity Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Local Tree Planting Drive"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="Community Outreach">Community Outreach</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Education">Education</option>
                    <option value="Social Equity">Social Equity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Campaign Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Est. Vol. Hours</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Funds Raised</label>
                  <input
                    type="text"
                    value={newFunds}
                    onChange={(e) => setNewFunds(e.target.value)}
                    placeholder="e.g. $2,500 or N/A"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Participation %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Launch Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
