import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 RLS TEST: Iniciando teste de diagnóstico...')
    
    // Testar acesso com Service Role
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, published, created_at')
      .limit(5)

    if (postsError) {
      console.error('❌ RLS TEST: Erro ao buscar posts:', postsError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar posts',
        details: postsError
      })
    }

    // Testar busca de usuários
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('role', 'admin')

    if (usersError) {
      console.error('❌ RLS TEST: Erro ao buscar usuários:', usersError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar usuários',
        details: usersError
      })
    }

    // Testar verificação de políticas RLS
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('information_schema.table_privileges')
      .select('*')
      .eq('table_name', 'blog_posts')
      .limit(5)

    console.log('✅ RLS TEST: Teste concluído com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Service Role funcionando',
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
      },
      results: {
        posts: posts?.length || 0,
        postsSample: posts?.slice(0, 3) || [],
        adminUsers: users?.length || 0,
        adminUsersSample: users?.map(u => ({ id: u.id, email: u.email, role: u.role })) || []
      }
    })

  } catch (error: any) {
    console.error('❌ RLS TEST: Erro interno:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 RLS TEST: Teste de UPDATE via Service Role...')
    
    const body = await request.json()
    const { postId, testData } = body
    
    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'postId é obrigatório'
      }, { status: 400 })
    }

    // Testar atualização com Service Role
    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update({
        title: testData?.title || 'Teste RLS Update',
        content: testData?.content || 'Teste de atualização via Service Role',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ RLS TEST: Erro ao atualizar post:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao atualizar post',
        details: updateError
      }, { status: 500 })
    }

    console.log('✅ RLS TEST: Post atualizado com sucesso via Service Role')
    return NextResponse.json({
      success: true,
      message: 'Post atualizado com sucesso via Service Role',
      post: updatedPost
    })

  } catch (error: any) {
    console.error('❌ RLS TEST: Erro interno no POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error.message
    }, { status: 500 })
  }
}