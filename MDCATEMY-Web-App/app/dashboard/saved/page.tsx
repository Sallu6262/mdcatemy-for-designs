"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkX,
  ChevronDown,
  ChevronUp,
  Search,
  FlaskConical,
  Atom,
  Zap,
  BookOpen,
  Brain,
} from "lucide-react";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Subject = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning";

interface SavedMCQ {
  id: number;
  subject: Subject;
  chapter: string;
  topic: string;
  question: string;
  options: string[];
  correct: number; // 0-indexed
  explanation: string;
  savedAt: string; // e.g. "2 days ago"
}

/* ─────────────────────────────────────────
   Mock saved MCQs
───────────────────────────────────────── */
const SAVED_MCQS: SavedMCQ[] = [
  {
    id: 1,
    subject: "Biology",
    chapter: "Cell Biology",
    topic: "Cell Organelles",
    question:
      "Which organelle is responsible for producing ATP through aerobic respiration and is often called the 'powerhouse of the cell'?",
    options: ["Ribosome", "Mitochondria", "Golgi apparatus", "Endoplasmic reticulum"],
    correct: 1,
    explanation:
      "Mitochondria are the site of aerobic respiration, producing ATP via the Krebs cycle and oxidative phosphorylation. They have a double membrane — the inner membrane is folded into cristae to increase surface area for ATP synthase.",
    savedAt: "Today",
  },
  {
    id: 2,
    subject: "Chemistry",
    chapter: "Chemical Bonding",
    topic: "Hybridization",
    question:
      "What is the hybridization of the central carbon atom in ethyne (C₂H₂)?",
    options: ["sp³", "sp²", "sp", "sp³d"],
    correct: 2,
    explanation:
      "In ethyne (acetylene), each carbon forms one sigma bond with hydrogen and one sigma + two pi bonds with the other carbon (triple bond). This requires only two hybrid orbitals → sp hybridization. Bond angle = 180°, linear geometry.",
    savedAt: "Today",
  },
  {
    id: 3,
    subject: "Physics",
    chapter: "Waves",
    topic: "Doppler Effect",
    question:
      "An ambulance moving toward a stationary observer emits a siren at 500 Hz. If the speed of sound is 340 m/s and the ambulance speed is 40 m/s, what frequency does the observer hear?",
    options: ["437 Hz", "500 Hz", "566 Hz", "463 Hz"],
    correct: 2,
    explanation:
      "Using the Doppler formula for a moving source approaching a stationary observer: f' = f × v/(v - vs) = 500 × 340/(340 - 40) = 500 × 340/300 ≈ 566.7 Hz. The frequency increases when the source approaches.",
    savedAt: "Yesterday",
  },
  {
    id: 4,
    subject: "Biology",
    chapter: "Genetics",
    topic: "Mendelian Genetics",
    question:
      "In a dihybrid cross between two heterozygous parents (AaBb × AaBb), what is the expected phenotypic ratio?",
    options: ["1:2:1", "3:1", "9:3:3:1", "1:1:1:1"],
    correct: 2,
    explanation:
      "In a standard dihybrid cross (AaBb × AaBb) where genes assort independently, Mendel's Law of Independent Assortment gives a 9:3:3:1 phenotypic ratio — 9 A_B_ : 3 A_bb : 3 aaB_ : 1 aabb. This ratio assumes complete dominance at both loci.",
    savedAt: "Yesterday",
  },
  {
    id: 5,
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    topic: "Reaction Mechanisms",
    question:
      "Which type of reaction mechanism involves simultaneous bond breaking and bond formation in a single transition state?",
    options: ["SN1", "SN2", "E1", "Free radical"],
    correct: 1,
    explanation:
      "SN2 (bimolecular nucleophilic substitution) occurs in one concerted step — the nucleophile attacks the backside of the carbon as the leaving group departs simultaneously. This gives inversion of configuration (Walden inversion) and shows second-order kinetics: rate = k[substrate][nucleophile].",
    savedAt: "2 days ago",
  },
  {
    id: 6,
    subject: "English",
    chapter: "Reading Comprehension",
    topic: "Inference",
    question:
      "The word 'ephemeral' most closely means:",
    options: ["Eternal and everlasting", "Short-lived and transient", "Mysterious and obscure", "Vivid and memorable"],
    correct: 1,
    explanation:
      "'Ephemeral' comes from Greek 'ephemeros' meaning 'lasting only a day.' It describes something short-lived or transient — the opposite of permanent. Example: 'The ephemeral beauty of cherry blossoms attracts millions of visitors each spring.'",
    savedAt: "2 days ago",
  },
  {
    id: 7,
    subject: "Physics",
    chapter: "Electrostatics",
    topic: "Coulomb's Law",
    question:
      "Two point charges of +2 μC and +8 μC are separated by 4 cm. At what distance from the +2 μC charge does the electric field equal zero along the line joining the charges?",
    options: ["1 cm", "1.33 cm", "2 cm", "3 cm"],
    correct: 1,
    explanation:
      "Let x = distance from +2μC charge. For zero field: k(2μC)/x² = k(8μC)/(4-x)². Taking square roots: √2/x = √8/(4-x) → 4-x = 2x → x = 4/3 ≈ 1.33 cm. The null point is closer to the smaller charge.",
    savedAt: "3 days ago",
  },
  {
    id: 8,
    subject: "Logical Reasoning",
    chapter: "Analytical Reasoning",
    topic: "Syllogisms",
    question:
      "All mammals are warm-blooded. All whales are mammals. Which conclusion is definitely true?",
    options: [
      "All warm-blooded animals are whales",
      "All whales are warm-blooded",
      "Some warm-blooded animals are not mammals",
      "No fish are warm-blooded",
    ],
    correct: 1,
    explanation:
      "From the two premises (All mammals → warm-blooded; All whales → mammals), by hypothetical syllogism: All whales → warm-blooded. Option B is the only valid deduction. Option A reverses the logic incorrectly; Options C and D cannot be derived from the given premises.",
    savedAt: "3 days ago",
  },
  {
    id: 9,
    subject: "Biology",
    chapter: "Human Physiology",
    topic: "Digestive System",
    question:
      "Which enzyme, secreted by the pancreas, is responsible for breaking down proteins into smaller peptides in the small intestine?",
    options: ["Pepsin", "Lipase", "Trypsin", "Amylase"],
    correct: 2,
    explanation:
      "Trypsin is a serine protease secreted by the pancreas as the inactive zymogen trypsinogen, activated by enterokinase in the small intestine. It cleaves peptide bonds on the C-terminal side of lysine and arginine residues. Pepsin acts in the stomach; lipase digests fats; amylase digests starch.",
    savedAt: "4 days ago",
  },
  {
    id: 10,
    subject: "Chemistry",
    chapter: "Thermodynamics",
    topic: "Gibbs Free Energy",
    question:
      "A reaction has ΔH = –50 kJ/mol and ΔS = –100 J/mol·K. At what temperature (in Kelvin) does the reaction change from spontaneous to non-spontaneous?",
    options: ["250 K", "500 K", "750 K", "1000 K"],
    correct: 1,
    explanation:
      "At equilibrium (ΔG = 0): T = ΔH/ΔS = (–50,000 J/mol) / (–100 J/mol·K) = 500 K. Below 500 K, ΔG < 0 (spontaneous); above 500 K, ΔG > 0 (non-spontaneous). Note: ΔH converted to J to match ΔS units.",
    savedAt: "5 days ago",
  },
];

