"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const PROACTIVE_OPENER =
  "Hey — I see you're looking at Vector's automated trading systems. Are you currently trading, or exploring algo trading for the first time?";

/** Lightweight markdown: **bold**, \n → <br> */
function renderMarkdown(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const lines = text.split("\n");

  lines.forEach((line, li) => {
    // Process **bold** within each line
    const segments = line.split(/(\*\*[^*]+\*\*)/g);
    segments.forEach((seg, si) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        parts.push(
          <strong key={`${li}-${si}`} className="font-semibold">
            {seg.slice(2, -2)}
          </strong>
        );
      } else {
        parts.push(seg);
      }
    });
    if (li < lines.length - 1) {
      parts.push(<br key={`br-${li}`} />);
    }
  });

  return parts;
}

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
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* ── Header ── */}
      <header className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="text-base font-bold tracking-wider uppercase text-gray-900">
          Vector
        </span>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-400 font-medium">
          <span className="text-yellow-500">&#9733; 4.6</span>
          <span className="text-gray-200">|</span>
          <span>2,000+ clients</span>
          <span className="text-gray-200">|</span>
          <span>5yr track record</span>
          <span className="text-gray-200">|</span>
          <span>12-mo guarantee</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="shrink-0 px-6 pt-12 pb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900">
          Automated trading that profits
          <br className="hidden sm:block" />{" "}
          <span className="text-blue-600">in any market.</span>
        </h1>
        <p className="mt-3 text-gray-500 text-base max-w-lg mx-auto">
          Market-neutral algorithms that capture gains whether markets rise or
          fall. No leverage. US-regulated execution.
        </p>
        <div className="mt-5 flex items-center justify-center gap-6 text-[11px] text-gray-300 font-semibold uppercase tracking-widest">
          <span>Forbes</span>
          <span>USA Today</span>
          <span>TechBullion</span>
          <span>GBAF</span>
        </div>
      </section>

      {/* ── Chat ── */}
      <section className="px-4 pb-8 max-w-2xl w-full mx-auto">
        <div className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-gray-50/50">
          {/* Chat header */}
          <div className="px-5 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm font-medium text-gray-700">
                Vector AI
              </span>
              <span className="text-xs text-gray-400">— Ask me anything</span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[380px] overflow-y-auto chat-scroll p-5 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex animate-slide-up ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 text-[14px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
                      : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                  }`}
                >
                  {msg.role === "assistant"
                    ? renderMarkdown(msg.content)
                    : msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 flex items-center gap-1.5">
                  <span className="typing-dot w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 p-3 border-t border-gray-100 bg-white"
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
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 disabled:hover:bg-blue-600 rounded-xl text-sm font-medium transition-all"
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
