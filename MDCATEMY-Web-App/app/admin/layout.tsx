"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Layers, Users,
  CalendarDays, BarChart2, Menu, X, Shield,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin",           label: "Overview",        icon: LayoutDashboard },
  { href: "/admin/mcqs",      label: "MCQ Library",     icon: BookOpen },
  { href: "/admin/tests",     label: "Test Series",     icon: Layers },
  { href: "/admin/students",  label: "Students",        icon: Users },
  { href: "/admin/schedule",  label: "Schedule Image",  icon: CalendarDays },
  { href: "/admin/analytics", label: "Analytics",       icon: BarChart2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>

        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200">
          <div className="w-7 h-7 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-900 leading-none">MDCATEMY</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-yellow-600 leading-none mt-0.5">Admin Panel</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}>
                <item.icon size={16} className={active ? "text-yellow-600" : "text-gray-400"} />
                {item.label}
                {active && <ChevronRight size={12} className="ml-auto text-yellow-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin badge */}
        <div className="border-t border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-black text-black">A</div>
            <div>
              <p className="text-xs font-bold text-gray-900">Admin</p>
              <p className="text-[10px] text-gray-500">admin@mdcatemy.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Scrim (mobile) */}
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-30 lg:hidden" />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-3 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800 p-1">
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-500">
            {NAV.find((n) => isActive(n.href))?.label ?? "Admin"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2.5 py-1 rounded-full border border-yellow-200">
              Admin Mode
            </span>
            <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-800 font-medium">
              ← Student View
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
