import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers' // Não necessário mais
import { Database } from '@/types/database.types'

// API otimizada para análise de performance
export async function GET(request: NextRequest) {
  console.log('📊 API /admin/performance: PERFORMANCE ANALYSIS REQUEST - ' + new Date().toISOString())
  
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
              console.log('🍪 API /admin/performance: Error setting cookies:', error)
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

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'refresh_caches') {
      // Refresh all performance caches
      console.log('🔄 API /admin/performance: Refreshing caches...')
      
      const { data: refreshResult, error: refreshError } = await supabase.rpc('refresh_all_performance_caches')
      
      if (refreshError) {
        console.error('❌ API /admin/performance: Error refreshing caches:', refreshError)
        return NextResponse.json({ error: 'Failed to refresh caches' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: refreshResult,
        action: 'refresh_caches',
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'analyze_issues') {
      // Analyze performance issues
      console.log('🔍 API /admin/performance: Analyzing performance issues...')
      
      const { data: issues, error: analysisError } = await supabase.rpc('analyze_performance_issues')
      
      if (analysisError) {
        console.error('❌ API /admin/performance: Error analyzing issues:', analysisError)
        return NextResponse.json({ error: 'Failed to analyze issues' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        issues: issues || [],
        count: issues?.length || 0,
        timestamp: new Date().toISOString()
      })
    }

    // Default: Get performance overview
    console.log('📈 API /admin/performance: Getting performance overview...')
    
    // Get slow queries monitor data
    const { data: slowQueries, error: slowQueriesError } = await supabase
      .from('slow_queries_monitor')
      .select('*')
      .limit(10)

    // Get cache status
    const cacheQueries = await Promise.allSettled([
      supabase.from('timezone_cache').select('name').limit(1),
      supabase.from('table_metadata_cache').select('table_id, cached_at').limit(1),
      supabase.from('function_metadata_cache').select('function_id, cached_at').limit(1)
    ])

    const cacheStatus = {
      timezone_cache: cacheQueries[0].status === 'fulfilled',
      table_metadata_cache: cacheQueries[1].status === 'fulfilled',
      function_metadata_cache: cacheQueries[2].status === 'fulfilled'
    }

    // Get database stats
    const { data: dbStats, error: dbStatsError } = await supabase.rpc('get_dashboard_stats')

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`⏱️ API /admin/performance: Completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: {
        performance_overview: {
          slow_queries: slowQueries || [],
          slow_queries_count: slowQueries?.length || 0,
          cache_status: cacheStatus,
          database_stats: dbStats || {},
          analysis_duration_ms: duration
        },
        recommendations: [
          {
            type: 'cache_refresh',
            description: 'Refresh performance caches regularly',
            action: 'POST /api/admin/performance?action=refresh_caches'
          },
          {
            type: 'query_analysis',
            description: 'Monitor slow queries continuously',
            action: 'GET /api/admin/performance?action=analyze_issues'
          },
          {
            type: 'optimization',
            description: 'Use optimized functions for metadata queries',
            action: 'Use get_optimized_table_metadata() instead of direct pg_catalog queries'
          }
        ],
        cache_info: {
          timezone_cache: cacheQueries[0].status === 'fulfilled' ? 'Available' : 'Not available',
          table_metadata_cache: cacheQueries[1].status === 'fulfilled' ? 'Available' : 'Not available',
          function_metadata_cache: cacheQueries[2].status === 'fulfilled' ? 'Available' : 'Not available'
        }
      },
      performance: {
        duration_ms: duration,
        optimized: true,
        cache_used: true
      }
    })

  } catch (error: any) {
    const endTime = Date.now()
    console.error('❌ API /admin/performance: Unexpected error:', error)
    
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

// POST - Refresh caches and apply optimizations
export async function POST(request: NextRequest) {
  console.log('🔄 API /admin/performance: REFRESH CACHES REQUEST - ' + new Date().toISOString())
  
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
              console.log('🍪 API /admin/performance: Error setting cookies:', error)
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

    // Refresh all caches
    console.log('🔄 API /admin/performance: Refreshing all performance caches...')
    
    const { data: refreshResult, error: refreshError } = await supabase.rpc('refresh_all_performance_caches')

    if (refreshError) {
      console.error('❌ API /admin/performance: Error refreshing caches:', refreshError)
      return NextResponse.json({ error: 'Failed to refresh caches' }, { status: 500 })
    }

    // Apply performance settings
    const { data: perfResult, error: perfError } = await supabase.rpc('apply_performance_settings')

    console.log('✅ API /admin/performance: Caches refreshed and settings applied')

    return NextResponse.json({
      success: true,
      message: 'Performance caches refreshed and settings applied',
      details: {
        cache_refresh: refreshResult,
        performance_settings: perfResult || 'Applied'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ API /admin/performance: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}