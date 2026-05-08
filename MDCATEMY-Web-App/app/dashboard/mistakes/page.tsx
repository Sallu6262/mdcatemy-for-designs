"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XCircle, CheckCircle2, ChevronDown, ChevronUp,
  Search, RotateCcw, Trophy, Target, Filter,
  BookMarked, TrendingUp, Flame, AlertTriangle,
  Eye, EyeOff, Zap, ChevronRight, X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Subject = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning";
type Difficulty = "Easy" | "Medium" | "Hard";
type SortKey = "newest" | "oldest" | "difficulty" | "attempts";

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

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — realistic MDCAT wrong answers
═══════════════════════════════════════════════════════════ */
const INITIAL_MISTAKES: MistakeMCQ[] = [
  {
    id: 1, subject: "Biology", chapter: "Bioenergetics", topic: "Photosynthesis",
    difficulty: "Hard", attempts: 3,
    question: "The oxygen released during photosynthesis comes from the splitting of:",
    options: ["Carbon dioxide", "Water", "Glucose", "ATP"],
    correct: 1, yourAnswer: 0,
    explanation: "During the light-dependent reactions, water molecules are split by photolysis (2H₂O → 4H⁺ + 4e⁻ + O₂). The oxygen released is entirely from water, not CO₂. CO₂ is fixed in the Calvin cycle to form glucose.",
    addedAt: "Today", mastered: false,
  },
  {
    id: 2, subject: "Chemistry", chapter: "Electrochemistry", topic: "Galvanic Cells",
    difficulty: "Medium", attempts: 2,
    question: "In a galvanic cell, the salt bridge serves to:",
    options: ["Transfer electrons between half-cells", "Maintain electrical neutrality in both solutions", "Increase the EMF of the cell", "Speed up the oxidation reaction"],
    correct: 1, yourAnswer: 0,
    explanation: "The salt bridge maintains electrical neutrality by allowing ions to migrate between the two half-cells. Without it, charge would build up and stop the current. Electrons flow through the external circuit, not through the salt bridge.",
    addedAt: "Today", mastered: false,
  },
  {
    id: 3, subject: "Physics", chapter: "Waves & Sound", topic: "Doppler Effect",
    difficulty: "Hard", attempts: 4,
    question: "A sound source moves AWAY from a stationary observer at half the speed of sound. The observed frequency will be:",
    options: ["Double the original", "Two-thirds of the original", "Half the original", "Equal to the original"],
    correct: 1, yourAnswer: 2,
    explanation: "Using the Doppler formula: f_obs = f_source × (v / (v + v_source)). With v_source = v/2: f_obs = f × (v / (v + v/2)) = f × (v / 1.5v) = f × (2/3). So the observed frequency is 2/3 of the original.",
    addedAt: "Yesterday", mastered: false,
  },
  {
    id: 4, subject: "Biology", chapter: "Genetics & Inheritance", topic: "Mutations",
    difficulty: "Medium", attempts: 1,
    question: "A frameshift mutation is caused by:",
    options: ["Substitution of one nucleotide", "Insertion or deletion of nucleotides not in multiples of three", "Change in a single amino acid", "Inversion of a chromosome segment"],
    correct: 1, yourAnswer: 0,
    explanation: "Frameshift mutations occur when nucleotides are inserted or deleted in numbers that are not multiples of 3, shifting the reading frame of the entire downstream sequence. This typically causes a completely different (and usually non-functional) protein to be produced.",
    addedAt: "Yesterday", mastered: false,
  },
  {
    id: 5, subject: "Chemistry", chapter: "Chemical Equilibrium", topic: "Le Chatelier's Principle",
    difficulty: "Medium", attempts: 2,
    question: "For the reaction N₂ + 3H₂ ⇌ 2NH₃ (exothermic), increasing temperature will:",
    options: ["Increase the yield of NH₃", "Decrease the yield of NH₃", "Have no effect on equilibrium", "Increase the rate of forward reaction only"],
    correct: 1, yourAnswer: 0,
    explanation: "For an exothermic reaction, increasing temperature shifts the equilibrium to the LEFT (towards reactants) to absorb the extra heat (Le Chatelier's principle). This DECREASES the yield of NH₃. The reaction rate increases, but the equilibrium position shifts backward.",
    addedAt: "2 days ago", mastered: false,
  },
  {
    id: 6, subject: "Physics", chapter: "Electricity", topic: "Circuits & Resistors",
    difficulty: "Easy", attempts: 1,
    question: "When resistors are connected in parallel, the total resistance is:",
    options: ["Greater than the largest individual resistance", "Equal to the sum of all resistances", "Less than the smallest individual resistance", "Equal to the average of all resistances"],
    correct: 2, yourAnswer: 1,
    explanation: "In a parallel circuit, 1/R_total = 1/R₁ + 1/R₂ + ... This always gives a total resistance LESS than the smallest individual resistor. Adding more parallel paths gives current more routes to flow, effectively reducing overall resistance.",
    addedAt: "2 days ago", mastered: false,
  },
  {
    id: 7, subject: "Biology", chapter: "Transport", topic: "Cardiac Cycle",
    difficulty: "Hard", attempts: 3,
    question: "During ventricular systole, the pressure in the left ventricle:",
    options: ["Falls below aortic pressure", "Rises above aortic pressure to open the aortic valve", "Remains equal to atrial pressure", "Drops to zero"],
    correct: 1, yourAnswer: 0,
    explanation: "During ventricular systole (contraction), pressure in the left ventricle rises sharply. Once it EXCEEDS the aortic pressure (~80 mmHg diastolic), the aortic valve opens and blood is ejected. The valve closes when ventricular pressure falls below aortic pressure during diastole.",
    addedAt: "3 days ago", mastered: false,
  },
  {
    id: 8, subject: "English", chapter: "Vocabulary", topic: "Antonyms",
    difficulty: "Easy", attempts: 1,
    question: "The antonym of 'LOQUACIOUS' is:",
    options: ["Talkative", "Eloquent", "Taciturn", "Verbose"],
    correct: 2, yourAnswer: 1,
    explanation: "'Loquacious' means excessively talkative. Its antonym is 'taciturn', meaning reserved or saying very little. 'Eloquent' (well-spoken) and 'verbose' (using too many words) are actually related to being talkative, not its opposite.",
    addedAt: "3 days ago", mastered: false,
  },
  {
    id: 9, subject: "Chemistry", chapter: "Atomic Structure", topic: "Electronic Configuration",
    difficulty: "Medium", attempts: 2,
    question: "The element with electronic configuration [Ar] 3d¹⁰ 4s¹ is:",
    options: ["Potassium", "Copper", "Zinc", "Silver"],
    correct: 1, yourAnswer: 0,
    explanation: "Copper (Cu, Z=29) has the configuration [Ar] 3d¹⁰ 4s¹ — not [Ar] 3d⁹ 4s² as expected. This exception occurs because a completely filled d-subshell (3d¹⁰) is extra stable, so one electron moves from 4s to 3d. Potassium is [Ar] 4s¹.",
    addedAt: "4 days ago", mastered: false,
  },
  {
    id: 10, subject: "Biology", chapter: "Homeostasis", topic: "Kidney Structure",
    difficulty: "Medium", attempts: 2,
    question: "Glucose is reabsorbed from the filtrate mainly in the:",
    options: ["Glomerulus", "Proximal convoluted tubule", "Loop of Henle", "Distal convoluted tubule"],
    correct: 1, yourAnswer: 3,
    explanation: "Glucose is almost entirely reabsorbed in the proximal convoluted tubule (PCT) via active transport (Na⁺/glucose co-transporters). Normally, no glucose appears in the final urine. The loop of Henle is mainly involved in water and salt concentration.",
    addedAt: "4 days ago", mastered: false,
  },
  {
    id: 11, subject: "Physics", chapter: "Nuclear Physics", topic: "Radioactivity",
    difficulty: "Hard", attempts: 3,
    question: "After 3 half-lives, the fraction of a radioactive sample remaining is:",
    options: ["1/4", "1/6", "1/8", "1/16"],
    correct: 2, yourAnswer: 0,
    explanation: "After each half-life, half the remaining sample decays. After 1 half-life: 1/2 remains. After 2: 1/4. After 3: 1/8. The formula is (1/2)ⁿ where n = number of half-lives. So (1/2)³ = 1/8.",
    addedAt: "5 days ago", mastered: false,
  },
  {
    id: 12, subject: "Logical Reasoning", chapter: "Syllogisms", topic: "Complex Syllogisms",
    difficulty: "Hard", attempts: 2,
    question: "All A are B. No B are C. Conclusion: No A are C.",
    options: ["True", "False", "Uncertain", "Partially true"],
    correct: 0, yourAnswer: 2,
    explanation: "If all A are B, and no B are C, then by transitivity, no A can be C (since A is a subset of B, and B has no overlap with C). The conclusion 'No A are C' is definitively TRUE. This is a valid categorical syllogism.",
    addedAt: "5 days ago", mastered: false,
  },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeMCQ[]>(INITIAL_MISTAKES);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<Subject | "All">("All");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "All">("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [showMastered, setShowMastered] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [masteringId, setMasteringId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [retestModal, setRetestModal] = useState(false);

  /* ── derived ── */
  const totalMistakes = mistakes.length;
  const masteredCount = mistakes.filter((m) => m.mastered).length;
  const activeMistakes = mistakes.filter((m) => !m.mastered);
  const masteredList = mistakes.filter((m) => m.mastered);
  const masteryPct = totalMistakes === 0 ? 0 : Math.round((masteredCount / totalMistakes) * 100);

  const filtered = activeMistakes
    .filter((m) => {
      if (subjectFilter !== "All" && m.subject !== subjectFilter) return false;
      if (diffFilter !== "All" && m.difficulty !== diffFilter) return false;
      if (search && !m.question.toLowerCase().includes(search.toLowerCase()) &&
          !m.chapter.toLowerCase().includes(search.toLowerCase()) &&
          !m.topic.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "attempts") return b.attempts - a.attempts;
      if (sortBy === "difficulty") {
        const order = { Hard: 0, Medium: 1, Easy: 2 };
        return order[a.difficulty] - order[b.difficulty];
      }
      if (sortBy === "oldest") return a.id - b.id;
      return b.id - a.id; // newest
    });

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markMastered = (id: number) => {
    setMasteringId(id);
    setTimeout(() => {
      setMistakes((prev) => prev.map((m) => m.id === id ? { ...m, mastered: true } : m));
      setMasteringId(null);
    }, 500);
  };

  const unmarkMastered = (id: number) => {
    setMistakes((prev) => prev.map((m) => m.id === id ? { ...m, mastered: false } : m));
  };

  const subjects: Subject[] = ["Biology", "Chemistry", "Physics", "English", "Logical Reasoning"];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">

      {/* ── PAGE HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
            <XCircle size={18} className="text-red-400" />
          </div>
          <div>
            <h1 className="font-poppins font-black text-white text-xl leading-tight">Mistake Copy</h1>
            <p className="text-warrior-text font-inter text-[12px] mt-0.5">
              Every wrong answer is a lesson. Learn them all.
            </p>
          </div>
        </div>
        <button
          onClick={() => setRetestModal(true)}
          disabled={activeMistakes.length === 0}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-[12px] font-bold flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline">Re-test All</span>
          <span className="sm:hidden">Re-test</span>
        </button>
      </motion.div>

      {/* ── STATS ROW ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          {
            icon: <XCircle size={15} className="text-red-400" />,
            label: "Total Mistakes",
            value: totalMistakes,
            sub: "across all quizzes",
            bg: "border-red-500/15 bg-red-500/5",
          },
          {
            icon: <Target size={15} className="text-warrior-text" />,
            label: "Still Pending",
            value: activeMistakes.length,
            sub: "need your attention",
            bg: "border-warrior-border",
          },
          {
            icon: <Trophy size={15} className="text-mdcat-yellow" />,
            label: "Mastered",
            value: masteredCount,
            sub: "conquered for good",
            bg: "border-mdcat-yellow/15 bg-mdcat-yellow/5",
          },
          {
            icon: <Flame size={15} className="text-emerald-400" />,
            label: "Mastery Rate",
            value: `${masteryPct}%`,
            sub: "of all mistakes cleared",
            bg: "border-emerald-500/15 bg-emerald-500/5",
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={`bg-dark-charcoal border rounded-xl p-4 ${s.bg}`}
          >
            <div className="flex items-center gap-2 mb-2">{s.icon}</div>
            <p className="font-poppins font-black text-white text-2xl leading-none">{s.value}</p>
            <p className="text-[10px] font-inter font-black uppercase tracking-[0.1em] text-warrior-text mt-1">{s.label}</p>
            <p className="text-[10px] font-inter text-warrior-text/60 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── MASTERY PROGRESS BAR ── */}
      {totalMistakes > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-dark-charcoal border border-warrior-border rounded-xl px-5 py-4"
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-inter font-bold text-white">Overall Mastery Progress</p>
            <p className="text-[11px] font-inter font-bold text-mdcat-yellow">{masteredCount} / {totalMistakes}</p>
          </div>
          <div className="h-2.5 bg-warrior-gray/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${masteryPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: masteryPct === 100 ? "#10B981" : "linear-gradient(90deg, #FFC600, #E6A800)" }}
            />
          </div>
          {masteryPct === 100 && (
            <p className="text-[11px] font-inter text-emerald-400 font-bold mt-2">
              All mistakes mastered. You are a warrior.
            </p>
          )}
        </motion.div>
      )}

      {/* ── SEARCH + FILTERS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {/* Search + filter toggle */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none" />
            <input
              type="text"
              placeholder="Search by question, chapter or topic..."
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
            {(subjectFilter !== "All" || diffFilter !== "All") && (
              <span className="w-4 h-4 bg-mdcat-yellow text-warrior-black text-[9px] rounded-full flex items-center justify-center font-black">
                {(subjectFilter !== "All" ? 1 : 0) + (diffFilter !== "All" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
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
                          className={`px-2.5 py-1 rounded-full border text-[10px] font-inter font-bold transition-all flex-1 ${
                            diffFilter === d
                              ? "bg-mdcat-yellow text-warrior-black border-mdcat-yellow"
                              : "border-warrior-border text-warrior-text hover:border-warrior-text/40"
                          }`}>
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
                      className="w-full bg-warrior-black border border-warrior-border rounded-lg px-2.5 py-1 text-white font-inter text-[11px] focus:outline-none focus:border-mdcat-yellow/50"
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
      </motion.div>

      {/* ── RESULTS COUNT ── */}
      {activeMistakes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-inter text-warrior-text">
            Showing <span className="text-white font-bold">{filtered.length}</span> of {activeMistakes.length} pending
          </p>
          {(subjectFilter !== "All" || diffFilter !== "All" || search) && (
            <button
              onClick={() => { setSubjectFilter("All"); setDiffFilter("All"); setSearch(""); }}
              className="text-[10px] font-inter font-bold text-warrior-text hover:text-mdcat-yellow transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── MCQ LIST ── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && activeMistakes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <Search size={28} className="text-warrior-border mx-auto mb-3" />
              <p className="text-white font-inter font-bold">No mistakes match your filters</p>
              <p className="text-warrior-text font-inter text-sm mt-1">Try adjusting the subject or difficulty</p>
            </motion.div>
          )}

          {activeMistakes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={24} className="text-emerald-400" />
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
                animate={{ opacity: isMastering ? 0 : 1, y: 0, scale: isMastering ? 0.97 : 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="bg-dark-charcoal border border-warrior-border rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <div className="p-4 lg:p-5">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECT_COLORS[mcq.subject] }} />
                    <span className="text-[10px] font-inter font-bold text-warrior-text uppercase tracking-[0.1em]">
                      {mcq.subject}
                    </span>
                    <span className="text-warrior-border">·</span>
                    <span className="text-[10px] font-inter text-warrior-text/70">{mcq.chapter}</span>
                    <span className="text-warrior-border">·</span>
                    <span className="text-[10px] font-inter text-warrior-text/50">{mcq.topic}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full border text-[9px] font-inter font-black uppercase tracking-[0.08em] ${DIFF_STYLES[mcq.difficulty]}`}>
                      {mcq.difficulty}
                    </span>
                  </div>

                  {/* Question */}
                  <p className="font-inter text-white text-[14px] leading-relaxed mb-4">{mcq.question}</p>

                  {/* Answers: wrong vs correct */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {/* Wrong answer */}
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-500/8 border border-red-500/25">
                      <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={12} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-inter font-black uppercase tracking-[0.1em] text-red-400 mb-0.5">Your Answer</p>
                        <p className="text-red-300 font-inter text-[12px] leading-snug">
                          {String.fromCharCode(65 + mcq.yourAnswer)}. {mcq.options[mcq.yourAnswer]}
                        </p>
                      </div>
                    </div>
                    {/* Correct answer */}
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
                      <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-inter font-black uppercase tracking-[0.1em] text-emerald-400 mb-0.5">Correct Answer</p>
                        <p className="text-emerald-300 font-inter text-[12px] leading-snug">
                          {String.fromCharCode(65 + mcq.correct)}. {mcq.options[mcq.correct]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* All options (collapsed by default) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5 mb-4">
                          {mcq.options.map((opt, i) => {
                            const isCorrect = i === mcq.correct;
                            const isWrong = i === mcq.yourAnswer && i !== mcq.correct;
                            return (
                              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                                isCorrect ? "border-emerald-500/30 bg-emerald-500/5" :
                                isWrong ? "border-red-500/30 bg-red-500/5" :
                                "border-warrior-border/50 bg-transparent opacity-50"
                              }`}>
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] font-mono font-bold ${
                                  isCorrect ? "bg-emerald-500 text-white" :
                                  isWrong ? "bg-red-500 text-white" :
                                  "bg-warrior-gray text-warrior-text"
                                }`}>{String.fromCharCode(65 + i)}</div>
                                <span className={`font-inter text-[13px] flex-1 ${isCorrect ? "text-emerald-300" : isWrong ? "text-red-300" : "text-warrior-text"}`}>{opt}</span>
                                {isCorrect && <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />}
                                {isWrong && <X size={13} className="text-red-400 flex-shrink-0" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="callout-yellow bg-warrior-black rounded-r-xl p-4 mb-4">
                          <p className="text-[9px] font-inter font-black uppercase tracking-[0.12em] text-mdcat-yellow mb-2">Explanation</p>
                          <p className="text-white/85 font-inter text-[13px] leading-relaxed">{mcq.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleExpand(mcq.id)}
                        className="flex items-center gap-1.5 text-[11px] font-inter font-bold text-mdcat-yellow hover:underline"
                      >
                        {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                        {isExpanded ? "Collapse" : "See all options & explanation"}
                        {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                      <span className="text-warrior-border text-[10px]">·</span>
                      <span className="text-[10px] font-inter text-warrior-text/60">
                        {mcq.attempts}× attempted · {mcq.addedAt}
                      </span>
                    </div>

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

      {/* ── MASTERED SECTION ── */}
      {masteredList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border border-warrior-border rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => setShowMastered(!showMastered)}
            className="w-full flex items-center justify-between px-5 py-4 bg-dark-charcoal hover:bg-warrior-gray/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                <Trophy size={13} className="text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-inter font-bold text-[13px]">Mastered</p>
                <p className="text-warrior-text font-inter text-[11px]">{masteredList.length} MCQs you&apos;ve conquered</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-inter font-black text-emerald-400 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                {masteredList.length} mastered
              </span>
              {showMastered ? <ChevronUp size={15} className="text-warrior-text" /> : <ChevronDown size={15} className="text-warrior-text" />}
            </div>
          </button>

          <AnimatePresence>
            {showMastered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-warrior-border/50">
                  {masteredList.map((mcq) => (
                    <div key={mcq.id} className="px-5 py-4 bg-warrior-black/40">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECT_COLORS[mcq.subject] }} />
                            <span className="text-[9px] font-inter text-warrior-text/60 uppercase tracking-[0.1em]">
                              {mcq.subject} · {mcq.chapter}
                            </span>
                          </div>
                          <p className="text-warrior-text/70 font-inter text-[13px] leading-snug line-clamp-1">{mcq.question}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] font-inter text-emerald-400/60">Mastered</span>
                          <button
                            onClick={() => unmarkMastered(mcq.id)}
                            className="text-[9px] font-inter text-warrior-text/50 hover:text-red-400 transition-colors underline underline-offset-2"
                          >
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
              {/* Icon */}
              <div className="w-11 h-11 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <XCircle size={19} className="text-red-400" />
              </div>

              {/* Text */}
              <h3 className="font-poppins font-black text-white text-[16px] leading-snug mb-2">
                Remove mastered MCQs?
              </h3>
              <p className="text-warrior-text font-inter text-[13px] leading-relaxed mb-6">
                If you answer an MCQ correctly during this re-test, should it be automatically removed from your Mistake Copy?
              </p>

              {/* Options */}
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-warrior-border bg-warrior-black/40 hover:border-warrior-border/80 hover:bg-warrior-gray/20 text-warrior-text hover:text-white font-poppins font-black text-[13px] transition-all active:scale-[0.98] text-left"
                >
                  <X size={15} className="text-warrior-text/60 flex-shrink-0" />
                  No, keep all until I review
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
