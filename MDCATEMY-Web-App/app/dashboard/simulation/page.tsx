"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Swords, Clock, AlertTriangle, CheckCircle, XCircle,
  ChevronRight, ChevronLeft, Volume2, Target,
  Eye, BarChart2, TrendingUp, TrendingDown, Flag,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type SimScreen = "briefing" | "countdown" | "manual" | "exam" | "results";
type NoiseMode = "silent" | "hall" | "rain" | "chaos";
type SectionKey = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning";

interface SimMCQ {
  id: number;
  subject: SectionKey;
  chapter: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
interface SimState { selected: number | null; flagged: boolean; } // selected is FINAL once set — cannot be changed
interface SimConfig { noiseMode: NoiseMode; blindMode: boolean; }

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const TOTAL_TIME = 150 * 60; // 150 min in seconds

const SECTION_ORDER: SectionKey[] = [
  "Biology", "Chemistry", "Physics", "English", "Logical Reasoning",
];
const SECTION_COUNTS: Record<SectionKey, number> = {
  Biology: 68, Chemistry: 54, Physics: 54, English: 18, "Logical Reasoning": 6,
};
const SECTION_COLORS: Record<SectionKey, string> = {
  Biology: "#10B981", Chemistry: "#38BDF8", Physics: "#A78BFA",
  English: "#2DD4BF", "Logical Reasoning": "#FB923C",
};
const SECTION_SHORT: Record<SectionKey, string> = {
  Biology: "Bio", Chemistry: "Chem", Physics: "Phys",
  English: "Eng", "Logical Reasoning": "LR",
};

/* ═══════════════════════════════════════════════════════════
   SOURCE MCQs  (20 questions, distributed into 200 by PMDC pattern)
═══════════════════════════════════════════════════════════ */
const SOURCE_MCQS: Omit<SimMCQ, "id">[] = [
  /* ── Biology ── */
  { subject: "Biology", chapter: "Cell Biology", difficulty: "Medium",
    question: "During which phase of mitosis do chromosomes align at the metaphase plate?",
    options: ["Prophase", "Metaphase", "Anaphase", "Telophase"], correct: 1,
    explanation: "During Metaphase, chromosomes line up along the cell's equatorial plane, attached to spindle fibres from both poles." },
  { subject: "Biology", chapter: "Genetics", difficulty: "Easy",
    question: "Which nitrogenous base is found in RNA but NOT in DNA?",
    options: ["Adenine", "Guanine", "Uracil", "Thymine"], correct: 2,
    explanation: "RNA contains Uracil instead of Thymine. Uracil pairs with Adenine but lacks the methyl group present on Thymine." },
  { subject: "Biology", chapter: "Coordination & Control", difficulty: "Hard",
    question: "The resting membrane potential of a typical neuron is approximately:",
    options: ["-35 mV", "-70 mV", "+35 mV", "+70 mV"], correct: 1,
    explanation: "The resting membrane potential is -70 mV, maintained by the Na⁺/K⁺ ATPase pump and selective K⁺ permeability." },
  { subject: "Biology", chapter: "Ecology", difficulty: "Easy",
    question: "Which organisms occupy the first trophic level in a food chain?",
    options: ["Herbivores", "Carnivores", "Producers", "Decomposers"], correct: 2,
    explanation: "Producers (autotrophs like plants and algae) convert solar energy via photosynthesis, forming the base of all food chains." },
  { subject: "Biology", chapter: "Cell Division", difficulty: "Medium",
    question: "Crossing over during meiosis occurs at the:",
    options: ["Centromere", "Chiasmata", "Spindle fibre", "Nuclear envelope"], correct: 1,
    explanation: "Crossing over (genetic recombination) occurs at chiasmata during Prophase I, exchanging segments between non-sister chromatids." },
  { subject: "Biology", chapter: "Digestion", difficulty: "Easy",
    question: "Bile is produced by the liver and stored in the:",
    options: ["Pancreas", "Stomach", "Gallbladder", "Small intestine"], correct: 2,
    explanation: "Bile is stored and concentrated in the gallbladder, released into the duodenum to emulsify fats." },
  /* ── Chemistry ── */
  { subject: "Chemistry", chapter: "Organic Chemistry", difficulty: "Easy",
    question: "Which functional group is characteristic of alcohols?",
    options: ["Carboxyl (–COOH)", "Amino (–NH₂)", "Hydroxyl (–OH)", "Carbonyl (C=O)"], correct: 2,
    explanation: "Alcohols contain the hydroxyl (–OH) group, making them polar and capable of hydrogen bonding." },
  { subject: "Chemistry", chapter: "Electrochemistry", difficulty: "Hard",
    question: "In a galvanic cell, oxidation occurs at the:",
    options: ["Cathode", "Anode", "Salt bridge", "External circuit"], correct: 1,
    explanation: "Oxidation (loss of electrons) occurs at the anode. Mnemonic: OIL RIG — Oxidation Is Loss, Reduction Is Gain." },
  { subject: "Chemistry", chapter: "Chemical Bonding", difficulty: "Medium",
    question: "The hybridisation of carbon in ethene (C₂H₄) is:",
    options: ["sp³", "sp²", "sp", "sp³d"], correct: 1,
    explanation: "Each carbon in ethene forms 3 sigma bonds using sp² orbitals. The remaining p orbital forms the pi bond — trigonal planar geometry." },
  { subject: "Chemistry", chapter: "Thermochemistry", difficulty: "Medium",
    question: "A reaction with ΔH < 0 is classified as:",
    options: ["Endothermic", "Exothermic", "Isothermal", "Adiabatic"], correct: 1,
    explanation: "Negative ΔH means heat is released to surroundings — exothermic. Examples: combustion and neutralisation." },
  { subject: "Chemistry", chapter: "Organic Chemistry", difficulty: "Hard",
    question: "Which type of reaction converts an alkene to an alkane?",
    options: ["Substitution", "Elimination", "Hydrogenation", "Oxidation"], correct: 2,
    explanation: "Hydrogenation (catalytic H₂ addition) converts alkene C=C to alkane C–C. Requires Ni, Pt, or Pd catalyst." },
  /* ── Physics ── */
  { subject: "Physics", chapter: "Forces & Newton's Laws", difficulty: "Easy",
    question: "A 5 kg object accelerates at 3 m/s². The net force acting on it is:",
    options: ["1.67 N", "8 N", "15 N", "0.6 N"], correct: 2,
    explanation: "F = ma = 5 × 3 = 15 N (Newton's Second Law)." },
  { subject: "Physics", chapter: "Waves & Sound", difficulty: "Hard",
    question: "When a sound source moves TOWARDS a stationary observer, the observed frequency:",
    options: ["Decreases", "Remains the same", "Increases", "Becomes zero"], correct: 2,
    explanation: "Moving source compresses wavefronts, shortening wavelength. By v = fλ, shorter λ → higher f — the Doppler effect." },
  { subject: "Physics", chapter: "Electricity", difficulty: "Medium",
    question: "Three 6Ω resistors are connected in parallel. The equivalent resistance is:",
    options: ["18 Ω", "6 Ω", "2 Ω", "0.5 Ω"], correct: 2,
    explanation: "R_eq = R/n = 6/3 = 2 Ω for identical resistors in parallel." },
  { subject: "Physics", chapter: "Optics", difficulty: "Medium",
    question: "When light travels from a denser to a rarer medium, it:",
    options: ["Bends towards normal", "Bends away from normal", "Travels straight", "Is completely absorbed"], correct: 1,
    explanation: "Light speeds up in the rarer medium and bends away from the normal — the basis of total internal reflection." },
  { subject: "Physics", chapter: "Work, Energy & Power", difficulty: "Medium",
    question: "A 10 kg box is lifted 3 m. Work done against gravity (g = 10 m/s²) is:",
    options: ["30 J", "300 J", "13 J", "100 J"], correct: 1,
    explanation: "W = mgh = 10 × 10 × 3 = 300 J." },
  /* ── English ── */
  { subject: "English", chapter: "Vocabulary", difficulty: "Easy",
    question: "Which word is closest in meaning to 'METICULOUS'?",
    options: ["Careless", "Thorough", "Rapid", "Vague"], correct: 1,
    explanation: "'Meticulous' means showing great attention to detail — 'Thorough' is the closest synonym." },
  { subject: "English", chapter: "Grammar", difficulty: "Easy",
    question: "Which sentence uses the Present Perfect tense correctly?",
    options: ["She goes to the market yesterday.", "She has gone to the market.", "She going to the market.", "She gone."], correct: 1,
    explanation: "Present Perfect = has/have + past participle. 'She has gone' is correct." },
  /* ── Logical Reasoning ── */
  { subject: "Logical Reasoning", chapter: "Number & Letter Series", difficulty: "Medium",
    question: "Find the next number: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"], correct: 2,
    explanation: "Differences: 4, 6, 8, 10, 12 (increasing by 2). Pattern: n(n+1). 6×7 = 42." },
  { subject: "Logical Reasoning", chapter: "Syllogisms", difficulty: "Hard",
    question: "All doctors are graduates. Some graduates are rich. Which conclusion is valid?",
    options: ["All doctors are rich", "Some doctors are rich", "Some graduates are doctors", "No conclusion follows"], correct: 2,
    explanation: "All doctors are graduates → doctors ⊂ graduates → some graduates must be doctors." },
];

