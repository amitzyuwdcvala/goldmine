"use client";

import { useEffect, useState } from "react";
import { formatTime, formatUsd, secondsAgo } from "@/lib/format";

export default function GoldTicker({
  pricePerOunce,
  timestamp,
  isOverridden,
  flash,
  mode = "manual",
  providerName = "GoldAPI.io",
}: {
  pricePerOunce: number;
  timestamp: string;
  isOverridden: boolean;
  flash: boolean;
  mode?: "auto" | "manual";
  providerName?: string;
}) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-bullion-600/30 bg-vault-900/80 shadow-vault noise-veil">
      <div className="pointer-events-none absolute inset-0 bg-sheen bg-[length:200%_100%] animate-sheenmove opacity-60" />
      <div className="relative p-4 sm:px-8 sm:py-7">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isOverridden ? "bg-ember" : "bg-bullion-500"
                } ${!isOverridden ? "animate-pulseDot" : ""}`}
              />
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-parchment-200/70">
              {isOverridden ? "Manual override" : `XAU / USD · ${providerName}`}
            </span>
          </div>
          <span className="font-mono text-[10px] sm:text-[11px] tracking-wide text-parchment-200/40 tabular">
            {formatTime(timestamp)} UTC &middot; {secondsAgo(timestamp)}s ago
          </span>
        </div>

        <div key={pricePerOunce} className={`mt-2 sm:mt-3 ${flash ? "animate-ticktap" : ""}`}>
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="font-display font-medium italic text-4xl sm:text-5xl md:text-6xl leading-none text-bullion-400 tabular">
              {formatUsd(pricePerOunce)}
            </span>
            <span className="font-mono text-xs sm:text-sm text-parchment-200/50 tracking-wide">
              / troy oz
            </span>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 h-px w-full bg-gradient-to-r from-bullion-600/30 via-bullion-500/10 to-transparent" />

        <p className="mt-2.5 text-[11px] sm:text-[12px] leading-relaxed text-parchment-200/45">
          {mode === "auto"
            ? `Live spot price sourced from ${providerName}, refreshed every 60s.`
            : `Manual mode active (${providerName}). Click Refresh to pull live prices on demand.`}
        </p>
      </div>
    </div>
  );
}
