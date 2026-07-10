import Fuse from 'fuse.js'

import type { GeocodingResult } from '../types/weather'
import type { CityRecord } from '../types/city'

let fuse: Fuse<CityRecord> | null = null

async function getIndex(): Promise<Fuse<CityRecord>> {
  if (fuse) return fuse

  const res = await fetch('/cities.json')
  if (!res.ok) throw new Error('Failed to load cities dataset')
  const cities: CityRecord[] = await res.json()

  fuse = new Fuse(cities, {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'asciiname', weight: 0.3 },
      { name: 'aliases', weight: 0.1 },
    ],
    threshold: 0.35,
    distance: 80,
    minMatchCharLength: 2,
    includeScore: true,
  })

  return fuse
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return []

  const index = await getIndex()
  const results = index.search(query, { limit: 20 })

  return results
    .sort((a, b) => {
      // Blend fuse score (0 = perfect) with log population so big cities win ties
      const logPop = (c: CityRecord) => Math.log10(c.population + 1)
      const scoreA = (a.score ?? 1) - logPop(a.item) * 0.04
      const scoreB = (b.score ?? 1) - logPop(b.item) * 0.04
      return scoreA - scoreB
    })
    .slice(0, 5)
    .map(({ item: d }) => ({
      id: d.id,
      name: d.name,
      country: d.country,
      country_code: d.country_code,
      admin1: d.admin1 || undefined,
      latitude: d.latitude,
      longitude: d.longitude,
      timezone: d.timezone,
    }))
}