function generateSimQuestions(): SimMCQ[] {
  const result: SimMCQ[] = [];
  let id = 1;
  for (const subject of SECTION_ORDER) {
    const pool = SOURCE_MCQS.filter((q) => q.subject === subject);
    for (let i = 0; i < SECTION_COUNTS[subject]; i++) {
      result.push({ ...pool[i % pool.length], id: id++ });
    }
  }
  return result;
}

const SIM_QUESTIONS = generateSimQuestions();

function getSectionStart(subject: SectionKey): number {
  let start = 0;
  for (const s of SECTION_ORDER) {
    if (s === subject) return start;
    start += SECTION_COUNTS[s];
  }
  return 0;
}

/* ═══════════════════════════════════════════════════════════
   WEB AUDIO NOISE ENGINE
═══════════════════════════════════════════════════════════ */
function useNoiseEngine(mode: NoiseMode, active: boolean) {
  useEffect(() => {
    if (!active || mode === "silent" || typeof window === "undefined") return;
    let ctx: AudioContext | null = null;
    let source: AudioBufferSourceNode | null = null;

    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;
      const sr = ctx.sampleRate;
      const buf = ctx.createBuffer(1, sr * 4, sr); // 4-second loop
      const data = buf.getChannelData(0);

      if (mode === "rain") {
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 900;
        source = ctx.createBufferSource();
        source.buffer = buf;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = 0.12;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
      } else {
        // Brown noise — deep exam hall rumble
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          const w = Math.random() * 2 - 1;
          data[i] = (last + 0.02 * w) / 1.02;
          last = data[i];
          data[i] *= 3.5;
        }
        source = ctx.createBufferSource();
        source.buffer = buf;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = mode === "chaos" ? 0.22 : 0.07;
        source.connect(gain);
        gain.connect(ctx.destination);
      }
      source.start();
    } catch (_) { /* Web Audio unavailable */ }

    return () => {
      try { source?.stop(); } catch (_) {}
      ctx?.close();
    };
  }, [active, mode]);
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function timerStyle(rem: number) {
  if (rem > 30 * 60) return { text: "text-white", box: "bg-warrior-black border-warrior-border" };
  if (rem > 10 * 60) return { text: "text-amber-400", box: "bg-amber-500/10 border-amber-500/40" };
  if (rem > 5 * 60)  return { text: "text-orange-400", box: "bg-orange-500/10 border-orange-500/40" };
  return { text: "text-red-400", box: "bg-red-500/10 border-red-500/50" };
}
function scoreColor(pct: number) {
  if (pct >= 70) return "text-emerald-400";
  if (pct >= 55) return "text-amber-400";
  return "text-red-400";
}
function gradeLabel(pct: number) {
  if (pct >= 85) return { text: "WARRIOR",        color: "text-mdcat-yellow" };
  if (pct >= 70) return { text: "SOLID",           color: "text-emerald-400" };
  if (pct >= 55) return { text: "KEEP GOING",      color: "text-amber-400"   };
  if (pct >= 40) return { text: "NEEDS WORK",      color: "text-orange-400"  };
  return          { text: "BATTLE STATIONS",  color: "text-red-400"     };
}
function estimatePercentile(score: number) {
  if (score >= 170) return 99; if (score >= 160) return 95;
  if (score >= 150) return 88; if (score >= 140) return 76;
  if (score >= 130) return 62; if (score >= 120) return 48;
  if (score >= 100) return 30; return 12;
}

/* ═══════════════════════════════════════════════════════════
   BRIEFING SCREEN
═══════════════════════════════════════════════════════════ */
const NOISE_OPTIONS: { mode: NoiseMode; emoji: string; label: string; desc: string }[] = [
  { mode: "silent", emoji: "🔇", label: "Silent",     desc: "Pure focus, no distractions" },
  { mode: "hall",   emoji: "🏛️", label: "Exam Hall",  desc: "Chairs, rustling, writing sounds" },
  { mode: "rain",   emoji: "🌧️", label: "Focus Rain", desc: "Soft white noise for concentration" },
  { mode: "chaos",  emoji: "🔊", label: "Full Chaos", desc: "Announcements, coughing, phones ringing" },
];

