import { useState, useRef, useEffect } from 'react'

import { useWeather } from './hooks/useWeather'
import { SearchBar } from './components/SearchBar'
import { CurrentWeatherDetail, SelectedDayDetail } from './components/WeatherDetail'
import { WeatherGrid } from './components/WeatherGrid'
import { Toast } from './components/Toast'
import { SkeletonDetail, SkeletonGrid } from './components/SkeletonLoader'
import { SeasonStrips } from './components/SeasonStrips'
import type { DayData, GeocodingResult } from './types/weather'

const WEATHER_PHRASES: Record<number, string> = {
  1: 'mostly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'foggy',
  51: 'drizzling',
  53: 'drizzling',
  55: 'heavily drizzling',
  61: 'rainy',
  63: 'rainy',
  65: 'heavily raining',
  71: 'snowy',
  73: 'snowy',
  75: 'heavily snowing',
  77: 'heavily snowing',
  80: 'showery',
  81: 'showery',
  82: 'showery',
  85: 'snowing with showers',
  86: 'snowing with showers',
  95: 'stormy',
  96: 'stormy',
  99: 'stormy',
}

function getWeatherPhrase(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? 'clear and sunny' : 'clear'
  return WEATHER_PHRASES[code] ?? 'changeable'
}

type SuggestionRule = {
  match: (code: number, temp: number) => boolean
  suggestion: string
}

const SUGGESTION_RULES: SuggestionRule[] = [
  {
    match: (code, temp) => code === 0 && temp > 28,
    suggestion: 'Perfect day for the beach or pool.',
  },
  {
    match: (code, temp) => code === 0 && temp > 18,
    suggestion: 'Great time for a picnic or a walk in the park.',
  },
  {
    match: (code, temp) => code === 0 && temp > 8,
    suggestion: 'Perfect for a brisk walk outside.',
  },
  { match: (code) => code === 0, suggestion: 'Clear skies — bundle up and enjoy the fresh air.' },
  {
    match: (code, temp) => code <= 3 && temp > 20,
    suggestion: 'Good conditions for a run or outdoor sport.',
  },
  { match: (code) => code <= 3, suggestion: 'Nice enough for a coffee and a stroll.' },
  {
    match: (code) => code <= 48,
    suggestion: 'A cozy day — perfect for staying in with a good book.',
  },
  { match: (code) => code <= 55, suggestion: 'Light drizzle — ideal for a café visit.' },
  {
    match: (code) => code <= 67,
    suggestion: 'Keep an umbrella close. Great excuse for a movie night in.',
  },
  { match: (code) => code <= 77, suggestion: 'Time to build a snowman.' },
  {
    match: (code) => code <= 82,
    suggestion: 'Showers on and off — best to stay flexible with plans.',
  },
  {
    match: (code) => code <= 86,
    suggestion: 'Snow showers — perfect for a hot chocolate indoors.',
  },
]

function getWeatherSuggestion(code: number, temp: number): string {
  return (
    SUGGESTION_RULES.find(({ match }) => match(code, temp))?.suggestion ??
    'Storm incoming — best to stay safe indoors.'
  )
}

function getBackgroundClass(weatherCode: number | undefined, isDay: boolean | undefined): string {
  if (weatherCode === undefined) return 'from-black via-gray-950 to-black'
  if (!isDay) return 'from-indigo-950 via-slate-900 to-indigo-900'

  if (weatherCode === 0) return 'from-sky-500 via-blue-400 to-cyan-300'
  if (weatherCode <= 3) return 'from-slate-500 via-sky-400 to-slate-400'
  if (weatherCode <= 48) return 'from-slate-600 via-slate-500 to-slate-400'
  if (weatherCode <= 67) return 'from-slate-700 via-blue-800 to-slate-600'
  if (weatherCode <= 77) return 'from-slate-300 via-blue-200 to-slate-200'
  if (weatherCode <= 82) return 'from-slate-600 via-blue-700 to-slate-500'

  return 'from-black via-gray-950 to-black'
}

