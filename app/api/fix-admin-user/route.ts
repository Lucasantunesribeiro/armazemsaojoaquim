import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 FIX ADMIN USER: Iniciando correção do usuário admin...')
    
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    
    // 1. Verificar se o usuário está logado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔍 FIX ADMIN USER: Session check:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session) {
      // Try to get user from cookies directly
      const cookies = request.headers.get('cookie')
      console.log('🔍 FIX ADMIN USER: No session, checking cookies:', {
        hasCookies: !!cookies,
        cookieContent: cookies?.substring(0, 200) + '...' || 'No cookies'
      })
      
      return NextResponse.json({
        success: false,
        error: 'Usuário não está logado',
        debug: {
          sessionError: sessionError?.message,
          hasCookies: !!cookies
        }
      }, { status: 401 })
    }
    
    console.log('🔍 FIX ADMIN USER: Usuário logado:', {
      userId: session.user.id,
      email: session.user.email
    })
    
    // 2. Verificar se é o admin
    if (session.user.email !== 'armazemsaojoaquimoficial@gmail.com') {
      return NextResponse.json({
        success: false,
        error: 'Apenas o admin pode executar esta operação'
      }, { status: 403 })
    }
    
    // 3. Verificar se já existe um usuário com este ID na tabela public.users
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    console.log('🔍 FIX ADMIN USER: Usuário existente por ID:', {
      found: !!existingUser,
      data: existingUser,
      error: existingUserError?.message
    })
    
    if (existingUser) {
      // Se o usuário já existe com o ID correto, apenas atualizar para admin
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ FIX ADMIN USER: Erro ao atualizar usuário:', updateError)
        return NextResponse.json({
          success: false,
          error: `Erro ao atualizar usuário: ${updateError.message}`
        }, { status: 500 })
      }
      
      console.log('✅ FIX ADMIN USER: Usuário atualizado com sucesso')
      return NextResponse.json({
        success: true,
        action: 'updated',
        user: updatedUser
      })
    }
    
    // 4. Verificar se existe um usuário com este email (ID diferente)
    const { data: existingByEmail, error: existingByEmailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()
    
    console.log('🔍 FIX ADMIN USER: Usuário existente por email:', {
      found: !!existingByEmail,
      data: existingByEmail,
      error: existingByEmailError?.message
    })
    
    if (existingByEmail) {
      // Se existe um usuário com o email mas ID diferente, deletar o antigo e criar novo
      console.log('🔄 FIX ADMIN USER: Removendo usuário com ID incorreto...')
      
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', existingByEmail.id)
      
      if (deleteError) {
        console.error('❌ FIX ADMIN USER: Erro ao deletar usuário antigo:', deleteError)
        return NextResponse.json({
          success: false,
          error: `Erro ao deletar usuário antigo: ${deleteError.message}`
        }, { status: 500 })
      }
      
      console.log('✅ FIX ADMIN USER: Usuário antigo removido')
    }
    
    // 5. Criar novo usuário com o ID correto
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Administrador Armazém',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ FIX ADMIN USER: Erro ao criar usuário:', createError)
      return NextResponse.json({
        success: false,
        error: `Erro ao criar usuário: ${createError.message}`
      }, { status: 500 })
    }
    
    console.log('✅ FIX ADMIN USER: Novo usuário criado com sucesso')
    return NextResponse.json({
      success: true,
      action: 'created',
      user: newUser
    })
    
  } catch (error: any) {
    console.error('❌ FIX ADMIN USER: Erro geral:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}