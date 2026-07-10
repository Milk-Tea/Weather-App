function Shimmer({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[6px] bg-white/15 ${className}`} />
}

function SkeletonDayTile() {
  return (
    <div className="flex w-full items-center gap-3 rounded-[6px] border border-white/10 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-3 w-32" />
      </div>
      <Shimmer className="size-8 shrink-0 sm:size-9" />
      <div className="flex shrink-0 items-baseline gap-1.5">
        <Shimmer className="h-4 w-8" />
        <Shimmer className="h-3 w-6" />
      </div>
    </div>
  )
}

function SkeletonStatCard() {
  return (
    <div className="rounded-[6px] bg-white/10 p-3 text-center">
      <Shimmer className="mx-auto mb-1 h-3 w-16" />
      <Shimmer className="mx-auto h-4 w-20" />
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div aria-label="Loading weather data">
      <div className="mb-4 text-xs uppercase tracking-widest text-white/70">Current Conditions</div>

      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="w-full flex-1 space-y-2 text-center sm:text-left">
          <Shimmer className="mx-auto h-14 w-28 sm:mx-0 sm:h-16 lg:h-24" />
          <Shimmer className="mx-auto h-4 w-40 sm:mx-0" />
          <Shimmer className="mx-auto h-3 w-32 sm:mx-0" />
        </div>
        <Shimmer className="size-14 shrink-0 sm:size-16 lg:size-24" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonStatCard key={`stat-${index}`} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div aria-label="Loading forecast" className="flex flex-col gap-4 sm:gap-5">
      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-white/70">
          Next 3 Days
        </h3>
        <ul className="flex flex-col gap-1.5 sm:gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={`forecast-${index}`}>
              <SkeletonDayTile />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-white/70">
          Past 3 Days
        </h3>
        <ul className="flex flex-col gap-1.5 sm:gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={`history-${index}`}>
              <SkeletonDayTile />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
