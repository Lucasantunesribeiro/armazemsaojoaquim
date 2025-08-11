import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { enhancedLogin, enhancedLogout, validateAndRefreshSession } from '@/lib/auth/enhanced-login'
import { LoginCredentials } from '@/lib/auth/types'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      refreshSession: jest.fn()
    },
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn()
      })),
      raw: jest.fn()
    }))
  }))
}))

// Mock admin verification
jest.mock('@/lib/auth/admin-verification', () => ({
  verifyAdminStatus: jest.fn(),
  ensureAdminProfile: jest.fn()
}))

// Mock logging
jest.mock('@/lib/auth/logging', () => ({
  logAuthEvent: jest.fn()
}))

// Mock cache
jest.mock('@/lib/auth/cache', () => ({
  adminCache: {
    clear: jest.fn()
  }
}))

describe('Enhanced Login', () => {
  const mockCredentials: LoginCredentials = {
    email: 'test@example.com',
    password: 'password123'
  }

  const mockAdminCredentials: LoginCredentials = {
    email: 'armazemsaojoaquimoficial@gmail.com',
    password: 'adminpassword'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('enhancedLogin', () => {
    it('should login successfully with valid credentials', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const { verifyAdminStatus } = require('@/lib/auth/admin-verification')
      
      const mockSupabase = createClient()
      const mockUser = { id: 'user-id', email: mockCredentials.email }
      const mockSession = { access_token: 'token', user: mockUser }
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })
      
      verifyAdminStatus.mockResolvedValue({
        isAdmin: false,
        method: 'email'
      })

      const result = await enhancedLogin(mockCredentials)
      
      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.isAdmin).toBe(false)
    })

    it('should handle invalid credentials', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const mockSupabase = createClient()
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      })

      const result = await enhancedLogin(mockCredentials)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('should verify admin status for admin user', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const { verifyAdminStatus, ensureAdminProfile } = require('@/lib/auth/admin-verification')
      
      const mockSupabase = createClient()
      const mockAdminUser = { id: 'admin-id', email: mockAdminCredentials.email }
      const mockSession = { access_token: 'token', user: mockAdminUser }
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockAdminUser, session: mockSession },
        error: null
      })
      
      verifyAdminStatus.mockResolvedValue({
        isAdmin: true,
        method: 'email'
      })
      
      ensureAdminProfile.mockResolvedValue({
        id: mockAdminUser.id,
        email: mockAdminUser.email,
        role: 'admin'
      })

      const result = await enhancedLogin(mockAdminCredentials)
      
      expect(result.success).toBe(true)
      expect(result.isAdmin).toBe(true)
      expect(verifyAdminStatus).toHaveBeenCalledWith(mockAdminUser)
      expect(ensureAdminProfile).toHaveBeenCalledWith(mockAdminUser)
    })

    it('should handle authentication errors gracefully', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const mockSupabase = createClient()
      
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      )

      const result = await enhancedLogin(mockCredentials)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Login failed')
    })
  })

  describe('enhancedLogout', () => {
    it('should logout successfully', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const { adminCache } = require('@/lib/auth/cache')
      
      const mockSupabase = createClient()
      const mockUser = { id: 'user-id', email: 'test@example.com' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser }
      })
      
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const result = await enhancedLogout()
      
      expect(result.success).toBe(true)
      expect(adminCache.clear).toHaveBeenCalledWith(mockUser.id)
    })

    it('should handle logout errors', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const mockSupabase = createClient()
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      })
      
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed' }
      })

      const result = await enhancedLogout()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Logout failed')
    })
  })

  describe('validateAndRefreshSession', () => {
    it('should validate active session', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const { verifyAdminStatus } = require('@/lib/auth/admin-verification')
      
      const mockSupabase = createClient()
      const mockUser = { id: 'user-id', email: 'test@example.com' }
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const mockSession = { 
        user: mockUser, 
        expires_at: futureTimestamp,
        access_token: 'token'
      }
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
      
      verifyAdminStatus.mockResolvedValue({
        isAdmin: false,
        method: 'email'
      })

      const result = await validateAndRefreshSession()
      
      expect(result.valid).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
    })

    it('should refresh expiring session', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const { verifyAdminStatus } = require('@/lib/auth/admin-verification')
      
      const mockSupabase = createClient()
      const mockUser = { id: 'user-id', email: 'test@example.com' }
      const soonToExpire = Math.floor(Date.now() / 1000) + 60 // 1 minute from now
      const mockSession = { 
        user: mockUser, 
        expires_at: soonToExpire,
        access_token: 'token'
      }
      
      const refreshedSession = {
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        access_token: 'new-token'
      }
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
      
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: refreshedSession, user: mockUser },
        error: null
      })
      
      verifyAdminStatus.mockResolvedValue({
        isAdmin: false,
        method: 'email'
      })

      const result = await validateAndRefreshSession()
      
      expect(result.valid).toBe(true)
      expect(result.session).toEqual(refreshedSession)
    })

    it('should handle session errors', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const mockSupabase = createClient()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' }
      })

      const result = await validateAndRefreshSession()
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Session error')
    })

    it('should handle missing session', async () => {
      const { createClient } = require('@/lib/supabase/client')
      const mockSupabase = createClient()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const result = await validateAndRefreshSession()
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No active session')
    })
  })
})