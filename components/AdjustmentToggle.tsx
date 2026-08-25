"use client";

import type { Adjustment } from "@/lib/calculateGoldRate";

export default function AdjustmentToggle({
  value,
  onChange,
}: {
  value: Adjustment;
  onChange: (v: Adjustment) => void;
}) {
  const options: Adjustment[] = [35, 50, 100, 150];

  return (
    <div className="rounded-xl sm:rounded-2xl border border-vault-600/50 bg-vault-900/60 p-3.5 sm:p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-parchment-200/60">
            World situation adjustment
          </p>
          <p className="mt-0.5 text-[11px] sm:text-[13px] text-parchment-200/40">
            Manual desk toggle applied per troy oz.
          </p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="World situation adjustment"
        className="relative mt-3 grid grid-cols-2 xs:grid-cols-4 gap-1 rounded-xl border border-vault-600/60 bg-vault-950/70 p-1"
      >
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt)}
              className={`relative rounded-lg px-2.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium font-mono transition-all duration-200 focus-visible:outline-none ${
                active
                  ? "bg-gradient-to-b from-bullion-500 to-bullion-600 text-vault-950 shadow-[0_4px_16px_-4px_rgba(212,175,55,0.5)]"
                  : "text-parchment-200/50 hover:text-parchment-100 hover:bg-vault-800/60"
              }`}
            >
              +{opt}
              <span className="ml-1 text-[9px] sm:text-[10px] font-normal opacity-75">USD/oz</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
