export function TickerSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-vault-600/50 bg-vault-900/80 p-4 sm:px-8 sm:py-7 shadow-vault">
      <div className="h-3 w-32 sm:w-40 animate-pulse rounded bg-vault-700/60" />
      <div className="mt-3 sm:mt-4 h-10 sm:h-14 w-48 sm:w-64 animate-pulse rounded bg-vault-700/60" />
      <div className="mt-3 sm:mt-4 h-px w-full bg-vault-700/40" />
      <div className="mt-2.5 h-3 w-56 sm:w-72 animate-pulse rounded bg-vault-700/40" />
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-vault-600/50 bg-vault-900/60 shadow-card overflow-hidden">
      <div className="border-b border-vault-600/50 px-3.5 py-2.5 sm:px-6 sm:py-4">
        <div className="h-3 w-36 sm:w-48 animate-pulse rounded bg-vault-700/60" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-vault-600/40">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-vault-900 p-3.5 sm:px-6 sm:py-5">
            <div className="h-4 sm:h-6 w-10 sm:w-12 animate-pulse rounded bg-vault-700/60" />
            <div className="mt-2 sm:mt-3 h-1 w-full animate-pulse rounded-full bg-vault-700/40" />
            <div className="mt-2.5 sm:mt-4 h-6 sm:h-8 w-20 sm:w-24 animate-pulse rounded bg-vault-700/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
