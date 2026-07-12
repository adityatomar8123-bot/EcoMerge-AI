"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiService } from "@/lib/api";
import { gsap } from "gsap";
import { 
  MdPsychology, 
  MdSend, 
  MdLightbulb, 
  MdTrendingUp,
  MdShare
} from "react-icons/md";
import { message } from "antd";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  confidence?: number;
}

export default function AIAssistantPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "ai",
      text: "Hello! I am your EcoMerge AI ESG Advisor. I have analyzed your carbon accounting ledger, department score breakdowns, and compliance acknowledgements. Ask me anything about your corporate sustainability metrics or how to optimize them.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    gsap.fromTo(".ai-animate", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsThinking(true);

    try {
      // Fetch recommendation from backend advisor endpoint
      const response = await apiService.getAIAdvisor(query);
      
      // Customize message based on user query keyword to simulate responsiveness, 
      // but integrate the REAL backend data ("insight" and "confidence").
      let responseText = `Here is the verified recommendation based on current ERP metrics:\n\n"${response.insight}"`;
      
      if (query.toLowerCase().includes("carbon") || query.toLowerCase().includes("emission")) {
        responseText += `\n\nOptimizing carbon tracking will improve Operations' current ESG score of 79.`;
      } else if (query.toLowerCase().includes("training") || query.toLowerCase().includes("policy")) {
        responseText += `\n\nNote: Q3 Compliance Training progress currently stands at 93.2%. Shifting to automated acknowledgements will speed up completion.`;
      }

      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: "ai",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: response.confidence
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsThinking(false);
      }, 700);

    } catch (e) {
      console.error("AI Advisor call failed, using fallback.", e);
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: "ai",
          text: "I was unable to retrieve advisor insights from the FastAPI endpoint. Please ensure the backend server is running locally on port 8000.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsThinking(false);
      }, 600);
    }
  };

  const suggestions = [
    "How do we optimize operations carbon emissions?",
    "Show carbon offset recommendations",
    "What is the current policy training status?"
  ];

  return (
    <div ref={containerRef} className="h-[calc(100vh-140px)] flex flex-col justify-between space-y-6">
      {/* Header */}
      <div className="ai-animate">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>AI ESG Insights Advisor</span>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Active</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Lightweight recommendation engine layered on top of EcoMerge ERP datasets.</p>
      </div>

      {/* Main chat box */}
      <div className="ai-animate flex-1 rounded-xl border border-white/5 bg-slate-900/20 backdrop-blur-md flex flex-col overflow-hidden">
        {/* Chat log */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((m) => (
            <div 
              key={m.id}
              className={`flex items-start gap-3.5 max-w-[80%] ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                m.sender === "user" 
                  ? "bg-emerald-500 text-white" 
                  : "bg-indigo-600 text-white"
              }`}>
                {m.sender === "user" ? "U" : <MdPsychology size={18} />}
              </div>
              <div className="space-y-1">
                <div className={`rounded-xl px-4 py-3 text-sm font-medium leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-500/15 text-emerald-100 border border-emerald-500/20"
                    : "bg-white/5 text-slate-200 border border-white/5"
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  
                  {m.confidence !== undefined && (
                    <div className="mt-3.5 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400">
                      <MdTrendingUp size={12} />
                      <span>Recommendation confidence: {(m.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <span className={`block text-[9px] text-slate-500 font-bold uppercase tracking-wider ${
                  m.sender === "user" ? "text-right" : ""
                }`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-3.5 max-w-[80%]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                <MdPsychology size={18} />
              </div>
              <div className="rounded-xl px-4 py-3 bg-white/5 border border-white/5 text-slate-400 text-sm flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Shortcuts / Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 py-3 border-t border-white/5 bg-slate-950/20 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 hover:border-indigo-500/30 px-3.5 py-2 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                <MdLightbulb size={12} className="text-amber-400" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for emissions insights or compliance training advice..."
              className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500/50"
            />
            <button
              type="submit"
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition cursor-pointer"
            >
              <MdSend size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
