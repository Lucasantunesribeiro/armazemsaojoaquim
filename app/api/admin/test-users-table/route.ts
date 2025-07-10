import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

// Test endpoint to check users table access and data
export async function GET(request: NextRequest) {
  console.log('🧪 TEST API: Testing users table access - ' + new Date().toISOString())
  
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              console.log('🍪 TEST API: Error setting cookies:', error)
            }
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: 'pkce',
          storageKey: 'armazem-sao-joaquim-auth',
          debug: process.env.NODE_ENV === 'development'
        },
      }
    )
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🔍 TEST API: Session:', session ? 'Found' : 'Not found')
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session', 
        tables: {} 
      }, { status: 401 })
    }

    console.log('✅ TEST API: Testing as user:', session.user.email)

    // Test different table queries
    const results: any = {
      session_user: session.user.email,
      test_timestamp: new Date().toISOString(),
      tables: {}
    }

    // Test 1: Query auth.users (should work)
    try {
      console.log('🧪 TEST API: Testing auth.users access...')
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      results.tables.auth_users = {
        accessible: !authError,
        count: authUsers?.users?.length || 0,
        error: authError?.message,
        sample: authUsers?.users?.[0] ? {
          id: authUsers.users[0].id,
          email: authUsers.users[0].email,
          created_at: authUsers.users[0].created_at
        } : null
      }
    } catch (error: any) {
      results.tables.auth_users = {
        accessible: false,
        error: error.message,
        count: 0
      }
    }

    // Test 2: Query public.users table
    try {
      console.log('🧪 TEST API: Testing public.users table...')
      const { data: publicUsers, error: publicError, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .limit(5)

      results.tables.public_users = {
        accessible: !publicError,
        count: count || 0,
        error: publicError?.message,
        sample: publicUsers?.[0] || null,
        data_preview: publicUsers || []
      }
      console.log('🧪 TEST API: public.users result:', publicUsers)
    } catch (error: any) {
      results.tables.public_users = {
        accessible: false,
        error: error.message,
        count: 0
      }
    }

    // Test 3: Query profiles table
    try {
      console.log('🧪 TEST API: Testing profiles table...')
      const { data: profiles, error: profilesError, count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .limit(5)

      results.tables.profiles = {
        accessible: !profilesError,
        count: profilesCount || 0,
        error: profilesError?.message,
        sample: profiles?.[0] || null,
        data_preview: profiles || []
      }
    } catch (error: any) {
      results.tables.profiles = {
        accessible: false,
        error: error.message,
        count: 0
      }
    }

    // Test 4: Check RLS policies
    try {
      console.log('🧪 TEST API: Testing RLS bypass...')
      const { data: rlsBypass, error: rlsError } = await supabase.rpc('get_user_role', {
        user_email: session.user.email
      })
      
      results.rls_test = {
        accessible: !rlsError,
        result: rlsBypass,
        error: rlsError?.message
      }
    } catch (error: any) {
      results.rls_test = {
        accessible: false,
        error: error.message
      }
    }

    console.log('🧪 TEST API: Complete results:', JSON.stringify(results, null, 2))
    
    return NextResponse.json(results)
    
  } catch (error: any) {
    console.error('❌ TEST API: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}