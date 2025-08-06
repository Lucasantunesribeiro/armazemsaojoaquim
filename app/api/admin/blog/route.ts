import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
// import { cookies } from 'next/headers' // Não necessário mais
import { Database } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'

type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']

// Helper function to check admin privileges
async function checkAdminAuth(request: NextRequest) {
  console.log('🔍 API Blog: Verificando autenticação admin...')
  
  try {
    // First try to get session from Authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 API Blog: Auth header:', authHeader ? 'presente' : 'ausente')
    
    let session = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use Bearer token authentication
      const token = authHeader.substring(7) // Remove 'Bearer '
      console.log('🔍 API Blog: Usando Bearer token:', token.substring(0, 20) + '...')
      
      // Create a Supabase client with the token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false
          }
        }
      )
      
      // Get user from token
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        console.log('❌ API Blog: Token inválido:', error?.message)
        return { authorized: false, status: 401, message: 'Invalid authentication token' }
      }
      
      session = { user }
      console.log('✅ API Blog: Usuário autenticado via Bearer token:', user.email)
      
    } else {
      // Fallback to cookie-based authentication
      console.log('🔍 API Blog: Tentando autenticação via cookies...')
      const supabase = await createServerClient()
      const { data: sessionData, error } = await supabase.auth.getSession()
      
      if (error || !sessionData.session) {
        console.log('❌ API Blog: Nenhuma sessão encontrada:', error?.message)
        return { authorized: false, status: 401, message: 'No authentication token found' }
      }
      
      session = sessionData.session
      console.log('✅ API Blog: Usuário autenticado via cookies:', session.user.email)
    }
    
    // Check if user is admin
    if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
      console.log('✅ API Blog: Usuário é admin')
      return { authorized: true, userId: session.user.id, session }
    } else {
      console.log('❌ API Blog: Usuário não é admin:', session.user.email)
      return { authorized: false, status: 403, message: 'Forbidden - Admin access required' }
    }
    
  } catch (error) {
    console.error('❌ API Blog: Erro na verificação de auth:', error)
    return { authorized: false, status: 500, message: 'Auth check failed: ' + (error instanceof Error ? error.message : 'Unknown error') }
  }
}

// GET - List all blog posts using SECURITY DEFINER function or get count
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await checkAdminAuth(request)
    if (!authResult.authorized) {
      console.log('❌ API Blog GET: Não autorizado:', authResult.message)
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    console.log('✅ API Blog GET: Usuário autorizado, listando posts usando função SECURITY DEFINER')

    // Use função SECURITY DEFINER para bypassar RLS
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Check if this is a count request
    if (request.url.includes('/count')) {
      // Chamar função SECURITY DEFINER para contar posts
      const { data: posts, error } = await supabase.rpc('admin_get_blog_posts')

      if (error) {
        console.error('❌ API Blog GET: Erro ao buscar posts para contagem:', error)
        return NextResponse.json({ 
          error: 'Failed to fetch blog posts count: ' + error.message 
        }, { status: 500 })
      }

      return NextResponse.json({ count: posts?.length || 0 })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Chamar função SECURITY DEFINER
    const { data: posts, error } = await supabase.rpc('admin_get_blog_posts')

    if (error) {
      console.error('❌ API Blog GET: Erro ao buscar posts via função:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch blog posts: ' + error.message 
      }, { status: 500 })
    }

    console.log('✅ API Blog GET: Posts encontrados via função:', posts?.length || 0)
    
    // Aplicar filtros e paginação no código (pois a função retorna todos)
    let filteredPosts = posts || []
    
    // Search filter
    const search = searchParams.get('search')
    if (search) {
      filteredPosts = filteredPosts.filter((post: any) => 
        post.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Published filter
    const published = searchParams.get('published')
    if (published === 'true') {
      filteredPosts = filteredPosts.filter((post: any) => post.published)
    } else if (published === 'false') {
      filteredPosts = filteredPosts.filter((post: any) => !post.published)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit
    const paginatedPosts = filteredPosts.slice(from, to)

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        pages: Math.ceil(filteredPosts.length / limit)
      }
    })
  } catch (err: any) {
    console.error('Erro na API admin/blog:', err)
    return NextResponse.json(
      { error: err?.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Create new blog post using SECURITY DEFINER function
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const authResult = await checkAdminAuth(request)
    if (!authResult.authorized) {
      console.log('❌ API Blog POST: Não autorizado:', authResult.message)
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    console.log('✅ API Blog POST: Usuário autorizado, criando post usando função SECURITY DEFINER')

    const supabase = await createServerClient()
    const body = await request.json()
    const { title, content, excerpt, featured_image, published, slug } = body

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content, and slug are required' 
      }, { status: 400 })
    }

    // Generate slug if not provided
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    const finalSlug = slug || generateSlug(title)

    // Check if slug already exists usando consulta regular (com RLS básico)
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', finalSlug)
      .eq('published', true) // Apenas posts publicados (RLS permite)
      .single()

    if (existingPost) {
      return NextResponse.json({ 
        error: 'Slug already exists. Please choose a different slug.' 
      }, { status: 400 })
    }

    const postData = {
      title,
      content,
      excerpt: excerpt || null,
      featured_image: featured_image || null,
      published: published || false,
      slug: finalSlug
    }

    // Usar função SECURITY DEFINER para criar post
    const { data: newPostId, error } = await supabase.rpc('admin_create_blog_post', {
      post_data: postData
    })

    if (error) {
      console.error('❌ API Blog POST: Erro ao criar post via função:', error)
      return NextResponse.json({ 
        error: 'Failed to create blog post: ' + error.message 
      }, { status: 500 })
    }

    console.log('✅ API Blog POST: Post criado com sucesso via função:', newPostId)
    return NextResponse.json({ post: { id: newPostId, ...postData } }, { status: 201 })
  } catch (error) {
    console.error('❌ API Blog POST: Erro inesperado:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}