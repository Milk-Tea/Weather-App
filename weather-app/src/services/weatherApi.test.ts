import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  geocode,
  fetchWeather,
  fetchWeatherData,
  clearWeatherCache,
  getWMODescription,
  getWMOEmoji,
  degreesToCardinal,
  LocationNotFoundError,
} from './weatherApi'

const mockGeoResponse = {
  results: [
    {
      id: 2643743,
      name: 'London',
      latitude: 51.50853,
      longitude: -0.12574,
      country: 'United Kingdom',
      country_code: 'GB',
      timezone: 'Europe/London',
      admin1: 'England',
    },
  ],
}

const mockWeatherResponse = {
  latitude: 51.5,
  longitude: -0.125,
  timezone: 'Europe/London',
  current: {
    time: '2024-01-15T12:00',
    interval: 900,
    temperature_2m: 8.2,
    relative_humidity_2m: 75,
    apparent_temperature: 5.1,
    precipitation: 0,
    weather_code: 2,
    surface_pressure: 1012.3,
    wind_speed_10m: 15.4,
    wind_direction_10m: 270,
    is_day: 1,
  },
  daily: {
    time: [
      '2024-01-12',
      '2024-01-13',
      '2024-01-14',
      '2024-01-15',
      '2024-01-16',
      '2024-01-17',
      '2024-01-18',
    ],
    weather_code: [116, 122, 116, 2, 113, 116, 122],
    temperature_2m_max: [10, 9, 11, 8, 12, 11, 9],
    temperature_2m_min: [3, 2, 4, 3, 5, 4, 2],
    precipitation_sum: [0, 0.2, 0, 0, 0, 1.2, 0.5],
    wind_speed_10m_max: [18, 12, 15, 14, 10, 20, 16],
    wind_direction_10m_dominant: [270, 220, 250, 260, 180, 300, 240],
    sunrise: [
      '2024-01-12T08:10',
      '2024-01-13T08:09',
      '2024-01-14T08:08',
      '2024-01-15T08:06',
      '2024-01-16T08:05',
      '2024-01-17T08:04',
      '2024-01-18T08:03',
    ],
    sunset: [
      '2024-01-12T15:58',
      '2024-01-13T15:59',
      '2024-01-14T16:00',
      '2024-01-15T16:02',
      '2024-01-16T16:03',
      '2024-01-17T16:05',
      '2024-01-18T16:06',
    ],
    uv_index_max: [1, 1, 1, 2, 2, 1, 1],
  },
}

beforeEach(() => clearWeatherCache())
afterEach(() => {
  vi.restoreAllMocks()
  clearWeatherCache()
})

describe('given getWMODescription is called', () => {
  it('returns the description for a known code', () => {
    expect(getWMODescription(0)).toBe('Clear sky')
    expect(getWMODescription(63)).toBe('Moderate rain')
    expect(getWMODescription(95)).toBe('Thunderstorm')
  })

  it('returns Unknown for an unrecognised code', () => {
    expect(getWMODescription(999)).toBe('Unknown')
  })
})

describe('given getWMOEmoji is called', () => {
  it('returns the day emoji when isDay is true', () => {
    expect(getWMOEmoji(0, true)).toBe('☀️')
  })

  it('returns the night emoji when isDay is false', () => {
    expect(getWMOEmoji(0, false)).toBe('🌙')
  })

  it('returns the fallback emoji for an unrecognised code', () => {
    expect(getWMOEmoji(999, true)).toBe('🌡️')
  })
})

describe('given degreesToCardinal is called', () => {
  it('converts cardinal directions correctly', () => {
    expect(degreesToCardinal(0)).toBe('N')
    expect(degreesToCardinal(90)).toBe('E')
    expect(degreesToCardinal(180)).toBe('S')
    expect(degreesToCardinal(270)).toBe('W')
    expect(degreesToCardinal(45)).toBe('NE')
  })
})

describe('given geocode is called with a valid city', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves to a LocationInfo with name, country, and coordinates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => mockGeoResponse })
    )
    const result = await geocode('London')
    expect(result.name).toBe('London')
    expect(result.country).toBe('United Kingdom')
    expect(result.latitude).toBe(51.50853)
  })

  it('caches the result so subsequent calls skip the network', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockGeoResponse })
    vi.stubGlobal('fetch', mockFetch)
    await geocode('London')
    await geocode('London')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

describe('given geocode is called with an invalid city', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws when the API returns no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) })
    )
    await expect(geocode('Nonexistent City XYZ')).rejects.toThrow(LocationNotFoundError)
  })

  it('throws on an HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(geocode('London')).rejects.toThrow('HTTP error 500')
  })
})

describe('given fetchWeather is called', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns current conditions and 7 daily entries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => mockWeatherResponse })
    )
    const result = await fetchWeather(51.5, -0.125, 'Europe/London')
    expect(result.current.temperature_2m).toBe(8.2)
    expect(result.daily.time).toHaveLength(7)
  })

  it('caches per lat/lon so a second call skips the network', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockWeatherResponse })
    vi.stubGlobal('fetch', mockFetch)
    await fetchWeather(51.5, -0.125, 'Europe/London')
    await fetchWeather(51.5, -0.125, 'Europe/London')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

describe('given fetchWeatherData is called', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 3 history days and 3 forecast days', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse })
    )
    const result = await fetchWeatherData('London')
    expect(result.history).toHaveLength(3)
    expect(result.forecast).toHaveLength(3)
  })

  it('marks the first 3 daily entries as history and the last 3 as forecast', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse })
    )
    const { history, forecast } = await fetchWeatherData('London')
    expect(history.every((d) => d.isHistory)).toBe(true)
    expect(forecast.every((d) => !d.isHistory)).toBe(true)
  })

  it('rounds and maps current weather fields correctly', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse })
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse })
    )
    const { currentWeather } = await fetchWeatherData('London')
    expect(currentWeather.temperature).toBe(8)
    expect(currentWeather.humidity).toBe(75)
    expect(currentWeather.windDir).toBe('W')
    expect(currentWeather.isDay).toBe(true)
  })

  it('accepts a pre-resolved LocationInfo and skips geocoding', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockWeatherResponse })
    vi.stubGlobal('fetch', mockFetch)
    await fetchWeatherData({
      name: 'London',
      country: 'UK',
      latitude: 51.5,
      longitude: -0.125,
      timezone: 'Europe/London',
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

describe('given clearWeatherCache is called', () => {
  it('forces a fresh network request on the next fetch', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => mockGeoResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse })
    vi.stubGlobal('fetch', mockFetch)
    await fetchWeatherData('London')
    clearWeatherCache()
    await fetchWeatherData('London')
    expect(mockFetch).toHaveBeenCalledTimes(4)
  })
})
