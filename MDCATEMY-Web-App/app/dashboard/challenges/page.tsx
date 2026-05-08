"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Atom, Zap, BookOpen, Brain,
  ChevronRight, ChevronLeft, Trophy, RotateCcw,
  Target, Flame, CheckCircle2, XCircle, Star,
} from "lucide-react";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Subject = "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning";
type ChallengeScreen = "subjects" | "chapters" | "topics" | "taking" | "results";

interface MCQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface TopicData {
  accuracy: number; // mock accuracy %
  mcqs: MCQ[];
}

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const SUBJECT_CONFIG: Record<Subject, {
  color: string; bg: string; border: string; glow: string;
  icon: React.ElementType; accuracy: number; chapters: string[];
}> = {
  Biology: {
    color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]",
    icon: FlaskConical, accuracy: 72,
    chapters: ["Cell Biology", "Genetics", "Human Physiology", "Ecology", "Evolution"],
  },
  Chemistry: {
    color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30",
    glow: "shadow-[0_0_20px_rgba(167,139,250,0.15)]",
    icon: Atom, accuracy: 61,
    chapters: ["Chemical Bonding", "Organic Chemistry", "Thermodynamics", "Electrochemistry", "Reaction Kinetics"],
  },
  Physics: {
    color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.15)]",
    icon: Zap, accuracy: 55,
    chapters: ["Mechanics", "Waves", "Electrostatics", "Magnetism", "Modern Physics"],
  },
  English: {
    color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.15)]",
    icon: BookOpen, accuracy: 80,
    chapters: ["Vocabulary", "Reading Comprehension", "Grammar", "Sentence Completion"],
  },
  "Logical Reasoning": {
    color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/30",
    glow: "shadow-[0_0_20px_rgba(244,114,182,0.15)]",
    icon: Brain, accuracy: 68,
    chapters: ["Analytical Reasoning", "Critical Thinking", "Data Sufficiency", "Pattern Recognition"],
  },
};

// Topics per chapter (subject → chapter → topics[])
const CHAPTER_TOPICS: Record<Subject, Record<string, string[]>> = {
  Biology: {
    "Cell Biology": ["Cell Organelles", "Cell Division", "Cell Membrane", "Cell Cycle"],
    "Genetics": ["Mendelian Genetics", "DNA Structure", "Protein Synthesis", "Mutations"],
    "Human Physiology": ["Digestive System", "Respiratory System", "Nervous System", "Circulatory System"],
    "Ecology": ["Ecosystems", "Food Chains", "Biomes", "Population Dynamics"],
    "Evolution": ["Natural Selection", "Speciation", "Fossil Record", "Hardy-Weinberg"],
  },
  Chemistry: {
    "Chemical Bonding": ["Hybridization", "VSEPR Theory", "Ionic Bonds", "Metallic Bonds"],
    "Organic Chemistry": ["Reaction Mechanisms", "Functional Groups", "Isomerism", "Polymers"],
    "Thermodynamics": ["Gibbs Free Energy", "Enthalpy", "Entropy", "Hess's Law"],
    "Electrochemistry": ["Galvanic Cells", "Electrolysis", "Electrode Potential", "Faraday's Laws"],
    "Reaction Kinetics": ["Rate of Reaction", "Activation Energy", "Catalysis", "Order of Reaction"],
  },
  Physics: {
    "Mechanics": ["Newton's Laws", "Projectile Motion", "Circular Motion", "Gravitation"],
    "Waves": ["Doppler Effect", "Interference", "Diffraction", "Standing Waves"],
    "Electrostatics": ["Coulomb's Law", "Electric Field", "Capacitors", "Gauss's Law"],
    "Magnetism": ["Magnetic Force", "Ampere's Law", "Electromagnetic Induction", "Transformers"],
    "Modern Physics": ["Photoelectric Effect", "Bohr Model", "Nuclear Reactions", "Radioactivity"],
  },
  English: {
    "Vocabulary": ["Synonyms", "Antonyms", "Word-in-Context", "Analogies"],
    "Reading Comprehension": ["Inference", "Main Idea", "Tone & Attitude", "Detail Questions"],
    "Grammar": ["Subject-Verb Agreement", "Tenses", "Sentence Correction", "Prepositions"],
    "Sentence Completion": ["Logical Connectors", "Contextual Fill", "Parallel Structure", "Conjunctions"],
  },
  "Logical Reasoning": {
    "Analytical Reasoning": ["Syllogisms", "Venn Diagrams", "Blood Relations", "Seating Arrangements"],
    "Critical Thinking": ["Assumptions", "Conclusions", "Argument Strengthening", "Paradoxes"],
    "Data Sufficiency": ["Statement Analysis", "Numerical Sufficiency", "Conditional Logic", "Set Theory"],
    "Pattern Recognition": ["Number Series", "Letter Series", "Matrix Patterns", "Odd-One-Out"],
  },
};

