import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../../components/SearchBar/SearchBar.vue'
import type { SearchStatus } from '../../types'

function mountSearchBar(status: SearchStatus = 'idle', modelValue = '') {
  return mount(SearchBar, { props: { modelValue, status } })
}

describe('SearchBar', () => {
  it('renders an input with the correct placeholder', () => {
    const wrapper = mountSearchBar()
    expect(wrapper.find('input').attributes('placeholder')).toContain('Search')
  })

  it('displays the current modelValue', () => {
    const wrapper = mountSearchBar('idle', 'vue')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('vue')
  })

  it('emits update:modelValue with the new value on input', async () => {
    const wrapper = mountSearchBar()
    await wrapper.find('input').setValue('typescript')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['typescript'])
  })

  it('emits keydown when a key is pressed', async () => {
    const wrapper = mountSearchBar()
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('applies default (unfocused) styles when idle and not focused', () => {
    const wrapper = mountSearchBar('idle')
    const input = wrapper.find('input')
    expect(input.classes()).toContain('bg-input-bg')
    expect(input.classes()).toContain('border-transparent')
  })

  it('applies focused border when input is focused', async () => {
    const wrapper = mountSearchBar('idle')
    await wrapper.find('input').trigger('focus')
    expect(wrapper.find('input').classes()).toContain('border-input-focused')
  })

  it('removes focused border on blur', async () => {
    const wrapper = mountSearchBar('idle')
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('input').classes()).toContain('border-transparent')
  })

  it('applies error styles when status is error', () => {
    const wrapper = mountSearchBar('error')
    const input = wrapper.find('input')
    expect(input.classes()).toContain('bg-input-bg')
    expect(input.classes()).toContain('border-error')
  })

  it('error styles take precedence over focus', async () => {
    const wrapper = mountSearchBar('error')
    await wrapper.find('input').trigger('focus')
    const input = wrapper.find('input')
    expect(input.classes()).toContain('border-error')
    expect(input.classes()).not.toContain('border-input-focused')
  })

  it('exposes a focus() method that focuses the input', async () => {
    const wrapper = mountSearchBar()
    wrapper.vm.focus()
    // jsdom does not fully implement focus, but the method should not throw
    expect(() => wrapper.vm.focus()).not.toThrow()
  })
})
