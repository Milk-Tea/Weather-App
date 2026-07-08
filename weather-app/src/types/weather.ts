// Open-Meteo geocoding
export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  country_code: string
  timezone: string
  admin1?: string
}

// Open-Meteo forecast response
export interface OpenMeteoCurrentWeather {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  precipitation: number
  weather_code: number
  surface_pressure: number
  wind_speed_10m: number
  wind_direction_10m: number
  is_day: number
}

export interface OpenMeteoDailyWeather {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  wind_speed_10m_max: number[]
  wind_direction_10m_dominant: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
}

export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  timezone: string
  current: OpenMeteoCurrentWeather
  daily: OpenMeteoDailyWeather
}

// App-level types
export interface LocationInfo {
  name: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

export interface CurrentWeatherData {
  temperature: number
  feelslike: number
  humidity: number
  windSpeed: number
  windDir: string
  weatherCode: number
  pressure: number
  precipitation: number
  isDay: boolean
  description: string
  emoji: string
}

export interface DayData {
  date: string
  dateEpoch: number
  minTemp: number
  maxTemp: number
  avgTemp: number
  description: string
  emoji: string
  windSpeed: number
  windDir: string
  precip: number
  uvIndex: number
  sunrise: string
  sunset: string
  isHistory: boolean
}
