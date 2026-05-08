"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Zara Malik",
    score: "176/200",
    batch: "2024",
    quote:
      "I used to freeze on Biology MCQs. The Tribe gave me a system. I finished my MDCAT with 7 minutes to spare.",
  },
  {
    name: "Hassan Raza",
    score: "181/200",
    batch: "2024",
    quote:
      "No other platform teaches you how to think under pressure. MDCATEMY changes how you approach every single question.",
  },
  {
    name: "Ayesha Tariq",
    score: "172/200",
    batch: "2024",
    quote:
      "The accountability was everything. My coach checked in on me every week. I never felt like I was preparing alone.",
  },
];

const STATS = [
  { number: "184", label: "Top Score" },
  { number: "100", label: "Per Batch" },
  { number: "2024", label: "Founded" },
];

export default function AuthBrandPanel() {
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonial = TESTIMONIALS[idx];

  return (
    <div className="hidden lg:flex lg:w-[55%] tribal-overlay relative flex-col justify-between p-12 overflow-hidden bg-warrior-black">

      {/* Right edge accent line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-mdcat-yellow/30 to-transparent" />

      {/* Scattered diagonal accent lines — background texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "18%", left: "8%", w: 60, rotate: 42 },
          { top: "72%", left: "6%", w: 40, rotate: 42 },
          { top: "38%", right: "12%", w: 50, rotate: -42 },
          { top: "82%", right: "8%", w: 35, rotate: -42 },
          { top: "12%", right: "28%", w: 28, rotate: 42 },
        ].map((line, i) => (
          <div
            key={i}
            className="absolute h-px bg-mdcat-yellow/10"
            style={{
              top: line.top,
              left: (line as Record<string,unknown>).left as string | undefined,
              right: (line as Record<string,unknown>).right as string | undefined,
              width: line.w,
              transform: `rotate(${line.rotate}deg)`,
            }}
          />
        ))}
      </div>

      {/* ── TOP: Logo ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-3">
          {/* Shield mark */}
          <div
            className="w-8 h-9 bg-mdcat-yellow flex items-center justify-center"
            style={{ clipPath: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)" }}
          >
            <span className="font-poppins font-black text-warrior-black text-xs">M</span>
          </div>
          <div>
            <span className="font-poppins font-black text-[22px] tracking-tight leading-none">
              <span className="text-mdcat-yellow">MDCAT</span>
              <span className="text-white">EMY</span>
            </span>
            <p className="text-warrior-text text-[10px] font-inter font-bold uppercase tracking-[0.18em] mt-0.5">
              Study Tribe
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── CENTER: Geometric emblem + tagline ── */}
      <div className="relative z-10 flex flex-col items-center gap-10">

        {/* Diamond emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative w-60 h-60"
        >
          {/* Outermost diamond */}
          <div
            className="absolute inset-0 border border-mdcat-yellow/12"
            style={{ transform: "rotate(45deg)", borderRadius: "6px" }}
          />
          {/* Mid diamond */}
          <div
            className="absolute inset-7 border border-mdcat-yellow/25"
            style={{ transform: "rotate(45deg)", borderRadius: "4px" }}
          />
          {/* Inner diamond — glowing */}
          <div
            className="absolute inset-14 border border-mdcat-yellow/55"
            style={{
              transform: "rotate(45deg)",
              borderRadius: "3px",
              background: "rgba(255,198,0,0.07)",
              boxShadow: "0 0 40px rgba(255,198,0,0.12), inset 0 0 24px rgba(255,198,0,0.06)",
            }}
          />

          {/* Corner vertex dots */}
          {[
            { top: "-4px", left: "50%", transform: "translateX(-50%)" },
            { bottom: "-4px", left: "50%", transform: "translateX(-50%)" },
            { left: "-4px", top: "50%", transform: "translateY(-50%)" },
            { right: "-4px", top: "50%", transform: "translateY(-50%)" },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-mdcat-yellow rounded-full"
              style={pos as React.CSSProperties}
            />
          ))}

          {/* Axis lines extending outward */}
          <div className="absolute -top-10 left-1/2 w-px h-8 bg-gradient-to-t from-mdcat-yellow/35 to-transparent" style={{ transform: "translateX(-50%)" }} />
          <div className="absolute -bottom-10 left-1/2 w-px h-8 bg-gradient-to-b from-mdcat-yellow/35 to-transparent" style={{ transform: "translateX(-50%)" }} />
          <div className="absolute -left-10 top-1/2 h-px w-8 bg-gradient-to-l from-mdcat-yellow/35 to-transparent" style={{ transform: "translateY(-50%)" }} />
          <div className="absolute -right-10 top-1/2 h-px w-8 bg-gradient-to-r from-mdcat-yellow/35 to-transparent" style={{ transform: "translateY(-50%)" }} />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-poppins font-black text-mdcat-yellow leading-none"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)" }}
            >
              184
            </span>
            <span className="text-warrior-text text-[10px] font-inter font-bold uppercase tracking-[0.14em] mt-1">
              MDCAT Score
            </span>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="text-center"
        >
          <h2 className="font-poppins font-black text-white leading-[1.1]" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Train Like a Warrior.
          </h2>
          <h2 className="font-poppins font-black leading-[1.1]" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            <span className="text-gradient-yellow">Score Like a Legend.</span>
          </h2>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-10"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-poppins font-black text-mdcat-yellow text-xl leading-none">{stat.number}</p>
              <p className="text-warrior-text text-[10px] font-inter font-bold uppercase tracking-[0.12em] mt-1.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── BOTTOM: Rotating testimonial ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-2 mb-4">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-0.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-mdcat-yellow" : "w-2 bg-warrior-border"}`}
            />
          ))}
        </div>

        <div className="callout-yellow bg-dark-charcoal/50 backdrop-blur-sm rounded-r-xl p-5 min-h-[100px]">
          {mounted && (
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-white/75 font-inter text-sm leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-mdcat-yellow font-inter font-bold text-xs">
                    {testimonial.name}
                  </span>
                  <span className="text-warrior-text text-xs font-inter">
                    MDCAT {testimonial.batch} · {testimonial.score}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
