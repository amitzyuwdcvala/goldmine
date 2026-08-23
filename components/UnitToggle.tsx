"use client";

export default function UnitToggle({
  value,
  onChange,
}: {
  value: "gram" | "tola";
  onChange: (v: "gram" | "tola") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-vault-600/60 bg-vault-950/80 p-0.5 sm:p-1">
      {(["gram", "tola"] as const).map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className={`rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-200 ${
            value === u
              ? "bg-gradient-to-r from-bullion-600 to-bullion-500 text-vault-950 font-semibold shadow-[0_2px_8px_-2px_rgba(212,175,55,0.4)]"
              : "text-parchment-200/40 hover:text-parchment-100"
          }`}
        >
          per {u}
        </button>
      ))}
    </div>
  );
}
