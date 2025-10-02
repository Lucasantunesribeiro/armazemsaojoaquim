import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withAdminAuth } from '@/lib/admin-auth'

// Cliente admin com service role para bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withAdminAuth(async (authResult) => {
    try {
      const params = await context.params
      console.log('🔄 [CAFE-PRODUCTS] Atualizando produto:', params.id)

      const supabase = supabaseAdmin

      const body = await request.json()
      const { name, category, price, description, image_url, available } = body

      console.log('📝 [CAFE-PRODUCTS] Dados recebidos:', { name, category, price, available })

      if (!name || !category || price === undefined) {
        console.error('❌ [CAFE-PRODUCTS] Dados obrigatórios faltando')
        return NextResponse.json(
          { error: 'Dados obrigatórios não fornecidos: name, category, price' },
          { status: 400 }
        )
      }

      const { data: product, error } = await supabase
        .from('cafe_products')
        .update({
          name,
          category,
          price,
          description,
          image_url,
          available: available !== false
        })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        console.error('❌ [CAFE-PRODUCTS] Erro ao atualizar produto:', error)
        return NextResponse.json(
          { error: 'Erro ao atualizar produto', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [CAFE-PRODUCTS] Produto atualizado: ${product.name}`)
      return NextResponse.json({
        success: true,
        data: product,
        message: 'Produto atualizado com sucesso!'
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

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withAdminAuth(async (authResult) => {
    try {
      const params = await context.params
      console.log('🗑️ [CAFE-PRODUCTS] Excluindo produto:', params.id)

      const supabase = supabaseAdmin

      const { error } = await supabase
        .from('cafe_products')
        .delete()
        .eq('id', params.id)

      if (error) {
        console.error('❌ [CAFE-PRODUCTS] Erro ao excluir produto:', error)
        return NextResponse.json(
          { error: 'Erro ao excluir produto', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [CAFE-PRODUCTS] Produto excluído com sucesso`)
      return NextResponse.json({
        success: true,
        message: 'Produto excluído com sucesso!'
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