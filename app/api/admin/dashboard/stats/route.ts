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
    const [usersResult, blogResult, menuResult, cafeProductsResult] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }),
      supabase.from('cafe_products').select('id', { count: 'exact', head: true })
    ])

    // Log detalhado de erros por tabela
    const tableResults = [
      { name: 'profiles', result: usersResult },
      { name: 'blog_posts', result: blogResult },
      { name: 'menu_items', result: menuResult },
      { name: 'cafe_products', result: cafeProductsResult }
    ]

    tableResults.forEach(({ name, result }) => {
      if (result.status === 'rejected') {
        console.warn(`⚠️ [DASHBOARD-STATS] Erro na tabela ${name}:`, result.reason)
      } else {
        console.log(`✅ [DASHBOARD-STATS] ${name}: ${result.value.count || 0} registros`)
      }
    })

    const stats = {
      totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
      totalBlogPosts: blogResult.status === 'fulfilled' ? (blogResult.value.count || 0) : 0,
      totalMenuItems: menuResult.status === 'fulfilled' ? (menuResult.value.count || 0) : 0,
      totalCafeProducts: cafeProductsResult.status === 'fulfilled' ? (cafeProductsResult.value.count || 0) : 0,
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
      totalUsers: 0,
      totalBlogPosts: 0,
      totalMenuItems: 0,
      totalCafeProducts: 0,
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