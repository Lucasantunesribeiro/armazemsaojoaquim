import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('🏠 [POUSADA-ROOMS] Carregando quartos da pousada...')
      
      const supabase = await createServerClient()

      // Tentar buscar quartos diretamente
      const { data: rooms, error } = await supabase
        .from('pousada_rooms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [POUSADA-ROOMS] Erro ao buscar quartos:', error)
        
        // Se for erro de RLS, tentar RPC
        if (error.message.includes('policy') || error.message.includes('RLS')) {
          console.log('🔄 [POUSADA-ROOMS] Tentando RPC...')
          const { data: roomsRpc, error: rpcError } = await supabase
            .rpc('get_pousada_rooms_admin')
          
          if (!rpcError && roomsRpc) {
            console.log('✅ [POUSADA-ROOMS] Sucesso via RPC')
            return NextResponse.json({ 
              success: true,
              data: roomsRpc || [],
              count: roomsRpc?.length || 0
            })
          } else {
            console.error('❌ [POUSADA-ROOMS] RPC também falhou:', rpcError)
          }
        }
        
        // Se for erro de tabela não existir, retornar array vazio
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('⚠️ [POUSADA-ROOMS] Tabela não existe, retornando array vazio')
          return NextResponse.json({ 
            success: true,
            data: [],
            count: 0,
            message: 'Tabela pousada_rooms não encontrada'
          })
        }
        
        return NextResponse.json(
          { error: 'Erro ao carregar quartos', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [POUSADA-ROOMS] ${rooms?.length || 0} quartos carregados`)
      return NextResponse.json({ 
        success: true,
        data: rooms || [],
        count: rooms?.length || 0
      })
      
    } catch (error) {
      console.error('💥 [POUSADA-ROOMS] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor', debug: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }, request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('➕ [POUSADA-ROOMS] Criando novo quarto da pousada...')
      
      const supabase = await createServerClient()

      const body = await request.json()
      const { name, type, price_refundable, price_non_refundable, description, amenities, max_guests, image_url, available } = body

      if (!name || !type || !price_refundable || !price_non_refundable) {
        console.error('❌ [POUSADA-ROOMS] Dados obrigatórios faltando')
        return NextResponse.json(
          { error: 'Dados obrigatórios não fornecidos: name, type, price_refundable, price_non_refundable' },
          { status: 400 }
        )
      }

      const { data: room, error } = await supabase
        .from('pousada_rooms')
        .insert({
          name,
          type,
          price_refundable,
          price_non_refundable,
          description,
          amenities: amenities || [],
          max_guests: max_guests || 2,
          image_url,
          available: available !== false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [POUSADA-ROOMS] Erro ao criar quarto:', error)
        return NextResponse.json(
          { error: 'Erro ao criar quarto', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [POUSADA-ROOMS] Quarto criado: ${room.name}`)
      return NextResponse.json({ 
        success: true, 
        data: room,
        message: 'Quarto criado com sucesso!' 
      })
      
    } catch (error) {
      console.error('💥 [POUSADA-ROOMS] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor', debug: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }, request)
}
