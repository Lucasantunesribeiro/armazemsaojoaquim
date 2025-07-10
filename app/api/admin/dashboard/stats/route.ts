import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service Role para acessar dados sem RLS
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

// Cliente regular para verificar auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API Stats: Iniciando coleta de dados')
    
    // Verificar autenticação
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user } } = await supabaseAuth.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verificar se é admin (usando email específico)
    if (user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }

    console.log('✅ API Stats: Usuário admin verificado')

    // Coletar estatísticas em paralelo
    const [
      usersData,
      reservationsData,
      menuData,
      blogData,
      categoriesData
    ] = await Promise.all([
      collectUsersStats(),
      collectReservationsStats(),
      collectMenuStats(),
      collectBlogStats(),
      collectCategoriesStats()
    ])

    const stats = {
      users: usersData,
      reservations: reservationsData,
      menu: menuData,
      blog: blogData,
      lastUpdated: new Date().toISOString()
    }

    console.log('✅ API Stats: Dados coletados com sucesso')
    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ API Stats: Erro:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Coletar estatísticas de usuários
async function collectUsersStats() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, created_at')

    if (error) throw error

    const total = profiles?.length || 0
    const adminCount = 1 // Apenas o admin principal
    
    // Usuários criados este mês
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const newThisMonth = profiles?.filter(u => 
      new Date(u.created_at) >= thisMonth
    ).length || 0

    return { total, adminCount, newThisMonth }
  } catch (error) {
    console.error('Erro ao coletar stats de usuários:', error)
    return { total: 0, adminCount: 1, newThisMonth: 0 }
  }
}

// Coletar estatísticas de reservas
async function collectReservationsStats() {
  try {
    const { data: reservations, error } = await supabaseAdmin
      .from('reservas')
      .select('id, status, data, created_at')

    if (error) throw error

    const total = reservations?.length || 0
    const confirmed = reservations?.filter(r => r.status === 'confirmada').length || 0
    const pending = reservations?.filter(r => r.status === 'pendente').length || 0
    const active = confirmed + pending

    // Reservas para hoje
    const today = new Date().toISOString().split('T')[0]
    const todayReservations = reservations?.filter(r => 
      r.data === today
    ).length || 0

    return { 
      total, 
      active, 
      today: todayReservations, 
      confirmed, 
      pending 
    }
  } catch (error) {
    console.error('Erro ao coletar stats de reservas:', error)
    return { total: 0, active: 0, today: 0, confirmed: 0, pending: 0 }
  }
}

// Coletar estatísticas do menu
async function collectMenuStats() {
  try {
    const [menuItems, categories] = await Promise.all([
      supabaseAdmin.from('menu_items').select('id, available, featured'),
      supabaseAdmin.from('menu_categories').select('id')
    ])

    if (menuItems.error) throw menuItems.error
    if (categories.error) throw categories.error

    const totalItems = menuItems.data?.length || 0
    const availableItems = menuItems.data?.filter(item => item.available).length || 0
    const featuredItems = menuItems.data?.filter(item => item.featured).length || 0
    const categoriesCount = categories.data?.length || 0

    return {
      totalItems,
      categories: categoriesCount,
      availableItems,
      featuredItems
    }
  } catch (error) {
    console.error('Erro ao coletar stats do menu:', error)
    return { totalItems: 0, categories: 0, availableItems: 0, featuredItems: 0 }
  }
}

// Coletar estatísticas do blog
async function collectBlogStats() {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, published, created_at')

    if (error) throw error

    const totalPosts = posts?.length || 0
    const published = posts?.filter(p => p.published).length || 0
    const drafts = totalPosts - published

    // Posts criados nas últimas 2 semanas
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    
    const recentPosts = posts?.filter(p => 
      new Date(p.created_at) >= twoWeeksAgo
    ).length || 0

    return { totalPosts, published, drafts, recentPosts }
  } catch (error) {
    console.error('Erro ao coletar stats do blog:', error)
    return { totalPosts: 0, published: 0, drafts: 0, recentPosts: 0 }
  }
}

// Coletar estatísticas de categorias
async function collectCategoriesStats() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('menu_categories')
      .select('id, name')

    if (error) throw error

    return { total: categories?.length || 0 }
  } catch (error) {
    console.error('Erro ao coletar stats de categorias:', error)
    return { total: 0 }
  }
}