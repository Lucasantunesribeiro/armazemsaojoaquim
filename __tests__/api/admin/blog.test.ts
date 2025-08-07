import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn()
  },
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    select: jest.fn(() => ({
      or: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn(() => ({
            order: jest.fn()
          }))
        }))
      })),
      not: jest.fn(() => ({})),
      range: jest.fn(() => ({
        order: jest.fn()
      })),
      order: jest.fn()
    }))
  }))
}

// Mock the server client creation
jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient))
}))

// Mock audit logger
jest.mock('@/lib/audit-logger', () => ({
  auditLogger: {
    logCreate: jest.fn().mockResolvedValue(undefined),
    logView: jest.fn().mockResolvedValue(undefined)
  }
}))

// Mock retry handler
jest.mock('@/lib/retry-handler', () => ({
  supabaseWithRetry: jest.fn((operation) => operation())
}))

describe('/api/admin/blog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/admin/blog', () => {
    it('should create a blog post successfully', async () => {
      // Mock authenticated admin session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'admin-user-id',
              email: 'armazemsaojoaquimoficial@gmail.com'
            }
          }
        }
      })

      // Mock successful blog post creation
      const mockPost = {
        id: 'post-123',
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is a test post with more than 50 characters to pass validation.',
        excerpt: 'Test excerpt',
        category: 'test',
        published: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: mockPost,
        error: null
      })

      // Import the handler after mocking
      const { POST } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Post',
          slug: 'test-post',
          content: 'This is a test post with more than 50 characters to pass validation.',
          excerpt: 'Test excerpt',
          category: 'test',
          published: false
        })
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(201)
      expect(responseData.success).toBe(true)
      expect(responseData.data.post.title).toBe('Test Post')
    })

    it('should return 401 for unauthenticated request', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      const { POST } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Post',
          slug: 'test-post',
          content: 'Test content with more than 50 characters.',
          excerpt: 'Test excerpt',
          category: 'test'
        })
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error.code).toBe('AUTHENTICATION_ERROR')
    })

    it('should return 403 for non-admin user', async () => {
      // Mock session with non-admin user
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'regular-user-id',
              email: 'user@example.com'
            }
          }
        }
      })

      const { POST } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Post',
          slug: 'test-post',
          content: 'Test content with more than 50 characters.',
          excerpt: 'Test excerpt',
          category: 'test'
        })
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData.success).toBe(false)
      expect(responseData.error.code).toBe('AUTHORIZATION_ERROR')
    })

    it('should return 400 for invalid data', async () => {
      // Mock authenticated admin session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'admin-user-id',
              email: 'armazemsaojoaquimoficial@gmail.com'
            }
          }
        }
      })

      const { POST } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '', // Invalid: empty title
          slug: 'Invalid Slug With Spaces', // Invalid slug format
          content: 'Short', // Invalid: less than 50 characters
          excerpt: 'Test excerpt',
          category: 'test'
        })
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error.code).toBe('VALIDATION_ERROR')
      expect(responseData.error.validationErrors).toBeDefined()
      expect(responseData.error.validationErrors.length).toBeGreaterThan(0)
    })

    it('should sanitize malicious input', async () => {
      // Mock authenticated admin session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'admin-user-id',
              email: 'armazemsaojoaquimoficial@gmail.com'
            }
          }
        }
      })

      // Mock successful creation but capture the input data
      let capturedData: any
      mockSupabaseClient.from().insert.mockImplementation((data) => {
        capturedData = data
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: { id: 'test-id', ...data },
              error: null
            })
          })
        }
      })

      const { POST } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '<script>alert("xss")</script>Safe Title',
          slug: 'safe-title',
          content: 'This is a test post with more than 50 characters to pass validation and onclick=evil() some malicious content.',
          excerpt: 'javascript:alert("xss") excerpt',
          category: 'test'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      
      // Check that malicious content was sanitized
      expect(capturedData.title).toBe('alert("xss")Safe Title') // < > removed
      expect(capturedData.content).not.toContain('onclick=') // Event handler removed
      expect(capturedData.excerpt).toBe('alert("xss") excerpt') // javascript: removed
    })
  })

  describe('GET /api/admin/blog', () => {
    it('should return blog posts successfully', async () => {
      // Mock authenticated admin session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'admin-user-id',
              email: 'armazemsaojoaquimoficial@gmail.com'
            }
          }
        }
      })

      const mockPosts = [
        {
          id: 'post-1',
          title: 'Post 1',
          slug: 'post-1',
          excerpt: 'Excerpt 1',
          category: 'tech',
          published: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'post-2',
          title: 'Post 2',
          slug: 'post-2',
          excerpt: 'Excerpt 2',
          category: 'lifestyle',
          published: false,
          created_at: '2024-01-02T00:00:00Z'
        }
      ]

      const mockCategories = [
        { category: 'tech' },
        { category: 'lifestyle' }
      ]

      // Mock posts query
      mockSupabaseClient.from().select().range().order.mockResolvedValue({
        data: mockPosts,
        count: 2,
        error: null
      })

      // Mock categories query
      mockSupabaseClient.from().select().not.mockResolvedValue({
        data: mockCategories,
        error: null
      })

      const { GET } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog?page=1&limit=20')

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.posts).toHaveLength(2)
      expect(responseData.data.pagination.total).toBe(2)
      expect(responseData.data.filters.categories).toEqual(['tech', 'lifestyle'])
    })

    it('should filter posts by category', async () => {
      // Mock authenticated admin session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'admin-user-id',
              email: 'armazemsaojoaquimoficial@gmail.com'
            }
          }
        }
      })

      const techPosts = [
        {
          id: 'post-1',
          title: 'Tech Post',
          category: 'tech',
          published: true
        }
      ]

      // Track if category filter was applied
      let categoryFilterApplied = false
      const mockEq = jest.fn((field, value) => {
        if (field === 'category' && value === 'tech') {
          categoryFilterApplied = true
        }
        return {
          range: () => ({
            order: () => Promise.resolve({
              data: techPosts,
              count: 1,
              error: null
            })
          })
        }
      })

      mockSupabaseClient.from().select().eq = mockEq
      mockSupabaseClient.from().select().not.mockResolvedValue({
        data: [{ category: 'tech' }],
        error: null
      })

      const { GET } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog?category=tech')

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(categoryFilterApplied).toBe(true)
      expect(responseData.data.posts).toHaveLength(1)
      expect(responseData.data.posts[0].category).toBe('tech')
    })

    it('should search posts by title and content', async () => {
      // Mock authenticated admin session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'admin-user-id',
              email: 'armazemsaojoaquimoficial@gmail.com'
            }
          }
        }
      })

      // Track if search filter was applied
      let searchFilterApplied = false
      const mockOr = jest.fn((searchQuery) => {
        if (searchQuery.includes('test')) {
          searchFilterApplied = true
        }
        return {
          range: () => ({
            order: () => Promise.resolve({
              data: [],
              count: 0,
              error: null
            })
          })
        }
      })

      mockSupabaseClient.from().select().or = mockOr
      mockSupabaseClient.from().select().not.mockResolvedValue({
        data: [],
        error: null
      })

      const { GET } = await import('@/app/api/admin/blog/route')

      const request = new NextRequest('http://localhost:3000/api/admin/blog?search=test')

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(searchFilterApplied).toBe(true)
    })
  })
})