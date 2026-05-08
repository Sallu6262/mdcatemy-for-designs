"use client";

import { useState } from "react";
import { Upload, Plus, Search, Filter, Download, CheckCircle, AlertCircle, X, ChevronDown } from "lucide-react";

type Tab = "library" | "upload" | "add";
type Difficulty = "Easy" | "Medium" | "Hard";

interface MCQ {
  id: number; subject: string; chapter: string; topic: string;
  difficulty: Difficulty; question: string; correct: string; flags: number;
}

const SAMPLE_MCQS: MCQ[] = [
  { id: 1,   subject: "Biology",   chapter: "Cell Biology",     topic: "Cell Division",    difficulty: "Medium", question: "During which phase of mitosis do chromosomes align at the metaphase plate?", correct: "Metaphase", flags: 0 },
  { id: 2,   subject: "Biology",   chapter: "Genetics",         topic: "DNA Structure",    difficulty: "Easy",   question: "Which base pairs with Adenine in DNA?",                                        correct: "Thymine",   flags: 0 },
  { id: 3,   subject: "Chemistry", chapter: "Atomic Structure", topic: "Quantum Numbers",  difficulty: "Hard",   question: "What is the maximum number of electrons in the 4f subshell?",                  correct: "14",        flags: 1 },
  { id: 4,   subject: "Physics",   chapter: "Kinematics",       topic: "Projectile Motion",difficulty: "Medium", question: "A projectile is launched at 45°. At maximum height, its velocity is:",          correct: "Horizontal only", flags: 0 },
  { id: 5,   subject: "Chemistry", chapter: "Chemical Bonding", topic: "Hybridisation",    difficulty: "Medium", question: "The hybridisation of the central atom in BF₃ is:",                              correct: "sp²",       flags: 2 },
];

const DIFF_COLOR: Record<Difficulty, string> = {
  Easy:   "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard:   "bg-red-100 text-red-700",
};

type UploadState = "idle" | "parsing" | "done";
interface ParseResult { total: number; inserted: number; skipped: number; errors: { row: number; msg: string }[] }

