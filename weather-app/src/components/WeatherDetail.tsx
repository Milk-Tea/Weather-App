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
    <div className="bg-white/10 rounded-xl p-3 text-center">
      <div className="text-white/60 text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  )
}

export function CurrentWeatherDetail({ weather, location }: CurrentProps) {
  return (
    <div className="animate-fadeIn" data-testid="current-weather">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-5xl sm:text-7xl font-thin text-white">
            {weather.temperature}°
          </h2>
          <p className="text-white/80 text-lg mt-1">{weather.description}</p>
          <p className="text-white/60 text-sm mt-1">
            {location.name}, {location.country}
          </p>
        </div>
        <div className="text-6xl sm:text-7xl" role="img" aria-label={weather.description}>
          {weather.emoji}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
        <div className="flex-1 text-center sm:text-left">
          <div className="text-white/60 text-sm uppercase tracking-widest mb-1">
            {day.isHistory ? 'Historical' : 'Forecast'}
          </div>
          <h2 className="text-3xl font-semibold text-white">{day.date}</h2>
          <p className="text-white/80 text-lg mt-1">{day.description}</p>
          <div className="flex gap-4 mt-2 justify-center sm:justify-start">
            <span className="text-white/60 text-sm">
              H: <span className="text-white font-medium">{day.maxTemp}°</span>
            </span>
            <span className="text-white/60 text-sm">
              L: <span className="text-white font-medium">{day.minTemp}°</span>
            </span>
          </div>
        </div>
        <div className="text-6xl" role="img" aria-label={day.description}>
          {day.emoji}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
