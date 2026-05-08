export type Topic = {
  name: string;
  accuracy: number;
};

export type Chapter = {
  name: string;
  accuracy: number;
  mcqs: number;
  topics?: Topic[];
};

export type Subject = {
  name: string;
  short: string;
  slug: string;
  mcqs: number;
  accuracy: number;
  color: string;
  lastDays: number;
  chapters: Chapter[];
};

function makeTopics(names: string[], base: number, seed: number): Topic[] {
  return names.map((name, i) => {
    const h = ((seed + i * 1234567891) >>> 0) % 1000;
    const variance = (h % 50) - 25;
    return { name, accuracy: Math.max(20, Math.min(98, base + variance)) };
  });
}

function makeChapters(names: string[], base: number, seed: number, topicSets?: string[][]): Chapter[] {
  return names.map((name, i) => {
    const h = ((seed + i * 2654435761) >>> 0) % 1000;
    const variance = (h % 60) - 30;
    const accuracy = Math.max(22, Math.min(96, base + variance));
    const mcqs = 8 + (h % 55);
    const topics = topicSets?.[i]
      ? makeTopics(topicSets[i], accuracy, seed + i * 987654321)
      : undefined;
    return { name, accuracy, mcqs, topics };
  });
}

const CHEMISTRY_TOPICS: string[][] = [
  ["Bohr's Model", "Quantum Nos.", "Electron Config.", "Isotopes"],
  ["Ionic Bond", "Covalent Bond", "Hybridization", "IMF"],
  ["Gas Laws", "Ideal Gas Eq.", "KMT", "Real Gases"],
  ["Liquids", "Solids", "Phase Changes", "Crystal Structure"],
  ["Kc & Kp", "Le Chatelier", "Solubility Product", "Buffers"],
  ["Rate Laws", "Activation Energy", "Catalysis", "Mechanisms"],
  ["ΔH & Hess's Law", "Entropy", "Gibbs Energy", "Born-Haber"],
  ["Redox", "Galvanic Cells", "Electrolysis", "Faraday's Laws"],
  ["Group I", "Group II", "Reactions", "Industrial Uses"],
  ["Group III-V", "Group VI-VII", "Noble Gases", "Trends"],
  ["d-Block Trends", "Complex Ions", "Color & Catalysis", "Extraction"],
  ["Functional Groups", "IUPAC", "Isomerism", "Reactions"],
  ["Alkanes", "Alkenes", "Alkynes", "Benzene"],
  ["Nucleophilic Sub.", "Elimination", "Grignard", "Free Radical"],
  ["Alcohols", "Phenols", "Ethers", "Reactions"],
  ["Aldehydes", "Ketones", "Oxidation", "Nucleophilic Add."],
  ["Carboxylic Acids", "Esters", "Amides", "Reactions"],
  ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids"],
  ["Addition Polymers", "Condensation", "Rubber", "Plastics"],
  ["Haber Process", "Contact Process", "Solvay", "Metallurgy"],
];

const BIOLOGY = [
  "Biological Molecules", "Enzymes", "Bioenergetics", "Cell Structure",
  "Cell Cycle", "Diversity of Life", "Kingdom Monera", "Kingdom Protista",
  "Digestion", "Circulation", "Respiration", "Excretion",
  "Coordination & Control", "Reproduction", "Growth & Development",
  "Chromosomes & DNA", "Evolution", "Biotechnology", "Man & Environment",
  "Inheritance",
];

const CHEMISTRY = [
  "Atomic Structure", "Chemical Bonding", "Gases", "Liquids & Solids",
  "Chemical Equilibrium", "Reaction Kinetics", "Thermochemistry",
  "Electrochemistry", "s-Block Elements", "p-Block Elements",
  "d-Block Elements", "Fundamental Organic", "Hydrocarbons",
  "Alkyl Halides", "Alcohols & Phenols", "Aldehydes & Ketones",
  "Carboxylic Acids", "Biomolecules", "Polymers", "Industrial Chemistry",
];

