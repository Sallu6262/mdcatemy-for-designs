"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Clock, Bookmark, BookmarkCheck, Flag, AlertTriangle,
  CheckCircle, XCircle, SkipForward, Send, RotateCcw,
  TrendingUp, TrendingDown, Filter, Eye, X, Sparkles, Shuffle, Pencil,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const SUBJECTS: Record<string, { chapters: Record<string, string[]>; color: string; mcqCount: number }> = {
  Biology: {
    color: "#10B981",
    mcqCount: 7294,
    chapters: {
      "Cell Biology":           ["Cell Structure", "Cell Membrane", "Mitosis", "Meiosis", "Cell Cycle"],
      "Biological Molecules":   ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids", "Water & pH"],
      "Bioenergetics":          ["Photosynthesis", "Cellular Respiration", "Glycolysis", "Krebs Cycle", "ATP Synthesis"],
      "Gaseous Exchange":       ["Respiratory System", "Breathing Mechanism", "Gas Transport", "Respiratory Disorders"],
      "Digestion":              ["Digestive System", "Enzymes & Absorption", "Liver Functions", "Nutritional Disorders"],
      "Transport":              ["Blood Composition", "Cardiac Cycle", "Blood Vessels", "Blood Groups"],
      "Homeostasis":            ["Kidney Structure", "Urine Formation", "Osmoregulation", "Thermoregulation"],
      "Coordination & Control": ["Neurons", "Brain Structure", "Spinal Cord", "Endocrine System", "Hormones"],
      "Genetics & Inheritance": ["Mendelian Genetics", "DNA Replication", "Protein Synthesis", "Mutations", "Genetic Disorders"],
      "Evolution":              ["Darwin's Theory", "Evidence for Evolution", "Natural Selection", "Speciation"],
    },
  },
  Chemistry: {
    color: "#38BDF8",
    mcqCount: 8672,
    chapters: {
      "Atomic Structure":       ["Electronic Configuration", "Quantum Numbers", "Shapes of Orbitals", "Isotopes"],
      "Chemical Bonding":       ["Ionic Bonding", "Covalent Bonding", "Hybridisation", "Intermolecular Forces"],
      "States of Matter":       ["Gas Laws", "Ideal Gas Equation", "Liquids & Solids", "Van der Waals Forces"],
      "Thermochemistry":        ["Enthalpy", "Hess's Law", "Bond Energies", "Gibbs Free Energy"],
      "Electrochemistry":       ["Redox Reactions", "Galvanic Cells", "Electrolytic Cells", "Faraday's Laws"],
      "Chemical Equilibrium":   ["Le Chatelier's Principle", "Equilibrium Constants", "Solubility Product", "Buffer Solutions"],
      "Reaction Kinetics":      ["Rate of Reaction", "Rate Equations", "Activation Energy", "Catalysis"],
      "s-Block Elements":       ["Group I Properties", "Group II Properties", "Reactions with Water", "Industrial Uses"],
      "Organic Chemistry":      ["Hydrocarbons", "Functional Groups", "Isomerism", "Organic Reactions"],
      "Industrial Chemistry":   ["Haber Process", "Contact Process", "Solvay Process", "Polymers & Plastics"],
    },
  },
  Physics: {
    color: "#A78BFA",
    mcqCount: 6270,
    chapters: {
      "Measurements":           ["SI Units", "Dimensional Analysis", "Errors & Uncertainties", "Significant Figures"],
      "Kinematics":             ["Linear Motion", "Projectile Motion", "Equations of Motion", "Motion Graphs"],
      "Forces & Newton's Laws": ["Newton's Three Laws", "Friction", "Momentum", "Impulse"],
      "Work, Energy & Power":   ["Work Done", "Kinetic & Potential Energy", "Conservation of Energy", "Power"],
      "Circular Motion":        ["Centripetal Force", "Gravity", "Artificial Satellites", "Orbital Motion"],
      "Waves & Sound":          ["Wave Properties", "Superposition", "Doppler Effect", "Sound Waves"],
      "Optics":                 ["Reflection", "Refraction", "Lenses", "Optical Instruments"],
      "Electricity":            ["Ohm's Law", "Circuits & Resistors", "Capacitance", "Magnetic Effects"],
      "Nuclear Physics":        ["Radioactivity", "Nuclear Equations", "Half-life", "Fission & Fusion"],
      "Electronics":            ["Semiconductors", "Diodes", "Transistors", "Logic Gates"],
    },
  },
  English: {
    color: "#2DD4BF",
    mcqCount: 3478,
    chapters: {
      "Grammar":                ["Tenses", "Parts of Speech", "Active & Passive Voice", "Direct & Indirect Speech", "Subject-Verb Agreement"],
      "Vocabulary":             ["Synonyms", "Antonyms", "Analogies", "Idioms & Phrases", "Word Formation"],
      "Reading Comprehension":  ["Main Idea", "Inference Questions", "Tone & Attitude", "Detail Questions"],
      "Fill in the Blanks":     ["Prepositions", "Conjunctions", "Articles", "Contextual Vocabulary"],
      "Sentence Correction":    ["Grammatical Errors", "Punctuation", "Sentence Structure", "Word Choice"],
    },
  },
  "Logical Reasoning": {
    color: "#FB923C",
    mcqCount: 416,
    chapters: {
      "Number & Letter Series": ["Number Patterns", "Letter Patterns", "Mixed Series"],
      "Analogies":              ["Word Analogies", "Numeric Analogies", "Letter Analogies"],
      "Classification":         ["Number Classification", "Word Classification", "Figure Classification"],
      "Syllogisms":             ["Simple Syllogisms", "Complex Syllogisms", "Venn Diagrams"],
      "Spatial Reasoning":      ["Mirror Images", "Paper Folding", "Figure Rotation"],
    },
  },
};

/* ═══════════════════════════════════════════════════════════
   MOCK ACCURACY DATA — subject > chapter > topic (null = untouched)
═══════════════════════════════════════════════════════════ */
const MOCK_ACCURACY: Record<string, {
  acc: number;
  chapters: Record<string, { acc: number; topics: Record<string, number | null> }>;
}> = {
  Biology: {
    acc: 76,
    chapters: {
      "Cell Biology":           { acc: 76, topics: { "Cell Structure": 88, "Cell Membrane": 83, "Mitosis": 71, "Meiosis": 71, "Cell Cycle": 67 } },
      "Biological Molecules":   { acc: 71, topics: { "Carbohydrates": 87, "Proteins": 84, "Lipids": 72, "Nucleic Acids": 68, "Water & pH": 73 } },
      "Bioenergetics":          { acc: 76, topics: { "Photosynthesis": 65, "Cellular Respiration": 72, "Glycolysis": 80, "Krebs Cycle": 75, "ATP Synthesis": 88 } },
      "Gaseous Exchange":       { acc: 79, topics: { "Respiratory System": 80, "Breathing Mechanism": 78, "Gas Transport": null, "Respiratory Disorders": 79 } },
      "Digestion":              { acc: 72, topics: { "Digestive System": 78, "Enzymes & Absorption": 65, "Liver Functions": 70, "Nutritional Disorders": null } },
      "Transport":              { acc: 76, topics: { "Blood Composition": 82, "Cardiac Cycle": 71, "Blood Vessels": 75, "Blood Groups": 77 } },
      "Homeostasis":            { acc: 77, topics: { "Kidney Structure": 80, "Urine Formation": 74, "Osmoregulation": 76, "Thermoregulation": null } },
      "Coordination & Control": { acc: 80, topics: { "Neurons": 85, "Brain Structure": 78, "Spinal Cord": 82, "Endocrine System": 76, "Hormones": 79 } },
      "Genetics & Inheritance": { acc: 72, topics: { "Mendelian Genetics": 80, "DNA Replication": 75, "Protein Synthesis": 68, "Mutations": 62, "Genetic Disorders": 72 } },
      "Evolution":              { acc: 68, topics: { "Darwin's Theory": 75, "Evidence for Evolution": 65, "Natural Selection": 70, "Speciation": null } },
    },
  },
  Chemistry: {
    acc: 67,
    chapters: {
      "Atomic Structure":       { acc: 74, topics: { "Electronic Configuration": 82, "Quantum Numbers": 68, "Shapes of Orbitals": 71, "Isotopes": 74 } },
      "Chemical Bonding":       { acc: 71, topics: { "Ionic Bonding": 80, "Covalent Bonding": 75, "Hybridisation": 62, "Intermolecular Forces": 66 } },
      "States of Matter":       { acc: 65, topics: { "Gas Laws": 72, "Ideal Gas Equation": 68, "Liquids & Solids": 60, "Van der Waals Forces": null } },
      "Thermochemistry":        { acc: 58, topics: { "Enthalpy": 65, "Hess's Law": 54, "Bond Energies": 58, "Gibbs Free Energy": 44 } },
      "Electrochemistry":       { acc: 62, topics: { "Redox Reactions": 70, "Galvanic Cells": 58, "Electrolytic Cells": 55, "Faraday's Laws": null } },
      "Chemical Equilibrium":   { acc: 66, topics: { "Le Chatelier's Principle": 74, "Equilibrium Constants": 62, "Solubility Product": 58, "Buffer Solutions": null } },
      "Reaction Kinetics":      { acc: 70, topics: { "Rate of Reaction": 78, "Rate Equations": 65, "Activation Energy": 70, "Catalysis": null } },
      "s-Block Elements":       { acc: 75, topics: { "Group I Properties": 79, "Group II Properties": 74, "Reactions with Water": 76, "Industrial Uses": 72 } },
      "Organic Chemistry":      { acc: 64, topics: { "Hydrocarbons": 72, "Functional Groups": 70, "Isomerism": 58, "Organic Reactions": 55 } },
      "Industrial Chemistry":   { acc: 61, topics: { "Haber Process": 70, "Contact Process": 65, "Solvay Process": 55, "Polymers & Plastics": null } },
    },
  },
  Physics: {
    acc: 70,
    chapters: {
      "Measurements":           { acc: 82, topics: { "SI Units": 90, "Dimensional Analysis": 85, "Errors & Uncertainties": 75, "Significant Figures": 78 } },
      "Kinematics":             { acc: 76, topics: { "Linear Motion": 82, "Projectile Motion": 72, "Equations of Motion": 78, "Motion Graphs": 70 } },
      "Forces & Newton's Laws": { acc: 80, topics: { "Newton's Three Laws": 88, "Friction": 78, "Momentum": 76, "Impulse": null } },
      "Work, Energy & Power":   { acc: 75, topics: { "Work Done": 82, "Kinetic & Potential Energy": 79, "Conservation of Energy": 68, "Power": null } },
      "Circular Motion":        { acc: 65, topics: { "Centripetal Force": 70, "Gravity": 68, "Artificial Satellites": 60, "Orbital Motion": null } },
      "Waves & Sound":          { acc: 67, topics: { "Wave Properties": 75, "Superposition": 62, "Doppler Effect": 55, "Sound Waves": null } },
      "Optics":                 { acc: 72, topics: { "Reflection": 80, "Refraction": 70, "Lenses": 68, "Optical Instruments": null } },
      "Electricity":            { acc: 68, topics: { "Ohm's Law": 80, "Circuits & Resistors": 72, "Capacitance": 58, "Magnetic Effects": null } },
      "Nuclear Physics":        { acc: 60, topics: { "Radioactivity": 68, "Nuclear Equations": 62, "Half-life": 58, "Fission & Fusion": null } },
      "Electronics":            { acc: 55, topics: { "Semiconductors": 62, "Diodes": 58, "Transistors": 48, "Logic Gates": null } },
    },
  },
  English: {
    acc: 79,
    chapters: {
      "Grammar":                { acc: 82, topics: { "Tenses": 88, "Parts of Speech": 85, "Active & Passive Voice": 78, "Direct & Indirect Speech": 75, "Subject-Verb Agreement": 82 } },
      "Vocabulary":             { acc: 76, topics: { "Synonyms": 82, "Antonyms": 78, "Analogies": 68, "Idioms & Phrases": 72, "Word Formation": null } },
      "Reading Comprehension":  { acc: 80, topics: { "Main Idea": 86, "Inference Questions": 75, "Tone & Attitude": 78, "Detail Questions": null } },
      "Fill in the Blanks":     { acc: 77, topics: { "Prepositions": 82, "Conjunctions": 78, "Articles": 80, "Contextual Vocabulary": null } },
      "Sentence Correction":    { acc: 79, topics: { "Grammatical Errors": 84, "Punctuation": 76, "Sentence Structure": 72, "Word Choice": null } },
    },
  },
  "Logical Reasoning": {
    acc: 63,
    chapters: {
      "Number & Letter Series": { acc: 70, topics: { "Number Patterns": 78, "Letter Patterns": 68, "Mixed Series": 62 } },
      "Analogies":              { acc: 66, topics: { "Word Analogies": 72, "Numeric Analogies": 64, "Letter Analogies": null } },
      "Classification":         { acc: 62, topics: { "Number Classification": 68, "Word Classification": 60, "Figure Classification": null } },
      "Syllogisms":             { acc: 58, topics: { "Simple Syllogisms": 64, "Complex Syllogisms": 52, "Venn Diagrams": null } },
      "Spatial Reasoning":      { acc: 55, topics: { "Mirror Images": 62, "Paper Folding": 48, "Figure Rotation": null } },
    },
  },
};

