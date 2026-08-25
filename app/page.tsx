"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import GoldTicker from "@/components/GoldTicker";
import AdjustmentToggle from "@/components/AdjustmentToggle";
import ManualOverride from "@/components/ManualOverride";
import KaratGrid from "@/components/KaratGrid";
import UnitToggle from "@/components/UnitToggle";
import ErrorPanel from "@/components/ErrorPanel";
import RefreshControl, { type RefreshMode } from "@/components/RefreshControl";
import { TickerSkeleton, GridSkeleton } from "@/components/Skeleton";
import {
  calculateAllKaratRates,
  perGramToPerTola,
  type Adjustment,
  type Karat,
} from "@/lib/calculateGoldRate";

type FeedState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; pricePerOunce: number; timestamp: string; providerName?: string };

const POLL_MS = 60_000;

export default function Page() {
  const [feed, setFeed] = useState<FeedState>({ status: "loading" });
  const [adjustment, setAdjustment] = useState<Adjustment>(35);
  const [override, setOverride] = useState("");
  const [unit, setUnit] = useState<"gram" | "tola">("gram");
  const [flash, setFlash] = useState(false);
  const [refreshMode, setRefreshMode] = useState<RefreshMode>("manual");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastPrice = useRef<number | null>(null);

  const fetchPrice = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      const url = force ? "/api/gold-price?force=true" : "/api/gold-price";
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        setFeed({
          status: "error",
          message: json.message || "The live gold price feed is unavailable right now.",
        });
        return;
      }

      setFeed({
        status: "ready",
        pricePerOunce: json.pricePerOunce,
        timestamp: json.timestamp,
        providerName: json.provider?.name,
      });

      if (lastPrice.current !== null && lastPrice.current !== json.pricePerOunce) {
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
      }
      lastPrice.current = json.pricePerOunce;
    } catch {
      setFeed({
        status: "error",
        message: "Could not reach the pricing service. Check your connection and try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Set up polling only in auto mode
  useEffect(() => {
    if (refreshMode !== "auto") return;
    const id = setInterval(() => {
      fetchPrice(false);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refreshMode, fetchPrice]);

  const handleManualRefresh = () => {
    fetchPrice(true);
  };

  const overrideValue = override.trim() === "" ? null : Number(override);
  const isOverridden = overrideValue !== null && Number.isFinite(overrideValue) && overrideValue > 0;

  const effectivePrice = isOverridden
    ? (overrideValue as number)
    : feed.status === "ready"
    ? feed.pricePerOunce
    : null;

  const displayTimestamp =
    feed.status === "ready" ? feed.timestamp : new Date().toISOString();

  const rates =
    effectivePrice !== null
      ? calculateAllKaratRates(effectivePrice, adjustment)
      : null;

  const displayRates: Record<Karat, number> | null = rates
    ? unit === "tola"
    ? (Object.fromEntries(
          Object.entries(rates).map(([k, v]) => [k, perGramToPerTola(v)])
        ) as Record<Karat, number>)
      : rates
    : null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-3.5 py-5 sm:px-6 sm:py-14">
        {/* Header */}
        <header className="mb-4 sm:mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-bullion-500/80">
              Aurum Desk
            </p>
            <h1 className="mt-0.5 font-display text-xl font-medium text-parchment-100 sm:text-3xl">
              Live Gold Rate Calculator
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-bullion-600/30 bg-vault-900/60 px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[10px] sm:text-[11px] text-parchment-200/50">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  refreshMode === "auto" ? "bg-bullion-500 animate-pulseDot" : "bg-ember"
                }`}
              />
              <span className="hidden xs:inline">
                {refreshMode === "auto" ? "Auto Feed Active" : "Manual Feed Active"}
              </span>
              <span className="xs:hidden">
                {refreshMode === "auto" ? "Auto" : "Manual"}
              </span>
            </span>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-vault-700 bg-vault-900/80 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-parchment-200/70 hover:text-bullion-400 hover:border-bullion-500/50 transition-colors"
              title="Open Admin Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3 w-3"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Admin</span>
            </Link>
          </div>
        </header>

        {/* Refresh Mode Switch & On-demand Refresh Trigger */}
        <div className="mb-3 sm:mb-6">
          <RefreshControl
            mode={refreshMode}
            onModeChange={setRefreshMode}
            onRefresh={handleManualRefresh}
            isRefreshing={isRefreshing}
            lastFetchedAt={feed.status === "ready" ? feed.timestamp : null}
          />
        </div>

        {feed.status === "loading" ? (
          <TickerSkeleton />
        ) : feed.status === "error" && !isOverridden ? (
          <ErrorPanel message={feed.message} onRetry={handleManualRefresh} />
        ) : effectivePrice !== null ? (
          <GoldTicker
            pricePerOunce={effectivePrice}
            timestamp={displayTimestamp}
            isOverridden={isOverridden}
            flash={flash}
            mode={refreshMode}
            providerName={feed.status === "ready" ? feed.providerName : "GoldAPI.io"}
          />
        ) : (
          <TickerSkeleton />
        )}

        {/* Desk Controls (Adjustment + Override) */}
        <div className="mt-3 sm:mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4">
          <AdjustmentToggle value={adjustment} onChange={setAdjustment} />
          <ManualOverride value={override} onChange={setOverride} />
        </div>

        {/* Rates Header with Unit Switcher */}
        <div className="mt-5 sm:mt-8 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-parchment-200/50">
              Selling rates
            </p>
            <span className="inline-flex items-center rounded-full bg-bullion-500/10 border border-bullion-500/20 px-2 py-0.5 font-mono text-[9px] sm:text-[10px] text-bullion-400/90 font-medium">
              $10 labour already added
            </span>
          </div>
          <UnitToggle value={unit} onChange={setUnit} />
        </div>

        {/* 2-Column Responsive Karat Grid */}
        <div className="mt-2.5 sm:mt-3">
          {displayRates ? (
            <KaratGrid rates={displayRates} unit={unit} />
          ) : (
            <GridSkeleton />
          )}
        </div>

        <footer className="mt-6 sm:mt-10 border-t border-vault-700/50 pt-4 sm:pt-6">
          <p className="max-w-2xl text-[11px] sm:text-[12px] leading-relaxed text-parchment-200/35">
            Rates are indicative and derived from a live international spot
            price plus a manual world-situation adjustment and a flat $10
            handling addition. They do not constitute a firm offer to buy or
            sell.
          </p>
        </footer>
      </div>
    </main>
  );
}
