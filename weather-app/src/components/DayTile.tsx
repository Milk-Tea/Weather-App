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
        relative w-full rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer
        border border-white/10 hover:border-white/30 hover:scale-105 active:scale-100
        ${isSelected
          ? 'bg-white/25 border-white/40 shadow-lg shadow-black/20 scale-105'
          : 'bg-white/10 hover:bg-white/15'}
      `}
    >
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-white/40 pointer-events-none" />
      )}
      <div className="text-white/60 text-xs uppercase tracking-wide mb-2">
        {day.isHistory ? '▲ Past' : '▼ Coming'}
      </div>
      <div className="text-white font-medium text-sm mb-3">{day.date}</div>
      <div className="text-3xl mb-2" role="img" aria-label={day.description}>
        {day.emoji}
      </div>
      <div className="flex justify-center gap-2 text-sm">
        <span className="text-white font-semibold">{day.maxTemp}°</span>
        <span className="text-white/50">{day.minTemp}°</span>
      </div>
      <div className="text-white/60 text-xs mt-1 truncate">{day.description}</div>
    </button>
  )
}
