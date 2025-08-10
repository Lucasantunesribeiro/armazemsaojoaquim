// Debug do carregamento de dados do admin
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.log('💡 Certifique-se de que as variáveis estão definidas no .env.local:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=...')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugAdminData() {
  console.log('🔍 Debug do carregamento de dados do admin...\n')
  
  try {
    // 1. Verificar se há usuários no auth
    console.log('1. Verificando usuários no auth...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao buscar auth users:', authError)
    } else {
      console.log(`✅ Auth users encontrados: ${authUsers?.users?.length || 0}`)
      if (authUsers?.users && authUsers.users.length > 0) {
        console.log('📋 Primeiros 3 auth users:')
        authUsers.users.slice(0, 3).forEach((user, index) => {
          console.log(`  ${index + 1}. ID: ${user.id}`)
          console.log(`     Email: ${user.email}`)
          console.log(`     Created: ${user.created_at}`)
          console.log(`     Last sign in: ${user.last_sign_in_at || 'Never'}`)
          console.log('')
        })
      }
    }

    // 2. Verificar profiles
    console.log('2. Verificando tabela profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError)
      console.log('💡 Possíveis causas:')
      console.log('   - Tabela profiles não existe')
      console.log('   - Problemas de RLS (Row Level Security)')
      console.log('   - Permissões insuficientes')
    } else {
      console.log(`✅ Profiles encontrados: ${profiles?.length || 0}`)
      if (profiles && profiles.length > 0) {
        console.log('📋 Primeiros 3 profiles:')
        profiles.slice(0, 3).forEach((profile, index) => {
          console.log(`  ${index + 1}. ID: ${profile.id}`)
          console.log(`     Email: ${profile.email}`)
          console.log(`     Name: ${profile.full_name}`)
          console.log(`     Role: ${profile.role}`)
          console.log(`     Created: ${profile.created_at}`)
          console.log('')
        })
      }
    }

    // 3. Verificar se há admin
    console.log('3. Verificando se há usuários admin...')
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
    
    if (adminError) {
      console.error('❌ Erro ao buscar admins:', adminError)
    } else {
      console.log(`✅ Admins encontrados: ${adminProfiles?.length || 0}`)
      if (adminProfiles && adminProfiles.length > 0) {
        console.log('📋 Admins:')
        adminProfiles.forEach((admin, index) => {
          console.log(`  ${index + 1}. Email: ${admin.email}`)
          console.log(`     Name: ${admin.full_name}`)
          console.log(`     ID: ${admin.id}`)
          console.log('')
        })
      }
    }

    // 4. Verificar estrutura da tabela profiles
    console.log('4. Verificando estrutura da tabela profiles...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Erro ao verificar estrutura:', tableError)
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('📋 Colunas da tabela profiles:')
      Object.keys(tableInfo[0]).forEach(column => {
        console.log(`  - ${column}: ${typeof tableInfo[0][column]}`)
      })
    }

    // 5. Testar criação de profile se não houver dados
    if (profiles && profiles.length === 0 && authUsers?.users && authUsers.users.length > 0) {
      console.log('\n5. Criando profiles para usuários auth...')
      
      for (const authUser of authUsers.users) {
        console.log(`📝 Criando profile para: ${authUser.email}`)
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
            role: authUser.email === 'armazemsaojoaquimoficial@gmail.com' ? 'admin' : 'user',
            created_at: authUser.created_at,
            updated_at: authUser.updated_at || authUser.created_at
          })
        
        if (insertError) {
          console.error(`❌ Erro ao criar profile para ${authUser.email}:`, insertError)
        } else {
          console.log(`✅ Profile criado para: ${authUser.email}`)
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

debugAdminData()