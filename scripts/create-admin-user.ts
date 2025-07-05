import { createClient } from '@supabase/supabase-js'

// Script para criar usuário admin no Supabase

async function createAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Precisamos da service key
  
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

  console.log('🚀 Criando usuário admin...')

  try {
    // 1. Criar usuário no auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: 'armazem2000',
      email_confirm: true, // Pular confirmação de email
      user_metadata: {
        full_name: 'Administrador Armazém',
        name: 'Administrador'
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário no auth:', authError)
      
      // Se usuário já existe, tentar atualizar
      if (authError.message.includes('already registered')) {
        console.log('📝 Usuário já existe, tentando atualizar...')
        
        // Buscar usuário existente
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => u.email === 'armazemsaojoaquimoficial@gmail.com')
        
        if (existingUser) {
          console.log('✅ Usuário encontrado no auth:', existingUser.id)
          
          // Atualizar senha
          const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: 'armazem2000',
            email_confirm: true
          })

          if (updateError) {
            console.error('❌ Erro ao atualizar senha:', updateError)
          } else {
            console.log('✅ Senha atualizada com sucesso')
          }

          // Usar dados do usuário existente
          authData.user = existingUser
        }
      } else {
        return
      }
    } else {
      console.log('✅ Usuário criado no auth.users:', authData.user?.id)
    }

    const userId = authData.user?.id
    if (!userId) {
      console.error('❌ ID do usuário não encontrado')
      return
    }

    // 2. Verificar se existe na tabela users
    const { data: existingUserData, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Erro ao verificar usuário na tabela:', checkError)
      return
    }

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

    console.log('📋 Dados finais do usuário:', finalUser)

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
    }

    console.log('\n🎉 Setup do usuário admin concluído!')

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

createAdminUser().catch(console.error)