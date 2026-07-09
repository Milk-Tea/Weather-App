import { useState, useRef, useEffect } from 'react'

import { useWeather } from './hooks/useWeather'
import { SearchBar } from './components/SearchBar'
import { CurrentWeatherDetail, SelectedDayDetail } from './components/WeatherDetail'
import { WeatherGrid } from './components/WeatherGrid'
import { ErrorBanner } from './components/ErrorBanner'
import { SkeletonLoader } from './components/SkeletonLoader'
import type { DayData, GeocodingResult } from './types/weather'

function getBackgroundClass(weatherCode: number | undefined, isDay: boolean | undefined): string {
  if (weatherCode === undefined) return 'from-slate-800 via-slate-700 to-slate-600'
  if (!isDay) return 'from-indigo-950 via-slate-900 to-indigo-900'

  if (weatherCode === 0) return 'from-sky-500 via-blue-400 to-cyan-300'
  if (weatherCode <= 3) return 'from-slate-500 via-sky-400 to-slate-400'
  if (weatherCode <= 48) return 'from-slate-600 via-slate-500 to-slate-400'
  if (weatherCode <= 67) return 'from-slate-700 via-blue-800 to-slate-600'
  if (weatherCode <= 77) return 'from-slate-300 via-blue-200 to-slate-200'
  if (weatherCode <= 82) return 'from-slate-600 via-blue-700 to-slate-500'
  return 'from-gray-900 via-slate-700 to-gray-600'
}

export default function App() {
  const { currentWeather, locationInfo, forecast, history, loading, error, search, selectLocation, refresh, locationQuery } = useWeather()
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedDay) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedDay])

  const bgClass = getBackgroundClass(currentWeather?.weatherCode, currentWeather?.isDay)

  function handleSearch(loc: string) {
    setSelectedDay(null)
    search(loc)
  }

  function handleSelectSuggestion(result: GeocodingResult) {
    setSelectedDay(null)
    selectLocation(result)
  }

  function handleRefresh() {
    setSelectedDay(null)
    refresh(locationQuery)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgClass} transition-all duration-1000`}>
      <div className="min-h-screen backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-1">Weather</h1>
            <p className="text-white/50 text-sm">Search any city for current conditions &amp; 3-day forecast</p>
          </header>

          <div className="mb-6 flex items-center gap-2">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} onSelectSuggestion={handleSelectSuggestion} loading={loading} />
            </div>
            {currentWeather && (
              <button
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh weather data"
                title="Refresh (clears cache)"
                className="p-3 rounded-xl bg-white/10 border border-white/20 text-white/70
                  hover:bg-white/20 hover:text-white transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={() => handleSearch(locationQuery)} />
            </div>
          )}

          {loading && <SkeletonLoader />}

          {!loading && currentWeather && locationInfo && (
            <div className="space-y-6 animate-fadeIn">
              <div ref={detailRef} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                {selectedDay ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/50 text-xs uppercase tracking-widest">
                        {selectedDay.isHistory ? 'Historical Data' : 'Forecast'}
                      </span>
                      <button
                        onClick={() => setSelectedDay(null)}
                        className="text-white/50 hover:text-white text-xs transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to current
                      </button>
                    </div>
                    <SelectedDayDetail day={selectedDay} />
                  </>
                ) : (
                  <>
                    <div className="text-white/50 text-xs uppercase tracking-widest mb-4">
                      Current Conditions
                    </div>
                    <CurrentWeatherDetail weather={currentWeather} location={locationInfo} />
                  </>
                )}
              </div>

              {(history.length > 0 || forecast.length > 0) && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
                  <WeatherGrid
                    history={history}
                    forecast={forecast}
                    selectedDate={selectedDay?.date ?? null}
                    onSelect={setSelectedDay}
                  />
                </div>
              )}
            </div>
          )}

          {!loading && !currentWeather && !error && (
            <div className="text-center py-20 animate-fadeIn">
              <div className="text-6xl mb-4">🌤️</div>
              <p className="text-white/50">Enter a city name to get started</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
