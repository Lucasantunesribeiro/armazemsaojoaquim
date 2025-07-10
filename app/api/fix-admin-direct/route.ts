import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 FIX ADMIN DIRECT: Iniciando correção direta do usuário admin...')
    
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    
    // 1. Primeiro, vamos verificar se existe um usuário admin na tabela
    const { data: adminInDB, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'armazemsaojoaquimoficial@gmail.com')
      .single()
    
    console.log('🔍 FIX ADMIN DIRECT: Admin em public.users:', {
      found: !!adminInDB,
      data: adminInDB,
      error: adminError?.message
    })
    
    // 2. Verificar se existe uma sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔍 FIX ADMIN DIRECT: Session check:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    // 3. Se não há sessão, mas temos admin no DB, vamos forçar logout e pedir novo login
    if (!session && adminInDB) {
      console.log('🔄 FIX ADMIN DIRECT: Sem sessão, mas admin existe no DB - removendo usuário antigo')
      
      // Remover usuário antigo
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', adminInDB.id)
      
      if (deleteError) {
        console.error('❌ FIX ADMIN DIRECT: Erro ao deletar usuário antigo:', deleteError)
      } else {
        console.log('✅ FIX ADMIN DIRECT: Usuário antigo removido')
      }
      
      return NextResponse.json({
        success: true,
        action: 'cleared_old_user',
        message: 'Usuário antigo removido. Faça logout e login novamente.',
        instructions: [
          '1. Faça logout completo',
          '2. Faça login novamente com armazemsaojoaquimoficial@gmail.com',
          '3. Tente acessar /admin novamente'
        ]
      })
    }
    
    // 4. Se temos sessão, verificar se precisa sincronizar
    if (session) {
      console.log('🔄 FIX ADMIN DIRECT: Sessão encontrada, sincronizando usuário...')
      
      // Verificar se é o admin
      if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
        return NextResponse.json({
          success: false,
          error: 'Apenas o admin pode executar esta operação',
          currentUser: session.user.email
        }, { status: 403 })
      }
      
      // Remover usuário antigo se existe
      if (adminInDB && adminInDB.id !== session.user.id) {
        console.log('🔄 FIX ADMIN DIRECT: Removendo usuário com ID incorreto...')
        
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', adminInDB.id)
        
        if (deleteError) {
          console.error('❌ FIX ADMIN DIRECT: Erro ao deletar usuário antigo:', deleteError)
        } else {
          console.log('✅ FIX ADMIN DIRECT: Usuário antigo removido')
        }
      }
      
      // Criar ou atualizar usuário com ID correto
      const { data: newUser, error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Administrador Armazém',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (upsertError) {
        console.error('❌ FIX ADMIN DIRECT: Erro ao criar/atualizar usuário:', upsertError)
        return NextResponse.json({
          success: false,
          error: `Erro ao criar/atualizar usuário: ${upsertError.message}`
        }, { status: 500 })
      }
      
      console.log('✅ FIX ADMIN DIRECT: Usuário sincronizado com sucesso')
      return NextResponse.json({
        success: true,
        action: 'user_synced',
        user: newUser,
        message: 'Usuário sincronizado com sucesso!',
        instructions: [
          '1. Tente acessar /admin agora',
          '2. Se ainda não funcionar, recarregue a página'
        ]
      })
    }
    
    // 5. Caso nenhuma das condições acima
    return NextResponse.json({
      success: false,
      error: 'Situação não identificada',
      debug: {
        hasSession: !!session,
        hasAdminInDB: !!adminInDB,
        sessionError: sessionError?.message,
        adminError: adminError?.message
      }
    }, { status: 400 })
    
  } catch (error: any) {
    console.error('❌ FIX ADMIN DIRECT: Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}