import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useSearch } from '../../composables/useSearch'

// Mock the API module so tests never hit the network
vi.mock('../../utils/api', () => ({
  searchTechnologies: vi.fn(),
}))

import { searchTechnologies } from '../../utils/api'
const mockApi = vi.mocked(searchTechnologies)

const MOCK_RESULTS = [
  {
    title: 'Vue',
    description: 'The Progressive JavaScript Framework',
    image: '',
    url: 'https://vuejs.org',
    category: 'Languages & Frameworks',
  },
]

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockApi.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ── Initial state ──────────────────────────────────────────────────────────

  it('starts in idle state with no results', () => {
    const { status, results, query } = useSearch()

    expect(status.value).toBe('idle')
    expect(results.value).toEqual([])
    expect(query.value).toBe('')
  })

  // ── Debounce ───────────────────────────────────────────────────────────────

  it('does not call the API before the 300 ms debounce window', async () => {
    const { query } = useSearch()
    query.value = 'vue'
    await nextTick()

    vi.advanceTimersByTime(299)
    expect(mockApi).not.toHaveBeenCalled()
  })

  it('calls the API exactly once after the debounce window', async () => {
    const { query } = useSearch()
    query.value = 'vue'
    await nextTick()

    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(mockApi).toHaveBeenCalledOnce()
    expect(mockApi).toHaveBeenCalledWith('vue', expect.any(AbortController['prototype'].constructor ? AbortSignal : Object))
  })

  it('debounces rapid keystrokes — only the last query fires', async () => {
    const { query } = useSearch()

    query.value = 'v'
    await nextTick()
    vi.advanceTimersByTime(100)

    query.value = 'vu'
    await nextTick()
    vi.advanceTimersByTime(100)

    query.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(mockApi).toHaveBeenCalledOnce()
    expect(mockApi).toHaveBeenCalledWith('vue', expect.anything())
  })

  // ── Status transitions ─────────────────────────────────────────────────────

  it('sets status to loading while the request is in-flight', async () => {
    let resolveRequest!: (v: typeof MOCK_RESULTS) => void
    mockApi.mockReturnValue(new Promise((r) => (resolveRequest = r)))

    const { query, status } = useSearch()
    query.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)

    expect(status.value).toBe('loading')

    resolveRequest(MOCK_RESULTS)
    await flushPromises()
  })

  it('sets status to success and populates results on a non-empty response', async () => {
    mockApi.mockResolvedValue(MOCK_RESULTS)

    const { query, status, results } = useSearch()
    query.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(status.value).toBe('success')
    expect(results.value).toEqual(MOCK_RESULTS)
  })

  it('sets status to empty when the API returns an empty array', async () => {
    mockApi.mockResolvedValue([])

    const { query, status, results } = useSearch()
    query.value = 'xyzunknown'
    await nextTick()
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(status.value).toBe('empty')
    expect(results.value).toEqual([])
  })

  it('sets status to error and provides a message when the API throws', async () => {
    mockApi.mockRejectedValue(new Error('Network error'))

    const { query, status, errorMessage } = useSearch()
    query.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(status.value).toBe('error')
    expect(errorMessage.value).toBeTruthy()
  })

  it('ignores AbortError — does not change status to error', async () => {
    mockApi.mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }))

    const { query, status } = useSearch()
    query.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(status.value).not.toBe('error')
  })

  // ── Clearing ───────────────────────────────────────────────────────────────

  it('resets to idle immediately when query is set to empty string', async () => {
    mockApi.mockResolvedValue(MOCK_RESULTS)

    const { query, status } = useSearch()
    query.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(status.value).toBe('success')

    query.value = ''
    await nextTick()
    expect(status.value).toBe('idle')
  })

  it('clearSearch resets query, results, status, and errorMessage', async () => {
    mockApi.mockResolvedValue(MOCK_RESULTS)

    const { query, status, results, errorMessage, clearSearch } = useSearch()
    query.value = 'vue'
    await nextTick()
    vi.advanceTimersByTime(300)
    await flushPromises()

    clearSearch()
    expect(query.value).toBe('')
    expect(status.value).toBe('idle')
    expect(results.value).toEqual([])
    expect(errorMessage.value).toBe('')
  })
})
