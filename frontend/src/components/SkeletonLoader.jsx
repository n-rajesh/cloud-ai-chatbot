export function HistoryItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl px-3 py-3">
      <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
      <div className="h-2.5 w-1/2 rounded bg-white/5 animate-pulse" />
    </div>
  );
}

export default function SkeletonLoader({ count = 5 }) {
  return (
    <div className="flex flex-col gap-1" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <HistoryItemSkeleton key={i} />
      ))}
    </div>
  );
}
