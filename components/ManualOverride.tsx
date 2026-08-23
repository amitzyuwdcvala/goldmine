"use client";

export default function ManualOverride({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-vault-600/50 bg-vault-900/60 p-3.5 sm:p-5 shadow-card">
      <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-parchment-200/60">
        Manual spot override
      </p>
      <p className="mt-0.5 text-[11px] sm:text-[13px] text-parchment-200/40">
        Enter test price per troy ounce to override feed.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-vault-600/60 bg-vault-950/70 px-3 py-2 sm:py-2.5 focus-within:border-bullion-500/60 transition-colors">
        <span className="font-mono text-sm text-parchment-200/40">$</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="e.g. 2415.30"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-mono text-sm text-parchment-100 placeholder:text-parchment-200/25 outline-none tabular"
        />
        {value !== "" && (
          <button
            onClick={() => onChange("")}
            className="rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-parchment-200/50 hover:text-bullion-400 hover:bg-vault-800/60 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
