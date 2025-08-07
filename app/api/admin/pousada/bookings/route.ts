import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📅 [POUSADA-BOOKINGS] Carregando reservas da pousada...')
      
      const supabase = await createServerClient()

      const { data: bookings, error } = await supabase
        .from('pousada_bookings')
        .select(`
          *,
          pousada_rooms (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [POUSADA-BOOKINGS] Erro ao buscar reservas:', error)
        return NextResponse.json(
          { error: 'Erro ao carregar reservas', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [POUSADA-BOOKINGS] ${bookings?.length || 0} reservas carregadas`)
      return NextResponse.json({ 
        success: true,
        data: bookings || [],
        count: bookings?.length || 0
      })
      
    } catch (error) {
      console.error('💥 [POUSADA-BOOKINGS] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }, request)
}
