"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Zap, Layers, Archive, BarChart2,
  Settings, PanelLeftClose, PanelLeftOpen,
  Bell, Menu, X, User, LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/* ─────────────────────────────────────────
   Nav config
───────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "My Camp",      href: "/dashboard",              icon: LayoutDashboard },
  { label: "Quiz Builder", href: "/dashboard/quiz",         icon: Zap },
  { label: "Test Series",  href: "/dashboard/test-series",  icon: Layers },
  { label: "My Copy",      href: "/dashboard/my-copy",      icon: Archive },
  { label: "Analytics",    href: "/dashboard/analytics",    icon: BarChart2 },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":               "My Camp",
  "/dashboard/quiz":          "Quiz Builder",
  "/dashboard/test-series":   "Test Series",
  "/dashboard/my-copy":       "My Copy",
  "/dashboard/analytics":     "Analytics",
  "/dashboard/simulation":    "MDCAT Simulation",
  "/dashboard/settings":      "Settings",
};

/* ─────────────────────────────────────────
   Sidebar nav item
───────────────────────────────────────── */
function NavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: typeof NAV_ITEMS[0];
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={item.href} onClick={onClick}>
      <div
        className={`relative flex items-center rounded-lg transition-all duration-200 cursor-pointer group ${
          collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5"
        } ${
          active
            ? "bg-mdcat-yellow/10 text-mdcat-yellow"
            : "text-warrior-text hover:bg-warrior-gray/40 hover:text-white"
        }`}
      >
        {/* Yellow left accent */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-mdcat-yellow rounded-full" />
        )}

        <item.icon size={17} className="flex-shrink-0" />

        {!collapsed && (
          <span className="font-inter font-semibold text-[13px] truncate">{item.label}</span>
        )}

        {/* Tooltip (collapsed only) */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-dark-charcoal border border-warrior-border rounded-lg text-white text-xs font-inter font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl z-[60]">
            {item.label}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────
   Shield logo mark
───────────────────────────────────────── */
function ShieldMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="bg-mdcat-yellow flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size * 1.14,
        clipPath: "polygon(50% 0%, 100% 15%, 100% 75%, 50% 100%, 0% 75%, 0% 15%)",
      }}
    >
      <span
        className="font-poppins font-black text-warrior-black leading-none"
        style={{ fontSize: size * 0.36 }}
      >
        M
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   User avatar chip
───────────────────────────────────────── */
function AvatarChip({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-mdcat-yellow/15 border border-mdcat-yellow/30 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="font-poppins font-black text-mdcat-yellow" style={{ fontSize: size * 0.34 }}>
        HK
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Layout
───────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isQuizTaking, setIsQuizTaking] = useState(false);

  useEffect(() => {
    const onStart = () => setIsQuizTaking(true);
    const onEnd = () => setIsQuizTaking(false);
    window.addEventListener("quiz-taking-start", onStart);
    window.addEventListener("quiz-taking-end", onEnd);
    return () => {
      window.removeEventListener("quiz-taking-start", onStart);
      window.removeEventListener("quiz-taking-end", onEnd);
    };
  }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard";
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-warrior-black overflow-hidden">

      {/* ════════════════════════════════════
          DESKTOP SIDEBAR
      ════════════════════════════════════ */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-warrior-black border-r border-warrior-border overflow-hidden relative z-20 flex-shrink-0"
      >
        {/* Logo */}
        <div
          className={`flex items-center h-[60px] border-b border-warrior-border flex-shrink-0 ${
            collapsed ? "justify-center px-0" : "gap-3 px-4"
          }`}
        >
          <ShieldMark size={28} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-poppins font-black text-[15px] tracking-tight">
                  <span className="text-mdcat-yellow">MDCAT</span>
                  <span className="text-white">EMY</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          <div className={`space-y-0.5 ${collapsed ? "px-1.5" : "px-2"}`}>
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>

        {/* Bottom controls */}
        <div className={`border-t border-warrior-border py-2 space-y-0.5 ${collapsed ? "px-1.5" : "px-2"}`}>
          {/* Settings */}
          <NavItem
            item={{ label: "Settings", href: "/dashboard/settings", icon: Settings }}
            active={pathname === "/dashboard/settings"}
            collapsed={collapsed}
          />

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center rounded-lg transition-all duration-200 text-warrior-text hover:bg-warrior-gray/40 hover:text-white ${
              collapsed ? "justify-center h-10" : "gap-3 px-3 py-2.5"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <>
                <PanelLeftClose size={17} />
                <span className="font-inter font-semibold text-[13px]">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User section */}
        <div
          className={`border-t border-warrior-border py-3 flex items-center ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          <AvatarChip size={32} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="font-inter font-bold text-[12px] text-white">Hayan Khan</p>
                <p className="font-inter text-[10px] text-warrior-text uppercase tracking-[0.1em]">
                  Warrior
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ════════════════════════════════════
          MOBILE SIDEBAR OVERLAY
      ════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/65 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-warrior-black border-r border-warrior-border z-50 lg:hidden flex flex-col"
            >
              {/* Logo row */}
              <div className="flex items-center gap-3 h-[60px] px-4 border-b border-warrior-border">
                <ShieldMark size={28} />
                <span className="font-poppins font-black text-[15px] tracking-tight">
                  <span className="text-mdcat-yellow">MDCAT</span>
                  <span className="text-white">EMY</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="ml-auto text-warrior-text hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 py-3 overflow-y-auto">
                <div className="space-y-0.5 px-2">
                  {/* My Camp */}
                  <NavItem
                    item={{ label: "My Camp", href: "/dashboard", icon: LayoutDashboard }}
                    active={isActive("/dashboard")}
                    collapsed={false}
                    onClick={() => setMobileOpen(false)}
                  />
                  {/* Profile */}
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-warrior-text hover:bg-warrior-gray/40 hover:text-white transition-all duration-200"
                  >
                    <User size={17} className="flex-shrink-0" />
                    <span className="font-inter font-semibold text-[13px]">Profile</span>
                  </button>
                  {/* Settings */}
                  <NavItem
                    item={{ label: "Settings", href: "/dashboard/settings", icon: Settings }}
                    active={pathname === "/dashboard/settings"}
                    collapsed={false}
                    onClick={() => setMobileOpen(false)}
                  />
                </div>
              </nav>

              {/* Log Out */}
              <div className="border-t border-warrior-border px-2 py-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                >
                  <LogOut size={17} className="flex-shrink-0" />
                  <span className="font-inter font-semibold text-[13px]">Log Out</span>
                </button>
              </div>

              {/* User */}
              <div className="border-t border-warrior-border px-3 py-3 flex items-center gap-3">
                <AvatarChip size={34} />
                <div>
                  <p className="font-inter font-bold text-[12px] text-white">Hayan Khan</p>
                  <p className="font-inter text-[10px] text-warrior-text uppercase tracking-[0.1em]">
                    Warrior
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          MAIN AREA
      ════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-[60px] bg-dark-charcoal border-b border-warrior-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10">
          {/* Left */}
          <div className="flex items-center gap-3">
            {!isQuizTaking && (
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-warrior-text hover:text-white transition-colors p-1"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="font-poppins font-black text-white text-[15px] leading-tight">
                {pageTitle}
              </h1>
              <p className="text-warrior-text text-[10px] font-inter hidden lg:block leading-tight mt-0.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 lg:gap-2">
            {/* Theme toggle */}
            <ThemeToggle size={36} />

            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center text-warrior-text hover:text-white hover:bg-warrior-gray/50 rounded-lg transition-all duration-200">
              <Bell size={17} />
              <span className="absolute top-[7px] right-[7px] w-1.5 h-1.5 bg-mdcat-yellow rounded-full" />
            </button>

            {/* Avatar */}
            <AvatarChip size={32} />
          </div>
        </header>

        {/* Page content */}
        <main data-dashboard-main className="flex-1 overflow-hidden pb-[58px] lg:pb-0">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>

        {/* ════════════════════════════════════
            MOBILE BOTTOM TAB BAR
        ════════════════════════════════════ */}
        <div data-mobile-tabbar className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-charcoal border-t border-warrior-border z-30">
          <div className="flex items-stretch h-[58px]">
            {NAV_ITEMS.map((tab) => {
              const active = isActive(tab.href);
              const shortLabel =
                tab.label === "My Camp"      ? "Home" :
                tab.label === "Quiz Builder" ? "Quiz" :
                tab.label === "Test Series"  ? "Tests" :
                tab.label === "My Copy"      ? "Copy" :
                tab.label;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 relative pt-1"
                >
                  {/* Active top indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-mdcat-yellow rounded-full"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <tab.icon
                    size={19}
                    className={`transition-colors duration-200 ${active ? "text-mdcat-yellow" : "text-warrior-text"}`}
                  />
                  <span
                    className={`text-[9px] font-inter font-bold uppercase tracking-[0.05em] transition-colors duration-200 ${
                      active ? "text-mdcat-yellow" : "text-warrior-text"
                    }`}
                  >
                    {shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
