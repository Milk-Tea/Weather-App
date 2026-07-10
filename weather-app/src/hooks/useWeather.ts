import { useState, useRef } from 'react'

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
  const requestIdRef = useRef(0)

  async function search(location: string) {
    if (!location.trim()) return

    const requestId = ++requestIdRef.current
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      errorKind: null,
      locationQuery: location,
    }))

    try {
      const data = await fetchWeatherData(location)
      if (requestId !== requestIdRef.current) return

      setState((prev) => ({
        ...prev,
        currentWeather: data.currentWeather,
        locationInfo: data.locationInfo,
        forecast: data.forecast,
        history: data.history,
        loading: false,
        error: null,
        errorKind: null,
      }))
    } catch (err) {
      if (requestId !== requestIdRef.current) return

      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch weather data',
        errorKind: err instanceof LocationNotFoundError ? 'not-found' : 'other',
      }))
    }
  }

  async function selectLocation(result: GeocodingResult) {
    const locationInfo: LocationInfo = {
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
    }

    const requestId = ++requestIdRef.current
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      errorKind: null,
      locationQuery: result.name,
    }))

    try {
      const data = await fetchWeatherData(locationInfo)
      if (requestId !== requestIdRef.current) return

      setState((prev) => ({
        ...prev,
        currentWeather: data.currentWeather,
        locationInfo: data.locationInfo,
        forecast: data.forecast,
        history: data.history,
        loading: false,
        error: null,
        errorKind: null,
      }))
    } catch (err) {
      if (requestId !== requestIdRef.current) return

      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch weather data',
        errorKind: err instanceof LocationNotFoundError ? 'not-found' : 'other',
      }))
    }
  }

  function refresh(location: string) {
    clearWeatherCache()
    return search(location)
  }

  function clearError() {
    setState((prev) => ({ ...prev, error: null, errorKind: null }))
  }

  function reset() {
    requestIdRef.current++
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
  }

  return { ...state, search, selectLocation, refresh, clearError, reset }
}
