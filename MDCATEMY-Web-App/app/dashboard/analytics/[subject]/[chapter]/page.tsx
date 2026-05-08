"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Target, TrendingUp, TrendingDown } from "lucide-react";
import { SUBJECTS } from "@/lib/analytics-data";
import { CircularRing } from "@/components/dashboard/CircularRing";

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function ChapterTopicsPage({
  params,
}: {
  params: Promise<{ subject: string; chapter: string }>;
}) {
  const { subject, chapter } = use(params);
  const s = SUBJECTS.find((x) => x.slug === subject);
  if (!s) notFound();

  const c = s.chapters.find((ch) => slugify(ch.name) === chapter);
  if (!c || !c.topics || c.topics.length === 0) notFound();

  const sorted = [...c.topics].sort((a, b) => a.accuracy - b.accuracy);
  const avg = Math.round(
    c.topics.reduce((sum, t) => sum + t.accuracy, 0) / c.topics.length
  );
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-5xl mx-auto">

      {/* ── BACK NAV ──────────────────────────────── */}
      <Link
        href={`/dashboard/analytics/${subject}`}
        className="inline-flex items-center gap-2 text-warrior-text hover:text-mdcat-yellow transition-colors font-poppins font-black text-[12px] uppercase tracking-[0.1em] group"
      >
        <div className="w-7 h-7 bg-dark-charcoal border-2 border-warrior-border group-hover:border-mdcat-yellow rounded-lg flex items-center justify-center transition-colors">
          <ArrowLeft size={14} />
        </div>
        Back to {s.name}
      </Link>

      {/* ── CHAPTER HEADER ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 shadow-[4px_4px_0px_rgba(255,198,0,0.12)] flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="shrink-0">
          <CircularRing
            percent={c.accuracy}
            color={s.color}
            size={120}
            strokeWidth={11}
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[10px] font-poppins font-black uppercase tracking-[0.18em] text-warrior-text mb-1">
            Chapter Overview
          </p>
          <h1 className="font-poppins font-black text-white text-3xl mb-3">
            {c.name}
          </h1>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <StatPill icon={BookOpen} label={`${c.topics.length} topics`} />
            <StatPill icon={Target} label={`${c.mcqs} MCQs done`} />
            <StatPill icon={TrendingUp} label={`Avg ${avg}%`} color={s.color} />
          </div>
        </div>
      </motion.div>

      {/* ── HIGHLIGHTS ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <HighlightCard
          title="Strongest"
          itemName={strongest.name}
          accuracy={strongest.accuracy}
          color="#10B981"
          icon={TrendingUp}
        />
        <HighlightCard
          title="Needs Work"
          itemName={weakest.name}
          accuracy={weakest.accuracy}
          color="#EF4444"
          icon={TrendingDown}
        />
      </div>

      {/* ── TOPICS GRID ───────────────────────────── */}
      <div>
        <h2 className="font-poppins font-black text-white text-[14px] uppercase tracking-[0.08em] mb-1">
          Topic Preparation
        </h2>
        <p className="text-warrior-text font-inter text-[12px] mb-4">
          {c.topics.length} topics · colored ring shows your accuracy
        </p>
        <div className="bg-dark-charcoal border-2 border-warrior-border rounded-2xl p-5 shadow-[4px_4px_0px_rgba(255,198,0,0.1)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {c.topics.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.04 }}
                className="flex flex-col items-center rounded-xl p-2 hover:bg-warrior-gray/30 transition-colors"
              >
                <CircularRing
                  percent={t.accuracy}
                  color={s.color}
                  size={88}
                  strokeWidth={7}
                  delay={i * 0.05}
                />
                <p className="font-poppins font-black text-[11px] text-white text-center leading-tight mt-2 px-1">
                  {t.name}
                </p>
                <p className="font-inter text-[10px] text-warrior-text text-center mt-0.5">
                  {t.accuracy}% accuracy
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom back link */}
      <div className="flex justify-center pt-2">
        <Link
          href={`/dashboard/analytics/${subject}`}
          className="inline-flex items-center gap-2 bg-dark-charcoal border-2 border-warrior-border hover:border-mdcat-yellow rounded-2xl px-5 py-3 shadow-[3px_3px_0px_rgba(255,198,0,0.1)] font-poppins font-black text-[12px] uppercase tracking-[0.1em] text-white hover:text-mdcat-yellow transition-colors"
        >
          <ArrowLeft size={14} /> Back to {s.name}
        </Link>
      </div>

      <div className="h-4" />
    </div>
  );
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
  itemName,
  accuracy,
  color,
  icon: Icon,
}: {
  title: string;
  itemName: string;
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
        style={{ backgroundColor: `${color}22`, borderColor: `${color}55` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-poppins font-black uppercase tracking-[0.15em] text-warrior-text mb-0.5">
          {title}
        </p>
        <p className="font-poppins font-black text-white text-[13px] truncate">
          {itemName}
        </p>
        <p className="font-poppins font-black text-[12px]" style={{ color }}>
          {accuracy}%
        </p>
      </div>
    </motion.div>
  );
}
