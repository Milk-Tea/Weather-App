# Weather App

A weather application built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **City autocomplete** — typo-tolerant search powered by Fuse.js against a curated GeoNames dataset (cities with population > 15,000), ranked by prominence so major cities always surface first
- **Current weather** — temperature, feels-like, wind, humidity, pressure, precipitation, and day/night state
- **3-day forecast** — upcoming weather grid with clickable tiles
- **3-day history** — past weather from Open-Meteo's historical endpoint
- **Interactive selection** — clicking any day tile updates the main panel with full details for that day
- **Dynamic background** — gradient changes based on weather condition code and day/night
- **localStorage caching** — weather responses cached for 30 minutes; refresh button clears cache
- **Skeleton loader** — pulse animation while data fetches
- **Animated transitions** — fade-in and slide-up animations on load
- **Responsive design** — works on mobile and desktop

## Setup

No API keys required — weather data comes from [Open-Meteo](https://open-meteo.com/) (free and open), and city search runs entirely client-side.

### 1. Install dependencies

```bash
yarn install
```

### 2. Generate the cities dataset

This downloads the GeoNames `cities15000.txt` file and writes `public/cities.json`. Only needs to be run once.

```bash
yarn generate:cities
```

### 3. Run the development server

```bash
yarn dev
```

Open `http://localhost:5173`.

### 4. Build for production

```bash
yarn build
yarn preview
```

## Tests

```bash
yarn test:run    # single run
yarn test        # watch mode
yarn test:ui     # Vitest UI
```

The test suite covers:
- `weatherApi` service — fetch, caching, WMO code mapping, error handling
- `SearchBar` — form submission, keyboard navigation, clear button, loading state
- `DayTile` — rendering, click handlers, ARIA attributes
- `WeatherGrid` — history/forecast rendering, tile selection toggle
- `CurrentWeatherDetail` / `SelectedDayDetail` — temperature, description, location, stat cards

## Design decisions & trade-offs

### Architecture

- **Single custom hook (`useWeather`)** manages all async state. Components stay presentational. This keeps data-fetching logic testable without mocking React state.
- **Service layer (`weatherApi.ts`)** owns all fetch logic including caching. Tests stub `fetch` directly rather than mocking a library, in keeping with the native Fetch API requirement.
- **`locationSearch.ts`** is a separate module for city search — it has no coupling to the weather API and can be swapped independently.

### City search

- **Fuse.js + static dataset** rather than a hosted search engine. `public/cities.json` is generated once from GeoNames `cities15000.txt` (~25k cities with population > 15,000), fetched on first search, and cached in memory for the session.
- Fuzzy matching uses Levenshtein distance with a 0.35 threshold. Results are re-ranked by blending the Fuse match score with `log10(population)` so that a slightly fuzzier match against Tokyo will still beat a perfect match against a small town with the same name.
- Only ASCII-safe alternate names (≤ 30 chars, up to 6 per city) are stored to keep the file size manageable (~2–3 MB gzipped).

### Caching

- Uses `localStorage` with a 30-minute TTL per unique location. Survives page reloads without hammering the free-tier API. The refresh button calls `clearWeatherCache()` then re-fetches.
- Trade-off: localStorage has a ~5 MB cap. A production app would use an LRU eviction strategy or IndexedDB for larger payloads.

### Styling

- **Tailwind CSS v3** utility classes — no CSS-in-JS runtime overhead, co-located styles, tree-shakeable. Custom `fadeIn` and `slideUp` animations are declared in `tailwind.config.js`.
- Dynamic gradient background based on WMO weather codes gives the UI a contextual feel without a large icon library.

### API: Open-Meteo

- **Geocoding**: when a user submits a city name by text (without selecting from the dropdown), `geocoding-api.open-meteo.com` resolves it to coordinates.
- **Weather**: single request using `past_days=3&forecast_days=4` returns current conditions + 7 days of daily data in one call. Indices 0–2 become history tiles; 4–6 become forecast tiles.
- WMO weather codes are mapped locally to descriptions and emojis — no external icon CDN needed.

### Testing

- **Vitest + Testing Library** — fast, Vite-native test runner. Tests exercise real component behavior (clicks, form submission, ARIA attributes) rather than implementation details.
- No snapshot tests — they break on minor style changes and add noise without catching real regressions.
