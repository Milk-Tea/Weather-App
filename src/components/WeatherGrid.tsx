import type { DayData } from '../types/weather'
import { DayTile } from './DayTile'

interface Props {
  history: DayData[]
  forecast: DayData[]
  selectedDate: string | null
  onSelect: (day: DayData | null) => void
}

function DaySection({
  title,
  days,
  selectedDate,
  onSelect,
  animationOffset,
}: {
  title: string
  days: DayData[]
  selectedDate: string | null
  onSelect: (day: DayData | null) => void
  animationOffset: number
}) {
  function handleTileClick(day: DayData) {
    onSelect(selectedDate === day.date ? null : day)
  }

  return (
    <section>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-white/70">{title}</h3>
      <ul className="flex flex-col gap-1.5 sm:gap-2">
        {days.map((day, index) => (
          <li
            key={day.date}
            className="animate-slideUp"
            style={{
              animationDelay: `${(animationOffset + index) * 60}ms`,
              animationFillMode: 'both',
            }}
          >
            <DayTile
              day={day}
              isSelected={selectedDate === day.date}
              onClick={() => handleTileClick(day)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function WeatherGrid({ history, forecast, selectedDate, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5" data-testid="weather-grid">
      <DaySection
        title="Next 3 Days"
        days={forecast}
        selectedDate={selectedDate}
        onSelect={onSelect}
        animationOffset={3}
      />
      <DaySection
        title="Past 3 Days"
        days={history}
        selectedDate={selectedDate}
        onSelect={onSelect}
        animationOffset={0}
      />
    </div>
  )
}
