"use client";

import { motion } from "framer-motion";

type Props = {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  delay?: number;
};

export function CircularRing({
  percent,
  color,
  size = 104,
  strokeWidth = 9,
  label,
  subLabel,
  delay = 0,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgb(var(--warrior-border-rgb))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut", delay }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-poppins font-black"
            style={{
              color,
              fontSize: size < 90 ? "13px" : size < 110 ? "15px" : "18px",
            }}
          >
            {percent}%
          </span>
        </div>
      </div>
      {label && (
        <p className="font-poppins font-black text-[12px] text-white text-center leading-tight px-1">
          {label}
        </p>
      )}
      {subLabel && (
        <p className="font-inter text-[10px] text-warrior-text text-center">
          {subLabel}
        </p>
      )}
    </div>
  );
}