// 20 realistic mock MCQs
const MOCK_MCQS = [
  { id: 1, subject: "Biology", chapter: "Cell Biology", topic: "Cell Division", difficulty: "Medium",
    question: "During which phase of mitosis do chromosomes align at the metaphase plate?",
    options: ["Prophase", "Metaphase", "Anaphase", "Telophase"], correct: 1,
    explanation: "During Metaphase, chromosomes line up along the cell's equatorial plane (metaphase plate), attached to spindle fibres from both poles. This alignment is essential for equal chromosome distribution." },
  { id: 2, subject: "Biology", chapter: "Genetics", topic: "DNA Structure", difficulty: "Easy",
    question: "Which nitrogenous base is found in RNA but NOT in DNA?",
    options: ["Adenine", "Guanine", "Uracil", "Thymine"], correct: 2,
    explanation: "RNA contains Uracil instead of Thymine. Both pair with Adenine, but Uracil lacks the methyl group present on Thymine. This is a key structural difference between DNA and RNA." },
  { id: 3, subject: "Biology", chapter: "Human Physiology", topic: "Nervous System", difficulty: "Hard",
    question: "The resting membrane potential of a typical neuron is approximately:",
    options: ["-35 mV", "-70 mV", "+35 mV", "+70 mV"], correct: 1,
    explanation: "The resting membrane potential is approximately -70 mV. This negative charge is maintained by the Na⁺/K⁺ ATPase pump and the selective permeability of the membrane to K⁺ ions." },
  { id: 4, subject: "Chemistry", chapter: "Organic Chemistry", topic: "Functional Groups", difficulty: "Easy",
    question: "Which functional group is characteristic of alcohols?",
    options: ["Carboxyl (-COOH)", "Amino (-NH₂)", "Hydroxyl (-OH)", "Carbonyl (C=O)"], correct: 2,
    explanation: "Alcohols are characterised by the hydroxyl (-OH) functional group attached to a carbon atom. This group makes alcohols polar and capable of hydrogen bonding." },
  { id: 5, subject: "Chemistry", chapter: "Electrochemistry", topic: "Galvanic Cells", difficulty: "Hard",
    question: "In a galvanic cell, oxidation occurs at the:",
    options: ["Cathode", "Anode", "Salt bridge", "External circuit"], correct: 1,
    explanation: "In a galvanic cell, oxidation (loss of electrons) occurs at the anode. The mnemonic OIL RIG helps: Oxidation Is Loss, Reduction Is Gain. The cathode is where reduction occurs." },
  { id: 6, subject: "Chemistry", chapter: "Chemical Bonding", topic: "Hybridisation", difficulty: "Medium",
    question: "The hybridisation of carbon in ethene (C₂H₄) is:",
    options: ["sp³", "sp²", "sp", "sp³d"], correct: 1,
    explanation: "Carbon in ethene is sp² hybridised. Each carbon forms 3 sigma bonds using sp² orbitals, with the remaining p orbital forming the pi bond of the double bond. The geometry is trigonal planar." },
  { id: 7, subject: "Physics", chapter: "Mechanics", topic: "Newton's Laws", difficulty: "Easy",
    question: "A 5 kg object accelerates at 3 m/s². The net force acting on it is:",
    options: ["1.67 N", "8 N", "15 N", "0.6 N"], correct: 2,
    explanation: "Using Newton's second law: F = ma = 5 kg × 3 m/s² = 15 N. The net force is the vector sum of all forces acting on the object and equals mass times acceleration." },
  { id: 8, subject: "Physics", chapter: "Waves", topic: "Doppler Effect", difficulty: "Hard",
    question: "When a sound source moves TOWARDS a stationary observer, the observed frequency:",
    options: ["Decreases", "Remains the same", "Increases", "Becomes zero"], correct: 2,
    explanation: "When the source moves towards the observer, sound waves are compressed, reducing the wavelength. By the wave equation (v = fλ), if wavelength decreases and speed is constant, frequency increases — hence a higher pitch." },
  { id: 9, subject: "Physics", chapter: "Electricity", topic: "Circuits", difficulty: "Medium",
    question: "Three 6Ω resistors are connected in parallel. The equivalent resistance is:",
    options: ["18 Ω", "6 Ω", "2 Ω", "0.5 Ω"], correct: 2,
    explanation: "For n identical resistors in parallel: R_eq = R/n = 6/3 = 2 Ω. Alternatively: 1/R_eq = 1/6 + 1/6 + 1/6 = 3/6 = 1/2, so R_eq = 2 Ω." },
  { id: 10, subject: "English", chapter: "Vocabulary", topic: "Synonyms", difficulty: "Easy",
    question: "Which word is closest in meaning to 'METICULOUS'?",
    options: ["Careless", "Thorough", "Rapid", "Vague"], correct: 1,
    explanation: "'Meticulous' means showing great attention to detail and being very careful and precise. 'Thorough' is the closest synonym, both indicating careful, detailed work." },
  { id: 11, subject: "Biology", chapter: "Cell Biology", topic: "Meiosis", difficulty: "Medium",
    question: "Crossing over during meiosis occurs at the:",
    options: ["Centromere", "Chiasmata", "Spindle fibre", "Nuclear envelope"], correct: 1,
    explanation: "Crossing over (genetic recombination) occurs at the chiasmata — points where non-sister chromatids of homologous chromosomes overlap and exchange segments during Prophase I of meiosis." },
  { id: 12, subject: "Chemistry", chapter: "Thermodynamics", topic: "Enthalpy", difficulty: "Medium",
    question: "A reaction with ΔH < 0 is classified as:",
    options: ["Endothermic", "Exothermic", "Isothermal", "Adiabatic"], correct: 1,
    explanation: "When ΔH (enthalpy change) is negative, the reaction releases heat to the surroundings — this is an exothermic reaction. Examples include combustion and neutralisation reactions." },
  { id: 13, subject: "Biology", chapter: "Ecology", topic: "Ecosystems", difficulty: "Easy",
    question: "Which organisms occupy the first trophic level in a food chain?",
    options: ["Herbivores", "Carnivores", "Producers", "Decomposers"], correct: 2,
    explanation: "Producers (autotrophs like plants and algae) occupy the first trophic level. They convert solar energy into chemical energy through photosynthesis, forming the base of all food chains." },
  { id: 14, subject: "Physics", chapter: "Optics", topic: "Refraction", difficulty: "Medium",
    question: "When light travels from a denser to a rarer medium, it:",
    options: ["Bends towards normal", "Bends away from normal", "Travels straight", "Is completely absorbed"], correct: 1,
    explanation: "When light moves from a denser (higher refractive index) to a rarer (lower refractive index) medium, it speeds up and bends away from the normal. This is why a straw appears bent in water." },
  { id: 15, subject: "English", chapter: "Grammar", topic: "Tenses", difficulty: "Easy",
    question: "Which sentence uses the Present Perfect tense correctly?",
    options: [
      "She goes to the market yesterday.",
      "She has gone to the market.",
      "She going to the market.",
      "She gone to the market."
    ], correct: 1,
    explanation: "The Present Perfect tense is formed with 'has/have + past participle'. 'She has gone to the market' is correct. It indicates an action completed at an unspecified time before now." },
  { id: 16, subject: "Logical Reasoning", chapter: "Patterns", topic: "Number Series", difficulty: "Medium",
    question: "Find the next number: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"], correct: 2,
    explanation: "The differences are 4, 6, 8, 10, 12... (increasing by 2 each time). So 30 + 12 = 42. Alternatively, the pattern is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42." },
  { id: 17, subject: "Biology", chapter: "Human Physiology", topic: "Digestive System", difficulty: "Easy",
    question: "Bile is produced by the liver and stored in the:",
    options: ["Pancreas", "Stomach", "Gallbladder", "Small intestine"], correct: 2,
    explanation: "Bile is produced by liver hepatocytes and stored and concentrated in the gallbladder. It is released into the duodenum during digestion to emulsify fats, increasing the surface area for lipase action." },
  { id: 18, subject: "Chemistry", chapter: "Organic Chemistry", topic: "Reactions", difficulty: "Hard",
    question: "Which type of reaction converts an alkene to an alkane?",
    options: ["Substitution", "Elimination", "Hydrogenation", "Oxidation"], correct: 2,
    explanation: "Hydrogenation (catalytic addition of H₂) converts an alkene (C=C double bond) to an alkane (C-C single bond). This requires a catalyst (Ni, Pt, or Pd) and proceeds as an addition reaction." },
  { id: 19, subject: "Physics", chapter: "Mechanics", topic: "Work & Energy", difficulty: "Medium",
    question: "A 10 kg box is lifted 3 m. The work done against gravity (g = 10 m/s²) is:",
    options: ["30 J", "300 J", "13 J", "100 J"], correct: 1,
    explanation: "Work done against gravity = mgh = 10 kg × 10 m/s² × 3 m = 300 J. Work is the product of force and displacement in the direction of the force. Here the force equals the weight (mg)." },
  { id: 20, subject: "Logical Reasoning", chapter: "Reasoning", topic: "Syllogisms", difficulty: "Hard",
    question: "All doctors are graduates. Some graduates are rich. Which conclusion is valid?",
    options: [
      "All doctors are rich",
      "Some doctors are rich",
      "Some graduates are doctors",
      "No conclusion follows"
    ], correct: 2,
    explanation: "From the statements, we can conclude 'Some graduates are doctors' (since all doctors are graduates, doctors form a subset of graduates). We cannot conclude anything about doctors being rich from the given premises alone." },
];

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Screen = "builder" | "taking" | "results";
type Difficulty = "Easy" | "Medium" | "Hard" | "Mixed";
type RevealMode = "each" | "end";

interface QuizConfig {
  subjects: string[];
  chapters: Record<string, string[]>;
  topics: Record<string, string[]>;
  count: number;
  difficulty: Difficulty[];
  timerOn: boolean;
  timerMinutes: number;
  revealMode: RevealMode;
}

