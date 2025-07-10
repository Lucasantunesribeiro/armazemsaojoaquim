import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

// GET - Dashboard statistics with caching
export async function GET(request: NextRequest) {
  console.log('📊 API /admin/dashboard: DASHBOARD STATS REQUEST - ' + new Date().toISOString())
  
  const startTime = Date.now()
  
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

    // Get dashboard stats using optimized function
    console.log('📈 API /admin/dashboard: Fetching dashboard stats...')
    const { data: dashboardStats, error: statsError } = await supabase.rpc('get_dashboard_stats')

    if (statsError) {
      console.error('❌ API /admin/dashboard: Error fetching stats:', statsError)
      
      // Fallback to direct queries if function fails
      console.log('🔄 API /admin/dashboard: Falling back to direct queries...')
      
      const [usersResult, reservasResult, blogResult, menuResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('menu_items').select('*', { count: 'exact', head: true })
      ])

      const fallbackStats = {
        total_users: usersResult.count || 0,
        total_reservas: reservasResult.count || 0,
        total_blog_posts: blogResult.count || 0,
        total_menu_items: menuResult.count || 0,
        active_reservas: 0,
        published_posts: 0,
        last_updated: new Date().toISOString()
      }

      const endTime = Date.now()
      console.log(`⏱️ API /admin/dashboard: Fallback completed in ${endTime - startTime}ms`)

      return NextResponse.json({
        success: true,
        data: fallbackStats,
        source: 'fallback',
        performance: {
          duration_ms: endTime - startTime,
          cached: false
        }
      })
    }

    // Process the stats data
    const stats = Array.isArray(dashboardStats) ? dashboardStats[0] : dashboardStats
    
    console.log('📊 API /admin/dashboard: Stats retrieved:', {
      total_users: stats?.total_users || 0,
      total_reservas: stats?.total_reservas || 0,
      total_blog_posts: stats?.total_blog_posts || 0,
      total_menu_items: stats?.total_menu_items || 0
    })

    // Get recent activity (last 7 days)
    const { data: recentReservas, error: recentError } = await supabase
      .from('reservas')
      .select('id, data_reserva, status, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`⏱️ API /admin/dashboard: Completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: {
        total_users: Number(stats?.total_users || 0),
        total_reservas: Number(stats?.total_reservas || 0),
        total_blog_posts: Number(stats?.total_blog_posts || 0),
        total_menu_items: Number(stats?.total_menu_items || 0),
        active_reservas: Number(stats?.active_reservas || 0),
        published_posts: Number(stats?.published_posts || 0),
        last_updated: stats?.last_updated || new Date().toISOString(),
        recent_activity: recentReservas || []
      },
      source: 'security_definer',
      performance: {
        duration_ms: duration,
        cached: false,
        optimized: true
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

    // Refresh cache
    const { error: refreshError } = await supabase.rpc('refresh_dashboard_cache')

    if (refreshError) {
      console.error('❌ API /admin/dashboard: Error refreshing cache:', refreshError)
      return NextResponse.json({ error: 'Failed to refresh cache' }, { status: 500 })
    }

    console.log('✅ API /admin/dashboard: Cache refreshed successfully')

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