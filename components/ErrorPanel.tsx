export default function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-ember/40 bg-vault-900/80 px-6 py-8 shadow-card">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ember">
        Feed unavailable
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-parchment-200/60">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-5 rounded-lg border border-bullion-600/50 bg-bullion-500/10 px-4 py-2 font-mono text-[12px] uppercase tracking-wide text-bullion-400 transition-colors hover:bg-bullion-500/20"
      >
        Retry
      </button>
      <p className="mt-4 text-[12px] text-parchment-200/35">
        You can also enter a price manually below to keep working while the
        live feed is down.
      </p>
    </div>
  );
}
