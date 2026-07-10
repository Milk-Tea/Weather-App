import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'

import { searchCities } from '../services/locationSearch'
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
  const requestIdRef = useRef(0)
  const skipSearchRef = useRef(false)
  const visibleSuggestions = value.trim().length >= 2 ? suggestions : []
  const isDropdownOpen = isOpen && visibleSuggestions.length > 0

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (skipSearchRef.current) {
      skipSearchRef.current = false
      return
    }

    if (value.trim().length < 2) {
      return
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current
      setIsFetching(true)
      try {
        const results = await searchCities(value)
        if (requestId !== requestIdRef.current) return
        setSuggestions(results)
        setIsOpen(results.length > 0)
        setActiveIndex(-1)
      } catch {
        if (requestId !== requestIdRef.current) return
        setSuggestions([])
        setIsOpen(false)
      } finally {
        if (requestId === requestIdRef.current) setIsFetching(false)
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
    skipSearchRef.current = true
    setValue(result.name)
    setIsOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
    onSelectSuggestion(result)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return

    // Cancel any pending debounce and invalidate in-flight requests
    if (debounceRef.current) clearTimeout(debounceRef.current)
    requestIdRef.current++
    setSuggestions([])
    setIsOpen(false)
    setIsFetching(false)

    if (activeIndex >= 0 && visibleSuggestions[activeIndex]) {
      handleSelect(visibleSuggestions[activeIndex])
    } else {
      onSearch(value.trim())
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isDropdownOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, visibleSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter city name"
            aria-label="Location search"
            aria-autocomplete="list"
            aria-expanded={isDropdownOpen}
            aria-controls="location-suggestions"
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            disabled={loading}
            className="w-full rounded-[6px] border border-white/20 bg-white/10 py-3 pr-9 pl-4 text-white placeholder-white/50
              transition-all duration-200 focus:border-white/50 focus:bg-white/15 focus:outline-none disabled:opacity-60"
          />
          {isFetching && (
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              <svg className="size-4 animate-spin text-white/40" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
          {value && !isFetching && (
            <button
              type="button"
              onClick={() => {
                setValue('')
                setSuggestions([])
                setIsOpen(false)
              }}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          aria-label="Search weather"
          className="flex-shrink-0 rounded-[6px] border border-white/20 bg-white/20 p-3 font-medium text-white
            transition-all duration-200 hover:bg-white/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="hidden sm:inline">Loading</span>
            </span>
          ) : (
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </button>
      </form>

      {isDropdownOpen && (
        <ul
          id="location-suggestions"
          role="listbox"
          aria-label="Location suggestions"
          className="absolute inset-x-0 top-full z-50 mt-1 animate-fadeIn overflow-hidden rounded-[6px]
            border border-white/20 bg-slate-800/95 shadow-2xl backdrop-blur-md"
        >
          {visibleSuggestions.map((result, i) => (
            <li
              key={result.id}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors select-none
                ${i === activeIndex ? 'bg-white/20' : 'hover:bg-white/10'}
                ${i > 0 ? 'border-t border-white/10' : ''}
              `}
            >
              <svg
                className="size-4 flex-shrink-0 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-white">{result.name}</span>
                {result.admin1 && (
                  <span className="ml-2 text-sm text-white/50">{result.admin1}</span>
                )}
              </div>
              <span className="flex-shrink-0 text-xs text-white/40">{result.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