const PHYSICS = [
  "Measurement", "Vectors & Equilibrium", "Motion & Force", "Work & Energy",
  "Circular Motion", "Oscillations", "Waves", "Thermodynamics",
  "Electrostatics", "Current Electricity", "Electromagnetism",
  "EM Induction", "AC Circuits", "Physics of Solids", "Electronics",
  "Modern Physics", "Atomic Spectra", "Nuclear Physics",
  "Fluid Dynamics", "Optics",
];

const ENGLISH = [
  "Tenses", "Active & Passive", "Direct & Indirect", "Sentence Structure",
  "Parts of Speech", "Subject-Verb Agreement", "Prepositions", "Articles",
  "Modals", "Conditionals", "Vocabulary", "Synonyms",
  "Antonyms", "Analogies", "Sentence Correction", "Reading Comprehension",
  "Punctuation", "Modifiers", "Idioms", "Phrasal Verbs",
];

const LOGICAL_REASONING = [
  "Critical Thinking", "Pattern Recognition", "Syllogisms", "Analogies",
  "Number Series", "Logical Deduction", "Cause & Effect",
  "Statement Analysis",
];

export const SUBJECTS: Subject[] = [
  {
    name: "Biology", short: "Bio", slug: "biology", mcqs: 450,
    accuracy: 72, color: "#10B981", lastDays: 0,
    chapters: makeChapters(BIOLOGY, 72, 101),
  },
  {
    name: "Chemistry", short: "Chem", slug: "chemistry", mcqs: 320,
    accuracy: 58, color: "#38BDF8", lastDays: 4,
    chapters: makeChapters(CHEMISTRY, 58, 207, CHEMISTRY_TOPICS),
  },
  {
    name: "Physics", short: "Phys", slug: "physics", mcqs: 280,
    accuracy: 61, color: "#A78BFA", lastDays: 1,
    chapters: makeChapters(PHYSICS, 61, 313),
  },
  {
    name: "English", short: "Eng", slug: "english", mcqs: 120,
    accuracy: 84, color: "#2DD4BF", lastDays: 2,
    chapters: makeChapters(ENGLISH, 84, 419),
  },
  {
    name: "Logical Reasoning", short: "LR", slug: "logical-reasoning",
    mcqs: 77, accuracy: 47, color: "#FB923C", lastDays: 6,
    chapters: makeChapters(LOGICAL_REASONING, 47, 523),
  },
];

export const MDCAT_WEIGHTS = [68, 54, 54, 18, 6];

/* ───────────────────────────────────────────────────────────
   PER-SUBJECT DAILY ACCURACY TREND (last 90 days, deterministic)
   Used to compute daily / weekly / monthly improvement deltas.
─────────────────────────────────────────────────────────── */
export type DailyAccuracy = { date: Date; acc: number };

const TREND_DAYS = 90;

export const SUBJECT_TRENDS: Record<string, DailyAccuracy[]> = (() => {
  const out: Record<string, DailyAccuracy[]> = {};
  SUBJECTS.forEach((s, sIdx) => {
    const arr: DailyAccuracy[] = [];
    for (let i = 0; i < TREND_DAYS; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (TREND_DAYS - 1 - i));
      const seed = (((sIdx + 1) * 2654435761 + i * 2246822519) >>> 0) % 1000;
      const variance = (seed % 28) - 14;
      // gentle direction so each subject has a distinct trajectory
      const directions = [+0.18, -0.10, +0.08, +0.05, -0.22];
      const drift = (i - TREND_DAYS / 2) * (directions[sIdx] ?? 0);
      const acc = Math.max(20, Math.min(98, Math.round(s.accuracy + variance + drift)));
      arr.push({ date, acc });
    }
    out[s.slug] = arr;
  });
  return out;
})();

export type TrendPeriod = "daily" | "weekly" | "monthly";

/** Returns rounded delta (current period avg - previous period avg). */
export function computeSubjectDelta(slug: string, period: TrendPeriod): number {
  const data = SUBJECT_TRENDS[slug];
  if (!data || data.length === 0) return 0;
  const win = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
  if (data.length < win * 2) return 0;
  const cur = data.slice(-win);
  const prev = data.slice(-win * 2, -win);
  const avg = (a: DailyAccuracy[]) => a.reduce((s, d) => s + d.acc, 0) / a.length;
  return Math.round(avg(cur) - avg(prev));
}
