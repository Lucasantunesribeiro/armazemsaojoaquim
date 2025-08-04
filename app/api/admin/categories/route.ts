import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

// GET - List all menu categories or get count
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
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
    
    // Check if user is admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin - exact email match
    if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if this is a count request
    if (request.url.includes('/count')) {
      const { count, error } = await supabase
        .from('menu_categories')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error fetching menu categories count:', error)
        return NextResponse.json({ error: 'Failed to fetch menu categories count' }, { status: 500 })
      }

      return NextResponse.json({ count: count || 0 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get menu categories with pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: categories, error, count } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('Error fetching menu categories:', error)
      return NextResponse.json({ error: 'Failed to fetch menu categories' }, { status: 500 })
    }

    return NextResponse.json({
      categories: categories || [],
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