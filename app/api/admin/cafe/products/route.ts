import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📊 [CAFE-PRODUCTS] Carregando produtos do café...')
      
      const supabase = await createServerClient()

      const { data: products, error } = await supabase
        .from('cafe_products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ [CAFE-PRODUCTS] Erro ao buscar produtos:', error)
        return NextResponse.json(
          { error: 'Erro ao carregar produtos', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [CAFE-PRODUCTS] ${products?.length || 0} produtos carregados`)
      return NextResponse.json({ 
        success: true,
        data: products || [],
        count: products?.length || 0
      })
      
    } catch (error) {
      console.error('💥 [CAFE-PRODUCTS] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }, request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('➕ [CAFE-PRODUCTS] Criando novo produto do café...')
      
      const supabase = await createServerClient()

      const body = await request.json()
      const { name, category, price, description, image_url, available } = body

      if (!name || !category || !price) {
        console.error('❌ [CAFE-PRODUCTS] Dados obrigatórios faltando')
        return NextResponse.json(
          { error: 'Dados obrigatórios não fornecidos: name, category, price' },
          { status: 400 }
        )
      }

      const { data: product, error } = await supabase
        .from('cafe_products')
        .insert({
          name,
          category,
          price,
          description,
          image_url,
          available: available !== false
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [CAFE-PRODUCTS] Erro ao criar produto:', error)
        return NextResponse.json(
          { error: 'Erro ao criar produto', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [CAFE-PRODUCTS] Produto criado: ${product.name}`)
      return NextResponse.json({ 
        success: true, 
        data: product,
        message: 'Produto criado com sucesso!' 
      })
      
    } catch (error) {
      console.error('💥 [CAFE-PRODUCTS] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }, request)
}
