"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Flame, TrendingUp, TrendingDown,
  ChevronRight, BookOpen, X,
  Zap, Layers, Calendar,
  BookMarked, AlertCircle, ClipboardList,
} from "lucide-react";
import { SUBJECTS, MDCAT_WEIGHTS } from "@/lib/analytics-data";
import { CircularRing } from "@/components/dashboard/CircularRing";

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const MDCAT_DATE = new Date("2026-08-08T09:00:00");
const STUDENT_NAME = "Hayan";
const TESTS_ATTEMPTED = 3;

const DAILY_WISDOM = [
  { text: "So, surely with hardship comes ease.", source: "Surah Ash-Sharh 94:5", type: "quran" },
  { text: "Allah does not burden a soul beyond that it can bear.", source: "Surah Al-Baqarah 2:286", type: "quran" },
  { text: "And He found you lost and guided you.", source: "Surah Ad-Duha 93:7", type: "quran" },
  { text: "Verily, after difficulty comes ease.", source: "Surah Al-Inshirah 94:6", type: "quran" },
  { text: "The secret of getting ahead is getting started.", source: "Mark Twain", type: "quote" },
  { text: "It does not matter how slowly you go as long as you do not stop.", source: "Confucius", type: "quote" },
  { text: "Success is not final. Failure is not fatal. It is the courage to continue that counts.", source: "Winston Churchill", type: "quote" },
  { text: "The expert in anything was once a beginner.", source: "Helen Hayes", type: "quote" },
];

const PREDICTED_SCORE = Math.round(
  SUBJECTS.reduce((sum, s, i) => sum + (s.accuracy / 100) * MDCAT_WEIGHTS[i], 0)
);

const TREND = [
  { label: "M", acc: 61 }, { label: "T", acc: 55 }, { label: "W", acc: 68 },
  { label: "T", acc: 72 }, { label: "F", acc: 65 }, { label: "S", acc: 78 },
  { label: "S", acc: 67 },
];

const HEATMAP = Array.from({ length: 60 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (59 - i));
  const seed = ((i * 2654435761) >>> 0) % 1000;
  const mcqs = seed < 150 ? 0 : seed < 400 ? Math.floor(seed / 30) + 5 : Math.floor(seed / 15) + 15;
  return { date, mcqs: Math.min(mcqs, 90) };
});

const TOTAL_MCQS = SUBJECTS.reduce((s, sub) => s + sub.mcqs, 0);
const OVERALL_ACCURACY = Math.round(
  SUBJECTS.reduce((s, sub) => s + sub.accuracy * sub.mcqs, 0) / TOTAL_MCQS
);
const STREAK_DAYS = 12;

