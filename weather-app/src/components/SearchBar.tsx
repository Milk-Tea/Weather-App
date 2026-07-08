import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'

import { searchLocations } from '../services/weatherApi'
import type { GeocodingResult } from '../types/weather'

interface Props {
  onSearch: (location: string) => void
  onSelectSuggestion: (result: GeocodingResult) => void
  loading: boolean
}

export function SearchBar({ onSearch, onSelectSuggestion, loading }: Props) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsFetching(true)
      try {
        const results = await searchLocations(value)
        setSuggestions(results)
        setIsOpen(results.length > 0)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsFetching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleSelect(result: GeocodingResult) {
    setValue(result.name)
    setIsOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
    onSelectSuggestion(result)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex])
    } else {
      setIsOpen(false)
      onSearch(value.trim())
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search city or country..."
            aria-label="Location search"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="location-suggestions"
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50
              focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200
              disabled:opacity-60"
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="animate-spin h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          aria-label="Search weather"
          className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20
            text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading
            </span>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {isOpen && suggestions.length > 0 && (
        <ul
          id="location-suggestions"
          role="listbox"
          aria-label="Location suggestions"
          className="absolute z-50 top-full left-0 right-12 mt-1 bg-slate-800/95 backdrop-blur-md
            border border-white/20 rounded-xl overflow-hidden shadow-2xl animate-fadeIn"
        >
          {suggestions.map((result, i) => (
            <li
              key={result.id}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none
                ${i === activeIndex ? 'bg-white/20' : 'hover:bg-white/10'}
                ${i > 0 ? 'border-t border-white/10' : ''}
              `}
            >
              <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium">{result.name}</span>
                {result.admin1 && (
                  <span className="text-white/50 text-sm ml-2">{result.admin1}</span>
                )}
              </div>
              <span className="text-white/40 text-xs flex-shrink-0">{result.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
