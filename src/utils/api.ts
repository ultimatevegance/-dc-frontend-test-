import type { SearchResult } from '../types'

const BASE_URL = 'https://frontend-test-api.digitalcreative.cn'
const REQUEST_TIMEOUT_MS = 8_000

// Set to false to simulate API throttling / timeout errors
const NO_THROTTLING = false

/**
 * Search for technologies used at DC.
 *
 * Pass an AbortSignal to support request cancellation (e.g. when the user
 * types a new character before the previous response arrives).
 */
export async function searchTechnologies(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const url = new URL(BASE_URL)
  url.searchParams.set('no-throttling', String(NO_THROTTLING))
  url.searchParams.set('search', query.trim())

  // Combine the caller's signal with a hard timeout
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const combinedSignal =
    signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

  const response = await fetch(url.toString(), { signal: combinedSignal })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()

  // When no-throttling=false the API returns an error object instead of an array
  if (!Array.isArray(data)) {
    throw new Error(data?.error ?? 'Unexpected response format')
  }

  return data as SearchResult[]
}
