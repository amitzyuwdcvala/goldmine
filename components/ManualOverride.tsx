"use client";

export default function ManualOverride({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-card bg-white p-4 sm:p-5 shadow-sb-card border border-sb-border-subtle">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-sans text-xs sm:text-sm font-bold text-ink">
            Manual Spot Override
          </h3>
          <p className="mt-0.5 text-[11px] sm:text-xs text-ink-soft">
            Enter test price per troy ounce to override feed.
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2 rounded-pill bg-sb-canvas border border-sb-border px-3.5 py-1.5 sm:py-2 focus-within:border-sb-accent focus-within:ring-2 focus-within:ring-sb-accent/15 transition-all">
        <span className="font-serif text-sm font-bold text-sb-accent">$</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="e.g. 2935.50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-sans text-xs sm:text-sm font-semibold text-ink placeholder:text-ink-muted/50 outline-none tabular"
        />
        {value !== "" && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-pill bg-white px-2.5 py-0.5 text-[11px] font-bold text-ink-soft hover:text-ink hover:bg-sb-light/50 transition-colors shadow-sm"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
