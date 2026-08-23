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
  const [refreshMode, setRefreshMode] = useState<RefreshMode>("auto");
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

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

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
    <div className="min-h-screen bg-sb-canvas text-ink flex flex-col justify-between selection:bg-sb-light selection:text-sb-green">
      {/* ── Global Flagship Navigation Bar ─────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-sb-border-subtle bg-white/95 backdrop-blur-md shadow-sb-nav">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3.5 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Starbucks Emblem */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sb-green text-white shadow-sm flex-shrink-0">
              <span className="font-serif font-bold text-sm">Au</span>
            </div>
            <div>
              <h1 className="font-sans text-base sm:text-lg font-bold tracking-tight text-sb-green">
                Aurum Desk
              </h1>
              <p className="hidden xs:block text-[11px] font-medium text-ink-soft">
                Live Gold Rate Calculator &middot; Purity Exchange
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Feed Status Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-pill bg-sb-light/50 border border-sb-green/20 px-3 py-1 text-xs font-semibold text-sb-green">
              <span className="h-2 w-2 rounded-full bg-sb-accent animate-pulse" />
              <span>Live Market Active</span>
            </span>

            {/* Admin Desk Pill CTA */}
            <Link
              href="/admin"
              className="sb-btn-secondary px-3.5 py-1.5 text-xs sm:text-sm"
              title="Open Provider & API Desk"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-3.5 w-3.5 mr-1.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Admin Desk</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main Page Content ─────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-5xl px-3.5 py-5 sm:px-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Refresh Mode Switch & Controls */}
        <RefreshControl
          mode={refreshMode}
          onModeChange={setRefreshMode}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          lastFetchedAt={feed.status === "ready" ? feed.timestamp : null}
        />

        {/* Hero Gold Ticker (House Green Band) */}
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
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
          <AdjustmentToggle value={adjustment} onChange={setAdjustment} />
          <ManualOverride value={override} onChange={setOverride} />
        </div>

        {/* Karat Selling Rates Header + Unit Pill */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink">
              Karat Selling Rates
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Live calculated rates based on international purity standards.
            </p>
          </div>
          <UnitToggle value={unit} onChange={setUnit} />
        </div>

        {/* Responsive Karat Grid */}
        <div>
          {displayRates ? (
            <KaratGrid rates={displayRates} unit={unit} />
          ) : (
            <GridSkeleton />
          )}
        </div>
      </main>

      {/* ── Signature Floating "Frap" Circular Order/Refresh Action Button ────────── */}
      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        className="frap-floating-btn group"
        title="Instant spot price refresh"
        aria-label="Instant spot price refresh"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-6 w-6 text-white transition-transform duration-300 ${
            isRefreshing ? "animate-spin" : "group-hover:rotate-45"
          }`}
        >
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      </button>

      {/* ── Starbucks House Green Feature Footer ──────────────────────── */}
      <footer className="mt-12 bg-sb-house text-white border-t border-sb-dark py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-white">Aurum Desk</span>
              <span className="rounded-pill bg-sb-gold/20 border border-sb-gold/40 px-2.5 py-0.5 text-[10px] font-semibold text-sb-gold-light">
                Flagship Edition
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-xs text-chalk-soft leading-relaxed">
              Rates are indicative and derived from live international spot bullion prices plus a standard market situation adjustment and nominal handling additions.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-chalk-soft">
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Console
            </Link>
            <span>&middot;</span>
            <a
              href="https://goldapi.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
