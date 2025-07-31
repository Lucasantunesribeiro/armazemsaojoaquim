import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'

// Service Role client para operações que precisam bypassar RLS
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

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

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
      const supabase = createServerClient(cookies())
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
      console.log('✅ API Blog: Usuário é admin por email')
      return { authorized: true, userId: session.user.id, session }
    }
    
    // Fallback: check role in database using Service Role
    try {
      const { data: userData, error: roleError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!roleError && userData?.role === 'admin') {
        console.log('✅ API Blog: Usuário é admin por role no banco')
        return { authorized: true, userId: session.user.id, session }
      }
    } catch (error) {
      console.warn('⚠️ API Blog: Erro ao verificar role no banco:', error)
    }
    
    console.log('❌ API Blog: Usuário não é admin:', session.user.email)
    return { authorized: false, status: 403, message: 'Forbidden - Admin access required' }
    
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
    
    // Check admin auth
    const authResult = await checkAdminAuth(request)
    if (!authResult.authorized) {
      console.log('❌ API Blog GET: Não autorizado:', authResult.message)
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    console.log('✅ API Blog GET: Usuário autorizado, buscando post')
    
    // Use Service Role para buscar dados, bypassing RLS
    const { data: post, error } = await supabaseAdmin
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
    console.log('📝 API Blog PUT: Iniciando atualização do post:', params.id)
    
    // Check admin auth
    const authResult = await checkAdminAuth(request)
    if (!authResult.authorized) {
      console.log('❌ API Blog PUT: Não autorizado:', authResult.message)
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    console.log('✅ API Blog PUT: Usuário autorizado, atualizando post')
    
    // Usar Service Role para operações de escrita, bypassing RLS
    console.log('🔍 API Blog PUT: Usando Service Role para bypass RLS')

    // Parse and log the request body
    let body
    try {
      body = await request.json()
      console.log('📝 API Blog PUT: Dados recebidos:', {
        title: body.title,
        contentLength: body.content?.length || 0,
        excerpt: body.excerpt,
        published: body.published,
        slug: body.slug,
        featured_image: body.featured_image
      })
    } catch (parseError) {
      console.error('❌ API Blog PUT: Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json({ 
        error: 'Invalid JSON data' 
      }, { status: 400 })
    }

    const { title, content, content_html, excerpt, featured_image, published, slug } = body

    // Validate required fields
    if (!title || title.trim() === '') {
      console.log('❌ API Blog PUT: Título ausente ou vazio')
      return NextResponse.json({ 
        error: 'Title is required and cannot be empty' 
      }, { status: 400 })
    }

    if (!content || content.trim() === '') {
      console.log('❌ API Blog PUT: Conteúdo ausente ou vazio')
      return NextResponse.json({ 
        error: 'Content is required and cannot be empty' 
      }, { status: 400 })
    }

    if (!slug || slug.trim() === '') {
      console.log('❌ API Blog PUT: Slug ausente ou vazio')
      return NextResponse.json({ 
        error: 'Slug is required and cannot be empty' 
      }, { status: 400 })
    }

    console.log('✅ API Blog PUT: Validação de campos obrigatórios passou')

    // Check if the post exists first
    try {
      const { data: existingPostCheck, error: existError } = await supabaseAdmin
        .from('blog_posts')
        .select('id, title, slug')
        .eq('id', params.id)
        .single()

      if (existError) {
        console.error('❌ API Blog PUT: Erro ao verificar se post existe:', existError)
        if (existError.code === 'PGRST116') {
          return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
        }
        return NextResponse.json({ 
          error: 'Database error while checking post existence',
          details: existError.message 
        }, { status: 500 })
      }

      console.log('✅ API Blog PUT: Post existe:', existingPostCheck.title)
    } catch (checkError) {
      console.error('❌ API Blog PUT: Erro inesperado ao verificar post:', checkError)
      return NextResponse.json({ 
        error: 'Error checking post existence',
        details: checkError instanceof Error ? checkError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Check if slug already exists (excluding current post)
    try {
      const { data: slugCheck } = await supabaseAdmin
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', params.id)
        .single()

      if (slugCheck) {
        console.log('❌ API Blog PUT: Slug já existe:', slug)
        return NextResponse.json({ 
          error: 'Slug already exists. Please choose a different slug.' 
        }, { status: 400 })
      }

      console.log('✅ API Blog PUT: Slug está disponível:', slug)
    } catch (slugError) {
      console.error('❌ API Blog PUT: Erro ao verificar slug:', slugError)
      // Continue execution as this might just mean no duplicate found
    }

    // Get current post to compare published status
    let currentPost = null
    try {
      const { data: currentPostData, error: currentError } = await supabaseAdmin
        .from('blog_posts')
        .select('published, published_at')
        .eq('id', params.id)
        .single()

      if (currentError) {
        console.error('❌ API Blog PUT: Erro ao buscar post atual:', currentError)
      } else {
        currentPost = currentPostData
        console.log('✅ API Blog PUT: Post atual carregado, published:', currentPost.published)
      }
    } catch (currentError) {
      console.error('❌ API Blog PUT: Erro inesperado ao buscar post atual:', currentError)
    }

    // Prepare update data
    const updateData: BlogPostUpdate = {
      title: title.trim(),
      content: content.trim(),
      content_html: content_html ? content_html.trim() : content.trim(), // Use content_html if provided, fallback to content
      excerpt: excerpt ? excerpt.trim() : null,
      featured_image: featured_image ? featured_image.trim() : null,
      published: Boolean(published),
      slug: slug.trim(),
      updated_at: new Date().toISOString()
    }

    // Set published_at if publishing for the first time
    if (published && currentPost && (!currentPost.published || !currentPost.published_at)) {
      updateData.published_at = new Date().toISOString()
      console.log('📝 API Blog PUT: Definindo published_at para primeira publicação')
    }

    console.log('📝 API Blog PUT: Dados preparados para atualização:', {
      title: updateData.title,
      contentLength: updateData.content?.length || 0,
      published: updateData.published,
      slug: updateData.slug,
      hasExcerpt: !!updateData.excerpt,
      hasFeaturedImage: !!updateData.featured_image
    })

    // Perform the update using Service Role (bypasses RLS)
    try {
      console.log('🔄 API Blog PUT: Executando update com Service Role...')
      const { data: updatedPost, error: updateError } = await supabaseAdmin
        .from('blog_posts')
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ API Blog PUT: Erro do Supabase ao atualizar post:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        })
        
        if (updateError.code === 'PGRST116') {
          return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
        }
        
        return NextResponse.json({ 
          error: 'Failed to update blog post',
          details: updateError.message,
          code: updateError.code
        }, { status: 500 })
      }

      if (!updatedPost) {
        console.error('❌ API Blog PUT: Post atualizado mas dados não retornados')
        return NextResponse.json({ 
          error: 'Post updated but no data returned'
        }, { status: 500 })
      }

      console.log('✅ API Blog PUT: Post atualizado com sucesso:', {
        id: updatedPost.id,
        title: updatedPost.title,
        published: updatedPost.published
      })
      
      return NextResponse.json({ post: updatedPost })
      
    } catch (updateError) {
      console.error('❌ API Blog PUT: Erro inesperado durante atualização:', updateError)
      return NextResponse.json({ 
        error: 'Unexpected error during update',
        details: updateError instanceof Error ? updateError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ API Blog PUT: Erro inesperado no nível superior:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 API Blog DELETE: Iniciando exclusão do post:', params.id)
    
    // Check admin auth
    const authResult = await checkAdminAuth(request)
    if (!authResult.authorized) {
      console.log('❌ API Blog DELETE: Não autorizado:', authResult.message)
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    console.log('✅ API Blog DELETE: Usuário autorizado, excluindo post')
    
    // Use Service Role para operações de escrita, bypassing RLS
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('❌ API Blog DELETE: Erro ao excluir post:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
    }

    console.log('✅ API Blog DELETE: Post excluído com sucesso')
    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('❌ API Blog DELETE: Erro inesperado:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}