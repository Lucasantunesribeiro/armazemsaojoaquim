import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAccess } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [DASHBOARD-STATS] Verificando acesso admin...')
    
    const authResult = await verifyAdminAccess(request)
    if (!authResult.success) {
      console.log('❌ [DASHBOARD-STATS] Admin access denied:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }
    
    console.log('✅ [DASHBOARD-STATS] Admin access verified for:', authResult.user?.email)
    console.log('📊 [DASHBOARD-STATS] Coletando estatísticas do dashboard...')
    
    // Usar service role para bypass RLS
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

    // Coletar estatísticas básicas com Promise.allSettled para tratar erros individuais
    const [usersResult, reservasResult, blogResult, menuResult, cafeOrdersResult, pousadaBookingsResult] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('reservations').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }),
      supabase.from('cafe_orders').select('id', { count: 'exact', head: true }),
      supabase.from('pousada_bookings').select('id', { count: 'exact', head: true })
    ])

    // Log detalhado de erros por tabela
    const tableResults = [
      { name: 'profiles', result: usersResult },
      { name: 'reservations', result: reservasResult },
      { name: 'blog_posts', result: blogResult },
      { name: 'menu_items', result: menuResult },
      { name: 'cafe_orders', result: cafeOrdersResult },
      { name: 'pousada_bookings', result: pousadaBookingsResult }
    ]

    tableResults.forEach(({ name, result }) => {
      if (result.status === 'rejected') {
        console.warn(`⚠️ [DASHBOARD-STATS] Erro na tabela ${name}:`, result.reason)
      } else {
        console.log(`✅ [DASHBOARD-STATS] ${name}: ${result.value.count || 0} registros`)
      }
    })

    // Query específica para reservas de hoje (com tratamento de erro)
    let reservasHojeResult = { count: 0 }
    let reservasPendentesResult = { count: 0 }
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const hojeRes = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today + 'T00:00:00.000Z')
        .lt('created_at', today + 'T23:59:59.999Z')
      
      if (hojeRes.error) {
        console.warn('⚠️ [DASHBOARD-STATS] Erro ao buscar reservas de hoje:', hojeRes.error)
      } else {
        reservasHojeResult = { count: hojeRes.count || 0 }
        console.log('✅ [DASHBOARD-STATS] Reservas hoje:', hojeRes.count || 0)
      }
    } catch (error) {
      console.warn('⚠️ [DASHBOARD-STATS] Erro na query de reservas hoje:', error)
    }

    // Query para reservas pendentes (com tratamento de erro)
    try {
      const pendentesRes = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      if (pendentesRes.error) {
        console.warn('⚠️ [DASHBOARD-STATS] Erro ao buscar reservas pendentes:', pendentesRes.error)
      } else {
        reservasPendentesResult = { count: pendentesRes.count || 0 }
        console.log('✅ [DASHBOARD-STATS] Reservas pendentes:', pendentesRes.count || 0)
      }
    } catch (error) {
      console.warn('⚠️ [DASHBOARD-STATS] Erro na query de reservas pendentes:', error)
    }

    const stats = {
      totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
      totalReservas: reservasResult.status === 'fulfilled' ? (reservasResult.value.count || 0) : 0,
      totalBlogPosts: blogResult.status === 'fulfilled' ? (blogResult.value.count || 0) : 0,
      totalMenuItems: menuResult.status === 'fulfilled' ? (menuResult.value.count || 0) : 0,
      totalCafeOrders: cafeOrdersResult.status === 'fulfilled' ? (cafeOrdersResult.value.count || 0) : 0,
      totalPousadaBookings: pousadaBookingsResult.status === 'fulfilled' ? (pousadaBookingsResult.value.count || 0) : 0,
      reservasHoje: reservasHojeResult.count || 0,
      reservasPendentes: reservasPendentesResult.count || 0,
      timestamp: new Date().toISOString()
    }

    console.log('✅ [DASHBOARD-STATS] Estatísticas coletadas com sucesso:', stats)

    return NextResponse.json({ 
      success: true,
      data: stats
    })
      
  } catch (error) {
    console.error('❌ [DASHBOARD-STATS] Erro na coleta de estatísticas:', error)
    
    // Fallback stats se houver erro no banco
    const fallbackStats = {
      totalUsers: 1,
      totalReservas: 0,
      totalBlogPosts: 0,
      totalMenuItems: 0,
      totalCafeOrders: 0,
      totalPousadaBookings: 0,
      reservasHoje: 0,
      reservasPendentes: 0,
      timestamp: new Date().toISOString(),
      note: 'Dados de fallback devido a erro no banco de dados'
    }

    return NextResponse.json({ 
      success: false,
      data: fallbackStats,
      error: 'Erro ao coletar estatísticas',
      debug: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}