const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testAdminAPIEndpoints() {
  console.log('🧪 Testing Admin API Endpoints...\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Step 1: Login as admin
  console.log('1️⃣ Logging in as admin...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'armazemsaojoaquimoficial@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'armazem2000'
  })
  
  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  
  console.log('✅ Login successful')
  const accessToken = authData.session.access_token
  
  // Test endpoints that were failing
  const endpoints = [
    {
      name: 'Pousadas Rooms',
      url: 'http://localhost:3000/api/admin/pousadas/rooms',
      method: 'GET'
    },
    {
      name: 'Dashboard Recent Activity',
      url: 'http://localhost:3000/api/admin/dashboard/recent-activity',
      method: 'GET'
    },
    {
      name: 'Dashboard Activity',
      url: 'http://localhost:3000/api/admin/dashboard/activity',
      method: 'GET'
    },
    {
      name: 'Check Role',
      url: 'http://localhost:3000/api/admin/check-role',
      method: 'GET'
    }
  ]
  
  console.log('\n2️⃣ Testing API endpoints...')
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint.name}...`)
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      const status = response.status
      const statusText = response.statusText
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${endpoint.name}: ${status} ${statusText}`)
        console.log(`   Data preview:`, JSON.stringify(data).substring(0, 100) + '...')
      } else {
        const errorData = await response.text()
        console.log(`❌ ${endpoint.name}: ${status} ${statusText}`)
        console.log(`   Error:`, errorData.substring(0, 200))
      }
      
    } catch (error) {
      console.log(`💥 ${endpoint.name}: Network error`)
      console.log(`   Error:`, error.message)
    }
  }
  
  // Test with cookies (browser-like request)
  console.log('\n3️⃣ Testing with cookies (simulating browser)...')
  
  // Get cookies from the session
  const cookies = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token=${JSON.stringify({
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token,
    expires_at: authData.session.expires_at,
    user: authData.session.user
  })}`
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/check-role', {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Cookie-based request successful')
      console.log('   Data:', JSON.stringify(data, null, 2))
    } else {
      const errorData = await response.text()
      console.log('❌ Cookie-based request failed:', response.status)
      console.log('   Error:', errorData)
    }
  } catch (error) {
    console.log('💥 Cookie-based request error:', error.message)
  }
  
  // Clean up
  await supabase.auth.signOut()
  console.log('\n🎉 API endpoint testing completed!')
}

// Only run if server is available
async function checkServerAvailability() {
  try {
    const response = await fetch('http://localhost:3000/api/health', { 
      method: 'GET',
      timeout: 5000 
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function main() {
  const serverAvailable = await checkServerAvailability()
  
  if (!serverAvailable) {
    console.log('⚠️ Development server not running on localhost:3000')
    console.log('Please start the server with: npm run dev')
    console.log('\nAlternatively, testing the authentication logic...\n')
    
    // Test just the authentication part
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'armazem2000'
    })
    
    if (authError) {
      console.error('❌ Authentication test failed:', authError.message)
    } else {
      console.log('✅ Authentication test successful')
      console.log('   User:', authData.user.email)
      console.log('   Session expires:', new Date(authData.session.expires_at * 1000))
      
      // Test profile access
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Profile access failed:', profileError.message)
      } else {
        console.log('✅ Profile access successful')
        console.log('   Role:', profileData.role)
        console.log('   Is Admin:', profileData.role === 'admin')
      }
      
      await supabase.auth.signOut()
    }
    
    return
  }
  
  await testAdminAPIEndpoints()
}

main().catch(console.error)