const RULES = [
  { icon: "⏱️", title: "No Pausing",       body: "150 minutes. Clock runs the moment you begin. Just like the real MDCAT — no exceptions." },
  { icon: "📵", title: "Tab Monitoring",    body: "Every tab switch is logged. Three strikes triggers a final warning displayed on screen." },
  { icon: "🚫", title: "Answers Hidden",    body: "No explanations during the exam. Right and wrong are revealed only after you submit." },
  { icon: "🚩", title: "Flag & Return",     body: "Mark uncertain questions with a flag. Revisit them any time before final submission." },
  { icon: "⚡", title: "Auto-Submit",       body: "When the timer hits zero, your paper is submitted automatically — answer every question." },
  { icon: "📊", title: "Full Analytics",    body: "After submission: section scores, time-per-question, percentile estimate, and improvement areas." },
];

function BriefingScreen({ onStart }: { onStart: (cfg: SimConfig) => void }) {
  const [noiseMode, setNoiseMode]   = useState<NoiseMode>("hall");
  const [blindMode, setBlindMode]   = useState(false);
  const [acknowledged, setAck]      = useState(false);

  return (
    <div className="min-h-screen bg-warrior-black overflow-y-auto">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden border-b border-warrior-border">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 39px,#FFC600 39px,#FFC600 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#FFC600 39px,#FFC600 40px)"
        }} />
        {/* Yellow radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, #FFC600, transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-12 text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-warrior-text text-[12px] font-inter hover:text-white mb-8 transition-colors">
            <ChevronLeft size={14} /> Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 bg-mdcat-yellow/10 border border-mdcat-yellow/25 rounded-full px-4 py-1.5 mb-5">
            <Swords size={13} className="text-mdcat-yellow" />
            <span className="text-mdcat-yellow text-[11px] font-inter font-black uppercase tracking-[0.18em]">Full PMDC Simulation</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            className="font-poppins font-black text-white mb-3"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.0 }}>
            IF MDCAT<br />
            <span className="text-gradient-yellow">WAS TODAY</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="text-warrior-text font-inter text-[15px] max-w-md mx-auto leading-relaxed mb-7">
            200 MCQs. 150 minutes. Prepared by MDCATEMY experts on the exact PMDC pattern.
            This is as close to the real MDCAT as it gets — without leaving your room.
          </motion.p>

          {/* Chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-2">
            {[
              ["200 MCQs",     "#FFC600"], ["150 Minutes", "#FFC600"],
              ["PMDC Pattern", "#10B981"], ["Expert-Made",  "#10B981"],
              ["Real Pressure","#FB923C"],
            ].map(([label, color]) => (
              <span key={label} className="text-[11px] font-inter font-bold px-3 py-1 rounded-full border"
                style={{ color, borderColor: color + "40", background: color + "12" }}>
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* Subject distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
            📋 PMDC Subject Distribution
          </p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {SECTION_ORDER.map((sub) => (
              <div key={sub} className="bg-dark-charcoal border rounded-xl p-3 text-center"
                style={{ borderColor: SECTION_COLORS[sub] + "35" }}>
                <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ backgroundColor: SECTION_COLORS[sub] }} />
                <p className="font-poppins font-black text-xl text-white">{SECTION_COUNTS[sub]}</p>
                <p className="text-[9px] font-inter text-warrior-text mt-0.5">{SECTION_SHORT[sub]}</p>
              </div>
            ))}
          </div>
          {/* Proportional bar */}
          <div className="flex h-2.5 rounded-full overflow-hidden">
            {SECTION_ORDER.map((sub) => (
              <div key={sub} style={{ width: `${(SECTION_COUNTS[sub] / 200) * 100}%`, backgroundColor: SECTION_COLORS[sub] }} />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {SECTION_ORDER.map((sub) => (
              <span key={sub} className="text-[9px] font-inter text-warrior-text">
                {Math.round((SECTION_COUNTS[sub] / 200) * 100)}%
              </span>
            ))}
          </div>
        </motion.div>

        {/* Rules of engagement */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
            ⚔️ Rules of Engagement
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {RULES.map((r) => (
              <div key={r.title} className="flex items-start gap-3 bg-dark-charcoal border border-warrior-border rounded-xl px-4 py-3.5">
                <span className="text-[18px] flex-shrink-0 mt-0.5">{r.icon}</span>
                <div>
                  <p className="font-inter font-bold text-white text-[13px]">{r.title}</p>
                  <p className="font-inter text-warrior-text text-[11px] leading-relaxed mt-0.5">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Battlefield conditions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
            🎧 Battlefield Conditions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NOISE_OPTIONS.map((n) => (
              <button key={n.mode} onClick={() => setNoiseMode(n.mode)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  noiseMode === n.mode
                    ? "bg-mdcat-yellow/10 border-mdcat-yellow/40"
                    : "bg-dark-charcoal border-warrior-border hover:border-warrior-text/30"
                }`}>
                <span className="text-2xl">{n.emoji}</span>
                <div className="text-center">
                  <p className={`font-inter font-bold text-[12px] ${noiseMode === n.mode ? "text-white" : "text-warrior-text"}`}>
                    {n.label}
                  </p>
                  <p className="font-inter text-[10px] text-warrior-text/60 mt-0.5 leading-tight">{n.desc}</p>
                </div>
                {noiseMode === n.mode && <div className="w-1.5 h-1.5 rounded-full bg-mdcat-yellow" />}
              </button>
            ))}
          </div>
          {noiseMode !== "silent" && (
            <p className="text-warrior-text/50 text-[10px] font-inter mt-2 text-center">
              🔊 Generated via Web Audio API — begins when the countdown ends
            </p>
          )}
        </motion.div>

        {/* Warrior extras */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
            🧠 Warrior Extras
          </p>
          <button onClick={() => setBlindMode(!blindMode)}
            className={`w-full flex items-start gap-4 bg-dark-charcoal border rounded-xl px-5 py-4 text-left transition-all duration-200 ${
              blindMode ? "border-mdcat-yellow/40 bg-mdcat-yellow/5" : "border-warrior-border hover:border-warrior-text/30"
            }`}>
            <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
              blindMode ? "bg-mdcat-yellow border-mdcat-yellow" : "border-warrior-text/40"
            }`}>
              {blindMode && <CheckCircle size={12} className="text-warrior-black" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-inter font-bold text-white text-[13px]">Blind Mode</p>
                <span className="text-[9px] font-inter font-black uppercase tracking-[0.12em] text-mdcat-yellow bg-mdcat-yellow/10 border border-mdcat-yellow/20 rounded-full px-2 py-0.5">
                  Advanced
                </span>
              </div>
              <p className="font-inter text-warrior-text text-[12px] leading-relaxed mt-1">
                Hides your question number and overall progress during the exam. Fight anxiety.
                Conquer each question independently — exactly as top students approach the real exam hall.
              </p>
            </div>
          </button>

          {/* Blind mode warning callout */}
          <AnimatePresence>
            {blindMode && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/25 rounded-xl px-4 py-3 mt-2">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300 font-inter text-[12px] leading-relaxed">
                    <span className="font-bold">Question Navigator will be disabled.</span> You won't see which questions you've answered or how many remain. Only enable this if you're genuinely comfortable working without progress tracking.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Acknowledge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <button onClick={() => setAck(!acknowledged)}
            className={`w-full flex items-start gap-4 rounded-xl px-5 py-4 text-left border-l-4 transition-all duration-200 ${
              acknowledged
                ? "border-l-mdcat-yellow bg-mdcat-yellow/5 border border-mdcat-yellow/20 border-l-mdcat-yellow"
                : "border-l-warrior-border bg-dark-charcoal border border-warrior-border"
            }`}>
            <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
              acknowledged ? "bg-mdcat-yellow border-mdcat-yellow" : "border-warrior-text/40"
            }`}>
              {acknowledged && <CheckCircle size={12} className="text-warrior-black" />}
            </div>
            <p className="font-inter text-[13px] leading-relaxed text-white/80">
              I understand this is a full timed simulation. The clock runs continuously without pause.
              I will treat this as my real MDCAT.{" "}
              <span className="text-mdcat-yellow font-bold">I am ready to be a Warrior.</span>
            </p>
          </button>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
          className="text-center pb-6">
          <button onClick={() => acknowledged && onStart({ noiseMode, blindMode })}
            disabled={!acknowledged}
            className="btn-primary inline-flex items-center gap-3 disabled:opacity-25 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            <Swords size={17} />
            Enter the Arena
            <ChevronRight size={17} />
          </button>
          <p className="text-warrior-text/50 text-[11px] font-inter mt-3">
            200 MCQs · 150 minutes · No pausing once started
          </p>
        </motion.div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN SCREEN
═══════════════════════════════════════════════════════════ */
const COUNTDOWN_COPY: Record<number, string> = {
  5: "Preparing your exam...",
  4: "Loading questions...",
  3: "Starting noise profile...",
  2: "Settle in. Breathe.",
  1: "Steady...",
};

function CountdownScreen({ onBegin }: { onBegin: () => void }) {
  const [count, setCount] = useState(5);
  const [begin, setBegin] = useState(false);

  useEffect(() => {
    if (count <= 0) {
      setBegin(true);
      const t = setTimeout(onBegin, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onBegin]);

  return (
    <div className="fixed inset-0 bg-warrior-black flex flex-col items-center justify-center z-50">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 49px,#FFC600 49px,#FFC600 50px),repeating-linear-gradient(90deg,transparent,transparent 49px,#FFC600 49px,#FFC600 50px)"
      }} />

      <AnimatePresence mode="wait">
        {!begin ? (
          <motion.div key={count}
            initial={{ scale: 0.45, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            className="text-center"
          >
            <div className="relative w-44 h-44 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 90px 18px rgba(255,198,0,${count <= 2 ? 0.28 : 0.12})` }} />
              <div className="w-full h-full rounded-full bg-mdcat-yellow/5 border border-mdcat-yellow/20 flex items-center justify-center">
                <span className="font-poppins font-black text-mdcat-yellow" style={{ fontSize: "5.5rem", lineHeight: 1 }}>
                  {count}
                </span>
              </div>
            </div>
            <p className="text-warrior-text font-inter text-[13px] uppercase tracking-[0.22em]">
              {COUNTDOWN_COPY[count]}
            </p>
          </motion.div>
        ) : (
          <motion.div key="begin"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <p className="font-poppins font-black text-mdcat-yellow" style={{ fontSize: "4.5rem", lineHeight: 1 }}>
              BEGIN
            </p>
            <p className="text-white font-inter text-base mt-3">150 minutes. Make every second count.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRE-EXAM MANUAL SCREEN
═══════════════════════════════════════════════════════════ */
function ManualScreen({ config, onBegin }: { config: SimConfig; onBegin: () => void }) {
  const rules = [
    {
      icon: "☝️", highlight: true,
      title: "Selecting an Answer is FINAL",
      body: "The moment you tap an option it is permanently locked. You cannot change or unselect it. Think carefully — one tap decides your answer.",
    },
    {
      icon: "🚩", highlight: false,
      title: "Flag & Review",
      body: "Tap the Flag button to mark uncertain questions in orange. You can still return and answer them — but once you click an option it is locked forever.",
    },
    {
      icon: "⏱️", highlight: false,
      title: "Timer Runs Continuously",
      body: "150 minutes. No pausing, no interruptions. The clock counts from now until you submit or time runs out.",
    },
    {
      icon: "⚡", highlight: false,
      title: "Auto-Submit at Zero",
      body: "When the timer hits 00:00 your paper is submitted automatically. Unanswered questions are marked incorrect.",
    },
    {
      icon: "📵", highlight: false,
      title: "Tab Switches Are Monitored",
      body: "Leaving the exam window is logged. Three incidents trigger a visible final warning on screen.",
    },
    ...(config.blindMode ? [{
      icon: "🔇", highlight: true,
      title: "Blind Mode Is Active",
      body: "The Question Navigator is hidden. You will not see your progress, Q numbers, or how many questions remain. Navigate using Prev / Next only.",
    }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-warrior-black flex flex-col z-50 overflow-y-auto">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 39px,#FFC600 39px,#FFC600 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#FFC600 39px,#FFC600 40px)"
      }} />

      <div className="relative max-w-lg w-full mx-auto px-4 py-10 flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="text-center mb-7">
          <div className="inline-flex items-center gap-2 bg-mdcat-yellow/10 border border-mdcat-yellow/25 rounded-full px-4 py-1.5 mb-4">
            <Swords size={13} className="text-mdcat-yellow" />
            <span className="text-mdcat-yellow text-[11px] font-inter font-black uppercase tracking-[0.18em]">Exam Manual</span>
          </div>
          <h2 className="font-poppins font-black text-white text-2xl mb-1.5">Before You Begin</h2>
          <p className="text-warrior-text font-inter text-[13px]">
            Read these rules carefully — they apply for the duration of this simulation.
          </p>
        </motion.div>

        {/* Rules */}
        <div className="space-y-2.5 mb-8">
          {rules.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className={`flex items-start gap-3 rounded-xl px-4 py-3.5 border ${
                r.highlight
                  ? "bg-mdcat-yellow/8 border-mdcat-yellow/30"
                  : "bg-dark-charcoal border-warrior-border"
              }`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{r.icon}</span>
              <div>
                <p className={`font-inter font-bold text-[13px] ${r.highlight ? "text-mdcat-yellow" : "text-white"}`}>
                  {r.title}
                </p>
                <p className="font-inter text-warrior-text text-[12px] leading-relaxed mt-0.5">{r.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <button onClick={onBegin}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Swords size={16} />
            I understand — Begin Exam
            <ChevronRight size={16} />
          </button>
          <p className="text-warrior-text/50 text-[11px] font-inter text-center mt-3">
            Countdown begins · Timer starts when the exam opens
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXAM SCREEN
═══════════════════════════════════════════════════════════ */
function ExamScreen({
  questions,
  config,
  onFinish,
}: {
  questions: SimMCQ[];
  config: SimConfig;
  onFinish: (states: SimState[], timeTaken: number) => void;
}) {
  const [states, setStates] = useState<SimState[]>(
    questions.map(() => ({ selected: null, flagged: false }))
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [submitModal, setSubmitModal] = useState(false);
  const [tabWarning, setTabWarning] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const statesRef = useRef(states);
  useEffect(() => { statesRef.current = states; }, [states]);

  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  const startTime = useRef(Date.now());
  const tabCount = useRef(0);
  const toastShown = useRef(new Set<string>());

  // Noise
  useNoiseEngine(config.noiseMode, true);

  const answeredCount = states.filter((s) => s.selected !== null).length;
  const flaggedCount  = states.filter((s) => s.flagged).length;

  // Countdown timer
  useEffect(() => {
    const id = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(id);
          const elapsed = Math.round((Date.now() - startTime.current) / 1000);
          onFinishRef.current(statesRef.current, elapsed);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Time milestone toasts
  useEffect(() => {
    const alerts: [number, string][] = [
      [90 * 60, "⚡ 90 minutes left — stay on pace"],
      [60 * 60, "⏳ One hour remaining. Keep going."],
      [30 * 60, "⚠️ 30 minutes left. Accelerate."],
      [15 * 60, "🔥 15 minutes — lock in all flags."],
      [10 * 60, "🚨 10 minutes remaining!"],
      [5 * 60,  "⏱️ FINAL 5 MINUTES — submit soon!"],
    ];
    for (const [t, msg] of alerts) {
      const key = `t${t}`;
      if (timeRemaining === t && !toastShown.current.has(key)) {
        toastShown.current.add(key);
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
      }
    }
  }, [timeRemaining]);

  // Question milestone toasts
  useEffect(() => {
    const answered = statesRef.current.filter((s) => s.selected !== null).length;
    const milestones: [number, string][] = [
      [50,  "⚡ 50 done — quarter way through!"],
      [100, "💪 Halfway there. Stay sharp."],
      [150, "🔥 150 questions! Final stretch!"],
    ];
    for (const [n, msg] of milestones) {
      const key = `q${n}`;
      if (answered === n && !toastShown.current.has(key)) {
        toastShown.current.add(key);
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
      }
    }
  }, [states]);

  // Tab switch detection
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        tabCount.current++;
        setTabWarning(tabCount.current);
        setTimeout(() => setTabWarning(0), 5000);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Immersive mode — hide dashboard mobile tab bar during simulation
  useEffect(() => {
    document.body.classList.add("quiz-immersive");
    return () => { document.body.classList.remove("quiz-immersive"); };
  }, []);

  const current = questions[currentIdx];
  const currentState = states[currentIdx];
  const ts = timerStyle(timeRemaining);

  // selecting is FINAL — once set, cannot be changed
  const select = (i: number) => {
    if (currentState.selected !== null) return;
    setStates((prev) => prev.map((s, idx) => idx === currentIdx ? { ...s, selected: i } : s));
  };

  const toggleFlag = () => {
    setStates((prev) => prev.map((s, idx) => idx === currentIdx ? { ...s, flagged: !s.flagged } : s));
  };

  const doSubmit = () => {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    onFinish(states, elapsed);
  };

  return (
    <div className="fixed inset-0 bg-warrior-black flex flex-col overflow-hidden z-[40]">

      {/* Milestone toast */}
      <AnimatePresence>
        {toast && (
          <motion.div key={toast}
            initial={{ opacity: 0, y: -36 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -36 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-dark-charcoal border border-mdcat-yellow/40 rounded-xl px-5 py-2.5 shadow-xl pointer-events-none"
          >
            <span className="font-inter font-bold text-white text-[13px]">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab warning banner */}
      <AnimatePresence>
        {tabWarning > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-[12px] font-inter font-bold ${
              tabWarning >= 3
                ? "bg-red-500/20 text-red-400 border-b border-red-500/30"
                : "bg-amber-500/15 text-amber-400 border-b border-amber-500/20"
            }`}>
            <AlertTriangle size={13} />
            {tabWarning >= 3
              ? `⚠️ Final warning — ${tabWarning} tab switches logged. This is your last caution.`
              : `Tab switch detected (${tabWarning}). Stay focused on your exam.`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-2 px-3 lg:px-5 py-2.5 border-b border-warrior-border bg-dark-charcoal flex-shrink-0">

        {/* Section tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {SECTION_ORDER.map((sub) => {
            const start = getSectionStart(sub);
            const isActive = current.subject === sub;
            const done = states.slice(start, start + SECTION_COUNTS[sub]).filter((s) => s.selected !== null).length;
            return (
              <button key={sub} onClick={() => setCurrentIdx(start)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-inter font-bold transition-all ${
                  isActive ? "text-white" : "text-warrior-text hover:text-white"
                }`}
                style={isActive ? { background: SECTION_COLORS[sub] + "20", border: `1px solid ${SECTION_COLORS[sub]}50` } : {}}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SECTION_COLORS[sub] }} />
                {SECTION_SHORT[sub]}
                <span className="font-mono text-[10px]">{done}/{SECTION_COUNTS[sub]}</span>
              </button>
            );
          })}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border flex-shrink-0 ${ts.box}`}>
          <Clock size={12} className={ts.text} />
          <span className={`font-mono font-black text-[14px] tabular-nums ${ts.text} ${timeRemaining <= 5 * 60 ? "animate-pulse" : ""}`}>
            {fmtTime(timeRemaining)}
          </span>
        </div>

        {/* Noise indicator */}
        {config.noiseMode !== "silent" && (
          <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 bg-warrior-black border border-warrior-border rounded-lg">
            <Volume2 size={11} className="text-mdcat-yellow" />
            <span className="text-[10px] font-inter text-warrior-text hidden md:inline capitalize">{config.noiseMode}</span>
          </div>
        )}

        {/* Q counter */}
        {!config.blindMode && (
          <span className="flex-shrink-0 text-[11px] font-inter font-bold text-warrior-text">
            Q<span className="text-white">{currentIdx + 1}</span>/{questions.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-warrior-border flex-shrink-0">
        <div className="h-full bg-mdcat-yellow transition-all duration-500"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
      </div>

      {/* ── MAIN: Question + Desktop Nav ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Question area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-[9px] font-inter font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border"
                style={{
                  color: current.difficulty === "Easy" ? "#10B981" : current.difficulty === "Medium" ? "#FFA500" : "#D9534F",
                  borderColor: current.difficulty === "Easy" ? "#10B98130" : current.difficulty === "Medium" ? "#FFA50030" : "#D9534F30",
                  background: current.difficulty === "Easy" ? "#10B98112" : current.difficulty === "Medium" ? "#FFA50012" : "#D9534F12",
                }}>
                {current.difficulty}
              </span>
              <span className="text-[9px] font-inter font-bold text-warrior-text uppercase tracking-[0.1em]">
                {current.subject} · {current.chapter}
              </span>
              {currentState.selected !== null && (
                <span className="ml-auto text-[9px] font-inter font-bold text-warrior-text/50 uppercase tracking-[0.1em]">
                  Answered
                </span>
              )}
            </div>

            {!config.blindMode && (
              <p className="text-[10px] font-inter text-warrior-text/40 mb-2 font-mono">
                Question {currentIdx + 1} of {questions.length}
              </p>
            )}

            {/* Question */}
            <p className="font-inter text-white text-base lg:text-[17px] leading-relaxed mb-7">
              {current.question}
            </p>

            {/* Options — selecting is FINAL */}
            <div className="space-y-3">
              {current.options.map((opt, i) => {
                const isSelected = currentState.selected === i;
                const isLocked   = currentState.selected !== null; // any option selected = all locked
                const isOther    = isLocked && !isSelected;
                return (
                  <motion.button key={i}
                    onClick={() => select(i)}
                    disabled={isLocked}
                    whileTap={!isLocked ? { scale: 0.997 } : {}}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left ${
                      isSelected
                        ? "border-mdcat-yellow bg-mdcat-yellow/12 text-white cursor-default"
                        : isOther
                        ? "border-warrior-border bg-dark-charcoal text-warrior-text/40 cursor-default opacity-50"
                        : "border-warrior-border bg-dark-charcoal text-white hover:border-mdcat-yellow/40 hover:bg-mdcat-yellow/5 cursor-pointer"
                    }`}>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-mono font-bold text-[12px] transition-colors ${
                      isSelected ? "bg-mdcat-yellow text-warrior-black" : "bg-warrior-gray text-warrior-text"
                    }`}>
                      {isSelected ? <CheckCircle size={14} className="text-warrior-black" /> : ["A", "B", "C", "D"][i]}
                    </div>
                    <span className="font-inter text-[14px] leading-relaxed flex-1">{opt}</span>
                    {isSelected && (
                      <span className="text-[9px] font-inter font-black uppercase tracking-[0.12em] text-mdcat-yellow bg-mdcat-yellow/15 border border-mdcat-yellow/30 rounded-full px-2 py-0.5 flex-shrink-0">
                        Locked
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Auto-advance hint after locking */}
            {currentState.selected !== null && currentIdx < questions.length - 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-warrior-text/50 text-[11px] font-inter text-center mt-4"
              >
                Answer locked · Press <span className="text-white">Next</span> to continue
              </motion.p>
            )}
          </div>
        </div>

        {/* Desktop navigator panel — hidden in blind mode */}
        <div className={`${config.blindMode ? "hidden" : "hidden lg:flex"} w-[210px] flex-col border-l border-warrior-border bg-dark-charcoal flex-shrink-0`}>
          <div className="px-3 py-2.5 border-b border-warrior-border">
            <p className="text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text">Navigator</p>
            <p className="text-warrior-text text-[10px] font-inter mt-0.5">
              {answeredCount}/{questions.length} answered
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5">
            {SECTION_ORDER.map((sub) => {
              const start = getSectionStart(sub);
              return (
                <div key={sub} className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SECTION_COLORS[sub] }} />
                    <span className="text-[9px] font-inter font-black uppercase tracking-[0.1em] text-warrior-text">
                      {SECTION_SHORT[sub]}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: SECTION_COUNTS[sub] }).map((_, i) => {
                      const qi = start + i;
                      const s = states[qi];
                      return (
                        <button key={qi} onClick={() => setCurrentIdx(qi)}
                          className={`h-6 rounded text-[9px] font-mono font-bold transition-all ${
                            qi === currentIdx ? "ring-2 ring-mdcat-yellow ring-offset-1 ring-offset-dark-charcoal" : ""
                          } ${
                            s.selected !== null              ? "bg-mdcat-yellow/45 text-white" :
                            s.flagged                        ? "bg-orange-500/35 text-orange-300" :
                                                               "bg-warrior-black border border-warrior-border text-warrior-text/40"
                          }`}>
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-2.5 border-t border-warrior-border space-y-1.5">
            {[
              { cls: "bg-mdcat-yellow/45",                              label: "Answered" },
              { cls: "bg-orange-500/35",                                label: "Flagged"  },
              { cls: "bg-warrior-black border border-warrior-border",   label: "Blank"    },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${cls}`} />
                <span className="text-[9px] font-inter text-warrior-text">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="flex items-center gap-2 px-3 lg:px-6 py-3 border-t border-warrior-border bg-dark-charcoal flex-shrink-0">

        {/* Left: Prev */}
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-warrior-gray/30 border border-warrior-border rounded-lg text-white text-[12px] font-inter font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-warrior-text/40 transition-colors"
        >
          <ChevronLeft size={14} /> Prev
        </button>

        {/* Center: mobile nav (hide in blind mode) + flag + submit */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {!config.blindMode && (
            <button onClick={() => setNavOpen(true)}
              className="lg:hidden flex items-center gap-1 px-2.5 py-2 bg-warrior-gray/40 border border-warrior-border rounded-lg text-warrior-text text-[11px] font-inter font-bold hover:border-mdcat-yellow/40 transition-colors">
              <BarChart2 size={11} />
              <span>{answeredCount}/{questions.length}</span>
            </button>
          )}

          {/* Flag toggle */}
          <button
            onClick={toggleFlag}
            className={`flex items-center gap-1 px-2.5 py-2 border rounded-lg text-[11px] font-inter font-bold active:scale-95 transition-all ${
              currentState.flagged
                ? "border-orange-500/50 bg-orange-500/15 text-orange-400 hover:bg-orange-500/25"
                : "border-warrior-border bg-warrior-gray/40 text-warrior-text hover:border-mdcat-yellow/40"
            }`}
          >
            <Flag size={11} />
            <span className="hidden sm:inline ml-1">{currentState.flagged ? "Flagged" : "Flag"}</span>
          </button>

          {/* Submit */}
          <button
            onClick={() => setSubmitModal(true)}
            className="flex items-center gap-1 px-3 py-2 border border-amber-500/50 bg-amber-500/10 text-amber-400 rounded-lg text-[12px] font-inter font-bold hover:bg-amber-500/20 hover:border-amber-500/70 active:scale-95 transition-all"
          >
            <Target size={11} />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>

        {/* Right: Next */}
        <button
          onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
          disabled={currentIdx === questions.length - 1}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-warrior-gray/30 border border-warrior-border rounded-lg text-white text-[12px] font-inter font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-warrior-text/40 transition-colors"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>

      {/* Mobile Nav Sheet — hidden in blind mode */}
      <AnimatePresence>
        {navOpen && !config.blindMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setNavOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 bg-dark-charcoal border-t border-warrior-border z-50 rounded-t-2xl max-h-[72vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-warrior-border flex-shrink-0">
                <div>
                  <p className="font-inter font-bold text-white text-[13px]">Question Navigator</p>
                  <p className="text-warrior-text text-[11px] font-inter">
                    {answeredCount}/{questions.length} answered · <span className="text-orange-400">{flaggedCount} flagged</span>
                  </p>
                </div>
                <button onClick={() => setNavOpen(false)}>
                  <XCircle size={18} className="text-warrior-text hover:text-white transition-colors" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-4">
                {SECTION_ORDER.map((sub) => {
                  const start = getSectionStart(sub);
                  return (
                    <div key={sub}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SECTION_COLORS[sub] }} />
                        <span className="text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text">{sub}</span>
                        {!config.blindMode && (
                          <span className="text-[10px] font-inter text-warrior-text ml-auto">
                            {states.slice(start, start + SECTION_COUNTS[sub]).filter((s) => s.selected !== null).length}/{SECTION_COUNTS[sub]}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: SECTION_COUNTS[sub] }).map((_, i) => {
                          const qi = start + i;
                          const s = states[qi];
                          return (
                            <button key={qi} onClick={() => { setCurrentIdx(qi); setNavOpen(false); }}
                              className={`h-7 rounded text-[9px] font-mono font-bold transition-all ${
                                qi === currentIdx ? "ring-2 ring-mdcat-yellow" : ""
                              } ${
                                s.selected !== null ? "bg-mdcat-yellow/45 text-white" :
                                s.flagged           ? "bg-orange-500/35 text-orange-300" :
                                                      "bg-warrior-black border border-warrior-border text-warrior-text/40"
                              }`}>
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Submit modal */}
      <AnimatePresence>
        {submitModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" onClick={() => setSubmitModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-3 right-3 bottom-3 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[380px] bg-dark-charcoal border border-warrior-border rounded-2xl p-5 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Target size={22} className="text-amber-400" />
              </div>
              <h3 className="font-poppins font-black text-white text-xl mb-1 text-center">Submit Simulation?</h3>
              <p className="text-warrior-text font-inter text-[12px] text-center mb-5">
                Time remaining:{" "}
                <span className={`${ts.text} font-bold font-mono`}>{fmtTime(timeRemaining)}</span>
                {" "}· This cannot be undone.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Answered",   value: answeredCount,                    color: "text-emerald-400" },
                  { label: "Flagged",    value: flaggedCount,                     color: "text-orange-400"  },
                  { label: "Unanswered", value: questions.length - answeredCount, color: "text-red-400"     },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-warrior-black border border-warrior-border rounded-xl py-3 text-center">
                    <p className={`font-poppins font-black text-2xl ${color}`}>{value}</p>
                    <p className="text-warrior-text text-[9px] font-inter mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {questions.length - answeredCount > 0 && (
                <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300 font-inter text-[12px] leading-relaxed">
                    <span className="font-bold">{questions.length - answeredCount} unanswered</span> questions will be marked incorrect.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setSubmitModal(false)}
                  className="flex-1 py-2.5 px-4 bg-warrior-gray/30 border border-warrior-border rounded-xl text-white text-[13px] font-inter font-bold hover:border-warrior-text/50 transition-colors">
                  Keep Going
                </button>
                <button onClick={doSubmit}
                  className="flex-1 py-2.5 px-4 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 text-[13px] font-inter font-bold flex items-center justify-center gap-2 hover:bg-amber-500/25 transition-colors">
                  <Target size={13} /> Submit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RESULTS SCREEN
═══════════════════════════════════════════════════════════ */
function ResultsScreen({
  questions,
  states,
  timeTaken,
  onRetake,
}: {
  questions: SimMCQ[];
  states: SimState[];
  timeTaken: number;
  onRetake: () => void;
}) {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);

  const totalCorrect = states.filter((s, i) => s.selected === questions[i].correct).length;
  const totalAnswered = states.filter((s) => s.selected !== null).length;
  const totalPct = Math.round((totalCorrect / questions.length) * 100);
  const grade = gradeLabel(totalPct);
  const percentile = estimatePercentile(totalCorrect);
  const avgTime = totalAnswered > 0 ? Math.round(timeTaken / totalAnswered) : 0;

  const sectionStats = SECTION_ORDER.map((sub) => {
    const start = getSectionStart(sub);
    const sq = questions.slice(start, start + SECTION_COUNTS[sub]);
    const ss = states.slice(start, start + SECTION_COUNTS[sub]);
    const correct = ss.filter((s, i) => s.selected === sq[i].correct).length;
    const answered = ss.filter((s) => s.selected !== null).length;
    return { sub, correct, answered, total: SECTION_COUNTS[sub], pct: Math.round((correct / SECTION_COUNTS[sub]) * 100) };
  });

  const bestSection  = [...sectionStats].sort((a, b) => b.pct - a.pct)[0];
  const worstSection = [...sectionStats].sort((a, b) => a.pct - b.pct)[0];

  const verdict = () => {
    if (totalPct >= 85) return "🏆 Outstanding. You're in serious contention for top medical colleges. Maintain this consistency on exam day.";
    if (totalPct >= 70) return "⚡ Solid result. You're above the qualifying threshold. Drill your weak sections to push even higher.";
    if (totalPct >= 55) return "📚 Decent foundation — but there's real ground to cover. Target your weak subjects with focused MCQ practice.";
    return "💪 This is your starting point, not your ceiling. Review weak topics systematically and retake regularly — the score will climb.";
  };

  return (
    <div className="min-h-screen bg-warrior-black">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-7">

        {/* ── HERO SCORE ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-dark-charcoal border border-warrior-border rounded-2xl p-7 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-mdcat-yellow/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-mdcat-yellow/10 border border-mdcat-yellow/25 rounded-full px-4 py-1.5 mb-5">
              <Swords size={12} className="text-mdcat-yellow" />
              <span className="text-mdcat-yellow text-[11px] font-inter font-black uppercase tracking-[0.16em]">Simulation Complete</span>
            </div>

            <div className="flex items-baseline justify-center gap-3 mb-1">
              <span className="font-poppins font-black text-mdcat-yellow" style={{ fontSize: "5rem", lineHeight: 1 }}>
                {totalCorrect}
              </span>
              <span className="font-inter text-warrior-text text-2xl">/ 200</span>
            </div>

            <p className={`font-poppins font-black text-2xl mb-1 ${grade.color}`}>{grade.text}</p>
            <p className="text-warrior-text font-inter text-sm">
              {totalPct}% correct · {totalAnswered}/{questions.length} attempted · Top {100 - percentile + 1}%
            </p>

            {/* Score bar */}
            <div className="mt-6 mb-2">
              <div className="h-3 bg-warrior-black rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalPct}%` }}
                  transition={{ duration: 1.3, ease: "easeOut", delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #D9534F 0%, #FFA500 50%, #10B981 100%)" }}
                />
                {/* Qualifying threshold marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: "65%" }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] font-inter text-warrior-text">0</span>
                <span className="text-[9px] font-inter text-amber-400 font-bold">Qualifying ≈ 65%</span>
                <span className="text-[9px] font-inter text-warrior-text">100%</span>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[
                { label: "Score",      value: `${totalCorrect}/200`,    color: "text-mdcat-yellow"        },
                { label: "Accuracy",   value: `${totalPct}%`,           color: scoreColor(totalPct)       },
                { label: "Avg/Q",      value: `${avgTime}s`,            color: "text-white"               },
                { label: "Percentile", value: `~${percentile}th`,       color: "text-white"               },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-warrior-black border border-warrior-border rounded-xl py-3">
                  <p className={`font-poppins font-black text-lg leading-none ${color}`}>{value}</p>
                  <p className="text-warrior-text text-[9px] font-inter mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── SECTION BREAKDOWN ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
            Subject Breakdown
          </p>
          <div className="bg-dark-charcoal border border-warrior-border rounded-xl overflow-hidden">
            {sectionStats.map((s, i) => (
              <div key={s.sub} className={i < sectionStats.length - 1 ? "border-b border-warrior-border" : ""}>
                <button
                  onClick={() => setExpandedSection(expandedSection === s.sub ? null : s.sub)}
                  className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-warrior-black/30 transition-colors"
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SECTION_COLORS[s.sub] }} />
                  <span className="font-inter font-semibold text-[13px] text-white flex-1 text-left">{s.sub}</span>
                  <span className="text-warrior-text text-[11px] font-inter">{s.correct}/{s.total}</span>
                  <div className="w-20 h-2 bg-warrior-black rounded-full overflow-hidden flex-shrink-0">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.07 + 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: SECTION_COLORS[s.sub] }}
                    />
                  </div>
                  <span className={`font-inter font-black text-[13px] w-10 text-right flex-shrink-0 ${scoreColor(s.pct)}`}>{s.pct}%</span>
                  <ChevronRight size={13} className={`text-warrior-text transition-transform flex-shrink-0 ${expandedSection === s.sub ? "rotate-90" : ""}`} />
                </button>

                {/* Expandable detail */}
                <AnimatePresence>
                  {expandedSection === s.sub && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 grid grid-cols-3 gap-2">
                        {[
                          { label: "Correct",    value: s.correct,           color: "text-emerald-400" },
                          { label: "Wrong",      value: s.answered - s.correct, color: "text-red-400" },
                          { label: "Unanswered", value: s.total - s.answered,  color: "text-warrior-text" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="bg-warrior-black border border-warrior-border rounded-lg py-2 text-center">
                            <p className={`font-poppins font-black text-lg ${color}`}>{value}</p>
                            <p className="text-warrior-text text-[9px] font-inter mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TIME & PERFORMANCE STATS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: "⏱️", label: "Time Taken",   value: fmtTime(timeTaken)              },
            { emoji: "⏳", label: "Time Left",     value: fmtTime(TOTAL_TIME - timeTaken) },
            { emoji: "📊", label: "Avg / Question", value: `${avgTime}s`                  },
            { emoji: "📈", label: "Est. Percentile", value: `~${percentile}th`            },
          ].map(({ emoji, label, value }) => (
            <div key={label} className="bg-dark-charcoal border border-warrior-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{emoji}</div>
              <p className="font-poppins font-black text-white text-lg leading-none">{value}</p>
              <p className="text-warrior-text text-[10px] font-inter mt-1">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── BEST / WORST ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}
          className="grid grid-cols-2 gap-3">
          <div className="bg-dark-charcoal border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-[10px] font-inter font-black uppercase tracking-[0.14em] text-emerald-400">Strongest</span>
            </div>
            <p className="font-inter font-bold text-white text-[13px]">{bestSection.sub}</p>
            <p className="font-poppins font-black text-emerald-400 text-2xl">{bestSection.pct}%</p>
            <p className="text-warrior-text text-[11px] font-inter">{bestSection.correct}/{bestSection.total} correct</p>
          </div>
          <div className="bg-dark-charcoal border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-[10px] font-inter font-black uppercase tracking-[0.14em] text-red-400">Needs Work</span>
            </div>
            <p className="font-inter font-bold text-white text-[13px]">{worstSection.sub}</p>
            <p className="font-poppins font-black text-red-400 text-2xl">{worstSection.pct}%</p>
            <p className="text-warrior-text text-[11px] font-inter">{worstSection.correct}/{worstSection.total} correct</p>
          </div>
        </motion.div>

        {/* ── ANALYSIS VERDICT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.32 }}
          className="callout-yellow bg-dark-charcoal/70 rounded-r-xl px-5 py-4">
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-mdcat-yellow mb-2">
            MDCATEMY Analysis
          </p>
          <p className="text-white/85 font-inter text-[13px] leading-relaxed">{verdict()}</p>
          {totalPct < 65 && (
            <p className="text-warrior-text font-inter text-[12px] mt-2.5">
              Target:{" "}
              <span className="text-mdcat-yellow font-bold">130+ / 200</span>
              {" "}to be in qualifying range for most public sector medical colleges.
            </p>
          )}
        </motion.div>

        {/* ── ACTIONS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.37 }}
          className="flex flex-col sm:flex-row gap-3 pb-8">
          <button onClick={onRetake}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Swords size={15} /> Retake Simulation
          </button>
          <Link href="/dashboard/mistakes" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-dark-charcoal border border-warrior-border rounded-xl text-white text-[13px] font-inter font-bold hover:border-warrior-text/40 transition-colors">
              <Eye size={15} /> Review Mistakes
            </button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <button className="btn-ghost w-full flex items-center justify-center gap-2">
              <ChevronLeft size={15} /> Dashboard
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SimulationPage() {
  const [screen, setScreen]       = useState<SimScreen>("briefing");
  const [config, setConfig]       = useState<SimConfig>({ noiseMode: "hall", blindMode: false });
  const [finalStates, setStates]  = useState<SimState[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);

  const handleStart    = (cfg: SimConfig) => { setConfig(cfg); setScreen("manual"); };
  const handleManual   = () => setScreen("countdown");
  const handleCountdown = () => setScreen("exam");
  const handleFinish   = (s: SimState[], t: number) => { setStates(s); setTimeTaken(t); setScreen("results"); };
  const handleRetake   = () => { setStates([]); setTimeTaken(0); setScreen("briefing"); };

  return (
    <AnimatePresence mode="wait">
      {screen === "briefing" && (
        <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <BriefingScreen onStart={handleStart} />
        </motion.div>
      )}
      {screen === "manual" && (
        <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <ManualScreen config={config} onBegin={handleManual} />
        </motion.div>
      )}
      {screen === "countdown" && (
        <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <CountdownScreen onBegin={handleCountdown} />
        </motion.div>
      )}
      {screen === "exam" && (
        <motion.div key="exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-screen">
          <ExamScreen questions={SIM_QUESTIONS} config={config} onFinish={handleFinish} />
        </motion.div>
      )}
      {screen === "results" && (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <ResultsScreen questions={SIM_QUESTIONS} states={finalStates} timeTaken={timeTaken} onRetake={handleRetake} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
