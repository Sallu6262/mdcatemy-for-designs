"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Search, CheckSquare, Square,
  X, AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
} from "lucide-react";

/* ── Types ── */
type Step = 1 | 2 | 3;

interface MCQ {
  id: number; subject: string; chapter: string; topic: string;
  difficulty: "Easy" | "Medium" | "Hard"; question: string; options: string[]; correct: number;
}

interface TestConfig {
  week: number; title: string; date: string; durationMins: number; limit: number;
}

/* ── Mock MCQ pool (replace with API) ── */
const MCQ_POOL: MCQ[] = [
  { id: 1,  subject: "Biology",   chapter: "Cell Biology",       topic: "Cell Division",    difficulty: "Medium", question: "During which phase of mitosis do chromosomes align at the metaphase plate?",         options: ["Prophase","Metaphase","Anaphase","Telophase"],                  correct: 1 },
  { id: 2,  subject: "Biology",   chapter: "Cell Biology",       topic: "Cell Division",    difficulty: "Easy",   question: "How many chromosomes does a human diploid cell have?",                               options: ["23","46","48","44"],                                            correct: 1 },
  { id: 3,  subject: "Biology",   chapter: "Cell Biology",       topic: "Organelles",       difficulty: "Easy",   question: "Which organelle is known as the powerhouse of the cell?",                           options: ["Nucleus","Ribosome","Mitochondria","Golgi"],                   correct: 2 },
  { id: 4,  subject: "Biology",   chapter: "Genetics",           topic: "DNA Structure",    difficulty: "Easy",   question: "Which base pairs with Adenine in DNA?",                                             options: ["Guanine","Cytosine","Thymine","Uracil"],                       correct: 2 },
  { id: 5,  subject: "Biology",   chapter: "Genetics",           topic: "DNA Structure",    difficulty: "Medium", question: "The double helix structure of DNA was described by:",                                options: ["Mendel","Watson & Crick","Franklin","Chargaff"],               correct: 1 },
  { id: 6,  subject: "Biology",   chapter: "Genetics",           topic: "Mendelian Laws",   difficulty: "Medium", question: "In a monohybrid cross between Tt × Tt, what fraction will be homozygous dominant?", options: ["1/4","1/2","3/4","1"],                                         correct: 0 },
  { id: 7,  subject: "Chemistry", chapter: "Atomic Structure",   topic: "Quantum Numbers",  difficulty: "Hard",   question: "What is the maximum number of electrons in the 4f subshell?",                      options: ["10","14","6","16"],                                            correct: 1 },
  { id: 8,  subject: "Chemistry", chapter: "Atomic Structure",   topic: "Quantum Numbers",  difficulty: "Medium", question: "The principal quantum number n=3 corresponds to which shell?",                     options: ["K","L","M","N"],                                               correct: 2 },
  { id: 9,  subject: "Chemistry", chapter: "Chemical Bonding",   topic: "Hybridisation",    difficulty: "Medium", question: "The hybridisation of carbon in CO₂ is:",                                           options: ["sp","sp²","sp³","sp³d"],                                       correct: 0 },
  { id: 10, subject: "Chemistry", chapter: "Chemical Bonding",   topic: "Hybridisation",    difficulty: "Hard",   question: "Which of the following has sp³d hybridisation?",                                   options: ["BF₃","SF₄","PCl₃","H₂O"],                                     correct: 1 },
  { id: 11, subject: "Physics",   chapter: "Kinematics",         topic: "Motion in 1D",     difficulty: "Easy",   question: "The slope of a velocity-time graph represents:",                                   options: ["Distance","Speed","Acceleration","Displacement"],              correct: 2 },
  { id: 12, subject: "Physics",   chapter: "Kinematics",         topic: "Projectile Motion",difficulty: "Medium", question: "At maximum height, the vertical component of projectile velocity is:",             options: ["Maximum","Zero","Equal to horizontal","Half of initial"],     correct: 1 },
  { id: 13, subject: "English",   chapter: "Vocabulary",         topic: "Synonyms",         difficulty: "Easy",   question: "Choose the synonym of 'Benevolent':",                                              options: ["Cruel","Kind","Angry","Lazy"],                                 correct: 1 },
  { id: 14, subject: "English",   chapter: "Grammar",            topic: "Tenses",           difficulty: "Easy",   question: "She _____ to school every day. (Present Simple)",                                  options: ["go","goes","went","going"],                                    correct: 1 },
  { id: 15, subject: "Logical Reasoning", chapter: "Patterns",   topic: "Number Series",    difficulty: "Medium", question: "What is the next number in: 2, 6, 12, 20, 30, ___?",                              options: ["40","42","44","46"],                                           correct: 1 },
];

