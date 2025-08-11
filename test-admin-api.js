// Teste da API do admin
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAdminAPI() {
  console.log('🧪 Testando API do admin...\n')
  
  try {
    // 1. Fazer login como admin
    console.log('1. Fazendo login como admin...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: 'armazem2000'
    })
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError)
      return
    }
    
    console.log('✅ Login realizado com sucesso')
    console.log('📋 Session:', {
      access_token: loginData.session?.access_token?.substring(0, 20) + '...',
      user_email: loginData.user?.email,
      user_id: loginData.user?.id
    })

    // 2. Testar API de usuários com token
    console.log('\n2. Testando API de usuários com autenticação...')
    
    try {
      const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${loginData.session?.access_token}`,
          'Content-Type': 'application/json',
          'Cookie': `sb-enolssforaepnrpfrima-auth-token=${JSON.stringify(loginData.session)}`
        }
      })
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        console.log('✅ Users API com auth - Success!')
        console.log('📊 Response structure:', Object.keys(usersData))
        
        if (usersData.success && usersData.data) {
          console.log('📊 Stats:', usersData.data.stats)
          console.log('👥 Users count:', usersData.data.users?.length || 0)
          console.log('📄 Pagination:', usersData.data.pagination)
          
          if (usersData.data.users && usersData.data.users.length > 0) {
            console.log('📋 Primeiro usuário:', {
              id: usersData.data.users[0].id,
              email: usersData.data.users[0].email,
              name: usersData.data.users[0].full_name,
              role: usersData.data.users[0].role
            })
          }
        } else {
          console.log('⚠️ Estrutura de resposta inesperada:', usersData)
        }
      } else {
        console.error('❌ Users API Error:', usersResponse.status)
        const errorText = await usersResponse.text()
        console.error('Error details:', errorText)
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message)
      console.log('💡 Certifique-se de que o servidor Next.js está rodando com "npm run dev"')
    }

    // 3. Testar API de blog com token
    console.log('\n3. Testando API de blog com autenticação...')
    
    try {
      const blogResponse = await fetch('http://localhost:3000/api/admin/blog/posts', {
        headers: {
          'Authorization': `Bearer ${loginData.session?.access_token}`,
          'Content-Type': 'application/json',
          'Cookie': `sb-enolssforaepnrpfrima-auth-token=${JSON.stringify(loginData.session)}`
        }
      })
      
      if (blogResponse.ok) {
        const blogData = await blogResponse.json()
        console.log('✅ Blog API com auth - Success!')
        console.log('📝 Response:', blogData)
      } else {
        console.error('❌ Blog API Error:', blogResponse.status)
        const errorText = await blogResponse.text()
        console.error('Error details:', errorText)
      }
    } catch (fetchError) {
      console.error('❌ Blog fetch error:', fetchError.message)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testAdminAPI()