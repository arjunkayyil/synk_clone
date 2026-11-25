"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Trash2, Bot, User as UserIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: "Hi! I'm **Nyx**, your workspace AI copilot. I have real-time access to your tasks, bugs, and team backlog. How can I help you today?",
    time: "Just now",
  },
];

const QUICK_ACTIONS = [
  "📋 My assigned tasks",
  "🐛 Active bugs overview",
  "👥 Team workload",
  "✍️ Draft a bug report",
];

export function NyxChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/nyx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response from Nyx");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: "b-" + Date.now(),
        role: "assistant",
        content: data.reply || "I didn't receive a response. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: "e-" + Date.now(),
        role: "assistant",
        content: "Sorry, I ran into an error connecting to workspace services. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages(INITIAL_MESSAGES);
  }

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e293b]">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Sparkles size={11} />
          </div>
          <div>
            <span className="font-semibold text-slate-100">Nyx</span>
            <span className="ml-1 text-[10px] text-emerald-400 font-mono">● online</span>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Reset conversation"
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1e293b] transition-colors cursor-pointer"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col space-y-1",
              msg.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "rounded-xl px-3 py-2 max-w-[92%] leading-relaxed break-words",
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                  : "bg-[#161f30] text-slate-200 border border-[#23324d] rounded-bl-none shadow-sm"
              )}
            >
              <FormatMarkdown text={msg.content} />
            </div>
            <span className="text-[9px] text-slate-500 px-1">{msg.time}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-1.5 text-slate-400 px-2 py-1 bg-[#161f30]/60 rounded-lg w-max border border-[#23324d]">
            <Sparkles size={11} className="animate-spin text-blue-400" />
            <span className="text-[10px]">Nyx is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips (shown when few messages) */}
      {messages.length <= 2 && (
        <div className="pt-2 pb-2 space-y-1 border-t border-[#1e293b]">
          <p className="text-[10px] text-slate-400 font-medium">Quick prompts:</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                className="text-[10px] px-2 py-1 rounded-lg bg-[#161f30] text-slate-300 border border-[#23324d] hover:border-blue-500/50 hover:text-blue-300 transition-colors text-left cursor-pointer"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="pt-2 border-t border-[#1e293b]">
        <div className="flex items-center gap-1.5 bg-[#0f172a] border border-[#23324d] rounded-xl px-2.5 py-1.5 focus-within:border-blue-500/80 transition-colors">
          <input
            type="text"
            placeholder="Ask Nyx anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              input.trim() && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
                : "text-slate-600 cursor-not-allowed"
            )}
          >
            <Send size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple lightweight markdown parser for bold, bullet points, headers
function FormatMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        // Bullet point
        if (line.trim().startsWith("• ") || line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const content = line.trim().replace(/^[•\-\*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-0.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>{renderBold(content)}</span>
            </div>
          );
        }

        // Sub-bullet
        if (line.trim().startsWith("↳")) {
          return (
            <div key={idx} className="ml-3 text-slate-400 text-[11px]">
              {renderBold(line.trim())}
            </div>
          );
        }

        return <div key={idx}>{renderBold(line)}</div>;
      })}
    </div>
  );
}

function renderBold(str: string) {
  // Regex to split on **bold** and *italic*
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="text-slate-300 italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
