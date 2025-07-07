import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

// GET - List all reservations with user profiles
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin - exact email match
    if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    let query = supabase
      .from('reservas')
      .select('*')
      .order('data', { ascending: false })
      .order('horario', { ascending: false })

    // Filter by status if provided
    if (status && status !== 'todas') {
      query = query.eq('status', status)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: reservas, error, count } = await query

    if (error) {
      console.error('Error fetching reservas:', error)
      return NextResponse.json({ error: 'Failed to fetch reservas' }, { status: 500 })
    }

    if (!reservas) {
      return NextResponse.json({
        reservas: [],
        pagination: { page, limit, total: 0, pages: 0 }
      })
    }

    // Get user profiles for all reservations
    const reservasArray = reservas as any[]
    const userIds = [...new Set(reservasArray.filter(r => r.user_id).map(r => r.user_id))]
    let profiles: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', userIds)

      profilesData?.forEach((profile: any) => {
        profiles[profile.id] = profile
      })
    }

    // Combine reservas with profile data
    const reservasWithProfiles = reservasArray.map((reserva: any) => ({
      ...reserva,
      profile: reserva.user_id ? profiles[reserva.user_id] : null
    }))

    return NextResponse.json({
      reservas: reservasWithProfiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update reservation status  
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin - exact email match
    if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status } = body

    // Validate required fields
    if (!id || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: id, status' 
      }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pendente', 'confirmada', 'cancelada', 'concluida']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Valid values: ' + validStatuses.join(', ')
      }, { status: 400 })
    }

    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (status === 'confirmada') {
      updateData.confirmado_em = new Date().toISOString()
    } else if (status === 'cancelada') {
      updateData.cancelado_em = new Date().toISOString()
    }

    const { data: updatedReserva, error } = await supabase
      .from('reservas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating reserva:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Reserva not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update reserva' }, { status: 500 })
    }

    return NextResponse.json({ reserva: updatedReserva })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 