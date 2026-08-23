"use client";

import {
  KARAT_ORDER,
  KARAT_PERCENTAGES,
  type Karat,
} from "@/lib/calculateGoldRate";
import { formatUsd } from "@/lib/format";

const KARAT_LABEL: Record<Karat, string> = {
  24: "24K",
  22: "22K",
  18: "18K",
  14: "14K",
  10: "10K",
  9: "9K",
};

export default function KaratGrid({
  rates,
  unit,
}: {
  rates: Record<Karat, number>;
  unit: "gram" | "tola";
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-vault-600/50 bg-vault-900/60 shadow-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-vault-600/50 px-3.5 py-2.5 sm:px-6 sm:py-4">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-parchment-200/60">
          Karat-wise selling rates
        </p>
        <p className="font-mono text-[10px] sm:text-[11px] text-parchment-200/40">
          USD / {unit === "gram" ? "gram" : "tola"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-vault-600/40">
        {KARAT_ORDER.map((karat) => (
          <div
            key={karat}
            className="fine-grid group bg-vault-900 p-3.5 sm:px-6 sm:py-5 transition-colors duration-200 hover:bg-bullion-500/[0.04]"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display text-lg sm:text-2xl font-medium text-parchment-100">
                {KARAT_LABEL[karat]}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-parchment-200/40 tabular">
                {(KARAT_PERCENTAGES[karat] * 100).toFixed(0)}%
                <span className="hidden xs:inline"> purity</span>
              </span>
            </div>

            <div className="mt-1.5 sm:mt-2 h-1 w-full rounded-full bg-vault-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bullion-600 to-bullion-400 transition-all duration-500"
                style={{ width: `${KARAT_PERCENTAGES[karat] * 100}%` }}
              />
            </div>

            <div className="mt-2 sm:mt-3 font-display italic text-xl sm:text-2xl md:text-3xl text-bullion-400 tabular transition-transform duration-200 group-hover:translate-x-0.5">
              {formatUsd(rates[karat])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
