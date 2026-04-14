export interface SearchResult {
  title: string
  description: string
  image: string
  url: string
  category: string
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'
