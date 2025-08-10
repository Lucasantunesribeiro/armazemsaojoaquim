import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📅 [POUSADA-BOOKINGS] Carregando reservas da pousada...')
      
      const supabase = await createServerClient()

      // Tentar buscar reservas diretamente
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
        
        // Se for erro de RLS, tentar RPC
        if (error.message.includes('policy') || error.message.includes('RLS')) {
          console.log('🔄 [POUSADA-BOOKINGS] Tentando RPC...')
          const { data: bookingsRpc, error: rpcError } = await supabase
            .rpc('get_pousada_bookings_admin')
          
          if (!rpcError && bookingsRpc) {
            console.log('✅ [POUSADA-BOOKINGS] Sucesso via RPC')
            return NextResponse.json({ 
              success: true,
              data: bookingsRpc || [],
              count: bookingsRpc?.length || 0
            })
          } else {
            console.error('❌ [POUSADA-BOOKINGS] RPC também falhou:', rpcError)
          }
        }
        
        // Se for erro de tabela não existir, retornar array vazio
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('⚠️ [POUSADA-BOOKINGS] Tabela não existe, retornando array vazio')
          return NextResponse.json({ 
            success: true,
            data: [],
            count: 0,
            message: 'Tabela pousada_bookings não encontrada'
          })
        }
        
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
        { error: 'Erro interno do servidor', debug: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }, request)
}
