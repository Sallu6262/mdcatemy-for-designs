"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, BookmarkX, ChevronDown, ChevronUp, Search,
  FlaskConical, Atom, Zap, BookOpen, Brain,
  XCircle, CheckCircle2, Eye, EyeOff, RotateCcw,
  Trophy, Target, Flame, Filter, X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   SHARED TYPES
═══════════════════════════════════════════════════════════ */
type Subject = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning";
type Difficulty = "Easy" | "Medium" | "Hard";
type SortKey = "newest" | "oldest" | "difficulty" | "attempts";

/* ─────────────────────────────────────────
   SAVED COPY — data & components
───────────────────────────────────────── */
interface SavedMCQ {
  id: number;
  subject: Subject;
  chapter: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  savedAt: string;
}

const SAVED_MCQS: SavedMCQ[] = [
  {
    id: 1, subject: "Biology", chapter: "Cell Biology", topic: "Cell Organelles",
    question: "Which organelle is responsible for producing ATP through aerobic respiration and is often called the 'powerhouse of the cell'?",
    options: ["Ribosome", "Mitochondria", "Golgi apparatus", "Endoplasmic reticulum"],
    correct: 1, savedAt: "Today",
    explanation: "Mitochondria are the site of aerobic respiration, producing ATP via the Krebs cycle and oxidative phosphorylation. They have a double membrane — the inner membrane is folded into cristae to increase surface area for ATP synthase.",
  },
  {
    id: 2, subject: "Chemistry", chapter: "Chemical Bonding", topic: "Hybridization",
    question: "What is the hybridization of the central carbon atom in ethyne (C₂H₂)?",
    options: ["sp³", "sp²", "sp", "sp³d"],
    correct: 2, savedAt: "Today",
    explanation: "In ethyne (acetylene), each carbon forms one sigma bond with hydrogen and one sigma + two pi bonds with the other carbon (triple bond). This requires only two hybrid orbitals → sp hybridization. Bond angle = 180°, linear geometry.",
  },
  {
    id: 3, subject: "Physics", chapter: "Waves", topic: "Doppler Effect",
    question: "An ambulance moving toward a stationary observer emits a siren at 500 Hz. If the speed of sound is 340 m/s and the ambulance speed is 40 m/s, what frequency does the observer hear?",
    options: ["437 Hz", "500 Hz", "566 Hz", "463 Hz"],
    correct: 2, savedAt: "Yesterday",
    explanation: "Using the Doppler formula for a moving source approaching a stationary observer: f' = f × v/(v - vs) = 500 × 340/(340 - 40) = 500 × 340/300 ≈ 566.7 Hz.",
  },
  {
    id: 4, subject: "Biology", chapter: "Genetics", topic: "Mendelian Genetics",
    question: "In a dihybrid cross between two heterozygous parents (AaBb × AaBb), what is the expected phenotypic ratio?",
    options: ["1:2:1", "3:1", "9:3:3:1", "1:1:1:1"],
    correct: 2, savedAt: "Yesterday",
    explanation: "In a standard dihybrid cross (AaBb × AaBb), Mendel's Law of Independent Assortment gives a 9:3:3:1 phenotypic ratio — 9 A_B_ : 3 A_bb : 3 aaB_ : 1 aabb.",
  },
  {
    id: 5, subject: "Chemistry", chapter: "Organic Chemistry", topic: "Reaction Mechanisms",
    question: "Which type of reaction mechanism involves simultaneous bond breaking and bond formation in a single transition state?",
    options: ["SN1", "SN2", "E1", "Free radical"],
    correct: 1, savedAt: "2 days ago",
    explanation: "SN2 (bimolecular nucleophilic substitution) occurs in one concerted step — the nucleophile attacks the backside of the carbon as the leaving group departs simultaneously.",
  },
  {
    id: 6, subject: "English", chapter: "Reading Comprehension", topic: "Inference",
    question: "The word 'ephemeral' most closely means:",
    options: ["Eternal and everlasting", "Short-lived and transient", "Mysterious and obscure", "Vivid and memorable"],
    correct: 1, savedAt: "2 days ago",
    explanation: "'Ephemeral' comes from Greek 'ephemeros' meaning 'lasting only a day.' It describes something short-lived or transient.",
  },
  {
    id: 7, subject: "Physics", chapter: "Electrostatics", topic: "Coulomb's Law",
    question: "Two point charges of +2 μC and +8 μC are separated by 4 cm. At what distance from the +2 μC charge does the electric field equal zero?",
    options: ["1 cm", "1.33 cm", "2 cm", "3 cm"],
    correct: 1, savedAt: "3 days ago",
    explanation: "Let x = distance from +2μC charge. For zero field: k(2μC)/x² = k(8μC)/(4-x)². Taking square roots: √2/x = √8/(4-x) → x = 4/3 ≈ 1.33 cm.",
  },
  {
    id: 8, subject: "Logical Reasoning", chapter: "Analytical Reasoning", topic: "Syllogisms",
    question: "All mammals are warm-blooded. All whales are mammals. Which conclusion is definitely true?",
    options: ["All warm-blooded animals are whales", "All whales are warm-blooded", "Some warm-blooded animals are not mammals", "No fish are warm-blooded"],
    correct: 1, savedAt: "3 days ago",
    explanation: "From the two premises, by hypothetical syllogism: All whales → warm-blooded. Option B is the only valid deduction.",
  },
];

