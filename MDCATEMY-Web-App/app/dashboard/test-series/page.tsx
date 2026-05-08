"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Lock, Play, ChevronRight, ChevronLeft,
  Download, CheckCircle2, XCircle, Layers,
  BookOpen, X, Eye, EyeOff, FileText, TrendingUp, Award,
  AlertCircle, ChevronDown, Sparkles, CalendarDays, ImageOff,
  Swords, AlertTriangle, Timer, ListChecks, Zap,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   DATA TYPES
═══════════════════════════════════════════════════════════ */
type TestStatus = "locked" | "unlocked" | "attempted" | "missed";
type TestKind   = "full-pmdc" | "chapter" | "topic" | "mock-final";

interface ChapterBreakdown {
  name: string;
  topics: string[];
}

interface SubjectBreakdown {
  name: string;
  color: string;
  chapters: ChapterBreakdown[];
}

interface Test {
  id: string;
  /** Optional — only used by legacy/previous weekly tests */
  week?: number;
  /** New — classifies what kind of test this is */
  kind: TestKind;
  /** Short focus line, e.g. "Biology · Cell Biology" or "PMDC Pattern · All Subjects" */
  scope: string;
  title: string;
  scheduledDate: string;   // ISO
  durationMins: number;
  totalQuestions: number;
  subjects: SubjectBreakdown[];
  status: TestStatus;
  // attempted:
  attemptedOn?: string;
  correct?: number;
  wrong?: number;
  skipped?: number;
  score?: number;
  maxScore?: number;
  timeTakenMins?: number;
  percentile?: number;
}

