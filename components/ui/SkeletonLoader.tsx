"use client";

interface SkeletonLoaderProps {
  type?: "card" | "stat" | "text";
  count?: number;
}

export default function SkeletonLoader({
  type = "card",
  count = 1,
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "stat") {
    return (
      <>
        {items.map((i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-6 animate-pulse shimmer"
          >
            <div className="h-4 bg-surface-secondary rounded w-24 mb-3"></div>
            <div className="h-8 bg-surface-secondary rounded w-32"></div>
          </div>
        ))}
      </>
    );
  }

  if (type === "text") {
    return (
      <>
        {items.map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
          </div>
        ))}
      </>
    );
  }

  // Default card skeleton
  return (
    <>
      {items.map((i) => (
        <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 bg-white/10 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-white/20 rounded w-32 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-24"></div>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-5/6"></div>
        </div>
      ))}
    </>
  );
}
