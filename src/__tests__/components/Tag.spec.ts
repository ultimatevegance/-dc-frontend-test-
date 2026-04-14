import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tag from '../../components/Tag/Tag.vue'

describe('Tag', () => {
  it('renders the label text', () => {
    const wrapper = mount(Tag, { props: { label: 'Languages', active: false } })
    expect(wrapper.text()).toContain('Languages')
  })

  it('applies active styles when active is true', () => {
    const wrapper = mount(Tag, { props: { label: 'Languages', active: true } })
    expect(wrapper.find('button').classes()).toContain('bg-brand')
    expect(wrapper.find('button').classes()).toContain('text-white')
  })

  it('applies inactive styles when active is false', () => {
    const wrapper = mount(Tag, { props: { label: 'Languages', active: false } })
    expect(wrapper.find('button').classes()).toContain('text-brand')
    expect(wrapper.find('button').classes()).not.toContain('bg-brand')
  })

  it('emits click when clicked', async () => {
    const wrapper = mount(Tag, { props: { label: 'Languages', active: false } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emits click only once per click', async () => {
    const wrapper = mount(Tag, { props: { label: 'Build', active: false } })
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(2)
  })

  it('renders an SVG icon', () => {
    const wrapper = mount(Tag, { props: { label: 'Design', active: false } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