const DIFF_COLOR: Record<string, string> = {
  Easy:   "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Hard:   "bg-red-100 text-red-700 border-red-200",
};

const SUBJECTS = ["Biology", "Chemistry", "Physics", "English", "Logical Reasoning"];

/* ── Component ── */
export default function CreateTest() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 — config
  const [config, setConfig] = useState<TestConfig>({
    week: 16, title: "Week 16 Test", date: "2026-04-25", durationMins: 150, limit: 200,
  });

  // Step 2 — syllabus selection
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set(SUBJECTS));

  // Step 3 — MCQ picking
  const [selectedMCQs, setSelectedMCQs] = useState<Set<number>>(new Set());
  const [searchQ, setSearchQ] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [diffFilter, setDiffFilter] = useState("All");

  /* Derived */
  const syllabus = useMemo(() => {
    const map: Record<string, Record<string, Set<string>>> = {};
    MCQ_POOL.forEach((m) => {
      if (!map[m.subject]) map[m.subject] = {};
      if (!map[m.subject][m.chapter]) map[m.subject][m.chapter] = new Set();
      map[m.subject][m.chapter].add(m.topic);
    });
    return map;
  }, []);

  const topicsInSyllabus = useMemo(() => {
    const all: string[] = [];
    Object.values(syllabus).forEach((chapters) =>
      Object.values(chapters).forEach((topics) => topics.forEach((t) => all.push(t)))
    );
    return all;
  }, [syllabus]);

  const availableTopics = useMemo(
    () => [...selectedTopics],
    [selectedTopics]
  );

  const visibleMCQs = useMemo(() => {
    return MCQ_POOL.filter((m) => {
      const inTopic   = activeTopic ? m.topic === activeTopic : selectedTopics.has(m.topic);
      const matchDiff = diffFilter === "All" || m.difficulty === diffFilter;
      const matchQ    = searchQ === "" || m.question.toLowerCase().includes(searchQ.toLowerCase());
      return inTopic && matchDiff && matchQ;
    });
  }, [activeTopic, selectedTopics, diffFilter, searchQ]);

  const selectedCount = selectedMCQs.size;
  const limitReached  = selectedCount >= config.limit;
  const pct           = Math.min((selectedCount / config.limit) * 100, 100);
  const barColor      = pct < 70 ? "bg-blue-500" : pct < 95 ? "bg-yellow-400" : "bg-red-500";

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return next;
    });
  }

  function toggleMCQ(id: number) {
    if (limitReached && !selectedMCQs.has(id)) return;
    setSelectedMCQs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSubject(sub: string) {
    setOpenSubjects((prev) => {
      const next = new Set(prev);
      next.has(sub) ? next.delete(sub) : next.add(sub);
      return next;
    });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900">Create Weekly Test</h1>
          <p className="text-xs text-gray-500">Step {step} of 3 — {step === 1 ? "Test Settings" : step === 2 ? "Select Syllabus" : "Pick MCQs"}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {([1,2,3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step > s ? "bg-green-500 text-white" : step === s ? "bg-yellow-400 text-black" : "bg-gray-200 text-gray-400"
            }`}>
              {step > s ? "✓" : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-12 transition-all ${step > s ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        ))}
        <span className="ml-3 text-xs text-gray-500">
          {step === 1 ? "Configure test details" : step === 2 ? "Choose topics to include" : "Select individual MCQs"}
        </span>
      </div>

      {/* ══ STEP 1 — Config ══ */}
      {step === 1 && (
        <div className="max-w-lg bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          {[
            { label: "Week Number",  key: "week",         type: "number", min: 1 },
            { label: "Test Title",   key: "title",        type: "text" },
            { label: "Scheduled Date", key: "date",       type: "date" },
            { label: "Duration (minutes)", key: "durationMins", type: "number", min: 30 },
            { label: "MCQ Limit",    key: "limit",        type: "number", min: 10 },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">{f.label}</label>
              <input
                type={f.type}
                min={f.min}
                value={config[f.key as keyof TestConfig]}
                onChange={(e) => setConfig({
                  ...config,
                  [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-yellow-400"
              />
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
              <p className="text-xl font-black text-blue-700">{config.limit}</p>
              <p className="text-[10px] text-gray-500 font-semibold">MCQ Limit</p>
            </div>
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
              <p className="text-xl font-black text-blue-700">{config.durationMins}</p>
              <p className="text-[10px] text-gray-500 font-semibold">Minutes</p>
            </div>
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
              <p className="text-xl font-black text-blue-700">{Math.round(config.durationMins / config.limit * 60)}s</p>
              <p className="text-[10px] text-gray-500 font-semibold">Per MCQ</p>
            </div>
          </div>

          <button onClick={() => setStep(2)}
            className="w-full py-3 bg-yellow-400 text-black text-sm font-black uppercase tracking-wider rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ══ STEP 2 — Syllabus ══ */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <p className="text-xs text-blue-700">
              Check the topics you want in this test. All MCQs for selected topics will be available to pick in Step 3.
              <span className="font-bold"> {selectedTopics.size} topic{selectedTopics.size !== 1 ? "s" : ""} selected.</span>
            </p>
          </div>

          <div className="space-y-2">
            {SUBJECTS.map((sub) => {
              const chapters = syllabus[sub] ?? {};
              const allTopics = Object.values(chapters).flatMap((t) => [...t]);
              const checkedCount = allTopics.filter((t) => selectedTopics.has(t)).length;
              const isOpen = openSubjects.has(sub);

              return (
                <div key={sub} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSubject(sub)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-900 flex-1">{sub}</span>
                    {checkedCount > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {checkedCount}/{allTopics.length} topics
                      </span>
                    )}
                    {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-3 space-y-3">
                      {Object.entries(chapters).map(([chapter, topics]) => (
                        <div key={chapter}>
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">{chapter}</p>
                          <div className="flex flex-wrap gap-2">
                            {[...topics].map((topic) => {
                              const checked = selectedTopics.has(topic);
                              const count = MCQ_POOL.filter((m) => m.topic === topic).length;
                              return (
                                <button key={topic} onClick={() => toggleTopic(topic)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                    checked
                                      ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400"
                                  }`}>
                                  {checked ? <CheckSquare size={11} /> : <Square size={11} />}
                                  {topic}
                                  <span className={`text-[9px] font-bold ${checked ? "text-yellow-500" : "text-gray-400"}`}>
                                    {count} MCQs
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button
              onClick={() => { setActiveTopic(null); setStep(3); }}
              disabled={selectedTopics.size === 0}
              className="flex-1 py-2.5 bg-yellow-400 text-black text-sm font-black uppercase tracking-wider rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              Pick MCQs <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 3 — Pick MCQs ══ */}
      {step === 3 && (
        <div className="space-y-4">
          {/* ── Sticky counter bar ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-16 z-10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-black ${limitReached ? "text-red-600" : "text-gray-900"}`}>
                  {selectedCount}
                  <span className="text-sm font-semibold text-gray-400 ml-1">/ {config.limit} MCQs</span>
                </div>
                {limitReached && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                    <AlertTriangle size={10} /> Limit reached
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{config.durationMins} min · Week {config.week}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">{config.limit - selectedCount} remaining</span>
              <span className="text-[10px] font-bold text-gray-500">{Math.round(pct)}%</span>
            </div>
          </div>

          {/* ── Layout: topic list + MCQ panel ── */}
          <div className="flex gap-4">
            {/* Topic sidebar */}
            <div className="w-48 flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden self-start sticky top-44">
              <div className="px-3 py-2.5 border-b border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Topics</p>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                <button
                  onClick={() => setActiveTopic(null)}
                  className={`w-full text-left px-3 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                    activeTopic === null ? "bg-yellow-50 text-yellow-700 border-l-2 border-yellow-400" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Topics
                  <span className="text-[9px] font-bold text-gray-400">{MCQ_POOL.filter(m => selectedTopics.has(m.topic)).length}</span>
                </button>
                {availableTopics.map((t) => {
                  const cnt = MCQ_POOL.filter((m) => m.topic === t).length;
                  const sel = MCQ_POOL.filter((m) => m.topic === t && selectedMCQs.has(m.id)).length;
                  return (
                    <button key={t} onClick={() => setActiveTopic(t)}
                      className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${
                        activeTopic === t
                          ? "bg-yellow-50 text-yellow-700 font-bold border-l-2 border-yellow-400"
                          : "text-gray-600 hover:bg-gray-50 font-medium"
                      }`}>
                      <span className="truncate pr-1">{t}</span>
                      <span className={`text-[9px] font-bold flex-shrink-0 ${sel > 0 ? "text-yellow-600" : "text-gray-400"}`}>
                        {sel}/{cnt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MCQ panel */}
            <div className="flex-1 space-y-3 min-w-0">
              {/* Search + filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search questions or keywords..."
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 bg-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div className="relative">
                  <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 bg-white focus:outline-none focus:border-yellow-400 cursor-pointer">
                    {["All","Easy","Medium","Hard"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-medium">{visibleMCQs.length} MCQs shown</p>

              {/* MCQ cards */}
              {visibleMCQs.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                  No MCQs match your filter.
                </div>
              ) : (
                visibleMCQs.map((m) => {
                  const checked = selectedMCQs.has(m.id);
                  const disabled = limitReached && !checked;
                  return (
                    <div key={m.id}
                      onClick={() => !disabled && toggleMCQ(m.id)}
                      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                        checked
                          ? "border-yellow-400 bg-yellow-50"
                          : disabled
                            ? "border-gray-100 opacity-50 cursor-not-allowed"
                            : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                          checked ? "bg-yellow-400 border-yellow-400" : "border-gray-300"
                        }`}>
                          {checked && <X size={10} className="text-black" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${DIFF_COLOR[m.difficulty]}`}>
                              {m.difficulty}
                            </span>
                            <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{m.topic}</span>
                          </div>
                          <p className="text-xs text-gray-900 font-medium leading-relaxed">{m.question}</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2">
                            {m.options.map((o, i) => (
                              <p key={i} className={`text-[10px] ${i === m.correct ? "text-green-600 font-bold" : "text-gray-400"}`}>
                                {["A","B","C","D"][i]}. {o}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setStep(2)}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button
              onClick={() => {
                if (selectedCount === 0) { alert("Please select at least 1 MCQ."); return; }
                alert(`Test "${config.title}" created with ${selectedCount} MCQs!\n\n(DB save + publish flow coming next.)`);
                router.push("/admin/tests");
              }}
              className="flex-1 py-2.5 bg-yellow-400 text-black text-sm font-black uppercase tracking-wider rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Publish Test · {selectedCount} MCQs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