const LEADERBOARD = [
  { name: "Mustabshera Noor",  score: 199, initials: "MN", color: "#A78BFA" },
  { name: "Jahanzeb Khan",     score: 199, initials: "JK", color: "#38BDF8" },
  { name: "Habiba Ijaz",       score: 198, initials: "HI", color: "#F472B6" },
  { name: "Noor Zulfiqar",     score: 198, initials: "NZ", color: "#10B981" },
  { name: "Ayesha Zahid",      score: 197, initials: "AZ", color: "#FB923C" },
  { name: "Muskan Mubashir",   score: 197, initials: "MM", color: "#F472B6" },
  { name: "Aneel Aneel",       score: 196, initials: "AA", color: "#38BDF8" },
  { name: "Mohsin Raza",       score: 194, initials: "MR", color: "#10B981" },
  { name: "Shaheer Ahmed",     score: 193, initials: "SA", color: "#A78BFA" },
  { name: "Mian Hamza Jan",    score: 192, initials: "MH", color: "#FFC600" },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function heatColor(mcqs: number) {
  if (mcqs === 0) return "bg-warrior-border";
  if (mcqs < 10) return "bg-mdcat-yellow/20";
  if (mcqs < 30) return "bg-mdcat-yellow/45";
  if (mcqs < 60) return "bg-mdcat-yellow/70";
  return "bg-mdcat-yellow";
}

function scoreColor(acc: number) {
  if (acc >= 70) return "text-emerald-400";
  if (acc >= 55) return "text-amber-400";
  return "text-red-400";
}

function countDown(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN RIBBON
═══════════════════════════════════════════════════════════ */
function CountdownRibbon({ target }: { target: Date }) {
  const [t, setT] = useState(countDown(target));
  useEffect(() => {
    const id = setInterval(() => setT(countDown(target)), 60000);
    return () => clearInterval(id);
  }, [target]);

  const urgent = t.days <= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-warrior-black border-2 border-mdcat-yellow rounded-full pl-2 pr-3.5 py-1.5 flex items-center gap-2.5 shadow-[3px_3px_0px_rgba(255,198,0,0.3)]"
    >
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #FFC600 0 6px, transparent 6px 14px)" }}
      />
      <motion.div
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
        className="relative w-7 h-7 bg-mdcat-yellow border-2 border-warrior-black rounded-full flex items-center justify-center flex-shrink-0 shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.5)]"
      >
        <Calendar size={13} className="text-warrior-black" strokeWidth={3} />
      </motion.div>
      <div className="relative flex items-baseline gap-1.5">
        <span className={`font-poppins font-black text-[20px] leading-none ${urgent ? "text-red-400" : "text-mdcat-yellow"}`}>
          {t.days}
        </span>
        <span className="text-[9px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text">days</span>
      </div>
      <div className="relative w-px h-5 bg-mdcat-yellow/30" />
      <span className="relative text-white font-poppins font-black text-[11px] leading-none whitespace-nowrap">
        {String(t.hours).padStart(2, "0")}h {String(t.minutes).padStart(2, "0")}m
      </span>
      <div className="relative flex-1 min-w-0 flex justify-end">
        <span className="text-warrior-text text-[8.5px] font-inter font-black uppercase tracking-[0.14em] leading-none whitespace-nowrap hidden sm:inline">
          to MDCAT · Aug 8
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INLINE COUNTDOWN — compact numbers row
═══════════════════════════════════════════════════════════ */
function InlineCountdown({ target }: { target: Date }) {
  const [t, setT] = useState(countDown(target));
  useEffect(() => {
    const id = setInterval(() => setT(countDown(target)), 60000);
    return () => clearInterval(id);
  }, [target]);
  const urgent = t.days <= 30;
  return (
    <div className="flex items-center gap-1 bg-dark-charcoal border border-warrior-border rounded-xl px-2.5 py-1.5">
      <span className={`font-poppins font-black text-[13px] leading-none ${urgent ? "text-red-400" : "text-white"}`}>{t.days}</span>
      <span className="text-[9px] font-inter text-warrior-text mr-0.5">d</span>
      <span className="font-poppins font-black text-[13px] leading-none text-white">{String(t.hours).padStart(2, "0")}</span>
      <span className="text-[9px] font-inter text-warrior-text mr-0.5">h</span>
      <span className="font-poppins font-black text-[13px] leading-none text-white">{String(t.minutes).padStart(2, "0")}</span>
      <span className="text-[9px] font-inter text-warrior-text">m</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MINI SCORE BADGE
═══════════════════════════════════════════════════════════ */
function MiniScoreBadge({ score, max, onClick }: { score: number; max: number; onClick: () => void }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const cx = 17; const cy = 17; const r = 14;
  const arcLen = Math.PI * r;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const angle = Math.PI * (1 - pct / 100);
  const needleX = cx + r * Math.cos(angle);
  const needleY = cy - r * Math.sin(angle);

  return (
    <motion.button
      onClick={onClick}
      aria-label="Open score predictor"
      animate={{ x: [0, -3, 3, -2, 2, 0] }}
      transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
      whileTap={{ scale: 0.95 }}
      className="group inline-flex items-center gap-2 bg-dark-charcoal border-2 border-warrior-border hover:border-mdcat-yellow rounded-xl pl-2 pr-3 py-1.5 shadow-[3px_3px_0px_rgba(255,198,0,0.12)] hover:shadow-[1px_1px_0px_rgba(255,198,0,0.18)] active:scale-95 transition-colors duration-150 flex-shrink-0"
    >
      <svg width={34} height={20} viewBox="0 0 34 20" className="overflow-visible">
        <defs>
          <linearGradient id="mini-gauge-grad" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#D9534F" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#28A745" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="rgb(var(--warrior-border-rgb))" strokeWidth="3" strokeLinecap="round" />
        <path d={d} fill="none" stroke="url(#mini-gauge-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray={arcLen} strokeDashoffset={arcLen * (1 - pct / 100)} />
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#FFC600" strokeWidth={2} strokeLinecap="round" />
        <circle cx={needleX} cy={needleY} r={2.8} fill="#FFC600" stroke="rgb(var(--warrior-black-rgb))" strokeWidth={1.2} />
        <circle cx={cx} cy={cy} r={2} fill="#FFC600" stroke="rgb(var(--warrior-black-rgb))" strokeWidth={1} />
      </svg>
      <span className="font-poppins font-black text-[14px] text-white group-hover:text-mdcat-yellow transition-colors leading-none">
        {score}
      </span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCORE GAUGE (modal)
═══════════════════════════════════════════════════════════ */
function ScoreGauge({ score, max, target }: { score: number; max: number; target: number }) {
  const W = 280; const H = 170;
  const cx = W / 2; const cy = 140;
  const r = 108; const stroke = 18;
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const targetPct = Math.min(100, Math.max(0, (target / max) * 100));
  const arcLen = Math.PI * r;
  const polar = (p: number) => {
    const a = Math.PI * (1 - p / 100);
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };
  const needle = polar(pct);
  const tgt = polar(targetPct);
  const startX = cx - r; const endX = cx + r;
  const d = `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;

  return (
    <div className="relative w-full flex justify-center">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible max-w-[320px]">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D9534F" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#28A745" />
          </linearGradient>
          <filter id="gauge-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <path d={d} fill="none" stroke="rgb(var(--warrior-border-rgb))" strokeWidth={stroke} strokeLinecap="round" />
        <motion.path d={d} fill="none" stroke="url(#gauge-grad)" strokeWidth={stroke} strokeLinecap="round" style={{ strokeDasharray: arcLen }} initial={{ strokeDashoffset: arcLen }} whileInView={{ strokeDashoffset: arcLen * (1 - pct / 100) }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} />
        <motion.g initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 1.1 }}>
          <circle cx={tgt.x} cy={tgt.y} r={6} fill="#FFC600" stroke="rgb(var(--dark-charcoal-rgb))" strokeWidth={3} />
        </motion.g>
        <motion.g initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 1.3, type: "spring", stiffness: 200 }}>
          <circle cx={needle.x} cy={needle.y} r={11} fill="#FFC600" opacity={0.25} filter="url(#gauge-glow)" />
          <circle cx={needle.x} cy={needle.y} r={8} fill="#FFFFFF" stroke="rgb(var(--warrior-black-rgb))" strokeWidth={3} />
        </motion.g>
        <text x={startX} y={cy + 22} textAnchor="middle" fill="rgb(var(--warrior-text-rgb))" fontSize="11" fontFamily="Inter" fontWeight="600">0</text>
        <text x={endX} y={cy + 22} textAnchor="middle" fill="rgb(var(--warrior-text-rgb))" fontSize="11" fontFamily="Inter" fontWeight="600">{max}</text>
      </svg>
      <div className="absolute inset-x-0 top-[44%] -translate-y-1/2 flex flex-col items-center pointer-events-none">
        <div className="flex items-baseline gap-1.5">
          <span className="font-poppins font-black text-4xl text-mdcat-yellow leading-none">{score}</span>
          <span className="font-inter text-warrior-text text-sm">/ {max}</span>
        </div>
        <span className={`text-[11px] font-poppins font-black mt-1 ${scoreColor(Math.round((score / max) * 100))}`}>
          {Math.round((score / max) * 100)}%
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCORE PREDICTOR MODAL — bottom sheet with leaderboard
═══════════════════════════════════════════════════════════ */
function ScorePredictorModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = prev; };
  }, [onClose]);

  const studentsAhead = 15582;
  const userRank = studentsAhead + 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-dark-charcoal border-2 border-warrior-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[88vh] flex flex-col shadow-[0_-8px_40px_rgba(255,198,0,0.1)] sm:shadow-[6px_6px_0px_rgba(255,198,0,0.18)]"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-warrior-border rounded-full" />
        </div>

        {/* Fixed header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-warrior-border flex-shrink-0">
          <div>
            <p className="text-[9px] font-poppins font-black uppercase tracking-[0.16em] text-mdcat-yellow">MDCAT Score Predictor</p>
            <p className="text-warrior-text text-[11px] font-inter mt-0.5">Based on your practice accuracy</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-warrior-black border border-warrior-border rounded-lg flex items-center justify-center text-warrior-text hover:text-white transition-colors"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Single scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Score predictor section ── */}
          <div className="px-5 pt-4 pb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-poppins font-black uppercase tracking-[0.1em] text-warrior-text">Your Prediction</p>
              <div className="text-right">
                <p className="text-[10px] font-poppins font-black uppercase tracking-[0.1em] text-warrior-text">Target</p>
                <p className="font-poppins font-black text-white text-lg leading-none">175</p>
              </div>
            </div>

            <ScoreGauge score={PREDICTED_SCORE} max={210} target={175} />

            {/* Subject breakdown */}
            <div className="flex flex-wrap gap-2 mt-4">
              {SUBJECTS.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 bg-warrior-black border border-warrior-border rounded-xl px-2.5 py-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-poppins font-black text-warrior-text">{s.short}</span>
                  <span className="text-[10px] font-inter text-white font-bold">{Math.round((s.accuracy / 100) * MDCAT_WEIGHTS[i])}</span>
                  <span className="text-[10px] font-inter text-warrior-text">/ {MDCAT_WEIGHTS[i]}</span>
                </div>
              ))}
            </div>

            {/* Algorithm button */}
            <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-warrior-border bg-warrior-black/40 hover:border-mdcat-yellow/40 hover:bg-warrior-black/60 text-warrior-text hover:text-white text-[12px] font-poppins font-black uppercase tracking-[0.08em] transition-all active:scale-[0.99]">
              <BookOpen size={13} className="text-mdcat-yellow" />
              See Score Predictor Algorithm
            </button>
          </div>

          {/* ── Leaderboard section ── */}
          <div className="border-t-2 border-warrior-border">
            {/* Section header */}
            <div className="px-5 py-3.5 bg-warrior-black/40 border-b border-warrior-border">
              <p className="text-[9px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text mb-0.5">Leaderboard</p>
              <p className="font-poppins font-black text-white text-[14px] leading-tight">
                {studentsAhead.toLocaleString()} students ahead of you
              </p>
              <p className="text-warrior-text font-inter text-[11px] mt-0.5">
                Your rank: <span className="text-mdcat-yellow font-bold">#{userRank.toLocaleString()}</span> · Keep pushing!
              </p>
            </div>

            {/* Student rows */}
            <div className="divide-y divide-warrior-border/50">
              {LEADERBOARD.map((student, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-warrior-gray/10 transition-colors">
                  <span className="w-5 text-[11px] font-poppins font-black text-warrior-text text-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-poppins font-black text-warrior-black"
                    style={{ backgroundColor: student.color }}
                  >
                    {student.initials}
                  </div>
                  <span className="flex-1 font-inter text-[13px] text-white font-semibold truncate">{student.name}</span>
                  <span className="font-poppins font-black text-[15px] text-white flex-shrink-0">{student.score}</span>
                </div>
              ))}
            </div>

            {/* User's own row — pinned at bottom of list */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-mdcat-yellow/10 border-t-2 border-mdcat-yellow/40">
              <span className="w-5 text-[11px] font-poppins font-black text-mdcat-yellow text-center flex-shrink-0">
                —
              </span>
              <div className="w-8 h-8 rounded-full bg-mdcat-yellow flex items-center justify-center flex-shrink-0 text-[11px] font-poppins font-black text-warrior-black">
                HK
              </div>
              <span className="flex-1 font-inter text-[13px] text-mdcat-yellow font-bold truncate">You · Hayan</span>
              <span className="font-poppins font-black text-[15px] text-mdcat-yellow flex-shrink-0">{PREDICTED_SCORE}</span>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PERFORMANCE POPUP
═══════════════════════════════════════════════════════════ */
function PerformancePopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = prev; };
  }, [onClose]);

  const trendMax = Math.max(...TREND.map((t) => t.acc));
  const delta = TREND[TREND.length - 1].acc - TREND[0].acc;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()} className="relative bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 pt-6 shadow-[6px_6px_0px_rgba(255,198,0,0.22)] w-full max-w-sm">
        <button onClick={onClose} aria-label="Close" className="absolute -top-3 -right-3 w-10 h-10 bg-mdcat-yellow border-2 border-warrior-black rounded-full shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.55)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-90 transition-all duration-150 flex items-center justify-center z-10">
          <X size={18} className="text-warrior-black" strokeWidth={3.5} />
        </button>
        <div className="mb-4 pr-8">
          <p className="text-[10px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text">Performance</p>
          <p className="text-white font-poppins font-black text-[18px] leading-tight mt-0.5">Last 7 Sessions</p>
        </div>
        <div className="flex items-end gap-2 h-[120px]">
          {TREND.map((t, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-inter font-bold ${scoreColor(t.acc)}`}>{t.acc}%</span>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(t.acc / trendMax) * 85}px` }} transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }} className="w-full rounded-t-md" style={{ background: t.acc >= 70 ? "#10B981" : t.acc >= 55 ? "#FFA500" : "#D9534F", opacity: i === TREND.length - 1 ? 1 : 0.65 }} />
              <span className="text-[10px] font-inter text-warrior-text">{t.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-warrior-border flex items-center gap-4">
          {delta >= 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-400"><TrendingUp size={14} /><span className="text-xs font-inter font-bold">+{delta}% this week</span></div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-400"><TrendingDown size={14} /><span className="text-xs font-inter font-bold">{delta}% this week</span></div>
          )}
          <span className="text-warrior-text text-[11px] font-inter">Avg: {Math.round(TREND.reduce((s, t) => s + t.acc, 0) / TREND.length)}%</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACTIVITY POPUP
═══════════════════════════════════════════════════════════ */
function RecentActivityWidget({ heatmap, streakDays }: { heatmap: { date: Date; mcqs: number }[]; streakDays: number }) {
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sliced = heatmap.slice(-7);
  const today = new Date();
  const LEGEND = [
    { label: "0 MCQs", cls: "bg-warrior-border" },
    { label: "1–9", cls: "bg-mdcat-yellow/20" },
    { label: "10–29", cls: "bg-mdcat-yellow/45" },
    { label: "30–59", cls: "bg-mdcat-yellow/70" },
    { label: "60+", cls: "bg-mdcat-yellow" },
  ];
  function isSameDay(a: Date, b: Date) {
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-inter font-black uppercase tracking-[0.14em] text-warrior-text">Last 7 Days</span>
        <div className="flex items-center gap-1.5 text-orange-400"><Flame size={13} /><span className="text-[12px] font-inter font-black">{streakDays}d streak</span></div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {sliced.map((d, i) => {
          const isToday = isSameDay(d.date, today);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }} className={`rounded-lg py-2 px-0.5 flex flex-col items-center gap-1 border transition-colors ${isToday ? "border-mdcat-yellow/60" : "border-warrior-border"} ${heatColor(d.mcqs)}`}>
              <span className="text-[8px] font-inter font-black uppercase tracking-tight text-warrior-text">{DAY_NAMES[d.date.getDay()]}</span>
              <span className="text-[8px] font-inter text-warrior-text">{d.date.getDate()}</span>
              <span className={`font-poppins font-black text-[13px] leading-none ${d.mcqs > 0 ? "text-white" : "text-warrior-border"}`}>{d.mcqs}</span>
              <span className="text-[7px] font-inter text-warrior-text">MCQs</span>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <span className="text-[10px] font-inter text-warrior-text">Activity:</span>
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-sm border border-warrior-border ${l.cls}`} />
            <span className="text-[10px] font-inter text-warrior-text">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()} className="relative bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 pt-6 shadow-[6px_6px_0px_rgba(255,198,0,0.22)] w-full max-w-sm">
        <button onClick={onClose} aria-label="Close" className="absolute -top-3 -right-3 w-10 h-10 bg-mdcat-yellow border-2 border-warrior-black rounded-full shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.55)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-90 transition-all duration-150 flex items-center justify-center z-10">
          <X size={18} className="text-warrior-black" strokeWidth={3.5} />
        </button>
        <div className="mb-4 pr-8">
          <p className="text-[10px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text">Today</p>
          <p className="text-white font-poppins font-black text-[18px] leading-tight mt-0.5">Recent Activity</p>
        </div>
        <RecentActivityWidget heatmap={HEATMAP} streakDays={STREAK_DAYS} />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PERFORMANCE STAT CARD (3-up grid in Performance tab)
═══════════════════════════════════════════════════════════ */
function PerfStatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-warrior-black border-2 border-warrior-border rounded-2xl p-3 flex flex-col items-center gap-2 shadow-[2px_2px_0px_rgba(255,198,0,0.08)]"
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, border: `1.5px solid ${color}50` }}
      >
        <Icon size={17} style={{ color }} strokeWidth={2.4} />
      </div>
      <p className="font-poppins font-black text-[21px] text-white leading-none">{value}</p>
      <p className="text-[9px] font-poppins font-black uppercase tracking-[0.06em] text-warrior-text text-center leading-tight">
        {label}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BIG MODULE CARD (Quiz Builder / Mock Test Sessions)
═══════════════════════════════════════════════════════════ */
function BigModuleCard({
  badge,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  ctaLabel,
  ctaHref,
  info,
  featured,
  index,
}: {
  badge: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  info: string;
  featured?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link href={ctaHref} className="block">
        <div
          className={`relative bg-dark-charcoal rounded-2xl p-4 border-2 transition-all duration-150 active:scale-[0.985] ${
            featured
              ? "border-mdcat-yellow shadow-[4px_4px_0px_rgba(255,198,0,0.25)] hover:shadow-[2px_2px_0px_rgba(255,198,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px]"
              : "border-warrior-border shadow-[3px_3px_0px_rgba(255,198,0,0.1)] hover:border-warrior-border/80 hover:bg-warrior-gray/10"
          }`}
        >
          {featured && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse 100% 80% at 0% 0%, rgba(255,198,0,0.10), transparent 65%)" }}
            />
          )}
          <p className="relative text-[9px] font-poppins font-black uppercase tracking-[0.18em] text-mdcat-yellow mb-2.5">
            {badge}
          </p>
          <div className="relative flex items-start gap-3 mb-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{ backgroundColor: iconBg, borderColor: `${iconColor}40` }}
            >
              <Icon size={22} style={{ color: iconColor }} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-poppins font-black text-[16px] text-white leading-tight">{title}</p>
              <p className="text-warrior-text font-inter text-[11px] mt-1 leading-snug">{description}</p>
            </div>
          </div>
          <div className="relative flex items-center justify-between">
            <span className="text-warrior-text font-inter text-[11px]">{info}</span>
            <span className="flex items-center gap-1 text-mdcat-yellow font-poppins font-black text-[12px]">
              {ctaLabel} <ChevronRight size={13} strokeWidth={3} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STUDY TOOLS CARD — Saved Copy + Mistakes
═══════════════════════════════════════════════════════════ */
function StudyToolsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: 0.12 }}
      className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl overflow-hidden shadow-[3px_3px_0px_rgba(255,198,0,0.1)]"
    >
      <div className="flex divide-x-2 divide-warrior-border">
        {/* Saved Copy */}
        <Link href="/dashboard/saved" className="flex-1 p-4 hover:bg-warrior-gray/20 active:bg-warrior-gray/30 transition-colors group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 border"
            style={{ backgroundColor: "rgba(255,198,0,0.12)", borderColor: "rgba(255,198,0,0.30)" }}
          >
            <BookMarked size={18} className="text-mdcat-yellow" strokeWidth={2.3} />
          </div>
          <p className="font-poppins font-black text-[14px] text-white leading-tight">Saved Copy</p>
          <p className="text-warrior-text font-inter text-[11px] mt-1 leading-snug">Your bookmarked MCQs</p>
          <div className="flex items-center gap-1 mt-3 text-mdcat-yellow text-[11px] font-poppins font-black">
            Review <ChevronRight size={12} strokeWidth={3} />
          </div>
        </Link>

        {/* Mistakes */}
        <Link href="/dashboard/mistakes" className="flex-1 p-4 hover:bg-warrior-gray/20 active:bg-warrior-gray/30 transition-colors group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 border"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.30)" }}
          >
            <AlertCircle size={18} className="text-red-400" strokeWidth={2.3} />
          </div>
          <p className="font-poppins font-black text-[14px] text-white leading-tight">Mistakes</p>
          <p className="text-warrior-text font-inter text-[11px] mt-1 leading-snug">Review wrong answers</p>
          <div className="flex items-center gap-1 mt-3 text-red-400 text-[11px] font-poppins font-black">
            Fix it <ChevronRight size={12} strokeWidth={3} />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
