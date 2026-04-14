import { ref, watch } from 'vue'
import type { SearchResult, SearchStatus } from '../types'
import { searchTechnologies } from '../utils/api'

const DEBOUNCE_MS = 300

/**
 * Composable that manages the full search lifecycle:
 *   - Debounced input watching
 *   - Request cancellation via AbortController
 *   - Status tracking (idle → loading → success | empty | error)
 *
 * Usage:
 *   const { query, results, status, errorMessage, clearSearch } = useSearch()
 */
export function useSearch() {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const status = ref<SearchStatus>('idle')
  const errorMessage = ref('')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let abortController: AbortController | null = null

  async function performSearch(searchQuery: string) {
    // Cancel any in-flight request before starting a new one
    abortController?.abort()
    abortController = new AbortController()

    status.value = 'loading'
    errorMessage.value = ''

    try {
      const data = await searchTechnologies(searchQuery, abortController.signal)
      results.value = data
      status.value = data.length > 0 ? 'success' : 'empty'
    } catch (err) {
      // Ignore cancellations — they're intentional
      if (err instanceof Error && err.name === 'AbortError') return

      results.value = []
      status.value = 'error'
      errorMessage.value = 'Something went wrong but this is not your fault :)'
    }
  }

  watch(query, (newQuery) => {
    if (debounceTimer !== null) clearTimeout(debounceTimer)

    if (!newQuery.trim()) {
      abortController?.abort()
      results.value = []
      status.value = 'idle'
      return
    }

    debounceTimer = setTimeout(() => {
      void performSearch(newQuery)
    }, DEBOUNCE_MS)
  })

  function clearSearch() {
    if (debounceTimer !== null) clearTimeout(debounceTimer)
    abortController?.abort()
    query.value = ''
    results.value = []
    status.value = 'idle'
    errorMessage.value = ''
  }

  return {
    query,
    results,
    status,
    errorMessage,
    clearSearch,
  }
}
