const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Script para criar usuário admin no Supabase

async function createAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🚀 Criando/corrigindo usuário admin...')

  try {
    // 1. Verificar se usuário já existe no auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let existingUser = existingUsers.users.find(u => u.email === 'armazemsaojoaquimoficial@gmail.com')

    if (existingUser) {
      console.log('📝 Usuário já existe no auth.users:', existingUser.id)
      
      // Atualizar senha e confirmar email
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: 'armazem2000',
        email_confirm: true
      })

      if (updateError) {
        console.error('❌ Erro ao atualizar senha:', updateError)
      } else {
        console.log('✅ Senha atualizada para: armazem2000')
      }
    } else {
      console.log('📝 Criando novo usuário no auth.users...')
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'armazemsaojoaquimoficial@gmail.com',
        password: 'armazem2000',
        email_confirm: true,
        user_metadata: {
          full_name: 'Administrador Armazém',
          name: 'Administrador'
        }
      })

      if (authError) {
        console.error('❌ Erro ao criar usuário no auth:', authError)
        return
      }

      existingUser = authData.user
      console.log('✅ Usuário criado no auth.users:', existingUser.id)
    }

    const userId = existingUser.id

    // 2. Verificar/criar na tabela users
    const { data: existingUserData, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingUserData) {
      console.log('📝 Usuário já existe na tabela users, atualizando role...')
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          email: 'armazemsaojoaquimoficial@gmail.com',
          name: 'Administrador Armazém'
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError)
      } else {
        console.log('✅ Role admin atualizada com sucesso')
      }
    } else {
      console.log('📝 Criando usuário na tabela users...')
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'armazemsaojoaquimoficial@gmail.com',
          name: 'Administrador Armazém',
          role: 'admin'
        })

      if (insertError) {
        console.error('❌ Erro ao inserir usuário na tabela:', insertError)
      } else {
        console.log('✅ Usuário inserido na tabela users com role admin')
      }
    }

    // 3. Verificação final
    console.log('\n🔍 Verificação final:')
    
    const { data: finalUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'armazemsaojoaquimoficial@gmail.com')
      .single()

    console.log('📋 Dados finais do usuário:')
    console.log('- ID:', finalUser?.id)
    console.log('- Email:', finalUser?.email)
    console.log('- Nome:', finalUser?.name)
    console.log('- Role:', finalUser?.role)

    // 4. Teste de login
    console.log('\n🧪 Testando login...')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: 'armazem2000'
    })

    if (loginError) {
      console.error('❌ Erro no teste de login:', loginError)
    } else {
      console.log('✅ Login funcionando! ID:', loginData.user?.id)
      console.log('✅ Email confirmado:', !!loginData.user?.email_confirmed_at)
    }

    console.log('\n🎉 Setup do usuário admin concluído!')
    console.log('📋 Informações de login:')
    console.log('- Email: armazemsaojoaquimoficial@gmail.com')
    console.log('- Senha: armazem2000')

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

createAdminUser().catch(console.error)