import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export interface AdminAuthResult {
  success: boolean
  user?: any
  error?: string
  status?: number
}

/**
 * Verifica se o usuário é admin usando a mesma lógica do useAdmin hook
 * 1. Verifica se o token é válido
 * 2. Verifica se é o email admin oficial
 * 3. Como fallback, verifica role na tabela profiles
 */
export async function verifyAdminAccess(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Verificar Authorization header
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { 
        success: false, 
        error: 'Authorization header required', 
        status: 401 
      }
    }

    const token = authHeader.substring(7)
    
    // Verificar se o token é válido
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token)
    
    if (userError || !user) {
      return { 
        success: false, 
        error: 'Invalid or expired token', 
        status: 401 
      }
    }

    // Primary verification: Check by admin email (fastest)
    const adminEmail = 'armazemsaojoaquimoficial@gmail.com'
    if (user.email === adminEmail) {
      console.log('✅ [AdminAuth] Admin verified by email:', user.email)
      return { 
        success: true, 
        user 
      }
    }

    // Secondary verification: Check role in profiles table
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('⚠️ [AdminAuth] Profile query error:', profileError.message)
      }

      if (profile?.role === 'admin') {
        console.log('✅ [AdminAuth] Admin verified by database role:', user.email)
        return { 
          success: true, 
          user 
        }
      }

      // User exists but is not admin
      console.log('❌ [AdminAuth] User is not admin:', user.email, 'role:', profile?.role)
      return { 
        success: false, 
        error: 'Admin access required', 
        status: 403 
      }

    } catch (dbError) {
      console.error('❌ [AdminAuth] Database verification failed:', dbError)
      
      // If database fails but user is admin email, allow access as fallback
      if (user.email === adminEmail) {
        console.log('✅ [AdminAuth] Admin verified by email fallback:', user.email)
        return { 
          success: true, 
          user 
        }
      }
      
      return { 
        success: false, 
        error: 'Admin verification failed', 
        status: 500 
      }
    }

  } catch (error) {
    console.error('❌ [AdminAuth] Unexpected error:', error)
    return { 
      success: false, 
      error: 'Internal server error', 
      status: 500 
    }
  }
}

/**
 * Middleware helper para verificar admin em rotas API
 */
export function requireAdmin(handler: (request: NextRequest, adminUser: any, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]) => {
    const authResult = await verifyAdminAccess(request)
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status || 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, authResult.user, ...args)
  }
}

/**
 * Helper para manter compatibilidade com APIs existentes
 * Executa uma função handler apenas se o usuário for admin
 */
export async function withAdminAuth(
  handler: (authResult: AdminAuthResult) => Promise<Response>,
  request: NextRequest
): Promise<Response> {
  try {
    const authResult = await verifyAdminAccess(request)
    
    if (!authResult.success) {
      console.log('❌ [withAdminAuth] Admin access denied:', authResult.error)
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status || 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ [withAdminAuth] Admin access verified for:', authResult.user?.email)
    return await handler(authResult)
    
  } catch (error) {
    console.error('❌ [withAdminAuth] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        debug: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}