export default function App() {
  const {
    currentWeather,
    locationInfo,
    forecast,
    history,
    loading,
    error,
    errorKind,
    search,
    selectLocation,
    refresh,
    clearError,
    reset,
    locationQuery,
  } = useWeather()
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedDay) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedDay])

  const bgClass = getBackgroundClass(currentWeather?.weatherCode, currentWeather?.isDay)
  const isLanding = !currentWeather

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
      {error && errorKind === 'other' && <Toast message={error} onDismiss={clearError} />}
      <div className={`min-h-screen backdrop-blur-sm ${isLanding ? '' : 'flex'}`}>
        <div
          className={`mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:flex-row lg:py-12 ${
            isLanding ? 'min-h-screen w-full lg:items-stretch' : 'items-start self-center'
          }`}
        >
          {/* Left column — header, search, main panel */}
          <div className="flex w-full flex-col gap-4 self-center sm:gap-6 lg:w-1/2">
            {!isLanding && currentWeather && locationInfo && (
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  aria-label="Return to home"
                  title="Back to home"
                  className="flex-shrink-0 rounded-xl border border-white/20 bg-white/10 p-2
                    text-white/70 transition-all duration-200 hover:bg-white/20 hover:text-white"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label="Refresh weather data"
                  title="Refresh (clears cache)"
                  className="flex-shrink-0 rounded-xl border border-white/20 bg-white/10 p-2
                    text-white/70 transition-all duration-200 hover:bg-white/20
                    hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg
                    className={`size-4 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            )}

            {isLanding ? (
              <>
                <header>
                  <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-white/90 sm:text-3xl lg:text-[3rem]">
                    What&apos;s the weather like?
                  </h1>
                  <p className="text-sm text-white/50">
                    Search any city for its current conditions and 3-day forecast
                  </p>
                </header>
                <div className="flex flex-col gap-2">
                  <SearchBar
                    onSearch={handleSearch}
                    onSelectSuggestion={handleSelectSuggestion}
                    loading={loading}
                  />
                  {error && errorKind === 'not-found' && (
                    <p className="pl-1 text-sm text-red-400/90">{error}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <SearchBar
                    onSearch={handleSearch}
                    onSelectSuggestion={handleSelectSuggestion}
                    loading={loading}
                  />
                  {error && errorKind === 'not-found' && (
                    <p className="pl-1 text-sm text-red-400/90">{error}</p>
                  )}
                </div>
                <header>
                  {currentWeather && locationInfo && (
                    <>
                      <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-white/90 sm:text-3xl lg:text-[3rem] lg:leading-[3.25rem]">
                        The weather in {locationInfo.name} is currently{' '}
                        {getWeatherPhrase(currentWeather.weatherCode, currentWeather.isDay)}.
                      </h1>
                      <p className="text-sm text-white/60">
                        {getWeatherSuggestion(
                          currentWeather.weatherCode,
                          currentWeather.temperature
                        )}
                      </p>
                    </>
                  )}
                </header>
              </>
            )}

            {loading && currentWeather && (
              <div className="border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-6">
                <SkeletonDetail />
              </div>
            )}

            {!loading && currentWeather && locationInfo && (
              <div
                ref={detailRef}
                className="animate-fadeIn border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-6"
              >
                {selectedDay ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-white/50">
                        {selectedDay.isHistory ? 'Historical Data' : 'Forecast'}
                      </span>
                      <button
                        onClick={() => setSelectedDay(null)}
                        className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
                      >
                        <svg
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Back to current
                      </button>
                    </div>
                    <SelectedDayDetail day={selectedDay} />
                  </>
                ) : (
                  <>
                    <div className="mb-4 text-xs uppercase tracking-widest text-white/70">
                      Current Conditions
                    </div>
                    <CurrentWeatherDetail weather={currentWeather} location={locationInfo} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right column — grid when data loaded, season strips on landing */}
          <div
            className={
              isLanding
                ? 'flex min-h-0 w-full flex-1 flex-col lg:w-1/2'
                : 'w-full lg:flex-1 lg:self-end'
            }
          >
            {loading && currentWeather && (
              <div className="border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-6">
                <SkeletonGrid />
              </div>
            )}

            {!loading && currentWeather && (history.length > 0 || forecast.length > 0) && (
              <div className="animate-fadeIn border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-6">
                <WeatherGrid
                  history={history}
                  forecast={forecast}
                  selectedDate={selectedDay?.date ?? null}
                  onSelect={setSelectedDay}
                />
              </div>
            )}

            {!currentWeather && (
              <div className="relative min-h-[240px] flex-1 overflow-hidden sm:min-h-[320px]">
                <SeasonStrips />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
