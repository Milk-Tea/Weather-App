import { useState, type FormEvent } from 'react'

interface Props {
  onSearch: (location: string) => void
  loading: boolean
}

export function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onSearch(value.trim())
  }

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search city or country..."
            aria-label="Location search"
            disabled={loading}
            className="w-full pl-4 pr-9 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50
              focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200
              disabled:opacity-60"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
    </div>
  )
}
