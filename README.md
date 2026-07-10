# Weather App

A weather application built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **City autocomplete** — typo-tolerant search powered by Fuse.js against a curated GeoNames dataset (cities with population > 15,000), ranked by prominence so major cities always surface first
- **Current weather** — temperature, feels-like, wind, humidity, pressure, precipitation, and day/night state
- **3-day forecast** — upcoming weather grid with clickable tiles
- **3-day history** — past weather from Open-Meteo's historical endpoint
- **Interactive selection** — clicking any day tile updates the main panel with full details for that day
- **Landing hero** — seasonal image strips on the landing page; full-bleed background with overlaid search on mobile, side-by-side layout on desktop
- **Dynamic background** — gradient changes based on weather condition code and day/night
- **localStorage caching** — weather responses cached for 30 minutes; refresh button clears cache
- **Skeleton loader** — pulse animation while data fetches
- **Toast notifications** — dismissible error toasts for network and API failures
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

`yarn build` outputs to `dist/` — this folder is generated and gitignored. Files like `dist/assets/index-*.js` are Vite's bundled output, not source files.

### 5. Deploy to GitHub Pages

```bash
yarn deploy
```

This builds the app and pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. In the repo's GitHub settings, set **Pages → Source** to the `gh-pages` branch (root). The app is served from `/weather-app/`, which is why `vite.config.ts` sets `base: '/weather-app/'` — if you fork this under a different repo name, update that value to match.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start the Vite dev server |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Serve the production build locally |
| `yarn lint` | Run ESLint on `src/` |
| `yarn test:run` | Run the test suite once |
| `yarn test` | Run tests in watch mode |
| `yarn test:ui` | Open the Vitest UI |
| `yarn deploy` | Build and publish `dist/` to the `gh-pages` branch |
| `yarn generate:cities` | Regenerate `public/cities.json` from GeoNames |

## Tests

```bash
yarn test:run    # single run
yarn test        # watch mode
yarn test:ui     # Vitest UI
```

The test suite covers:

- `weatherApi` — fetch, caching, WMO code mapping, error handling
- `SearchBar` — form submission, autocomplete, keyboard navigation, loading state
- `DayTile` — rendering, click handlers, ARIA attributes
- `WeatherGrid` — history/forecast rendering, tile selection toggle
- `CurrentWeatherDetail` / `SelectedDayDetail` — temperature, description, location, stat cards

Tests use Vitest with `@testing-library/jest-dom/vitest` for DOM matchers like `toBeInTheDocument`.

## Project structure

```
src/
  components/     UI components
  hooks/          useWeather — async state and data fetching
  services/       weatherApi, locationSearch
  types/          TypeScript interfaces (weather, city)
  utils/          weatherDisplay — phrases, suggestions, background classes
  assets/images/  Season strip WebP images (landing page)
public/
  cities.json     Generated city search dataset
scripts/
  ingest-cities.ts  GeoNames download and ingest script
```

## Design decisions & trade-offs

### Architecture

- **Single custom hook (`useWeather`)** manages all async state. Components stay presentational. In-flight requests are guarded so stale responses cannot overwrite newer ones.
- **Service layer (`weatherApi.ts`)** owns all fetch logic including caching. Tests stub `fetch` directly rather than mocking a library.
- **`locationSearch.ts`** handles autocomplete via Fuse.js and `public/cities.json` — no coupling to the weather API.
- **`weatherDisplay.ts`** holds landing-page copy, activity suggestions, and background gradient logic, separate from API mapping in `weatherApi.ts`.

### City search

- **Fuse.js + static dataset** rather than a hosted search engine. `public/cities.json` is generated once from GeoNames `cities15000.txt` (~25k cities with population > 15,000), fetched on first search, and cached in memory for the session.
- Fuzzy matching uses Levenshtein distance with a 0.35 threshold. Results are re-ranked by blending the Fuse match score with `log10(population)` so that a slightly fuzzier match against Tokyo will still beat a perfect match against a small town with the same name.
- Only ASCII-safe alternate names (≤ 30 chars, up to 6 per city) are stored to keep the file size manageable (~2–3 MB gzipped).
- Free-text search (without selecting a suggestion) falls back to Open-Meteo geocoding.

### Caching

- Uses `localStorage` with a 30-minute TTL per unique location. Survives page reloads without hammering the free-tier API. The refresh button calls `clearWeatherCache()` then re-fetches.
- Trade-off: localStorage has a ~5 MB cap. A production app would use an LRU eviction strategy or IndexedDB for larger payloads.

### Styling

- **Tailwind CSS v3** utility classes — no CSS-in-JS runtime overhead, co-located styles, tree-shakeable. Custom `fadeIn` and `slideUp` animations are declared in `tailwind.config.js`.
- Dynamic gradient background based on WMO weather codes gives the UI a contextual feel without a large icon library.
- Season strip images are served as WebP (~2.7 MB total, resized to 1400px wide) for faster loads.

### API: Open-Meteo (not WeatherStack)

The assignment brief suggests WeatherStack. This app uses [Open-Meteo](https://open-meteo.com/) instead, for one blocking reason: **WeatherStack's free tier only returns current conditions** — both its historical and forecast endpoints require a paid plan. Since 3-day forecast and 3-day history are core requirements, WeatherStack's free tier can't satisfy them without either paying for a plan or faking the data.

Open-Meteo's free tier has no such restriction and needs no API key, so it was used instead:

- **Geocoding**: when a user submits a city name by text (without selecting from the dropdown), `geocoding-api.open-meteo.com` resolves it to coordinates.
- **Weather**: single request using `past_days=3&forecast_days=4` returns current conditions + 7 days of real (not simulated) daily data in one call. Indices 0–2 become history tiles; 4–6 become forecast tiles.
- WMO weather codes are mapped locally to descriptions and emojis — no external icon CDN needed.

Trade-off: this swap means the app doesn't demonstrate WeatherStack-specific integration (e.g. its response shape or auth) if that was the intent of naming it in the brief. Given a choice between a partially-functional app built against the specified vendor or a fully-functional one against a different vendor, this project prioritized meeting the actual feature requirements.

### Testing

- **Vitest + Testing Library** — fast, Vite-native test runner. Tests exercise real component behavior (clicks, form submission, ARIA attributes) rather than implementation details.
- Mocks are applied at module boundaries (`vi.mock('../services/locationSearch')` in component tests; `fetch` stubbed directly in service tests).

### Git hooks

Pre-commit runs `yarn test:run` and `lint-staged` (ESLint + Prettier on `src/`, Prettier only on `scripts/`).
