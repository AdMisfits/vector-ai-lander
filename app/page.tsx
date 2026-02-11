"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const SAMPLE_PROMPTS = [
  "How did you make money during the crash?",
  "What returns can I expect?",
  "How is this different from my financial advisor?",
  "Is my money safe?",
];

/** Lightweight markdown: **bold**, \n → <br> */
function renderMarkdown(text: string) {
  const parts: (string | JSX.Element)[] = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
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
    if (li < lines.length - 1) parts.push(<br key={`br-${li}`} />);
  });
  return parts;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping) inputRef.current?.focus();
  }, [isTyping]);

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;
    if (!started) setStarted(true);

    const updated: Message[] = [
      ...messages,
      { role: "user", content: text.trim() },
    ];
    setMessages(updated);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text.trim(), history: updated }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection issue — try sending that again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  }

  function handlePromptClick(prompt: string) {
    sendMessage(prompt);
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* ── Navbar ── */}
      <nav className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <img
          src="https://cdn.prod.website-files.com/68a2acb1d2d6d27959679417/68a356873e48a99a71975afc_Tree-1.png"
          alt="Vector Algorithmics"
          className="h-8"
        />
        <a
          href={process.env.NEXT_PUBLIC_BOOKING_URL ?? "#chat"}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Book a Strategy Call &rarr;
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-14 pb-4 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight leading-[1.15] text-gray-900">
          Your portfolio shouldn&apos;t need a{" "}
          <br className="hidden sm:block" />
          bull market to grow.
        </h1>
        <p className="mt-4 text-gray-500 text-[17px] leading-relaxed max-w-xl mx-auto">
          Vector&apos;s algorithms trade both directions. When markets dropped
          25% during the tariff crisis, our clients were up 70%.
        </p>
      </section>

      {/* ── Social Proof Bar ── */}
      <section className="px-6 pt-2 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 font-medium">
            <span>
              <span className="text-yellow-500">&#9733;</span> 4.6 Trustpilot
            </span>
            <span className="text-gray-200">|</span>
            <span>2,000+ clients</span>
            <span className="text-gray-200">|</span>
            <span>5yr track record</span>
            <span className="text-gray-200">|</span>
            <span>12-mo guarantee</span>
          </div>
          {/* Press logos */}
          <div className="mt-3 flex items-center justify-center gap-8 text-[11px] text-gray-300 font-semibold uppercase tracking-[0.15em]">
            <span>Forbes</span>
            <span>USA Today</span>
            <span>TechBullion</span>
            <span>GBAF</span>
          </div>
        </div>
      </section>

      {/* ── Chat ── */}
      <section id="chat" className="px-4 pb-10 max-w-2xl w-full mx-auto">
        <div className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white">
          {/* Chat body */}
          <div className="h-[420px] flex flex-col">
            {!started ? (
              /* ── Empty state: sample prompts ── */
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Ask anything about Vector&apos;s trading algorithms
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {SAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Conversation ── */
              <div className="flex-1 overflow-y-auto chat-scroll p-5 space-y-4">
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
                          : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md"
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
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                      <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* ── Input ── */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 p-3 border-t border-gray-100"
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
                  placeholder="Ask anything about Vector..."
                  rows={1}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="shrink-0 p-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 rounded-xl transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
