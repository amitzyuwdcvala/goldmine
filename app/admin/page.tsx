"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import type { ProviderId } from "@/lib/providers";
import { formatUsd } from "@/lib/format";

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

function IconPulse({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
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

export default function AdminPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("admin@aurumdesk.com");
  const [password, setPassword] = useState("admin");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionMessage, setProvisionMessage] = useState("");

  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<ProviderId>("goldapi");
  const [fromDb, setFromDb] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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

  const [testResults, setTestResults] = useState<Record<ProviderId, TestResult>>({
    goldapi: { loading: false }, goldprice: { loading: false },
    metals_dev: { loading: false }, metalprice: { loading: false },
  });

  const [showSql, setShowSql] = useState(false);

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

  const handleAutoProvision = async () => {
    setIsProvisioning(true); setLoginError(""); setProvisionMessage("");
    try {
      const res = await fetch("/api/admin/setup-credentials", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) {
        setEmail(json.email); setPassword(json.password);
        setProvisionMessage("Credentials configured in Supabase! Signing in…");
        const { data, error } = await supabase.auth.signInWithPassword({ email: json.email, password: json.password });
        if (error) setLoginError(error.message);
        else if (data.user) setSessionUser(data.user);
      } else { setLoginError(json.message || "Provisioning failed."); }
    } catch (e: any) { setLoginError(e.message || "Connection error"); }
    finally { setIsProvisioning(false); }
  };

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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sb-canvas">
        <div className="flex items-center gap-3 rounded-card bg-white p-5 shadow-sb-card border border-sb-border-subtle">
          <Spinner className="w-5 h-5 text-sb-accent" />
          <span className="font-sans text-sm font-semibold text-ink-soft">Verifying admin session…</span>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sb-canvas p-4 sm:p-6">
        <div className="w-full max-w-sm">
          <div className="rounded-card bg-white p-6 sm:p-8 shadow-sb-card border border-sb-border-subtle">
            {/* Starbucks Brand Lockup */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sb-green text-white shadow-sm flex-shrink-0">
                <span className="font-serif font-bold text-base">Au</span>
              </div>
              <div>
                <h1 className="font-sans text-xl font-bold tracking-tight text-sb-green">Aurum Admin</h1>
                <p className="text-xs text-ink-soft">Provider &amp; API Management</p>
              </div>
            </div>

            {/* Alerts */}
            {provisionMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-sb-light/50 border border-sb-green/20 p-3">
                <IconCheck className="w-4 h-4 text-sb-green flex-shrink-0" />
                <p className="text-xs font-semibold text-sb-green">{provisionMessage}</p>
              </div>
            )}
            {loginError && (
              <div className="mb-4 rounded-lg bg-sb-red-tint border border-sb-red/30 p-3">
                <p className="text-xs font-semibold text-sb-red">{loginError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Admin Email</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-pill border border-sb-border bg-sb-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:border-sb-accent focus:ring-2 focus:ring-sb-accent/15 transition-all"
                  placeholder="admin@aurumdesk.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Password</label>
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-pill border border-sb-border bg-sb-canvas px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:border-sb-accent focus:ring-2 focus:ring-sb-accent/15 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit" disabled={isLoggingIn || isProvisioning}
                className="w-full sb-btn-primary py-3 text-sm"
              >
                {isLoggingIn ? "Signing in…" : "Sign In to Admin Desk"}
              </button>
            </form>

            <div className="relative mt-5 mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sb-border-subtle" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-2.5 text-[11px] text-ink-muted">or</span></div>
            </div>

            <button
              type="button" onClick={handleAutoProvision}
              disabled={isProvisioning || isLoggingIn}
              className="w-full sb-btn-secondary py-2.5 text-xs"
            >
              {isProvisioning ? "Provisioning…" : "⚡ 1-Click Auto-Setup Admin"}
            </button>

            <p className="mt-4 text-center text-[11px] text-ink-muted leading-relaxed">
              Default credentials: <span className="font-semibold text-ink-soft">admin@aurumdesk.com</span> / <span className="font-semibold text-ink-soft">admin</span>
            </p>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sb-accent hover:text-sb-green transition-colors">
              <IconArrowLeft className="w-3.5 h-3.5" />
              Back to Live Calculator
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const activeProvider = providers.find(p => p.id === activeProviderId);
  const activeTest = testResults[activeProviderId];

  return (
    <div className="min-h-screen bg-sb-canvas text-ink flex flex-col justify-between selection:bg-sb-light selection:text-sb-green">
      {/* ── Top Nav Bar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-sb-border-subtle bg-white/95 backdrop-blur-md shadow-sb-nav">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3.5 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sb-green text-white shadow-sm flex-shrink-0">
              <span className="font-serif font-bold text-sm">Au</span>
            </div>
            <div>
              <h1 className="font-sans text-base sm:text-lg font-bold tracking-tight text-sb-green">
                Provider Desk
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${fromDb ? "bg-emerald-500" : "bg-sb-yellow"}`} />
                <span className="text-[11px] font-medium text-ink-soft">
                  {fromDb ? "Supabase Cloud Database" : ".env Fallback Mode"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline text-xs font-semibold text-ink-soft">
              {sessionUser.email}
            </span>
            <Link
              href="/"
              className="sb-btn-secondary px-3 py-1.5 text-xs"
            >
              <IconArrowLeft className="w-3 h-3 mr-1" />
              <span>Calculator</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="sb-btn-dark px-3 py-1.5 text-xs hover:border-sb-red hover:text-sb-red"
            >
              <IconLogout className="w-3 h-3 mr-1" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Admin Content ─────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-5xl px-3.5 py-5 sm:px-6 sm:py-8 space-y-5 sm:space-y-6">
        {/* Active Provider Hero (House Green Feature Band) */}
        <div className="relative overflow-hidden rounded-[14px] sm:rounded-[18px] bg-sb-house text-white p-4 xs:p-5 sm:p-7 shadow-sb-card border border-sb-dark">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-sb-gold">
                  Active Live Pricing Source
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                {activeProvider?.name || activeProviderId}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-chalk-soft leading-relaxed max-w-lg">
                {activeProvider?.description}
              </p>
            </div>

            <button
              onClick={() => handleTestProvider(activeProviderId)}
              disabled={activeTest?.loading}
              className="sb-btn-inverted px-4 py-2.5 text-xs font-bold self-start sm:self-auto flex-shrink-0"
            >
              {activeTest?.loading ? <Spinner className="w-3.5 h-3.5 mr-1.5 text-sb-accent" /> : <IconPulse className="w-3.5 h-3.5 mr-1.5 text-sb-accent" />}
              <span>Test Live Source</span>
            </button>
          </div>

          {/* Inline Test Result */}
          {activeTest?.success && activeTest.pricePerOunce && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-pill bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-sb-gold-light">
                <IconCheck className="w-3.5 h-3.5" />
                <span>Live Spot: {formatUsd(activeTest.pricePerOunce)} / oz</span>
              </span>
              <span className="text-chalk-muted">&middot;</span>
              <span className="text-chalk-soft tabular font-medium">Latency: {activeTest.latencyMs}ms</span>
            </div>
          )}
          {activeTest?.error && (
            <div className="mt-4 rounded-lg bg-sb-red-tint border border-sb-red/30 p-2.5 text-xs text-sb-red font-medium">
              Error: {activeTest.error}
            </div>
          )}
        </div>

        {/* Section Heading */}
        <div className="pt-2">
          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink">
            Configured Providers
          </h3>
          <p className="text-xs text-ink-soft mt-0.5">
            Switch your active gold pricing feed or update API credentials on the fly.
          </p>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
          {providers.map((p) => {
            const isActive = p.id === activeProviderId;
            const isSaving = savingKey[p.id];
            const test = testResults[p.id];
            const saved = saveSuccessMsg[p.id];

            return (
              <div
                key={p.id}
                className={`rounded-card bg-white p-4 xs:p-5 sm:p-6 shadow-sb-card border transition-all duration-200 ${
                  isActive
                    ? "border-sb-accent ring-2 ring-sb-accent/15"
                    : "border-sb-border-subtle hover:border-sb-accent/40"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-sans text-base sm:text-lg font-bold text-ink">
                        {p.name}
                      </h4>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-sb-light/70 border border-sb-green/20 px-2.5 py-0.5 text-[10px] font-bold text-sb-green">
                          <span className="h-1.5 w-1.5 rounded-full bg-sb-accent" />
                          Active
                        </span>
                      )}
                    </div>
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-sb-accent hover:text-sb-green transition-colors"
                    >
                      <span>{p.website.replace("https://", "")}</span>
                      <IconExternal className="w-3 h-3" />
                    </a>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => handleSetActive(p.id)}
                      className="sb-btn-secondary px-3 py-1 text-xs"
                    >
                      Set Active
                    </button>
                  )}
                </div>

                {/* Limits & Description */}
                <div className="mt-2.5 sm:mt-3">
                  <span className="inline-block rounded-md bg-sb-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                    {p.limits}
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                    {p.description}
                  </p>
                </div>

                {/* API Key Input */}
                <div className="mt-3.5 pt-3 border-t border-sb-canvas">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-ink">API Key</span>
                    <span className="font-mono text-[10px] text-ink-muted">{p.envKeyName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                      <input
                        type={showKeys[p.id] ? "text" : "password"}
                        value={editingKeys[p.id]}
                        onChange={(e) => setEditingKeys((s) => ({ ...s, [p.id]: e.target.value }))}
                        placeholder={p.keyPlaceholder}
                        className="w-full rounded-pill border border-sb-border bg-sb-canvas pl-3.5 pr-9 py-1.5 sm:py-2 font-mono text-xs text-ink placeholder:text-ink-muted/30 outline-none focus:border-sb-accent focus:ring-2 focus:ring-sb-accent/15 transition-all tabular"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys((s) => ({ ...s, [p.id]: !s[p.id] }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                      >
                        {showKeys[p.id] ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleSaveKey(p.id)}
                      disabled={isSaving}
                      className="sb-btn-primary px-3.5 py-1.5 sm:py-2 text-xs flex-shrink-0"
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </button>
                  </div>

                  {saved && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-sb-accent">
                      <IconCheck className="w-3 h-3" /> Saved successfully
                    </p>
                  )}
                </div>

                {/* Card Test Row */}
                <div className="mt-3.5 pt-3 border-t border-sb-canvas flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestProvider(p.id)}
                    disabled={test?.loading}
                    className="sb-btn-secondary px-3 py-1.5 text-xs"
                  >
                    {test?.loading ? <Spinner className="w-3 h-3 mr-1" /> : <IconPulse className="w-3 h-3 mr-1" />}
                    <span>{test?.loading ? "Testing…" : "Test Connection"}</span>
                  </button>

                  {test?.success && test.pricePerOunce && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-sb-accent">
                      <IconCheck className="w-3.5 h-3.5" />
                      <span>{formatUsd(test.pricePerOunce)}/oz</span>
                      <span className="text-ink-muted font-normal tabular">({test.latencyMs}ms)</span>
                    </span>
                  )}

                  {test?.error && (
                    <p className="w-full rounded-md bg-sb-red-tint border border-sb-red/20 p-2 text-xs font-medium text-sb-red mt-1">
                      {test.error}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Database SQL Setup Collapsible */}
        <div className="pt-2">
          <button
            onClick={() => setShowSql((v) => !v)}
            className="flex w-full items-center justify-between rounded-card bg-white border border-sb-border-subtle p-4 text-left shadow-sb-card hover:border-sb-accent/40 transition-colors"
          >
            <div>
              <h4 className="font-sans text-sm font-bold text-ink">
                Supabase Database Schema
              </h4>
              <p className="text-xs text-ink-soft mt-0.5">
                SQL table creation query for permanent cloud persistence.
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${showSql ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showSql && (
            <div className="mt-2 rounded-card bg-sb-canvas border border-sb-border-subtle p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-ink-soft">
                  Execute in Supabase SQL Editor:
                </span>
                <a
                  href="https://supabase.com/dashboard/project/moyjbglcvssxcvqnqmut/editor"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sb-accent hover:text-sb-green"
                >
                  <span>Open SQL Editor</span>
                  <IconExternal className="w-3 h-3" />
                </a>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-sb-house text-chalk-soft p-3.5 font-mono text-[11px] leading-relaxed">
{`CREATE TABLE IF NOT EXISTS public.provider_config (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.provider_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.provider_config FOR SELECT USING (true);
CREATE POLICY "service_full" ON public.provider_config FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.provider_config (id, name, api_key, is_active)
VALUES 
  ('goldapi', 'GoldAPI.io', 'goldapi-0a08b89b36444433158c4fb65045ff74-io', true),
  ('goldprice', 'goldprice.dev', '', false),
  ('metals_dev', 'metals.dev', '', false),
  ('metalprice', 'MetalpriceAPI.com', '', false)
ON CONFLICT (id) DO NOTHING;`}
              </pre>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-sb-house text-white border-t border-sb-dark py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between text-xs text-chalk-soft">
          <p>Aurum Desk Admin &middot; Authenticated Session</p>
          <Link href="/" className="hover:text-white font-semibold transition-colors">
            Return to Calculator &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
