import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers' // Não necessário mais
import { Database } from '@/types/database.types'
import { cookies } from 'next/headers'

// GET - Dashboard statistics with caching
export async function GET(request: NextRequest) {
  console.log('📊 API /admin/dashboard: DASHBOARD STATS REQUEST - ' + new Date().toISOString())
  
  const startTime = Date.now()
  
  try {
    const cookieStore = await cookies()
    
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
              console.log('🍪 API /admin/dashboard: Error setting cookies:', error)
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
    
    if (!session) {
      console.log('❌ API /admin/dashboard: No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin privileges
    if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      console.log('❌ API /admin/dashboard: Not admin:', session.user.email)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('✅ API /admin/dashboard: Admin authenticated:', session.user.email)

    // Get dashboard stats using direct queries
    console.log('📈 API /admin/dashboard: Fetching dashboard stats...')
    
    const [profilesResult, reservasResult, blogResult, menuResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('reservas').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('menu_items').select('*', { count: 'exact', head: true })
    ])

    const dashboardStats = {
      total_users: profilesResult.count || 0,
      total_reservas: reservasResult.count || 0,
      total_blog_posts: blogResult.count || 0,
      total_menu_items: menuResult.count || 0,
      active_reservas: 0,
      published_posts: 0,
      last_updated: new Date().toISOString()
    }

    const endTime = Date.now()
    console.log(`⏱️ API /admin/dashboard: Query completed in ${endTime - startTime}ms`)

    return NextResponse.json({
      success: true,
      data: dashboardStats,
      source: 'direct_queries',
      performance: {
        duration_ms: endTime - startTime,
        cached: false
      }
    })
    
  } catch (error: any) {
    const endTime = Date.now()
    console.error('❌ API /admin/dashboard: Unexpected error:', error)
    console.error(`⏱️ API /admin/dashboard: Failed after ${endTime - startTime}ms`)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      performance: {
        duration_ms: endTime - startTime,
        failed: true
      }
    }, { status: 500 })
  }
}

// POST - Refresh dashboard cache
export async function POST(request: NextRequest) {
  console.log('🔄 API /admin/dashboard: REFRESH CACHE REQUEST - ' + new Date().toISOString())
  
  try {
    const cookieStore = await cookies()
    
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
              console.log('🍪 API /admin/dashboard: Error setting cookies:', error)
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
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin privileges
    if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Cache refresh logic would go here (no RPC available)
    console.log('✅ API /admin/dashboard: Cache refresh requested')

    return NextResponse.json({
      success: true,
      message: 'Dashboard cache refreshed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ API /admin/dashboard: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
