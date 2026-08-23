"use client";

import { motion } from "framer-motion";
import type { Adjustment } from "@/lib/calculateGoldRate";

export default function AdjustmentToggle({
  value,
  onChange,
}: {
  value: Adjustment;
  onChange: (v: Adjustment) => void;
}) {
  const options: Adjustment[] = [35, 50];

  return (
    <div className="rounded-card bg-white p-4 sm:p-5 shadow-sb-card border border-sb-border-subtle">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-sans text-xs sm:text-sm font-bold text-ink">
            Market Situation Adjustment
          </h3>
          <p className="mt-0.5 text-[11px] sm:text-xs text-ink-soft">
            Manual bullion desk spread applied per troy oz.
          </p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Market adjustment"
        className="mt-3.5 grid grid-cols-2 gap-1.5 rounded-pill bg-sb-canvas p-1 border border-sb-border-subtle"
      >
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt)}
              className={`relative flex items-center justify-center gap-1 rounded-pill py-2 sm:py-2.5 text-xs sm:text-sm font-semibold font-sans transition-colors duration-150 active:scale-[0.95] ${
                active ? "text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="adjustment-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  className="absolute inset-0 rounded-pill bg-sb-accent shadow-sb-pill"
                />
              )}
              <span className="relative z-10">+{opt}</span>
              <span className="relative z-10 text-[10px] sm:text-[11px] font-normal opacity-85">USD/oz</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
