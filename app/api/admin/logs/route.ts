import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { cookies } from 'next/headers'

async function createAdminSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
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
            console.log('Erro ao definir cookies:', error)
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
}

async function verifyAdminAccess(supabase: any) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }

  if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
    return { error: 'Forbidden', status: 403 }
  }

  return { success: true, userId: session.user.id, userEmail: session.user.email }
}

// Criar tabela de logs se não existir
async function ensureLogsTable(supabase: any) {
  const { error } = await supabase.rpc('create_logs_table_if_not_exists')
  
  if (error) {
    console.log('Info: Tabela de logs pode já existir ou será criada manualmente')
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminSupabaseClient()
    const authResult = await verifyAdminAccess(supabase)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await ensureLogsTable(supabase)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Construir query base
    let query = supabase
      .from('admin_activity_logs')
      .select(`
        id,
        action,
        resource_type,
        resource_id,
        details,
        created_at,
        user_email,
        ip_address,
        user_agent
      `, { count: 'exact' })

    // Aplicar filtros
    if (action && action !== 'all') {
      query = query.eq('action', action)
    }

    if (resource && resource !== 'all') {
      query = query.eq('resource_type', resource)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Aplicar paginação e ordenação
    const { data: logs, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar logs:', error)
      // Retornar logs vazios se a tabela não existir
      return NextResponse.json({
        logs: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        },
        stats: {
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0
        }
      })
    }

    // Calcular estatísticas
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data: allLogs } = await supabase
      .from('admin_activity_logs')
      .select('created_at')

    const stats = {
      total: count || 0,
      today: allLogs?.filter(log => new Date(log.created_at) >= todayStart).length || 0,
      thisWeek: allLogs?.filter(log => new Date(log.created_at) >= weekStart).length || 0,
      thisMonth: allLogs?.filter(log => new Date(log.created_at) >= monthStart).length || 0
    }

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminSupabaseClient()
    const authResult = await verifyAdminAccess(supabase)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { action, resource_type, resource_id, details } = await request.json()

    if (!action || !resource_type) {
      return NextResponse.json(
        { error: 'Ação e tipo de recurso são obrigatórios' },
        { status: 400 }
      )
    }

    await ensureLogsTable(supabase)

    // Obter informações da requisição
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'Unknown'

    const { data, error } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: authResult.userEmail,
        action,
        resource_type,
        resource_id: resource_id || null,
        details: details || {},
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar log:', error)
      // Não falhar a operação principal se o log falhar
      return NextResponse.json(
        { warning: 'Operação executada mas log não foi registrado' },
        { status: 200 }
      )
    }

    return NextResponse.json({ log: data })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createAdminSupabaseClient()
    const authResult = await verifyAdminAccess(supabase)
    
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const olderThan = searchParams.get('olderThan') // número de dias
    const logId = searchParams.get('logId')

    await ensureLogsTable(supabase)

    if (logId) {
      // Deletar log específico
      const { error } = await supabase
        .from('admin_activity_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        console.error('Erro ao deletar log:', error)
        return NextResponse.json(
          { error: 'Erro ao deletar log' },
          { status: 500 }
        )
      }

      // Registrar a limpeza
      await logActivity(supabase, authResult.userEmail!, request, {
        action: 'delete',
        resource_type: 'admin_log',
        resource_id: logId,
        details: { reason: 'Manual deletion' }
      })

      return NextResponse.json({ success: true })
    }

    if (olderThan) {
      // Deletar logs antigos
      const days = parseInt(olderThan)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await supabase
        .from('admin_activity_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (error) {
        console.error('Erro ao limpar logs antigos:', error)
        return NextResponse.json(
          { error: 'Erro ao limpar logs antigos' },
          { status: 500 }
        )
      }

      // Registrar a limpeza
      await logActivity(supabase, authResult.userEmail!, request, {
        action: 'cleanup',
        resource_type: 'admin_logs',
        details: { 
          reason: 'Automated cleanup',
          days_kept: days,
          cutoff_date: cutoffDate.toISOString()
        }
      })

      return NextResponse.json({ 
        success: true,
        message: `Logs mais antigos que ${days} dias foram removidos`
      })
    }

    return NextResponse.json(
      { error: 'Parâmetros inválidos para limpeza' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função utilitária para registrar atividades
async function logActivity(
  supabase: any, 
  userEmail: string, 
  request: NextRequest, 
  logData: {
    action: string
    resource_type: string
    resource_id?: string
    details?: any
  }
) {
  try {
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'Unknown'

    await supabase
      .from('admin_activity_logs')
      .insert({
        ...logData,
        user_email: userEmail,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Erro ao registrar atividade:', error)
    // Não propagar o erro para não quebrar a operação principal
  }
}