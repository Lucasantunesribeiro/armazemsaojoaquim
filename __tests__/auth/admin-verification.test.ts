import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { verifyAdminStatus, ensureAdminProfile } from '@/lib/auth/admin-verification'
import { adminCache } from '@/lib/auth/cache'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}))

// Mock logging
jest.mock('@/lib/auth/logging', () => ({
  logAuthEvent: jest.fn()
}))

describe('Admin Verification', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  }

  const mockAdminUser = {
    id: 'admin-user-id',
    email: 'armazemsaojoaquimoficial@gmail.com'
  }

  beforeEach(() => {
    // Clear cache before each test
    adminCache.clear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    adminCache.clear()
  })

  describe('verifyAdminStatus', () => {
    it('should verify admin by email (Layer 1)', async () => {
      const result = await verifyAdminStatus(mockAdminUser)
      
      expect(result.isAdmin).toBe(true)
      expect(result.method).toBe('email')
    })

    it('should return false for non-admin email', async () => {
      const result = await verifyAdminStatus(mockUser)
      
      expect(result.isAdmin).toBe(false)
      expect(result.method).toBe('database')
    })

    it('should use cache when available (Layer 2)', async () => {
      // Set cache
      adminCache.set(mockUser.id, false)
      
      const result = await verifyAdminStatus(mockUser)
      
      expect(result.isAdmin).toBe(false)
      expect(result.method).toBe('cache')
    })

    it('should handle database errors gracefully', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const mockSupabase = createClient()
      
      // Mock database error
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const result = await verifyAdminStatus(mockUser)
      
      expect(result.isAdmin).toBe(false)
      expect(result.error).toContain('Not admin')
    })

    it('should use fallback for admin email on database error', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const mockSupabase = createClient()
      
      // Mock database error
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const result = await verifyAdminStatus(mockAdminUser)
      
      expect(result.isAdmin).toBe(true)
      expect(result.method).toBe('fallback')
    })

    it('should verify admin by database role (Layer 3)', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const mockSupabase = createClient()
      
      // Mock successful database response
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { role: 'admin', email: mockUser.email },
        error: null
      })

      const result = await verifyAdminStatus(mockUser)
      
      expect(result.isAdmin).toBe(true)
      expect(result.method).toBe('database')
    })
  })

  describe('ensureAdminProfile', () => {
    it('should return null for non-admin user', async () => {
      const result = await ensureAdminProfile(mockUser)
      
      expect(result).toBeNull()
    })

    it('should create admin profile for admin user', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const mockSupabase = createClient()
      
      // Mock no existing profile
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      })
      
      // Mock successful profile creation
      const mockProfile = {
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        role: 'admin',
        full_name: 'Administrador Armazém São Joaquim'
      }
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await ensureAdminProfile(mockAdminUser)
      
      expect(result).toEqual(mockProfile)
    })

    it('should update existing profile role if needed', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const mockSupabase = createClient()
      
      // Mock existing profile with wrong role
      const existingProfile = {
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        role: 'user'
      }
      
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: existingProfile,
        error: null
      })
      
      // Mock successful update
      const updatedProfile = { ...existingProfile, role: 'admin' }
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: updatedProfile,
        error: null
      })

      const result = await ensureAdminProfile(mockAdminUser)
      
      expect(result).toEqual(updatedProfile)
    })

    it('should return existing admin profile without changes', async () => {
      const { createClient } = require('@/lib/supabase/server')
      const mockSupabase = createClient()
      
      // Mock existing admin profile
      const existingProfile = {
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        role: 'admin'
      }
      
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: existingProfile,
        error: null
      })

      const result = await ensureAdminProfile(mockAdminUser)
      
      expect(result).toEqual(existingProfile)
    })
  })
})