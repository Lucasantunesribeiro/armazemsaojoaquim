import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📊 [DASHBOARD-STATS] Coletando estatísticas do dashboard...')
      
      const supabase = await createServerClient()

      // Coletar estatísticas básicas com Promise.allSettled para tratar erros individuais
      const [usersResult, reservasResult, blogResult, menuResult, cafeOrdersResult, pousadaBookingsResult] = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('menu_items').select('id', { count: 'exact', head: true }),
        supabase.from('cafe_orders').select('id', { count: 'exact', head: true }),
        supabase.from('pousada_bookings').select('id', { count: 'exact', head: true })
      ])

      // Query específica para reservas de hoje
      const today = new Date().toISOString().split('T')[0]
      const reservasHojeResult = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today + 'T00:00:00.000Z')
        .lt('created_at', today + 'T23:59:59.999Z')

      // Query para reservas pendentes (assumindo status 'pending')
      const reservasPendentesResult = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

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
  }, request)
}