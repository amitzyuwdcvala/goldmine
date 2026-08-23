"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { ProviderId } from "@/lib/providers";
import { formatUsd } from "@/lib/format";

/* ── Types ──────────────────────────────────────────────── */

interface ProviderItem {
  id: ProviderId;
  name: string;
  website: string;
  limits: string;
  description: string;
  keyPlaceholder: string;
  envKeyName: string;
  docsUrl: string;
  isActive: boolean;
  hasKey: boolean;
  maskedKey: string;
  rawKey: string;
  updatedAt?: string;
}

interface TestResult {
  loading: boolean;
  success?: boolean;
  pricePerOunce?: number;
  latencyMs?: number;
  error?: string;
}

/* ── Inline SVG icon components ─────────────────────────── */

function IconPulse({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function IconExternal({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconEye({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconArrowLeft({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconLogout({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />;
}

/* ── Page Component ─────────────────────────────────────── */

export default function AdminPage() {
  /* Auth state */
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("admin@aurumdesk.com");
  const [password, setPassword] = useState("admin");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionMessage, setProvisionMessage] = useState("");

  /* Providers */
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<ProviderId>("goldapi");
  const [fromDb, setFromDb] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  /* Per-provider edit state */
  const [editingKeys, setEditingKeys] = useState<Record<ProviderId, string>>({
    goldapi: "", goldprice: "", metals_dev: "", metalprice: "",
  });
  const [showKeys, setShowKeys] = useState<Record<ProviderId, boolean>>({
    goldapi: false, goldprice: false, metals_dev: false, metalprice: false,
  });
  const [savingKey, setSavingKey] = useState<Record<ProviderId, boolean>>({
    goldapi: false, goldprice: false, metals_dev: false, metalprice: false,
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<Record<ProviderId, string>>({
    goldapi: "", goldprice: "", metals_dev: "", metalprice: "",
  });

  /* Test results */
  const [testResults, setTestResults] = useState<Record<ProviderId, TestResult>>({
    goldapi: { loading: false }, goldprice: { loading: false },
    metals_dev: { loading: false }, metalprice: { loading: false },
  });

  /* SQL panel */
  const [showSql, setShowSql] = useState(false);

  /* ── Auth ────────────────────────────────────────────── */

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSessionUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Fetch providers ─────────────────────────────────── */

  const fetchProviders = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/providers", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.providers) {
        setProviders(data.providers);
        setActiveProviderId(data.activeProviderId);
        setFromDb(data.fromDb);
        const keys: Record<ProviderId, string> = {
          goldapi: "", goldprice: "", metals_dev: "", metalprice: "",
        };
        data.providers.forEach((p: ProviderItem) => { keys[p.id] = p.rawKey || ""; });
        setEditingKeys(keys);
      }
    } catch { /* ignore */ } finally { setLoadingData(false); }
  }, []);

  useEffect(() => { if (sessionUser) fetchProviders(); }, [sessionUser, fetchProviders]);

  /* ── Auto-provision ──────────────────────────────────── */

  const handleAutoProvision = async () => {
    setIsProvisioning(true); setLoginError(""); setProvisionMessage("");
    try {
      const res = await fetch("/api/admin/setup-credentials", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) {
        setEmail(json.email); setPassword(json.password);
        setProvisionMessage("Credentials ready — signing you in…");
        const { data, error } = await supabase.auth.signInWithPassword({ email: json.email, password: json.password });
        if (error) setLoginError(error.message);
        else if (data.user) setSessionUser(data.user);
      } else { setLoginError(json.message || "Provisioning failed."); }
    } catch (e: any) { setLoginError(e.message || "Connection error"); }
    finally { setIsProvisioning(false); }
  };

  /* ── Login ───────────────────────────────────────────── */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError(""); setIsLoggingIn(true);
    try {
      let { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error && email.trim() === "admin@aurumdesk.com") {
        const p = await fetch("/api/admin/setup-credentials", { method: "POST" });
        if (p.ok) {
          const r = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          data = r.data; error = r.error;
        }
      }
      if (error) setLoginError(error.message);
      else if (data.user) setSessionUser(data.user);
    } catch (e: any) { setLoginError(e.message || "Sign-in failed."); }
    finally { setIsLoggingIn(false); }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); setSessionUser(null); };

  /* ── Provider actions ────────────────────────────────── */

  const handleSetActive = async (id: ProviderId) => {
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: id, is_active: true }),
      });
      if (res.ok) {
        setActiveProviderId(id);
        setProviders(ps => ps.map(p => ({ ...p, isActive: p.id === id })));
      }
    } catch (e: any) { alert("Failed: " + e.message); }
  };

  const handleSaveKey = async (id: ProviderId) => {
    setSavingKey(s => ({ ...s, [id]: true }));
    setSaveSuccessMsg(s => ({ ...s, [id]: "" }));
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: id, api_key: editingKeys[id] }),
      });
      if (res.ok) {
        setSaveSuccessMsg(s => ({ ...s, [id]: "Saved" }));
        setTimeout(() => setSaveSuccessMsg(s => ({ ...s, [id]: "" })), 2500);
        fetchProviders();
      } else { const j = await res.json(); alert("Save failed: " + j.message); }
    } catch (e: any) { alert("Error: " + e.message); }
    finally { setSavingKey(s => ({ ...s, [id]: false })); }
  };

  const handleTestProvider = async (id: ProviderId) => {
    setTestResults(s => ({ ...s, [id]: { loading: true } }));
    try {
      const res = await fetch("/api/admin/test", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: id, apiKey: editingKeys[id] }),
      });
      const d = await res.json();
      setTestResults(s => ({ ...s, [id]: { loading: false, success: d.success, pricePerOunce: d.pricePerOunce, latencyMs: d.latencyMs, error: d.error } }));
    } catch (e: any) {
      setTestResults(s => ({ ...s, [id]: { loading: false, success: false, error: e.message } }));
    }
  };

  /* ═══════════════════════════════════════════════════════
     RENDER — Loading
     ═══════════════════════════════════════════════════════ */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Spinner className="w-5 h-5 text-bullion-500" />
          <span className="text-sm text-parchment-200/60">Verifying session…</span>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     RENDER — Login
     ═══════════════════════════════════════════════════════ */

  if (!sessionUser) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="rounded-2xl bg-vault-900/70 border border-vault-700/50 p-6 xs:p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">
            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-bullion-500 to-bullion-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0A0906" strokeWidth="2.5" className="h-4.5 w-4.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-parchment-100 leading-tight">Admin</h1>
                <p className="text-[11px] text-parchment-200/40 leading-tight">Aurum Desk Console</p>
              </div>
            </div>

            {/* Alerts */}
            {provisionMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-bullion-500/10 border border-bullion-600/30 px-3 py-2.5">
                <IconCheck className="w-3.5 h-3.5 text-bullion-400 flex-shrink-0" />
                <p className="text-xs text-bullion-400">{provisionMessage}</p>
              </div>
            )}
            {loginError && (
              <div className="mb-4 rounded-lg bg-red-500/8 border border-red-400/20 px-3 py-2.5">
                <p className="text-xs text-red-300/90">{loginError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-parchment-200/50 mb-1.5">Email</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-vault-600/80 bg-vault-950/80 px-3 py-2.5 text-sm text-parchment-100 placeholder:text-parchment-200/25 outline-none focus:border-bullion-500/60 focus:ring-1 focus:ring-bullion-500/20 transition-all"
                  placeholder="admin@aurumdesk.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-parchment-200/50 mb-1.5">Password</label>
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-vault-600/80 bg-vault-950/80 px-3 py-2.5 text-sm text-parchment-100 placeholder:text-parchment-200/25 outline-none focus:border-bullion-500/60 focus:ring-1 focus:ring-bullion-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit" disabled={isLoggingIn || isProvisioning}
                className="w-full rounded-lg bg-bullion-500 py-2.5 text-sm font-semibold text-vault-950 shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all hover:bg-bullion-400 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoggingIn ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-5 mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-vault-700/50" /></div>
              <div className="relative flex justify-center"><span className="bg-vault-900/70 px-2.5 text-[11px] text-parchment-200/30">or</span></div>
            </div>

            {/* Auto setup */}
            <button
              type="button" onClick={handleAutoProvision}
              disabled={isProvisioning || isLoggingIn}
              className="w-full rounded-lg border border-vault-600/60 bg-vault-800/50 py-2.5 text-xs font-medium text-parchment-200/70 transition-all hover:bg-vault-800 hover:text-parchment-100 active:scale-[0.99] disabled:opacity-50"
            >
              {isProvisioning ? "Setting up…" : "Quick setup with default credentials"}
            </button>

            {/* Hint */}
            <p className="mt-4 text-center text-[11px] text-parchment-200/30 leading-relaxed">
              Default: <span className="text-parchment-200/50">admin@aurumdesk.com</span> / <span className="text-parchment-200/50">admin</span>
            </p>
          </div>

          {/* Back link */}
          <div className="mt-5 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-parchment-200/40 hover:text-parchment-200/70 transition-colors">
              <IconArrowLeft className="w-3 h-3" />
              Back to calculator
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ═══════════════════════════════════════════════════════
     RENDER — Dashboard
     ═══════════════════════════════════════════════════════ */

  const activeProvider = providers.find(p => p.id === activeProviderId);
  const activeTest = testResults[activeProviderId];

  return (
    <main className="min-h-dvh pb-12 xs:pb-16">
      {/* ── Top bar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-vault-700/40 bg-vault-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3 xs:px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-bullion-500 to-bullion-700 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0A0906" strokeWidth="2.5" className="h-4 w-4">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-parchment-100 truncate sm:text-base">Provider Settings</h1>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${fromDb ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className="text-[10px] text-parchment-200/40 truncate sm:text-[11px]">
                  {fromDb ? "Supabase connected" : "Local fallback"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
            <span className="hidden sm:block text-xs text-parchment-200/40 truncate max-w-[160px]">
              {sessionUser.email}
            </span>
            <Link
              href="/"
              className="hidden xs:inline-flex items-center gap-1.5 rounded-lg border border-vault-700/60 px-2.5 py-1.5 text-[11px] font-medium text-parchment-200/60 hover:text-parchment-100 hover:border-vault-600 transition-colors sm:text-xs"
            >
              <IconArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Calculator</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-vault-700/60 px-2.5 py-1.5 text-[11px] font-medium text-parchment-200/60 hover:text-red-300/80 hover:border-red-400/30 transition-colors sm:text-xs"
            >
              <IconLogout className="w-3 h-3" />
              <span className="hidden xs:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 xs:px-5 sm:px-6">
        {/* ── Active Provider Hero ────────────────────────── */}
        <div className="mt-5 xs:mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-bullion-600/25 bg-gradient-to-br from-vault-900/90 via-vault-900/70 to-vault-800/50 p-4 xs:p-5 sm:p-6 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-bullion-500/8 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bullion-400 opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-bullion-500" /></span>
                <span className="text-[11px] font-medium text-bullion-400/80 xs:text-xs">Active source</span>
              </div>
              <h2 className="text-xl font-semibold text-parchment-100 xs:text-2xl sm:text-[28px] truncate">
                {activeProvider?.name || activeProviderId}
              </h2>
              <p className="mt-1 text-xs text-parchment-200/45 leading-relaxed max-w-lg line-clamp-2 sm:text-[13px]">
                {activeProvider?.description}
              </p>
            </div>

            <button
              onClick={() => handleTestProvider(activeProviderId)}
              disabled={activeTest?.loading}
              className="self-start sm:self-center flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-bullion-500/12 border border-bullion-500/25 px-3.5 py-2 xs:px-4 xs:py-2.5 text-xs font-medium text-bullion-400 transition-all hover:bg-bullion-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {activeTest?.loading ? <Spinner className="w-3.5 h-3.5" /> : <IconPulse className="w-3.5 h-3.5" />}
              Test connection
            </button>
          </div>

          {/* Test result inline */}
          {activeTest?.success && activeTest.pricePerOunce && (
            <div className="relative mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-vault-950/50 border border-bullion-600/20 px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-bullion-400">
                <IconCheck className="w-3 h-3" /> {formatUsd(activeTest.pricePerOunce)}<span className="text-parchment-200/40 font-normal">/oz</span>
              </span>
              <span className="text-[11px] text-parchment-200/35 tabular">{activeTest.latencyMs}ms</span>
            </div>
          )}
          {activeTest?.error && (
            <div className="relative mt-3.5 rounded-lg bg-red-500/8 border border-red-400/20 px-3 py-2.5 text-xs text-red-300/90">
              {activeTest.error}
            </div>
          )}
        </div>

        {/* ── Section header ─────────────────────────────── */}
        <div className="mt-6 xs:mt-8 sm:mt-10 mb-3 xs:mb-4">
          <h3 className="text-sm font-semibold text-parchment-100 sm:text-base">All providers</h3>
          <p className="mt-0.5 text-xs text-parchment-200/40 sm:text-[13px]">
            Manage API keys and switch the active pricing source.
          </p>
        </div>

        {/* ── Provider Cards ─────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 xs:gap-4 md:grid-cols-2">
          {providers.map(p => {
            const isActive = p.id === activeProviderId;
            const isSaving = savingKey[p.id];
            const test = testResults[p.id];
            const saved = saveSuccessMsg[p.id];

            return (
              <div
                key={p.id}
                className={`group rounded-xl border p-4 xs:p-5 transition-all duration-200 ${
                  isActive
                    ? "border-bullion-500/40 bg-vault-900/80 shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_8px_32px_-8px_rgba(0,0,0,0.4)]"
                    : "border-vault-700/40 bg-vault-900/40 hover:border-vault-600/60 hover:bg-vault-900/60"
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-semibold text-parchment-100 xs:text-lg">
                        {p.name}
                      </h4>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-bullion-500/15 px-2 py-0.5 text-[10px] font-semibold text-bullion-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-bullion-500" />
                          Active
                        </span>
                      )}
                    </div>
                    <a href={p.website} target="_blank" rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-parchment-200/40 hover:text-bullion-400/80 transition-colors xs:text-xs"
                    >
                      {p.website.replace("https://", "")}
                      <IconExternal className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                    </a>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => handleSetActive(p.id)}
                      className="flex-shrink-0 rounded-lg border border-vault-600/70 px-2.5 py-1.5 text-[11px] font-medium text-parchment-200/60 transition-all hover:border-bullion-500/50 hover:text-bullion-400 active:scale-[0.97] xs:text-xs"
                    >
                      Activate
                    </button>
                  )}
                </div>

                {/* Limits badge */}
                <div className="mt-2.5 xs:mt-3">
                  <span className="inline-block rounded-md bg-vault-950/60 border border-vault-700/40 px-2 py-0.5 text-[10px] text-parchment-200/50 xs:text-[11px]">
                    {p.limits}
                  </span>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-parchment-200/40 line-clamp-2 xs:text-xs">
                    {p.description}
                  </p>
                </div>

                {/* API Key section */}
                <div className="mt-3.5 xs:mt-4 pt-3.5 xs:pt-4 border-t border-vault-700/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-parchment-200/50 xs:text-xs">API Key</span>
                    <span className="text-[10px] text-parchment-200/25 font-mono xs:text-[11px]">{p.envKeyName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 xs:gap-2">
                    <div className="relative flex-1 min-w-0">
                      <input
                        type={showKeys[p.id] ? "text" : "password"}
                        value={editingKeys[p.id]}
                        onChange={e => setEditingKeys(s => ({ ...s, [p.id]: e.target.value }))}
                        placeholder={p.keyPlaceholder}
                        className="w-full rounded-lg border border-vault-600/70 bg-vault-950/80 pl-3 pr-9 py-2 font-mono text-xs text-parchment-100 placeholder:text-parchment-200/20 outline-none focus:border-bullion-500/50 focus:ring-1 focus:ring-bullion-500/15 transition-all tabular"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(s => ({ ...s, [p.id]: !s[p.id] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-parchment-200/30 hover:text-parchment-200/60 transition-colors"
                      >
                        {showKeys[p.id] ? <IconEyeOff className="w-3.5 h-3.5" /> : <IconEye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleSaveKey(p.id)} disabled={isSaving}
                      className="flex-shrink-0 rounded-lg bg-vault-800/80 border border-vault-600/60 px-3 py-2 text-[11px] font-medium text-parchment-200/70 transition-all hover:bg-vault-700/80 hover:text-parchment-100 active:scale-[0.97] disabled:opacity-50 xs:text-xs"
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </button>
                  </div>

                  {saved && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-bullion-400">
                      <IconCheck className="w-3 h-3" /> {saved}
                    </p>
                  )}
                </div>

                {/* Test section */}
                <div className="mt-3 xs:mt-3.5 pt-3 xs:pt-3.5 border-t border-vault-700/30 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestProvider(p.id)} disabled={test?.loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-vault-600/60 px-2.5 py-1.5 text-[11px] font-medium text-parchment-200/60 transition-all hover:text-bullion-400 hover:border-bullion-500/40 active:scale-[0.97] disabled:opacity-50 xs:text-xs"
                  >
                    {test?.loading ? <Spinner className="w-3 h-3" /> : <IconPulse className="w-3 h-3" />}
                    {test?.loading ? "Testing…" : "Test"}
                  </button>

                  {test?.success && test.pricePerOunce && (
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-bullion-400 xs:text-xs">
                      <IconCheck className="w-3 h-3" />
                      {formatUsd(test.pricePerOunce)}/oz
                      <span className="text-parchment-200/30 font-normal tabular">{test.latencyMs}ms</span>
                    </span>
                  )}

                  {test?.error && (
                    <p className="w-full rounded-lg bg-red-500/8 border border-red-400/20 px-2.5 py-1.5 text-[11px] text-red-300/80 mt-1 xs:text-xs">
                      {test.error}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Database help collapsible ───────────────────── */}
        <div className="mt-8 xs:mt-10 sm:mt-12 mb-8">
          <button
            onClick={() => setShowSql(v => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-vault-700/40 bg-vault-900/40 px-4 py-3 xs:px-5 text-left transition-colors hover:bg-vault-900/60"
          >
            <div>
              <h4 className="text-xs font-semibold text-parchment-200/60 sm:text-sm">Database setup</h4>
              <p className="text-[11px] text-parchment-200/30 mt-0.5 xs:text-xs">SQL schema for Supabase</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`w-4 h-4 text-parchment-200/30 transition-transform duration-200 ${showSql ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showSql && (
            <div className="mt-2 rounded-xl border border-vault-700/40 bg-vault-900/30 p-4 xs:p-5">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3">
                <p className="text-xs text-parchment-200/40">
                  Run this in <a href="https://supabase.com/dashboard/project/moyjbglcvssxcvqnqmut/editor" target="_blank" rel="noreferrer" className="text-bullion-400/80 hover:text-bullion-400 underline underline-offset-2">SQL Editor</a>
                </p>
                <a
                  href="https://supabase.com/dashboard/project/moyjbglcvssxcvqnqmut/editor"
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-vault-600/60 px-2.5 py-1.5 text-[11px] font-medium text-parchment-200/60 hover:text-bullion-400 transition-colors xs:text-xs"
                >
                  <IconExternal className="w-3 h-3" />
                  Open editor
                </a>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-vault-950/80 border border-vault-700/30 p-3 xs:p-4 font-mono text-[10px] xs:text-[11px] text-parchment-200/65 leading-relaxed">
{`CREATE TABLE IF NOT EXISTS public.provider_config (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.provider_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.provider_config
  FOR SELECT USING (true);

CREATE POLICY "service_full" ON public.provider_config
  FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.provider_config (id, name, api_key, is_active)
VALUES 
  ('goldapi','GoldAPI.io','','true'),
  ('goldprice','goldprice.dev','',false),
  ('metals_dev','metals.dev','',false),
  ('metalprice','MetalpriceAPI.com','',false)
ON CONFLICT (id) DO NOTHING;`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
