import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { withErrorHandler, throwAuthenticationError, throwAuthorizationError } from '@/lib/error-handler'
import { blogPostSchema, validateData, sanitizeInput } from '@/lib/validation-schemas'
import { auditLogger } from '@/lib/audit-logger'
import { supabaseWithRetry } from '@/lib/retry-handler'

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  
  // Verify admin access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throwAuthenticationError('Sessão não encontrada')
  }

  if (session?.user?.email !== 'armazemsaojoaquimoficial@gmail.com') {
    throwAuthorizationError('Acesso restrito a administradores')
  }

  // Parse and sanitize input data
  const rawData = await request.json()
  const sanitizedData = sanitizeInput(rawData)
  
  // Validate data
  const validation = validateData(blogPostSchema, sanitizedData)
  if (!validation.success) {
    return NextResponse.json({
      success: false,
      error: {
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        validationErrors: validation.errors,
        timestamp: new Date().toISOString()
      }
    }, { status: 400 })
  }

  // Create blog post with retry
  const newPost = await supabaseWithRetry(async () => {
    return await supabase
      .from('blog_posts')
      .insert({
        ...validation.data,
        author_id: session?.user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image_url,
        published,
        published_at,
        meta_title,
        meta_description,
        category,
        tags,
        created_at,
        updated_at
      `)
      .single()
  })

  // TODO: Fix audit logging typing
  // await auditLogger.logCreate('blog_post', ...)

  return NextResponse.json({
    success: true,
    data: { post: newPost }
  }, { status: 201 })
})

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  
  // Verify admin access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throwAuthenticationError('Sessão não encontrada')
  }

  if (session?.user?.email !== 'armazemsaojoaquimoficial@gmail.com') {
    throwAuthorizationError('Acesso restrito a administradores')
  }

  // Parse pagination parameters
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const status = searchParams.get('status') // published, draft, all

  // Build query with filters
  let query = supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      published,
      published_at,
      category,
      tags,
      created_at,
      updated_at
    `, { count: 'exact' })

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (status === 'published') {
    query = query.eq('published', true)
  } else if (status === 'draft') {
    query = query.eq('published', false)
  }

  // Get posts with pagination using retry
  const result = await supabaseWithRetry(async () => {
    return await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })
  })
  
  const posts = result || []
  const count = posts.length

  // Get categories for filter options
  const categoriesResult = await supabaseWithRetry(async () => {
    return await supabase
      .from('blog_posts')
      .select('category')
      .not('category', 'is', null)
  })

  const categories = categoriesResult || []
  const uniqueCategories = [...new Set(categories.map(c => c.category))]

  // TODO: Fix audit logging after TypeScript issues resolved

  return NextResponse.json({
    success: true,
    data: {
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      filters: {
        categories: uniqueCategories
      }
    }
  })
})