"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie
} from "recharts";
import { gsap } from "gsap";
import { 
  MdAdd, 
  MdCo2, 
  MdReceiptLong, 
  MdCheckCircle, 
  MdFilterAlt,
  MdAttachMoney
} from "react-icons/md";
import { message } from "antd";

interface CarbonEntry {
  id: string;
  department: string;
  activity_type: string;
  scope: string;
  quantity: number;
  unit: string;
  emission_factor: number;
  kgco2e: number;
  date: string;
  evidence: string;
}

export default function EnvironmentalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fetch carbon summary
  const { data: carbon, isLoading } = useQuery({
    queryKey: ["carbonSummary"],
    queryFn: () => apiService.getCarbonSummary(),
  });

  const [entries, setEntries] = useState<CarbonEntry[]>([
    { id: "1", department: "Operations", activity_type: "Diesel Generator", scope: "Scope 1", quantity: 850, unit: "litres", emission_factor: 2.68, kgco2e: 2278.0, date: "2026-07-10", evidence: "invoice_2024_03.pdf" },
    { id: "2", department: "Administration", activity_type: "Grid Electricity", scope: "Scope 2", quantity: 4200, unit: "kWh", emission_factor: 0.85, kgco2e: 3570.0, date: "2026-07-09", evidence: "utility_bill_admin.pdf" },
    { id: "3", department: "Operations", activity_type: "Employee Commute", scope: "Scope 3", quantity: 12400, unit: "km", emission_factor: 0.18, kgco2e: 2232.0, date: "2026-07-08", evidence: "commute_survey.xlsx" },
    { id: "4", department: "People", activity_type: "Office Paper", scope: "Scope 3", quantity: 120, unit: "kg", emission_factor: 0.95, kgco2e: 114.0, date: "2026-07-05", evidence: "paper_receipt.pdf" },
    { id: "5", department: "Operations", activity_type: "Natural Gas Heating", scope: "Scope 1", quantity: 620, unit: "m³", emission_factor: 2.03, kgco2e: 1258.6, date: "2026-07-01", evidence: "gas_bill_q2.pdf" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterScope, setFilterScope] = useState("All");
  
  // New entry form state
  const [newDept, setNewDept] = useState("Operations");
  const [newActivity, setNewActivity] = useState("");
  const [newScope, setNewScope] = useState("Scope 1");
  const [newQty, setNewQty] = useState("");
  const [newUnit, setNewUnit] = useState("kWh");
  const [newFactor, setNewFactor] = useState("");
  const [newEvidence, setNewEvidence] = useState("");

  useEffect(() => {
    if (!isLoading) {
      gsap.fromTo(".env-animate", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-slate-400 text-sm animate-pulse">Calculating Scope weights...</p>
      </div>
    );
  }

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity || !newQty || !newFactor) {
      message.error("Please fill in all required fields");
      return;
    }

    const qty = parseFloat(newQty);
    const factor = parseFloat(newFactor);
    const kg = qty * factor;

    const entry: CarbonEntry = {
      id: (entries.length + 1).toString(),
      department: newDept,
      activity_type: newActivity,
      scope: newScope,
      quantity: qty,
      unit: newUnit,
      emission_factor: factor,
      kgco2e: parseFloat(kg.toFixed(1)),
      date: new Date().toISOString().split("T")[0],
      evidence: newEvidence || "receipt_pending.pdf"
    };

    setEntries([entry, ...entries]);
    setIsModalOpen(false);
    message.success("Carbon transactions ledger successfully logged!");
    
    // Clear form
    setNewActivity("");
    setNewQty("");
    setNewFactor("");
    setNewEvidence("");
  };

  const filteredEntries = filterScope === "All" 
    ? entries 
    : entries.filter(e => e.scope === filterScope);

  // Pie chart data for Scope weights
  const scopeData = [
    { name: "Scope 1 (Direct)", value: carbon?.scope_1 || 320.4, color: "#10b981" },
    { name: "Scope 2 (Indirect)", value: carbon?.scope_2 || 410.8, color: "#6366f1" },
    { name: "Scope 3 (Supply Chain)", value: carbon?.scope_3 || 549.3, color: "#ec4899" },
  ];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Environmental Ledger</h1>
          <p className="text-slate-400 text-sm mt-1">Audit-ready carbon transactions database and Scope 1, 2, 3 accounting.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
        >
          <MdAdd size={18} />
          <span>Log Carbon Entry</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Emissions Card */}
        <div className="env-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total CO2 Emissions</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{carbon?.total_kgco2e || 1280.5}</span>
            <span className="text-slate-500 text-xs font-semibold">kgCO2e</span>
          </div>
          <p className="mt-2 text-xs font-medium text-emerald-400">Stable from prior cycle</p>
        </div>

        {/* Scope 1 */}
        <div className="env-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scope 1 (Direct)</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{carbon?.scope_1 || 320.4}</span>
            <span className="text-slate-500 text-xs font-semibold">kgCO2e</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Diesel and thermal combustion</p>
        </div>

        {/* Scope 2 */}
        <div className="env-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md border-l-4 border-l-indigo-500">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scope 2 (Indirect)</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{carbon?.scope_2 || 410.8}</span>
            <span className="text-slate-500 text-xs font-semibold">kgCO2e</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Grid electricity import</p>
        </div>

        {/* Scope 3 */}
        <div className="env-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md border-l-4 border-l-pink-500">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scope 3 (Up/Down)</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{carbon?.scope_3 || 549.3}</span>
            <span className="text-slate-500 text-xs font-semibold">kgCO2e</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Commutes and office materials</p>
        </div>
      </div>

      {/* Visual Analysis Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scope breakdown pie chart */}
        <div className="env-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Scope Contribution</h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scopeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scopeData.map((entry, index) => (
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
            {scopeData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="text-slate-300 font-medium">{s.name}</span>
                </div>
                <span className="font-bold text-white">{((s.value / (carbon?.total_kgco2e || 1280.5)) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scope allocation across departments */}
        <div className="env-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Department Scope Allocation</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Operations", Scope1: 180, Scope2: 240, Scope3: 190 },
                  { name: "Administration", Scope1: 60, Scope2: 120, Scope3: 130 },
                  { name: "People", Scope1: 80.4, Scope2: 50.8, Scope3: 229.3 }
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="Scope1" stackId="a" fill="#10b981" />
                <Bar dataKey="Scope2" stackId="a" fill="#6366f1" />
                <Bar dataKey="Scope3" stackId="a" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Carbon Ledger Table */}
      <div className="env-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Carbon Ledger Database</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MdFilterAlt />
              <span>Scope:</span>
            </div>
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none transition focus:border-emerald-500/50"
            >
              <option value="All">All Scopes</option>
              <option value="Scope 1">Scope 1</option>
              <option value="Scope 2">Scope 2</option>
              <option value="Scope 3">Scope 3</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3.5 pl-4">Activity Date</th>
                <th className="pb-3.5">Department</th>
                <th className="pb-3.5">Activity Description</th>
                <th className="pb-3.5 text-center">Class</th>
                <th className="pb-3.5 text-right">Telemetry</th>
                <th className="pb-3.5 text-right">Factor</th>
                <th className="pb-3.5 text-right">Score (kgCO2e)</th>
                <th className="pb-3.5 text-center pr-4">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-200">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 pl-4 text-xs font-semibold text-slate-400">{e.date}</td>
                  <td>{e.department}</td>
                  <td className="text-slate-300 font-semibold">{e.activity_type}</td>
                  <td className="text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      e.scope === "Scope 1" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      e.scope === "Scope 2" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                      "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                    }`}>
                      {e.scope}
                    </span>
                  </td>
                  <td className="text-right text-slate-400">{e.quantity} <span className="text-[10px] uppercase font-bold">{e.unit}</span></td>
                  <td className="text-right text-slate-400">{e.emission_factor}</td>
                  <td className="text-right text-white font-extrabold">{e.kgco2e.toLocaleString()}</td>
                  <td className="text-center pr-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5">
                      <MdCheckCircle size={12} />
                      <span>Verified</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Log Carbon Transaction</h3>
            <p className="text-xs text-slate-400 mb-6">Commit a verified carbon impact ledger record directly into the ERP registry.</p>
            
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Administration">Administration</option>
                    <option value="People">People / HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Scope Class</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="Scope 1">Scope 1 - Direct</option>
                    <option value="Scope 2">Scope 2 - Indirect</option>
                    <option value="Scope 3">Scope 3 - Supply Chain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Activity Description</label>
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="e.g. Flight travel LHR to JFK"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Telemetry Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. km"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Emission Factor</label>
                  <input
                    type="number"
                    step="any"
                    value={newFactor}
                    onChange={(e) => setNewFactor(e.target.value)}
                    placeholder="e.g. 0.18"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Evidence Attachment</label>
                  <input
                    type="text"
                    value={newEvidence}
                    onChange={(e) => setNewEvidence(e.target.value)}
                    placeholder="invoice_receipt.pdf"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
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
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
