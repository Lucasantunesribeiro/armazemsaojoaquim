import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

// Helper function to check admin privileges using token from cookies
async function checkAdminAuthWithCookies(request: NextRequest) {
  console.log('🔍 API Blog: Iniciando verificação de autenticação admin com cookies...')
  
  try {
    // Get cookies from request
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    console.log('🍪 API Blog: Cookies encontrados:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Try to find auth token in cookies
    const authTokenCookie = allCookies.find(cookie => 
      cookie.name.includes('auth-token') || 
      cookie.name.includes('sb-') && cookie.name.includes('auth-token')
    )
    
    const accessTokenCookie = allCookies.find(cookie => 
      cookie.name.includes('access-token') || 
      cookie.name.includes('sb-') && cookie.name.includes('access-token')
    )
    
    console.log('🔍 API Blog: Auth cookies:', {
      authToken: !!authTokenCookie,
      accessToken: !!accessTokenCookie,
      authTokenName: authTokenCookie?.name,
      accessTokenName: accessTokenCookie?.name
    })
    
    // Create supabase client with service role for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ API Blog: Variáveis de ambiente não configuradas')
      return { authorized: false, status: 500, message: 'Server configuration error' }
    }
    
    // Try with the standard component client first
    const supabase = createServerComponentClient<Database>({ cookies })
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔍 API Blog: Sessão via component client:', {
      hasSession: !!session,
      error: error?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (session && session.user) {
      console.log('✅ API Blog: Sessão válida encontrada via component client')
      
      // Check if user is admin
      if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
        console.log('✅ API Blog: Usuário é admin')
        return { authorized: true, userId: session.user.id }
      } else {
        console.log('❌ API Blog: Usuário não é admin:', session.user.email)
        return { authorized: false, status: 403, message: 'Forbidden - not admin' }
      }
    }
    
    // If component client failed, try getting token manually
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 API Blog: Authorization header:', !!authHeader)
    
    if (!authHeader && !authTokenCookie && !accessTokenCookie) {
      console.log('❌ API Blog: Nenhum token encontrado')
      return { authorized: false, status: 401, message: 'No authentication token found' }
    }
    
    // Return unauthorized if we can't validate
    console.log('❌ API Blog: Não foi possível validar autenticação')
    return { authorized: false, status: 401, message: 'Authentication validation failed' }
    
  } catch (error) {
    console.error('❌ API Blog: Erro na verificação de auth:', error)
    return { authorized: false, status: 500, message: 'Auth check failed: ' + (error instanceof Error ? error.message : 'Unknown error') }
  }
}

// GET - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 API Blog GET: Iniciando busca do post:', params.id)
    
    // Check admin auth with new method
    const authResult = await checkAdminAuthWithCookies(request)
    if (!authResult.authorized) {
      console.log('❌ API Blog GET: Não autorizado:', authResult.message)
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    console.log('✅ API Blog GET: Usuário autorizado, buscando post')
    
    const supabase = createServerComponentClient<Database>({ cookies })
    
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('❌ API Blog GET: Erro ao buscar post:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
    }

    console.log('✅ API Blog GET: Post encontrado:', post.title)
    return NextResponse.json({ post })
  } catch (error) {
    console.error('❌ API Blog GET: Erro inesperado:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check admin auth
    const authResult = await checkAdminAuthWithCookies(request)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const body = await request.json()
    const { title, content, excerpt, featured_image, published, slug } = body

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content, and slug are required' 
      }, { status: 400 })
    }

    // Check if slug already exists (excluding current post)
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single()

    if (existingPost) {
      return NextResponse.json({ 
        error: 'Slug already exists. Please choose a different slug.' 
      }, { status: 400 })
    }

    // Get current post to compare published status
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select('published, published_at')
      .eq('id', params.id)
      .single()

    const updateData: BlogPostUpdate = {
      title,
      content,
      excerpt: excerpt || null,
      featured_image: featured_image || null,
      published: published || false,
      slug,
      updated_at: new Date().toISOString()
    }

    // Set published_at if publishing for the first time
    if (published && currentPost && (!currentPost.published || !currentPost.published_at)) {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check admin auth
    const authResult = await checkAdminAuthWithCookies(request)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}