/* ─────────────────────────────────────────
   Subject config
───────────────────────────────────────── */
const SUBJECT_CONFIG: Record<Subject | "All", { color: string; bg: string; icon: React.ElementType }> = {
  All: { color: "text-white", bg: "bg-warrior-gray/30", icon: Bookmark },
  Biology: { color: "text-emerald-400", bg: "bg-emerald-400/10", icon: FlaskConical },
  Chemistry: { color: "text-violet-400", bg: "bg-violet-400/10", icon: Atom },
  Physics: { color: "text-sky-400", bg: "bg-sky-400/10", icon: Zap },
  English: { color: "text-amber-400", bg: "bg-amber-400/10", icon: BookOpen },
  "Logical Reasoning": { color: "text-pink-400", bg: "bg-pink-400/10", icon: Brain },
};

const FILTER_TABS: (Subject | "All")[] = [
  "All", "Biology", "Chemistry", "Physics", "English", "Logical Reasoning",
];

/* ─────────────────────────────────────────
   MCQ Card
───────────────────────────────────────── */
function MCQCard({
  mcq,
  onUnsave,
}: {
  mcq: SavedMCQ;
  onUnsave: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SUBJECT_CONFIG[mcq.subject];
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
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Subject chip */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-inter font-semibold ${cfg.bg} ${cfg.color}`}>
              <Icon size={11} />
              {mcq.subject}
            </span>
            {/* Chapter chip */}
            <span className="text-[11px] font-inter text-warrior-text bg-warrior-gray/20 px-2.5 py-1 rounded-full">
              {mcq.chapter}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-inter text-warrior-text hidden sm:block">{mcq.savedAt}</span>
            {/* Unsave button */}
            <button
              onClick={() => onUnsave(mcq.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-warrior-text hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
              title="Remove from saved"
            >
              <BookmarkX size={15} />
            </button>
          </div>
        </div>

        {/* Question */}
        <p className="font-inter font-medium text-white text-[14px] leading-relaxed">
          {mcq.question}
        </p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-warrior-border/60 text-warrior-text hover:text-mdcat-yellow hover:bg-mdcat-yellow/5 transition-all duration-200"
      >
        <span className="font-inter font-semibold text-[12px] uppercase tracking-wide">
          {expanded ? "Hide Answer" : "Show Answer"}
        </span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-4">
              {/* Options */}
              <div className="space-y-2">
                {mcq.options.map((opt, i) => {
                  const isCorrect = i === mcq.correct;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/40"
                          : "bg-warrior-gray/10 border-warrior-border/40"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold mt-[1px] ${
                          isCorrect
                            ? "bg-emerald-500 text-white"
                            : "bg-warrior-gray/30 text-warrior-text"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span
                        className={`font-inter text-[13px] leading-snug ${
                          isCorrect ? "text-emerald-300 font-semibold" : "text-warrior-text"
                        }`}
                      >
                        {opt}
                        {isCorrect && (
                          <span className="ml-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                            ✓ Correct
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="callout-yellow rounded-r-lg py-3 px-4">
                <p className="text-[11px] font-inter font-bold text-mdcat-yellow uppercase tracking-wide mb-1.5">
                  Explanation
                </p>
                <p className="font-inter text-[13px] text-[#CCCCCC] leading-relaxed">
                  {mcq.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Empty state
───────────────────────────────────────── */
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-warrior-gray/20 border border-warrior-border flex items-center justify-center mb-4">
        <Bookmark size={28} className="text-warrior-text" />
      </div>
      <h3 className="font-poppins font-bold text-white text-[17px] mb-2">
        {filtered ? "No saved MCQs in this subject" : "No saved MCQs yet"}
      </h3>
      <p className="font-inter text-warrior-text text-[13px] max-w-[300px] leading-relaxed">
        {filtered
          ? "Switch to 'All' or try a different subject filter."
          : "Bookmark MCQs during a quiz and they'll appear here for review."}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function SavedPage() {
  const [mcqs, setMcqs] = useState<SavedMCQ[]>(SAVED_MCQS);
  const [activeFilter, setActiveFilter] = useState<Subject | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = mcqs.filter((m) => {
    const matchSubject = activeFilter === "All" || m.subject === activeFilter;
    const matchSearch =
      search.trim() === "" ||
      m.question.toLowerCase().includes(search.toLowerCase()) ||
      m.chapter.toLowerCase().includes(search.toLowerCase()) ||
      m.topic.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const subjectCounts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All"
      ? mcqs.length
      : mcqs.filter((m) => m.subject === tab).length;
    return acc;
  }, {} as Record<string, number>);

  function handleUnsave(id: number) {
    setMcqs((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-full px-4 lg:px-8 py-6 max-w-4xl mx-auto">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <h1 className="font-poppins font-black text-white text-[22px] lg:text-[26px]">
            Saved MCQs
          </h1>
          <span className="px-2.5 py-1 bg-mdcat-yellow/15 border border-mdcat-yellow/30 text-mdcat-yellow font-mono font-bold text-[12px] rounded-full">
            {mcqs.length}
          </span>
        </div>
        <p className="font-inter text-warrior-text text-[13px] mt-1">
          Bookmarked MCQs from your quiz sessions.
        </p>
      </motion.div>

      {/* ── Search bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative mb-4"
      >
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warrior-text pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions, chapters, topics..."
          className="w-full bg-dark-charcoal border border-warrior-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-inter text-white placeholder-warrior-text focus:outline-none focus:border-mdcat-yellow/50 transition-colors"
        />
      </motion.div>

      {/* ── Filter tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        {/* Scrollable row on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            const cfg = SUBJECT_CONFIG[tab];
            const Icon = cfg.icon;
            const count = subjectCounts[tab] ?? 0;

            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-inter font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? "bg-mdcat-yellow text-warrior-black shadow-[0_0_12px_rgba(255,198,0,0.25)]"
                    : "bg-dark-charcoal border border-warrior-border text-warrior-text hover:text-white hover:border-warrior-text/50"
                }`}
              >
                <Icon size={11} />
                <span>{tab === "Logical Reasoning" ? "LR" : tab}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-warrior-black/20 text-warrior-black"
                      : "bg-warrior-gray/30 text-warrior-text"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Results count ── */}
      {(search.trim() || activeFilter !== "All") && filtered.length > 0 && (
        <p className="font-inter text-warrior-text text-[12px] mb-4">
          Showing{" "}
          <span className="text-white font-semibold">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "result" : "results"}
          {activeFilter !== "All" && (
            <span>
              {" "}in{" "}
              <span className={SUBJECT_CONFIG[activeFilter].color}>{activeFilter}</span>
            </span>
          )}
          {search.trim() && (
            <span>
              {" "}matching "<span className="text-white">{search}</span>"
            </span>
          )}
        </p>
      )}

      {/* ── MCQ list ── */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <EmptyState key="empty" filtered={activeFilter !== "All" || search.trim() !== ""} />
        ) : (
          <motion.div className="space-y-3">
            {filtered.map((mcq) => (
              <MCQCard key={mcq.id} mcq={mcq} onUnsave={handleUnsave} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer note ── */}
      {mcqs.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center font-inter text-[11px] text-warrior-text/50 mt-10"
        >
          Bookmarks are saved locally. They persist across sessions.
        </motion.p>
      )}
    </div>
  );
}
