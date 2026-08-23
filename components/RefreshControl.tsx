"use client";

import { useEffect, useState } from "react";

export type RefreshMode = "auto" | "manual";

interface RefreshControlProps {
  mode: RefreshMode;
  onModeChange: (mode: RefreshMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastFetchedAt: string | null;
}

export default function RefreshControl({
  mode,
  onModeChange,
  onRefresh,
  isRefreshing,
  lastFetchedAt,
}: RefreshControlProps) {
  const [countdown, setCountdown] = useState(60);

  // Reset & tick countdown when in auto mode and when refreshed
  useEffect(() => {
    if (mode !== "auto") return;

    // Reset countdown when lastFetchedAt changes
    setCountdown(60);

    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, lastFetchedAt]);

  return (
    <div className="rounded-xl border border-vault-700/60 bg-vault-900/80 p-2.5 sm:p-3 shadow-card backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-vault-600/60 bg-vault-950/90 p-0.5 sm:p-1">
            <button
              type="button"
              onClick={() => onModeChange("auto")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-200 ${
                mode === "auto"
                  ? "bg-gradient-to-r from-bullion-600 to-bullion-500 text-vault-950 font-semibold shadow-[0_2px_8px_-2px_rgba(212,175,55,0.4)]"
                  : "text-parchment-200/40 hover:text-parchment-100"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  mode === "auto" ? "bg-vault-950 animate-pulseDot" : "bg-parchment-200/30"
                }`}
              />
              Auto
              <span className="hidden xs:inline sm:inline text-[9px] opacity-75">(60s)</span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-200 ${
                mode === "manual"
                  ? "bg-gradient-to-r from-bullion-600 to-bullion-500 text-vault-950 font-semibold shadow-[0_2px_8px_-2px_rgba(212,175,55,0.4)]"
                  : "text-parchment-200/40 hover:text-parchment-100"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  mode === "manual" ? "bg-vault-950" : "bg-parchment-200/30"
                }`}
              />
              Manual
            </button>
          </div>

          {/* Auto countdown indicator */}
          {mode === "auto" && (
            <span className="hidden sm:inline-flex items-center font-mono text-[11px] text-parchment-200/40 tabular">
              <span>Next:</span>
              <span className="ml-1 font-semibold text-bullion-400">{countdown}s</span>
            </span>
          )}
        </div>

        {/* Right side: Manual Refresh Button & Mobile countdown */}
        <div className="flex items-center gap-2">
          {mode === "auto" && (
            <span className="sm:hidden font-mono text-[10px] text-bullion-400/90 font-medium tabular">
              {countdown}s
            </span>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-bullion-600/40 bg-vault-950/90 px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-bullion-400 transition-all duration-200 hover:border-bullion-500 hover:bg-bullion-500/10 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            title="Force refresh live gold spot price"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-bullion-400 transition-transform ${
                isRefreshing ? "animate-spin" : ""
              }`}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isRefreshing ? "Updating" : "Refresh"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
