"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame, Target, CheckCircle, TrendingUp, TrendingDown,
  BarChart2, ChevronRight, ChevronLeft, X, ChevronDown,
} from "lucide-react";
import { SUBJECTS, MDCAT_WEIGHTS, computeSubjectDelta, type TrendPeriod } from "@/lib/analytics-data";
import { CircularRing } from "@/components/dashboard/CircularRing";

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const PREDICTED_SCORE = Math.round(
  SUBJECTS.reduce((sum, s, i) => sum + (s.accuracy / 100) * MDCAT_WEIGHTS[i], 0)
);

const ALL_WEAK_TOPICS = [
  { subject: "Biology",           chapter: "Cell Biology",           topic: "Meiosis II",        accuracy: 28, color: "#10B981" },
  { subject: "Chemistry",         chapter: "Electrochemistry",       topic: "Galvanic Cells",     accuracy: 31, color: "#38BDF8" },
  { subject: "Logical Reasoning", chapter: "Patterns",               topic: "Number Series",      accuracy: 38, color: "#FB923C" },
  { subject: "Physics",           chapter: "Optics",                 topic: "Doppler Effect",     accuracy: 42, color: "#A78BFA" },
  { subject: "Chemistry",         chapter: "Thermochemistry",        topic: "Gibbs Free Energy",  accuracy: 44, color: "#38BDF8" },
  { subject: "Biology",           chapter: "Genetics & Inheritance", topic: "Mutations",          accuracy: 47, color: "#10B981" },
  { subject: "Physics",           chapter: "Waves & Sound",          topic: "Superposition",      accuracy: 49, color: "#A78BFA" },
  { subject: "English",           chapter: "Vocabulary",             topic: "Analogies",          accuracy: 51, color: "#F472B6" },
  { subject: "Chemistry",         chapter: "Chemical Equilibrium",   topic: "Buffer Solutions",   accuracy: 53, color: "#38BDF8" },
  { subject: "Biology",           chapter: "Evolution",              topic: "Speciation",         accuracy: 55, color: "#10B981" },
  { subject: "Physics",           chapter: "Nuclear Physics",        topic: "Fission & Fusion",   accuracy: 57, color: "#A78BFA" },
  { subject: "Logical Reasoning", chapter: "Spatial Reasoning",      topic: "Paper Folding",      accuracy: 59, color: "#FB923C" },
];
const WEAK_TOPICS = ALL_WEAK_TOPICS.slice(0, 4);

// 30 quiz sessions (one per day) — deterministic accuracy from seed
type TrendEntry = { date: Date; acc: number };
const TREND: TrendEntry[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const seed = ((i * 2246822519 + 374761393) >>> 0) % 100;
  const acc = 45 + (seed % 45); // 45-89
  return { date, acc };
});