// MCQ pool: subject → chapter → topic → 3 MCQs
const MCQ_POOL: Partial<Record<Subject, Partial<Record<string, Partial<Record<string, MCQ[]>>>>>> = {
  Biology: {
    "Cell Biology": {
      "Cell Organelles": [
        {
          question: "Which organelle is the site of aerobic respiration in eukaryotic cells?",
          options: ["Ribosome", "Mitochondria", "Chloroplast", "Nucleus"],
          correct: 1,
          explanation: "Mitochondria perform aerobic respiration, producing ATP via the Krebs cycle and oxidative phosphorylation. Their inner membrane is folded into cristae to maximise surface area.",
        },
        {
          question: "Which cell organelle is responsible for packaging and modifying proteins for secretion?",
          options: ["Smooth ER", "Ribosome", "Golgi apparatus", "Lysosome"],
          correct: 2,
          explanation: "The Golgi apparatus (Golgi body) receives proteins from the rough ER, modifies them (e.g., glycosylation), sorts them, and packages them into vesicles for secretion or intracellular use.",
        },
        {
          question: "Ribosomes are composed of which two molecules?",
          options: ["DNA and protein", "RNA and lipids", "rRNA and protein", "mRNA and tRNA"],
          correct: 2,
          explanation: "Ribosomes consist of ribosomal RNA (rRNA) and proteins organised into a large and small subunit. In prokaryotes: 70S (50S + 30S); in eukaryotes: 80S (60S + 40S).",
        },
      ],
      "Cell Division": [
        {
          question: "During which phase of mitosis do chromosomes align at the cell's equatorial plate?",
          options: ["Prophase", "Anaphase", "Metaphase", "Telophase"],
          correct: 2,
          explanation: "During metaphase, chromosomes are maximally condensed and align along the metaphase plate (equatorial plane). Spindle fibres attach to kinetochores, ensuring equal chromosome distribution.",
        },
        {
          question: "Which event marks the beginning of meiosis II?",
          options: ["DNA replication", "Crossing over", "Separation of sister chromatids", "Separation of homologous chromosomes"],
          correct: 2,
          explanation: "Meiosis II begins after meiosis I (which separates homologous chromosomes). In meiosis II, sister chromatids separate — similar to mitosis but starting with haploid cells. No DNA replication occurs between meiosis I and II.",
        },
        {
          question: "Crossing over during meiosis occurs at structures called:",
          options: ["Centrioles", "Chiasmata", "Centromeres", "Telomeres"],
          correct: 1,
          explanation: "Chiasmata (singular: chiasma) are the physical points where non-sister chromatids of homologous chromosomes exchange segments during crossing over in prophase I. This promotes genetic diversity.",
        },
      ],
    },
    "Genetics": {
      "Mendelian Genetics": [
        {
          question: "In a monohybrid cross between two heterozygous individuals (Aa × Aa), what is the expected genotypic ratio?",
          options: ["1:1", "3:1", "1:2:1", "2:1:1"],
          correct: 2,
          explanation: "The cross Aa × Aa produces: AA : Aa : aa = 1:2:1 genotypic ratio. The phenotypic ratio is 3:1 (dominant:recessive), but the genotypic ratio is 1:2:1.",
        },
        {
          question: "A man with blood type A (heterozygous) and a woman with blood type B (heterozygous) have children. What blood types are possible?",
          options: ["A and B only", "A, B, AB, and O", "AB and O only", "A, B, and AB only"],
          correct: 1,
          explanation: "Father: I^A i × Mother: I^B i → possible genotypes: I^A I^B (AB), I^A i (A), I^B i (B), ii (O). All four blood types are possible with equal 1:1:1:1 probability.",
        },
        {
          question: "Which law of Mendel states that alleles of different genes assort independently during gamete formation?",
          options: ["Law of Dominance", "Law of Segregation", "Law of Independent Assortment", "Law of Uniformity"],
          correct: 2,
          explanation: "Mendel's Law of Independent Assortment (Second Law) states that alleles of different genes segregate independently of each other during meiosis. This applies to genes on different chromosomes or far apart on the same chromosome.",
        },
      ],
    },
    "Human Physiology": {
      "Digestive System": [
        {
          question: "Where does chemical digestion of proteins begin in the human digestive system?",
          options: ["Mouth", "Oesophagus", "Stomach", "Small intestine"],
          correct: 2,
          explanation: "Protein digestion begins in the stomach, where pepsinogen is activated to pepsin by HCl (pH 1.5–2). Pepsin cleaves peptide bonds producing peptides. Final protein digestion occurs in the small intestine via trypsin, chymotrypsin, and peptidases.",
        },
        {
          question: "Which enzyme in saliva initiates the digestion of starch?",
          options: ["Lipase", "Maltase", "Salivary amylase", "Sucrase"],
          correct: 2,
          explanation: "Salivary amylase (ptyalin) breaks the α-1,4 glycosidic bonds in starch, producing maltose and dextrins. Its activity is halted in the stomach's acidic environment. Digestion of starch continues in the small intestine via pancreatic amylase.",
        },
        {
          question: "Which part of the small intestine is primarily responsible for the absorption of nutrients?",
          options: ["Duodenum", "Jejunum", "Ileum", "Caecum"],
          correct: 1,
          explanation: "The jejunum is the primary site of nutrient absorption. It has numerous villi and microvilli (brush border) that vastly increase surface area. The duodenum mainly receives digestive juices; the ileum absorbs B12 and bile salts.",
        },
      ],
    },
  },
  Chemistry: {
    "Chemical Bonding": {
      "Hybridization": [
        {
          question: "What is the hybridization and geometry of the water molecule (H₂O)?",
          options: ["sp, linear", "sp², trigonal planar", "sp³, tetrahedral", "sp³, bent"],
          correct: 3,
          explanation: "Oxygen in H₂O has sp³ hybridization (4 electron pairs). Two are bonding pairs and two are lone pairs. Lone pairs repel more strongly, compressing the bond angle from 109.5° to ~104.5°, giving a bent (V-shaped) geometry.",
        },
        {
          question: "Which of the following molecules has sp² hybridization at its carbon atoms?",
          options: ["Methane (CH₄)", "Ethane (C₂H₆)", "Ethene (C₂H₄)", "Ethyne (C₂H₂)"],
          correct: 2,
          explanation: "In ethene (C₂H₄), each carbon forms 3 sigma bonds (sp² hybrid) and one pi bond using the unhybridised p orbital. The geometry around each carbon is trigonal planar with bond angles of 120°.",
        },
        {
          question: "The bond angle in ammonia (NH₃) is approximately 107°. Why is it less than the tetrahedral angle of 109.5°?",
          options: [
            "NH₃ has sp² hybridization",
            "One lone pair on nitrogen repels bonding pairs",
            "Hydrogen atoms are too small",
            "Nitrogen uses d orbitals",
          ],
          correct: 1,
          explanation: "In NH₃, nitrogen is sp³ hybridised with 3 bonding pairs and 1 lone pair. The lone pair occupies more space than bonding pairs, exerting greater repulsion that compresses the H-N-H angles to ~107° (VSEPR theory).",
        },
      ],
    },
    "Thermodynamics": {
      "Gibbs Free Energy": [
        {
          question: "Which condition makes a reaction spontaneous at ALL temperatures?",
          options: [
            "ΔH > 0, ΔS > 0",
            "ΔH < 0, ΔS < 0",
            "ΔH < 0, ΔS > 0",
            "ΔH > 0, ΔS < 0",
          ],
          correct: 2,
          explanation: "ΔG = ΔH – TΔS. When ΔH < 0 (exothermic) and ΔS > 0 (increasing entropy), ΔG is always negative regardless of temperature. This is the only combination guaranteed to be spontaneous at all temperatures.",
        },
        {
          question: "For a reaction at equilibrium, what is the value of ΔG?",
          options: ["-1 kJ/mol", "0", "+1 kJ/mol", "Depends on temperature"],
          correct: 1,
          explanation: "At equilibrium, ΔG = 0. The system has reached maximum entropy and minimum free energy — there is no net driving force in either direction. This is expressed by ΔG° = –RT ln K (relating standard free energy to the equilibrium constant).",
        },
        {
          question: "The standard free energy change ΔG° is related to the equilibrium constant K by:",
          options: [
            "ΔG° = RT ln K",
            "ΔG° = –RT ln K",
            "ΔG° = ΔH° – TΔS°",
            "ΔG° = K/RT",
          ],
          correct: 1,
          explanation: "ΔG° = –RT ln K, where R = 8.314 J/mol·K and T is temperature in Kelvin. If K > 1, ΔG° < 0 (products favoured). If K < 1, ΔG° > 0 (reactants favoured). Note: ΔG° = ΔH° – TΔS° is a separate (also correct) relation.",
        },
      ],
    },
  },
  Physics: {
    "Waves": {
      "Doppler Effect": [
        {
          question: "A source of sound moves away from a stationary observer. What happens to the observed frequency?",
          options: [
            "Increases",
            "Decreases",
            "Remains the same",
            "First increases then decreases",
          ],
          correct: 1,
          explanation: "When the source moves away, wavefronts are stretched — increasing wavelength and decreasing frequency. This is the red-shift analogue for sound. The formula is f' = f × v/(v + vs) for a receding source.",
        },
        {
          question: "The Doppler effect is observed when there is relative motion between:",
          options: [
            "Source and medium only",
            "Observer and medium only",
            "Source and observer",
            "Medium and wavefront",
          ],
          correct: 2,
          explanation: "The Doppler effect occurs when there is relative motion between the source and the observer. The medium is not required to move. It applies to all waves — sound, light, ultrasound — and is used in radar, medical imaging, and astronomy.",
        },
        {
          question: "A train moving at 30 m/s emits a whistle at 600 Hz. If the speed of sound is 330 m/s, what frequency does a stationary observer ahead of the train hear?",
          options: ["540 Hz", "600 Hz", "660 Hz", "680 Hz"],
          correct: 2,
          explanation: "f' = f × v/(v – vs) = 600 × 330/(330 – 30) = 600 × 330/300 = 660 Hz. The observer ahead hears a higher frequency because the source is approaching — wavefronts are compressed.",
        },
      ],
    },
    "Electrostatics": {
      "Coulomb's Law": [
        {
          question: "If the distance between two charges is doubled, the electrostatic force between them:",
          options: [
            "Doubles",
            "Halves",
            "Becomes one-quarter",
            "Becomes four times",
          ],
          correct: 2,
          explanation: "Coulomb's Law: F = kq₁q₂/r². Doubling r means r² becomes 4r², so F becomes F/4. The force is inversely proportional to the square of the distance — an inverse square law, like gravity.",
        },
        {
          question: "What is the SI unit of electric charge?",
          options: ["Ampere", "Volt", "Coulomb", "Farad"],
          correct: 2,
          explanation: "The SI unit of electric charge is the Coulomb (C). One Coulomb = charge carried by ~6.24 × 10¹⁸ electrons. The elementary charge (e) = 1.6 × 10⁻¹⁹ C. The Coulomb was named after French physicist Charles-Augustin de Coulomb.",
        },
        {
          question: "In Coulomb's Law, the value of the constant k in SI units is approximately:",
          options: ["9 × 10⁶ N·m²/C²", "9 × 10⁹ N·m²/C²", "6.67 × 10⁻¹¹ N·m²/C²", "8.85 × 10⁻¹² N·m²/C²"],
          correct: 1,
          explanation: "The Coulomb constant k = 1/(4πε₀) ≈ 9 × 10⁹ N·m²/C², where ε₀ = 8.85 × 10⁻¹² F/m is the permittivity of free space. This large value reflects the enormous strength of the electromagnetic force relative to gravity.",
        },
      ],
    },
  },
  English: {
    "Vocabulary": {
      "Synonyms": [
        {
          question: "Choose the word most similar in meaning to 'EPHEMERAL':",
          options: ["Permanent", "Transient", "Robust", "Ancient"],
          correct: 1,
          explanation: "'Ephemeral' means short-lived or lasting only a very short time (from Greek: 'lasting a day'). 'Transient' is its closest synonym — both describe things that pass quickly. Antonyms: permanent, eternal, enduring.",
        },
        {
          question: "Which word is a synonym of 'PRAGMATIC'?",
          options: ["Idealistic", "Practical", "Emotional", "Theoretical"],
          correct: 1,
          explanation: "'Pragmatic' means dealing with things sensibly and realistically, based on practical considerations rather than theoretical ones. 'Practical' is its closest synonym. A pragmatic person focuses on what works, not what is ideal.",
        },
        {
          question: "Select the synonym of 'LOQUACIOUS':",
          options: ["Silent", "Talkative", "Intelligent", "Aggressive"],
          correct: 1,
          explanation: "'Loquacious' means tending to talk a great deal; talkative. It comes from Latin 'loqui' (to speak). Synonyms: verbose, garrulous, voluble. Antonyms: taciturn, reticent, reserved.",
        },
      ],
    },
  },
  "Logical Reasoning": {
    "Analytical Reasoning": {
      "Syllogisms": [
        {
          question: "All doctors are educated. Some educated people are rich. Which conclusion follows?",
          options: [
            "All doctors are rich",
            "Some doctors are rich",
            "No doctor is rich",
            "None of the above",
          ],
          correct: 3,
          explanation: "From 'All doctors are educated' and 'Some educated are rich' — we CANNOT definitively conclude that any doctor is rich (the rich educated people might not include any doctors). The valid conclusion is 'None of the above' — no definite conclusion about doctors and richness can be drawn.",
        },
        {
          question: "No fish is a mammal. All dolphins are mammals. Which is definitely true?",
          options: [
            "Some dolphins are fish",
            "No dolphin is a fish",
            "Some fish are dolphins",
            "All mammals are dolphins",
          ],
          correct: 1,
          explanation: "From 'No fish is a mammal' (equivalent: no mammal is a fish) and 'All dolphins are mammals' → by syllogism: No dolphin is a fish. Option B is the valid conclusion. Options A and C contradict the premises; Option D is an invalid reversal.",
        },
        {
          question: "All pens are pencils. All pencils are erasers. Which conclusion is valid?",
          options: [
            "All erasers are pens",
            "Some pens are not erasers",
            "All pens are erasers",
            "No pen is an eraser",
          ],
          correct: 2,
          explanation: "Using hypothetical syllogism: All pens → pencils, All pencils → erasers. Therefore: All pens → erasers. Option C is the valid conclusion. This is a transitive inference — if A⊆B and B⊆C, then A⊆C.",
        },
      ],
    },
  },
};

