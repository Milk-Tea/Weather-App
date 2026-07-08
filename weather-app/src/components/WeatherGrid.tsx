import type { DayData } from '../types/weather'
import { DayTile } from './DayTile'

interface Props {
  history: DayData[]
  forecast: DayData[]
  selectedDate: string | null
  onSelect: (day: DayData | null) => void
}

export function WeatherGrid({ history, forecast, selectedDate, onSelect }: Props) {
  function handleTileClick(day: DayData) {
    onSelect(selectedDate === day.date ? null : day)
  }

  return (
    <div data-testid="weather-grid">
      <div className="mb-6">
        <h3 className="text-white/70 text-sm uppercase tracking-widest mb-3 font-medium">
          Past 3 Days
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {history.map((day, i) => (
            <div
              key={day.date}
              className="animate-slideUp"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <DayTile
                day={day}
                isSelected={selectedDate === day.date}
                onClick={() => handleTileClick(day)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white/70 text-sm uppercase tracking-widest mb-3 font-medium">
          Next 3 Days
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {forecast.map((day, i) => (
            <div
              key={day.date}
              className="animate-slideUp"
              style={{ animationDelay: `${(i + 3) * 80}ms`, animationFillMode: 'both' }}
            >
              <DayTile
                day={day}
                isSelected={selectedDate === day.date}
                onClick={() => handleTileClick(day)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
