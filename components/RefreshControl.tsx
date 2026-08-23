"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    if (mode !== "auto") return;
    setCountdown(60);

    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, lastFetchedAt]);

  return (
    <div className="rounded-card bg-white p-3 sm:p-3.5 shadow-sb-card border border-sb-border-subtle">
      <div className="flex items-center justify-between gap-2.5">
        {/* Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-pill bg-sb-canvas border border-sb-border-subtle p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onModeChange("auto")}
              className={`relative flex items-center gap-1.5 rounded-pill px-3 py-1.5 font-sans text-xs font-semibold tracking-tight transition-colors duration-150 active:scale-[0.95] ${
                mode === "auto" ? "text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {mode === "auto" && (
                <motion.div
                  layoutId="refresh-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  className="absolute inset-0 rounded-pill bg-sb-accent shadow-sb-pill"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    mode === "auto" ? "bg-white animate-pulse" : "bg-ink-muted"
                  }`}
                />
                Auto
                <span className="hidden xs:inline text-[11px] opacity-80">(60s)</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={`relative flex items-center gap-1.5 rounded-pill px-3 py-1.5 font-sans text-xs font-semibold tracking-tight transition-colors duration-150 active:scale-[0.95] ${
                mode === "manual" ? "text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {mode === "manual" && (
                <motion.div
                  layoutId="refresh-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  className="absolute inset-0 rounded-pill bg-sb-accent shadow-sb-pill"
                />
              )}
              <span className="relative z-10">Manual</span>
            </button>
          </div>

          {/* Auto countdown indicator */}
          {mode === "auto" && (
            <span className="hidden sm:inline-flex items-center rounded-pill bg-sb-light/50 px-2.5 py-1 text-xs font-medium text-sb-green tabular">
              <span>Next update in:</span>
              <span className="ml-1 font-bold">{countdown}s</span>
            </span>
          )}
        </div>

        {/* Right side: Manual Refresh Button & Mobile countdown */}
        <div className="flex items-center gap-2">
          {mode === "auto" && (
            <span className="sm:hidden text-xs font-bold text-sb-green tabular">
              {countdown}s
            </span>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="sb-btn-secondary px-3.5 py-1.5 text-xs"
            title="Fetch updated spot price"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isRefreshing ? "Updating…" : "Refresh"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
