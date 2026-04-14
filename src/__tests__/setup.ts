import { afterEach, vi } from 'vitest'

// ResizeObserver is not available in jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Reset all mocks between tests so state never leaks across specs
afterEach(() => {
  vi.restoreAllMocks()
})