/* ─────────────────────────────────────────
   Fallback MCQs if topic not in pool
───────────────────────────────────────── */
function getMCQs(subject: Subject, chapter: string, topic: string): MCQ[] {
  const pool = MCQ_POOL[subject]?.[chapter]?.[topic];
  if (pool && pool.length >= 3) return pool.slice(0, 3);
  // Generic fallback
  return [
    {
      question: `In ${topic} (${subject}), which of the following statements is correct?`,
      options: ["Option A — the fundamental principle applies directly", "Option B — an exception modifies the rule", "Option C — both A and B are partially correct", "Option D — neither A nor B is correct"],
      correct: 0,
      explanation: `This is a conceptual question about ${topic} in ${subject}. The fundamental principle applies directly in standard conditions. Review your ${chapter} notes for deeper understanding.`,
    },
    {
      question: `Which concept from ${topic} is most commonly tested in MDCAT?`,
      options: ["The defining property of the system", "The inverse relationship between variables", "The conservation law applicable here", "The exception to the general rule"],
      correct: 2,
      explanation: `Conservation laws and fundamental relationships in ${topic} are frequently tested. MDCAT particularly focuses on applications of core principles rather than memorisation of edge cases.`,
    },
    {
      question: `A problem involving ${topic} requires which primary approach?`,
      options: ["Identify and apply the relevant formula", "Use process of elimination on options", "Both — identify the concept then apply it", "Draw a diagram before calculating"],
      correct: 2,
      explanation: `The best MDCAT strategy for ${topic} questions: first identify which concept applies, then apply the relevant formula or reasoning. Both conceptual understanding and procedural knowledge are needed.`,
    },
  ];
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

// Accuracy badge
function AccuracyBadge({ pct }: { pct: number }) {
  const color =
    pct >= 75 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
    pct >= 55 ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
    "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {pct}%
    </span>
  );
}

