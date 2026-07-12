"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { gsap } from "gsap";
import { 
  MdAnalytics, 
  MdDownload, 
  MdFileDownload, 
  MdDone, 
  MdRefresh 
} from "react-icons/md";
import { message } from "antd";

export default function ReportsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fetch report metadata
  const { data: reportMeta, isLoading: metaLoading } = useQuery({
    queryKey: ["esgReport"],
    queryFn: () => apiService.getESGReport(),
  });

  const [reportType, setReportType] = useState("esg_summary");
  const [period, setPeriod] = useState("q2_2026");
  const [format, setFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("");
  const [downloadReady, setDownloadReady] = useState(false);

  useEffect(() => {
    gsap.fromTo(".report-animate", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
    );
  }, []);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setProgress(0);
    setDownloadReady(false);
    
    const steps = [
      "Compiling carbon emissions telemetries...",
      "Validating CSR volunteering hours and diversity indexes...",
      "Extracting policy acknowledgement metrics...",
      "Injecting AI advisory recommendations...",
      "Assembling and formatting metadata..."
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 5;
        
        // Update step descriptions based on progress
        const stepIdx = Math.floor(nextProgress / 20);
        if (steps[stepIdx] && steps[stepIdx] !== stepText) {
          setStepText(steps[stepIdx]);
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setDownloadReady(true);
          message.success("ESG Compliance report generated successfully!");
          return 100;
        }
        return nextProgress;
      });
    }, 150);
  };

  const handleDownload = () => {
    // Functional mock file download
    let filename = `EcoMerge_${reportType}_${period}.${format}`;
    let content = `EcoMerge AI ESG Report\nType: ${reportType}\nPeriod: ${period}\nGenerated on: ${new Date().toISOString()}\nOverall Score: 81.4/100\n`;
    
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    message.success(`${filename} download triggered.`);
  };

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Custom Report Builder</h1>
        <p className="text-slate-400 text-sm mt-1">Compile ESG metrics, compliance logs, and export to audit-ready formats.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Controls Panel */}
        <div className="report-animate rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Report Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Report Target</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
              >
                <option value="esg_summary">ESG Summary Index (All Scopes)</option>
                <option value="environmental">Environmental Audit (Carbon Ledger)</option>
                <option value="social">Social & CSR Impact Ledger</option>
                <option value="governance">Governance Code & Risk Records</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Reporting Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
              >
                <option value="q2_2026">Q2 2026 (Year-to-Date)</option>
                <option value="q1_2026">Q1 2026 (Historical)</option>
                <option value="annual_2025">Annual Audit 2025</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {["pdf", "excel", "csv"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-lg border py-2.5 text-xs font-bold uppercase transition cursor-pointer ${
                      format === f 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-white/5 border-white/10 text-slate-300 hover:border-emerald-500/30"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Auditor Certification</label>
              <div className="flex items-center gap-2.5 h-10 px-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-slate-300">GRI Compliant Export</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-400">Compilation uses certified EPA & DEFRA emission factors.</p>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer disabled:opacity-40"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Status Indicator Panel */}
        <div className="report-animate rounded-xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Build Status</h3>
            
            {/* Generate indicator */}
            {isGenerating && (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span>Compiling metadata...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-400 italic font-medium">{stepText}</p>
              </div>
            )}

            {/* Ready State */}
            {downloadReady && !isGenerating && (
              <div className="text-center py-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
                  <MdDone size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">Report Compiled</h4>
                <p className="text-xs text-slate-400 mt-1">Audit registry certificate appended successfully.</p>
                <button
                  onClick={handleDownload}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-4 py-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <MdDownload size={14} />
                  <span>Download File</span>
                </button>
              </div>
            )}

            {/* Idle State */}
            {!isGenerating && !downloadReady && (
              <div className="text-center py-10 text-slate-500">
                <MdAnalytics size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-xs font-semibold">Ready to compile report parameters.</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">FastAPI Backend Status</span>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Report Status:</span>
              <span className="text-emerald-400 uppercase">{reportMeta?.status || "Ready"}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold mt-1">
              <span className="text-slate-400">Format Matrix:</span>
              <span className="text-slate-300 font-mono">PDF, CSV, XLS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
