import AdmZip from 'adm-zip'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const CITIES_URL = 'https://download.geonames.org/export/dump/cities15000.zip'
const COUNTRY_URL = 'https://download.geonames.org/export/dump/countryInfo.txt'
const ADMIN1_URL  = 'https://download.geonames.org/export/dump/admin1CodesASCII.txt'

async function fetchText(url: string): Promise<string> {
  console.log(`Fetching ${url}...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed: ${url} (${res.status})`)
  return res.text()
}

async function fetchBuffer(url: string): Promise<Buffer> {
  console.log(`Fetching ${url}...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed: ${url} (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

function parseCountries(text: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue
    const cols = line.split('\t')
    if (cols.length > 4) map[cols[0]] = cols[4]
  }
  return map
}

function parseAdmin1(text: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const [code, name] = line.split('\t')
    if (code && name) map[code] = name
  }
  return map
}

export interface CityRecord {
  id:          number
  name:        string
  asciiname:   string
  aliases:     string[]
  country:     string
  country_code: string
  admin1:      string
  latitude:    number
  longitude:   number
  timezone:    string
  population:  number
}

function parseCities(
  text: string,
  countryMap: Record<string, string>,
  admin1Map:  Record<string, string>,
): CityRecord[] {
  const cities: CityRecord[] = []

  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    if (cols.length < 19 || cols[6] !== 'P') continue

    const countryCode = cols[8]
    const admin1Code  = cols[10]

    // Keep only short ASCII aliases to limit file size
    const aliases = cols[3]
      ? cols[3].split(',')
          .map(s => s.trim())
          .filter(s => s.length >= 2 && s.length <= 30 && /^[\x00-\x7F]+$/.test(s))
          .slice(0, 6)
      : []

    cities.push({
      id:           parseInt(cols[0], 10),
      name:         cols[1],
      asciiname:    cols[2],
      aliases,
      country:      countryMap[countryCode] ?? countryCode,
      country_code: countryCode,
      admin1:       admin1Map[`${countryCode}.${admin1Code}`] ?? '',
      latitude:     parseFloat(cols[4]),
      longitude:    parseFloat(cols[5]),
      timezone:     cols[17],
      population:   parseInt(cols[14], 10) || 0,
    })
  }

  return cities
}

async function main() {
  const [citiesBuffer, countryText, admin1Text] = await Promise.all([
    fetchBuffer(CITIES_URL),
    fetchText(COUNTRY_URL),
    fetchText(ADMIN1_URL),
  ])

  const zip    = new AdmZip(citiesBuffer)
  const cities = parseCities(
    zip.readAsText('cities15000.txt'),
    parseCountries(countryText),
    parseAdmin1(admin1Text),
  )

  console.log(`Parsed ${cities.length.toLocaleString()} cities`)

  // Sort by population descending so the JSON is pre-ordered
  cities.sort((a, b) => b.population - a.population)

  const outDir  = join(process.cwd(), 'public')
  const outPath = join(outDir, 'cities.json')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outPath, JSON.stringify(cities))
  console.log(`Written to public/cities.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
