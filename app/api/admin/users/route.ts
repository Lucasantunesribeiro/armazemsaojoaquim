import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('👥 [ADMIN-USERS] Carregando usuários...')
      
      const supabase = await createServerClient()
      const { searchParams } = new URL(request.url)
      
      // Parâmetros de paginação e filtros
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
      const search = searchParams.get('search')?.trim()
      const roleFilter = searchParams.get('role')?.trim()

      console.log(`📊 [ADMIN-USERS] Parâmetros - Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}, Role: ${roleFilter || 'all'}`)

      try {
        // Query base para contar total
        let countQuery = supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Query base para dados
        let dataQuery = supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            role,
            avatar_url,
            created_at,
            updated_at
          `)

        // Aplicar filtros em ambas queries
        if (search) {
          const searchPattern = `%${search}%`
          countQuery = countQuery.or(`email.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
          dataQuery = dataQuery.or(`email.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
        }

        if (roleFilter && roleFilter !== 'all') {
          countQuery = countQuery.eq('role', roleFilter)
          dataQuery = dataQuery.eq('role', roleFilter)
        }

        // Executar query de contagem
        const { count, error: countError } = await countQuery

        if (countError) {
          console.error('❌ [ADMIN-USERS] Erro na contagem:', countError)
          throw new Error(`Count error: ${countError.message}`)
        }

        // Executar query de dados com paginação
        const { data: users, error: dataError } = await dataQuery
          .range((page - 1) * limit, page * limit - 1)
          .order('created_at', { ascending: false })

        if (dataError) {
          console.error('❌ [ADMIN-USERS] Erro nos dados:', dataError)
          throw new Error(`Data error: ${dataError.message}`)
        }

        // Calcular estatísticas separadamente (mais eficiente)
        const { data: statsData, error: statsError } = await supabase
          .from('profiles')
          .select('role, created_at')

        let stats = {
          total: count || 0,
          admins: 0,
          users: 0,
          recent: 0
        }

        if (!statsError && statsData) {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)

          stats = {
            total: count || 0,
            admins: statsData.filter(u => u.role === 'admin').length,
            users: statsData.filter(u => u.role === 'user' || !u.role).length,
            recent: statsData.filter(u => new Date(u.created_at) > weekAgo).length
          }
        } else {
          console.warn('⚠️ [ADMIN-USERS] Erro nas estatísticas:', statsError)
        }

        console.log(`✅ [ADMIN-USERS] ${users?.length || 0} usuários carregados de ${count} total`)

        return NextResponse.json({
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
      
      const supabase = await createServerClient()
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
      
      const supabase = await createServerClient()
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
