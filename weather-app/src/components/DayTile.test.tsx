import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayTile } from './DayTile'
import type { DayData } from '../types/weather'

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

const historyDay: DayData = { ...forecastDay, date: 'Fri, Jan 12', isHistory: true }

describe('given a forecast day tile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the date and temperature range', () => {
    render(<DayTile day={forecastDay} isSelected={false} onClick={() => {}} />)
    expect(screen.getByText('Mon, Jan 15')).toBeInTheDocument()
    expect(screen.getByText('10°')).toBeInTheDocument()
    expect(screen.getByText('3°')).toBeInTheDocument()
  })

  it('renders the weather description', () => {
    render(<DayTile day={forecastDay} isSelected={false} onClick={() => {}} />)
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument()
  })

  it('renders the emoji with an accessible label', () => {
    render(<DayTile day={forecastDay} isSelected={false} onClick={() => {}} />)
    expect(screen.getByRole('img', { name: 'Partly cloudy' })).toBeInTheDocument()
  })

  it('shows the coming indicator', () => {
    render(<DayTile day={forecastDay} isSelected={false} onClick={() => {}} />)
    expect(screen.getByText(/coming/i)).toBeInTheDocument()
  })

  it('sets aria-pressed to false when not selected', () => {
    render(<DayTile day={forecastDay} isSelected={false} onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('given a history day tile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the past indicator', () => {
    render(<DayTile day={historyDay} isSelected={false} onClick={() => {}} />)
    expect(screen.getByText(/past/i)).toBeInTheDocument()
  })
})

describe('given the tile is selected', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets aria-pressed to true', () => {
    render(<DayTile day={forecastDay} isSelected={true} onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('given the tile is clicked', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<DayTile day={forecastDay} isSelected={false} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