// 60-day MCQ activity — deterministic from index
type HeatEntry = { date: Date; mcqs: number };
const HEATMAP: HeatEntry[] = Array.from({ length: 60 }, (_, i) => {
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
const TODAY_MCQS = 23;
const DAILY_GOAL = 50;

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function scoreColor(acc: number) {
  if (acc >= 70) return "text-emerald-400";
  if (acc >= 55) return "text-amber-400";
  return "text-red-400";
}

// Tiered styling for heatmap day boxes — designed for AA contrast
function heatStyle(mcqs: number) {
  if (mcqs === 0) return {
    bg: "bg-warrior-black",
    border: "border-warrior-border",
    label: "text-warrior-text/55",
    num: "text-warrior-border",
    unit: "text-warrior-text/40",
  };
  if (mcqs < 10) return {
    bg: "bg-mdcat-yellow/15",
    border: "border-mdcat-yellow/25",
    label: "text-warrior-text",
    num: "text-white",
    unit: "text-warrior-text",
  };
  if (mcqs < 30) return {
    bg: "bg-mdcat-yellow/35",
    border: "border-mdcat-yellow/45",
    label: "text-white/75",
    num: "text-white",
    unit: "text-white/60",
  };
  if (mcqs < 60) return {
    bg: "bg-mdcat-yellow/70",
    border: "border-mdcat-yellow/80",
    label: "text-warrior-black/70",
    num: "text-warrior-black",
    unit: "text-warrior-black/65",
  };
  return {
    bg: "bg-mdcat-yellow",
    border: "border-mdcat-yellow",
    label: "text-warrior-black/75",
    num: "text-warrior-black",
    unit: "text-warrior-black/65",
  };
}

function fmtRange(items: { date: Date }[]) {
  if (items.length === 0) return "";
  const a = items[0].date;
  const b = items[items.length - 1].date;
  const left  = `${MONTH_SHORT[a.getMonth()]} ${a.getDate()}`;
  const right = a.getMonth() === b.getMonth()
    ? `${b.getDate()}`
    : `${MONTH_SHORT[b.getMonth()]} ${b.getDate()}`;
  return `${left} – ${right}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════════ */
function SectionHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-poppins font-black text-white text-[14px] uppercase tracking-[0.08em]">
        {title}
      </h2>
      {action && href && (
        <Link href={href} className="text-mdcat-yellow text-xs font-poppins font-black hover:underline flex items-center gap-1">
          {action} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}

function PagedSectionHeader({
  title,
  range,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  title: string;
  range: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const navBtn = (active: boolean) =>
    `w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
      active
        ? "bg-dark-charcoal border-warrior-border text-white hover:border-mdcat-yellow hover:text-mdcat-yellow hover:shadow-[2px_2px_0px_rgba(255,198,0,0.25)] active:scale-90 cursor-pointer"
        : "bg-warrior-black/40 border-warrior-border/50 text-warrior-border cursor-not-allowed opacity-50"
    }`;

  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-baseline gap-3 min-w-0">
        <h2 className="font-poppins font-black text-white text-[14px] uppercase tracking-[0.08em] flex-shrink-0">
          {title}
        </h2>
        <span className="text-warrior-text font-inter text-[11px] tracking-wide truncate">
          {range}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous week"
          className={navBtn(canPrev)}
        >
          <ChevronLeft size={15} strokeWidth={2.6} />
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next week"
          className={navBtn(canNext)}
        >
          <ChevronRight size={15} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-3 flex flex-col gap-2 shadow-[3px_3px_0px_rgba(255,198,0,0.12)] transition-all duration-150 text-left w-full hover:shadow-[1px_1px_0px_rgba(255,198,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] cursor-default"
    >
      <div className="flex items-start justify-between gap-1.5">
        <p className="text-[10px] font-poppins font-black uppercase tracking-[0.06em] text-warrior-text leading-tight break-words">{label}</p>
        <div className="w-7 h-7 bg-mdcat-yellow border-2 border-warrior-black rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon size={13} className="text-warrior-black" strokeWidth={2.8} />
        </div>
      </div>
      <div>
        <p className={`font-poppins font-black text-[20px] leading-none ${accent ?? "text-white"}`}>{value}</p>
        {sub && <p className="text-warrior-text text-[10px] font-inter mt-1 truncate">{sub}</p>}
      </div>
    </motion.div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-poppins font-black text-warrior-text">
        — 0%
      </span>
    );
  }
  const positive = delta > 0;
  const cls = positive
    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
    : "text-red-400 bg-red-400/10 border-red-400/30";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-poppins font-black px-1.5 py-0.5 rounded-md border ${cls}`}
    >
      {positive ? <TrendingUp size={9} strokeWidth={3} /> : <TrendingDown size={9} strokeWidth={3} />}
      {positive ? `+${delta}%` : `${delta}%`}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   RECENT ACTIVITY — heatmap of 7 days (already sliced)
═══════════════════════════════════════════════════════════ */
function RecentActivityWidget({ slice }: { slice: HeatEntry[] }) {
  const today = new Date();

  const LEGEND = [
    { label: "0",    cls: "bg-warrior-black border-warrior-border" },
    { label: "1–9",  cls: "bg-mdcat-yellow/15 border-mdcat-yellow/25" },
    { label: "10–29",cls: "bg-mdcat-yellow/35 border-mdcat-yellow/45" },
    { label: "30–59",cls: "bg-mdcat-yellow/70 border-mdcat-yellow/80" },
    { label: "60+",  cls: "bg-mdcat-yellow border-mdcat-yellow" },
  ];

  const totalMcqs = slice.reduce((s, d) => s + d.mcqs, 0);
  const activeDays = slice.filter((d) => d.mcqs > 0).length;

  return (
    <div>
      {/* Header strip — totals at a glance */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[9px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text">Total</p>
            <p className="font-poppins font-black text-white text-[18px] leading-none mt-0.5">
              {totalMcqs} <span className="text-warrior-text text-[11px] font-inter font-normal">MCQs</span>
            </p>
          </div>
          <div className="w-px h-8 bg-warrior-border" />
          <div>
            <p className="text-[9px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text">Active</p>
            <p className="font-poppins font-black text-white text-[18px] leading-none mt-0.5">
              {activeDays}<span className="text-warrior-text text-[11px] font-inter font-normal">/{slice.length} days</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 border border-orange-400/30 rounded-full px-2.5 py-1">
          <Flame size={13} fill="currentColor" />
          <span className="text-[11px] font-poppins font-black">{STREAK_DAYS}d streak</span>
        </div>
      </div>

      {/* Day boxes */}
      <div className="grid grid-cols-7 gap-1.5">
        {slice.map((d, i) => {
          const isToday = isSameDay(d.date, today);
          const s = heatStyle(d.mcqs);
          return (
            <motion.div
              key={`${d.date.toISOString()}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={`relative rounded-xl py-2.5 px-1 flex flex-col items-center gap-0.5 border-2 ${s.bg} ${
                isToday ? "border-mdcat-yellow ring-2 ring-mdcat-yellow/30" : s.border
              }`}
            >
              {isToday && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full bg-mdcat-yellow text-warrior-black text-[7px] font-poppins font-black uppercase tracking-wider border border-warrior-black">
                  Today
                </span>
              )}
              <span className={`text-[9px] font-poppins font-black uppercase tracking-[0.08em] ${s.label}`}>
                {DAY_NAMES[d.date.getDay()]}
              </span>
              <span className={`text-[9px] font-inter ${s.label}`}>
                {d.date.getDate()}
              </span>
              <span className={`font-poppins font-black text-[16px] leading-none mt-1 ${s.num}`}>
                {d.mcqs}
              </span>
              <span className={`text-[8px] font-inter font-bold uppercase tracking-wider ${s.unit}`}>
                MCQs
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-x-3 gap-y-2 mt-4 flex-wrap">
        <span className="text-[10px] font-poppins font-black uppercase tracking-[0.12em] text-warrior-text">Legend</span>
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded border ${l.cls}`} />
            <span className="text-[10px] font-inter text-warrior-text">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCORE GAUGE — semi-circle SVG speedometer
═══════════════════════════════════════════════════════════ */
function ScoreGauge({ score, max, target }: { score: number; max: number; target: number }) {
  const W = 280;
  const H = 170;
  const cx = W / 2;
  const cy = 140;
  const r = 108;
  const stroke = 18;

  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const targetPct = Math.min(100, Math.max(0, (target / max) * 100));
  const arcLen = Math.PI * r;

  const polar = (p: number) => {
    const a = Math.PI * (1 - p / 100);
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };
  const needle = polar(pct);
  const tgt = polar(targetPct);

  const startX = cx - r;
  const endX = cx + r;
  const d = `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;

  return (
    <div className="relative w-full flex justify-center">
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible max-w-[320px]"
      >
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

        <motion.path
          d={d}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ strokeDasharray: arcLen }}
          initial={{ strokeDashoffset: arcLen }}
          whileInView={{ strokeDashoffset: arcLen * (1 - pct / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />

        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 1.1 }}
        >
          <circle cx={tgt.x} cy={tgt.y} r={6} fill="#FFC600" stroke="rgb(var(--dark-charcoal-rgb))" strokeWidth={3} />
        </motion.g>

        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.3, type: "spring", stiffness: 200 }}
        >
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
   SCORE PREDICTOR CARD
═══════════════════════════════════════════════════════════ */
function ScorePredictorCard() {
  return (
    <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 shadow-[4px_4px_0px_rgba(255,198,0,0.12)]">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[10px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text">
            Score Predictor
          </p>
          <p className="text-warrior-text text-[11px] font-inter mt-0.5">
            Accuracy × MDCAT subject weights
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-poppins font-black uppercase tracking-[0.1em] text-warrior-text">Target</p>
          <p className="font-poppins font-black text-white text-lg leading-none">175</p>
        </div>
      </div>

      <ScoreGauge score={PREDICTED_SCORE} max={210} target={175} />

      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {SUBJECTS.map((s, i) => (
          <div key={s.name} className="flex items-center gap-1.5 bg-warrior-black border-2 border-warrior-border rounded-xl px-2.5 py-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] font-poppins font-black text-warrior-text">{s.short}</span>
            <span className="text-[10px] font-inter text-white font-bold">
              {Math.round((s.accuracy / 100) * MDCAT_WEIGHTS[i])}
            </span>
            <span className="text-[10px] font-inter text-warrior-text">/ {MDCAT_WEIGHTS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PERFORMANCE — sliced trend bars
═══════════════════════════════════════════════════════════ */
function PerformanceSection({ slice }: { slice: TrendEntry[] }) {
  const trendMax = Math.max(...slice.map((t) => t.acc), 1);
  const delta = slice[slice.length - 1].acc - slice[0].acc;
  const avg = Math.round(slice.reduce((s, t) => s + t.acc, 0) / slice.length);
  const today = new Date();

  return (
    <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 shadow-[4px_4px_0px_rgba(255,198,0,0.12)]">
      <div className="flex items-end gap-2 h-[140px]">
        {slice.map((t, i) => {
          const isLast = i === slice.length - 1;
          const isToday = isSameDay(t.date, today);
          return (
            <div key={`${t.date.toISOString()}-${i}`} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-poppins font-black ${scoreColor(t.acc)}`}>{t.acc}%</span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${(t.acc / trendMax) * 95}px` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                className="w-full rounded-t-md relative"
                style={{
                  background: t.acc >= 70 ? "#10B981" : t.acc >= 55 ? "#FFA500" : "#D9534F",
                  opacity: isLast ? 1 : 0.65,
                }}
              />
              <span className={`text-[10px] font-poppins font-black ${isToday ? "text-mdcat-yellow" : "text-warrior-text"}`}>
                {DAY_NAMES[t.date.getDay()][0]}
              </span>
              <span className="text-[9px] font-inter text-warrior-text/70">
                {t.date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-warrior-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {delta >= 0 ? (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-2.5 py-1">
              <TrendingUp size={13} />
              <span className="text-[11px] font-poppins font-black">+{delta}% week-over-week</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 border border-red-400/30 rounded-full px-2.5 py-1">
              <TrendingDown size={13} />
              <span className="text-[11px] font-poppins font-black">{delta}% week-over-week</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-poppins font-black uppercase tracking-[0.1em] text-warrior-text">Avg</span>
          <span className={`font-poppins font-black text-[15px] ${scoreColor(avg)}`}>{avg}%</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const router = useRouter();
  const todayPct = Math.round((TODAY_MCQS / DAILY_GOAL) * 100);
  const [weakTopicsOpen, setWeakTopicsOpen] = useState(false);

  // Subjects Preparation — improvement/decline filter
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("weekly");
  const periodLabel: Record<TrendPeriod, string> = {
    daily: "vs yesterday",
    weekly: "vs last week",
    monthly: "vs last month",
  };

  // Heatmap window — offset measured in days back from "now"
  const HEAT_WIN = 7;
  const [heatOffset, setHeatOffset] = useState(0);
  const heatEnd   = HEATMAP.length - heatOffset;
  const heatStart = heatEnd - HEAT_WIN;
  const heatSlice = HEATMAP.slice(Math.max(0, heatStart), heatEnd);
  const heatCanNext = heatOffset > 0;
  const heatCanPrev = heatStart > 0;

  // Trend window — same shape, separate state
  const TREND_WIN = 7;
  const [trendOffset, setTrendOffset] = useState(0);
  const trendEnd   = TREND.length - trendOffset;
  const trendStart = trendEnd - TREND_WIN;
  const trendSlice = TREND.slice(Math.max(0, trendStart), trendEnd);
  const trendCanNext = trendOffset > 0;
  const trendCanPrev = trendStart > 0;

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-5xl mx-auto">

      {/* ── YOUR STATS — 4 cards ─────────────────── */}
      <div>
        <SectionHeader title="Your Stats" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatCard
            icon={Target}
            label="Total MCQs"
            value={TOTAL_MCQS.toLocaleString()}
            sub="Lifetime"
          />
          <StatCard
            icon={BarChart2}
            label="Accuracy"
            value={`${OVERALL_ACCURACY}%`}
            sub="Correct rate"
            accent={scoreColor(OVERALL_ACCURACY)}
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${STREAK_DAYS}d`}
            sub="Keep it alive"
            accent="text-orange-400"
          />
          <StatCard
            icon={CheckCircle}
            label="Today"
            value={`${TODAY_MCQS} / ${DAILY_GOAL}`}
            sub={`${todayPct}% of goal`}
            accent={todayPct >= 100 ? "text-emerald-400" : "text-white"}
          />
        </div>
      </div>

      {/* ── SCORE PREDICTOR ──────────────────────── */}
      <div>
        <SectionHeader title="Score Predictor" />
        <ScorePredictorCard />
      </div>

      {/* ── SUBJECTS PREPARATION ─────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
          <h2 className="font-poppins font-black text-white text-[15px] uppercase tracking-[0.04em]">
            Subjects Preparation
          </h2>
          <div className="flex items-center gap-1 bg-warrior-black border-2 border-warrior-border rounded-xl p-0.5">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setTrendPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-poppins font-black uppercase tracking-[0.08em] transition-all ${
                  trendPeriod === p
                    ? "bg-mdcat-yellow text-warrior-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.4)]"
                    : "text-warrior-text hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <p className="text-warrior-text font-inter text-[12px] mb-4">
          Tap a subject to drill in. Each ring shows accuracy {periodLabel[trendPeriod]}.
        </p>
        <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-4 shadow-[4px_4px_0px_rgba(255,198,0,0.1)]">
          <div className="flex flex-wrap justify-center gap-y-4 gap-x-3 md:gap-x-4">
            {SUBJECTS.map((s, i) => {
              const stale = s.lastDays >= 3;
              const delta = computeSubjectDelta(s.slug, trendPeriod);
              return (
                <Link
                  key={s.slug}
                  href={`/dashboard/analytics/${s.slug}`}
                  className="group block w-[30%] md:w-[17%]"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-center gap-1.5 py-1 cursor-pointer"
                  >
                    <div className="relative rounded-full transition-all duration-200 group-hover:drop-shadow-[0_0_14px_rgba(255,198,0,0.45)]">
                      <CircularRing percent={s.accuracy} color={s.color} size={74} strokeWidth={6} />
                      <motion.div
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-mdcat-yellow border-2 border-warrior-black flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.5)]"
                      >
                        <ChevronRight size={10} className="text-warrior-black" strokeWidth={3.5} />
                      </motion.div>
                    </div>
                    <p className="font-poppins font-black text-[11px] text-white text-center leading-tight group-hover:text-mdcat-yellow transition-colors">
                      {s.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="font-inter text-[9px] text-warrior-text">
                        {s.mcqs} MCQs
                      </span>
                      {stale && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-inter font-bold text-amber-400">
                          · {s.lastDays}d
                        </span>
                      )}
                    </div>
                    <DeltaBadge delta={delta} />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ──────────────────────── */}
      <div>
        <PagedSectionHeader
          title="Recent Activity"
          range={fmtRange(heatSlice)}
          onPrev={() => setHeatOffset((o) => o + 1)}
          onNext={() => setHeatOffset((o) => Math.max(0, o - 1))}
          canPrev={heatCanPrev}
          canNext={heatCanNext}
        />
        <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 shadow-[4px_4px_0px_rgba(255,198,0,0.12)]">
          <RecentActivityWidget slice={heatSlice} />
        </div>
      </div>

      {/* ── PERFORMANCE — LAST 7 SESSIONS ────────── */}
      <div>
        <PagedSectionHeader
          title="Performance — Last 7 Days"
          range={fmtRange(trendSlice)}
          onPrev={() => setTrendOffset((o) => o + 1)}
          onNext={() => setTrendOffset((o) => Math.max(0, o - 1))}
          canPrev={trendCanPrev}
          canNext={trendCanNext}
        />
        <PerformanceSection slice={trendSlice} />
      </div>

      {/* ── WEAK TOPICS ──────────────────────────── */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins font-black text-white text-[14px] uppercase tracking-[0.08em]">
            Focus Here — Weak Topics
          </h2>
          <Link
            href="/dashboard/quiz"
            className="flex items-center gap-1 bg-mdcat-yellow/10 border border-mdcat-yellow/30 text-mdcat-yellow text-[11px] font-poppins font-black px-2.5 py-1.5 rounded-lg hover:bg-mdcat-yellow/20 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Quiz Builder <ChevronRight size={11} strokeWidth={3} />
          </Link>
        </div>

        {/* Top 4 preview */}
        <div className="bg-dark-charcoal border border-warrior-border rounded-xl divide-y divide-warrior-border">
          {WEAK_TOPICS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3.5 group hover:bg-warrior-gray/20 transition-colors"
            >
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-inter font-bold text-[13px] text-white truncate">{t.topic}</p>
                <p className="text-warrior-text text-[11px] font-inter truncate">
                  {t.subject} · {t.chapter}
                </p>
              </div>
              <div className="text-right flex-shrink-0 mr-2">
                <p className="font-poppins font-black text-red-400 text-[15px] leading-none">{t.accuracy}%</p>
                <p className="text-warrior-text text-[10px] font-inter mt-0.5">correct</p>
              </div>
              <button
                onClick={() => router.push(`/dashboard/quiz?sub=${encodeURIComponent(t.subject)}&ch=${encodeURIComponent(t.chapter)}&tp=${encodeURIComponent(t.topic)}`)}
                className="w-7 h-7 bg-mdcat-yellow/10 border border-mdcat-yellow/20 rounded-md flex items-center justify-center text-mdcat-yellow hover:bg-mdcat-yellow/25 hover:border-mdcat-yellow/50 transition-colors flex-shrink-0"
              >
                <ChevronRight size={13} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* See all button */}
        <button
          onClick={() => setWeakTopicsOpen(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-warrior-border bg-warrior-black/30 hover:border-warrior-border/80 hover:bg-warrior-gray/20 text-warrior-text hover:text-white text-[12px] font-poppins font-black uppercase tracking-[0.08em] transition-all active:scale-[0.99]"
        >
          <ChevronDown size={13} />
          See all {ALL_WEAK_TOPICS.length} weak topics
        </button>
      </div>

      {/* ── WEAK TOPICS FULL MODAL ── */}
      <AnimatePresence>
        {weakTopicsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setWeakTopicsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-[480px] max-h-[82vh] bg-dark-charcoal border border-warrior-border rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-warrior-border flex-shrink-0">
                <div>
                  <p className="text-[9px] font-poppins font-black uppercase tracking-[0.14em] text-mdcat-yellow mb-0.5">All Weak Topics</p>
                  <h3 className="font-poppins font-black text-white text-[15px]">
                    Focus Here — {ALL_WEAK_TOPICS.length} topics
                  </h3>
                </div>
                <button
                  onClick={() => setWeakTopicsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-warrior-text hover:text-white hover:bg-warrior-gray/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto divide-y divide-warrior-border/60">
                {ALL_WEAK_TOPICS.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-warrior-gray/20 transition-colors"
                  >
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-inter font-bold text-[13px] text-white truncate">{t.topic}</p>
                      <p className="text-warrior-text text-[11px] font-inter truncate">
                        {t.subject} · {t.chapter}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 mr-2">
                      <p className={`font-poppins font-black text-[15px] leading-none ${t.accuracy < 45 ? "text-red-400" : t.accuracy < 60 ? "text-amber-400" : "text-emerald-400"}`}>
                        {t.accuracy}%
                      </p>
                      <p className="text-warrior-text text-[10px] font-inter mt-0.5">correct</p>
                    </div>
                    <button
                      onClick={() => {
                        setWeakTopicsOpen(false);
                        router.push(`/dashboard/quiz?sub=${encodeURIComponent(t.subject)}&ch=${encodeURIComponent(t.chapter)}&tp=${encodeURIComponent(t.topic)}`);
                      }}
                      className="w-7 h-7 bg-mdcat-yellow/10 border border-mdcat-yellow/20 rounded-md flex items-center justify-center text-mdcat-yellow hover:bg-mdcat-yellow/25 hover:border-mdcat-yellow/50 transition-colors flex-shrink-0"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-warrior-border flex-shrink-0">
                <button
                  onClick={() => setWeakTopicsOpen(false)}
                  className="w-full py-2.5 bg-warrior-gray/30 border border-warrior-border rounded-xl text-white text-[12px] font-inter font-bold hover:border-mdcat-yellow/40 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-4" />
    </div>
  );
}
