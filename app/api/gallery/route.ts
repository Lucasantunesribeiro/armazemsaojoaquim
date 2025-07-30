import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
      .from('art_gallery')
      .select('*')
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category.toUpperCase())
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit || '10')) - 1)
    }

    const { data: artworks, error } = await query

    if (error) {
      console.error('Erro ao buscar quadros:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: artworks,
      count: artworks?.length || 0
    })
  } catch (error) {
    console.error('Erro na API de galeria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const isAdmin = user.user_metadata?.role === 'admin'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      artist, 
      description, 
      price, 
      image_url, 
      category, 
      dimensions, 
      year_created, 
      historical_context, 
      stock_quantity = 1, 
      featured = false 
    } = body

    // Validação básica
    if (!title || !artist || !price || !category) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: title, artist, price, category' },
        { status: 400 }
      )
    }

    const { data: artwork, error } = await supabase
      .from('art_gallery')
      .insert({
        title,
        artist,
        description,
        price: parseFloat(price),
        image_url,
        category: category.toUpperCase(),
        dimensions,
        year_created: year_created ? parseInt(year_created) : null,
        historical_context,
        stock_quantity: parseInt(stock_quantity),
        featured
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar quadro:', error)
      return NextResponse.json(
        { error: 'Erro ao criar quadro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: artwork
    }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de galeria POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}