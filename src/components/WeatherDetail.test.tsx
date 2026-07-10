import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CurrentWeatherData, DayData, LocationInfo } from '../types/weather'
import { CurrentWeatherDetail, SelectedDayDetail } from './WeatherDetail'

const mockWeather: CurrentWeatherData = {
  temperature: 8,
  feelslike: 5,
  humidity: 75,
  windSpeed: 15,
  windDir: 'W',
  weatherCode: 2,
  pressure: 1012,
  precipitation: 0,
  isDay: true,
  description: 'Partly cloudy',
  emoji: '⛅',
}

const mockLocation: LocationInfo = {
  name: 'London',
  country: 'United Kingdom',
  latitude: 51.5,
  longitude: -0.1,
  timezone: 'Europe/London',
}

const mockForecastDay: DayData = {
  date: 'Mon, Jan 15',
  dateEpoch: 1705276800,
  minTemp: 3,
  maxTemp: 10,
  avgTemp: 7,
  description: 'Partly cloudy',
  emoji: '⛅',
  windSpeed: 15,
  windDir: 'W',
  precip: 0,
  uvIndex: 2,
  sunrise: '08:06 AM',
  sunset: '04:02 PM',
  isHistory: false,
}

const mockHistoryDay: DayData = { ...mockForecastDay, date: 'Fri, Jan 12', isHistory: true }

describe('given current weather data is rendered', () => {
  beforeEach(() => vi.clearAllMocks())

  it('displays the temperature', () => {
    render(<CurrentWeatherDetail weather={mockWeather} location={mockLocation} />)
    expect(screen.getByText(/8°/)).toBeInTheDocument()
  })

  it('displays the weather description', () => {
    render(<CurrentWeatherDetail weather={mockWeather} location={mockLocation} />)
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument()
  })

  it('displays the location name', () => {
    render(<CurrentWeatherDetail weather={mockWeather} location={mockLocation} />)
    expect(screen.getByText(/London/)).toBeInTheDocument()
  })

  it('renders the weather emoji with an accessible label', () => {
    render(<CurrentWeatherDetail weather={mockWeather} location={mockLocation} />)
    expect(screen.getByRole('img', { name: 'Partly cloudy' })).toBeInTheDocument()
  })

  it('shows humidity, wind, pressure, and feels-like stat cards', () => {
    render(<CurrentWeatherDetail weather={mockWeather} location={mockLocation} />)
    expect(screen.getByText(/humidity/i)).toBeInTheDocument()
    expect(screen.getByText(/wind/i)).toBeInTheDocument()
    expect(screen.getByText(/pressure/i)).toBeInTheDocument()
    expect(screen.getByText(/feels like/i)).toBeInTheDocument()
  })
})

describe('given a selected forecast day is rendered', () => {
  beforeEach(() => vi.clearAllMocks())

  it('displays the date', () => {
    render(<SelectedDayDetail day={mockForecastDay} />)
    expect(screen.getByText('Mon, Jan 15')).toBeInTheDocument()
  })

  it('shows the Forecast label', () => {
    render(<SelectedDayDetail day={mockForecastDay} />)
    expect(screen.getByText(/forecast/i)).toBeInTheDocument()
  })

  it('shows high and low temperatures', () => {
    render(<SelectedDayDetail day={mockForecastDay} />)
    expect(screen.getByText('10°')).toBeInTheDocument()
    expect(screen.getByText('3°')).toBeInTheDocument()
  })
})

describe('given a selected history day is rendered', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the Historical label', () => {
    render(<SelectedDayDetail day={mockHistoryDay} />)
    expect(screen.getByText(/historical/i)).toBeInTheDocument()
  })
})
