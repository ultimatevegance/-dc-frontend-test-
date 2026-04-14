import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import SearchBox from '../../components/SearchBox/SearchBox.vue'
import type { SearchResult, SearchStatus } from '../../types'

// Control the composable state from outside the component
const mockQuery = ref('')
const mockResults = ref<SearchResult[]>([])
const mockStatus = ref<SearchStatus>('idle')
const mockErrorMessage = ref('')
const mockClearSearch = vi.fn()

vi.mock('../../composables/useSearch', () => ({
  useSearch: () => ({
    query: mockQuery,
    results: mockResults,
    status: mockStatus,
    errorMessage: mockErrorMessage,
    clearSearch: mockClearSearch,
  }),
}))

const MOCK_RESULTS = [
  { title: 'Vue', description: 'Progressive framework', image: '', url: 'https://vuejs.org', category: 'Languages & Frameworks' },
  { title: 'React', description: 'UI library', image: '', url: 'https://react.dev', category: 'Languages & Frameworks' },
]

describe('SearchBox', () => {
  beforeEach(() => {
    mockQuery.value = ''
    mockResults.value = []
    mockStatus.value = 'idle'
    mockErrorMessage.value = ''
    mockClearSearch.mockClear()
  })

  // ── Structure ────────────────────────────────────────────────────────────

  it('renders a search input', () => {
    const wrapper = mount(SearchBox)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('renders all four quick-filter tags', () => {
    const wrapper = mount(SearchBox)
    const tags = wrapper.findAll('button')
    const labels = tags.map((t) => t.text())
    expect(labels).toContain('Languages')
    expect(labels).toContain('Build')
    expect(labels).toContain('Design')
    expect(labels).toContain('Cloud')
  })

  // ── State: loading ───────────────────────────────────────────────────────

  it('shows a spinner when status is loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mount(SearchBox)
    await flushPromises()
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
  })

  it('shows "Searching ..." in the footer when loading', async () => {
    mockStatus.value = 'loading'
    const wrapper = mount(SearchBox)
    await flushPromises()
    expect(wrapper.text()).toContain('Searching')
  })

  // ── State: success ───────────────────────────────────────────────────────

  it('renders result items when status is success', async () => {
    mockStatus.value = 'success'
    mockResults.value = MOCK_RESULTS
    const wrapper = mount(SearchBox)
    await flushPromises()
    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.text()).toContain('React')
  })

  it('shows the result count in the footer', async () => {
    mockStatus.value = 'success'
    mockResults.value = MOCK_RESULTS
    const wrapper = mount(SearchBox)
    await flushPromises()
    expect(wrapper.text()).toContain('2 results')
  })

  it('shows "1 result" (singular) when there is exactly one result', async () => {
    mockStatus.value = 'success'
    mockResults.value = [MOCK_RESULTS[0]]
    const wrapper = mount(SearchBox)
    await flushPromises()
    expect(wrapper.text()).toContain('1 result')
    expect(wrapper.text()).not.toContain('1 results')
  })

  // ── State: empty ─────────────────────────────────────────────────────────

  it('shows "No result" in the footer when status is empty', async () => {
    mockStatus.value = 'empty'
    const wrapper = mount(SearchBox)
    await flushPromises()
    expect(wrapper.text()).toContain('No result')
  })

  // ── State: error ─────────────────────────────────────────────────────────

  it('shows the error message in the footer when status is error', async () => {
    mockStatus.value = 'error'
    mockErrorMessage.value = 'Something went wrong but this is not your fault :)'
    const wrapper = mount(SearchBox)
    await flushPromises()
    expect(wrapper.text()).toContain('Something went wrong')
  })

  // ── Tag interaction ──────────────────────────────────────────────────────

  it('sets the query when a tag is clicked', async () => {
    const wrapper = mount(SearchBox)
    const languagesBtn = wrapper.findAll('button').find((b) => b.text().includes('Languages'))
    await languagesBtn?.trigger('click')
    expect(mockQuery.value).toBe('Languages')
  })

  it('highlights the matching tag as active', async () => {
    mockQuery.value = 'Languages'
    const wrapper = mount(SearchBox)
    await flushPromises()
    const activeTag = wrapper.findAll('button').find((b) => b.text().includes('Languages'))
    expect(activeTag?.classes()).toContain('bg-brand')
  })

  it('clears the query when the active tag is clicked again', async () => {
    mockQuery.value = 'Build'
    const wrapper = mount(SearchBox)
    const buildBtn = wrapper.findAll('button').find((b) => b.text().includes('Build'))
    await buildBtn?.trigger('click')
    expect(mockClearSearch).toHaveBeenCalledOnce()
  })

  // ── Keyboard navigation ──────────────────────────────────────────────────
  // Covers the bonus requirement: arrow key navigation between results

  it('ArrowDown on the input focuses the first result', async () => {
    mockStatus.value = 'success'
    mockResults.value = MOCK_RESULTS
    const wrapper = mount(SearchBox, { attachTo: document.body })
    await flushPromises()

    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    // focusedIndex = 0 → first result link should have the focused style
    const resultLinks = wrapper.findAll('a')
    expect(resultLinks[0].classes()).toContain('bg-result-hover')
    wrapper.unmount()
  })

  it('ArrowDown does nothing when there are no results', async () => {
    mockStatus.value = 'idle'
    mockResults.value = []
    const wrapper = mount(SearchBox, { attachTo: document.body })

    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    // No result links rendered — should not throw
    expect(wrapper.findAll('a')).toHaveLength(0)
    wrapper.unmount()
  })

  it('Escape on the input calls clearSearch', async () => {
    const wrapper = mount(SearchBox)
    await wrapper.find('input').trigger('keydown', { key: 'Escape' })
    expect(mockClearSearch).toHaveBeenCalledOnce()
  })

  it('ArrowDown on a result moves focus to the next result', async () => {
    mockStatus.value = 'success'
    mockResults.value = MOCK_RESULTS
    const wrapper = mount(SearchBox, { attachTo: document.body })
    await flushPromises()

    // Focus first result with ArrowDown from input
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    // ArrowDown from first result → should focus second result
    const resultLinks = wrapper.findAll('a')
    await resultLinks[0].trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(resultLinks[1].classes()).toContain('bg-result-hover')
    expect(resultLinks[0].classes()).not.toContain('bg-result-hover')
    wrapper.unmount()
  })

  it('ArrowUp on the first result returns focus to the input', async () => {
    mockStatus.value = 'success'
    mockResults.value = MOCK_RESULTS
    const wrapper = mount(SearchBox, { attachTo: document.body })
    await flushPromises()

    // Focus first result
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    // ArrowUp from first result → focusedIndex returns to -1 (no result highlighted)
    const resultLinks = wrapper.findAll('a')
    await resultLinks[0].trigger('keydown', { key: 'ArrowUp' })
    await nextTick()

    expect(resultLinks[0].classes()).not.toContain('bg-result-hover')
    wrapper.unmount()
  })

  it('ArrowDown on the last result does not go out of bounds', async () => {
    mockStatus.value = 'success'
    mockResults.value = MOCK_RESULTS
    const wrapper = mount(SearchBox, { attachTo: document.body })
    await flushPromises()

    const resultLinks = wrapper.findAll('a')
    const lastIndex = resultLinks.length - 1

    // Navigate to the last result
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    for (let i = 0; i < lastIndex; i++) {
      await resultLinks[i].trigger('keydown', { key: 'ArrowDown' })
      await nextTick()
    }

    // ArrowDown again — should stay on the last item, not crash
    await resultLinks[lastIndex].trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(resultLinks[lastIndex].classes()).toContain('bg-result-hover')
    wrapper.unmount()
  })

  it('Escape on a result calls clearSearch', async () => {
    mockStatus.value = 'success'
    mockResults.value = MOCK_RESULTS
    const wrapper = mount(SearchBox, { attachTo: document.body })
    await flushPromises()

    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    const resultLinks = wrapper.findAll('a')
    await resultLinks[0].trigger('keydown', { key: 'Escape' })
    expect(mockClearSearch).toHaveBeenCalled()
    wrapper.unmount()
  })
})
