import type { DayData } from '../types/weather'

interface Props {
  day: DayData
  isSelected: boolean
  onClick: () => void
}

export function DayTile({ day, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      data-testid="day-tile"
      aria-pressed={isSelected}
      aria-label={`${day.isHistory ? 'Historical' : 'Forecast'} weather for ${day.date}: ${day.description}, high ${day.maxTemp}°, low ${day.minTemp}°`}
      className={`
        flex w-full cursor-pointer items-center gap-3 rounded-[6px] border border-white/10 px-3 py-2.5
        text-start transition-all duration-200 hover:border-white/30 active:scale-[0.99] sm:gap-4
        sm:px-4 sm:py-3
        ${isSelected ? 'border-white/40 bg-white/25 shadow-md shadow-black/20' : 'bg-white/10 hover:bg-white/15'}
      `}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white">{day.date}</div>
        <div className="truncate text-xs text-white/60">{day.description}</div>
      </div>
      <div className="flex-shrink-0 text-2xl sm:text-3xl" role="img" aria-label={day.description}>
        {day.emoji}
      </div>
      <div className="flex flex-shrink-0 items-baseline gap-1.5 tabular-nums">
        <span className="text-sm font-semibold text-white sm:text-base">{day.maxTemp}°</span>
        <span className="text-xs text-white/50 sm:text-sm">{day.minTemp}°</span>
      </div>
    </button>
  )
}
