"use client";

import Link from "next/link";
import { Plus, Eye, Trash2, Edit } from "lucide-react";

const TESTS = [
  { week: 16, title: "Week 16 Test", date: "Apr 25, 2026", status: "Draft",     mcqs: 0,   attempts: 0 },
  { week: 15, title: "Week 15 Test", date: "Apr 18, 2026", status: "Scheduled", mcqs: 200, attempts: 0 },
  { week: 14, title: "Week 14 Test", date: "Apr  5, 2026", status: "Completed", mcqs: 200, attempts: 278 },
  { week: 13, title: "Week 13 Test", date: "Mar 29, 2026", status: "Completed", mcqs: 200, attempts: 261 },
  { week: 12, title: "Week 12 Test", date: "Mar 22, 2026", status: "Completed", mcqs: 200, attempts: 249 },
  { week: 11, title: "Week 11 Test", date: "Mar 15, 2026", status: "Completed", mcqs: 200, attempts: 233 },
];

const STATUS_STYLE: Record<string, string> = {
  Draft:     "bg-gray-100 text-gray-600",
  Scheduled: "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
};

export default function TestsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Test Series</h1>
          <p className="text-sm text-gray-500 mt-0.5">{TESTS.length} tests · {TESTS.filter(t => t.status === "Completed").length} completed</p>
        </div>
        <Link href="/admin/tests/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 text-black text-sm font-black rounded-xl hover:bg-yellow-500 transition-colors">
          <Plus size={15} /> New Test
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3">Test</th>
              <th className="text-left px-3 py-3">Date</th>
              <th className="text-left px-3 py-3">MCQs</th>
              <th className="text-left px-3 py-3">Status</th>
              <th className="text-right px-3 py-3">Attempts</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {TESTS.map((t) => (
              <tr key={t.week} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-bold text-gray-900">Week {t.week}</p>
                  <p className="text-[11px] text-gray-400">{t.title}</p>
                </td>
                <td className="px-3 py-3.5 text-xs text-gray-500">{t.date}</td>
                <td className="px-3 py-3.5 text-xs font-semibold text-gray-700">{t.mcqs || "—"}</td>
                <td className="px-3 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                </td>
                <td className="px-3 py-3.5 text-right text-xs font-semibold text-gray-700">{t.attempts || "—"}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    {t.status === "Draft" && (
                      <Link href="/admin/tests/create" className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold">
                        Continue
                      </Link>
                    )}
                    <button className="text-gray-400 hover:text-gray-600"><Eye size={14} /></button>
                    <button className="text-gray-400 hover:text-gray-600"><Edit size={14} /></button>
                    <button className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
