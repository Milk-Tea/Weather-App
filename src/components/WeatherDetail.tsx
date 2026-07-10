import type { CurrentWeatherData, LocationInfo, DayData } from '../types/weather'

interface CurrentProps {
  weather: CurrentWeatherData
  location: LocationInfo
}

interface SelectedDayProps {
  day: DayData
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] bg-white/10 p-3 text-center">
      <div className="mb-1 text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="font-semibold text-white">{value}</div>
    </div>
  )
}

export function CurrentWeatherDetail({ weather, location }: CurrentProps) {
  return (
    <div className="animate-fadeIn" data-testid="current-weather">
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex w-full flex-col text-left">
          <h2 className="text-4xl font-thin text-white sm:text-5xl lg:text-7xl">
            {weather.temperature}°
          </h2>
          <p className="mt-1 text-base text-white/80 sm:text-lg">{weather.description}</p>
          <p className="mt-1 text-sm text-white/60">
            {location.name}, {location.country}
          </p>
        </div>
        <div
          className="text-5xl sm:text-6xl lg:text-7xl"
          role="img"
          aria-label={weather.description}
        >
          {weather.emoji}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Feels Like" value={`${weather.feelslike}°`} />
        <StatCard label="Humidity" value={`${weather.humidity}%`} />
        <StatCard label="Wind" value={`${weather.windSpeed} km/h ${weather.windDir}`} />
        <StatCard label="Pressure" value={`${weather.pressure} hPa`} />
        <StatCard label="Precipitation" value={`${weather.precipitation} mm`} />
        <StatCard label="Day / Night" value={weather.isDay ? 'Day ☀️' : 'Night 🌙'} />
      </div>
    </div>
  )
}

export function SelectedDayDetail({ day }: SelectedDayProps) {
  return (
    <div className="animate-fadeIn" data-testid="selected-day-detail">
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex-1 text-left">
          <div className="mb-1 text-sm uppercase tracking-widest text-white/60">
            {day.isHistory ? 'Historical' : 'Forecast'}
          </div>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{day.date}</h2>
          <p className="mt-1 text-base text-white/80 sm:text-lg">{day.description}</p>
          <div className="mt-2 flex justify-center gap-4 sm:justify-start">
            <span className="text-sm text-white/60">
              H: <span className="font-medium text-white">{day.maxTemp}°</span>
            </span>
            <span className="text-sm text-white/60">
              L: <span className="font-medium text-white">{day.minTemp}°</span>
            </span>
          </div>
        </div>
        <div className="text-5xl sm:text-6xl" role="img" aria-label={day.description}>
          {day.emoji}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Avg Temp" value={`${day.avgTemp}°`} />
        <StatCard label="Wind" value={`${day.windSpeed} km/h ${day.windDir}`} />
        <StatCard label="Precipitation" value={`${day.precip} mm`} />
        <StatCard label="UV Index" value={`${day.uvIndex}`} />
        <StatCard label="Sunrise" value={day.sunrise} />
        <StatCard label="Sunset" value={day.sunset} />
      </div>
    </div>
  )
}
