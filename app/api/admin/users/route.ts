import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('[ADMIN-USERS] Loading users...')
      
      const { searchParams } = new URL(request.url)
      
      // Parâmetros de paginação e filtros
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
      const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))) // Reduced default from 20 to 10
      const search = searchParams.get('search')?.trim()
      const roleFilter = searchParams.get('role')?.trim()

      console.log(`[ADMIN-USERS] Parameters - Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}, Role: ${roleFilter || 'all'}`)

      try {
        console.log('[ADMIN-USERS] Using service role for admin operations')

        // Use service role for admin operations to bypass RLS
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            },
            db: {
              schema: 'public'
            }
          }
        )

        // Ultra-simplified query to avoid RLS and timeout issues
        console.log('[ADMIN-USERS] Executing simplified query...')
        
        const { data: users, error: dataError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at, updated_at, phone, last_sign_in, sign_in_count, avatar_url')
          .limit(limit)
          .order('created_at', { ascending: false })

        if (dataError) {
          console.error('[ADMIN-USERS] Query error:', dataError)
          throw new Error(`Database error: ${dataError.message}`)
        }

        console.log(`[ADMIN-USERS] Query successful: ${users?.length || 0} users found`)
        
        // Simple count - just use the current results length for now
        const count = users?.length || 0

        if (dataError) {
          console.error('❌ [ADMIN-USERS] Erro nos dados:', dataError)
          throw new Error(`Data error: ${dataError.message}`)
        }

        // Basic stats from current data
        console.log('[ADMIN-USERS] Calculating basic stats...')
        
        const stats = {
          total: count,
          admins: users?.filter((u: any) => u.role === 'admin').length || 0,
          users: users?.filter((u: any) => u.role === 'user' || !u.role).length || 0,
          recent: 0 // Skip complex date calculations for now
        }

        console.log(`[ADMIN-USERS] ${users?.length || 0} users loaded from ${count} total`)

        const responseData = {
          success: true,
          data: {
            users: users || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              pages: Math.ceil((count || 0) / limit),
              hasNext: page * limit < (count || 0),
              hasPrev: page > 1
            },
            stats,
            filters: {
              search: search || null,
              role: roleFilter || 'all'
            }
          }
        }

        return new NextResponse(JSON.stringify(responseData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=60, stale-while-revalidate=300', // Cache for 1 minute, stale for 5 minutes
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-Response-Time': Date.now().toString(),
            'Vary': 'Accept-Encoding'
          }
        })

      } catch (queryError) {
        console.error('❌ [ADMIN-USERS] Erro na query:', queryError)
        return NextResponse.json(
          { 
            error: 'Erro ao buscar usuários', 
            debug: queryError instanceof Error ? queryError.message : 'Unknown query error'
          },
          { status: 500 }
        )
      }
      
    } catch (error) {
      console.error('💥 [ADMIN-USERS] Erro interno:', error)
      return NextResponse.json(
        { 
          error: 'Erro interno do servidor',
          debug: error instanceof Error ? error.message : 'Unknown internal error'
        },
        { status: 500 }
      )
    }
  }, request)
}

export async function PATCH(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('✏️ [ADMIN-USERS] Atualizando usuário...')
      
      // Use service role for admin operations to bypass RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      const { userId, updates } = await request.json()

      if (!userId) {
        return NextResponse.json(
          { error: 'ID do usuário é obrigatório' },
          { status: 400 }
        )
      }

      // Verificar se não é o admin principal sendo modificado
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('❌ [ADMIN-USERS] Erro ao buscar usuário:', userError)
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      if (user?.email === 'armazemsaojoaquimoficial@gmail.com') {
        return NextResponse.json(
          { error: 'Não é possível modificar o admin principal' },
          { status: 403 }
        )
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ [ADMIN-USERS] Erro ao atualizar usuário:', error)
        return NextResponse.json(
          { error: 'Erro ao atualizar usuário', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [ADMIN-USERS] Usuário atualizado: ${data.email}`)
      return NextResponse.json({ 
        success: true,
        data: data,
        message: 'Usuário atualizado com sucesso'
      })
      
    } catch (error) {
      console.error('💥 [ADMIN-USERS] Erro interno no PATCH:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }, request)
}

export async function DELETE(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('🗑️ [ADMIN-USERS] Deletando usuário...')
      
      // Use service role for admin operations to bypass RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('userId')

      if (!userId) {
        return NextResponse.json(
          { error: 'ID do usuário é obrigatório' },
          { status: 400 }
        )
      }

      // Verificar se não é o admin principal
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('❌ [ADMIN-USERS] Erro ao buscar usuário para deletar:', userError)
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      if (user?.email === 'armazemsaojoaquimoficial@gmail.com') {
        return NextResponse.json(
          { error: 'Não é possível deletar o admin principal' },
          { status: 403 }
        )
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('❌ [ADMIN-USERS] Erro ao deletar usuário:', error)
        return NextResponse.json(
          { error: 'Erro ao deletar usuário', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [ADMIN-USERS] Usuário deletado: ${user.email}`)
      return NextResponse.json({ 
        success: true,
        message: 'Usuário deletado com sucesso'
      })
      
    } catch (error) {
      console.error('💥 [ADMIN-USERS] Erro interno no DELETE:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }, request)
}