"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const PROACTIVE_OPENER =
  "Hey — I see you're checking out Vector's automated trading systems. Quick question: are you currently trading stocks, futures, or crypto? (Or maybe all three?)";

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Proactive opener with typing indicator
  useEffect(() => {
    const t1 = setTimeout(() => setIsTyping(true), 600);
    const t2 = setTimeout(() => {
      setMessages([{ role: "assistant", content: PROACTIVE_OPENER }]);
      setIsTyping(false);
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isTyping) inputRef.current?.focus();
  }, [isTyping]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");

    const updated: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updated);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          history: updated,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Apologies — I hit a connection issue. Could you try sending that again?",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <main className="h-full flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <span className="text-base font-semibold tracking-widest uppercase">
          Vector
        </span>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/35 font-medium">
          <span className="text-yellow-400/70">&#9733; 4.6</span>
          <span className="text-white/15">|</span>
          <span>1,000+ clients</span>
          <span className="text-white/15">|</span>
          <span>5yr track record</span>
          <span className="text-white/15">|</span>
          <span>12-mo guarantee</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="shrink-0 px-6 pt-8 pb-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          Automated trading that profits
          <br className="hidden sm:block" /> in any market.
        </h1>
        <p className="mt-2 text-white/40 text-sm">
          Market-neutral algorithms &middot; No leverage &middot; US-regulated
          execution
        </p>
        <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-white/20 font-medium uppercase tracking-wider">
          <span>Forbes</span>
          <span>USA Today</span>
          <span>TechBullion</span>
          <span>GBAF</span>
        </div>
      </section>

      {/* ── Chat ── */}
      <section className="flex-1 min-h-0 flex flex-col px-4 pb-4">
        <div className="flex-1 min-h-0 flex flex-col max-w-2xl w-full mx-auto bg-white/[0.015] border border-white/[0.06] rounded-2xl chat-glow overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll p-5 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex animate-slide-up ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-2xl rounded-br-md"
                      : "bg-white/[0.05] text-white/90 rounded-2xl rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white/[0.05] px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                  <span className="typing-dot w-1.5 h-1.5 bg-white/40 rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-white/40 rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-white/40 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 p-3 border-t border-white/[0.06]"
          >
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="shrink-0 px-5 py-3 bg-accent hover:bg-blue-500 disabled:opacity-25 disabled:hover:bg-accent rounded-xl text-sm font-medium transition-all"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
