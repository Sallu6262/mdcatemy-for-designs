"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Target, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { SUBJECTS } from "@/lib/analytics-data";
import { CircularRing } from "@/components/dashboard/CircularRing";

export default function SubjectChaptersPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = use(params);
  const s = SUBJECTS.find((x) => x.slug === subject);
  if (!s) notFound();

  const sorted = [...s.chapters].sort((a, b) => a.accuracy - b.accuracy);
  const avg = Math.round(
    s.chapters.reduce((sum, c) => sum + c.accuracy, 0) / s.chapters.length
  );
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-5xl mx-auto">

      {/* ── BACK NAV ──────────────────────────────── */}
      <Link
        href="/dashboard/analytics"
        className="inline-flex items-center gap-2 text-warrior-text hover:text-mdcat-yellow transition-colors font-poppins font-black text-[12px] uppercase tracking-[0.1em] group"
      >
        <div className="w-7 h-7 bg-dark-charcoal border-2 border-warrior-border group-hover:border-mdcat-yellow rounded-lg flex items-center justify-center transition-colors">
          <ArrowLeft size={14} />
        </div>
        Back to Analytics
      </Link>

      {/* ── SUBJECT HEADER ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 shadow-[4px_4px_0px_rgba(255,198,0,0.12)] flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="shrink-0">
          <CircularRing
            percent={s.accuracy}
            color={s.color}
            size={120}
            strokeWidth={11}
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[10px] font-poppins font-black uppercase tracking-[0.18em] text-warrior-text mb-1">
            Subject Overview
          </p>
          <h1 className="font-poppins font-black text-white text-3xl mb-3">
            {s.name}
          </h1>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <StatPill icon={BookOpen} label={`${s.chapters.length} chapters`} />
            <StatPill icon={Target} label={`${s.mcqs} MCQs done`} />
            <StatPill
              icon={TrendingUp}
              label={`Avg ${avg}%`}
              color={s.color}
            />
          </div>
        </div>
      </motion.div>

      {/* ── HIGHLIGHTS ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <HighlightCard
          title="Strongest"
          chapterName={strongest.name}
          accuracy={strongest.accuracy}
          color="#10B981"
          icon={TrendingUp}
        />
        <HighlightCard
          title="Needs Work"
          chapterName={weakest.name}
          accuracy={weakest.accuracy}
          color="#EF4444"
          icon={TrendingDown}
        />
      </div>

      {/* ── CHAPTERS GRID ─────────────────────────── */}
      <div>
        <h2 className="font-poppins font-black text-white text-[14px] uppercase tracking-[0.08em] mb-1">
          Chapter Preparation
        </h2>
        <p className="text-warrior-text font-inter text-[12px] mb-4">
          {s.chapters.length} chapters · colored ring shows your accuracy
        </p>
        <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 shadow-[4px_4px_0px_rgba(255,198,0,0.1)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {s.chapters.map((c, i) => {
              const chapterHref = c.topics && c.topics.length > 0
                ? `/dashboard/analytics/${s.slug}/${slugify(c.name)}`
                : undefined;
              return (
                <MaybeLink key={c.name} href={chapterHref}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    whileHover={{ scale: 1.04 }}
                    className={`flex flex-col items-center rounded-xl p-2 hover:bg-warrior-gray/30 transition-colors ${chapterHref ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="relative">
                      <CircularRing
                        percent={c.accuracy}
                        color={s.color}
                        size={88}
                        strokeWidth={7}
                        delay={i * 0.02}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-mdcat-yellow border-2 border-warrior-black flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.5)]"
                      >
                        <ChevronRight size={10} className="text-warrior-black" strokeWidth={3.5} />
                      </motion.div>
                    </div>
                    <p className="font-poppins font-black text-[11px] text-white text-center leading-tight mt-2 px-1">
                      {c.name}
                    </p>
                    <p className="font-inter text-[10px] text-warrior-text text-center mt-0.5">
                      {c.mcqs} MCQs
                    </p>
                  </motion.div>
                </MaybeLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom back link for convenience */}
      <div className="flex justify-center pt-2">
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-2 bg-dark-charcoal border-2 border-warrior-border hover:border-mdcat-yellow rounded-2xl px-5 py-3 shadow-[3px_3px_0px_rgba(255,198,0,0.1)] font-poppins font-black text-[12px] uppercase tracking-[0.1em] text-white hover:text-mdcat-yellow transition-colors"
        >
          <ArrowLeft size={14} /> Back to Analytics
        </Link>
      </div>

      <div className="h-4" />
    </div>
  );
}

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function MaybeLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (href) return <Link href={href} className="block">{children}</Link>;
  return <>{children}</>;
}

function StatPill({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 bg-warrior-black border-2 border-warrior-border rounded-xl px-3 py-1.5 text-[11px] font-poppins font-black text-white"
      style={color ? { color } : undefined}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

function HighlightCard({
  title,
  chapterName,
  accuracy,
  color,
  icon: Icon,
}: {
  title: string;
  chapterName: string;
  accuracy: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-4 shadow-[3px_3px_0px_rgba(255,198,0,0.08)] flex items-center gap-3"
    >
      <div
        className="w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${color}22`,
          borderColor: `${color}55`,
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-poppins font-black uppercase tracking-[0.15em] text-warrior-text mb-0.5">
          {title}
        </p>
        <p className="font-poppins font-black text-white text-[13px] truncate">
          {chapterName}
        </p>
        <p
          className="font-poppins font-black text-[12px]"
          style={{ color }}
        >
          {accuracy}%
        </p>
      </div>
    </motion.div>
  );
}
