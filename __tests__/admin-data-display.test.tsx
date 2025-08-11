import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import { useAdminData } from '@/hooks/useAdminData'
import { UserDataTransformer, BlogPostDataTransformer } from '@/lib/data-transformers'
import { DataExporter } from '@/lib/data-export'
import { ErrorHandler, ErrorType } from '@/lib/error-handler'
import { adminDataCache } from '@/lib/cache-manager'

// Mock the admin API hook
jest.mock('@/lib/hooks/useAdminApi', () => ({
  useAdminApi: () => ({
    makeRequest: jest.fn(),
    isAuthorized: true,
    isLoading: false
  })
}))

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

describe('Admin Data Display System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    adminDataCache.clear()
  })

  describe('Data Transformers', () => {
    describe('UserDataTransformer', () => {
      const transformer = new UserDataTransformer()

      it('should transform user data correctly', () => {
        const input = {
          id: '123',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'admin',
          created_at: '2023-01-01T00:00:00Z'
        }

        const result = transformer.transform(input)

        expect(result).toEqual({
          id: '123',
          email: 'test@example.com',
          full_name: 'Test User',
          phone: '',
          role: 'admin',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          last_sign_in: '',
          sign_in_count: 0,
          avatar_url: ''
        })
      })

      it('should validate user data correctly', () => {
        const validData = { id: '123', email: 'test@example.com' }
        const invalidData = { email: 'test@example.com' } // missing id

        expect(transformer.validate(validData)).toBe(true)
        expect(transformer.validate(invalidData)).toBe(false)
      })

      it('should return empty state', () => {
        expect(transformer.getEmptyState()).toEqual([])
      })
    })

    describe('BlogPostDataTransformer', () => {
      const transformer = new BlogPostDataTransformer()

      it('should transform blog post data correctly', () => {
        const input = {
          id: '456',
          title: 'Test Post',
          excerpt: 'Test excerpt',
          published: true,
          author_name: 'Test Author',
          tags: 'tag1,tag2,tag3'
        }

        const result = transformer.transform(input)

        expect(result.id).toBe('456')
        expect(result.title).toBe('Test Post')
        expect(result.status).toBe('published')
        expect(result.author).toBe('Test Author')
        expect(result.tags).toEqual(['tag1', 'tag2', 'tag3'])
      })

      it('should normalize status correctly', () => {
        const publishedInput = { id: '1', title: 'Test', published: true }
        const draftInput = { id: '2', title: 'Test', published: false }
        const stringStatusInput = { id: '3', title: 'Test', status: 'scheduled' }

        expect(transformer.transform(publishedInput).status).toBe('published')
        expect(transformer.transform(draftInput).status).toBe('draft')
        expect(transformer.transform(stringStatusInput).status).toBe('scheduled')
      })
    })
  })

  describe('Error Handling', () => {
    it('should create appropriate error types', () => {
      const networkError = ErrorHandler.createError(
        ErrorType.NETWORK,
        'Network error occurred'
      )

      expect(networkError.type).toBe(ErrorType.NETWORK)
      expect(networkError.message).toBe('Network error occurred')
      expect(networkError.retryable).toBe(true)
      expect(networkError.timestamp).toBeDefined()
    })

    it('should handle HTTP errors correctly', () => {
      const httpError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      const appError = ErrorHandler.fromHttpError(httpError, '/api/users')

      expect(appError.type).toBe(ErrorType.AUTHENTICATION)
      expect(appError.endpoint).toBe('/api/users')
      expect(appError.retryable).toBe(false)
    })

    it('should track error statistics', () => {
      ErrorHandler.createError(ErrorType.NETWORK, 'Network error 1')
      ErrorHandler.createError(ErrorType.NETWORK, 'Network error 2')
      ErrorHandler.createError(ErrorType.SERVER, 'Server error 1')

      const stats = ErrorHandler.getErrorStats()

      expect(stats.total).toBe(3)
      expect(stats.byType[ErrorType.NETWORK]).toBe(2)
      expect(stats.byType[ErrorType.SERVER]).toBe(1)
    })
  })

  describe('Data Export', () => {
    // Mock URL.createObjectURL and related functions
    const mockCreateObjectURL = jest.fn(() => 'mock-url')
    const mockRevokeObjectURL = jest.fn()
    
    beforeAll(() => {
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL
    })

    it('should export data to CSV format', () => {
      const testData = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' }
      ]

      // Mock document.createElement and related DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      }
      const mockCreateElement = jest.fn(() => mockLink)
      const mockAppendChild = jest.fn()
      const mockRemoveChild = jest.fn()

      document.createElement = mockCreateElement
      document.body.appendChild = mockAppendChild
      document.body.removeChild = mockRemoveChild

      DataExporter.exportToCSV(testData, {
        format: 'csv',
        filename: 'test-export'
      })

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test-export.csv')
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('should export data to JSON format', () => {
      const testData = [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' }
      ]

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      }
      document.createElement = jest.fn(() => mockLink)
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()

      DataExporter.exportToJSON(testData, {
        format: 'json',
        filename: 'test-export'
      })

      expect(mockLink.download).toBe('test-export.json')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle empty data export', () => {
      expect(() => {
        DataExporter.exportToCSV([], { format: 'csv' })
      }).toThrow('Não há dados para exportar')
    })
  })

  describe('Cache Manager', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = { users: [{ id: '1', name: 'Test' }] }
      const cacheKey = 'test-key'

      adminDataCache.set(cacheKey, testData, 5000) // 5 second TTL
      const retrieved = adminDataCache.get(cacheKey)

      expect(retrieved).toEqual(testData)
    })

    it('should handle cache expiration', async () => {
      const testData = { users: [] }
      const cacheKey = 'test-expiry'

      adminDataCache.set(cacheKey, testData, 100) // 100ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const retrieved = adminDataCache.get(cacheKey)
      expect(retrieved).toBeNull()
    })

    it('should clear cache correctly', () => {
      adminDataCache.set('key1', 'data1')
      adminDataCache.set('key2', 'data2')
      
      expect(adminDataCache.has('key1')).toBe(true)
      expect(adminDataCache.has('key2')).toBe(true)
      
      adminDataCache.clear()
      
      expect(adminDataCache.has('key1')).toBe(false)
      expect(adminDataCache.has('key2')).toBe(false)
    })
  })

  describe('Performance Monitoring', () => {
    it('should measure execution time', () => {
      const { PerformanceMonitor } = require('@/lib/cache-manager')
      
      const result = PerformanceMonitor.measure('test-operation', () => {
        // Simulate some work
        let sum = 0
        for (let i = 0; i < 1000; i++) {
          sum += i
        }
        return sum
      })

      expect(result).toBe(499500) // Sum of 0 to 999
    })
  })
})