export default function MCQLibrary() {
  const [tab, setTab] = useState<Tab>("library");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Manual add form
  const [form, setForm] = useState({
    subject: "Biology", chapter: "", topic: "", difficulty: "Medium" as Difficulty,
    question: "", optA: "", optB: "", optC: "", optD: "", correct: "A", explanation: "",
  });

  const filtered = SAMPLE_MCQS.filter((m) => {
    const matchSearch = m.question.toLowerCase().includes(search.toLowerCase()) ||
      m.topic.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === "All" || m.subject === subjectFilter;
    const matchDiff = diffFilter === "All" || m.difficulty === diffFilter;
    return matchSearch && matchSubject && matchDiff;
  });

  function simulateUpload() {
    setUploadState("parsing");
    setTimeout(() => {
      setParseResult({ total: 50, inserted: 47, skipped: 3, errors: [
        { row: 12, msg: "Missing explanation" },
        { row: 28, msg: "Correct answer column must be A, B, C, or D" },
        { row: 41, msg: "Near-duplicate of MCQ #204 (Biology › Cell Division)" },
      ]});
      setUploadState("done");
    }, 1800);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">MCQ Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">2,847 MCQs across 5 subjects</p>
        </div>
        <a
          href="/admin/mcqs/template.csv"
          className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={12} /> Download Template
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {(["library", "upload", "add"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t === "upload" ? "Bulk Upload" : t === "add" ? "Add Single" : "Browse Library"}
          </button>
        ))}
      </div>

      {/* ─── LIBRARY TAB ─── */}
      {tab === "library" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by question or topic..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            {[
              { label: "Subject", val: subjectFilter, set: setSubjectFilter, opts: ["All","Biology","Chemistry","Physics","English","Logical Reasoning"] },
              { label: "Difficulty", val: diffFilter, set: setDiffFilter, opts: ["All","Easy","Medium","Hard"] },
            ].map((f) => (
              <div key={f.label} className="relative">
                <select value={f.val} onChange={(e) => f.set(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-yellow-400 cursor-pointer">
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            ))}
            <div className="flex items-center text-xs text-gray-500 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
              <Filter size={12} className="mr-1.5" /> {filtered.length} shown
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3">Question</th>
                  <th className="text-left px-3 py-3">Subject</th>
                  <th className="text-left px-3 py-3">Topic</th>
                  <th className="text-left px-3 py-3">Diff</th>
                  <th className="text-left px-3 py-3">Flags</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 max-w-[280px]">
                      <p className="text-xs text-gray-800 line-clamp-2 font-medium">{m.question}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Correct: {m.correct}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{m.subject}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{m.topic}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFF_COLOR[m.difficulty]}`}>{m.difficulty}</span>
                    </td>
                    <td className="px-3 py-3">
                      {m.flags > 0
                        ? <span className="text-[10px] font-bold text-red-500">{m.flags} ⚑</span>
                        : <span className="text-[10px] text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── BULK UPLOAD TAB ─── */}
      {tab === "upload" && (
        <div className="max-w-xl space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800">
            <p className="font-bold mb-1">CSV Template Format</p>
            <p className="text-xs leading-relaxed">
              Columns (in order):{" "}
              <code className="bg-blue-100 px-1 rounded">Subject · Chapter · Topic · Difficulty · Question · Option_A · Option_B · Option_C · Option_D · Correct(A/B/C/D) · Explanation</code>
            </p>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
              ↓ Download blank template
            </a>
          </div>

          {uploadState === "idle" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
              onClick={simulateUpload}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragOver ? "border-yellow-400 bg-yellow-50" : "border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50"
              }`}
            >
              <Upload size={28} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-semibold text-gray-700">Drop your CSV file here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse · .csv or .xlsx accepted</p>
            </div>
          )}

          {uploadState === "parsing" && (
            <div className="border border-gray-200 rounded-xl p-8 text-center bg-white">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Parsing and validating rows…</p>
              <p className="text-xs text-gray-400 mt-1">Checking for duplicates and missing fields</p>
            </div>
          )}

          {uploadState === "done" && parseResult && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-green-600" />
                  <p className="text-sm font-bold text-green-800">Upload Complete</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Total rows", val: parseResult.total, color: "text-gray-900" },
                    { label: "Inserted", val: parseResult.inserted, color: "text-green-700" },
                    { label: "Skipped", val: parseResult.skipped, color: "text-red-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-lg py-2.5 border border-green-100">
                      <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {parseResult.errors.length > 0 && (
                <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-red-100 bg-red-50">
                    <AlertCircle size={14} className="text-red-500" />
                    <p className="text-xs font-bold text-red-700">{parseResult.errors.length} rows skipped</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {parseResult.errors.map((e) => (
                      <div key={e.row} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-[10px] font-bold text-gray-400 w-10">Row {e.row}</span>
                        <span className="text-xs text-red-600">{e.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { setUploadState("idle"); setParseResult(null); }}
                className="w-full py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Upload another file
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── ADD SINGLE MCQ TAB ─── */}
      {tab === "add" && (
        <div className="max-w-2xl bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Add Single MCQ</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Subject",    name: "subject",    type: "select", opts: ["Biology","Chemistry","Physics","English","Logical Reasoning"] },
              { label: "Difficulty", name: "difficulty", type: "select", opts: ["Easy","Medium","Hard"] },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">{f.label}</label>
                <div className="relative">
                  <select
                    value={form[f.name as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-yellow-400 bg-white"
                  >
                    {f.opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {[
            { label: "Chapter", name: "chapter", placeholder: "e.g. Cell Biology" },
            { label: "Topic",   name: "topic",   placeholder: "e.g. Cell Division" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">{f.label}</label>
              <input
                value={form[f.name as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-yellow-400 placeholder-gray-300"
              />
            </div>
          ))}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Question</label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              rows={3} placeholder="Enter the question text..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-yellow-400 placeholder-gray-300 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["optA","optB","optC","optD"].map((k, i) => (
              <div key={k}>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Option {["A","B","C","D"][i]}</label>
                <input
                  value={form[k as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  placeholder={`Option ${["A","B","C","D"][i]}`}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-yellow-400 placeholder-gray-300"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Correct Answer</label>
            <div className="flex gap-2">
              {["A","B","C","D"].map((l) => (
                <button key={l} onClick={() => setForm({ ...form, correct: l })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    form.correct === l
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Explanation</label>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={2} placeholder="Brief explanation of why the answer is correct..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-yellow-400 placeholder-gray-300 resize-none"
            />
          </div>

          <button
            onClick={() => alert("MCQ saved! (DB integration pending)")}
            className="w-full py-3 bg-yellow-400 text-black text-sm font-black uppercase tracking-wider rounded-xl hover:bg-yellow-500 transition-colors"
          >
            Save MCQ to Library
          </button>
        </div>
      )}
    </div>
  );
}
