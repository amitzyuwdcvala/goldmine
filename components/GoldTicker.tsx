"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime, formatUsd, secondsAgo } from "@/lib/format";

export default function GoldTicker({
  pricePerOunce,
  timestamp,
  isOverridden,
  flash,
  mode = "auto",
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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[14px] sm:rounded-[18px] bg-sb-house text-white shadow-sb-card border border-sb-dark"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sb-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-sb-gold/15 blur-3xl" />

      <div className="relative p-4 xs:p-5 sm:p-7">
        {/* Top Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isOverridden ? "bg-sb-yellow" : "bg-emerald-400"
                } ${!isOverridden ? "animate-ping opacity-60" : ""}`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isOverridden ? "bg-sb-yellow" : "bg-emerald-400"
                }`}
              />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-sans text-xs font-semibold tracking-tight text-white backdrop-blur-sm">
              {isOverridden ? "Manual Override Active" : `XAU / USD · ${providerName}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-sans text-xs text-chalk-soft">
            <span className="tabular font-medium">{formatTime(timestamp)} UTC</span>
            <span className="text-chalk-muted">&middot;</span>
            <span className="tabular font-medium text-sb-gold-light">{secondsAgo(timestamp)}s ago</span>
          </div>
        </div>

        {/* Live Spot Price Display with Motion */}
        <div className="mt-4 sm:mt-5">
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-sb-gold">
            International Spot Gold Benchmark
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={pricePerOunce}
                initial={{ opacity: 0.4, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.4, y: 4 }}
                transition={{ duration: 0.2 }}
                className="font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white tabular"
              >
                {formatUsd(pricePerOunce)}
              </motion.span>
            </AnimatePresence>
            <span className="font-sans text-xs sm:text-sm md:text-base font-semibold text-chalk-soft">
              USD / troy oz
            </span>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="mt-4 sm:mt-5 h-px w-full bg-white/15" />

        {/* Footer Subtext & Status */}
        <div className="mt-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs text-chalk-soft">
          <p className="text-[11px] sm:text-xs leading-relaxed">
            {mode === "auto"
              ? "Live rates sync with global bullion desks every 60 seconds."
              : `Manual mode enabled (${providerName}). Tap refresh to fetch latest spot rates.`}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-sb-gold/20 border border-sb-gold/40 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-sb-gold-light self-start xs:self-auto flex-shrink-0">
            ★ 99.99% Fine Assay
          </span>
        </div>
      </div>
    </motion.div>
  );
}
