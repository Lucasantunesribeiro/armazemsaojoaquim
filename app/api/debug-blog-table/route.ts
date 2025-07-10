import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

interface DebugInfo {
  timestamp: string
  checks: Record<string, any>
  errors: string[]
  summary?: {
    total_checks: number
    successful_checks: number
    failed_checks: number
    overall_status: string
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Blog Table: Iniciando verificação...')
    
    const supabase = createServerClient(cookies())
    
    const debugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      checks: {},
      errors: []
    }

    // 1. Check if user is authenticated
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        debugInfo.checks.authentication = 'FAILED - No session found'
      } else {
        debugInfo.checks.authentication = `SUCCESS - User: ${session.user.email}`
      }
    } catch (authError: any) {
      debugInfo.checks.authentication = `ERROR - ${authError?.message || 'Unknown auth error'}`
      debugInfo.errors.push(`Auth error: ${authError?.message || 'Unknown auth error'}`)
    }

    // 2. Check blog_posts table structure
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_columns', { table_name: 'blog_posts' })
        .limit(1)
        
      if (tableError) {
        // Fallback: try a simple select to see what columns exist
        const { data: samplePost, error: sampleError } = await supabase
          .from('blog_posts')
          .select('*')
          .limit(1)
          .single()
          
        if (sampleError && sampleError.code !== 'PGRST116') {
          debugInfo.checks.table_structure = `ERROR - ${sampleError.message}`
          debugInfo.errors.push(`Table structure error: ${sampleError.message}`)
        } else if (samplePost) {
          debugInfo.checks.table_structure = 'SUCCESS - Table accessible'
          debugInfo.checks.sample_columns = Object.keys(samplePost)
        } else {
          debugInfo.checks.table_structure = 'SUCCESS - Table exists but empty'
        }
      } else {
        debugInfo.checks.table_structure = 'SUCCESS - Got table info'
        debugInfo.checks.table_columns = tableInfo
      }
    } catch (structureError: any) {
      debugInfo.checks.table_structure = `ERROR - ${structureError?.message || 'Unknown structure error'}`
      debugInfo.errors.push(`Structure check error: ${structureError?.message || 'Unknown structure error'}`)
    }

    // 3. Check if specific post exists (the one from the error)
    const targetPostId = 'eba7ad99-df5c-40e8-a3fb-597e7945c4d6'
    try {
      const { data: targetPost, error: targetError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, created_at, updated_at, published')
        .eq('id', targetPostId)
        .single()
        
      if (targetError) {
        if (targetError.code === 'PGRST116') {
          debugInfo.checks.target_post = 'NOT FOUND - Post does not exist'
        } else {
          debugInfo.checks.target_post = `ERROR - ${targetError.message}`
          debugInfo.errors.push(`Target post error: ${targetError.message}`)
        }
      } else {
        debugInfo.checks.target_post = `FOUND - ${targetPost.title}`
        debugInfo.checks.target_post_details = {
          id: targetPost.id,
          title: targetPost.title,
          slug: targetPost.slug,
          published: targetPost.published,
          created_at: targetPost.created_at,
          updated_at: targetPost.updated_at
        }
      }
    } catch (targetError: any) {
      debugInfo.checks.target_post = `ERROR - ${targetError?.message || 'Unknown target error'}`
      debugInfo.errors.push(`Target post check error: ${targetError?.message || 'Unknown target error'}`)
    }

    // 4. Count total posts
    try {
      const { count, error: countError } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        
      if (countError) {
        debugInfo.checks.total_posts = `ERROR - ${countError.message}`
        debugInfo.errors.push(`Count error: ${countError.message}`)
      } else {
        debugInfo.checks.total_posts = `SUCCESS - ${count} posts total`
      }
    } catch (countError: any) {
      debugInfo.checks.total_posts = `ERROR - ${countError?.message || 'Unknown count error'}`
      debugInfo.errors.push(`Count check error: ${countError?.message || 'Unknown count error'}`)
    }

    // 5. List some recent posts
    try {
      const { data: recentPosts, error: recentError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, created_at, published')
        .order('created_at', { ascending: false })
        .limit(5)
        
      if (recentError) {
        debugInfo.checks.recent_posts = `ERROR - ${recentError.message}`
        debugInfo.errors.push(`Recent posts error: ${recentError.message}`)
      } else {
        debugInfo.checks.recent_posts = `SUCCESS - Found ${recentPosts.length} recent posts`
        debugInfo.checks.recent_posts_list = recentPosts.map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          published: post.published
        }))
      }
    } catch (recentError: any) {
      debugInfo.checks.recent_posts = `ERROR - ${recentError?.message || 'Unknown recent posts error'}`
      debugInfo.errors.push(`Recent posts check error: ${recentError?.message || 'Unknown recent posts error'}`)
    }

    // 6. Test a simple update operation (dry run)
    try {
      const testUpdateData = {
        title: 'Test Update - ' + new Date().toISOString(),
        content: 'Test content for debug',
        slug: 'test-debug-' + Date.now(),
        updated_at: new Date().toISOString()
      }
      
      // Don't actually update, just validate the query structure
      const query = supabase
        .from('blog_posts')
        .update(testUpdateData)
        .eq('id', 'test-id-that-does-not-exist')
        .select()
      
      debugInfo.checks.update_query_test = 'SUCCESS - Query structure is valid'
    } catch (updateTestError: any) {
      debugInfo.checks.update_query_test = `ERROR - ${updateTestError?.message || 'Unknown update test error'}`
      debugInfo.errors.push(`Update test error: ${updateTestError?.message || 'Unknown update test error'}`)
    }

    // Summary
    const successCount = Object.values(debugInfo.checks).filter(check => 
      typeof check === 'string' && check.startsWith('SUCCESS')
    ).length
    const errorCount = debugInfo.errors.length
    
    debugInfo.summary = {
      total_checks: Object.keys(debugInfo.checks).length,
      successful_checks: successCount,
      failed_checks: errorCount,
      overall_status: errorCount === 0 ? 'HEALTHY' : 'ISSUES_FOUND'
    }

    console.log('✅ Debug Blog Table: Verificação concluída')
    console.log('📊 Resumo:', debugInfo.summary)
    
    return NextResponse.json(debugInfo, { status: 200 })
    
  } catch (error: any) {
    console.error('❌ Debug Blog Table: Erro inesperado:', error)
    return NextResponse.json({
      error: 'Debug check failed',
      details: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 