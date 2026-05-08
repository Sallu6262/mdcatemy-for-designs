"use client";

import { useState } from "react";
import { Search, Ban, Eye } from "lucide-react";

const STUDENTS = [
  { id: 1, name: "Hayan Khan",    email: "hayan@example.com",   joined: "Jan 12, 2026", tests: 14, avgScore: 78, status: "Active" },
  { id: 2, name: "Sara Ahmed",    email: "sara@example.com",    joined: "Feb  3, 2026", tests: 11, avgScore: 82, status: "Active" },
  { id: 3, name: "Ali Raza",      email: "ali@example.com",     joined: "Jan 28, 2026", tests:  9, avgScore: 65, status: "Active" },
  { id: 4, name: "Fatima Malik",  email: "fatima@example.com",  joined: "Mar  7, 2026", tests:  6, avgScore: 71, status: "Active" },
  { id: 5, name: "Omar Sheikh",   email: "omar@example.com",    joined: "Feb 14, 2026", tests:  3, avgScore: 54, status: "Blocked" },
];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const filtered = STUDENTS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{STUDENTS.length} registered</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3">Student</th>
              <th className="text-left px-3 py-3">Joined</th>
              <th className="text-left px-3 py-3">Tests</th>
              <th className="text-left px-3 py-3">Avg Score</th>
              <th className="text-left px-3 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center text-xs font-black text-yellow-700">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-[13px]">{s.name}</p>
                      <p className="text-[10px] text-gray-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-xs text-gray-500">{s.joined}</td>
                <td className="px-3 py-3.5 text-xs font-semibold text-gray-700">{s.tests}</td>
                <td className="px-3 py-3.5">
                  <span className={`text-xs font-bold ${s.avgScore >= 75 ? "text-green-600" : s.avgScore >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                    {s.avgScore}%
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button className="text-gray-400 hover:text-gray-600"><Eye size={14} /></button>
                    <button className="text-gray-400 hover:text-red-500"><Ban size={14} /></button>
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
