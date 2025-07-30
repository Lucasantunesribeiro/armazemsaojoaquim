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
    
    const { data: { user } } = await supabase.auth.getUser()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    // Verificar se é admin ou usuário consultando seus próprios pedidos
    const isAdmin = user?.user_metadata?.role === 'admin'
    
    let query = supabase
      .from('art_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      if (!email) {
        return NextResponse.json(
          { error: 'Email obrigatório para consulta' },
          { status: 400 }
        )
      }
      query = query.eq('email', email)
    }

    if (status) {
      query = query.eq('status', status.toUpperCase())
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders?.length || 0
    })
  } catch (error) {
    console.error('Erro na API de pedidos:', error)
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

    const body = await request.json()
    const { 
      customer_name, 
      email, 
      phone, 
      artwork_ids, 
      shipping_address, 
      notes 
    } = body

    // Validação básica
    if (!customer_name || !email || !artwork_ids || artwork_ids.length === 0 || !shipping_address) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: customer_name, email, artwork_ids, shipping_address' },
        { status: 400 }
      )
    }

    // Buscar detalhes dos quadros
    const { data: artworks, error: artworksError } = await supabase
      .from('art_gallery')
      .select('*')
      .in('id', artwork_ids)

    if (artworksError || !artworks || artworks.length === 0) {
      return NextResponse.json(
        { error: 'Quadros não encontrados' },
        { status: 404 }
      )
    }

    // Verificar disponibilidade
    const unavailableArtworks = artworks.filter(artwork => artwork.stock_quantity <= 0)
    if (unavailableArtworks.length > 0) {
      return NextResponse.json(
        { error: `Quadros indisponíveis: ${unavailableArtworks.map(a => a.title).join(', ')}` },
        { status: 400 }
      )
    }

    // Calcular preço total
    const total_price = artworks.reduce((sum, artwork) => sum + Number(artwork.price), 0)

    // Preparar detalhes dos quadros para armazenar no pedido
    const artwork_details = artworks.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      price: artwork.price,
      image_url: artwork.image_url,
      category: artwork.category,
      dimensions: artwork.dimensions
    }))

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('art_orders')
      .insert({
        customer_name,
        email,
        phone,
        artwork_ids,
        artwork_details,
        total_price,
        shipping_address,
        notes,
        status: 'PENDING'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError)
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Atualizar estoque dos quadros
    for (const artwork of artworks) {
      await supabase
        .from('art_gallery')
        .update({ stock_quantity: artwork.stock_quantity - 1 })
        .eq('id', artwork.id)
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Pedido criado com sucesso'
    }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de criação de pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}