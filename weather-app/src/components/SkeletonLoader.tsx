function Shimmer({ className }: { className: string }) {
  return <div className={`animate-pulse bg-white/15 rounded-xl ${className}`} />
}

export function SkeletonLoader() {
  return (
    <div className="space-y-6" aria-label="Loading weather data">
      <div className="space-y-3">
        <Shimmer className="h-16 w-48" />
        <Shimmer className="h-5 w-32" />
        <Shimmer className="h-4 w-24" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Shimmer key={i} className="h-16" />
        ))}
      </div>
      <div className="space-y-3 mt-6">
        <Shimmer className="h-4 w-24" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-36" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Shimmer className="h-4 w-24" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-36" />
          ))}
        </div>
      </div>
    </div>
  )
}
