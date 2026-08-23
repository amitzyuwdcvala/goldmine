"use client";

import { motion, type Variants } from "framer-motion";
import {
  KARAT_ORDER,
  KARAT_PERCENTAGES,
  type Karat,
} from "@/lib/calculateGoldRate";
import { formatUsd } from "@/lib/format";

const KARAT_LABEL: Record<Karat, string> = {
  24: "24 Karat",
  22: "22 Karat",
  18: "18 Karat",
  14: "14 Karat",
  10: "10 Karat",
  9: "9 Karat",
};

const KARAT_SUBTITLE: Record<Karat, string> = {
  24: "99.9% Pure Bullion",
  22: "91.6% Fine Jewelry",
  18: "75.0% Standard Craft",
  14: "58.5% Commercial Grade",
  10: "41.7% Minimum Standard",
  9: "37.5% Traditional Alloy",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function KaratGrid({
  rates,
  unit,
}: {
  rates: Record<Karat, number>;
  unit: "gram" | "tola";
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      {KARAT_ORDER.map((karat) => {
        const isTopTier = karat === 24 || karat === 22;
        const percentage = (KARAT_PERCENTAGES[karat] * 100).toFixed(1);

        return (
          <motion.div
            key={karat}
            variants={cardVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={`group relative overflow-hidden rounded-card bg-white p-4 sm:p-5 shadow-sb-card border transition-all duration-200 hover:shadow-sb-card-hover ${
              isTopTier
                ? "border-sb-gold/50 hover:border-sb-gold"
                : "border-sb-border-subtle hover:border-sb-accent/40"
            }`}
          >
            {/* Top Color Accent Strip */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                karat === 24
                  ? "bg-gradient-to-r from-sb-gold to-amber-300"
                  : karat === 22
                  ? "bg-sb-gold"
                  : "bg-sb-accent"
              }`}
            />

            {/* Header: Karat Tag + Pill */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink">
                    {karat}K
                  </span>
                  <span className="text-xs font-semibold text-ink-soft">
                    {KARAT_LABEL[karat].replace(`${karat} `, "")}
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  {KARAT_SUBTITLE[karat]}
                </p>
              </div>

              {/* Status Pill */}
              <span
                className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold ${
                  isTopTier
                    ? "bg-sb-gold-lightest text-sb-gold border border-sb-gold/30"
                    : "bg-sb-light/50 text-sb-green border border-sb-green/20"
                }`}
              >
                {isTopTier && <span>★</span>}
                <span>{percentage}%</span>
              </span>
            </div>

            {/* Purity Progress Bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-sb-canvas overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isTopTier
                    ? "bg-gradient-to-r from-sb-gold to-amber-400"
                    : "bg-sb-accent"
                }`}
              />
            </div>

            {/* Rate Calculation Output */}
            <div className="mt-4 pt-3 border-t border-sb-canvas flex items-baseline justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Selling Rate
                </span>
                <div className="font-serif text-xl xs:text-2xl sm:text-3xl font-bold text-ink tracking-tight tabular group-hover:text-sb-green transition-colors">
                  {formatUsd(rates[karat])}
                </div>
              </div>

              <span className="rounded-md bg-sb-canvas px-2 py-0.5 font-sans text-xs font-semibold text-ink-soft">
                / {unit === "gram" ? "gram" : "tola"}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
