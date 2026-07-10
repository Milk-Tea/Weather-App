const WEATHER_PHRASES: Record<number, string> = {
  1: 'mostly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'foggy',
  51: 'drizzling',
  53: 'drizzling',
  55: 'heavily drizzling',
  61: 'rainy',
  63: 'rainy',
  65: 'heavily raining',
  71: 'snowy',
  73: 'snowy',
  75: 'heavily snowing',
  77: 'heavily snowing',
  80: 'showery',
  81: 'showery',
  82: 'showery',
  85: 'snowing with showers',
  86: 'snowing with showers',
  95: 'stormy',
  96: 'stormy',
  99: 'stormy',
}

type SuggestionRule = {
  match: (code: number, temp: number) => boolean
  suggestion: string
}

const SUGGESTION_RULES: SuggestionRule[] = [
  {
    match: (code, temp) => code === 0 && temp > 28,
    suggestion: 'Perfect day for the beach or pool.',
  },
  {
    match: (code, temp) => code === 0 && temp > 18,
    suggestion: 'Great time for a picnic or a walk in the park.',
  },
  {
    match: (code, temp) => code === 0 && temp > 8,
    suggestion: 'Perfect for a brisk walk outside.',
  },
  { match: (code) => code === 0, suggestion: 'Clear skies — bundle up and enjoy the fresh air.' },
  {
    match: (code, temp) => code <= 3 && temp > 20,
    suggestion: 'Good conditions for a run or outdoor sport.',
  },
  { match: (code) => code <= 3, suggestion: 'Nice enough for a coffee and a stroll.' },
  {
    match: (code) => code <= 48,
    suggestion: 'A cozy day — perfect for staying in with a good book.',
  },
  { match: (code) => code <= 55, suggestion: 'Light drizzle — ideal for a café visit.' },
  {
    match: (code) => code <= 67,
    suggestion: 'Keep an umbrella close. Great excuse for a movie night in.',
  },
  { match: (code) => code <= 77, suggestion: 'Time to build a snowman.' },
  {
    match: (code) => code <= 82,
    suggestion: 'Showers on and off — best to stay flexible with plans.',
  },
  {
    match: (code) => code <= 86,
    suggestion: 'Snow showers — perfect for a hot chocolate indoors.',
  },
]

export function getWeatherPhrase(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? 'clear and sunny' : 'clear'
  return WEATHER_PHRASES[code] ?? 'changeable'
}

export function getWeatherSuggestion(code: number, temp: number): string {
  return (
    SUGGESTION_RULES.find(({ match }) => match(code, temp))?.suggestion ??
    'Storm incoming — best to stay safe indoors.'
  )
}

export function getBackgroundClass(
  weatherCode: number | undefined,
  isDay: boolean | undefined
): string {
  if (weatherCode === undefined) return 'from-black via-gray-950 to-black'
  if (!isDay) return 'from-indigo-950 via-slate-900 to-indigo-900'

  if (weatherCode === 0) return 'from-sky-500 via-blue-400 to-cyan-300'
  if (weatherCode <= 3) return 'from-slate-500 via-sky-400 to-slate-400'
  if (weatherCode <= 48) return 'from-slate-600 via-slate-500 to-slate-400'
  if (weatherCode <= 67) return 'from-slate-700 via-blue-800 to-slate-600'
  if (weatherCode <= 77) return 'from-slate-300 via-blue-200 to-slate-200'
  if (weatherCode <= 82) return 'from-slate-600 via-blue-700 to-slate-500'

  return 'from-black via-gray-950 to-black'
}
