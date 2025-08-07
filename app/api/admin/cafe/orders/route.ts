import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📊 [CAFE-ORDERS] Carregando pedidos do café...')
      
      const supabase = await createServerClient()

      const { data: orders, error } = await supabase
        .from('cafe_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [CAFE-ORDERS] Erro ao buscar pedidos:', error)
        throw new Error(`Erro ao carregar pedidos: ${error.message}`)
      }

      console.log(`✅ [CAFE-ORDERS] ${orders?.length || 0} pedidos carregados`)
      return NextResponse.json({ 
        success: true,
        data: orders || [],
        count: orders?.length || 0
      })
      
    } catch (error) {
      console.error('💥 [CAFE-ORDERS] Erro interno:', error)
      throw error
    }
  }, request)
}
