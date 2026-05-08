"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

const TEST_STATS = [
  { week: 14, title: "Week 14", attempts: 278, avg: 78, highest: 98, lowest: 31, passRate: 84 },
  { week: 13, title: "Week 13", attempts: 261, avg: 71, highest: 95, lowest: 28, passRate: 77 },
  { week: 12, title: "Week 12", attempts: 249, avg: 74, highest: 97, lowest: 33, passRate: 80 },
  { week: 11, title: "Week 11", attempts: 233, avg: 68, highest: 93, lowest: 22, passRate: 72 },
];

const HARDEST_MCQS = [
  { id: 104, subject: "Physics",   topic: "Projectile Motion", question: "A ball thrown at 30° to the horizontal…", wrongPct: 74 },
  { id: 218, subject: "Chemistry", topic: "Hybridisation",     question: "Which of the following has sp³d hybridisation?", wrongPct: 68 },
  { id: 391, subject: "Biology",   topic: "Cell Division",     question: "During which phase do chromosomes condense to their maximum?", wrongPct: 63 },
  { id: 502, subject: "Physics",   topic: "Quantum Numbers",   question: "Maximum electrons in n=3 shell is:", wrongPct: 61 },
];

export default function AnalyticsPage() {
  const avgOverall = Math.round(TEST_STATS.reduce((s, t) => s + t.avg, 0) / TEST_STATS.length);
  const totalAttempts = TEST_STATS.reduce((s, t) => s + t.attempts, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Performance across all test series.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Attempts", val: totalAttempts,      color: "text-blue-700",  bg: "bg-blue-50 border-blue-200" },
          { label: "Overall Avg",    val: `${avgOverall}%`,   color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Tests Run",      val: TEST_STATS.length,  color: "text-purple-700",bg: "bg-purple-50 border-purple-200" },
          { label: "Avg Pass Rate",  val: `${Math.round(TEST_STATS.reduce((s,t)=>s+t.passRate,0)/TEST_STATS.length)}%`, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-test table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Per-Test Results</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3">Test</th>
              <th className="text-left px-3 py-3">Attempts</th>
              <th className="text-left px-3 py-3">Avg Score</th>
              <th className="text-left px-3 py-3">Highest</th>
              <th className="text-left px-3 py-3">Lowest</th>
              <th className="text-left px-3 py-3">Pass Rate</th>
              <th className="text-left px-3 py-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {TEST_STATS.map((t, i) => {
              const prev = TEST_STATS[i + 1];
              const trend = prev ? t.avg - prev.avg : 0;
              return (
                <tr key={t.week} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-900">Week {t.week}</td>
                  <td className="px-3 py-3.5 text-xs text-gray-700">{t.attempts}</td>
                  <td className="px-3 py-3.5">
                    <span className={`text-xs font-bold ${t.avg >= 75 ? "text-green-600" : t.avg >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                      {t.avg}%
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-green-600 font-semibold">{t.highest}%</td>
                  <td className="px-3 py-3.5 text-xs text-red-500 font-semibold">{t.lowest}%</td>
                  <td className="px-3 py-3.5 text-xs font-semibold text-gray-700">{t.passRate}%</td>
                  <td className="px-3 py-3.5">
                    {trend !== 0 && (
                      <span className={`flex items-center gap-0.5 text-xs font-bold ${trend > 0 ? "text-green-600" : "text-red-500"}`}>
                        {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(trend)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hardest MCQs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Hardest MCQs</h2>
          <p className="text-xs text-gray-400">Auto-flagged: wrong rate &gt;60%</p>
        </div>
        <div className="divide-y divide-gray-50">
          {HARDEST_MCQS.map((m) => (
            <div key={m.id} className="px-5 py-3.5 flex items-start gap-4">
              <div className="flex-shrink-0 text-center">
                <p className="text-xl font-black text-red-500">{m.wrongPct}%</p>
                <p className="text-[9px] font-semibold text-gray-400 uppercase">wrong</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{m.subject}</span>
                  <span className="text-[10px] text-gray-400">{m.topic}</span>
                </div>
                <p className="text-xs text-gray-700 font-medium">{m.question}</p>
              </div>
              <button className="flex-shrink-0 text-xs text-yellow-600 border border-yellow-200 px-2.5 py-1 rounded-lg hover:bg-yellow-50 transition-colors font-semibold">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