═══════════════════════════════════════════════════════════ */
export default function DashboardHome() {
  const [activeTab, setActiveTab] = useState<"performance" | "preparation">("performance");
  const [scoreOpen, setScoreOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  const wisdom = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return DAILY_WISDOM[dayOfYear % DAILY_WISDOM.length];
  }, []);

  return (
    <div className="px-4 lg:px-8 py-4 space-y-4 max-w-5xl mx-auto">

      {/* ── WELCOME + SCORE BADGE ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-warrior-text text-[11px] font-poppins font-black uppercase tracking-[0.18em] mb-1">
            Welcome Warrior
          </p>
          <h1 className="font-poppins font-black text-white leading-tight" style={{ fontSize: "clamp(1.5rem, 3.2vw, 2rem)" }}>
            {STUDENT_NAME}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-mdcat-yellow text-warrior-black border-2 border-warrior-black rounded-full px-2.5 py-0.5 font-poppins font-black text-[11px] shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
              <Flame size={11} strokeWidth={3} fill="currentColor" />
              {STREAK_DAYS} day streak
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <MiniScoreBadge score={PREDICTED_SCORE} max={210} onClick={() => setScoreOpen(true)} />
          <InlineCountdown target={MDCAT_DATE} />
        </div>
      </motion.div>

      {/* ── DAILY WISDOM ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="border-l-[3px] border-mdcat-yellow pl-3 py-0.5"
      >
        <p className="text-white font-inter text-[12px] leading-snug italic">
          &ldquo;{wisdom.text}&rdquo;
        </p>
        <p className="text-warrior-text text-[10px] font-inter mt-0.5">— {wisdom.source}</p>
      </motion.div>

      {/* ── OVERVIEW WITH TABS ───────────────────── */}
      <div>
        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-poppins font-black text-white text-[13px] uppercase tracking-[0.1em]">
            Overview
          </h2>
          <Link
            href="/dashboard/analytics"
            className="text-mdcat-yellow text-[11px] font-poppins font-black hover:underline flex items-center gap-0.5"
          >
            See Detailed Analytics <ChevronRight size={11} strokeWidth={3} />
          </Link>
        </div>

        {/* Tab selector */}
        <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-1 flex gap-1 mb-3">
          <button
            onClick={() => setActiveTab("performance")}
            className={`flex-1 py-2 px-3 rounded-xl font-poppins font-black text-[13px] transition-all duration-200 ${
              activeTab === "performance"
                ? "bg-mdcat-yellow text-warrior-black shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"
                : "text-warrior-text hover:text-white"
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab("preparation")}
            className={`flex-1 py-2 px-3 rounded-xl font-poppins font-black text-[13px] transition-all duration-200 ${
              activeTab === "preparation"
                ? "bg-mdcat-yellow text-warrior-black shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"
                : "text-warrior-text hover:text-white"
            }`}
          >
            Preparation
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "performance" && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 gap-2.5"
            >
              <PerfStatCard
                icon={BookOpen}
                value={TOTAL_MCQS.toLocaleString()}
                label="MCQs Attempted"
                color="#FFC600"
              />
              <PerfStatCard
                icon={ClipboardList}
                value={String(TESTS_ATTEMPTED)}
                label="Tests Attempted"
                color="#A78BFA"
              />
              <PerfStatCard
                icon={TrendingUp}
                value={`${OVERALL_ACCURACY}%`}
                label="Overall Accuracy"
                color="#10B981"
              />
            </motion.div>
          )}

          {activeTab === "preparation" && (
            <motion.div
              key="preparation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-4 shadow-[3px_3px_0px_rgba(255,198,0,0.08)]"
            >
              <div
                className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-0"
                style={{ scrollbarWidth: "none" } as React.CSSProperties}
              >
                {SUBJECTS.map((s, i) => (
                  <Link
                    key={s.slug}
                    href={`/dashboard/analytics/${s.slug}`}
                    className="flex-shrink-0 lg:flex-shrink"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-1.5 py-1 w-[80px] lg:w-full"
                    >
                      <div className="relative">
                        <CircularRing
                          percent={s.accuracy}
                          color={s.color}
                          size={74}
                          strokeWidth={6}
                        />
                      </div>
                      <p className="font-poppins font-black text-[10px] text-white text-center leading-tight">
                        {s.name}
                      </p>
                      <span className="font-inter text-[9px] text-warrior-text">{s.mcqs} MCQs</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── QUIZ BUILDER ─────────────────────────── */}
      <BigModuleCard
        badge="Unlimited Practice"
        icon={Zap}
        iconColor="#FFC600"
        iconBg="rgba(255,198,0,0.14)"
        title="Quiz Builder"
        description="Custom MCQ sessions by subject, chapter, or difficulty."
        ctaLabel="Start a Quiz"
        ctaHref="/dashboard/quiz"
        info={`5 subjects · ${TOTAL_MCQS.toLocaleString()}+ MCQs`}
        featured
        index={0}
      />

      {/* ── MOCK TEST SESSIONS ───────────────────── */}
      <BigModuleCard
        badge="Real Exam Simulation"
        icon={Layers}
        iconColor="#A78BFA"
        iconBg="rgba(167,139,250,0.14)"
        title="Mock Test Sessions"
        description="Simulate official MDCAT under timed, exam-day conditions."
        ctaLabel="Take a Test"
        ctaHref="/dashboard/test-series"
        info={`Timed · ${TESTS_ATTEMPTED} attempted`}
        index={1}
      />

      {/* ── SAVED COPY + MISTAKES ────────────────── */}
      <StudyToolsCard />

      <div className="h-4" />

      <AnimatePresence>
        {scoreOpen && <ScorePredictorModal onClose={() => setScoreOpen(false)} />}
        {performanceOpen && <PerformancePopup onClose={() => setPerformanceOpen(false)} />}
        {activityOpen && <ActivityPopup onClose={() => setActivityOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
