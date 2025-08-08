import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📄 [ADMIN-BLOG-POSTS] Carregando posts do blog...')
      
      const supabase = await createServerClient()
      const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (status && status !== 'all') {
      if (status === 'published') {
        query = query.eq('published', true)
      } else if (status === 'draft') {
        query = query.eq('published', false).is('published_at', null)
      } else if (status === 'scheduled') {
        query = query.eq('published', false).not('published_at', 'is', null)
      }
    }
    
    if (category && category !== 'all') {
      query = query.or(`category_pt.eq.${category},category_en.eq.${category}`)
    }
    
    if (search) {
      query = query.or(`title_pt.ilike.%${search}%,title_en.ilike.%${search}%,excerpt_pt.ilike.%${search}%,excerpt_en.ilike.%${search}%`)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: posts, error, count } = await query
      .range(from, to)
      .select('*')
    
      if (error) {
        console.error('❌ [ADMIN-BLOG-POSTS] Erro ao buscar posts:', error)
        return NextResponse.json(
          { error: 'Failed to fetch blog posts', debug: error.message },
          { status: 500 }
        )
      }
      
      console.log(`✅ [ADMIN-BLOG-POSTS] ${posts?.length || 0} posts carregados`)
      return NextResponse.json({
        success: true,
        posts: posts || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
      
    } catch (error) {
      console.error('💥 [ADMIN-BLOG-POSTS] Erro interno:', error)
      throw error
    }
  }, request)
}

export async function POST(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('➕ [ADMIN-BLOG-POSTS] Criando novo post...')
      
      const supabase = await createServerClient()
      const body = await request.json()
    
    const {
      title_pt,
      title_en,
      slug_pt,
      slug_en,
      content_pt,
      content_en,
      excerpt_pt,
      excerpt_en,
      meta_title_pt,
      meta_title_en,
      meta_description_pt,
      meta_description_en,
      category_pt,
      category_en,
      tags_pt,
      tags_en,
      image_url,
      published,
      featured,
      author_name,
      published_at
    } = body
    
      // Validate required fields
      if (!title_pt || !title_en || !content_pt || !content_en) {
        console.error('❌ [ADMIN-BLOG-POSTS] Campos obrigatórios faltando')
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }
    
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        title_pt,
        title_en,
        slug_pt: slug_pt || title_pt.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        slug_en: slug_en || title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content_pt,
        content_en,
        excerpt_pt,
        excerpt_en,
        meta_title_pt,
        meta_title_en,
        meta_description_pt,
        meta_description_en,
        category_pt: category_pt || 'Geral',
        category_en: category_en || 'General',
        tags_pt: tags_pt || [],
        tags_en: tags_en || [],
        image_url,
        published: published || false,
        featured: featured || false,
        author_name,
        published_at: published && published_at ? published_at : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
      if (error) {
        console.error('❌ [ADMIN-BLOG-POSTS] Erro ao criar post:', error)
        return NextResponse.json(
          { error: 'Failed to create blog post', debug: error.message },
          { status: 500 }
        )
      }
      
      console.log(`✅ [ADMIN-BLOG-POSTS] Post criado: ${post?.title_pt || 'Sem título'}`)
      return NextResponse.json({ 
        success: true, 
        data: post 
      }, { status: 201 })
      
    } catch (error) {
      console.error('💥 [ADMIN-BLOG-POSTS] Erro interno:', error)
      throw error
    }
  }, request)
}