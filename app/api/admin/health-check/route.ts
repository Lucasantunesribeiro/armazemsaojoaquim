import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authSystemHealthCheck } from '@/lib/auth/error-recovery'
import { getAuthStatistics } from '@/lib/auth/session-management'
import { verifyAdminStatus } from '@/lib/auth/admin-verification'
import { logAuthEvent } from '@/lib/auth/logging'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    // Verify admin access
    const adminResult = await verifyAdminStatus(session.user)
    
    if (!adminResult.isAdmin) {
      await logAuthEvent({
        user_id: session.user.id,
        email: session.user.email || '',
        action: 'access_denied',
        method: 'health_check_api',
        success: false,
        error: 'Non-admin attempted health check',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        user_agent: request.headers.get('user-agent') || ''
      })
      
      return NextResponse.json({
        error: 'Admin access required',
        timestamp: new Date().toISOString()
      }, { status: 403 })
    }

    // Run comprehensive health check
    const healthCheck = await authSystemHealthCheck()
    
    // Get authentication statistics
    const statsResult = await getAuthStatistics(7) // Last 7 days
    
    // Check database connectivity
    let databaseHealth = 'unknown'
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      databaseHealth = dbError ? 'error' : 'healthy'
    } catch (error) {
      databaseHealth = 'error'
    }
    
    // Check API endpoints
    const apiHealth = {
      authCheckRole: 'unknown',
      adminCheckRole: 'unknown'
    }
    
    try {
      // Test auth check-role endpoint
      const authResponse = await fetch(new URL('/api/auth/check-role', request.url), {
        headers: {
          'Authorization': request.headers.get('Authorization') || ''
        }
      })
      apiHealth.authCheckRole = authResponse.ok ? 'healthy' : 'error'
    } catch (error) {
      apiHealth.authCheckRole = 'error'
    }
    
    try {
      // Test admin check-role endpoint
      const adminResponse = await fetch(new URL('/api/admin/check-role', request.url), {
        headers: {
          'Authorization': request.headers.get('Authorization') || ''
        }
      })
      apiHealth.adminCheckRole = adminResponse.ok ? 'healthy' : 'error'
    } catch (error) {
      apiHealth.adminCheckRole = 'error'
    }
    
    // Check required database functions
    const requiredFunctions = [
      'sync_admin_profile',
      'create_or_update_admin_session',
      'update_session_activity',
      'invalidate_admin_session',
      'clean_expired_sessions',
      'get_admin_session_info',
      'get_auth_statistics'
    ]
    
    const functionHealth: Record<string, string> = {}
    for (const funcName of requiredFunctions) {
      try {
        await supabase.rpc(funcName, {})
        functionHealth[funcName] = 'exists'
      } catch (error: any) {
        functionHealth[funcName] = error.code === '42883' ? 'missing' : 'exists'
      }
    }
    
    // Check required tables
    const requiredTables = ['profiles', 'auth_logs', 'admin_sessions']
    const tableHealth: Record<string, string> = {}
    
    for (const tableName of requiredTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1)
        
        tableHealth[tableName] = error ? 
          (error.code === '42P01' ? 'missing' : 'error') : 'healthy'
      } catch (error) {
        tableHealth[tableName] = 'error'
      }
    }
    
    // Calculate overall health score based on checks
    const totalChecks = Object.keys(healthCheck.checks).length
    const healthyChecks = Object.values(healthCheck.checks).filter(check => check.status === 'ok').length
    const healthScore = totalChecks > 0 ? Math.round((healthyChecks / totalChecks) * 100) : 50
    const overallHealth = healthCheck.healthy ? 'healthy' : 'unhealthy'
    
    await logAuthEvent({
      user_id: session.user.id,
      email: session.user.email || '',
      action: 'admin_check',
      method: 'health_check_api',
      success: true,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      user_agent: request.headers.get('user-agent') || ''
    })
    
    const recommendations: string[] = []
    
    const response = {
      timestamp: new Date().toISOString(),
      overallHealth,
      healthScore,
      components: {
        authSystem: {
          status: overallHealth,
          checks: healthCheck.checks || {}
        },
        database: {
          status: databaseHealth,
          tables: tableHealth
        },
        functions: {
          status: Object.values(functionHealth).every(s => s === 'exists') ? 'healthy' : 'warning',
          functions: functionHealth
        },
        apiEndpoints: {
          status: Object.values(apiHealth).every(s => s === 'healthy') ? 'healthy' : 'error',
          endpoints: apiHealth
        }
      },
      statistics: statsResult,
      recommendations
    }
    
    // Add recommendations based on health check
    if (databaseHealth === 'error') {
      recommendations.push('Database connectivity issues detected')
    }
    
    if (Object.values(functionHealth).some(status => status === 'missing')) {
      recommendations.push('Some required database functions are missing - run migrations')
    }
    
    if (Object.values(tableHealth).some(status => status === 'missing')) {
      recommendations.push('Some required tables are missing - run migrations')
    }
    
    if (Object.values(apiHealth).some(status => status === 'error')) {
      recommendations.push('Some API endpoints are not responding correctly')
    }
    
    // Temporarily disabled health check recommendations
    // if (!healthCheck.healthy) {
    //   response.recommendations.push('Authentication system components have issues')
    // }
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Health check API error:', error)
    
    return NextResponse.json({
      error: 'Health check failed',
      message: String(error),
      timestamp: new Date().toISOString(),
      overallHealth: 'critical'
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}