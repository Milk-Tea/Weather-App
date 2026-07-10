import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeatherGrid } from './WeatherGrid'
import type { DayData } from '../types/weather'

const historyDay: DayData = {
  date: 'Fri, Jan 12',
  dateEpoch: 1705017600,
  minTemp: 2,
  maxTemp: 8,
  avgTemp: 5,
  description: 'Overcast',
  emoji: '☁️',
  windSpeed: 10,
  windDir: 'SW',
  precip: 0.2,
  uvIndex: 1,
  sunrise: '08:10 AM',
  sunset: '03:58 PM',
  isHistory: true,
}

const forecastDay: DayData = {
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

describe('given history and forecast data', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the Past 3 Days and Next 3 Days headings', () => {
    render(
      <WeatherGrid
        history={[historyDay]}
        forecast={[forecastDay]}
        selectedDate={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getByText(/past 3 days/i)).toBeInTheDocument()
    expect(screen.getByText(/next 3 days/i)).toBeInTheDocument()
  })

  it('renders one tile per day', () => {
    render(
      <WeatherGrid
        history={[historyDay]}
        forecast={[forecastDay]}
        selectedDate={null}
        onSelect={() => {}}
      />
    )
    expect(screen.getAllByTestId('day-tile')).toHaveLength(2)
  })

  it('calls onSelect with the day when a tile is clicked', () => {
    const onSelect = vi.fn()
    render(
      <WeatherGrid
        history={[historyDay]}
        forecast={[forecastDay]}
        selectedDate={null}
        onSelect={onSelect}
      />
    )
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})

describe('given a tile is already selected', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onSelect with null when the same tile is clicked again', () => {
    const onSelect = vi.fn()
    render(
      <WeatherGrid
        history={[historyDay]}
        forecast={[forecastDay]}
        selectedDate={historyDay.date}
        onSelect={onSelect}
      />
    )
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
