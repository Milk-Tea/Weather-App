import { useState, useRef, useEffect } from 'react'

import { useWeather } from './hooks/useWeather'
import { SearchBar } from './components/SearchBar'
import { CurrentWeatherDetail, SelectedDayDetail } from './components/WeatherDetail'
import { WeatherGrid } from './components/WeatherGrid'
import { Toast } from './components/Toast'
import { SkeletonDetail, SkeletonGrid } from './components/SkeletonLoader'
import { SeasonStrips } from './components/SeasonStrips'
import { getBackgroundClass, getWeatherPhrase, getWeatherSuggestion } from './utils/weatherDisplay'
import type { DayData, GeocodingResult } from './types/weather'

interface LocationSearchProps {
  onSearch: (location: string) => void
  onSelectSuggestion: (result: GeocodingResult) => void
  loading: boolean
  notFoundError: string | null
}

function LocationSearch({
  onSearch,
  onSelectSuggestion,
  loading,
  notFoundError,
}: LocationSearchProps) {
  return (
    <div className="flex flex-col gap-2">
      <SearchBar onSearch={onSearch} onSelectSuggestion={onSelectSuggestion} loading={loading} />
      {notFoundError && <p className="pl-1 text-sm text-red-400/90">{notFoundError}</p>}
    </div>
  )
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
  const notFoundError = error && errorKind === 'not-found' ? error : null

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

  const outerClass = isLanding
    ? 'min-h-screen bg-black transition-all duration-1000 lg:bg-gradient-to-br lg:from-black lg:via-gray-950 lg:to-black'
    : `min-h-screen bg-gradient-to-br ${bgClass} transition-all duration-1000`

  return (
    <div className={outerClass}>
      {error && errorKind === 'other' && <Toast message={error} onDismiss={clearError} />}
      <div
        className={`min-h-screen ${
          isLanding ? 'lg:flex lg:items-center lg:backdrop-blur-sm' : 'flex backdrop-blur-sm'
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-[1440px] flex-col sm:gap-6 lg:flex-row lg:py-12 ${
            isLanding
              ? 'relative min-h-screen gap-0 p-0 sm:p-0 lg:min-h-0 lg:items-stretch lg:gap-8 lg:px-6 lg:py-12'
              : 'items-start gap-4 self-center px-4 py-6 sm:px-6 sm:py-8'
          }`}
        >
          {isLanding && (
            <div className="absolute inset-0 lg:hidden">
              <SeasonStrips />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />
            </div>
          )}

          {/* Left column — header, search, main panel */}
          <div
            className={`flex w-full flex-col gap-4 sm:gap-6 lg:w-1/2 ${
              isLanding
                ? 'relative z-10 min-h-screen justify-center px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[min(70vh,720px)] lg:justify-center lg:p-0'
                : 'self-center'
            }`}
          >
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
                  <h1 className="leading-2xl mb-1 text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl lg:text-[3rem] lg:text-white/90 lg:drop-shadow-none">
                    What&apos;s the weather like?
                  </h1>
                  <p className="text-sm text-white/75 drop-shadow-sm lg:text-white/50 lg:drop-shadow-none">
                    Search any city for its current conditions and 3-day forecast
                  </p>
                </header>
                <LocationSearch
                  onSearch={handleSearch}
                  onSelectSuggestion={handleSelectSuggestion}
                  loading={loading}
                  notFoundError={notFoundError}
                />
              </>
            ) : (
              <>
                <LocationSearch
                  onSearch={handleSearch}
                  onSelectSuggestion={handleSelectSuggestion}
                  loading={loading}
                  notFoundError={notFoundError}
                />
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
                        aria-label="Back to current weather"
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
                ? 'hidden min-h-0 w-full flex-1 flex-col lg:flex lg:w-1/2'
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
              <div className="relative min-h-[240px] flex-1 overflow-hidden sm:min-h-[320px] lg:min-h-[min(70vh,720px)]">
                <SeasonStrips />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