const SUBJECT_CFG: Record<Subject | "All", { color: string; bg: string; icon: React.ElementType }> = {
  All:                { color: "text-white",      bg: "bg-warrior-gray/30",  icon: Bookmark },
  Biology:            { color: "text-emerald-400", bg: "bg-emerald-400/10",  icon: FlaskConical },
  Chemistry:          { color: "text-violet-400",  bg: "bg-violet-400/10",   icon: Atom },
  Physics:            { color: "text-sky-400",     bg: "bg-sky-400/10",      icon: Zap },
  English:            { color: "text-amber-400",   bg: "bg-amber-400/10",    icon: BookOpen },
  "Logical Reasoning":{ color: "text-pink-400",    bg: "bg-pink-400/10",     icon: Brain },
};

const FILTER_TABS: (Subject | "All")[] = ["All", "Biology", "Chemistry", "Physics", "English", "Logical Reasoning"];

function SavedMCQCard({ mcq, onUnsave }: { mcq: SavedMCQ; onUnsave: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SUBJECT_CFG[mcq.subject];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="bg-dark-charcoal border border-warrior-border rounded-xl overflow-hidden"
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-inter font-semibold ${cfg.bg} ${cfg.color}`}>
              <Icon size={11} />{mcq.subject}
            </span>
            <span className="text-[11px] font-inter text-warrior-text bg-warrior-gray/20 px-2.5 py-1 rounded-full">
              {mcq.chapter}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-inter text-warrior-text hidden sm:block">{mcq.savedAt}</span>
            <button
              onClick={() => onUnsave(mcq.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-warrior-text hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Remove bookmark"
            >
              <BookmarkX size={15} />
            </button>
          </div>
        </div>
        <p className="font-inter font-medium text-white text-[14px] leading-relaxed">{mcq.question}</p>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-warrior-border/60 text-warrior-text hover:text-mdcat-yellow hover:bg-mdcat-yellow/5 transition-all"
      >
        <span className="font-inter font-semibold text-[12px] uppercase tracking-wide">
          {expanded ? "Hide Answer" : "Show Answer"}
        </span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3">
              <div className="space-y-2">
                {mcq.options.map((opt, i) => {
                  const isCorrect = i === mcq.correct;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${
                        isCorrect ? "bg-emerald-500/10 border-emerald-500/40" : "bg-warrior-gray/10 border-warrior-border/40"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold mt-[1px] ${
                        isCorrect ? "bg-emerald-500 text-white" : "bg-warrior-gray/30 text-warrior-text"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={`font-inter text-[13px] leading-snug ${isCorrect ? "text-emerald-300 font-semibold" : "text-warrior-text"}`}>
                        {opt}
                        {isCorrect && <span className="ml-2 text-[10px] font-bold text-emerald-400 uppercase">✓ Correct</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="callout-yellow rounded-r-lg py-3 px-4">
                <p className="text-[11px] font-inter font-bold text-mdcat-yellow uppercase tracking-wide mb-1.5">Explanation</p>
                <p className="font-inter text-[13px] text-[#CCCCCC] leading-relaxed">{mcq.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SavedCopyTab() {
  const [mcqs, setMcqs] = useState<SavedMCQ[]>(SAVED_MCQS);
  const [activeFilter, setActiveFilter] = useState<Subject | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = mcqs.filter((m) => {
    const matchSubject = activeFilter === "All" || m.subject === activeFilter;
    const matchSearch = !search.trim() || m.question.toLowerCase().includes(search.toLowerCase()) ||
      m.chapter.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const subjectCounts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? mcqs.length : mcqs.filter((m) => m.subject === tab).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions, chapters, topics..."
          className="w-full bg-dark-charcoal border border-warrior-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-inter text-white placeholder-warrior-text focus:outline-none focus:border-mdcat-yellow/50 transition-colors"
        />
      </div>

      {/* Subject filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab;
          const cfg = SUBJECT_CFG[tab];
          const Icon = cfg.icon;
          const count = subjectCounts[tab] ?? 0;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-inter font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? "bg-mdcat-yellow text-warrior-black shadow-[0_0_12px_rgba(255,198,0,0.25)]"
                  : "bg-dark-charcoal border border-warrior-border text-warrior-text hover:text-white"
              }`}
            >
              <Icon size={11} />
              <span>{tab === "Logical Reasoning" ? "LR" : tab}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-warrior-black/20 text-warrior-black" : "bg-warrior-gray/30 text-warrior-text"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MCQ list */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-warrior-gray/20 border border-warrior-border flex items-center justify-center mb-4">
              <Bookmark size={24} className="text-warrior-text" />
            </div>
            <p className="font-poppins font-bold text-white text-[15px] mb-1">
              {search || activeFilter !== "All" ? "No results" : "No saved MCQs yet"}
            </p>
            <p className="font-inter text-warrior-text text-[12px] max-w-[260px]">
              {search || activeFilter !== "All"
                ? "Try a different filter."
                : "Bookmark MCQs during a quiz and they'll appear here."}
            </p>
          </motion.div>
        ) : (
          <motion.div className="space-y-3">
            {filtered.map((mcq) => (
              <SavedMCQCard
                key={mcq.id}
                mcq={mcq}
                onUnsave={(id) => setMcqs((prev) => prev.filter((m) => m.id !== id))}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   MISTAKES COPY — data & components
───────────────────────────────────────── */
interface MistakeMCQ {
  id: number;
  subject: Subject;
  chapter: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correct: number;
  yourAnswer: number;
  explanation: string;
  addedAt: string;
  attempts: number;
  mastered: boolean;
}

const INITIAL_MISTAKES: MistakeMCQ[] = [
  {
    id: 1, subject: "Biology", chapter: "Bioenergetics", topic: "Photosynthesis",
    difficulty: "Hard", attempts: 3,
    question: "The oxygen released during photosynthesis comes from the splitting of:",
    options: ["Carbon dioxide", "Water", "Glucose", "ATP"],
    correct: 1, yourAnswer: 0,
    explanation: "During the light-dependent reactions, water molecules are split by photolysis (2H₂O → 4H⁺ + 4e⁻ + O₂). The oxygen released is entirely from water, not CO₂.",
    addedAt: "Today", mastered: false,
  },
  {
    id: 2, subject: "Chemistry", chapter: "Electrochemistry", topic: "Galvanic Cells",
    difficulty: "Medium", attempts: 2,
    question: "In a galvanic cell, the salt bridge serves to:",
    options: ["Transfer electrons between half-cells", "Maintain electrical neutrality in both solutions", "Increase the EMF of the cell", "Speed up the oxidation reaction"],
    correct: 1, yourAnswer: 0,
    explanation: "The salt bridge maintains electrical neutrality by allowing ions to migrate between the two half-cells. Electrons flow through the external circuit.",
    addedAt: "Today", mastered: false,
  },
  {
    id: 3, subject: "Physics", chapter: "Waves & Sound", topic: "Doppler Effect",
    difficulty: "Hard", attempts: 4,
    question: "A sound source moves AWAY from a stationary observer at half the speed of sound. The observed frequency will be:",
    options: ["Double the original", "Two-thirds of the original", "Half the original", "Equal to the original"],
    correct: 1, yourAnswer: 2,
    explanation: "f_obs = f × (v / (v + v/2)) = f × (2/3). So the observed frequency is 2/3 of the original.",
    addedAt: "Yesterday", mastered: false,
  },
  {
    id: 4, subject: "Biology", chapter: "Genetics & Inheritance", topic: "Mutations",
    difficulty: "Medium", attempts: 1,
    question: "A frameshift mutation is caused by:",
    options: ["Substitution of one nucleotide", "Insertion or deletion of nucleotides not in multiples of three", "Change in a single amino acid", "Inversion of a chromosome segment"],
    correct: 1, yourAnswer: 0,
    explanation: "Frameshift mutations occur when nucleotides are inserted or deleted in numbers not multiples of 3, shifting the reading frame of the entire downstream sequence.",
    addedAt: "Yesterday", mastered: false,
  },
  {
    id: 5, subject: "Chemistry", chapter: "Chemical Equilibrium", topic: "Le Chatelier's Principle",
    difficulty: "Medium", attempts: 2,
    question: "For the reaction N₂ + 3H₂ ⇌ 2NH₃ (exothermic), increasing temperature will:",
    options: ["Increase the yield of NH₃", "Decrease the yield of NH₃", "Have no effect on equilibrium", "Increase the rate of forward reaction only"],
    correct: 1, yourAnswer: 0,
    explanation: "For an exothermic reaction, increasing temperature shifts equilibrium LEFT (Le Chatelier's principle), decreasing the yield of NH₃.",
    addedAt: "2 days ago", mastered: false,
  },
  {
    id: 6, subject: "Physics", chapter: "Electricity", topic: "Circuits & Resistors",
    difficulty: "Easy", attempts: 1,
    question: "When resistors are connected in parallel, the total resistance is:",
    options: ["Greater than the largest individual resistance", "Equal to the sum of all resistances", "Less than the smallest individual resistance", "Equal to the average of all resistances"],
    correct: 2, yourAnswer: 1,
    explanation: "In parallel, 1/R_total = 1/R₁ + 1/R₂ + ... This always gives a total resistance LESS than the smallest individual resistor.",
    addedAt: "2 days ago", mastered: false,
  },
  {
    id: 7, subject: "Biology", chapter: "Homeostasis", topic: "Kidney Structure",
    difficulty: "Medium", attempts: 2,
    question: "Glucose is reabsorbed from the filtrate mainly in the:",
    options: ["Glomerulus", "Proximal convoluted tubule", "Loop of Henle", "Distal convoluted tubule"],
    correct: 1, yourAnswer: 3,
    explanation: "Glucose is almost entirely reabsorbed in the proximal convoluted tubule (PCT) via active transport (Na⁺/glucose co-transporters).",
    addedAt: "4 days ago", mastered: false,
  },
  {
    id: 8, subject: "English", chapter: "Vocabulary", topic: "Antonyms",
    difficulty: "Easy", attempts: 1,
    question: "The antonym of 'LOQUACIOUS' is:",
    options: ["Talkative", "Eloquent", "Taciturn", "Verbose"],
    correct: 2, yourAnswer: 1,
    explanation: "'Loquacious' means excessively talkative. Its antonym is 'taciturn', meaning reserved or saying very little.",
    addedAt: "3 days ago", mastered: false,
  },
  {
    id: 9, subject: "Chemistry", chapter: "Atomic Structure", topic: "Electronic Configuration",
    difficulty: "Medium", attempts: 2,
    question: "The element with electronic configuration [Ar] 3d¹⁰ 4s¹ is:",
    options: ["Potassium", "Copper", "Zinc", "Silver"],
    correct: 1, yourAnswer: 0,
    explanation: "Copper (Cu, Z=29) has [Ar] 3d¹⁰ 4s¹. This exception occurs because a completely filled d-subshell is extra stable.",
    addedAt: "4 days ago", mastered: false,
  },
  {
    id: 10, subject: "Physics", chapter: "Nuclear Physics", topic: "Radioactivity",
    difficulty: "Hard", attempts: 3,
    question: "After 3 half-lives, the fraction of a radioactive sample remaining is:",
    options: ["1/4", "1/6", "1/8", "1/16"],
    correct: 2, yourAnswer: 0,
    explanation: "After each half-life, half the remaining sample decays. (1/2)³ = 1/8.",
    addedAt: "5 days ago", mastered: false,
  },
];

const SUBJECT_COLORS: Record<Subject, string> = {
  Biology: "#10B981",
  Chemistry: "#38BDF8",
  Physics: "#A78BFA",
  English: "#2DD4BF",
  "Logical Reasoning": "#FB923C",
};

const DIFF_STYLES: Record<Difficulty, string> = {
  Easy:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  Hard:   "text-red-400 bg-red-400/10 border-red-400/25",
};

function MistakesCopyTab() {
  const [mistakes, setMistakes] = useState<MistakeMCQ[]>(INITIAL_MISTAKES);
  const [retestModal, setRetestModal] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<Subject | "All">("All");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "All">("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [showMastered, setShowMastered] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [masteringId, setMasteringId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const totalMistakes = mistakes.length;
  const masteredCount = mistakes.filter((m) => m.mastered).length;
  const activeMistakes = mistakes.filter((m) => !m.mastered);
  const masteredList = mistakes.filter((m) => m.mastered);
  const masteryPct = totalMistakes === 0 ? 0 : Math.round((masteredCount / totalMistakes) * 100);

  const subjects: Subject[] = ["Biology", "Chemistry", "Physics", "English", "Logical Reasoning"];

  const filtered = activeMistakes
    .filter((m) => {
      if (subjectFilter !== "All" && m.subject !== subjectFilter) return false;
      if (diffFilter !== "All" && m.difficulty !== diffFilter) return false;
      if (search && !m.question.toLowerCase().includes(search.toLowerCase()) &&
          !m.chapter.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "attempts") return b.attempts - a.attempts;
      if (sortBy === "difficulty") { const o = { Hard: 0, Medium: 1, Easy: 2 }; return o[a.difficulty] - o[b.difficulty]; }
      if (sortBy === "oldest") return a.id - b.id;
      return b.id - a.id;
    });

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const markMastered = (id: number) => {
    setMasteringId(id);
    setTimeout(() => {
      setMistakes((prev) => prev.map((m) => m.id === id ? { ...m, mastered: true } : m));
      setMasteringId(null);
    }, 500);
  };

  return (
    <div className="space-y-5">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <XCircle size={14} className="text-red-400" />,     label: "Total",   value: totalMistakes,        bg: "border-red-500/15 bg-red-500/5" },
          { icon: <Target size={14} className="text-warrior-text" />,  label: "Pending", value: activeMistakes.length, bg: "border-warrior-border" },
          { icon: <Trophy size={14} className="text-mdcat-yellow" />,  label: "Mastered",value: masteredCount,         bg: "border-mdcat-yellow/15 bg-mdcat-yellow/5" },
          { icon: <Flame size={14} className="text-emerald-400" />,    label: "Mastery", value: `${masteryPct}%`,      bg: "border-emerald-500/15 bg-emerald-500/5" },
        ].map((s, i) => (
          <div key={i} className={`bg-dark-charcoal border rounded-xl p-3.5 ${s.bg}`}>
            <div className="mb-2">{s.icon}</div>
            <p className="font-poppins font-black text-white text-xl leading-none">{s.value}</p>
            <p className="text-[10px] font-inter font-black uppercase tracking-[0.1em] text-warrior-text mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Re-test All */}
      {activeMistakes.length > 0 && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRetestModal(true)}
            className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-mdcat-yellow text-warrior-black text-[15px] font-poppins font-black uppercase tracking-wide hover:bg-mdcat-yellow-dark transition-colors shadow-[0_0_28px_rgba(255,198,0,0.35)] w-full sm:w-auto sm:min-w-[320px]"
            title={`Re-test all ${activeMistakes.length} pending mistake${activeMistakes.length === 1 ? "" : "s"}`}
          >
            <RotateCcw size={18} strokeWidth={2.5} />
            Re-test All Mistakes
            <span className="bg-warrior-black/15 px-2.5 py-1 rounded-full text-[12px] font-black">
              {activeMistakes.length}
            </span>
          </motion.button>
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none" />
            <input
              type="text"
              placeholder="Search question, chapter or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-charcoal border border-warrior-border rounded-xl pl-9 pr-4 py-2.5 text-white font-inter text-[13px] placeholder:text-warrior-text/50 focus:outline-none focus:border-mdcat-yellow/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-warrior-text hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-inter text-[12px] font-bold transition-all ${
              showFilters || subjectFilter !== "All" || diffFilter !== "All" || sortBy !== "newest"
                ? "border-mdcat-yellow/40 bg-mdcat-yellow/10 text-mdcat-yellow"
                : "border-warrior-border text-warrior-text hover:border-warrior-text/40"
            }`}
          >
            <Filter size={13} />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-dark-charcoal border border-warrior-border rounded-xl p-4 space-y-4">
                {/* Subject */}
                <div>
                  <p className="text-[9px] font-inter font-black uppercase tracking-[0.14em] text-warrior-text mb-2">Subject</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["All", ...subjects] as (Subject | "All")[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSubjectFilter(s)}
                        className={`px-3 py-1 rounded-full border text-[11px] font-inter font-bold transition-all ${
                          subjectFilter === s
                            ? "bg-mdcat-yellow text-warrior-black border-mdcat-yellow"
                            : "border-warrior-border text-warrior-text hover:border-warrior-text/50"
                        }`}
                      >
                        {s === "All" ? "All Subjects" : s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Difficulty + Sort */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-inter font-black uppercase tracking-[0.14em] text-warrior-text mb-2">Difficulty</p>
                    <div className="flex gap-1.5">
                      {(["All", "Easy", "Medium", "Hard"] as (Difficulty | "All")[]).map((d) => (
                        <button key={d} onClick={() => setDiffFilter(d)}
                          className={`px-2 py-1 rounded-full border text-[10px] font-inter font-bold transition-all flex-1 ${
                            diffFilter === d ? "bg-mdcat-yellow text-warrior-black border-mdcat-yellow" : "border-warrior-border text-warrior-text"
                          }`}
                        >
                          {d === "All" ? "All" : d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-inter font-black uppercase tracking-[0.14em] text-warrior-text mb-2">Sort by</p>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortKey)}
                      className="w-full bg-warrior-black border border-warrior-border rounded-lg px-2.5 py-1 text-white font-inter text-[11px] focus:outline-none"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="difficulty">Hardest first</option>
                      <option value="attempts">Most attempted</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MCQ list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activeMistakes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center"
            >
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={22} className="text-emerald-400" />
              </div>
              <p className="font-poppins font-black text-white text-lg mb-1">Clean slate, warrior.</p>
              <p className="text-warrior-text font-inter text-sm">No pending mistakes. Keep taking quizzes to track your weak spots.</p>
            </motion.div>
          )}

          {filtered.map((mcq, idx) => {
            const isExpanded = expandedIds.has(mcq.id);
            const isMastering = masteringId === mcq.id;

            return (
              <motion.div
                key={mcq.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isMastering ? 0 : 1, scale: isMastering ? 0.97 : 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="bg-dark-charcoal border border-warrior-border rounded-2xl overflow-hidden"
              >
                <div className="p-4">
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECT_COLORS[mcq.subject] }} />
                    <span className="text-[10px] font-inter font-bold text-warrior-text uppercase tracking-[0.1em]">{mcq.subject}</span>
                    <span className="text-warrior-border">·</span>
                    <span className="text-[10px] font-inter text-warrior-text/70">{mcq.chapter}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full border text-[9px] font-inter font-black uppercase tracking-[0.08em] ${DIFF_STYLES[mcq.difficulty]}`}>
                      {mcq.difficulty}
                    </span>
                  </div>

                  <p className="font-inter text-white text-[14px] leading-relaxed mb-4">{mcq.question}</p>

                  {/* Wrong vs Correct */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-red-500/8 border border-red-500/25">
                      <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={11} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-inter font-black uppercase tracking-[0.1em] text-red-400 mb-0.5">Your Answer</p>
                        <p className="text-red-300 font-inter text-[12px] leading-snug">
                          {String.fromCharCode(65 + mcq.yourAnswer)}. {mcq.options[mcq.yourAnswer]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
                      <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 size={11} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-inter font-black uppercase tracking-[0.1em] text-emerald-400 mb-0.5">Correct Answer</p>
                        <p className="text-emerald-300 font-inter text-[12px] leading-snug">
                          {String.fromCharCode(65 + mcq.correct)}. {mcq.options[mcq.correct]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: all options + explanation */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5 mb-3">
                          {mcq.options.map((opt, i) => {
                            const isCorrect = i === mcq.correct;
                            const isWrong = i === mcq.yourAnswer && i !== mcq.correct;
                            return (
                              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                                isCorrect ? "border-emerald-500/30 bg-emerald-500/5" :
                                isWrong   ? "border-red-500/30 bg-red-500/5" :
                                "border-warrior-border/50 opacity-50"
                              }`}>
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${
                                  isCorrect ? "bg-emerald-500 text-white" :
                                  isWrong   ? "bg-red-500 text-white" :
                                  "bg-warrior-gray text-warrior-text"
                                }`}>{String.fromCharCode(65 + i)}</div>
                                <span className={`font-inter text-[13px] flex-1 ${isCorrect ? "text-emerald-300" : isWrong ? "text-red-300" : "text-warrior-text"}`}>
                                  {opt}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="callout-yellow bg-warrior-black rounded-r-xl p-3.5 mb-3">
                          <p className="text-[9px] font-inter font-black uppercase tracking-[0.12em] text-mdcat-yellow mb-1.5">Explanation</p>
                          <p className="text-white/85 font-inter text-[13px] leading-relaxed">{mcq.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => toggleExpand(mcq.id)}
                      className="flex items-center gap-1.5 text-[11px] font-inter font-bold text-mdcat-yellow hover:underline"
                    >
                      {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                      {isExpanded ? "Collapse" : "All options & explanation"}
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    <button
                      onClick={() => markMastered(mcq.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-inter font-bold hover:bg-emerald-500/20 transition-all"
                    >
                      <Trophy size={11} />
                      Mark Mastered
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mastered accordion */}
      {masteredList.length > 0 && (
        <div className="border border-warrior-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowMastered(!showMastered)}
            className="w-full flex items-center justify-between px-5 py-4 bg-dark-charcoal hover:bg-warrior-gray/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                <Trophy size={12} className="text-emerald-400" />
              </div>
              <span className="font-inter font-bold text-[13px] text-white">Mastered</span>
              <span className="text-[11px] font-inter text-emerald-400 font-bold">{masteredList.length} cleared</span>
            </div>
            {showMastered ? <ChevronUp size={15} className="text-warrior-text" /> : <ChevronDown size={15} className="text-warrior-text" />}
          </button>
          <AnimatePresence>
            {showMastered && (
              <motion.div
                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                transition={{ duration: 0.25 }} className="overflow-hidden"
              >
                <div className="divide-y divide-warrior-border/40">
                  {masteredList.map((mcq) => (
                    <div key={mcq.id} className="px-5 py-3 flex items-center justify-between gap-3 bg-dark-charcoal/50">
                      <div>
                        <p className="font-inter text-[13px] text-warrior-text/70 line-clamp-1">{mcq.question}</p>
                        <p className="text-[10px] font-inter text-warrior-text/50 mt-0.5">{mcq.subject} · {mcq.chapter}</p>
                      </div>
                      <button
                        onClick={() => setMistakes((prev) => prev.map((m) => m.id === mcq.id ? { ...m, mastered: false } : m))}
                        className="text-[10px] font-inter font-bold text-warrior-text hover:text-mdcat-yellow whitespace-nowrap flex-shrink-0"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── RE-TEST PREFERENCE MODAL ── */}
      <AnimatePresence>
        {retestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setRetestModal(false)}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[360px] bg-dark-charcoal border border-warrior-border rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <XCircle size={19} className="text-red-400" />
              </div>
              <h3 className="font-poppins font-black text-white text-[16px] leading-snug mb-2">
                Remove mastered MCQs?
              </h3>
              <p className="text-warrior-text font-inter text-[13px] leading-relaxed mb-6">
                If you answer an MCQ correctly during this re-test, should it be automatically removed from your Mistake Copy?
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setRetestModal(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-red-500/30 bg-red-500/8 hover:border-red-500/60 hover:bg-red-500/15 text-white font-poppins font-black text-[13px] transition-all active:scale-[0.98] text-left"
                >
                  <CheckCircle2 size={15} className="text-red-400 flex-shrink-0" />
                  Yes, remove when I get it right
                </button>
                <button
                  onClick={() => setRetestModal(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-warrior-border bg-warrior-black/40 hover:border-warrior-border/80 hover:bg-dark-charcoal text-warrior-text hover:text-white font-poppins font-black text-[13px] transition-all active:scale-[0.98] text-left"
                >
                  <X size={15} className="text-warrior-text/60 flex-shrink-0" />
                  No, keep all until I review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE — My Copy (tabbed)
═══════════════════════════════════════════════════════════ */
type CopyTab = "saved" | "mistakes";

export default function MyCopyPage() {
  const [activeTab, setActiveTab] = useState<CopyTab>("saved");

  const TABS: { key: CopyTab; label: string; icon: React.ElementType }[] = [
    { key: "saved",    label: "Saved Copy",    icon: Bookmark },
    { key: "mistakes", label: "Mistakes Copy", icon: XCircle },
  ];

  return (
    <div className="min-h-full px-4 lg:px-8 py-6 max-w-4xl mx-auto">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="font-poppins font-black text-white text-[22px] lg:text-[26px]">My Copy</h1>
        <p className="font-inter text-warrior-text text-[13px] mt-1">
          Your saved MCQs and mistake log — all in one place.
        </p>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="flex gap-1 bg-warrior-black border border-warrior-border rounded-xl p-1 mb-6"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-inter font-bold transition-all duration-200 ${
                isActive
                  ? "bg-mdcat-yellow text-warrior-black shadow-sm"
                  : "text-warrior-text hover:text-white"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "saved" ? <SavedCopyTab /> : <MistakesCopyTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
