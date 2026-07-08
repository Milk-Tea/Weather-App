# Weather App

A weather application built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Current weather** — temperature, feels-like, wind, humidity, pressure, UV index, visibility
- **3-day forecast** — upcoming weather grid with clickable tiles
- **3-day history** — past weather pulled from WeatherStack's historical endpoint
- **Interactive selection** — clicking any day tile updates the main panel with full details for that day
- **Animated transitions** — fade-in and slide-up animations on load
- **Responsive design** — works on mobile and desktop
- **localStorage caching** — weather responses cached for 30 minutes; refresh button clears cache
- **Skeleton loader** — pulse animation while data fetches
- **Dynamic background** — gradient changes based on weather condition code and day/night

## Setup

No API key required — the app uses [Open-Meteo](https://open-meteo.com/), which is completely free and open.

### 1. Install dependencies

```bash
yarn install
```

### 2. Run the development server

```bash
yarn dev
```

Open `http://localhost:5173`.

### 3. Build for production

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
- `weatherApi` service — fetch, caching, error handling
- `SearchBar` — form submission, validation, loading state
- `DayTile` — rendering, click handlers, ARIA attributes
- `WeatherGrid` — history/forecast rendering, tile selection toggle
- `ErrorBanner` — accessibility role, dismiss callback
- `CurrentWeatherDetail` — temperature, description, location, stat cards

## Design decisions & trade-offs

### Architecture

- **Single custom hook (`useWeather`)** manages all async state. Components stay pure/presentational. This keeps the data fetching logic testable in isolation without needing to mock React state.
- **Service layer (`weatherApi.ts`)** owns all fetch logic including caching. Tests for this layer stub `fetch` directly rather than mocking a library, in keeping with the requirement to use the native Fetch API.

### Caching

- Uses `localStorage` with a 30-minute TTL. Each unique `(location, date)` combination gets its own key. This survives page reloads and avoids hammering the free-tier rate limit. The refresh button calls `clearWeatherCache()` then re-fetches.
- Trade-off: localStorage has a ~5 MB cap. If a user searches many cities the cache could fill up. A production app might use an LRU eviction strategy or IndexedDB for larger payloads.

### Styling

- **Tailwind CSS v3** via utility classes — no CSS-in-JS runtime overhead, co-located styles, tree-shakeable. Custom `fadeIn`/`slideUp` animations are declared in `tailwind.config.js`.
- Dynamic gradient background based on WeatherStack's `weather_code` field gives the UI a contextual feel without adding a large icon library.

### API: Open-Meteo

- **Geocoding**: city name → lat/lon via `geocoding-api.open-meteo.com`
- **Weather**: single request using `past_days=3&forecast_days=4` returns current conditions + 7 days of daily data in one call. Indices 0–2 become the history tiles; 4–6 become the forecast tiles.
- WMO weather codes are mapped locally to descriptions and emojis — no external icon CDN needed.

### Testing

- **Vitest + Testing Library** — fast, Vite-native test runner. Tests exercise real component behavior (clicks, form submission, ARIA attributes) rather than implementation details.
- No snapshot tests — they tend to break on minor style changes and add noise without catching regressions.
