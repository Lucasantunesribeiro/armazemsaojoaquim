import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      console.log('📝 [ADMIN-BLOG] Carregando posts do blog...')
      
      // Use service role for admin operations to bypass RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { searchParams } = new URL(request.url)
      
      // Parâmetros de paginação e filtros
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
      const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))) // Reduced default from 20 to 10
      const search = searchParams.get('search')?.trim()
      const status = searchParams.get('status')?.trim()
      const category = searchParams.get('category')?.trim()

      console.log(`📊 [ADMIN-BLOG] Parâmetros - Page: ${page}, Limit: ${limit}, Search: ${search || 'none'}, Status: ${status || 'all'}, Category: ${category || 'all'}`)

      try {
        // Query base para contar total
        let countQuery = supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })

        // Query base para dados - optimized for performance
        let dataQuery = supabase
          .from('blog_posts')
          .select(`
            id,
            title_pt,
            title_en,
            excerpt_pt,
            excerpt_en,
            category_pt,
            category_en,
            image_url,
            published,
            featured,
            author_name,
            published_at,
            created_at
          `)

        // Aplicar filtros em ambas queries
        if (search) {
          const searchPattern = `%${search}%`
          countQuery = countQuery.or(`title_pt.ilike.${searchPattern},title_en.ilike.${searchPattern},content_pt.ilike.${searchPattern},content_en.ilike.${searchPattern}`)
          dataQuery = dataQuery.or(`title_pt.ilike.${searchPattern},title_en.ilike.${searchPattern},content_pt.ilike.${searchPattern},content_en.ilike.${searchPattern}`)
        }

        if (status && status !== 'all') {
          const isPublished = status === 'published'
          countQuery = countQuery.eq('published', isPublished)
          dataQuery = dataQuery.eq('published', isPublished)
        }

        if (category && category !== 'all') {
          countQuery = countQuery.or(`category_pt.eq.${category},category_en.eq.${category}`)
          dataQuery = dataQuery.or(`category_pt.eq.${category},category_en.eq.${category}`)
        }

        // Executar query de contagem
        const { count, error: countError } = await countQuery

        if (countError) {
          console.error('❌ [ADMIN-BLOG] Erro na contagem:', countError)
          throw new Error(`Count error: ${countError.message}`)
        }

        // Executar query de dados com paginação
        const { data: posts, error: dataError } = await dataQuery
          .range((page - 1) * limit, page * limit - 1)
          .order('created_at', { ascending: false })

        if (dataError) {
          console.error('❌ [ADMIN-BLOG] Erro nos dados:', dataError)
          throw new Error(`Data error: ${dataError.message}`)
        }

        // Calcular estatísticas separadamente
        const { data: statsData, error: statsError } = await supabase
          .from('blog_posts')
          .select('published, featured, created_at')

        let stats = {
          total: count || 0,
          published: 0,
          draft: 0,
          featured: 0
        }

        if (!statsError && statsData) {
          stats = {
            total: count || 0,
            published: statsData.filter((p: any) => p.published === true).length,
            draft: statsData.filter((p: any) => p.published === false).length,
            featured: statsData.filter((p: any) => p.featured === true).length
          }
        } else {
          console.warn('⚠️ [ADMIN-BLOG] Erro nas estatísticas:', statsError)
        }

        console.log(`✅ [ADMIN-BLOG] ${posts?.length || 0} posts carregados de ${count} total`)

        const responseData = {
          success: true,
          data: {
            posts: posts || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              pages: Math.ceil((count || 0) / limit),
              hasNext: page * limit < (count || 0),
              hasPrev: page > 1
            },
            stats,
            filters: {
              search: search || null,
              status: status || 'all',
              category: category || 'all'
            }
          },
          // Also include posts at root level for compatibility
          posts: posts || [],
          total: count || 0
        }

        return new NextResponse(JSON.stringify(responseData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=60, stale-while-revalidate=300', // Cache for 1 minute, stale for 5 minutes
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-Response-Time': Date.now().toString(),
            'Vary': 'Accept-Encoding'
          }
        })

      } catch (queryError) {
        console.error('❌ [ADMIN-BLOG] Erro na query:', queryError)
        return NextResponse.json(
          { 
            error: 'Erro ao buscar posts do blog', 
            debug: queryError instanceof Error ? queryError.message : 'Unknown query error'
          },
          { status: 500 }
        )
      }
      
    } catch (error) {
      console.error('💥 [ADMIN-BLOG] Erro interno:', error)
      return NextResponse.json(
        { 
          error: 'Erro interno do servidor',
          debug: error instanceof Error ? error.message : 'Unknown internal error'
        },
        { status: 500 }
      )
    }
  }, request)
}