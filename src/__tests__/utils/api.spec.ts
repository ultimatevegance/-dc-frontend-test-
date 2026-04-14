import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchTechnologies } from '../../utils/api'

const mockResult = {
  title: 'Vue',
  description: 'The Progressive JavaScript Framework',
  image: 'https://example.com/vue.png',
  url: 'https://vuejs.org',
  category: 'Languages & Frameworks',
}

describe('searchTechnologies', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockResult]),
      }),
    )
  })

  it('calls the correct endpoint with the query', async () => {
    await searchTechnologies('vue')

    expect(fetch).toHaveBeenCalledOnce()
    const url = new URL((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string)
    expect(url.hostname).toBe('frontend-test-api.digitalcreative.cn')
    expect(url.searchParams.get('search')).toBe('vue')
  })

  it('includes the no-throttling param in the request', async () => {
    await searchTechnologies('vue')

    const url = new URL((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string)
    expect(url.searchParams.has('no-throttling')).toBe(true)
  })

  it('returns parsed JSON results', async () => {
    const results = await searchTechnologies('vue')
    expect(results).toEqual([mockResult])
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    )

    await expect(searchTechnologies('vue')).rejects.toThrow('500')
  })


  it('propagates AbortError when signal is aborted', async () => {
    const controller = new AbortController()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' })),
    )

    controller.abort()
    await expect(searchTechnologies('vue', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