interface MCQState {
  selected: number | null;   // user's current answer — mutable until quiz submit
  locked: number | null;     // finalized answer (set on submit OR on per-question reveal in "each" mode)
  flagged?: boolean;         // marked for review
  bookmarked: boolean;
  skipped: boolean;
  explanationOpen: boolean;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function gradeLabel(pct: number) {
  if (pct >= 90) return { label: "Warrior", color: "text-mdcat-yellow" };
  if (pct >= 75) return { label: "Solid", color: "text-emerald-400" };
  if (pct >= 60) return { label: "Keep Going", color: "text-amber-400" };
  return { label: "Battle Stations", color: "text-red-400" };
}

function accStyle(pct: number | null) {
  if (pct === null || pct === undefined)
    return { text: "text-warrior-text/50", bg: "bg-warrior-text/8", border: "border-warrior-border/50", dot: "#6B7280" };
  if (pct >= 75)
    return { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25", dot: "#10B981" };
  if (pct >= 50)
    return { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/25", dot: "#F59E0B" };
  return { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/25", dot: "#EF4444" };
}

/* ═══════════════════════════════════════════════════════════
   SMART SELECT HELPERS
═══════════════════════════════════════════════════════════ */
interface TopicEntry { subject: string; chapter: string; topic: string; acc: number | null; }

const ALL_TOPICS: TopicEntry[] = Object.entries(SUBJECTS).flatMap(([sub]) =>
  Object.entries(SUBJECTS[sub].chapters).flatMap(([ch, topics]) =>
    topics.map((topic) => ({
      subject: sub, chapter: ch, topic,
      acc: MOCK_ACCURACY[sub]?.chapters[ch]?.topics[topic] ?? null,
    }))
  )
).sort((a, b) => {
  // nulls (untouched) come last, otherwise ascending by acc
  if (a.acc === null && b.acc === null) return 0;
  if (a.acc === null) return 1;
  if (b.acc === null) return -1;
  return a.acc - b.acc;
});

const MYSTERY_NAMES = [
  "Operation Synapse", "The Dark Vault", "Quantum Rift", "Neural Storm",
  "The Final Countdown", "Blackout Protocol", "Zero Hour", "Code Red",
  "Phantom Circuit", "Blitz Run", "Shadow Test", "Iron Gauntlet",
  "Silent Surge", "Warp Drive", "Neon Frontier", "Midnight Blitz",
];

interface MysteryConfig {
  name: string;
  total: number;
  weak: TopicEntry[];
  improving: TopicEntry[];
  strong: TopicEntry[];
}

function generateMysteryTest(total: number): MysteryConfig {
  const weakPool      = ALL_TOPICS.filter((t) => t.acc !== null && t.acc < 50);
  const improvingPool = ALL_TOPICS.filter((t) => t.acc !== null && t.acc >= 50 && t.acc < 75);
  const strongPool    = ALL_TOPICS.filter((t) => t.acc !== null && t.acc >= 75);

  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const wCount = Math.round(total * 0.35);
  const iCount = Math.round(total * 0.45);
  const sCount = total - wCount - iCount;

  return {
    name: MYSTERY_NAMES[Math.floor(Math.random() * MYSTERY_NAMES.length)],
    total,
    weak:      shuffle(weakPool).slice(0, Math.min(wCount, weakPool.length)),
    improving: shuffle(improvingPool).slice(0, Math.min(iCount, improvingPool.length)),
    strong:    shuffle(strongPool).slice(0, Math.min(sCount, strongPool.length)),
  };
}

/* ═══════════════════════════════════════════════════════════
   SMART SELECT SHEET
═══════════════════════════════════════════════════════════ */
type SsView = "menu" | "global" | "perSubject" | "perChapter" | "mystery";

function SmartSelectSheet({
  open, onClose, onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (topics: TopicEntry[]) => void;
}) {
  const [view, setView]             = useState<SsView>("menu");
  const [subStep, setSubStep]       = useState(0);
  const [nPreset, setNPreset]       = useState<3 | 5 | 10 | "custom">(5);
  const [customNStr, setCustomNStr] = useState("15");
  const [ssSubs, setSsSubs]         = useState<string[]>([]);
  const [ssChaps, setSsChaps]       = useState<string[]>([]);
  const [mystery, setMystery]       = useState<MysteryConfig | null>(null);

  const effectiveN = nPreset === "custom" ? Math.max(1, parseInt(customNStr, 10) || 1) : nPreset;

  useEffect(() => {
    if (open) {
      setView("menu");
      setSubStep(0);
      setSsSubs([]);
      setSsChaps([]);
    }
  }, [open]);

  useEffect(() => {
    setSubStep(0);
    setSsSubs([]);
    setSsChaps([]);
  }, [view]);

  const globalTopics  = ALL_TOPICS.filter((t) => t.acc !== null).slice(0, effectiveN);
  const subjectTopics = ALL_TOPICS.filter((t) => t.acc !== null && ssSubs.includes(t.subject)).slice(0, effectiveN);
  const chapterTopics = ALL_TOPICS.filter((t) => t.acc !== null && ssSubs.includes(t.subject) && ssChaps.includes(t.chapter)).slice(0, effectiveN);

  const NPicker = () => (
    <div>
      <p className="text-[10px] font-poppins font-black uppercase tracking-[0.12em] text-warrior-text mb-2.5">How many weakest topics?</p>
      <div className="flex items-center gap-2 flex-wrap">
        {([3, 5, 10] as const).map((p) => (
          <button key={p} onClick={() => setNPreset(p)}
            className={`px-4 py-2 rounded-lg border text-[13px] font-poppins font-black transition-all active:scale-95 ${
              nPreset === p ? "bg-mdcat-yellow text-warrior-black border-mdcat-yellow" : "border-warrior-border text-warrior-text hover:border-warrior-text/50 hover:text-white"
            }`}>{p}</button>
        ))}
        <button onClick={() => setNPreset("custom")}
          className={`px-4 py-2 rounded-lg border text-[13px] font-poppins font-black transition-all active:scale-95 ${
            nPreset === "custom" ? "bg-mdcat-yellow text-warrior-black border-mdcat-yellow" : "border-warrior-border text-warrior-text hover:border-warrior-text/50 hover:text-white"
          }`}>Custom</button>
        {nPreset === "custom" && (
          <input
            type="number" min={1} max={100} value={customNStr}
            onChange={(e) => setCustomNStr(e.target.value)}
            placeholder="e.g. 15"
            autoFocus
            className="w-20 h-9 bg-warrior-black border-2 border-mdcat-yellow/60 rounded-lg text-center text-mdcat-yellow font-poppins font-black text-[14px] focus:outline-none focus:border-mdcat-yellow transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        )}
      </div>
    </div>
  );

  const TopicPreviewList = ({ topics, onApplyClick }: { topics: TopicEntry[]; onApplyClick: () => void }) => (
    <div className="space-y-3">
      <p className="text-[10px] font-poppins font-black uppercase tracking-[0.12em] text-warrior-text">
        Preview — {topics.length} topic{topics.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-1.5 max-h-[36vh] overflow-y-auto pr-1">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-1">
            <p className="text-warrior-text/50 font-inter text-[13px]">No topics found</p>
            <p className="text-warrior-text/30 font-inter text-[11px]">Adjust your filters or increase N.</p>
          </div>
        ) : topics.map((t, i) => {
          const s = accStyle(t.acc);
          return (
            <div key={`${t.subject}-${t.chapter}-${t.topic}`}
              className="flex items-center gap-3 bg-warrior-black/40 border border-warrior-border/60 rounded-xl px-3.5 py-2.5">
              <span className="text-[10px] font-poppins font-black text-warrior-text/40 w-5 text-right flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-poppins font-black text-[12px] text-white leading-snug truncate">{t.topic}</p>
                <p className="text-[10px] font-inter text-warrior-text/50 truncate">{t.subject} · {t.chapter}</p>
              </div>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-poppins font-black border flex-shrink-0 ${s.text} ${s.bg} ${s.border}`}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                {t.acc}%
              </span>
            </div>
          );
        })}
      </div>
      {topics.length > 0 && (
        <button onClick={onApplyClick}
          className="w-full py-3 bg-mdcat-yellow text-warrior-black font-poppins font-black text-[13px] rounded-xl border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all">
          Add {topics.length} Topics to Test
        </button>
      )}
    </div>
  );

  const menuOptions: { view: SsView; icon: React.ReactNode; iconBg: string; title: string; sub: string; badge: string | null; badgeColor: string }[] = [
    { view: "global",     icon: <TrendingDown size={18} className="text-red-400" />,    iconBg: "bg-red-500/10",    title: "Top N Weakest Topics",  sub: "Weakest across all subjects & chapters",   badge: "Most popular", badgeColor: "bg-emerald-400/15 text-emerald-400" },
    { view: "perSubject", icon: <Filter size={18} className="text-amber-400" />,        iconBg: "bg-amber-400/10",  title: "Weakest by Subject",    sub: "Pick subjects, then top N weak topics",    badge: null,           badgeColor: "" },
    { view: "perChapter", icon: <TrendingUp size={18} className="text-blue-400" />,     iconBg: "bg-blue-400/10",   title: "Weakest in Chapter",    sub: "Pick subject → chapter → top N topics",   badge: null,           badgeColor: "" },
    { view: "mystery",    icon: <Shuffle size={18} className="text-purple-400" />,      iconBg: "bg-purple-500/10", title: "Mystery Test",          sub: "35% weak · 45% improving · 20% strong",   badge: "Surprise me",  badgeColor: "bg-purple-400/15 text-purple-400" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-dark-charcoal border-t-2 border-warrior-border rounded-t-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-warrior-border rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-warrior-border/60 flex-shrink-0">
              <div className="flex items-center gap-2">
                {view !== "menu" && (
                  <button
                    onClick={() => { if (subStep > 0) setSubStep((s) => s - 1); else setView("menu"); }}
                    className="w-7 h-7 rounded-lg bg-warrior-gray/50 flex items-center justify-center text-warrior-text hover:text-white transition-colors mr-1">
                    <ChevronLeft size={15} />
                  </button>
                )}
                <Sparkles size={15} className="text-mdcat-yellow" />
                <span className="font-poppins font-black text-white text-[15px]">
                  {view === "menu"   ? "Smart Select" :
                   view === "global" ? "Top N Weakest Topics" :
                   view === "mystery" ? "Mystery Test" :
                   view === "perSubject" ? (subStep === 0 ? "Select Subjects" : "Pick Weakest Topics") :
                   /* perChapter */        subStep === 0 ? "Select Subjects"
                                        : subStep === 1 ? "Select Chapters"
                                        :                 "Pick Weakest Topics"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Step dots for multi-step flows */}
                {(view === "perSubject" || view === "perChapter") && (
                  <div className="flex items-center gap-1 mr-1">
                    {Array.from({ length: view === "perSubject" ? 2 : 3 }).map((_, i) => (
                      <div key={i} className={`rounded-full transition-all duration-200 ${i === subStep ? "w-4 h-1.5 bg-mdcat-yellow" : "w-1.5 h-1.5 bg-warrior-border"}`} />
                    ))}
                  </div>
                )}
                <button onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-warrior-gray/50 flex items-center justify-center text-warrior-text hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* MENU */}
              {view === "menu" && (
                <div className="space-y-3">
                  <p className="text-[11px] font-inter text-warrior-text/60 leading-relaxed">Let the algorithm pick — build a test targeting your weakest areas.</p>
                  {menuOptions.map(({ view: v, icon, iconBg, title, sub, badge, badgeColor }) => (
                    <button key={v}
                      onClick={() => { setView(v); if (v === "mystery") setMystery(generateMysteryTest(20)); }}
                      className="w-full flex items-center gap-3 bg-warrior-black/40 border border-warrior-border hover:border-warrior-text/50 rounded-xl px-4 py-3.5 transition-all group text-left">
                      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-poppins font-black text-[13px] text-white">{title}</p>
                          {badge && <span className={`text-[9px] font-poppins font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>}
                        </div>
                        <p className="text-[11px] font-inter text-warrior-text/60 mt-0.5">{sub}</p>
                      </div>
                      <ChevronRight size={15} className="text-warrior-text/40 group-hover:text-warrior-text flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* GLOBAL */}
              {view === "global" && (
                <div className="space-y-5">
                  <NPicker />
                  <TopicPreviewList topics={globalTopics} onApplyClick={() => onApply(globalTopics)} />
                </div>
              )}

              {/* PER SUBJECT — step 0: pick subjects */}
              {view === "perSubject" && subStep === 0 && (
                <div className="space-y-5">
                  <p className="text-[11px] font-inter text-warrior-text/60">Select one or more subjects. The weakest topics across all selected subjects will be pooled together.</p>
                  <div className="space-y-2">
                    {Object.entries(SUBJECTS).map(([sub, data]) => {
                      const active = ssSubs.includes(sub);
                      const subAcc = MOCK_ACCURACY[sub]?.acc ?? null;
                      const as2 = accStyle(subAcc);
                      return (
                        <button key={sub}
                          onClick={() => setSsSubs((prev) => active ? prev.filter((s) => s !== sub) : [...prev, sub])}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            active ? "bg-mdcat-yellow/10 border-mdcat-yellow text-white shadow-[2px_2px_0px_rgba(255,198,0,0.1)]" : "border-warrior-border text-warrior-text hover:border-mdcat-yellow/50"
                          }`}>
                          <div className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-warrior-black" style={{ backgroundColor: data.color }} />
                          <span className="font-poppins font-black text-[14px] flex-1 text-left">{sub}</span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-poppins font-black border flex-shrink-0 ${as2.text} ${as2.bg} ${as2.border}`}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: as2.dot }} />
                            {subAcc !== null ? `${subAcc}%` : "—"}
                          </span>
                          {active
                            ? <CheckCircle size={16} className="text-mdcat-yellow flex-shrink-0" strokeWidth={2.5} />
                            : <ChevronRight size={16} className="text-warrior-text/40 flex-shrink-0" strokeWidth={2.5} />}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={ssSubs.length === 0}
                    onClick={() => setSubStep(1)}
                    className="w-full py-3 bg-mdcat-yellow text-warrior-black font-poppins font-black text-[13px] rounded-xl border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[3px_3px_0px_rgba(0,0,0,0.4)] disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center gap-2"
                  >
                    Continue with {ssSubs.length || "0"} subject{ssSubs.length !== 1 ? "s" : ""} <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* PER SUBJECT — step 1: N picker + preview */}
              {view === "perSubject" && subStep === 1 && (
                <div className="space-y-5">
                  {/* Selected subjects pill strip */}
                  <div className="flex flex-wrap gap-1.5">
                    {ssSubs.map((s) => (
                      <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-mdcat-yellow/10 border border-mdcat-yellow/30 rounded-full text-[11px] font-poppins font-black text-mdcat-yellow">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUBJECTS[s].color }} />
                        {s}
                      </span>
                    ))}
                  </div>
                  <NPicker />
                  <TopicPreviewList topics={subjectTopics} onApplyClick={() => onApply(subjectTopics)} />
                </div>
              )}

              {/* PER CHAPTER — step 0: pick subjects (multi) */}
              {view === "perChapter" && subStep === 0 && (
                <div className="space-y-5">
                  <p className="text-[11px] font-inter text-warrior-text/60">Select one or more subjects to drill into their chapters.</p>
                  <div className="space-y-2">
                    {Object.entries(SUBJECTS).map(([sub, data]) => {
                      const active = ssSubs.includes(sub);
                      const subAcc = MOCK_ACCURACY[sub]?.acc ?? null;
                      const as2 = accStyle(subAcc);
                      return (
                        <button key={sub}
                          onClick={() => setSsSubs((prev) => active ? prev.filter((s) => s !== sub) : [...prev, sub])}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            active ? "bg-mdcat-yellow/10 border-mdcat-yellow text-white shadow-[2px_2px_0px_rgba(255,198,0,0.1)]" : "border-warrior-border text-warrior-text hover:border-mdcat-yellow/50"
                          }`}>
                          <div className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-warrior-black" style={{ backgroundColor: data.color }} />
                          <span className="font-poppins font-black text-[14px] flex-1 text-left">{sub}</span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-poppins font-black border flex-shrink-0 ${as2.text} ${as2.bg} ${as2.border}`}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: as2.dot }} />
                            {subAcc !== null ? `${subAcc}%` : "—"}
                          </span>
                          {active
                            ? <CheckCircle size={16} className="text-mdcat-yellow flex-shrink-0" strokeWidth={2.5} />
                            : <ChevronRight size={16} className="text-warrior-text/40 flex-shrink-0" strokeWidth={2.5} />}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={ssSubs.length === 0}
                    onClick={() => setSubStep(1)}
                    className="w-full py-3 bg-mdcat-yellow text-warrior-black font-poppins font-black text-[13px] rounded-xl border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[3px_3px_0px_rgba(0,0,0,0.4)] disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center gap-2"
                  >
                    Next — Select Chapters <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* PER CHAPTER — step 1: pick chapters grouped by subject */}
              {view === "perChapter" && subStep === 1 && ssSubs.length > 0 && (
                <div className="space-y-5">
                  <p className="text-[11px] font-inter text-warrior-text/60">Select chapters from your chosen subjects. You can pick from multiple.</p>
                  <div className="space-y-5">
                    {ssSubs.map((sub) => (
                      <div key={sub}>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECTS[sub].color }} />
                            <span className="font-poppins font-black text-[13px] text-white uppercase tracking-[0.08em]">{sub}</span>
                          </div>
                          <button
                            onClick={() => {
                              const chs = Object.keys(SUBJECTS[sub].chapters);
                              const allSel = chs.every((c) => ssChaps.includes(c));
                              setSsChaps((prev) =>
                                allSel ? prev.filter((c) => !chs.includes(c)) : [...new Set([...prev, ...chs])]
                              );
                            }}
                            className="text-[10px] font-poppins font-black text-mdcat-yellow hover:underline"
                          >
                            {Object.keys(SUBJECTS[sub].chapters).every((c) => ssChaps.includes(c)) ? "Deselect all" : "Select all"}
                          </button>
                        </div>
                        <div className="space-y-1.5 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0">
                          {Object.keys(SUBJECTS[sub].chapters).map((ch) => {
                            const chAcc = MOCK_ACCURACY[sub]?.chapters[ch]?.acc ?? null;
                            const cs = accStyle(chAcc);
                            const active = ssChaps.includes(ch);
                            return (
                              <button key={ch}
                                onClick={() => setSsChaps((prev) => active ? prev.filter((c) => c !== ch) : [...prev, ch])}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                                  active ? "bg-mdcat-yellow/10 border-mdcat-yellow/70 text-white" : "border-warrior-border text-warrior-text hover:border-mdcat-yellow/40"
                                }`}>
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${active ? "bg-mdcat-yellow border-mdcat-yellow" : "border-warrior-border"}`}>
                                  {active && <CheckCircle size={11} className="text-warrior-black" strokeWidth={3} />}
                                </div>
                                <span className="font-poppins font-black text-[12px] flex-1 leading-snug">{ch}</span>
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-poppins font-black flex-shrink-0 ${cs.text} ${cs.bg}`}>
                                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cs.dot }} />
                                  {chAcc !== null ? `${chAcc}%` : "—"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={ssChaps.length === 0}
                    onClick={() => setSubStep(2)}
                    className="w-full py-3 bg-mdcat-yellow text-warrior-black font-poppins font-black text-[13px] rounded-xl border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[3px_3px_0px_rgba(0,0,0,0.4)] disabled:translate-x-0 disabled:translate-y-0 flex items-center justify-center gap-2"
                  >
                    Continue with {ssChaps.length} chapter{ssChaps.length !== 1 ? "s" : ""} <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* PER CHAPTER — step 2: N picker + preview */}
              {view === "perChapter" && subStep === 2 && (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-1.5">
                    {ssSubs.map((s) => (
                      <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-mdcat-yellow/10 border border-mdcat-yellow/30 rounded-full text-[11px] font-poppins font-black text-mdcat-yellow">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUBJECTS[s].color }} />
                        {s}
                      </span>
                    ))}
                    {ssChaps.map((ch) => (
                      <span key={ch} className="px-2.5 py-1 bg-warrior-gray/30 border border-warrior-border/60 rounded-full text-[11px] font-inter text-warrior-text/70">{ch}</span>
                    ))}
                  </div>
                  <NPicker />
                  <TopicPreviewList topics={chapterTopics} onApplyClick={() => onApply(chapterTopics)} />
                </div>
              )}

              {/* MYSTERY */}
              {view === "mystery" && mystery && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-900/40 to-warrior-black/60 border border-purple-500/30 rounded-2xl p-5 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #9333ea 0%, transparent 60%)" }} />
                    <Shuffle size={28} className="text-purple-400 mx-auto mb-2" />
                    <p className="font-poppins font-black text-white text-[18px] mb-1">{mystery.name}</p>
                    <p className="text-[11px] font-inter text-warrior-text/60">Algorithm-generated · {mystery.total} MCQs</p>
                    <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-purple-500/20">
                      {([{ label: "Needs work", items: mystery.weak, color: "text-red-400" }, { label: "Improving", items: mystery.improving, color: "text-amber-400" }, { label: "Strong", items: mystery.strong, color: "text-emerald-400" }] as { label: string; items: TopicEntry[]; color: string }[]).map(({ label, items, color }, i) => (
                        <div key={label} className="flex items-center gap-4">
                          {i > 0 && <div className="w-px h-8 bg-purple-500/20" />}
                          <div className="text-center">
                            <p className={`font-poppins font-black text-[16px] ${color}`}>{items.length}</p>
                            <p className="text-[9px] font-inter text-warrior-text/50 uppercase tracking-[0.1em]">{label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {([
                    { label: "Needs Work", items: mystery.weak,      dot: "#EF4444", color: "text-red-400"     },
                    { label: "Improving",  items: mystery.improving, dot: "#F59E0B", color: "text-amber-400"   },
                    { label: "Strong",     items: mystery.strong,    dot: "#10B981", color: "text-emerald-400" },
                  ] as { label: string; items: TopicEntry[]; dot: string; color: string }[]).filter(({ items }) => items.length > 0).map(({ label, items, dot, color }) => (
                    <div key={label} className="bg-warrior-black/40 border border-warrior-border/60 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: dot }} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[11px] font-poppins font-black ${color} block mb-0.5`}>{label}</span>
                        <span className="text-[10px] font-inter text-warrior-text/60 leading-relaxed">
                          {items.slice(0, 4).map((t) => t.topic).join(" · ")}{items.length > 4 ? ` +${items.length - 4} more` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setMystery(generateMysteryTest(20))}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 bg-warrior-black/40 border border-warrior-border rounded-xl text-warrior-text text-[12px] font-poppins font-black hover:border-warrior-text/50 hover:text-white active:scale-95 transition-all">
                      <RotateCcw size={13} /> Regenerate
                    </button>
                    <button onClick={() => onApply([...mystery.weak, ...mystery.improving, ...mystery.strong])}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-mdcat-yellow text-warrior-black font-poppins font-black text-[13px] rounded-xl border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all">
                      <Zap size={14} /> Accept Test
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUILDER SCREEN
═══════════════════════════════════════════════════════════ */
function BuilderScreen({ onStart }: { onStart: (cfg: QuizConfig, mcqs: typeof MOCK_MCQS) => void }) {
  const searchParams = useSearchParams();
  const preloadSub = searchParams.get("sub") ?? "";
  const preloadCh  = searchParams.get("ch")  ?? "";
  const preloadTp  = searchParams.get("tp")  ?? "";
  const hasPreload = !!(preloadSub && preloadCh && preloadTp);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(hasPreload ? [preloadSub] : []);
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string[]>>(hasPreload ? { [preloadSub]: [preloadCh] } : {});
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string[]>>(hasPreload ? { [preloadCh]: [preloadTp] } : {});
  const [count, setCount] = useState(20);
  const [diffPct, setDiffPct] = useState<{ Easy: number; Medium: number; Hard: number }>({ Easy: 20, Medium: 50, Hard: 30 });
  const [diffMode, setDiffMode] = useState<"easy" | "medium" | "hard" | "pmdc" | "custom">("pmdc");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [revealMode, setRevealMode] = useState<RevealMode>("end");
  const [generating, setGenerating] = useState(false);
  const [activeChapterTab, setActiveChapterTab] = useState<string>("");
  const [activeTopicSubTab, setActiveTopicSubTab] = useState<string>("");
  const [showAccuracy, setShowAccuracy] = useState(true);
  const [ssOpen, setSsOpen] = useState(false);
  const [topicsEditMode, setTopicsEditMode] = useState(false);
  const [showSmartHint, setShowSmartHint] = useState(!hasPreload);

  // ── subject toggle: clears dependent chapters/topics on deselect ──
  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects((prev) => prev.filter((x) => x !== sub));
      setSelectedChapters((prev) => { const c = { ...prev }; delete c[sub]; return c; });
      const chs = Object.keys(SUBJECTS[sub].chapters);
      setSelectedTopics((prev) => { const t = { ...prev }; chs.forEach((ch) => delete t[ch]); return t; });
    } else {
      setSelectedSubjects((prev) => [...prev, sub]);
    }
  };

  // ── chapter toggle: clears dependent topics on deselect ──
  const toggleChapter = (sub: string, ch: string) => {
    const curr = selectedChapters[sub] ?? [];
    if (curr.includes(ch)) {
      setSelectedChapters((prev) => ({ ...prev, [sub]: curr.filter((c) => c !== ch) }));
      setSelectedTopics((prev) => { const t = { ...prev }; delete t[ch]; return t; });
    } else {
      setSelectedChapters((prev) => ({ ...prev, [sub]: [...curr, ch] }));
    }
  };

  // ── topic toggle ──
  const toggleTopic = (ch: string, topic: string) => {
    setSelectedTopics((prev) => {
      const curr = prev[ch] ?? [];
      return { ...prev, [ch]: curr.includes(topic) ? curr.filter((t) => t !== topic) : [...curr, topic] };
    });
  };

  // ── select all / deselect all chapters for a subject ──
  const toggleAllChapters = (sub: string) => {
    const all = Object.keys(SUBJECTS[sub].chapters);
    const curr = selectedChapters[sub] ?? [];
    if (curr.length === all.length) {
      setSelectedChapters((prev) => ({ ...prev, [sub]: [] }));
      setSelectedTopics((prev) => { const t = { ...prev }; all.forEach((ch) => delete t[ch]); return t; });
    } else {
      setSelectedChapters((prev) => ({ ...prev, [sub]: all }));
    }
  };

  // ── select all / deselect all topics for a chapter ──
  const toggleAllTopics = (sub: string, ch: string) => {
    const all = SUBJECTS[sub].chapters[ch];
    const curr = selectedTopics[ch] ?? [];
    setSelectedTopics((prev) => ({ ...prev, [ch]: curr.length === all.length ? [] : [...all] }));
  };

  // ── sync chapter tab when subjects change ──
  useEffect(() => {
    if (selectedSubjects.length > 0 && !selectedSubjects.includes(activeChapterTab)) {
      setActiveChapterTab(selectedSubjects[0]);
    }
  }, [selectedSubjects]);

  // ── sync topic sub-tab when chapters change ──
  useEffect(() => {
    const subsWithChapters = selectedSubjects.filter((s) => (selectedChapters[s] ?? []).length > 0);
    if (subsWithChapters.length > 0 && !subsWithChapters.includes(activeTopicSubTab)) {
      setActiveTopicSubTab(subsWithChapters[0]);
    }
  }, [selectedChapters, selectedSubjects]);

  // ── Auto-dismiss Smart Select hint after 5 s ──
  useEffect(() => {
    if (!showSmartHint) return;
    const t = setTimeout(() => setShowSmartHint(false), 5000);
    return () => clearTimeout(t);
  }, [showSmartHint]);

  // ── Smart Select: apply a list of topics, pre-select them, jump to step 3 ──
  const applyTopics = (topics: TopicEntry[]) => {
    const newSubs = [...new Set(topics.map((t) => t.subject))];
    const newChs: Record<string, string[]> = {};
    const newTopics: Record<string, string[]> = {};
    topics.forEach(({ subject, chapter, topic }) => {
      if (!newChs[subject]) newChs[subject] = [];
      if (!newChs[subject].includes(chapter)) newChs[subject].push(chapter);
      if (!newTopics[chapter]) newTopics[chapter] = [];
      if (!newTopics[chapter].includes(topic)) newTopics[chapter].push(topic);
    });
    setSelectedSubjects(newSubs);
    setSelectedChapters(newChs);
    setSelectedTopics(newTopics);
    setSsOpen(false);
    setStep(3);
  };

  // ── difficulty preset selector ──
  const handleSelectDiffMode = (mode: typeof diffMode) => {
    setDiffMode(mode);
    if (mode === "easy")   setDiffPct({ Easy: 100, Medium: 0,   Hard: 0   });
    if (mode === "medium") setDiffPct({ Easy: 0,   Medium: 100, Hard: 0   });
    if (mode === "hard")   setDiffPct({ Easy: 0,   Medium: 0,   Hard: 100 });
    if (mode === "pmdc")   setDiffPct({ Easy: 20,  Medium: 50,  Hard: 30  });
    if (mode === "custom") setShowCustomModal(true);
  };

  // ── difficulty % auto-balance ──
  const adjustDiff = (changed: keyof typeof diffPct, raw: number) => {
    const value = Math.max(0, Math.min(100, raw));
    const others = (["Easy", "Medium", "Hard"] as (keyof typeof diffPct)[]).filter((k) => k !== changed);
    const remaining = 100 - value;
    const total = diffPct[others[0]] + diffPct[others[1]];
    if (total === 0) {
      const half = Math.round(remaining / 2);
      setDiffPct({ ...diffPct, [changed]: value, [others[0]]: half, [others[1]]: remaining - half });
    } else {
      const r0 = diffPct[others[0]] / total;
      const n0 = Math.round(remaining * r0);
      setDiffPct({ ...diffPct, [changed]: value, [others[0]]: n0, [others[1]]: remaining - n0 });
    }
  };

  // ── computed ──
  const totalSelectedChapters = Object.values(selectedChapters).flat().length;
  const allSelectedChapters = selectedSubjects.flatMap((sub) =>
    (selectedChapters[sub] ?? []).map((ch) => ({ sub, ch }))
  );
  const availableMCQs = MOCK_MCQS.filter((q) => {
    if (selectedSubjects.length > 0 && !selectedSubjects.includes(q.subject)) return false;
    const subChs = selectedChapters[q.subject];
    if (subChs && subChs.length > 0 && !subChs.includes(q.chapter)) return false;
    const chTopics = selectedTopics[q.chapter];
    if (chTopics && chTopics.length > 0 && !chTopics.includes(q.topic)) return false;
    if (diffPct[q.difficulty as keyof typeof diffPct] === 0) return false;
    return true;
  });

  const handleGenerate = () => {
    if (availableMCQs.length === 0 || generating) return;
    setGenerating(true);
    const shuffled = [...availableMCQs].sort(() => Math.random() - 0.5).slice(0, Math.min(count, availableMCQs.length));
    setTimeout(() => {
      const activeDiffs = (["Easy", "Medium", "Hard"] as Difficulty[]).filter((d) => diffPct[d as keyof typeof diffPct] > 0);
      onStart(
        { subjects: selectedSubjects, chapters: selectedChapters, topics: selectedTopics,
          count: shuffled.length, difficulty: activeDiffs, timerOn, timerMinutes, revealMode },
        shuffled
      );
    }, 800);
  };

  // ── shared settings panel ──
  const SettingsPanel = () => (
    <>
      <div className="space-y-6">

        {/* ── Number of MCQs ── */}
        <div>
          <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-3">Number of MCQs</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCount(Math.max(1, count - 1))}
              className="w-10 h-10 bg-warrior-gray/40 border-2 border-warrior-border rounded-xl text-white hover:border-mdcat-yellow/60 active:scale-95 transition-all flex items-center justify-center text-xl font-bold flex-shrink-0"
            >−</button>
            <input
              type="number"
              min={1}
              max={availableMCQs.length || 200}
              value={count}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v)) setCount(Math.max(1, Math.min(availableMCQs.length || 200, v)));
              }}
              className="flex-1 h-10 bg-warrior-black border-2 border-warrior-border rounded-xl text-center text-mdcat-yellow font-poppins font-black text-xl focus:outline-none focus:border-mdcat-yellow/70 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setCount(Math.min(availableMCQs.length || 200, count + 1))}
              className="w-10 h-10 bg-warrior-gray/40 border-2 border-warrior-border rounded-xl text-white hover:border-mdcat-yellow/60 active:scale-95 transition-all flex items-center justify-center text-xl font-bold flex-shrink-0"
            >+</button>
          </div>
          <p className="text-center text-[10px] font-inter text-warrior-text/60 mt-1.5">{availableMCQs.length} MCQs available in pool</p>
        </div>

        {/* ── Difficulty Level ── */}
        <div>
          <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-3">Difficulty Level</label>
          <div className="flex flex-wrap gap-2">
            {([
              { key: "easy"   as const, label: "Easy"      },
              { key: "medium" as const, label: "Medium"    },
              { key: "hard"   as const, label: "Hard"      },
              { key: "pmdc"   as const, label: "MDCAT Mix" },
              { key: "custom" as const, label: "Custom"    },
            ]).map(({ key, label }) => {
              const active = diffMode === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectDiffMode(key)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-inter font-semibold transition-all active:scale-95 ${
                    active
                      ? "bg-mdcat-yellow text-warrior-black border-mdcat-yellow"
                      : "bg-warrior-black/20 border-warrior-border text-warrior-text hover:border-warrior-text/50 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Timer ── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text">Timer</label>
            <button onClick={() => setTimerOn(!timerOn)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${timerOn ? "bg-mdcat-yellow" : "bg-warrior-border"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${timerOn ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <AnimatePresence>
            {timerOn && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="flex items-center gap-2 mt-1">
                  <input type="number" min={5} max={180} value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Math.max(5, Math.min(180, Number(e.target.value))))}
                    className="w-16 h-9 bg-warrior-black border border-warrior-border rounded-lg px-3 text-white font-inter text-sm text-center focus:outline-none focus:border-mdcat-yellow" />
                  <span className="text-warrior-text text-[12px] font-inter">minutes</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!timerOn && <p className="text-warrior-text text-[11px] font-inter">Ascending timer shown</p>}
        </div>

        {/* ── Show Answer ── */}
        <div>
          <label className="block text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text mb-2.5">Show Answer</label>
          <div className="flex rounded-lg overflow-hidden border border-warrior-border">
            {[{ value: "each" as RevealMode, label: "After each" }, { value: "end" as RevealMode, label: "At the end" }].map(({ value, label }) => (
              <button key={value} onClick={() => setRevealMode(value)}
                className={`flex-1 py-2 font-inter font-bold text-[11px] transition-all duration-200 ${revealMode === value ? "bg-mdcat-yellow text-warrior-black" : "bg-transparent text-warrior-text hover:text-white"}`}>{label}</button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {timerOn && revealMode === "each" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-2 bg-amber-400/8 border border-amber-400/20 rounded-lg p-3">
              <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400 text-[11px] font-inter leading-relaxed">Timer pauses when reading explanation.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Custom difficulty modal ── */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCustomModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 lg:p-6 w-full max-w-sm shadow-[0_0_60px_rgba(0,0,0,0.6)]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-poppins font-black text-white text-[16px]">Custom Mix</p>
                  <p className="text-warrior-text font-inter text-[11px] mt-0.5">Drag sliders — they auto-balance to 100%</p>
                </div>
                <button onClick={() => setShowCustomModal(false)} className="w-7 h-7 rounded-lg bg-warrior-gray/50 flex items-center justify-center text-warrior-text hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Segmented bar preview */}
              <div className="h-3 rounded-full overflow-hidden flex mb-5 border border-warrior-border/40">
                <div style={{ width: `${diffPct.Easy}%` }}   className="bg-emerald-500 transition-all duration-300" />
                <div style={{ width: `${diffPct.Medium}%` }} className="bg-amber-400  transition-all duration-300" />
                <div style={{ width: `${diffPct.Hard}%` }}   className="bg-red-500    transition-all duration-300" />
              </div>

              {/* Sliders */}
              <div className="space-y-4 mb-5">
                {([
                  { key: "Easy"   as const, label: "Easy",   color: "text-emerald-400", accent: "#10B981" },
                  { key: "Medium" as const, label: "Medium", color: "text-amber-400",   accent: "#F59E0B" },
                  { key: "Hard"   as const, label: "Hard",   color: "text-red-400",     accent: "#EF4444" },
                ]).map(({ key, label, color, accent }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className={`text-[11px] font-inter font-black w-14 flex-shrink-0 ${color}`}>{label}</span>
                    <input
                      type="range" min={0} max={100} value={diffPct[key]}
                      onChange={(e) => adjustDiff(key, Number(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-warrior-border"
                      style={{ accentColor: accent }}
                    />
                    <span className={`text-[12px] font-inter font-black w-9 text-right flex-shrink-0 ${color}`}>{diffPct[key]}%</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCustomModal(false)}
                className="w-full py-3 bg-mdcat-yellow text-warrior-black font-poppins font-black text-[13px] rounded-xl border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all"
              >
                Apply Mix
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // ── Unified step-by-step builder (Subjects → Chapters → Topics → Settings) ──
  const [step, setStep] = useState(hasPreload ? 3 : 0);
  const STEPS = ["Subjects", "Chapters", "Topics", "Settings"];

  const StepBuilder = () => (
    <div className="flex flex-col gap-4 lg:gap-6 max-w-3xl lg:mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-1 lg:gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1 lg:gap-2 flex-1">
            <button onClick={() => i < step && setStep(i)}
              className={`w-6 h-6 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-[10px] lg:text-[13px] font-poppins font-black transition-colors flex-shrink-0 border-2 ${
                i < step ? "bg-mdcat-yellow/70 text-warrior-black cursor-pointer border-warrior-black" :
                i === step ? "bg-mdcat-yellow text-warrior-black border-warrior-black shadow-[2px_2px_0px_rgba(0,0,0,0.5)]" : "bg-warrior-black text-warrior-text border-warrior-border"
              }`}>{i + 1}</button>
            <span className={`text-[9px] lg:text-[12px] font-poppins font-black uppercase tracking-[0.1em] truncate ${i <= step ? "text-white" : "text-warrior-text"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px lg:h-[2px] min-w-[8px] ${i < step ? "bg-mdcat-yellow" : "bg-warrior-border"}`} />}
          </div>
        ))}
      </div>

      {/* Controls row — accuracy toggle + Smart Select */}
      {step < 3 && (
        <div className="flex items-center justify-between gap-3">
          {/* Accuracy toggle */}
          <button
            onClick={() => setShowAccuracy((v) => !v)}
            className="flex items-center gap-2 w-fit group px-1"
          >
            <Eye size={13} className={showAccuracy ? "text-mdcat-yellow" : "text-warrior-text/40"} />
            <span className="text-[12px] font-inter font-semibold text-warrior-text/70 group-hover:text-warrior-text transition-colors">
              Show accuracy
            </span>
            <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${showAccuracy ? "bg-mdcat-yellow" : "bg-warrior-border"}`}>
              <div className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow transition-transform duration-200 ${showAccuracy ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
            </div>
          </button>

          {/* Smart Select button + hint tooltip */}
          <div className="relative">
            <AnimatePresence>
              {showSmartHint && step === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.93 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="absolute bottom-full right-0 mb-3 w-[210px] bg-warrior-black border-2 border-mdcat-yellow/70 rounded-2xl p-3 shadow-[0_0_20px_rgba(255,198,0,0.22)] z-20 pointer-events-none"
                >
                  <div className="absolute -bottom-[7px] right-5 w-3 h-3 bg-warrior-black border-r-2 border-b-2 border-mdcat-yellow/70 rotate-45" />
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-mdcat-yellow shrink-0 mt-0.5" />
                    <div>
                      <p className="font-poppins font-black text-white text-[11px] leading-tight mb-1">Try Smart Select!</p>
                      <p className="font-inter text-warrior-text text-[10px] leading-relaxed">AI picks your weakest topics so you practice what matters most.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              animate={showSmartHint && step === 0 ? {
                boxShadow: [
                  "0 0 0px rgba(255,198,0,0)",
                  "0 0 14px rgba(255,198,0,0.55)",
                  "0 0 0px rgba(255,198,0,0)",
                ],
              } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => { setSsOpen(true); setShowSmartHint(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-mdcat-yellow bg-mdcat-yellow/10 hover:bg-mdcat-yellow/20 active:scale-95 transition-all"
            >
              <Sparkles size={13} className="text-mdcat-yellow" />
              <span className="text-[11px] font-poppins font-black text-mdcat-yellow uppercase tracking-[0.06em]">Smart Select</span>
              <span className="text-[8px] font-poppins font-black bg-mdcat-yellow text-warrior-black px-1.5 py-0.5 rounded-full uppercase tracking-[0.08em]">AI</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(255,198,0,0.1)]">

        {/* YOUR PREP legend — inside card top, only when accuracy on and on selection steps */}
        {step < 3 && showAccuracy && (
          <div className="px-4 lg:px-6 py-3 border-b border-warrior-border/60 bg-warrior-black/20">
            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
              <span className="text-[9px] font-poppins font-black uppercase tracking-[0.14em] text-warrior-text/50 flex-shrink-0">Your Prep</span>
              <span className="flex items-center gap-1 text-[10px] font-inter text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />Strong ≥75%</span>
              <span className="flex items-center gap-1 text-[10px] font-inter text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />Improving 50–74%</span>
              <span className="flex items-center gap-1 text-[10px] font-inter text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />Needs work &lt;50%</span>
              <span className="flex items-center gap-1 text-[10px] font-inter text-warrior-text/40"><span className="w-1.5 h-1.5 rounded-full bg-warrior-text/25 flex-shrink-0" />Untouched</span>
            </div>
          </div>
        )}

        {/* STEP 0 — Subjects */}
        {step === 0 && (
          <div className="p-4 lg:p-6 space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <p className="text-[10px] lg:text-[13px] font-poppins font-black uppercase tracking-[0.14em] text-mdcat-yellow">Select Subjects</p>
              <p className="text-[10px] lg:text-[12px] font-inter text-warrior-text">
                {selectedSubjects.length === 0 ? "All included" : `${selectedSubjects.length} selected`}
              </p>
            </div>
            <div className="lg:grid lg:grid-cols-2 lg:gap-3 space-y-2 lg:space-y-0">
              {Object.entries(SUBJECTS).map(([sub, data]) => {
                const active = selectedSubjects.includes(sub);
                return (
                  <button key={sub} onClick={() => toggleSubject(sub)}
                    className={`w-full flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4 rounded-xl border-2 transition-all ${
                      active ? "bg-mdcat-yellow/10 border-mdcat-yellow text-white shadow-[3px_3px_0px_rgba(255,198,0,0.15)]" : "border-warrior-border text-warrior-text hover:border-mdcat-yellow/50"
                    }`}>
                    <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full flex-shrink-0 border-2 border-warrior-black" style={{ backgroundColor: data.color }} />
                    <span className="font-poppins font-black text-[14px] lg:text-[16px] flex-1 text-left">{sub}</span>
                    {showAccuracy && (() => {
                      const a = MOCK_ACCURACY[sub]?.acc ?? null;
                      const s = accStyle(a);
                      return (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] lg:text-[11px] font-poppins font-black border mr-1 flex-shrink-0 ${s.text} ${s.bg} ${s.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                          {a !== null ? `${a}%` : "—"}
                        </span>
                      );
                    })()}
                    {active ? (
                      <CheckCircle size={16} className="text-mdcat-yellow flex-shrink-0" strokeWidth={2.5} />
                    ) : (
                      <ChevronRight size={16} className="text-warrior-text/40 flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1 — Chapters */}
        {step === 1 && (
          <div>
            {selectedSubjects.length === 0 ? (
              <div className="py-12 lg:py-16 text-center px-4">
                <p className="text-warrior-text font-poppins font-black text-sm lg:text-base mb-1">No subjects selected</p>
                <p className="text-warrior-text/60 font-inter text-[12px] lg:text-[13px]">Go back and pick at least one subject</p>
              </div>
            ) : (
              <>
                {selectedSubjects.length >= 2 && (
                  <div className="flex border-b-2 border-warrior-border overflow-x-auto">
                    {selectedSubjects.map((sub) => (
                      <button key={sub} onClick={() => setActiveChapterTab(sub)}
                        className={`px-3 lg:px-4 py-2.5 lg:py-3 text-[11px] lg:text-[13px] font-poppins font-black whitespace-nowrap flex-shrink-0 border-b-2 transition-colors ${
                          (activeChapterTab || selectedSubjects[0]) === sub
                            ? "border-mdcat-yellow text-white"
                            : "border-transparent text-warrior-text hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full flex-shrink-0 border border-warrior-black" style={{ backgroundColor: SUBJECTS[sub].color }} />
                          {sub}
                          {(selectedChapters[sub] ?? []).length > 0 && (
                            <span className="text-[9px] lg:text-[10px] font-poppins font-black bg-mdcat-yellow/20 text-mdcat-yellow rounded-full px-1.5 py-0.5">
                              {(selectedChapters[sub] ?? []).length}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {(() => {
                  const subsToShow = selectedSubjects.length >= 2
                    ? [(selectedSubjects.includes(activeChapterTab) ? activeChapterTab : selectedSubjects[0])]
                    : selectedSubjects;
                  return subsToShow.map((sub) => {
                    const chapters = Object.keys(SUBJECTS[sub].chapters);
                    const selChs = selectedChapters[sub] ?? [];
                    const allSel = selChs.length === chapters.length;
                    return (
                      <div key={sub} className="p-4 lg:p-6">
                        {selectedSubjects.length < 2 && (
                          <div className="flex items-center justify-between mb-3 lg:mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full flex-shrink-0 border border-warrior-black" style={{ backgroundColor: SUBJECTS[sub].color }} />
                              <p className="text-[12px] lg:text-[14px] font-poppins font-black text-white uppercase tracking-[0.1em]">{sub}</p>
                            </div>
                            <button onClick={() => toggleAllChapters(sub)}
                              className="text-[10px] lg:text-[11px] font-poppins font-black text-mdcat-yellow hover:underline">
                              {allSel ? "Deselect all" : "Select all"}
                            </button>
                          </div>
                        )}
                        {selectedSubjects.length >= 2 && (
                          <div className="flex justify-end mb-3 lg:mb-4">
                            <button onClick={() => toggleAllChapters(sub)}
                              className="text-[10px] lg:text-[11px] font-poppins font-black text-mdcat-yellow hover:underline">
                              {allSel ? "Deselect all" : "Select all"}
                            </button>
                          </div>
                        )}
                        <div className="space-y-1.5 lg:grid lg:grid-cols-2 lg:gap-2.5 lg:space-y-0">
                          {chapters.map((ch) => {
                            const active = selChs.includes(ch);
                            return (
                              <button key={ch} onClick={() => toggleChapter(sub, ch)}
                                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl border-2 transition-all text-left ${
                                  active ? "bg-mdcat-yellow/10 border-mdcat-yellow/50 text-white" : "border-warrior-border text-warrior-text hover:border-mdcat-yellow/40"
                                }`}>
                                <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  active ? "bg-mdcat-yellow border-mdcat-yellow" : "border-warrior-border"
                                }`}>
                                  {active && <CheckCircle size={11} className="text-warrior-black" strokeWidth={3} />}
                                </div>
                                <span className="font-poppins font-black text-[13px] lg:text-[14px] flex-1 leading-snug">{ch}</span>
                                {showAccuracy && (() => {
                                  const a = MOCK_ACCURACY[sub]?.chapters[ch]?.acc ?? null;
                                  const s = accStyle(a);
                                  return (
                                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] lg:text-[10px] font-poppins font-black flex-shrink-0 ${s.text} ${s.bg}`}>
                                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                                      {a !== null ? `${a}%` : "—"}
                                    </span>
                                  );
                                })()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </>
            )}
          </div>
        )}

        {/* STEP 2 — Topics */}
        {step === 2 && (
          <div>
            {totalSelectedChapters === 0 ? (
              <div className="py-12 lg:py-16 text-center px-4">
                <p className="text-warrior-text font-poppins font-black text-sm lg:text-base mb-1">No chapters selected</p>
                <p className="text-warrior-text/60 font-inter text-[12px] lg:text-[13px]">Go back and pick chapters, or skip — all topics included</p>
              </div>
            ) : !topicsEditMode ? (
              <div className="p-7 lg:p-10 flex flex-col items-center text-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-mdcat-yellow/10 border-2 border-mdcat-yellow/30 flex items-center justify-center">
                  <CheckCircle size={22} className="text-mdcat-yellow" strokeWidth={2.5} />
                </div>
                <div className="space-y-1.5">
                  <p className="font-poppins font-black text-white text-[16px] lg:text-[18px]">All topics selected</p>
                  <p className="text-warrior-text/70 font-inter text-[12px] lg:text-[13px] max-w-[280px] leading-relaxed">
                    All topics from your selected chapters are included in this quiz.
                  </p>
                </div>
                <button
                  onClick={() => setTopicsEditMode(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-warrior-border bg-warrior-black/40 hover:border-mdcat-yellow/70 hover:bg-mdcat-yellow/8 text-warrior-text hover:text-white font-poppins font-black text-[12px] lg:text-[13px] uppercase tracking-[0.08em] active:scale-95 transition-all group"
                >
                  <Pencil size={13} className="text-mdcat-yellow group-hover:text-mdcat-yellow transition-colors" />
                  Edit Topics
                </button>
              </div>
            ) : (() => {
              const subsWithChs = selectedSubjects.filter((s) => (selectedChapters[s] ?? []).length > 0);
              const chapsToShow = subsWithChs.length >= 2
                ? allSelectedChapters.filter(({ sub }) =>
                    sub === (subsWithChs.includes(activeTopicSubTab) ? activeTopicSubTab : subsWithChs[0])
                  )
                : allSelectedChapters;
              return (
                <>
                  {subsWithChs.length >= 2 && (
                    <div className="flex border-b-2 border-warrior-border overflow-x-auto">
                      {subsWithChs.map((sub) => (
                        <button key={sub} onClick={() => setActiveTopicSubTab(sub)}
                          className={`px-3 lg:px-4 py-2.5 lg:py-3 text-[11px] lg:text-[13px] font-poppins font-black whitespace-nowrap flex-shrink-0 border-b-2 transition-colors ${
                            (activeTopicSubTab || subsWithChs[0]) === sub
                              ? "border-mdcat-yellow text-white"
                              : "border-transparent text-warrior-text hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full flex-shrink-0 border border-warrior-black" style={{ backgroundColor: SUBJECTS[sub].color }} />
                            {sub}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="p-4 lg:p-6">
                    {chapsToShow.map(({ sub, ch }) => {
                      const topics = SUBJECTS[sub].chapters[ch];
                      const selTopics = selectedTopics[ch] ?? [];
                      const allSel = selTopics.length === topics.length;
                      return (
                        <div key={`${sub}-${ch}`} className="mb-5 lg:mb-6">
                          <div className="flex items-center justify-between mb-2 lg:mb-3">
                            <p className="text-[12px] lg:text-[14px] font-poppins font-black text-white truncate flex-1 mr-2">{ch}</p>
                            <button onClick={() => toggleAllTopics(sub, ch)}
                              className="text-[10px] lg:text-[11px] font-poppins font-black text-mdcat-yellow hover:underline flex-shrink-0">
                              {allSel ? "Deselect all" : "Select all"}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:gap-2.5">
                            {topics.map((topic) => {
                              const active = selTopics.includes(topic);
                              const topicAcc = MOCK_ACCURACY[sub]?.chapters[ch]?.topics[topic] ?? null;
                              const ts = accStyle(topicAcc);
                              return (
                                <button key={topic} onClick={() => toggleTopic(ch, topic)}
                                  className={`flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border-2 text-[11px] lg:text-[13px] font-poppins font-black transition-all ${
                                    active
                                      ? "bg-mdcat-yellow/15 border-mdcat-yellow text-white shadow-[2px_2px_0px_rgba(255,198,0,0.2)]"
                                      : "border-warrior-border text-warrior-text hover:border-mdcat-yellow/50 hover:text-white"
                                  }`}>
                                  {active && <span className="text-mdcat-yellow">✓</span>}
                                  {topic}
                                  {showAccuracy && topicAcc !== null && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-poppins font-black flex-shrink-0 ${ts.text} ${ts.bg}`}>
                                      {topicAcc}%
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* STEP 3 — Settings */}
        {step === 3 && (
          <div className="p-4 lg:p-6">
            <p className="text-[10px] lg:text-[13px] font-poppins font-black uppercase tracking-[0.14em] text-mdcat-yellow mb-4 lg:mb-5">Test Settings</p>
            <SettingsPanel />
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-2 lg:gap-3 w-full">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 lg:px-5 py-3 lg:py-3.5 bg-warrior-black border-2 border-warrior-border rounded-xl text-white text-[13px] lg:text-[14px] font-poppins font-black uppercase tracking-[0.08em] hover:border-mdcat-yellow active:scale-95 transition-all"
          >
            <ChevronLeft size={15} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => { if (step === 1) setTopicsEditMode(false); setStep(step + 1); }}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 bg-mdcat-yellow text-warrior-black font-poppins font-black px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl text-[13px] lg:text-[14px] uppercase tracking-[0.1em] border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.55)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all"
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={generating || availableMCQs.length === 0}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 bg-mdcat-yellow text-warrior-black font-poppins font-black px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl text-[13px] lg:text-[14px] uppercase tracking-[0.1em] border-2 border-warrior-black shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:shadow-[1px_1px_0px_rgba(0,0,0,0.55)] hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-[3px_3px_0px_rgba(0,0,0,0.55)] disabled:translate-x-0 disabled:translate-y-0"
          >
            {generating
              ? <div className="w-4 h-4 border-2 border-warrior-black/30 border-t-warrior-black rounded-full animate-spin" />
              : <><Zap size={14} /> Generate · {Math.min(count, availableMCQs.length)} MCQs</>
            }
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-mdcat-yellow/10 border border-mdcat-yellow/25 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-mdcat-yellow" />
        </div>
        <div>
          <h1 className="font-poppins font-black text-white text-xl">Quiz Builder</h1>
          <p className="text-warrior-text font-inter text-[12px]">Pick subjects, chapters and settings — then generate.</p>
        </div>
      </div>
      <StepBuilder />
      <SmartSelectSheet open={ssOpen} onClose={() => setSsOpen(false)} onApply={applyTopics} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUIZ TAKING SCREEN
═══════════════════════════════════════════════════════════ */
function TakingScreen({
  mcqs, config, onFinish,
}: {
  mcqs: typeof MOCK_MCQS;
  config: QuizConfig;
  onFinish: (states: MCQState[]) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [states, setStates] = useState<MCQState[]>(
    mcqs.map(() => ({ selected: null, locked: null, bookmarked: false, flagged: false, skipped: false, explanationOpen: false }))
  );
  const [timerSeconds, setTimerSeconds] = useState(config.timerOn ? config.timerMinutes * 60 : 0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [timeUpModal, setTimeUpModal] = useState(false);
  const [tabWarning, setTabWarning] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabSwitches = useRef(0);

  const current = mcqs[currentIdx];
  const currentState = states[currentIdx];

  // Signal layout to hide hamburger while quiz is active
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("quiz-taking-start"));
    return () => { window.dispatchEvent(new CustomEvent("quiz-taking-end")); };
  }, []);

  // Timer
  useEffect(() => {
    if (!config.timerOn) {
      // Ascending
      timerRef.current = setInterval(() => {
        if (!timerPaused) setTimerSeconds((s) => s + 1);
      }, 1000);
    } else {
      // Countdown
      timerRef.current = setInterval(() => {
        if (!timerPaused) {
          setTimerSeconds((s) => {
            if (s <= 1) { setTimeUpModal(true); return 0; }
            return s - 1;
          });
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerPaused, config.timerOn]);

  // Auto-pause timer when explanation opens
  useEffect(() => {
    if (config.timerOn && config.revealMode === "each") {
      setTimerPaused(currentState.explanationOpen);
    }
  }, [currentState.explanationOpen, config.timerOn, config.revealMode]);

  // Tab switch detection
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        tabSwitches.current++;
        setTabWarning(tabSwitches.current);
        setTimeout(() => setTabWarning(0), 4000);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Immersive mode — hide dashboard mobile tab bar while taking the quiz
  useEffect(() => {
    document.body.classList.add("quiz-immersive");
    return () => { document.body.classList.remove("quiz-immersive"); };
  }, []);

  const updateState = useCallback((idx: number, patch: Partial<MCQState>) => {
    setStates((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }, []);

  // In "each" mode, once a question has been revealed its answer is locked
  // and can no longer be changed. In "end" mode, the selection stays editable
  // until the user submits the whole quiz.
  const isLockedInEach = (s: MCQState) =>
    config.revealMode === "each" && s.locked !== null;

  const selectOption = (opt: number) => {
    if (isLockedInEach(currentState)) return;
    updateState(currentIdx, { selected: opt });
  };

  // Per-question reveal (only used in "each" mode now)
  const revealAnswer = () => {
    if (currentState.selected === null || currentState.locked !== null) return;
    updateState(currentIdx, { locked: currentState.selected, explanationOpen: true });
  };

  const skip = () => {
    if (isLockedInEach(currentState)) return;
    updateState(currentIdx, { skipped: true, selected: null });
    if (currentIdx < mcqs.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const toggleBookmark = () => {
    updateState(currentIdx, { bookmarked: !currentState.bookmarked });
  };

  const toggleFlag = () => {
    updateState(currentIdx, { flagged: !currentState.flagged });
  };

  const toggleExplanation = () => {
    updateState(currentIdx, { explanationOpen: !currentState.explanationOpen });
  };

  // Unified "answered" check — end mode uses selected, each mode uses locked
  const isAnswered = (s: MCQState) =>
    config.revealMode === "each" ? s.locked !== null : s.selected !== null;

  const countAnswered = states.filter(isAnswered).length;
  const flaggedCount  = states.filter((s) => s.flagged).length;
  const allAnswered   = states.every((s) => isAnswered(s) || s.skipped);

  // Finalize quiz → if "end" mode, commit selected → locked before grading
  const handleSubmit = () => {
    const finalStates =
      config.revealMode === "end"
        ? states.map((s) => ({ ...s, locked: s.selected }))
        : states;
    onFinish(finalStates);
  };

  // Chip color for navigator
  const chipColor = (i: number) => {
    const s = states[i];
    if (config.revealMode === "each" && s.locked !== null) {
      return s.locked === mcqs[i].correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white";
    }
    if (s.flagged) return "bg-orange-500/35 text-orange-300 border border-orange-400/60";
    if (s.skipped) return "bg-warrior-text/30 text-warrior-text";
    if (s.selected !== null) return "bg-mdcat-yellow/80 text-warrior-black";
    return "bg-warrior-black border border-warrior-border text-warrior-text";
  };

  const isTimerRed = config.timerOn && timerSeconds < 60;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-warrior-black relative">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-warrior-border bg-dark-charcoal flex-shrink-0">
        {/* Title */}
        <div className="min-w-0">
          <p className="font-inter font-bold text-white text-[13px] truncate">
            {config.subjects.length > 0 ? config.subjects.join(", ") : "Mixed Subjects"}
          </p>
          <p className="text-warrior-text text-[10px] font-inter">{mcqs.length} MCQs</p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
          isTimerRed ? "border-red-500/40 bg-red-500/10" : "border-warrior-border bg-warrior-black"
        }`}>
          <Clock size={12} className={isTimerRed ? "text-red-400 animate-pulse" : "text-warrior-text"} />
          <span className={`font-mono font-bold text-[13px] ${isTimerRed ? "text-red-400" : "text-white"}`}>
            {formatTime(timerSeconds)}
          </span>
          {!config.timerOn && (
            <button onClick={() => setTimerPaused(!timerPaused)} className="ml-1 text-warrior-text hover:text-white">
              {timerPaused ? "▶" : "⏸"}
            </button>
          )}
          {timerPaused && config.revealMode === "each" && (
            <span className="text-[9px] font-inter text-amber-400 font-bold">PAUSED</span>
          )}
        </div>

        {/* Q counter */}
        <div className="flex items-center gap-2">
          <span className="text-warrior-text text-[12px] font-inter font-bold">
            Q <span className="text-white font-poppins font-black text-[15px]">{currentIdx + 1}</span>
            <span className="text-warrior-text/60"> / {mcqs.length}</span>
          </span>
        </div>
      </div>

      {/* Tab switch warning */}
      <AnimatePresence>
        {tabWarning > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-center gap-2 px-4 py-2 text-[12px] font-inter font-bold flex-shrink-0 ${
              tabWarning >= 3 ? "bg-red-500/20 text-red-400 border-b border-red-500/30" : "bg-amber-400/15 text-amber-400 border-b border-amber-400/20"
            }`}
          >
            <AlertTriangle size={13} />
            {tabWarning >= 3
              ? `⚠ Final warning — tab switched ${tabWarning} times. This is being logged.`
              : `Tab switch detected (${tabWarning}/3). Stay focused.`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN: Question + Navigator ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Question area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 lg:px-6 py-5 pb-[160px] lg:pb-6">

            {/* Difficulty + subject tag */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[9px] font-inter font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border"
                style={{
                  color: current.difficulty === "Easy" ? "#10B981" : current.difficulty === "Medium" ? "#FFA500" : "#D9534F",
                  borderColor: current.difficulty === "Easy" ? "#10B98130" : current.difficulty === "Medium" ? "#FFA50030" : "#D9534F30",
                  background: current.difficulty === "Easy" ? "#10B98110" : current.difficulty === "Medium" ? "#FFA50010" : "#D9534F10",
                }}>
                {current.difficulty}
              </span>
              <span className="text-[9px] font-inter font-bold text-warrior-text uppercase tracking-[0.1em]">
                {current.subject} · {current.chapter}
              </span>
            </div>

            {/* Question */}
            <p className="font-inter text-white text-base lg:text-[17px] leading-relaxed mb-7">
              {current.question}
            </p>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {current.options.map((opt, i) => {
                const lockedInEach = isLockedInEach(currentState);
                const isSelected = currentState.selected === i;
                const isUserAnswer = lockedInEach && currentState.locked === i;
                const isCorrect = i === current.correct;
                // Show green/red when the per-question explanation is open ("each" mode only)
                const showResult = lockedInEach && currentState.explanationOpen;

                let cls = "border-warrior-border bg-dark-charcoal text-white";
                if (showResult) {
                  if (isCorrect) cls = "border-emerald-500/60 bg-emerald-500/10 text-white";
                  else if (isUserAnswer) cls = "border-red-500/60 bg-red-500/10 text-white";
                  else cls = "border-warrior-border bg-dark-charcoal text-warrior-text opacity-50";
                } else if (lockedInEach) {
                  if (isUserAnswer) cls = "border-mdcat-yellow/60 bg-mdcat-yellow/10 text-white";
                  else cls = "border-warrior-border bg-dark-charcoal text-warrior-text opacity-50";
                } else if (isSelected) {
                  cls = "border-mdcat-yellow/60 bg-mdcat-yellow/10 text-white";
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => selectOption(i)}
                    disabled={lockedInEach}
                    whileHover={!lockedInEach ? { scale: 1.005 } : {}}
                    whileTap={!lockedInEach ? { scale: 0.995 } : {}}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left ${cls} ${
                      !lockedInEach ? "cursor-pointer hover:border-mdcat-yellow/40" : "cursor-default"
                    }`}
                  >
                    {/* Letter badge */}
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-mono font-bold text-[12px] transition-colors ${
                      showResult
                        ? isCorrect ? "bg-emerald-500 text-white" : isUserAnswer ? "bg-red-500 text-white" : "bg-warrior-gray text-warrior-text"
                        : isSelected || isUserAnswer ? "bg-mdcat-yellow text-warrior-black" : "bg-warrior-gray text-warrior-text"
                    }`}>
                      {["A", "B", "C", "D"][i]}
                    </div>
                    <span className="font-inter text-[14px] leading-relaxed flex-1">{opt}</span>
                    {showResult && isCorrect && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
                    {showResult && isUserAnswer && !isCorrect && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation toggle (after-each mode + locked) */}
            {config.revealMode === "each" && currentState.locked !== null && (
              <div className="mb-4">
                <button
                  onClick={toggleExplanation}
                  className="flex items-center gap-2 text-mdcat-yellow text-[12px] font-inter font-bold hover:underline"
                >
                  <Eye size={13} />
                  {currentState.explanationOpen ? "Hide answer & explanation" : "Reveal answer & explanation"}
                  {currentState.explanationOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <AnimatePresence>
                  {currentState.explanationOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="callout-yellow bg-dark-charcoal rounded-r-xl p-4 mt-3">
                        {timerPaused && config.timerOn && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <Clock size={11} className="text-amber-400" />
                            <span className="text-amber-400 text-[10px] font-inter font-bold uppercase tracking-[0.1em]">
                              Timer paused — reading explanation
                            </span>
                          </div>
                        )}
                        <p className="text-white/85 font-inter text-[13px] leading-relaxed">
                          {current.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Reveal Answer button — only in "each" reveal mode, before reveal */}
            {config.revealMode === "each" && currentState.locked === null && (
              <motion.button
                onClick={revealAnswer}
                disabled={currentState.selected === null}
                whileHover={currentState.selected !== null ? { scale: 1.02 } : {}}
                whileTap={currentState.selected !== null ? { scale: 0.98 } : {}}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-4"
              >
                <Eye size={14} />
                Reveal Answer
              </motion.button>
            )}

            {/* End mode — helper hint that answers are mutable */}
            {config.revealMode === "end" && currentState.selected !== null && (
              <p className="text-[10px] font-inter text-warrior-text text-center mb-4">
                You can change your answer any time before final submission.
              </p>
            )}
          </div>
        </div>

        {/* Desktop Navigator panel */}
        <div className="hidden lg:flex w-[200px] flex-col border-l border-warrior-border bg-dark-charcoal flex-shrink-0">
          <div className="px-4 py-3 border-b border-warrior-border">
            <p className="text-[10px] font-inter font-black uppercase tracking-[0.12em] text-warrior-text">Questions</p>
            <p className="text-warrior-text text-[10px] font-inter mt-0.5">
              {countAnswered}/{mcqs.length} answered
              {flaggedCount > 0 && <> · <span className="text-orange-400">{flaggedCount} flagged</span></>}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {mcqs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`relative h-8 rounded-md text-[11px] font-mono font-bold transition-all duration-150 ${chipColor(i)} ${
                    i === currentIdx ? "ring-2 ring-mdcat-yellow ring-offset-1 ring-offset-dark-charcoal" : ""
                  }`}
                >
                  {i + 1}
                  {states[i].flagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border border-dark-charcoal" />
                  )}
                  {states[i].bookmarked && !states[i].flagged && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-mdcat-yellow rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="p-3 border-t border-warrior-border space-y-1.5">
            {[
              { color: "bg-warrior-black border border-warrior-border", label: "Unanswered" },
              { color: "bg-mdcat-yellow/80", label: "Answered" },
              { color: "bg-orange-500/35 border border-orange-400/60", label: "Flagged" },
              { color: "bg-warrior-text/30", label: "Skipped" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                <span className="text-[10px] font-inter text-warrior-text">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTION BAR — fixed on mobile, in-flow on desktop ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[45] border-t border-warrior-border bg-dark-charcoal lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto flex-shrink-0">
        {/* Row 1 — Action chips (Nav / Flag / Save) */}
        <div className="flex items-center justify-center gap-2 px-3 lg:px-6 pt-2.5 pb-1.5">
          {/* Navigator */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="lg:hidden flex flex-col items-center justify-center gap-0.5 flex-1 max-w-[90px] py-2 bg-warrior-gray/25 border border-warrior-border rounded-xl text-warrior-text hover:border-mdcat-yellow/40 hover:text-mdcat-yellow active:scale-95 transition-all"
            title="Question navigator"
          >
            <Filter size={15} />
            <span className="text-[9px] font-inter font-black uppercase tracking-[0.08em]">
              {currentIdx + 1}/{mcqs.length}
            </span>
          </button>

          {/* Flag — uncertain, revisit later */}
          <button
            onClick={toggleFlag}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 max-w-[90px] py-2 border rounded-xl active:scale-95 transition-all ${
              currentState.flagged
                ? "bg-orange-500/20 border-orange-400/60 text-orange-300"
                : "bg-warrior-gray/25 border-warrior-border text-warrior-text hover:border-orange-400/50 hover:text-orange-300"
            }`}
            title={currentState.flagged ? "Unflag question" : "Flag for review"}
          >
            <Flag size={15} fill={currentState.flagged ? "currentColor" : "none"} />
            <span className="text-[9px] font-inter font-black uppercase tracking-[0.08em]">
              {currentState.flagged ? "Flagged" : "Flag"}
            </span>
          </button>

          {/* Saved / Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 max-w-[90px] py-2 border rounded-xl active:scale-95 transition-all ${
              currentState.bookmarked
                ? "bg-mdcat-yellow/15 border-mdcat-yellow/55 text-mdcat-yellow"
                : "bg-warrior-gray/25 border-warrior-border text-warrior-text hover:border-mdcat-yellow/40 hover:text-mdcat-yellow"
            }`}
            title={currentState.bookmarked ? "Remove from saved" : "Save to My Copy"}
          >
            {currentState.bookmarked
              ? <BookmarkCheck size={15} />
              : <Bookmark size={15} />}
            <span className="text-[9px] font-inter font-black uppercase tracking-[0.08em]">
              {currentState.bookmarked ? "Saved" : "Save"}
            </span>
          </button>

          {/* Submit */}
          <button
            onClick={() => setSubmitModal(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 max-w-[90px] py-2 bg-amber-500/15 border border-amber-500/50 text-amber-300 rounded-xl hover:bg-amber-500/25 hover:border-amber-400 active:scale-95 transition-all"
            title="Submit quiz"
          >
            <Send size={15} />
            <span className="text-[9px] font-inter font-black uppercase tracking-[0.08em]">
              Submit
            </span>
          </button>
        </div>

        {/* Row 2 — Prev / Progress / Next */}
        <div className="flex items-center gap-2 px-3 lg:px-6 py-2.5 border-t border-warrior-border/60">
          {/* Prev */}
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 bg-warrior-gray/30 border border-warrior-border rounded-xl text-white text-[13px] font-inter font-black uppercase tracking-[0.06em] hover:border-mdcat-yellow/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          {/* Progress */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="w-full h-1.5 bg-warrior-black rounded-full overflow-hidden border border-warrior-border">
              <motion.div
                className="h-full bg-mdcat-yellow rounded-full"
                animate={{ width: `${((currentIdx + 1) / mcqs.length) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <span className="text-[9px] font-inter font-black uppercase tracking-[0.1em] text-warrior-text">
              {countAnswered} of {mcqs.length} answered
            </span>
          </div>

          {/* Next */}
          <button
            onClick={() => setCurrentIdx(Math.min(mcqs.length - 1, currentIdx + 1))}
            disabled={currentIdx === mcqs.length - 1}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 bg-mdcat-yellow text-warrior-black rounded-xl text-[13px] font-inter font-black uppercase tracking-[0.06em] hover:scale-[1.02] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all active:scale-95 shadow-lg shadow-mdcat-yellow/15"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Navigator Sheet */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setNavOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 bg-dark-charcoal border-t border-warrior-border z-50 lg:hidden rounded-t-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-warrior-border">
                <p className="font-inter font-bold text-white text-[13px]">Question Navigator</p>
                <button onClick={() => setNavOpen(false)} className="text-warrior-text hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-4 grid grid-cols-8 gap-2 max-h-[40vh] overflow-y-auto">
                {mcqs.map((_, i) => (
                  <button key={i} onClick={() => { setCurrentIdx(i); setNavOpen(false); }}
                    className={`relative h-9 rounded-md text-[11px] font-mono font-bold ${chipColor(i)} ${i === currentIdx ? "ring-2 ring-mdcat-yellow" : ""}`}>
                    {i + 1}
                    {states[i].flagged && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border border-dark-charcoal" />}
                    {states[i].bookmarked && !states[i].flagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-mdcat-yellow rounded-full" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Submit confirmation modal */}
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
              className="fixed left-3 right-3 bottom-3 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[360px] bg-dark-charcoal border border-warrior-border rounded-2xl p-5 z-50 max-h-[90vh] overflow-y-auto"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Send size={20} className="text-amber-400" />
              </div>

              <h3 className="font-poppins font-black text-white text-lg mb-2 text-center">Submit Quiz?</h3>

              {mcqs.length - countAnswered > 0 ? (
                <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 mb-5">
                  <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300 font-inter text-[13px] leading-relaxed">
                    <span className="font-bold">{mcqs.length - countAnswered} question{mcqs.length - countAnswered > 1 ? "s" : ""}</span> still unanswered. They will be marked as skipped.
                    {flaggedCount > 0 && <> <span className="text-orange-300">{flaggedCount} flagged for review.</span></>}
                  </p>
                </div>
              ) : (
                <p className="text-warrior-text font-inter text-sm mb-5 text-center">
                  All {mcqs.length} questions answered. Ready to see your results?
                </p>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "Answered", value: countAnswered, color: "text-emerald-400" },
                  { label: "Unanswered", value: mcqs.length - countAnswered - states.filter(s => s.skipped).length, color: "text-amber-400" },
                  { label: "Flagged", value: flaggedCount, color: "text-orange-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-warrior-black border border-warrior-border rounded-lg py-2 text-center">
                    <p className={`font-poppins font-black text-lg leading-none ${color}`}>{value}</p>
                    <p className="text-warrior-text text-[9px] font-inter mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSubmitModal(false)}
                  className="flex-1 py-2.5 px-4 bg-warrior-gray/30 border border-warrior-border rounded-xl text-white text-[13px] font-inter font-bold hover:border-warrior-text/50 transition-colors"
                >
                  Keep Going
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 px-4 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 text-[13px] font-inter font-bold hover:bg-amber-500/25 flex items-center justify-center gap-2 transition-colors"
                >
                  <Send size={13} /> Submit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Time up modal */}
      <AnimatePresence>
        {timeUpModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/80 z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-charcoal border border-red-500/40 rounded-2xl p-8 z-50 w-[320px] max-w-[90vw] text-center"
            >
              <div className="w-14 h-14 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-red-400" />
              </div>
              <h3 className="font-poppins font-black text-white text-xl mb-2">Time&apos;s Up!</h3>
              <p className="text-warrior-text font-inter text-sm mb-6">Your quiz is being submitted automatically.</p>
              <button onClick={handleSubmit} className="btn-primary w-full">See Results</button>
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
  mcqs, states, config, onRetry,
}: {
  mcqs: typeof MOCK_MCQS;
  states: MCQState[];
  config: QuizConfig;
  onRetry: () => void;
}) {
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "bookmarked" | "skipped">("all");
  const [showReview, setShowReview] = useState(false);
  const [openExplanations, setOpenExplanations] = useState<Record<number, boolean>>({});

  const correct = states.filter((s, i) => s.locked === mcqs[i].correct).length;
  const wrong = states.filter((s, i) => s.locked !== null && s.locked !== mcqs[i].correct).length;
  const skipped = states.filter((s) => s.skipped || s.locked === null).length;
  const bookmarked = states.filter((s) => s.bookmarked).length;
  const pct = Math.round((correct / mcqs.length) * 100);
  const grade = gradeLabel(pct);

  const filtered = mcqs.filter((q, i) => {
    if (reviewFilter === "wrong") return states[i].locked !== null && states[i].locked !== q.correct;
    if (reviewFilter === "bookmarked") return states[i].bookmarked;
    if (reviewFilter === "skipped") return states[i].skipped || states[i].locked === null;
    return true;
  });

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto space-y-8">

      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-charcoal border border-warrior-border rounded-2xl p-6 lg:p-8 text-center"
      >
        {/* SVG ring */}
        <div className="relative w-32 h-32 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2A2C2A" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              stroke={pct >= 75 ? "#10B981" : pct >= 60 ? "#FFA500" : "#D9534F"}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${(pct / 100) * circumference} ${circumference}` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-poppins font-black text-white text-3xl leading-none">{correct}</span>
            <span className="text-warrior-text text-xs font-inter">/ {mcqs.length}</span>
          </div>
        </div>

        <div className={`inline-block px-4 py-1.5 rounded-full border text-sm font-inter font-black uppercase tracking-[0.1em] mb-3 ${grade.color} border-current bg-current/10`}>
          {grade.label}
        </div>
        <p className="font-poppins font-black text-white text-4xl mb-1">{pct}%</p>
        <p className="text-warrior-text font-inter text-sm">
          {config.subjects.length > 0 ? config.subjects.join(" · ") : "Mixed Subjects"}
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: "Correct", value: correct, color: "text-emerald-400", bg: "border-emerald-500/20 bg-emerald-500/5" },
          { label: "Wrong",   value: wrong,   color: "text-red-400",     bg: "border-red-500/20 bg-red-500/5" },
          { label: "Skipped", value: skipped, color: "text-warrior-text", bg: "border-warrior-border" },
          { label: "Saved",   value: bookmarked, color: "text-mdcat-yellow", bg: "border-mdcat-yellow/20 bg-mdcat-yellow/5" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className={`bg-dark-charcoal border rounded-xl p-3 text-center ${s.bg}`}>
            <p className={`font-poppins font-black text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-warrior-text text-[10px] font-inter uppercase tracking-[0.1em] mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Wrong MCQs notice */}
      {wrong > 0 && (
        <div className="flex items-center gap-3 bg-dark-charcoal border border-warrior-border rounded-xl px-4 py-3">
          <XCircle size={15} className="text-red-400 flex-shrink-0" />
          <p className="text-warrior-text font-inter text-[12px]">
            <span className="text-white font-bold">{wrong} wrong MCQs</span> automatically saved to your Mistake Copy.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onRetry} className="btn-ghost flex items-center gap-2 px-5 py-3 text-sm">
          <RotateCcw size={14} /> New Quiz
        </button>
        <button onClick={() => setShowReview(!showReview)} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Eye size={14} />
          {showReview ? "Hide Review" : "Review Answers"}
        </button>
      </div>

      {/* MCQ Review section */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {[
                { key: "all", label: `All (${mcqs.length})` },
                { key: "wrong", label: `Wrong (${wrong})` },
                { key: "bookmarked", label: `Saved (${bookmarked})` },
                { key: "skipped", label: `Skipped (${skipped})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setReviewFilter(key as typeof reviewFilter)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-inter font-bold whitespace-nowrap transition-all ${
                    reviewFilter === key
                      ? "bg-mdcat-yellow text-warrior-black border-mdcat-yellow"
                      : "border-warrior-border text-warrior-text hover:border-mdcat-yellow/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* MCQ cards */}
            <div className="space-y-3">
              {filtered.map((q) => {
                const idx = mcqs.indexOf(q);
                const s = states[idx];
                const isCorrect = s.locked === q.correct;
                const expOpen = openExplanations[idx] ?? false;

                return (
                  <div key={q.id} className={`bg-dark-charcoal border rounded-xl overflow-hidden ${
                    s.locked === null ? "border-warrior-border" : isCorrect ? "border-emerald-500/25" : "border-red-500/25"
                  }`}>
                    <div className="p-4">
                      {/* Q number + tags */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-mono font-bold text-warrior-text">Q{idx + 1}</span>
                        <span className="text-[9px] font-inter font-bold text-warrior-text uppercase tracking-[0.1em]">
                          {q.subject} · {q.chapter}
                        </span>
                        {s.bookmarked && <BookmarkCheck size={11} className="text-mdcat-yellow ml-auto" />}
                        {s.locked === null && <span className="text-[9px] font-inter text-warrior-text ml-auto">Unanswered</span>}
                      </div>

                      <p className="text-white font-inter text-[13px] leading-relaxed mb-4">{q.question}</p>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, i) => {
                          const isAns = i === q.correct;
                          const wasChosen = s.locked === i;
                          let cls = "border-warrior-border bg-warrior-black text-warrior-text opacity-60";
                          if (isAns) cls = "border-emerald-500/50 bg-emerald-500/8 text-white";
                          else if (wasChosen && !isAns) cls = "border-red-500/50 bg-red-500/8 text-white";

                          return (
                            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${cls}`}>
                              <div className={`w-6 h-6 rounded-sm flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0 ${
                                isAns ? "bg-emerald-500 text-white" : wasChosen ? "bg-red-500 text-white" : "bg-warrior-gray text-warrior-text"
                              }`}>{["A", "B", "C", "D"][i]}</div>
                              <span className="font-inter text-[12px] flex-1">{opt}</span>
                              {isAns && <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />}
                              {wasChosen && !isAns && <XCircle size={13} className="text-red-400 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation toggle */}
                      <button
                        onClick={() => setOpenExplanations((prev) => ({ ...prev, [idx]: !expOpen }))}
                        className="flex items-center gap-1.5 text-mdcat-yellow text-[11px] font-inter font-bold mt-3 hover:underline"
                      >
                        <Eye size={11} />
                        {expOpen ? "Hide" : "Show"} explanation
                        {expOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      <AnimatePresence>
                        {expOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="callout-yellow bg-warrior-black rounded-r-lg p-3 mt-3">
                              <p className="text-white/80 font-inter text-[12px] leading-relaxed">{q.explanation}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-4" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE — orchestrates the 3 screens
═══════════════════════════════════════════════════════════ */
export default function QuizPage() {
  const [screen, setScreen] = useState<Screen>("builder");
  const [activeMCQs, setActiveMCQs] = useState<typeof MOCK_MCQS>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [finalStates, setFinalStates] = useState<MCQState[]>([]);

  const handleStart = (cfg: QuizConfig, mcqs: typeof MOCK_MCQS) => {
    setQuizConfig(cfg);
    setActiveMCQs(mcqs);
    setScreen("taking");
  };

  const handleFinish = (states: MCQState[]) => {
    setFinalStates(states);
    setScreen("results");
  };

  const handleRetry = () => {
    setScreen("builder");
    setActiveMCQs([]);
    setQuizConfig(null);
    setFinalStates([]);
  };

  return (
    <AnimatePresence mode="wait">
      {screen === "builder" && (
        <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <BuilderScreen onStart={handleStart} />
        </motion.div>
      )}
      {screen === "taking" && quizConfig && (
        <motion.div key="taking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <TakingScreen mcqs={activeMCQs} config={quizConfig} onFinish={handleFinish} />
        </motion.div>
      )}
      {screen === "results" && quizConfig && (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <ResultsScreen mcqs={activeMCQs} states={finalStates} config={quizConfig} onRetry={handleRetry} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
