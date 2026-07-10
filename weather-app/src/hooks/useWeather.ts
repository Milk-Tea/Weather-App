import { useState, useCallback } from 'react'

import { fetchWeatherData, clearWeatherCache, LocationNotFoundError } from '../services/weatherApi'
import type { CurrentWeatherData, LocationInfo, DayData, GeocodingResult } from '../types/weather'

export interface WeatherState {
  currentWeather: CurrentWeatherData | null
  locationInfo: LocationInfo | null
  forecast: DayData[]
  history: DayData[]
  loading: boolean
  error: string | null
  errorKind: 'not-found' | 'other' | null
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
    errorKind: null,
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
        errorKind: err instanceof LocationNotFoundError ? 'not-found' : 'other',
      }))
    }
  }, [])

  const selectLocation = useCallback(async (result: GeocodingResult) => {
    const locationInfo: LocationInfo = {
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
    }

    setState((prev) => ({ ...prev, loading: true, error: null, locationQuery: result.name }))

    try {
      const data = await fetchWeatherData(locationInfo)
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
        errorKind: err instanceof LocationNotFoundError ? 'not-found' : 'other',
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

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, errorKind: null }))
  }, [])

  const reset = useCallback(() => {
    setState({
      currentWeather: null,
      locationInfo: null,
      forecast: [],
      history: [],
      loading: false,
      error: null,
      errorKind: null,
      locationQuery: '',
    })
  }, [])

  return { ...state, search, selectLocation, refresh, clearError, reset }
}
