import type {
  GeocodingResult,
  OpenMeteoResponse,
  LocationInfo,
  CurrentWeatherData,
  DayData,
} from '../types/weather'

export class LocationNotFoundError extends Error {
  constructor(query: string) {
    super(`No results found for "${query}"`)
    this.name = 'LocationNotFoundError'
  }
}

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// WMO weather interpretation codes → [description, day emoji, night emoji]
const WMO_MAP: Record<number, [string, string, string]> = {
  0: ['Clear sky', '☀️', '🌙'],
  1: ['Mainly clear', '🌤️', '🌤️'],
  2: ['Partly cloudy', '⛅', '⛅'],
  3: ['Overcast', '☁️', '☁️'],
  45: ['Fog', '🌫️', '🌫️'],
  48: ['Icy fog', '🌫️', '🌫️'],
  51: ['Light drizzle', '🌦️', '🌦️'],
  53: ['Moderate drizzle', '🌧️', '🌧️'],
  55: ['Dense drizzle', '🌧️', '🌧️'],
  61: ['Slight rain', '🌧️', '🌧️'],
  63: ['Moderate rain', '🌧️', '🌧️'],
  65: ['Heavy rain', '🌧️', '🌧️'],
  71: ['Slight snow', '🌨️', '🌨️'],
  73: ['Moderate snow', '❄️', '❄️'],
  75: ['Heavy snow', '❄️', '❄️'],
  77: ['Snow grains', '🌨️', '🌨️'],
  80: ['Slight showers', '🌦️', '🌦️'],
  81: ['Moderate showers', '🌧️', '🌧️'],
  82: ['Heavy showers', '⛈️', '⛈️'],
  85: ['Slight snow showers', '🌨️', '🌨️'],
  86: ['Heavy snow showers', '🌨️', '🌨️'],
  95: ['Thunderstorm', '⛈️', '⛈️'],
  96: ['Thunderstorm with hail', '⛈️', '⛈️'],
  99: ['Thunderstorm with heavy hail', '⛈️', '⛈️'],
}

export function getWMODescription(code: number): string {
  return WMO_MAP[code]?.[0] ?? 'Unknown'
}

export function getWMOEmoji(code: number, isDay: boolean): string {
  const entry = WMO_MAP[code]
  if (!entry) return '🌡️'
  return isDay ? entry[1] : entry[2]
}

export function degreesToCardinal(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// --- Caching ---

interface CacheEntry<T> {
  data: T
  timestamp: number
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

async function fetchJSON<T>(url: string, cacheKey: string): Promise<T> {
  const cached = getCached<T>(cacheKey)
  if (cached) return cached

  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  const data: T = await res.json()
  setCache(cacheKey, data)
  return data
}

// --- Geocoding ---

export async function geocode(query: string): Promise<LocationInfo> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  const cacheKey = `geo_${query.toLowerCase().trim()}`

  const data = await fetchJSON<{ results?: GeocodingResult[] }>(url, cacheKey)
  const result = data.results?.[0]
  if (!result) throw new LocationNotFoundError(query)

  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return []
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`
  const cacheKey = `geo_suggest_${query.toLowerCase().trim()}`
  const data = await fetchJSON<{ results?: GeocodingResult[] }>(url, cacheKey)
  return data.results ?? []
}

// --- Weather fetch ---

export async function fetchWeather(
  lat: number,
  lon: number,
  timezone: string
): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(','),
    past_days: '3',
    forecast_days: '4',
    wind_speed_unit: 'kmh',
  })

  const url = `${WEATHER_URL}?${params}`
  return fetchJSON<OpenMeteoResponse>(url, `weather_${lat}_${lon}`)
}

// --- Main entry point ---

export async function fetchWeatherData(location: string | LocationInfo): Promise<{
  locationInfo: LocationInfo
  currentWeather: CurrentWeatherData
  forecast: DayData[]
  history: DayData[]
}> {
  const locationInfo = typeof location === 'string' ? await geocode(location) : location
  const raw = await fetchWeather(
    locationInfo.latitude,
    locationInfo.longitude,
    locationInfo.timezone
  )

  const cur = raw.current
  const isDay = cur.is_day === 1
  const currentWeather: CurrentWeatherData = {
    temperature: Math.round(cur.temperature_2m),
    feelslike: Math.round(cur.apparent_temperature),
    humidity: cur.relative_humidity_2m,
    windSpeed: Math.round(cur.wind_speed_10m),
    windDir: degreesToCardinal(cur.wind_direction_10m),
    weatherCode: cur.weather_code,
    pressure: Math.round(cur.surface_pressure),
    precipitation: cur.precipitation,
    isDay,
    description: getWMODescription(cur.weather_code),
    emoji: getWMOEmoji(cur.weather_code, isDay),
  }

  const daily = raw.daily
  // past_days=3 + forecast_days=4 → 7 entries: [3dAgo, 2dAgo, yesterday, today, +1, +2, +3]
  function dayFromIndex(i: number, isHistory: boolean): DayData {
    const dateStr = daily.time[i]
    return {
      date: formatDate(dateStr),
      dateEpoch: new Date(dateStr).getTime() / 1000,
      minTemp: Math.round(daily.temperature_2m_min[i]),
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      avgTemp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
      description: getWMODescription(daily.weather_code[i]),
      emoji: getWMOEmoji(daily.weather_code[i], true),
      windSpeed: Math.round(daily.wind_speed_10m_max[i]),
      windDir: degreesToCardinal(daily.wind_direction_10m_dominant[i]),
      precip: daily.precipitation_sum[i],
      uvIndex: daily.uv_index_max[i],
      sunrise: formatTime(daily.sunrise[i]),
      sunset: formatTime(daily.sunset[i]),
      isHistory,
    }
  }

  const history = [0, 1, 2].map((i) => dayFromIndex(i, true))
  const forecast = [4, 5, 6].map((i) => dayFromIndex(i, false))

  return { locationInfo, currentWeather, forecast, history }
}

export function clearWeatherCache(): void {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('weather_') || key.startsWith('geo_'))) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))
}
