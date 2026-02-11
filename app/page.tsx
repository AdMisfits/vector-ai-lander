"use client";

import { useState, useEffect, useRef, FormEvent } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
  showCalendar?: boolean;
}

const SAMPLE_PROMPTS = [
  "How did you profit during the crash?",
  "What returns can I expect?",
  "Better than my financial advisor?",
  "Is my money safe?",
];

const CALENDAR_URL = process.env.NEXT_PUBLIC_GHL_CALENDAR_URL ?? "";

function renderMarkdown(text: string) {
  // Strip out the [BOOK_CALL] token before rendering
  const clean = text.replace(/\[BOOK_CALL\]/g, "").trim();
  const parts: (string | JSX.Element)[] = [];
  const lines = clean.split("\n");
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

function CalendarEmbed() {
  if (!CALENDAR_URL) return null;
  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <iframe
        src={CALENDAR_URL}
        className="w-full border-0"
        style={{ height: "650px" }}
        scrolling="no"
      />
    </div>
  );
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
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
          history: updated,
        }),
      });
      const data = await res.json();

      // Detect if AI wants to show the calendar
      const hasBooking = data.response.includes("[BOOK_CALL]");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          showCalendar: hasBooking,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection issue — try sending that again.",
        },
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

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* ── Navbar ── */}
      <nav className="shrink-0 px-6 py-4 flex items-center justify-between">
        <img
          src="/logo.png"
          alt="Vector Algorithmics"
          className="h-8"
        />
        <a
          href={process.env.NEXT_PUBLIC_BOOKING_URL ?? "#chat"}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Book a Strategy Call &rarr;
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-10 pb-3 text-center max-w-3xl mx-auto">
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

      {/* ── Social Proof ── */}
      <section className="px-6 pt-2 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-5 sm:gap-6 text-[13px] text-gray-400 font-medium flex-wrap">
            <span>
              <span className="text-yellow-500">&#9733;</span> 4.6 Trustpilot
            </span>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <span>2,000+ clients</span>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <span>5yr track record</span>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <span>12-mo guarantee</span>
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-8 text-[11px] text-gray-300 font-semibold uppercase tracking-[0.15em]">
            <span>Forbes</span>
            <span>USA Today</span>
            <span>TechBullion</span>
            <span>GBAF</span>
          </div>
        </div>
      </section>

      {/* ── Chat ── */}
      <section id="chat" className="px-4 pb-10 max-w-2xl w-full mx-auto">
        {/* Messages area */}
        {started && (
          <div className="mb-4 max-h-[60vh] overflow-y-auto chat-scroll space-y-4 px-1 transition-all">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex animate-slide-up ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 text-[14px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white rounded-3xl rounded-br-lg"
                        : "bg-white text-gray-800 rounded-3xl rounded-bl-lg shadow-sm border border-gray-200/60"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? renderMarkdown(msg.content)
                      : msg.content}
                  </div>
                </div>
                {/* Calendar embed appears right after the booking message */}
                {msg.showCalendar && <CalendarEmbed />}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white px-4 py-3 rounded-3xl rounded-bl-lg shadow-sm border border-gray-200/60 flex items-center gap-1.5">
                  <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input container */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-[#9B9B9B] shadow-sm p-4 transition-all">
            <div className="flex items-center gap-3">
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
                placeholder="Ask anything about Vector"
                rows={1}
                className="flex-1 text-base text-gray-900 placeholder-gray-400 resize-none focus:outline-none bg-transparent leading-6"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="shrink-0 w-9 h-9 flex items-center justify-center bg-gray-900 hover:bg-black text-white disabled:opacity-20 rounded-full transition-all"
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

            {!started && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {SAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="px-3.5 py-1.5 rounded-full border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
