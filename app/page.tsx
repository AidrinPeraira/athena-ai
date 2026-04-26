"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ─── Animated Text (word-by-word reveal) ─────────────────────────────────────

function AnimatedAnswer({ text, key: animKey }: { text: string; key: string }) {
  const words = text.split(" ");
  return (
    <motion.div
      key={animKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.35,
            delay: i * 0.04,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ─── Pulsing dots loader ──────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 justify-center py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400/70"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [history, setHistory] = useState<Message[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [answerKey, setAnswerKey] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newHistory: Message[] = [
      ...history,
      { role: "user", content: trimmed },
    ];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setHasAnswered(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await response.json();
      const assistantMessage = data.content as string;

      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
      setAnswer(assistantMessage);
      setAnswerKey((k) => k + 1);
    } catch {
      setAnswer("Something went wrong. Please try again.");
      setAnswerKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }, [input, history, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(2, 8, 23)"
      gradientBackgroundEnd="rgb(6, 18, 40)"
      firstColor="37, 99, 235"
      secondColor="14, 165, 233"
      thirdColor="79, 70, 229"
      fourthColor="6, 182, 212"
      fifthColor="30, 64, 175"
      pointerColor="99, 102, 241"
      blendingValue="screen"
      size="65%"
      containerClassName="min-h-screen"
    >
      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-[#020c1b]/60 z-10" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main UI */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1L9.5 5H13L10 8.5L11 13L7 10.5L3 13L4 8.5L1 5H4.5L7 1Z"
                  fill="#60a5fa"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <span className="text-slate-300/80 text-sm font-light tracking-[0.2em] uppercase font-mono">
              Clarified AI
            </span>
          </motion.div>

          {/* Answer Area */}
          <div className="w-full min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!hasAnswered && !loading && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-3"
                >
                  <h1
                    className="text-4xl sm:text-5xl font-light text-white/90 tracking-tight leading-tight"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    What's on your mind?
                  </h1>
                  <p className="text-slate-400/70 text-sm tracking-wide">
                    Ask anything — I&apos;ll think, then answer.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ThinkingDots />
                </motion.div>
              )}

              {!loading && hasAnswered && answer && (
                <motion.div
                  key={`answer-${answerKey}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div
                    className="text-lg sm:text-xl leading-relaxed text-slate-100/95 font-light text-center"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    <AnimatedAnswer
                      text={answer}
                      key={`animated-${answerKey}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full"
          >
            {/* Glow wrapper */}
            <div className="relative group">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-cyan-500/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl focus-within:border-blue-400/30 transition-all duration-300">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your question…"
                  disabled={loading}
                  className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none border-none outline-none focus:ring-0 px-5 pt-4 pb-3 text-base leading-relaxed font-light disabled:opacity-50"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {/* Bottom bar */}
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-[10px] text-slate-600 tracking-widest uppercase font-mono">
                    ↵ to send
                  </span>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-500/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium tracking-wide transition-all duration-200 active:scale-95"
                  >
                    {loading ? (
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M6 1L11 6L6 11M11 6H1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Hint */}
            <p className="text-center text-[10px] text-slate-600/60 mt-4 tracking-[0.15em] uppercase font-mono">
              Clarified AI · Context-aware responses
            </p>
          </motion.div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
}
