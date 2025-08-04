import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: artwork, error } = await supabase
      .from('art_gallery')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Quadro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: artwork
    })
  } catch (error) {
    console.error('Erro ao buscar quadro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const isAdmin = user.user_metadata?.role === 'admin'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updateData = { ...body }

    // Converter tipos se necessário
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price)
    }
    if (updateData.year_created) {
      updateData.year_created = parseInt(updateData.year_created)
    }
    if (updateData.stock_quantity) {
      updateData.stock_quantity = parseInt(updateData.stock_quantity)
    }
    if (updateData.category) {
      updateData.category = updateData.category.toUpperCase()
    }

    const { data: artwork, error } = await supabase
      .from('art_gallery')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar quadro:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar quadro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: artwork
    })
  } catch (error) {
    console.error('Erro na API de atualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const isAdmin = user.user_metadata?.role === 'admin'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('art_gallery')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar quadro:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar quadro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Quadro deletado com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de deleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}