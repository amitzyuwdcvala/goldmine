"use client";

import { motion } from "framer-motion";

export default function UnitToggle({
  value,
  onChange,
}: {
  value: "gram" | "tola";
  onChange: (v: "gram" | "tola") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-pill bg-white border border-sb-border-subtle p-1 shadow-sb-card">
      {(["gram", "tola"] as const).map((u) => {
        const active = value === u;
        return (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            className={`relative rounded-pill px-3 py-1 font-sans text-xs font-semibold tracking-tight transition-colors duration-150 active:scale-[0.95] ${
              active ? "text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {active && (
              <motion.div
                layoutId="unit-pill"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute inset-0 rounded-pill bg-sb-accent shadow-sb-pill"
              />
            )}
            <span className="relative z-10">per {u}</span>
          </button>
        );
      })}
    </div>
  );
}