// Screen: Subject grid
function SubjectSelectScreen({
  onSelect,
}: {
  onSelect: (s: Subject) => void;
}) {
  const subjects = Object.keys(SUBJECT_CONFIG) as Subject[];

  return (
    <motion.div
      key="subjects"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <p className="font-inter text-warrior-text text-[13px] mb-5">
        Pick a subject to drill down into chapters and topics.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subjects.map((subj, i) => {
          const cfg = SUBJECT_CONFIG[subj];
          const Icon = cfg.icon;
          return (
            <motion.button
              key={subj}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onSelect(subj)}
              className={`group flex items-center gap-4 p-4 bg-dark-charcoal border rounded-xl text-left transition-all duration-200 hover:scale-[1.02] ${cfg.border} ${cfg.bg} hover:${cfg.glow}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                <Icon size={18} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-poppins font-bold text-[14px] ${cfg.color}`}>{subj}</p>
                <p className="font-inter text-warrior-text text-[11px] mt-0.5">
                  {SUBJECT_CONFIG[subj].chapters.length} chapters
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <AccuracyBadge pct={cfg.accuracy} />
                <ChevronRight size={14} className="text-warrior-text group-hover:text-white transition-colors" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Screen: Chapter list
function ChapterSelectScreen({
  subject,
  onSelect,
  onBack,
}: {
  subject: Subject;
  onSelect: (ch: string) => void;
  onBack: () => void;
}) {
  const cfg = SUBJECT_CONFIG[subject];
  const Icon = cfg.icon;
  const chapters = cfg.chapters;

  return (
    <motion.div
      key="chapters"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back + subject banner */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-warrior-text hover:text-white transition-colors font-inter text-[13px] mb-4"
      >
        <ChevronLeft size={15} /> Back to subjects
      </button>
      <div className={`flex items-center gap-3 p-4 rounded-xl border mb-5 ${cfg.bg} ${cfg.border}`}>
        <Icon size={20} className={cfg.color} />
        <div>
          <p className={`font-poppins font-bold text-[15px] ${cfg.color}`}>{subject}</p>
          <p className="font-inter text-warrior-text text-[11px]">Choose a chapter</p>
        </div>
      </div>

      <div className="space-y-2">
        {chapters.map((ch, i) => {
          const topics = CHAPTER_TOPICS[subject]?.[ch] ?? [];
          return (
            <motion.button
              key={ch}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(ch)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-dark-charcoal border border-warrior-border rounded-xl text-left hover:border-warrior-text/40 hover:bg-warrior-gray/20 transition-all duration-200 group"
            >
              <div>
                <p className="font-inter font-semibold text-white text-[14px]">{ch}</p>
                <p className="font-inter text-warrior-text text-[11px] mt-0.5">
                  {topics.length} topics
                </p>
              </div>
              <ChevronRight size={15} className="text-warrior-text group-hover:text-white transition-colors flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Screen: Topic grid
function TopicSelectScreen({
  subject,
  chapter,
  onSelect,
  onBack,
}: {
  subject: Subject;
  chapter: string;
  onSelect: (t: string) => void;
  onBack: () => void;
}) {
  const cfg = SUBJECT_CONFIG[subject];
  const topics = CHAPTER_TOPICS[subject]?.[chapter] ?? [];

  return (
    <motion.div
      key="topics"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-warrior-text hover:text-white transition-colors font-inter text-[13px] mb-4"
      >
        <ChevronLeft size={15} /> Back to {subject}
      </button>

      <div className="mb-5">
        <p className={`font-inter text-[11px] font-semibold uppercase tracking-wider ${cfg.color} mb-1`}>
          {subject} · {chapter}
        </p>
        <h2 className="font-poppins font-bold text-white text-[18px]">Choose a Topic</h2>
        <p className="font-inter text-warrior-text text-[12px] mt-1">
          Each challenge is 3 MCQs. Tap to answer — results are instant.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topics.map((topic, i) => (
          <motion.button
            key={topic}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onSelect(topic)}
            className={`group flex items-center gap-3 px-4 py-3.5 bg-dark-charcoal border border-warrior-border rounded-xl text-left hover:border-mdcat-yellow/40 hover:bg-mdcat-yellow/5 transition-all duration-200`}
          >
            <div className="w-8 h-8 rounded-lg bg-mdcat-yellow/10 flex items-center justify-center flex-shrink-0">
              <Target size={14} className="text-mdcat-yellow" />
            </div>
            <div className="flex-1">
              <p className="font-inter font-semibold text-white text-[13px]">{topic}</p>
              <p className="font-inter text-[10px] text-warrior-text mt-0.5">3 MCQs · Quick drill</p>
            </div>
            <Flame size={13} className="text-warrior-text group-hover:text-mdcat-yellow transition-colors flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// Screen: Challenge (3 MCQs, instant feedback)
function TakingScreen({
  subject,
  chapter,
  topic,
  mcqs,
  onFinish,
}: {
  subject: Subject;
  chapter: string;
  topic: string;
  mcqs: MCQ[];
  onFinish: (answers: (number | null)[]) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const cfg = SUBJECT_CONFIG[subject];

  function handleSelect(i: number) {
    if (locked) return;
    setSelected(i);
    setLocked(true);
  }

  function handleNext() {
    const newAnswers = [...answers, selected];
    if (current + 1 >= mcqs.length) {
      onFinish(newAnswers);
    } else {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
      setLocked(false);
    }
  }

  const q = mcqs[current];
  const progress = ((current) / mcqs.length) * 100;

  return (
    <motion.div
      key="taking"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`font-inter text-[11px] font-semibold uppercase tracking-wider ${cfg.color}`}>
            {subject} · {topic}
          </p>
          <p className="font-inter text-warrior-text text-[11px] mt-0.5">{chapter}</p>
        </div>
        <span className="font-mono font-bold text-white text-[13px]">
          {current + 1} / {mcqs.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-warrior-gray/30 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-mdcat-yellow rounded-full"
          initial={{ width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bg-dark-charcoal border border-warrior-border rounded-xl p-5 mb-4">
            <p className="font-inter font-medium text-white text-[15px] leading-relaxed">
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5 mb-5">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correct;
              const showResult = locked;

              let style = "bg-dark-charcoal border-warrior-border text-warrior-text hover:border-warrior-text/50 hover:text-white cursor-pointer";
              if (showResult) {
                if (isCorrect) {
                  style = "bg-emerald-500/15 border-emerald-400/60 text-emerald-300 cursor-default";
                } else if (isSelected && !isCorrect) {
                  style = "bg-red-500/15 border-red-400/60 text-red-300 cursor-default";
                } else {
                  style = "bg-dark-charcoal border-warrior-border/40 text-warrior-text/50 cursor-default";
                }
              } else if (isSelected) {
                style = "bg-mdcat-yellow/10 border-mdcat-yellow text-white cursor-pointer";
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${style}`}
                  whileTap={!locked ? { scale: 0.99 } : {}}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0 ${
                    showResult && isCorrect ? "bg-emerald-500 text-white" :
                    showResult && isSelected && !isCorrect ? "bg-red-500 text-white" :
                    isSelected ? "bg-mdcat-yellow text-warrior-black" :
                    "bg-warrior-gray/30"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-inter text-[13px] text-left leading-snug flex-1">{opt}</span>
                  {showResult && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation (slides in after answer) */}
          <AnimatePresence>
            {locked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-5"
              >
                <div className="callout-yellow rounded-r-xl py-3 px-4">
                  <p className="text-[11px] font-inter font-bold text-mdcat-yellow uppercase tracking-wide mb-1.5">
                    Explanation
                  </p>
                  <p className="font-inter text-[13px] text-[#CCCCCC] leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next / Finish */}
          <AnimatePresence>
            {locked && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="btn-primary w-full py-3 text-[14px]"
              >
                {current + 1 >= mcqs.length ? "See Results" : "Next Question →"}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Screen: Results
function ResultsScreen({
  subject,
  chapter,
  topic,
  mcqs,
  answers,
  onRetry,
  onNewChallenge,
}: {
  subject: Subject;
  chapter: string;
  topic: string;
  mcqs: MCQ[];
  answers: (number | null)[];
  onRetry: () => void;
  onNewChallenge: () => void;
}) {
  const correct = answers.filter((a, i) => a === mcqs[i].correct).length;
  const pct = Math.round((correct / mcqs.length) * 100);
  const cfg = SUBJECT_CONFIG[subject];

  const grade =
    pct === 100 ? { label: "Perfect!", color: "text-mdcat-yellow", icon: "🏆" } :
    pct >= 67  ? { label: "Good job!", color: "text-emerald-400", icon: "✅" } :
    pct >= 34  ? { label: "Keep going", color: "text-amber-400", icon: "💪" } :
    { label: "Battle stations!", color: "text-red-400", icon: "🎯" };

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-lg mx-auto"
    >
      {/* Score hero */}
      <div className="bg-dark-charcoal border border-warrior-border rounded-2xl p-6 mb-5 text-center">
        {/* Ring */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#2A2C2A" strokeWidth="9" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              stroke={pct === 100 ? "#FFC600" : pct >= 67 ? "#28A745" : pct >= 34 ? "#FFA500" : "#D9534F"}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="263.9"
              initial={{ strokeDashoffset: 263.9 }}
              animate={{ strokeDashoffset: 263.9 * (1 - pct / 100) }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="font-poppins font-black text-white text-[22px] leading-none">{correct}/{mcqs.length}</span>
          </div>
        </div>

        <div className="text-3xl mb-1">{grade.icon}</div>
        <p className={`font-poppins font-black text-[20px] ${grade.color} mb-1`}>{grade.label}</p>
        <p className="font-inter text-warrior-text text-[13px]">
          {subject} · {topic}
        </p>
      </div>

      {/* Per-question breakdown */}
      <div className="bg-dark-charcoal border border-warrior-border rounded-xl overflow-hidden mb-5">
        <p className="font-inter font-bold text-[11px] text-warrior-text uppercase tracking-wider px-4 py-3 border-b border-warrior-border/60">
          Question Breakdown
        </p>
        {mcqs.map((q, i) => {
          const userAnswer = answers[i];
          const isCorrect = userAnswer === q.correct;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 px-4 py-3 border-b border-warrior-border/40 last:border-b-0`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                {isCorrect
                  ? <CheckCircle2 size={14} className="text-emerald-400" />
                  : <XCircle size={14} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-[12px] text-white leading-snug line-clamp-2">{q.question}</p>
                {!isCorrect && (
                  <p className="font-inter text-[11px] text-emerald-400 mt-1">
                    Correct: {q.options[q.correct]}
                  </p>
                )}
              </div>
              <span className={`font-mono font-bold text-[11px] flex-shrink-0 mt-0.5 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {isCorrect ? "+1" : "–0"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: i < correct ? 1 : 0.4, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 300 }}
          >
            <Star
              size={28}
              className={i < correct ? "text-mdcat-yellow fill-mdcat-yellow" : "text-warrior-gray/30 fill-warrior-gray/10"}
            />
          </motion.div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-dark-charcoal border border-warrior-border rounded-xl text-warrior-text hover:text-white hover:border-warrior-text/50 transition-all font-inter font-semibold text-[13px]"
        >
          <RotateCcw size={14} /> Retry
        </button>
        <button
          onClick={onNewChallenge}
          className="flex-1 btn-primary py-3 text-[13px]"
        >
          New Challenge →
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function ChallengesPage() {
  const [screen, setScreen] = useState<ChallengeScreen>("subjects");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [challengeMCQs, setChallengeMCQs] = useState<MCQ[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<(number | null)[]>([]);

  // Breadcrumb
  const crumbs: { label: string; screen: ChallengeScreen }[] = [
    { label: "Subjects", screen: "subjects" },
    ...(selectedSubject ? [{ label: selectedSubject, screen: "chapters" as ChallengeScreen }] : []),
    ...(selectedChapter ? [{ label: selectedChapter, screen: "topics" as ChallengeScreen }] : []),
  ];

  function startChallenge(topic: string) {
    if (!selectedSubject || !selectedChapter) return;
    const mcqs = getMCQs(selectedSubject, selectedChapter, topic);
    setSelectedTopic(topic);
    setChallengeMCQs(mcqs);
    setFinalAnswers([]);
    setScreen("taking");
  }

  function handleFinish(answers: (number | null)[]) {
    setFinalAnswers(answers);
    setScreen("results");
  }

  function handleRetry() {
    setFinalAnswers([]);
    setScreen("taking");
  }

  function handleNewChallenge() {
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setChallengeMCQs([]);
    setFinalAnswers([]);
    setScreen("subjects");
  }

  const showBreadcrumb = ["chapters", "topics"].includes(screen);

  return (
    <div className="min-h-full px-4 lg:px-8 py-6 max-w-4xl mx-auto">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <h1 className="font-poppins font-black text-white text-[22px] lg:text-[26px]">
            Challenges
          </h1>
          <span className="px-2.5 py-1 bg-mdcat-yellow/15 border border-mdcat-yellow/30 text-mdcat-yellow font-mono font-bold text-[12px] rounded-full">
            3 MCQs
          </span>
        </div>
        <p className="font-inter text-warrior-text text-[13px] mt-1">
          Quick focused drills by subject, chapter, and topic.
        </p>
      </motion.div>

      {/* Breadcrumb (drill-down screens only) */}
      {showBreadcrumb && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 mb-5 flex-wrap"
        >
          {crumbs.map((crumb, i) => (
            <span key={crumb.screen} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-warrior-text/40" />}
              <button
                onClick={() => setScreen(crumb.screen)}
                className={`font-inter text-[12px] font-semibold transition-colors ${
                  i === crumbs.length - 1
                    ? "text-white cursor-default"
                    : "text-warrior-text hover:text-white"
                }`}
              >
                {crumb.label}
              </button>
            </span>
          ))}
        </motion.div>
      )}

      {/* ── Screens ── */}
      <AnimatePresence mode="wait">
        {screen === "subjects" && (
          <SubjectSelectScreen
            key="subjects"
            onSelect={(s) => {
              setSelectedSubject(s);
              setScreen("chapters");
            }}
          />
        )}

        {screen === "chapters" && selectedSubject && (
          <ChapterSelectScreen
            key="chapters"
            subject={selectedSubject}
            onSelect={(ch) => {
              setSelectedChapter(ch);
              setScreen("topics");
            }}
            onBack={() => {
              setSelectedSubject(null);
              setScreen("subjects");
            }}
          />
        )}

        {screen === "topics" && selectedSubject && selectedChapter && (
          <TopicSelectScreen
            key="topics"
            subject={selectedSubject}
            chapter={selectedChapter}
            onSelect={startChallenge}
            onBack={() => {
              setSelectedChapter(null);
              setScreen("chapters");
            }}
          />
        )}

        {screen === "taking" && selectedSubject && selectedChapter && selectedTopic && (
          <TakingScreen
            key="taking"
            subject={selectedSubject}
            chapter={selectedChapter}
            topic={selectedTopic}
            mcqs={challengeMCQs}
            onFinish={handleFinish}
          />
        )}

        {screen === "results" && selectedSubject && selectedChapter && selectedTopic && (
          <ResultsScreen
            key="results"
            subject={selectedSubject}
            chapter={selectedChapter}
            topic={selectedTopic}
            mcqs={challengeMCQs}
            answers={finalAnswers}
            onRetry={handleRetry}
            onNewChallenge={handleNewChallenge}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
