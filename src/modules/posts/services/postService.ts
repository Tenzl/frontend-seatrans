import { API_CONFIG } from '@/shared/config/api.config'
import type { ApiResponse } from '@/shared/types/api.types'
import { apiClient } from '@/shared/utils/apiClient'

export interface CategoryResponse {
  id: number
  name: string
  slug: string
  description?: string | null
}

export interface Post {
  id: number
  title: string
  content: string
  summary: string | null
  authorId: number
  authorName: string
  categories: CategoryResponse[]
  thumbnailUrl: string | null
  publishedAt: string | null
  isPublished: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  readingTime?: number
  author?: { fullName?: string }
  tags?: string[]
}

export interface PostsPage {
  content: Post[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

function mapPost(raw: Post): Post {
  const text = raw.content?.replace(/<[^>]+>/g, ' ') || ''
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return {
    ...raw,
    content: raw.content || '',
    summary: raw.summary || null,
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    readingTime: words ? Math.max(1, Math.ceil(words / 200)) : undefined,
  }
}

const viewRecordInflight = new Map<number, Promise<number>>()

export const postService = {
  async getPublishedPostsPage(
    params: { page: number; size: number; category?: string; q?: string },
    signal?: AbortSignal
  ): Promise<PostsPage> {
    const query = new URLSearchParams({
      page: String(Math.max(0, params.page)),
      size: String(params.size),
    })
    if (params.category) query.set('category', params.category)
    if (params.q?.trim()) query.set('q', params.q.trim())
    const response = await apiClient.get<ApiResponse<PostsPage>>(`${API_CONFIG.POSTS.PUBLIC_BASE}?${query}`, {
      skipAuth: true,
      signal,
    })
    if (!response.ok) throw new Error('Unable to load articles')
    const result = await response.json()
    if (!result.success || !result.data || !Array.isArray(result.data.content)) {
      throw new Error(result.message || 'Invalid articles response')
    }
    return { ...result.data, content: result.data.content.map(mapPost) }
  },

  async getLatestPosts(limit = 5): Promise<Post[]> {
    const response = await apiClient.get<ApiResponse<Post[]>>(`${API_CONFIG.POSTS.LATEST}?limit=${limit}`, {
      skipAuth: true,
    })
    if (!response.ok) throw new Error('Unable to load latest articles')
    const result = await response.json()
    if (!result.success || !Array.isArray(result.data)) throw new Error('Invalid latest articles response')
    return result.data.map(mapPost)
  },

  async getPublicPostById(id: number, signal?: AbortSignal): Promise<Post> {
    const response = await apiClient.get<ApiResponse<Post>>(API_CONFIG.POSTS.PUBLIC_BY_ID(id), {
      skipAuth: true,
      signal,
    })
    if (!response.ok) throw new Error('Article not found')
    const result = await response.json()
    if (!result.success || !result.data) throw new Error('Article not found')
    return mapPost(result.data)
  },

  recordPostViewOnce(id: number): Promise<number> {
    const existing = viewRecordInflight.get(id)
    if (existing) return existing
    const request = (async () => {
      const response = await apiClient.post<ApiResponse<{ viewCount: number }>>(
        API_CONFIG.POSTS.PUBLIC_RECORD_VIEW(id),
        {},
        { skipAuth: true }
      )
      if (!response.ok) throw new Error('Unable to record article view')
      const result = await response.json()
      if (!result.success || !result.data) throw new Error('Invalid view response')
      return result.data.viewCount
    })().finally(() => viewRecordInflight.delete(id))
    viewRecordInflight.set(id, request)
    return request
  },
}
