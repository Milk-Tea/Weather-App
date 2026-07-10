import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchBar } from './SearchBar'

vi.mock('../services/weatherApi', () => ({
  searchLocations: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: 'London',
      country: 'United Kingdom',
      country_code: 'GB',
      latitude: 51.5,
      longitude: -0.1,
      timezone: 'Europe/London',
      admin1: 'England',
    },
    {
      id: 2,
      name: 'Londonderry',
      country: 'United Kingdom',
      country_code: 'GB',
      latitude: 54.9,
      longitude: -7.3,
      timezone: 'Europe/London',
      admin1: 'Northern Ireland',
    },
  ]),
}))

const noop = () => {}

describe('given SearchBar is rendered with loading=false', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows a text input and a search button', () => {
    render(<SearchBar onSearch={noop} onSelectSuggestion={noop} loading={false} />)
    expect(screen.getByRole('textbox', { name: /location search/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search weather/i })).toBeInTheDocument()
  })

  it('does not submit when the input is empty', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} onSelectSuggestion={noop} loading={false} />)
    fireEvent.submit(screen.getByRole('search'))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('calls onSearch with the trimmed value on form submit', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} onSelectSuggestion={noop} loading={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  London  ' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(onSearch).toHaveBeenCalledWith('London')
  })
})

describe('given SearchBar is rendered with loading=true', () => {
  beforeEach(() => vi.clearAllMocks())

  it('disables the text input', () => {
    render(<SearchBar onSearch={noop} onSelectSuggestion={noop} loading={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('shows a loading label in the submit button', () => {
    render(<SearchBar onSearch={noop} onSelectSuggestion={noop} loading={true} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})

describe('given the user types 2 or more characters', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows autocomplete suggestions in a listbox', async () => {
    render(<SearchBar onSearch={noop} onSelectSuggestion={noop} loading={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lo' } })
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('Londonderry')).toBeInTheDocument()
  })
})

describe('given suggestions are displayed', () => {
  beforeEach(() => vi.clearAllMocks())

  async function renderWithSuggestions(onSelectSuggestion = noop) {
    render(<SearchBar onSearch={noop} onSelectSuggestion={onSelectSuggestion} loading={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lo' } })
    await waitFor(() => screen.getByRole('listbox'))
  }

  it('calls onSelectSuggestion with the result when a suggestion is clicked', async () => {
    const onSelectSuggestion = vi.fn()
    await renderWithSuggestions(onSelectSuggestion)
    fireEvent.mouseDown(screen.getByText('London'))
    expect(onSelectSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'London', country: 'United Kingdom' })
    )
  })

  it('closes the dropdown after a suggestion is selected', async () => {
    await renderWithSuggestions()
    fireEvent.mouseDown(screen.getByText('London'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('moves selection down on ArrowDown', async () => {
    await renderWithSuggestions()
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' })
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('moves selection down again on a second ArrowDown', async () => {
    await renderWithSuggestions()
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('closes the dropdown on Escape', async () => {
    await renderWithSuggestions()
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