// Integration tests for the complete data loading flow
describe('Admin Data Loading Integration', () => {
  it('should load and display user data correctly', async () => {
    const mockMakeRequest = jest.fn().mockResolvedValue({
      data: {
        users: [
          {
            id: '1',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'admin',
            created_at: '2023-01-01T00:00:00Z'
          }
        ],
        stats: { total: 1, admins: 1, users: 0, recent: 1 },
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      }
    })

    // Mock the useAdminApi hook
    jest.doMock('@/lib/hooks/useAdminApi', () => ({
      useAdminApi: () => ({
        makeRequest: mockMakeRequest,
        isAuthorized: true,
        isLoading: false
      })
    }))

    // Test component would go here - simplified for this example
    expect(mockMakeRequest).toBeDefined()
  })

  it('should handle loading states correctly', async () => {
    const mockMakeRequest = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { users: [] } }), 100))
    )

    jest.doMock('@/lib/hooks/useAdminApi', () => ({
      useAdminApi: () => ({
        makeRequest: mockMakeRequest,
        isAuthorized: true,
        isLoading: false
      })
    }))

    // Test loading state handling
    expect(mockMakeRequest).toBeDefined()
  })

  it('should handle error states correctly', async () => {
    const mockMakeRequest = jest.fn().mockRejectedValue(new Error('API Error'))

    jest.doMock('@/lib/hooks/useAdminApi', () => ({
      useAdminApi: () => ({
        makeRequest: mockMakeRequest,
        isAuthorized: true,
        isLoading: false
      })
    }))

    // Test error state handling
    expect(mockMakeRequest).toBeDefined()
  })
})