import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/admin-auth'

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

// PUT - Atualizar item do menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🍽️ API Menu: Atualizando item:', params.id)
    
    const authResult = await verifyAdminAccess(request)
    if (!authResult.success) {
      console.log('❌ API Menu: Admin access denied:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }
    
    console.log('✅ API Menu: Admin access verified for:', authResult.user?.email)

    const body = await request.json()
    console.log('🍽️ API Menu: Dados para atualização:', body)
    
    // Se é apenas uma atualização de disponibilidade
    if (Object.keys(body).length === 1 && 'available' in body) {
      const { data, error } = await supabaseAdmin
        .from('menu_items')
        .update({
          available: body.available,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        console.error('❌ API Menu: Erro ao atualizar disponibilidade:', error)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      console.log('✅ API Menu: Disponibilidade atualizada:', data)
      return NextResponse.json(data)
    }

    // Atualização completa
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        available: body.available,
        featured: body.featured,
        allergens: body.allergens,
        image_url: body.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('❌ API Menu: Erro ao atualizar:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Menu: Item atualizado:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Menu: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE - Excluir item do menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🍽️ API Menu: Excluindo item:', params.id)
    
    const authResult = await verifyAdminAccess(request)
    if (!authResult.success) {
      console.log('❌ API Menu: Admin access denied:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }
    
    console.log('✅ API Menu: Admin access verified for:', authResult.user?.email)

    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('❌ API Menu: Erro ao excluir:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ API Menu: Item excluído com sucesso')
    return NextResponse.json({ message: 'Item excluído com sucesso' })
  } catch (error) {
    console.error('❌ API Menu: Erro interno:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}