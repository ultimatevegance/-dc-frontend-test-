import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultItem from '../../components/ResultItem/ResultItem.vue'
import type { SearchResult } from '../../types'

const MOCK_RESULT: SearchResult = {
  title: 'Vue',
  description: 'The Progressive JavaScript Framework',
  image: 'https://example.com/vue.png',
  url: 'https://vuejs.org',
  category: 'Languages & Frameworks',
}

describe('ResultItem', () => {
  it('renders the result title', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    expect(wrapper.text()).toContain('Vue')
  })

  it('renders the result description', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    expect(wrapper.text()).toContain('The Progressive JavaScript Framework')
  })

  it('links to the correct URL', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    expect(wrapper.find('a').attributes('href')).toBe('https://vuejs.org')
  })

  it('opens link in a new tab', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('has rel="noopener noreferrer" for security', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    expect(wrapper.find('a').attributes('rel')).toContain('noopener')
    expect(wrapper.find('a').attributes('rel')).toContain('noreferrer')
  })

  it('renders the logo image with correct src and alt', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe(MOCK_RESULT.image)
    expect(img.attributes('alt')).toBe(MOCK_RESULT.title)
  })

  it('applies focused styles when isFocused is true', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT, isFocused: true } })
    expect(wrapper.find('a').classes()).toContain('bg-result-hover')
  })

  it('does not apply focused styles when isFocused is false', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT, isFocused: false } })
    expect(wrapper.find('a').classes()).not.toContain('bg-result-hover')
  })

  it('emits keydown when a key is pressed', async () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    await wrapper.find('a').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('is keyboard accessible via tabindex', () => {
    const wrapper = mount(ResultItem, { props: { result: MOCK_RESULT } })
    expect(wrapper.find('a').attributes('tabindex')).toBe('0')
  })
})
