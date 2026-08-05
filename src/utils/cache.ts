const TTL_MS = 10 * 60 * 1000
const STORAGE_KEY = 'district-news-cache-v2'

export interface CacheEntry<T> {
  fetchedAt: number
  data: T
}

type CacheMap = Record<string, CacheEntry<unknown>>

function readStorage(): CacheMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as CacheMap
  } catch {
    return {}
  }
}

function writeStorage(map: CacheMap) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // quota / private mode — ignore
  }
}

const memory: CacheMap = readStorage()

export function getCached<T>(key: string): CacheEntry<T> | null {
  const entry = memory[key] as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > TTL_MS) {
    delete memory[key]
    writeStorage(memory)
    return null
  }
  return entry
}

export function setCached<T>(key: string, data: T): void {
  memory[key] = { fetchedAt: Date.now(), data }
  writeStorage(memory)
}

export function districtsCacheKey(): string {
  return 'districts'
}

export function newsCacheKey(parts: {
  startDate: string
  period: number
  districtsKey: string
  page: number
}): string {
  return `news:${parts.startDate}|${parts.period}|${parts.districtsKey}|${parts.page}`
}