interface ReviewMCQ {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIdx: number;
  userIdx: number | null;  // null = skipped/missed
  explanation: string;
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — replace with API in production
═══════════════════════════════════════════════════════════ */
const TODAY = new Date("2026-04-24");

const UPCOMING_TESTS: Test[] = [
  // ── 1. LIVE TODAY — Chapter test, unlocked ──
  {
    id: "TS-CELLBIO-01",
    kind: "chapter",
    scope: "Biology · Cell Biology",
    title: "Cell Biology Chapter Test",
    scheduledDate: "2026-04-24T09:00:00",
    durationMins: 40,
    totalQuestions: 30,
    status: "unlocked",
    subjects: [
      {
        name: "Biology",
        color: "#10B981",
        chapters: [
          { name: "Cell Structure & Function", topics: ["Cell Membrane", "Organelles", "Cytoskeleton"] },
          { name: "Cell Division",             topics: ["Mitosis", "Meiosis", "Cell Cycle Control"] },
          { name: "Cellular Transport",        topics: ["Active Transport", "Diffusion", "Osmosis"] },
        ],
      },
    ],
  },
  // ── 2. TOMORROW — Topic drill ──
  {
    id: "TS-HYB-01",
    kind: "topic",
    scope: "Chemistry · Hybridization",
    title: "Hybridization Topic Drill",
    scheduledDate: "2026-04-25T09:00:00",
    durationMins: 20,
    totalQuestions: 15,
    status: "locked",
    subjects: [
      {
        name: "Chemistry",
        color: "#F59E0B",
        chapters: [
          { name: "Chemical Bonding", topics: ["sp Hybridization", "sp² Hybridization", "sp³ Hybridization", "Molecular Geometry"] },
        ],
      },
    ],
  },
  // ── 3. SUNDAY — Full PMDC-style mock ──
  {
    id: "TS-PMDC-SUN-01",
    kind: "full-pmdc",
    scope: "PMDC Pattern · All Subjects",
    title: "Sunday Full PMDC Mock",
    scheduledDate: "2026-04-26T09:00:00",
    durationMins: 150,
    totalQuestions: 200,
    status: "locked",
    subjects: [
      { name: "Biology", color: "#10B981", chapters: [
        { name: "Cell Biology",     topics: ["Organelles", "Cell Division"] },
        { name: "Genetics",         topics: ["Mendelian Laws", "DNA Replication"] },
        { name: "Human Physiology", topics: ["Digestion", "Circulation", "Excretion"] },
      ]},
      { name: "Chemistry", color: "#F59E0B", chapters: [
        { name: "Atomic Structure",  topics: ["Electron Configuration", "Periodic Trends"] },
        { name: "Chemical Bonding",  topics: ["Ionic", "Covalent", "Hybridization"] },
        { name: "Thermodynamics",    topics: ["Enthalpy", "Entropy"] },
      ]},
      { name: "Physics", color: "#38BDF8", chapters: [
        { name: "Kinematics",        topics: ["Motion in 1D", "Projectile Motion"] },
        { name: "Dynamics",          topics: ["Newton's Laws", "Friction"] },
        { name: "Electrostatics",    topics: ["Coulomb's Law", "Electric Fields"] },
      ]},
      { name: "English", color: "#A78BFA", chapters: [
        { name: "Reading Comprehension", topics: ["Main Idea", "Inference"] },
        { name: "Grammar",                topics: ["Tenses", "Parallelism"] },
      ]},
      { name: "Logical Reasoning", color: "#F472B6", chapters: [
        { name: "Analytical Reasoning", topics: ["Syllogisms", "Assumptions"] },
      ]},
    ],
  },
  // ── 4. THREE DAYS AWAY — Chapter test ──
  {
    id: "TS-MECH-01",
    kind: "chapter",
    scope: "Physics · Mechanics",
    title: "Mechanics Chapter Test",
    scheduledDate: "2026-04-27T09:00:00",
    durationMins: 50,
    totalQuestions: 40,
    status: "locked",
    subjects: [
      {
        name: "Physics",
        color: "#38BDF8",
        chapters: [
          { name: "Kinematics", topics: ["Motion in 1D", "Motion in 2D", "Projectile Motion"] },
          { name: "Dynamics",   topics: ["Newton's Laws", "Friction", "Circular Motion"] },
        ],
      },
    ],
  },
];

const PREVIOUS_TESTS: Test[] = [
  {
    id: "TS-W14",
    week: 14,
    kind: "full-pmdc",
    scope: "PMDC Pattern · All Subjects",
    title: "Week 14 · Full PMDC Mock",
    scheduledDate: "2026-04-05T09:00:00",
    durationMins: 150,
    totalQuestions: 200,
    status: "attempted",
    attemptedOn: "2026-04-05T09:15:00",
    correct: 156, wrong: 38, skipped: 6, score: 156, maxScore: 200,
    timeTakenMins: 142, percentile: 86,
    subjects: [
      { name: "Biology", color: "#10B981", chapters: [
        { name: "Human Physiology", topics: ["Digestion", "Circulation", "Excretion"] },
        { name: "Reproduction",     topics: ["Male System", "Female System", "Development"] },
      ]},
      { name: "Chemistry", color: "#F59E0B", chapters: [
        { name: "Organic Chemistry", topics: ["Alkanes", "Alkenes", "Alcohols"] },
      ]},
      { name: "Physics", color: "#38BDF8", chapters: [
        { name: "Work & Energy", topics: ["Work", "KE & PE", "Conservation"] },
      ]},
      { name: "English", color: "#A78BFA", chapters: [
        { name: "Grammar", topics: ["Tenses", "Voice", "Speech"] },
      ]},
      { name: "Logical Reasoning", color: "#F472B6", chapters: [
        { name: "Critical Thinking", topics: ["Assumptions", "Inference"] },
      ]},
    ],
  },
  {
    id: "TS-W13",
    week: 13,
    kind: "full-pmdc",
    scope: "PMDC Pattern · All Subjects",
    title: "Week 13 · Full PMDC Mock",
    scheduledDate: "2026-03-29T09:00:00",
    durationMins: 150,
    totalQuestions: 200,
    status: "attempted",
    attemptedOn: "2026-03-29T09:08:00",
    correct: 142, wrong: 48, skipped: 10, score: 142, maxScore: 200,
    timeTakenMins: 148, percentile: 78,
    subjects: [
      { name: "Biology", color: "#10B981", chapters: [
        { name: "Ecology",  topics: ["Ecosystems", "Biomes", "Biogeochemical Cycles"] },
      ]},
      { name: "Chemistry", color: "#F59E0B", chapters: [
        { name: "Thermochemistry", topics: ["Enthalpy", "Entropy", "Gibbs Energy"] },
      ]},
      { name: "Physics", color: "#38BDF8", chapters: [
        { name: "Electrostatics", topics: ["Coulomb's Law", "Electric Fields"] },
      ]},
      { name: "English", color: "#A78BFA", chapters: [
        { name: "Vocabulary", topics: ["Synonyms", "Antonyms"] },
      ]},
      { name: "Logical Reasoning", color: "#F472B6", chapters: [
        { name: "Puzzles", topics: ["Seating", "Arrangement"] },
      ]},
    ],
  },
  {
    id: "TS-W12",
    week: 12,
    kind: "full-pmdc",
    scope: "PMDC Pattern · All Subjects",
    title: "Week 12 · Full PMDC Mock",
    scheduledDate: "2026-03-22T09:00:00",
    durationMins: 150,
    totalQuestions: 200,
    status: "missed",
    subjects: [
      { name: "Biology",   color: "#10B981", chapters: [{ name: "Microbiology", topics: ["Bacteria", "Viruses"] }] },
      { name: "Chemistry", color: "#F59E0B", chapters: [{ name: "Electrochemistry", topics: ["Electrolysis", "Galvanic Cells"] }] },
      { name: "Physics",   color: "#38BDF8", chapters: [{ name: "Waves", topics: ["Sound", "Standing Waves"] }] },
      { name: "English",   color: "#A78BFA", chapters: [{ name: "Comprehension", topics: ["Main Idea"] }] },
      { name: "Logical Reasoning", color: "#F472B6", chapters: [{ name: "Series", topics: ["Numbers"] }] },
    ],
  },
  {
    id: "TS-W11",
    week: 11,
    kind: "full-pmdc",
    scope: "PMDC Pattern · All Subjects",
    title: "Week 11 · Full PMDC Mock",
    scheduledDate: "2026-03-15T09:00:00",
    durationMins: 150,
    totalQuestions: 200,
    status: "attempted",
    attemptedOn: "2026-03-15T09:05:00",
    correct: 128, wrong: 60, skipped: 12, score: 128, maxScore: 200,
    timeTakenMins: 150, percentile: 65,
    subjects: [
      { name: "Biology",   color: "#10B981", chapters: [{ name: "Enzymes", topics: ["Kinetics", "Inhibition"] }] },
      { name: "Chemistry", color: "#F59E0B", chapters: [{ name: "States of Matter", topics: ["Gases", "Liquids"] }] },
      { name: "Physics",   color: "#38BDF8", chapters: [{ name: "Heat", topics: ["Thermal Expansion", "Calorimetry"] }] },
      { name: "English",   color: "#A78BFA", chapters: [{ name: "Idioms", topics: ["Common Idioms"] }] },
      { name: "Logical Reasoning", color: "#F472B6", chapters: [{ name: "Coding", topics: ["Letter Coding"] }] },
    ],
  },
];

// A small sample pool of MCQs used for the test-review screen.
// In production this would be fetched per test from the backend.
const SAMPLE_REVIEW_MCQS: ReviewMCQ[] = [
  {
    id: 1, subject: "Biology",
    question: "Which organelle is known as the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondrion", "Ribosome", "Golgi Apparatus"],
    correctIdx: 1, userIdx: 1,
    explanation: "Mitochondria generate most of the cell's supply of ATP (adenosine triphosphate) through oxidative phosphorylation, hence the nickname 'powerhouse'.",
  },
  {
    id: 2, subject: "Chemistry",
    question: "What is the pH of pure water at 25°C?",
    options: ["6", "7", "8", "14"],
    correctIdx: 1, userIdx: 2,
    explanation: "Pure water at 25°C has equal concentrations of H⁺ and OH⁻ (1 × 10⁻⁷ M each), giving a neutral pH of 7.",
  },
  {
    id: 3, subject: "Physics",
    question: "An object in free fall (ignoring air resistance) experiences:",
    options: ["Constant velocity", "Constant acceleration", "Zero acceleration", "Increasing mass"],
    correctIdx: 1, userIdx: 1,
    explanation: "In free fall, the only force acting is gravity, producing a constant downward acceleration of approximately 9.8 m/s² near Earth's surface.",
  },
  {
    id: 4, subject: "Biology",
    question: "DNA replication is described as:",
    options: ["Conservative", "Semi-conservative", "Dispersive", "Non-conservative"],
    correctIdx: 1, userIdx: null,
    explanation: "The Meselson–Stahl experiment demonstrated that DNA replication is semi-conservative — each daughter molecule contains one original strand and one newly synthesized strand.",
  },
  {
    id: 5, subject: "English",
    question: "Identify the correct sentence:",
    options: [
      "Neither of the boys are ready.",
      "Neither of the boys is ready.",
      "Neither of the boy is ready.",
      "Neither of the boys were ready.",
    ],
    correctIdx: 1, userIdx: 1,
    explanation: "'Neither' is singular and takes a singular verb. 'Neither of the boys is ready' is grammatically correct.",
  },
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function fmtLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}
function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function daysUntil(iso: string) {
  const diffMs = new Date(iso).getTime() - TODAY.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const KIND_META: Record<TestKind, { badge: string; short: string; headline: string }> = {
  "full-pmdc":  { badge: "PMDC",    short: "Full",    headline: "Full PMDC Mock"   },
  "chapter":    { badge: "CHAPTER", short: "Chapter", headline: "Chapter Test"     },
  "topic":      { badge: "TOPIC",   short: "Topic",   headline: "Topic Drill"      },
  "mock-final": { badge: "FINAL",   short: "Final",   headline: "Final Mock"       },
};

/* ═══════════════════════════════════════════════════════════
   VIEW STATE
═══════════════════════════════════════════════════════════ */
type NoiseMode = "silent" | "hall" | "rain" | "chaos";
interface BattleConfig { noiseMode: NoiseMode; blindMode: boolean; }

const PMDC_SECTIONS = [
  { name: "Bio",  color: "#10B981", count: 68 },
  { name: "Chem", color: "#F59E0B", count: 54 },
  { name: "Phys", color: "#38BDF8", count: 54 },
  { name: "Eng",  color: "#A78BFA", count: 18 },
  { name: "LR",   color: "#F472B6", count: 6  },
];
const PMDC_TOTAL = 200;

const NOISE_OPTIONS: { mode: NoiseMode; emoji: string; label: string; desc: string }[] = [
  { mode: "silent", emoji: "🔇", label: "Silent",     desc: "Pure focus, no distractions" },
  { mode: "hall",   emoji: "🏛️", label: "Exam Hall",  desc: "Chairs, rustling, writing sounds" },
  { mode: "rain",   emoji: "🌧️", label: "Focus Rain", desc: "Soft white noise for concentration" },
  { mode: "chaos",  emoji: "🔊", label: "Full Chaos", desc: "Announcements, coughing, phones ringing" },
];

const BATTLE_RULES = [
  { icon: "⏱️", title: "No Pausing",     body: "150 minutes. Clock runs the moment you begin. Just like the real MDCAT — no exceptions." },
  { icon: "📵", title: "Tab Monitoring",  body: "Every tab switch is logged. Three strikes triggers a final warning displayed on screen." },
  { icon: "🚫", title: "Answers Hidden",  body: "No explanations during the exam. Right and wrong are revealed only after you submit." },
  { icon: "🚩", title: "Flag & Return",   body: "Mark uncertain questions with a flag. Revisit them any time before final submission." },
  { icon: "⚡", title: "Auto-Submit",     body: "When the timer hits zero, your paper is submitted automatically — answer every question." },
  { icon: "📊", title: "Full Analytics",  body: "After submission: section scores, time-per-question, percentile estimate, and improvement areas." },
];

type View =
  | { kind: "home" }
  | { kind: "briefing"; test: Test }
  | { kind: "previous-list" }
  | { kind: "upcoming-list" }
  | { kind: "review"; test: Test };

/* ═══════════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════════════ */
export default function TestSeriesPage() {
  const [view, setView]               = useState<View>({ kind: "home" });
  const [syllabusTest, setSyllabusTest] = useState<Test | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Sort upcoming tests by date so the nearest is always first.
  const sortedUpcoming = useMemo(
    () =>
      [...UPCOMING_TESTS].sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      ),
    []
  );
  const nearestUpcoming = sortedUpcoming[0];
  const laterUpcoming   = sortedUpcoming.slice(1);

  if (view.kind === "review") {
    return (
      <ReviewScreen
        test={view.test}
        onBack={() => setView({ kind: "previous-list" })}
      />
    );
  }

  if (view.kind === "briefing") {
    return (
      <BattleBriefingScreen
        test={view.test}
        onBack={() => setView({ kind: "home" })}
        onStart={(cfg) => {
          alert(
            `Battle starting...\nNoise: ${cfg.noiseMode}\nBlind Mode: ${cfg.blindMode ? "ON" : "OFF"}\n\n(Test runner will be wired next.)`
          );
        }}
      />
    );
  }

  if (view.kind === "previous-list") {
    return (
      <>
        <PreviousListScreen
          tests={PREVIOUS_TESTS}
          onBack={() => setView({ kind: "home" })}
          onOpenTest={(t) => setView({ kind: "review", test: t })}
          onOpenSyllabus={(t) => setSyllabusTest(t)}
        />
        <AnimatePresence>
          {syllabusTest && (
            <DetailsPopup
              test={syllabusTest}
              heading="Test Syllabus"
              onClose={() => setSyllabusTest(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (view.kind === "upcoming-list") {
    return (
      <>
        <UpcomingListScreen
          tests={sortedUpcoming.slice(0, 4)}
          onBack={() => setView({ kind: "home" })}
          onOpenSyllabus={(t) => setSyllabusTest(t)}
        />
        <AnimatePresence>
          {syllabusTest && (
            <DetailsPopup
              test={syllabusTest}
              heading="Test Syllabus"
              onClose={() => setSyllabusTest(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <HomeScreen
        upcoming={nearestUpcoming}
        laterUpcoming={laterUpcoming}
        previousCount={PREVIOUS_TESTS.length}
        onOpenUpcomingDetails={() => setSyllabusTest(nearestUpcoming)}
        onOpenUpcomingList={() => setView({ kind: "upcoming-list" })}
        onOpenPreviousList={() => setView({ kind: "previous-list" })}
        onOpenSchedule={() => setScheduleOpen(true)}
        onStartUpcoming={() => setView({ kind: "briefing", test: nearestUpcoming })}
      />
      <AnimatePresence>
        {syllabusTest && (
          <DetailsPopup
            test={syllabusTest}
            heading="Test Syllabus"
            onClose={() => setSyllabusTest(null)}
          />
        )}
        {scheduleOpen && (
          <SchedulePopup onClose={() => setScheduleOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME SCREEN — two clear sections: Upcoming + Previous entry
═══════════════════════════════════════════════════════════ */
function HomeScreen({
  upcoming,
  laterUpcoming,
  previousCount,
  onOpenUpcomingDetails,
  onOpenUpcomingList,
  onOpenPreviousList,
  onOpenSchedule,
  onStartUpcoming,
}: {
  upcoming: Test;
  laterUpcoming: Test[];
  previousCount: number;
  onOpenUpcomingDetails: () => void;
  onOpenUpcomingList: () => void;
  onOpenPreviousList: () => void;
  onOpenSchedule: () => void;
  onStartUpcoming: () => void;
}) {
  const days = daysUntil(upcoming.scheduledDate);
  const isUnlocked = upcoming.status === "unlocked" || days <= 0;

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto lg:max-w-xl space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Layers size={14} className="text-mdcat-yellow" />
          <p className="text-[9px] font-inter font-black uppercase tracking-[0.16em] text-mdcat-yellow">
            Test Series
          </p>
        </div>
        <h1 className="font-poppins font-black text-white text-[22px] leading-tight">
          MDCATEMY Test Series
        </h1>
        <p className="text-warrior-text text-[12px] font-inter mt-1">
          A rolling mix of chapter drills, topic quizzes and full PMDC-style mocks.
          Schedule shifts — show up when your test does.
        </p>
      </motion.div>

      {/* ── SECTION 1: UPCOMING TEST ── */}
      <section>
        <SectionLabel>Next Up</SectionLabel>
        <UpcomingTestCard
          test={upcoming}
          isUnlocked={isUnlocked}
          daysLeft={days}
          onViewDetails={onOpenUpcomingDetails}
          onStart={onStartUpcoming}
        />
      </section>

      {/* ── SECTION 2: MORE UPCOMING TESTS ENTRY ── */}
      {laterUpcoming.length > 0 && (
        <section>
          <SectionLabel>More Coming Up</SectionLabel>
          <UpcomingEntryCard tests={laterUpcoming} onClick={onOpenUpcomingList} />
        </section>
      )}

      {/* ── SECTION 3: PREVIOUS TESTS ENTRY ── */}
      <section>
        <SectionLabel>Previous Tests</SectionLabel>
        <PreviousEntryCard count={previousCount} onClick={onOpenPreviousList} />
      </section>

      {/* ── SECTION 4: FULL SCHEDULE ── */}
      <section>
        <SectionLabel>Full Schedule</SectionLabel>
        <ScheduleCard onClick={onOpenSchedule} />
      </section>
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="w-1 h-4 bg-mdcat-yellow rounded-full" />
      <h2 className="font-poppins font-black text-white text-[12px] uppercase tracking-[0.14em]">
        {children}
      </h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   UPCOMING TEST CARD
═══════════════════════════════════════════════════════════ */
function UpcomingTestCard({
  test,
  isUnlocked,
  daysLeft,
  onViewDetails,
  onStart,
}: {
  test: Test;
  isUnlocked: boolean;
  daysLeft: number;
  onViewDetails: () => void;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-dark-charcoal border-2 border-warrior-border rounded-2xl overflow-hidden shadow-[6px_6px_0px_rgba(255,198,0,0.2)]"
    >
      {/* Yellow header stripe — solid flat, cartoon style */}
      <div className="bg-mdcat-yellow border-b-2 border-warrior-black px-4 py-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-black min-w-0">
          <Zap size={11} fill="currentColor" className="shrink-0" />
          <span className="truncate">{test.scope}</span>
        </span>
        <span className="flex items-center gap-1 text-[9px] font-poppins font-black uppercase tracking-[0.12em] text-warrior-black bg-warrior-black/10 rounded-full px-2 py-0.5 border border-warrior-black/20 shrink-0">
          <Sparkles size={9} />
          {KIND_META[test.kind].badge}
        </span>
      </div>

      <div className="px-5 pt-4 pb-5">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-poppins font-black text-white text-[22px] leading-tight flex-1">
            {test.title}
          </h2>
          <span
            className={`flex items-center gap-1 text-[9px] font-poppins font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border-2 shrink-0 ${
              isUnlocked
                ? "bg-mdcat-yellow text-warrior-black border-warrior-black"
                : "bg-warrior-black text-warrior-text border-warrior-border"
            }`}
          >
            {isUnlocked ? (
              <>● LIVE</>
            ) : (
              <>
                <Lock size={9} strokeWidth={3} /> {daysLeft}d
              </>
            )}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-warrior-text text-[11px] font-inter mb-4">
          <Calendar size={11} className="text-mdcat-yellow" strokeWidth={2.5} />
          <span>
            {isUnlocked ? "Available now · " : "Opens "}
            {fmtLongDate(test.scheduledDate)}
          </span>
        </div>

        {/* Stat tiles — flat chunky cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { value: test.totalQuestions, label: "MCQs",    icon: ListChecks },
            { value: test.durationMins,   label: "Minutes", icon: Timer },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-warrior-black border-2 border-warrior-border rounded-xl p-2.5 flex items-center gap-2.5"
            >
              <div className="w-9 h-9 bg-mdcat-yellow border-2 border-warrior-black rounded-lg flex items-center justify-center shrink-0">
                <s.icon size={16} className="text-warrior-black" strokeWidth={2.8} />
              </div>
              <div className="min-w-0">
                <p className="font-poppins font-black text-white text-[18px] leading-none">
                  {s.value}
                </p>
                <p className="text-warrior-text text-[9px] font-inter uppercase tracking-[0.1em] mt-1">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onViewDetails}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-warrior-black border-2 border-warrior-border rounded-xl text-white text-[12px] font-poppins font-black uppercase tracking-[0.08em] shadow-[3px_3px_0px_rgba(255,198,0,0.12)] hover:border-mdcat-yellow hover:text-mdcat-yellow hover:shadow-[1px_1px_0px_rgba(255,198,0,0.18)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all duration-150"
          >
            <BookOpen size={13} strokeWidth={2.5} /> Syllabus
          </button>
          <button
            onClick={onStart}
            disabled={!isUnlocked}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-[12px] font-poppins font-black uppercase tracking-[0.08em] transition-all duration-150 ${
              isUnlocked
                ? "bg-mdcat-yellow text-warrior-black border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.55)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
                : "bg-warrior-gray text-warrior-text border-2 border-warrior-border cursor-not-allowed opacity-70"
            }`}
          >
            <Play size={13} fill="currentColor" /> {isUnlocked ? "Start Test" : "Locked"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREVIOUS ENTRY CARD — taps to open previous list page
═══════════════════════════════════════════════════════════ */
function PreviousEntryCard({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      onClick={onClick}
      className="group w-full bg-dark-charcoal border-2 border-warrior-border hover:border-mdcat-yellow rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-[4px_4px_0px_rgba(255,198,0,0.12)] hover:shadow-[2px_2px_0px_rgba(255,198,0,0.18)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-[0.98] transition-all duration-150"
    >
      <div className="w-11 h-11 bg-mdcat-yellow border-2 border-warrior-black rounded-xl flex items-center justify-center shrink-0">
        <FileText size={18} className="text-warrior-black" strokeWidth={2.8} />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <p className="font-poppins font-black text-white text-[14px] leading-tight group-hover:text-mdcat-yellow transition-colors">
          See All Previous Tests
        </p>
        <p className="text-warrior-text text-[11px] font-inter mt-0.5 truncate">
          {count} test{count !== 1 ? "s" : ""} · scores, syllabus &amp; answers
        </p>
      </div>

      <div className="w-8 h-8 bg-warrior-black border-2 border-warrior-border group-hover:border-mdcat-yellow group-hover:bg-mdcat-yellow rounded-lg flex items-center justify-center shrink-0 transition-all">
        <ChevronRight size={14} className="text-warrior-text group-hover:text-warrior-black transition-colors" strokeWidth={3} />
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   UPCOMING ENTRY CARD — peeks next tests, taps to open list
═══════════════════════════════════════════════════════════ */
function UpcomingEntryCard({
  tests,
  onClick,
}: {
  tests: Test[];
  onClick: () => void;
}) {
  const peek = tests.slice(0, 2);
  const extra = tests.length - peek.length;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      onClick={onClick}
      className="group w-full bg-dark-charcoal border-2 border-warrior-border hover:border-mdcat-yellow rounded-2xl px-4 py-3.5 flex flex-col gap-3 shadow-[4px_4px_0px_rgba(255,198,0,0.12)] hover:shadow-[2px_2px_0px_rgba(255,198,0,0.18)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-[0.98] transition-all duration-150"
    >
      {/* Top row */}
      <div className="flex items-center gap-3.5 w-full">
        <div className="w-11 h-11 bg-mdcat-yellow border-2 border-warrior-black rounded-xl flex items-center justify-center shrink-0">
          <CalendarDays size={18} className="text-warrior-black" strokeWidth={2.8} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-poppins font-black text-white text-[14px] leading-tight group-hover:text-mdcat-yellow transition-colors">
            See All Upcoming Tests
          </p>
          <p className="text-warrior-text text-[11px] font-inter mt-0.5 truncate">
            {tests.length} more test{tests.length !== 1 ? "s" : ""} scheduled ahead
          </p>
        </div>
        <div className="w-8 h-8 bg-warrior-black border-2 border-warrior-border group-hover:border-mdcat-yellow group-hover:bg-mdcat-yellow rounded-lg flex items-center justify-center shrink-0 transition-all">
          <ChevronRight size={14} className="text-warrior-text group-hover:text-warrior-black transition-colors" strokeWidth={3} />
        </div>
      </div>

      {/* Peek rows — next 1–2 tests */}
      <div className="w-full flex flex-col gap-1.5 pt-2 border-t-2 border-dashed border-warrior-border/70">
        {peek.map((t) => {
          const d = daysUntil(t.scheduledDate);
          return (
            <div
              key={t.id}
              className="flex items-center justify-between gap-2 text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[9px] font-poppins font-black uppercase tracking-[0.14em] text-mdcat-yellow shrink-0">
                  {KIND_META[t.kind].short}
                </span>
                <span className="font-inter font-bold text-white text-[11.5px] truncate">
                  {t.title}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-inter font-bold text-warrior-text shrink-0">
                <Calendar size={10} className="text-mdcat-yellow" />
                {fmtShortDate(t.scheduledDate)}
                <span className="text-warrior-text/60">· {d}d</span>
              </span>
            </div>
          );
        })}
        {extra > 0 && (
          <p className="text-[10px] font-inter font-bold text-warrior-text/70 text-left">
            +{extra} more…
          </p>
        )}
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCHEDULE CARD — opens full schedule image popup
═══════════════════════════════════════════════════════════ */
function ScheduleCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      onClick={onClick}
      className="group w-full bg-dark-charcoal border-2 border-warrior-border hover:border-mdcat-yellow rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-[4px_4px_0px_rgba(255,198,0,0.12)] hover:shadow-[2px_2px_0px_rgba(255,198,0,0.18)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-[0.98] transition-all duration-150"
    >
      <div className="w-11 h-11 bg-mdcat-yellow border-2 border-warrior-black rounded-xl flex items-center justify-center shrink-0">
        <CalendarDays size={18} className="text-warrior-black" strokeWidth={2.8} />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <p className="font-poppins font-black text-white text-[14px] leading-tight group-hover:text-mdcat-yellow transition-colors">
          View Schedule
        </p>
        <p className="text-warrior-text text-[11px] font-inter mt-0.5 truncate">
          All upcoming test dates at a glance
        </p>
      </div>

      <div className="w-8 h-8 bg-warrior-black border-2 border-warrior-border group-hover:border-mdcat-yellow group-hover:bg-mdcat-yellow rounded-lg flex items-center justify-center shrink-0 transition-all">
        <ChevronRight size={14} className="text-warrior-text group-hover:text-warrior-black transition-colors" strokeWidth={3} />
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCHEDULE POPUP — shows full test series schedule image
   Place image at: MDCATEMY-Web-App/public/test-schedule.jpg
═══════════════════════════════════════════════════════════ */
function SchedulePopup({ onClose }: { onClose: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {/* Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-24px)] max-w-[520px] max-h-[90vh] bg-dark-charcoal border border-warrior-border rounded-2xl z-50 overflow-hidden flex flex-col shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warrior-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mdcat-yellow/15 border border-mdcat-yellow/30 flex items-center justify-center">
              <CalendarDays size={15} className="text-mdcat-yellow" />
            </div>
            <div>
              <h3 className="font-poppins font-black text-white text-[14px] leading-tight">
                Test Series Schedule
              </h3>
              <p className="text-warrior-text text-[10px] font-inter">
                All scheduled test dates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-warrior-text hover:text-white hover:bg-warrior-gray/40 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {!imgError ? (
            <img
              src="/test-schedule.jpg"
              alt="Test Series Schedule"
              onError={() => setImgError(true)}
              className="w-full h-auto rounded-xl border border-warrior-border"
            />
          ) : (
            <div className="w-full aspect-[4/5] rounded-xl border border-dashed border-warrior-border bg-warrior-black/40 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-mdcat-yellow/10 border border-mdcat-yellow/30 flex items-center justify-center">
                <ImageOff size={20} className="text-mdcat-yellow" />
              </div>
              <div>
                <p className="font-poppins font-black text-white text-[13px]">
                  Schedule Image Pending
                </p>
                <p className="text-warrior-text text-[11px] font-inter mt-1 leading-relaxed">
                  Drop your schedule image at
                  <br />
                  <span className="text-mdcat-yellow font-mono">
                    public/test-schedule.jpg
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-warrior-border px-4 py-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-warrior-gray/30 border border-warrior-border rounded-xl text-white text-[11px] font-inter font-black uppercase tracking-[0.1em] hover:bg-warrior-gray/50 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   UPCOMING LIST SCREEN — every scheduled future test, same
   card style as the featured nearest test on home.
═══════════════════════════════════════════════════════════ */
function UpcomingListScreen({
  tests,
  onBack,
  onOpenSyllabus,
}: {
  tests: Test[];
  onBack: () => void;
  onOpenSyllabus: (t: Test) => void;
}) {
  const nearest = tests[0];
  const nearestDays = nearest ? daysUntil(nearest.scheduledDate) : 0;

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto lg:max-w-xl space-y-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-warrior-text text-[11px] font-inter hover:text-white transition-colors"
      >
        <ChevronLeft size={13} /> Back to Test Series
      </button>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Layers size={14} className="text-mdcat-yellow" />
          <p className="text-[9px] font-inter font-black uppercase tracking-[0.16em] text-mdcat-yellow">
            Upcoming Tests
          </p>
        </div>
        <h1 className="font-poppins font-black text-white text-[22px] leading-tight">
          All Scheduled Tests
        </h1>
        <p className="text-warrior-text text-[12px] font-inter mt-1">
          {tests.length} test{tests.length !== 1 ? "s" : ""} ahead
          {nearest && (
            <>
              {" "}· nearest in{" "}
              <span className="text-mdcat-yellow font-bold">
                {nearestDays <= 0 ? "today" : `${nearestDays} day${nearestDays === 1 ? "" : "s"}`}
              </span>
            </>
          )}
        </p>
      </motion.div>

      {/* List of uniform upcoming cards */}
      <div className="space-y-4">
        {tests.map((t, i) => {
          const d = daysUntil(t.scheduledDate);
          const unlocked = t.status === "unlocked" || d <= 0;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: i * 0.05 }}
            >
              <UpcomingTestCard
                test={t}
                isUnlocked={unlocked}
                daysLeft={d}
                onViewDetails={() => onOpenSyllabus(t)}
                onStart={() => {
                  if (unlocked) {
                    alert(
                      `Battle starting for ${t.title}...\n(Test runner will be wired next.)`
                    );
                  }
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREVIOUS LIST SCREEN — all past tests, uniform cards
═══════════════════════════════════════════════════════════ */
function PreviousListScreen({
  tests,
  onBack,
  onOpenTest,
  onOpenSyllabus,
}: {
  tests: Test[];
  onBack: () => void;
  onOpenTest: (t: Test) => void;
  onOpenSyllabus: (t: Test) => void;
}) {
  const attemptedCount = tests.filter((t) => t.status === "attempted").length;
  const missedCount    = tests.filter((t) => t.status === "missed").length;

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto lg:max-w-xl space-y-4">
      {/* Back + heading */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-warrior-text text-[11px] font-inter hover:text-white transition-colors"
      >
        <ChevronLeft size={13} /> Back to Test Series
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-poppins font-black text-white text-[22px] leading-tight">
          Previous Tests
        </h1>
        <p className="text-warrior-text text-[12px] font-inter mt-1">
          {attemptedCount} attempted · {missedCount} missed
        </p>
      </motion.div>

      {/* Uniform list */}
      <div className="space-y-2.5">
        {tests.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <PreviousTestCard
              test={t}
              onOpenTest={() => onOpenTest(t)}
              onOpenSyllabus={() => onOpenSyllabus(t)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Individual previous test card ─── */
function PreviousTestCard({
  test,
  onOpenTest,
  onOpenSyllabus,
}: {
  test: Test;
  onOpenTest: () => void;
  onOpenSyllabus: () => void;
}) {
  const missed = test.status === "missed";
  const pct = test.score && test.maxScore ? Math.round((test.score / test.maxScore) * 100) : 0;
  const pctColor = pct >= 75 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#D9534F";

  return (
    <div className="bg-dark-charcoal border border-warrior-border rounded-2xl overflow-hidden">
      {/* Clickable body — opens test review */}
      <button
        onClick={onOpenTest}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-warrior-gray/10 transition-colors"
      >
        {/* Score ring OR missed icon */}
        <div className="flex-shrink-0">
          {missed ? (
            <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col items-center justify-center">
              <XCircle size={16} className="text-red-400" />
              <span className="text-[8px] font-inter font-black text-red-400 mt-0.5 uppercase tracking-[0.08em]">
                Missed
              </span>
            </div>
          ) : (
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#2A2C2A" strokeWidth="4" />
                <circle
                  cx="22" cy="22" r="18" fill="none"
                  stroke={pctColor} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * (2 * Math.PI * 18)} ${2 * Math.PI * 18}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-poppins font-black text-white text-[12px] leading-none">
                  {pct}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-inter font-black uppercase tracking-[0.1em] text-warrior-text">
            {test.week ? `Week ${test.week}` : KIND_META[test.kind].headline}
          </p>
          <p className="font-poppins font-black text-white text-[14px] leading-tight">
            {test.title}
          </p>
          <div className="flex items-center gap-2.5 mt-1 text-[10px] font-inter text-warrior-text">
            <span className="flex items-center gap-0.5">
              <Calendar size={9} /> {fmtShortDate(test.scheduledDate)}
            </span>
            {!missed && (
              <>
                <span className="flex items-center gap-0.5 text-emerald-400">
                  <CheckCircle2 size={9} /> {test.correct}
                </span>
                <span className="flex items-center gap-0.5 text-red-400">
                  <XCircle size={9} /> {test.wrong}
                </span>
              </>
            )}
          </div>
        </div>

        <ChevronRight size={14} className="text-warrior-text/60 flex-shrink-0" />
      </button>

      {/* Syllabus button — separate tap target */}
      <div className="border-t border-warrior-border/60 px-4 py-2">
        <button
          onClick={onOpenSyllabus}
          className="flex items-center gap-1.5 text-[11px] font-inter font-bold text-mdcat-yellow hover:underline"
        >
          <BookOpen size={11} /> View Syllabus
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAILS POPUP — centered modal, subjects → chapters → topics
   Reused for upcoming test details AND previous test syllabus
═══════════════════════════════════════════════════════════ */
function DetailsPopup({
  test,
  heading,
  onClose,
}: {
  test: Test;
  heading: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-[420px] max-h-[85vh] bg-dark-charcoal border border-warrior-border rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-warrior-border flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-inter font-black uppercase tracking-[0.14em] text-mdcat-yellow mb-0.5">
              {heading} · {KIND_META[test.kind].badge}
            </p>
            <h3 className="font-poppins font-black text-white text-[16px] truncate">
              {test.title}
            </h3>
            <p className="text-warrior-text text-[10px] font-inter mt-0.5">
              {test.totalQuestions} MCQs · {test.durationMins} min
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-warrior-text hover:text-white hover:bg-warrior-gray/30 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable syllabus */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <p className="text-[9px] font-inter font-black uppercase tracking-[0.14em] text-warrior-text">
            Syllabus Coverage
          </p>

          {test.subjects.map((subject, idx) => (
            <SyllabusSubjectBlock key={idx} subject={subject} />
          ))}
        </div>

        <div className="px-5 py-3 border-t border-warrior-border flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-warrior-gray/30 border border-warrior-border rounded-xl text-white text-[12px] font-inter font-bold hover:border-mdcat-yellow/40 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Expandable subject block — chapters → topics ─── */
function SyllabusSubjectBlock({ subject }: { subject: SubjectBreakdown }) {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="bg-warrior-black/60 border border-warrior-border rounded-xl overflow-hidden"
      style={{ borderLeftWidth: "3px", borderLeftColor: subject.color }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${subject.color}1A`, border: `1px solid ${subject.color}40` }}
          >
            <BookOpen size={12} style={{ color: subject.color }} />
          </div>
          <p className="font-poppins font-black text-white text-[13px]">{subject.name}</p>
        </div>
        <ChevronDown
          size={14}
          className={`text-warrior-text transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {subject.chapters.map((ch, ci) => (
                <div key={ci} className="border-l border-warrior-border pl-3 ml-2">
                  <p className="font-inter font-bold text-white text-[11.5px] mb-1">
                    {ch.name}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ch.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[9.5px] font-inter font-bold px-2 py-0.5 rounded-full bg-warrior-gray/25 border border-warrior-border text-warrior-text"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVIEW SCREEN — performance summary + MCQ-by-MCQ with explanation
═══════════════════════════════════════════════════════════ */
function ReviewScreen({ test, onBack }: { test: Test; onBack: () => void }) {
  const missed = test.status === "missed";
  const pct = test.score && test.maxScore ? Math.round((test.score / test.maxScore) * 100) : 0;
  const pctColor = pct >= 75 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#D9534F";

  const mcqs = useMemo(() => SAMPLE_REVIEW_MCQS, []);

  return (
    <div className="px-4 pt-4 pb-10 max-w-lg mx-auto lg:max-w-2xl space-y-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-warrior-text text-[11px] font-inter hover:text-white transition-colors"
      >
        <ChevronLeft size={13} /> Back to Previous Tests
      </button>

      {/* Title */}
      <div>
        <p className="text-[9px] font-inter font-black uppercase tracking-[0.14em] text-mdcat-yellow">
          {test.week ? `Week ${test.week}` : KIND_META[test.kind].headline}
        </p>
        <h1 className="font-poppins font-black text-white text-[22px] leading-tight mt-0.5">
          {test.title}
        </h1>
        <p className="text-warrior-text text-[11px] font-inter mt-1 flex items-center gap-1.5">
          <Calendar size={10} /> {fmtLongDate(test.scheduledDate)}
        </p>
      </div>

      {/* ── PERFORMANCE HEADER ── */}
      {missed ? (
        <MissedHeader test={test} />
      ) : (
        <PerformanceHeader test={test} pct={pct} pctColor={pctColor} />
      )}

      {/* ── DOWNLOAD PDF ── */}
      <button
        onClick={() => alert(`Downloading ${test.title}.pdf — hook this up to the PDF generator.`)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-mdcat-yellow/10 border border-mdcat-yellow/35 rounded-xl text-mdcat-yellow text-[12px] font-inter font-black uppercase tracking-[0.08em] hover:bg-mdcat-yellow/15 active:scale-[0.98] transition-all"
      >
        <Download size={14} /> Download Test as PDF
      </button>

      {/* ── MCQ LIST ── */}
      <div>
        <div className="flex items-center gap-2 mb-3 mt-2">
          <div className="w-1 h-4 bg-mdcat-yellow rounded-full" />
          <h2 className="font-poppins font-black text-white text-[12px] uppercase tracking-[0.14em]">
            Questions &amp; Answers
          </h2>
        </div>

        <div className="space-y-3">
          {mcqs.map((mcq, i) => (
            <ReviewMCQCard key={mcq.id} mcq={mcq} index={i + 1} missed={missed} />
          ))}
        </div>

        <p className="text-center text-warrior-text text-[10px] font-inter mt-5">
          Showing {mcqs.length} sample question{mcqs.length !== 1 ? "s" : ""}. Full test will load all {test.totalQuestions} MCQs.
        </p>
      </div>
    </div>
  );
}

/* ─── Performance header (attempted) ─── */
function PerformanceHeader({
  test, pct, pctColor,
}: {
  test: Test; pct: number; pctColor: string;
}) {
  const circumference = 2 * Math.PI * 36;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-dark-charcoal border border-warrior-border rounded-2xl p-4"
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#2A2C2A" strokeWidth="6" />
            <motion.circle
              cx="40" cy="40" r="36" fill="none"
              stroke={pctColor} strokeWidth="6" strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${(pct / 100) * circumference} ${circumference}` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-poppins font-black text-white text-[20px] leading-none">{pct}%</span>
            <span className="text-warrior-text text-[9px] font-inter mt-0.5">
              {test.score}/{test.maxScore}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-0.5">
            Your Performance
          </p>
          <p className="font-poppins font-black text-white text-[15px] leading-tight">
            {pct >= 75 ? "Excellent Work" : pct >= 60 ? "Solid Effort" : "Needs Improvement"}
          </p>
          {test.percentile !== undefined && (
            <p className="flex items-center gap-1 text-[11px] font-inter text-warrior-text mt-1">
              <TrendingUp size={10} className="text-mdcat-yellow" />
              <span>Percentile <span className="text-white font-bold">{test.percentile}</span></span>
            </p>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Correct", value: test.correct, color: "text-emerald-400", bg: "border-emerald-500/20 bg-emerald-500/5" },
          { label: "Wrong",   value: test.wrong,   color: "text-red-400",     bg: "border-red-500/20 bg-red-500/5" },
          { label: "Skipped", value: test.skipped, color: "text-warrior-text", bg: "border-warrior-border" },
          { label: "Time",    value: `${test.timeTakenMins}m`, color: "text-sky-400", bg: "border-sky-500/20 bg-sky-500/5" },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`bg-warrior-black/60 border rounded-lg py-2 text-center ${bg}`}
          >
            <p className={`font-poppins font-black text-[15px] leading-none ${color}`}>{value}</p>
            <p className="text-warrior-text text-[9px] font-inter mt-1 uppercase tracking-[0.08em]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Missed header ─── */
function MissedHeader({ test }: { test: Test }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-dark-charcoal border border-red-500/30 rounded-2xl p-4 flex items-start gap-3"
      style={{
        background:
          "linear-gradient(135deg, rgba(217,83,79,0.08), transparent 60%), #222422",
      }}
    >
      <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/35 flex items-center justify-center flex-shrink-0">
        <AlertCircle size={18} className="text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-inter font-black uppercase tracking-[0.12em] text-red-400 mb-0.5">
          Test Missed
        </p>
        <p className="font-poppins font-black text-white text-[15px] leading-tight">
          You didn&apos;t attempt this one
        </p>
        <p className="font-inter text-warrior-text text-[11px] mt-1 leading-snug">
          The questions and answers are still available below so you can learn from them.
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Individual MCQ review card ─── */
function ReviewMCQCard({
  mcq,
  index,
  missed,
}: {
  mcq: ReviewMCQ;
  index: number;
  missed: boolean;
}) {
  const [showExp, setShowExp] = useState(false);
  const isCorrect = mcq.userIdx === mcq.correctIdx;
  const wasAnswered = mcq.userIdx !== null;

  // Banner at the top — different per state
  let statusLabel = "Skipped";
  let statusColor = "text-warrior-text";
  let statusBg    = "bg-warrior-text/10 border-warrior-border";
  let StatusIcon  = XCircle;

  if (missed) {
    statusLabel = "Not Attempted";
    statusColor = "text-warrior-text";
    statusBg    = "bg-warrior-gray/15 border-warrior-border";
  } else if (!wasAnswered) {
    statusLabel = "Skipped";
    statusColor = "text-amber-400";
    statusBg    = "bg-amber-500/10 border-amber-500/25";
  } else if (isCorrect) {
    statusLabel = "Correct";
    statusColor = "text-emerald-400";
    statusBg    = "bg-emerald-500/10 border-emerald-500/25";
    StatusIcon  = CheckCircle2;
  } else {
    statusLabel = "Wrong";
    statusColor = "text-red-400";
    statusBg    = "bg-red-500/10 border-red-500/25";
  }

  return (
    <div className="bg-dark-charcoal border border-warrior-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-warrior-border/70">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[11px] text-warrior-text">Q{index}</span>
          <span className="text-[9px] font-inter font-bold text-warrior-text uppercase tracking-[0.08em]">
            {mcq.subject}
          </span>
        </div>
        <span
          className={`flex items-center gap-1 text-[9px] font-inter font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${statusBg} ${statusColor}`}
        >
          <StatusIcon size={9} />
          {statusLabel}
        </span>
      </div>

      {/* Question */}
      <div className="px-3.5 pt-3 pb-2">
        <p className="font-inter text-white text-[13px] leading-relaxed">{mcq.question}</p>
      </div>

      {/* Options */}
      <div className="px-3.5 pb-3 space-y-1.5">
        {mcq.options.map((opt, i) => {
          const isRight = i === mcq.correctIdx;
          const isUser  = i === mcq.userIdx;

          let cls = "border-warrior-border bg-warrior-black/40 text-warrior-text";
          if (isRight) {
            cls = "border-emerald-500/50 bg-emerald-500/10 text-white";
          } else if (isUser && !isRight) {
            cls = "border-red-500/50 bg-red-500/10 text-white";
          }

          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${cls}`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 ${
                  isRight
                    ? "bg-emerald-500 text-white"
                    : isUser
                    ? "bg-red-500 text-white"
                    : "bg-warrior-gray text-warrior-text"
                }`}
              >
                {["A", "B", "C", "D"][i]}
              </div>
              <span className="font-inter text-[12px] flex-1">{opt}</span>
              {isRight && <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />}
              {isUser && !isRight && <XCircle size={13} className="text-red-400 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Explanation toggle */}
      <div className="border-t border-warrior-border/70 px-3.5 py-2.5">
        <button
          onClick={() => setShowExp((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-inter font-bold text-mdcat-yellow hover:underline"
        >
          {showExp ? <EyeOff size={11} /> : <Eye size={11} />}
          {showExp ? "Hide Explanation" : "Show Explanation"}
          <ChevronDown
            size={11}
            className={`transition-transform duration-200 ${showExp ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {showExp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-2.5 pl-3 border-l-2 border-mdcat-yellow/50">
                <p className="font-inter text-white/80 text-[12px] leading-relaxed">
                  {mcq.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BATTLE BRIEFING SCREEN — pre-test setup (mirrors simulation)
═══════════════════════════════════════════════════════════ */
function BattleBriefingScreen({
  test,
  onBack,
  onStart,
}: {
  test: Test;
  onBack: () => void;
  onStart: (cfg: BattleConfig) => void;
}) {
  const [noiseMode, setNoiseMode] = useState<NoiseMode>("hall");
  const [blindMode, setBlindMode] = useState(false);
  const [acknowledged, setAck]    = useState(false);

  return (
    <div className="min-h-full bg-warrior-black overflow-y-auto">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden border-b border-warrior-border">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,#FFC600 39px,#FFC600 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#FFC600 39px,#FFC600 40px)",
          }}
        />
        {/* Yellow radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, #FFC600, transparent 70%)" }}
        />

        <div className="relative max-w-3xl mx-auto px-4 pt-6 pb-10 text-center">
          {/* Back row */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-warrior-text text-[12px] font-inter hover:text-white transition-colors"
            >
              <ChevronLeft size={14} /> Test Series
            </button>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-inter font-black uppercase tracking-[0.14em] text-mdcat-yellow bg-mdcat-yellow/10 border border-mdcat-yellow/30 rounded-full px-3 py-1">
              <Swords size={11} /> {KIND_META[test.kind].headline}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 bg-mdcat-yellow/10 border border-mdcat-yellow/25 rounded-full px-4 py-1.5 mb-5"
          >
            <Sparkles size={13} className="text-mdcat-yellow" />
            <span className="text-mdcat-yellow text-[11px] font-inter font-black uppercase tracking-[0.18em]">
              {test.scope}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-poppins font-black text-white mb-3"
            style={{ fontSize: "clamp(2rem, 5.5vw, 3.6rem)", lineHeight: 1.0 }}
          >
            {test.title.split(" ").slice(0, -1).join(" ") || test.title}
            <br />
            <span className="text-mdcat-yellow">
              {test.title.split(" ").slice(-1)[0]}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-warrior-text font-inter text-[14px] max-w-md mx-auto leading-relaxed mb-7"
          >
            {test.totalQuestions} MCQs. {test.durationMins} minutes. Built by MDCATEMY mentors.
            {test.kind === "full-pmdc"
              ? " Official PMDC pattern — treat it like the real exam."
              : test.kind === "chapter"
              ? " Locked on a single chapter so weak spots can't hide."
              : test.kind === "topic"
              ? " A quick drill on one topic — sharp, focused, brutal."
              : " Full-syllabus dress rehearsal — the real test of readiness."}
          </motion.p>

          {/* Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {[
              [`${test.totalQuestions} MCQs`,                                    "#FFC600"] as [string, string],
              [`${test.durationMins} Minutes`,                                    "#FFC600"] as [string, string],
              [KIND_META[test.kind].headline,                                     "#10B981"] as [string, string],
              ["Expert-Made",                                                     "#10B981"] as [string, string],
              ["Real Pressure",                                                   "#FB923C"] as [string, string],
            ].map(([label, color]) => (
              <span
                key={label}
                className="text-[11px] font-inter font-bold px-3 py-1 rounded-full border"
                style={{ color, borderColor: color + "40", background: color + "12" }}
              >
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {/* Subject distribution — only meaningful for full PMDC mocks */}
        {test.kind === "full-pmdc" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
              📋 PMDC Subject Distribution
            </p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PMDC_SECTIONS.map((s) => (
                <div
                  key={s.name}
                  className="bg-dark-charcoal border rounded-xl p-3 text-center"
                  style={{ borderColor: s.color + "35" }}
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: s.color }}
                  />
                  <p className="font-poppins font-black text-xl text-white">{s.count}</p>
                  <p className="text-[9px] font-inter text-warrior-text mt-0.5">{s.name}</p>
                </div>
              ))}
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden">
              {PMDC_SECTIONS.map((s) => (
                <div
                  key={s.name}
                  style={{ width: `${(s.count / PMDC_TOTAL) * 100}%`, backgroundColor: s.color }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {PMDC_SECTIONS.map((s) => (
                <span key={s.name} className="text-[9px] font-inter text-warrior-text">
                  {Math.round((s.count / PMDC_TOTAL) * 100)}%
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Focused scope — for chapter/topic tests */}
        {test.kind !== "full-pmdc" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
              📋 Test Scope
            </p>
            <div className="space-y-2.5">
              {test.subjects.map((s) => (
                <div
                  key={s.name}
                  className="bg-dark-charcoal border rounded-xl px-4 py-3"
                  style={{ borderColor: s.color + "35" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <p className="font-poppins font-black text-white text-[13px]">{s.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-4">
                    {s.chapters.map((ch) => (
                      <span
                        key={ch.name}
                        className="text-[10px] font-inter font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: s.color, borderColor: s.color + "50", background: s.color + "12" }}
                      >
                        {ch.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rules of engagement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text">
              ⚔️ Rules of Engagement
            </p>
            <span className="text-[9px] font-inter font-black uppercase tracking-[0.14em] text-mdcat-yellow bg-mdcat-yellow/10 border border-mdcat-yellow/25 rounded-full px-2.5 py-0.5">
              MDCAT Simulation
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BATTLE_RULES.map((r) => (
              <div
                key={r.title}
                className="flex items-start gap-3 bg-dark-charcoal border border-warrior-border rounded-xl px-4 py-3.5"
              >
                <span className="text-[18px] flex-shrink-0 mt-0.5">{r.icon}</span>
                <div>
                  <p className="font-inter font-bold text-white text-[13px]">{r.title}</p>
                  <p className="font-inter text-warrior-text text-[11px] leading-relaxed mt-0.5">
                    {r.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Battlefield conditions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
            🎧 Battlefield Conditions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NOISE_OPTIONS.map((n) => (
              <button
                key={n.mode}
                onClick={() => setNoiseMode(n.mode)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  noiseMode === n.mode
                    ? "bg-mdcat-yellow/10 border-mdcat-yellow/40"
                    : "bg-dark-charcoal border-warrior-border hover:border-warrior-text/30"
                }`}
              >
                <span className="text-2xl">{n.emoji}</span>
                <div className="text-center">
                  <p
                    className={`font-inter font-bold text-[12px] ${
                      noiseMode === n.mode ? "text-white" : "text-warrior-text"
                    }`}
                  >
                    {n.label}
                  </p>
                  <p className="font-inter text-[10px] text-warrior-text/60 mt-0.5 leading-tight">
                    {n.desc}
                  </p>
                </div>
                {noiseMode === n.mode && (
                  <div className="w-1.5 h-1.5 rounded-full bg-mdcat-yellow" />
                )}
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <p className="text-[10px] font-inter font-black uppercase tracking-[0.18em] text-warrior-text mb-3">
            🧠 Warrior Extras
          </p>
          <button
            onClick={() => setBlindMode(!blindMode)}
            className={`w-full flex items-start gap-4 bg-dark-charcoal border rounded-xl px-5 py-4 text-left transition-all duration-200 ${
              blindMode
                ? "border-mdcat-yellow/40 bg-mdcat-yellow/5"
                : "border-warrior-border hover:border-warrior-text/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                blindMode ? "bg-mdcat-yellow border-mdcat-yellow" : "border-warrior-text/40"
              }`}
            >
              {blindMode && <CheckCircle2 size={12} className="text-warrior-black" />}
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
                    <span className="font-bold">Question Navigator will be disabled.</span> You won't see
                    which questions you've answered or how many remain. Only enable this if you're
                    genuinely comfortable working without progress tracking.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Acknowledge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button
            onClick={() => setAck(!acknowledged)}
            className={`w-full flex items-start gap-4 rounded-xl px-5 py-4 text-left border-l-4 transition-all duration-200 ${
              acknowledged
                ? "border-l-mdcat-yellow bg-mdcat-yellow/5 border border-mdcat-yellow/20"
                : "border-l-warrior-border bg-dark-charcoal border border-warrior-border"
            }`}
          >
            <div
              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                acknowledged ? "bg-mdcat-yellow border-mdcat-yellow" : "border-warrior-text/40"
              }`}
            >
              {acknowledged && <CheckCircle2 size={12} className="text-warrior-black" />}
            </div>
            <p className="font-inter text-[13px] leading-relaxed text-white/80">
              I understand this is a full timed simulation. The clock runs continuously without pause.
              I will treat this as my real MDCAT.{" "}
              <span className="text-mdcat-yellow font-bold">I am ready to be a Warrior.</span>
            </p>
          </button>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="text-center pb-6"
        >
          <button
            onClick={() => acknowledged && onStart({ noiseMode, blindMode })}
            disabled={!acknowledged}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-black text-[13px] font-inter font-black uppercase tracking-[0.1em] shadow-lg shadow-mdcat-yellow/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-25 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            style={{
              background: "linear-gradient(135deg, #FFE27A 0%, #FFC600 45%, #E5B200 100%)",
            }}
          >
            <Swords size={17} />
            Enter the Arena
            <ChevronRight size={17} />
          </button>
          <p className="text-warrior-text/50 text-[11px] font-inter mt-3">
            {test.totalQuestions} MCQs · {test.durationMins} minutes · No pausing once started
          </p>
        </motion.div>
      </div>
    </div>
  );
}
