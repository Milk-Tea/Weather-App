import { useState, useCallback } from 'react'
import { fetchWeatherData, clearWeatherCache } from '../services/weatherApi'
import type { CurrentWeatherData, LocationInfo, DayData } from '../types/weather'

export interface WeatherState {
  currentWeather: CurrentWeatherData | null
  locationInfo: LocationInfo | null
  forecast: DayData[]
  history: DayData[]
  loading: boolean
  error: string | null
  locationQuery: string
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    currentWeather: null,
    locationInfo: null,
    forecast: [],
    history: [],
    loading: false,
    error: null,
    locationQuery: '',
  })

  const search = useCallback(async (location: string) => {
    if (!location.trim()) return

    setState((prev) => ({ ...prev, loading: true, error: null, locationQuery: location }))

    try {
      const data = await fetchWeatherData(location)
      setState((prev) => ({
        ...prev,
        currentWeather: data.currentWeather,
        locationInfo: data.locationInfo,
        forecast: data.forecast,
        history: data.history,
        loading: false,
        error: null,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch weather data',
      }))
    }
  }, [])

  const refresh = useCallback(
    (location: string) => {
      clearWeatherCache()
      return search(location)
    },
    [search]
  )

  return { ...state, search, refresh }
}
