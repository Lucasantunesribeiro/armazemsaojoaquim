import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [SETUP-PROFILE] Configurando perfil admin...')
    
    const supabase = await createServerClient()
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ [SETUP-PROFILE] Usuário não encontrado:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não autenticado' 
      }, { status: 401 })
    }

    // Verificar se é o email admin
    const adminEmail = 'armazemsaojoaquimoficial@gmail.com'
    if (user.email !== adminEmail) {
      console.log('❌ [SETUP-PROFILE] Email não é admin:', user.email)
      return NextResponse.json({ 
        success: false, 
        error: 'Acesso negado - não é admin' 
      }, { status: 403 })
    }

    // Verificar se já existe perfil
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Atualizar perfil existente para admin
      console.log('🔄 [SETUP-PROFILE] Atualizando perfil existente para admin...')
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ [SETUP-PROFILE] Erro ao atualizar perfil:', updateError)
        return NextResponse.json({ 
          success: false, 
          error: 'Erro ao atualizar perfil',
          debug: updateError.message
        }, { status: 500 })
      }

      console.log('✅ [SETUP-PROFILE] Perfil atualizado com sucesso!')
      return NextResponse.json({ 
        success: true, 
        message: 'Perfil admin atualizado',
        profile: updatedProfile
      })
    } else {
      // Criar novo perfil admin
      console.log('➕ [SETUP-PROFILE] Criando novo perfil admin...')
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ [SETUP-PROFILE] Erro ao criar perfil:', createError)
        return NextResponse.json({ 
          success: false, 
          error: 'Erro ao criar perfil',
          debug: createError.message
        }, { status: 500 })
      }

      console.log('✅ [SETUP-PROFILE] Perfil admin criado com sucesso!')
      return NextResponse.json({ 
        success: true, 
        message: 'Perfil admin criado',
        profile: newProfile
      })
    }

  } catch (error) {
    console.error('💥 [SETUP-PROFILE] Erro inesperado:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}







