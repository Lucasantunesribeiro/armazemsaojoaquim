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
      console.log('🔄 [GALLERY] Atualizando artwork:', params.id)

      const body = await request.json()
      const { title, artist, description, price, image_url, category, dimensions, year_created, historical_context, stock_quantity, featured } = body

      console.log('📝 [GALLERY] Dados recebidos:', { title, artist, category, price })

      if (!title || !artist || !category || price === undefined) {
        console.error('❌ [GALLERY] Dados obrigatórios faltando')
        return NextResponse.json(
          { error: 'Dados obrigatórios não fornecidos: title, artist, category, price' },
          { status: 400 }
        )
      }

      const { data: artwork, error } = await supabaseAdmin
        .from('art_gallery')
        .update({
          title,
          artist,
          description,
          price,
          image_url,
          category: category.toUpperCase(),
          dimensions,
          year_created,
          historical_context,
          stock_quantity: stock_quantity || 1,
          featured: featured || false
        })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        console.error('❌ [GALLERY] Erro ao atualizar artwork:', error)
        return NextResponse.json(
          { error: 'Erro ao atualizar artwork', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [GALLERY] Artwork atualizado: ${artwork.title}`)
      return NextResponse.json({
        success: true,
        data: artwork,
        message: 'Artwork atualizado com sucesso!'
      })
    } catch (error) {
      console.error('💥 [GALLERY] Erro interno:', error)
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
      console.log('🗑️ [GALLERY] Excluindo artwork:', params.id)

      const { error } = await supabaseAdmin
        .from('art_gallery')
        .delete()
        .eq('id', params.id)

      if (error) {
        console.error('❌ [GALLERY] Erro ao excluir artwork:', error)
        return NextResponse.json(
          { error: 'Erro ao excluir artwork', debug: error.message },
          { status: 500 }
        )
      }

      console.log(`✅ [GALLERY] Artwork excluído com sucesso`)
      return NextResponse.json({
        success: true,
        message: 'Artwork excluído com sucesso!'
      })
    } catch (error) {
      console.error('💥 [GALLERY] Erro interno:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }, request)
}