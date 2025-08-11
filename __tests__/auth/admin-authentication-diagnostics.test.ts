import { createClient } from '@supabase/supabase-js'
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

describe('Admin Authentication Diagnostics', () => {
  let supabaseClient: any
  let supabaseAdmin: any
  let testSession: any

  beforeAll(async () => {
    // Initialize clients
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Try to authenticate as admin for testing
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    })
    
    if (!error && data.session) {
      testSession = data.session
    }
  })

  afterAll(async () => {
    if (testSession) {
      await supabaseClient.auth.signOut()
    }
  })

  describe('Database Structure Tests', () => {
    test('should verify profiles table exists and is accessible', async () => {
      try {
        // Test with service role key (should always work)
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('id, email, role')
          .limit(1)
        
        expect(error).toBeNull()
        expect(data).toBeDefined()
        console.log('✅ Profiles table accessible with service key')
      } catch (error) {
        console.error('❌ Profiles table access failed:', error)
        throw error
      }
    })

    test('should verify RLS policies allow authenticated user access', async () => {
      if (!testSession) {
        console.warn('⚠️ No test session available, skipping RLS test')
        return
      }

      try {
        // Test with authenticated user
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('id, email, role')
          .eq('id', testSession.user.id)
          .single()
        
        if (error) {
          console.error('❌ RLS policy error:', error)
          expect(error).toBeNull()
        } else {
          console.log('✅ RLS policies allow authenticated access')
          expect(data).toBeDefined()
        }
      } catch (error) {
        console.error('❌ RLS test failed:', error)
        throw error
      }
    })

    test('should check if admin profile exists', async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', 'armazemsaojoaquimoficial@gmail.com')
          .single()
        
        if (error) {
          console.error('❌ Admin profile not found:', error)
          expect(error.code).not.toBe('PGRST116') // Not found error
        } else {
          console.log('✅ Admin profile exists:', data)
          expect(data.role).toBe('admin')
        }
      } catch (error) {
        console.error('❌ Admin profile check failed:', error)
        throw error
      }
    })
  })

  describe('Authentication Flow Tests', () => {
    test('should test admin login process', async () => {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: 'armazemsaojoaquimoficial@gmail.com',
          password: process.env.ADMIN_PASSWORD || 'admin123'
        })
        
        if (error) {
          console.error('❌ Admin login failed:', error)
          expect(error).toBeNull()
        } else {
          console.log('✅ Admin login successful')
          expect(data.user).toBeDefined()
          expect(data.session).toBeDefined()
          
          // Clean up
          await supabaseClient.auth.signOut()
        }
      } catch (error) {
        console.error('❌ Login test failed:', error)
        throw error
      }
    })

    test('should test session validation', async () => {
      if (!testSession) {
        console.warn('⚠️ No test session available, skipping session test')
        return
      }

      try {
        const { data, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('❌ Session validation failed:', error)
          expect(error).toBeNull()
        } else {
          console.log('✅ Session validation successful')
          expect(data.session).toBeDefined()
        }
      } catch (error) {
        console.error('❌ Session test failed:', error)
        throw error
      }
    })
  })

  describe('API Endpoint Tests', () => {
    test('should test /api/admin/check-role endpoint', async () => {
      if (!testSession) {
        console.warn('⚠️ No test session available, skipping API test')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/check-role`, {
          headers: {
            'Authorization': `Bearer ${testSession.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          console.error('❌ API endpoint failed:', response.status, data)
          expect(response.ok).toBe(true)
        } else {
          console.log('✅ API endpoint successful:', data)
          expect(data.isAdmin).toBeDefined()
        }
      } catch (error) {
        console.error('❌ API test failed:', error)
        throw error
      }
    })
  })

  describe('Database Query Diagnostics', () => {
    test('should diagnose specific query that is failing', async () => {
      if (!testSession) {
        console.warn('⚠️ No test session available, skipping query diagnostic')
        return
      }

      // This is the exact query that's failing based on the error logs
      const failingQuery = supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', testSession.user.id)

      try {
        const { data, error } = await failingQuery
        
        if (error) {
          console.error('❌ Failing query error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          
          // Try alternative approaches
          console.log('🔍 Trying alternative query approaches...')
          
          // Try with service role
          const { data: serviceData, error: serviceError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', testSession.user.id)
          
          if (serviceError) {
            console.error('❌ Service role query also failed:', serviceError)
          } else {
            console.log('✅ Service role query succeeded:', serviceData)
          }
          
        } else {
          console.log('✅ Query succeeded:', data)
          expect(data).toBeDefined()
        }
      } catch (error) {
        console.error('❌ Query diagnostic failed:', error)
        throw error
      }
    })
  })
})