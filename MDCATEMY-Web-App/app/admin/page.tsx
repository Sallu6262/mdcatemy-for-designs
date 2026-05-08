"use client";

import Link from "next/link";
import { BookOpen, Layers, Users, AlertTriangle, TrendingUp, Plus, Upload, ArrowRight } from "lucide-react";

const STATS = [
  { label: "Total MCQs",      value: "2,847", sub: "+34 this week",  color: "bg-blue-50 border-blue-200",   text: "text-blue-700",  icon: BookOpen },
  { label: "Active Tests",    value: "15",    sub: "4 upcoming",     color: "bg-green-50 border-green-200", text: "text-green-700", icon: Layers },
  { label: "Students",        value: "342",   sub: "+12 this week",  color: "bg-purple-50 border-purple-200",text:"text-purple-700",icon: Users },
  { label: "Flagged MCQs",    value: "7",     sub: "Need review",    color: "bg-red-50 border-red-200",     text: "text-red-700",   icon: AlertTriangle },
];

const QUICK_ACTIONS = [
  { label: "Upload MCQs",    href: "/admin/mcqs",         icon: Upload, desc: "Bulk CSV upload or manual entry" },
  { label: "Create Test",    href: "/admin/tests/create", icon: Plus,   desc: "Build a new weekly test" },
  { label: "View Students",  href: "/admin/students",     icon: Users,  desc: "Manage student accounts" },
];

const RECENT_TESTS = [
  { week: 15, title: "Week 15 Test",  date: "Apr 18, 2026", status: "Scheduled", mcqs: 200, attempts: 0 },
  { week: 14, title: "Week 14 Test",  date: "Apr  5, 2026", status: "Completed", mcqs: 200, attempts: 278 },
  { week: 13, title: "Week 13 Test",  date: "Mar 29, 2026", status: "Completed", mcqs: 200, attempts: 261 },
  { week: 12, title: "Week 12 Test",  date: "Mar 22, 2026", status: "Completed", mcqs: 200, attempts: 249 },
];

const FLAGGED_MCQS = [
  { id: 104, subject: "Biology",   question: "Which organelle is responsible for…", flags: 3, reason: "Ambiguous answer" },
  { id: 218, subject: "Chemistry", question: "The hybridisation of carbon in CO₂…",  flags: 2, reason: "Typo in option B" },
  { id: 391, subject: "Physics",   question: "A ball is thrown at 30° to the…",      flags: 5, reason: "Wrong correct answer marked" },
];

export default function AdminOverview() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Manage MCQs, test series, and student data.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon size={16} className={s.text} />
            </div>
            <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-colors group">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-200 transition-colors">
                <a.icon size={18} className="text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{a.label}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
              <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-yellow-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tests */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Test Series</h2>
            <Link href="/admin/tests" className="text-xs text-yellow-600 font-semibold hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="text-left px-5 py-2.5">Test</th>
                <th className="text-left px-3 py-2.5">Date</th>
                <th className="text-left px-3 py-2.5">Status</th>
                <th className="text-right px-5 py-2.5">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TESTS.map((t) => (
                <tr key={t.week} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900 text-[13px]">Week {t.week}</p>
                    <p className="text-[10px] text-gray-400">{t.mcqs} MCQs</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{t.date}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-semibold text-gray-700">{t.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Flagged MCQs */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Flagged MCQs</h2>
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{FLAGGED_MCQS.length} pending</span>
          </div>
          <div className="divide-y divide-gray-50">
            {FLAGGED_MCQS.map((m) => (
              <div key={m.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{m.subject}</span>
                      <span className="text-[10px] text-red-500 font-semibold">{m.flags} flags</span>
                    </div>
                    <p className="text-xs text-gray-700 truncate font-medium">{m.question}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.reason}</p>
                  </div>
                  <button className="flex-shrink-0 text-xs text-yellow-600 hover:text-yellow-700 font-semibold border border-yellow-200 px-2.5 py-1 rounded-lg hover:bg-yellow-50 transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MCQ pool breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">MCQ Pool Breakdown</h2>
          <Link href="/admin/mcqs" className="text-xs text-yellow-600 font-semibold hover:underline">Manage →</Link>
        </div>
        <div className="space-y-2.5">
          {[
            { sub: "Biology",          count: 890, pct: 31, color: "bg-emerald-400" },
            { sub: "Chemistry",        count: 720, pct: 25, color: "bg-amber-400" },
            { sub: "Physics",          count: 710, pct: 25, color: "bg-blue-400" },
            { sub: "English",          count: 347, pct: 12, color: "bg-purple-400" },
            { sub: "Logical Reasoning",count: 180, pct:  7, color: "bg-pink-400" },
          ].map((s) => (
            <div key={s.sub} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 font-medium w-36 flex-shrink-0">{s.sub}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-700 w-12 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
