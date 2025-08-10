const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminDataEndpoints() {
  console.log('🧪 Testing Admin Data Endpoints...\n')

  try {
    // 1. Login as admin
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
    const session = authData.session
    
    // 2. Test Users endpoint
    console.log('\n2️⃣ Testing /api/admin/users endpoint...')
    try {
      const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`Status: ${usersResponse.status} ${usersResponse.statusText}`)
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        console.log('✅ Users endpoint successful')
        console.log(`📊 Users data structure:`, Object.keys(usersData))
        
        if (usersData.success && usersData.data) {
          console.log(`👥 Users found: ${usersData.data.users?.length || 0}`)
          console.log(`📈 Stats:`, usersData.data.stats)
          
          if (usersData.data.users?.length > 0) {
            console.log(`📋 First user:`, {
              id: usersData.data.users[0].id,
              email: usersData.data.users[0].email,
              role: usersData.data.users[0].role
            })
          }
        } else {
          console.log('⚠️ Unexpected response structure:', usersData)
        }
      } else {
        const errorData = await usersResponse.text()
        console.error('❌ Users endpoint failed:', errorData)
      }
    } catch (error) {
      console.error('❌ Users endpoint error:', error.message)
    }

    // 3. Test Blog Posts endpoint
    console.log('\n3️⃣ Testing /api/admin/blog/posts endpoint...')
    try {
      const blogResponse = await fetch('http://localhost:3000/api/admin/blog/posts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`Status: ${blogResponse.status} ${blogResponse.statusText}`)
      
      if (blogResponse.ok) {
        const blogData = await blogResponse.json()
        console.log('✅ Blog posts endpoint successful')
        console.log(`📊 Blog data structure:`, Object.keys(blogData))
        console.log(`📝 Posts found: ${blogData.posts?.length || 0}`)
        console.log(`📄 Message: ${blogData.message || 'No message'}`)
      } else {
        const errorData = await blogResponse.text()
        console.error('❌ Blog posts endpoint failed:', errorData)
      }
    } catch (error) {
      console.error('❌ Blog posts endpoint error:', error.message)
    }

    // 4. Test direct database access
    console.log('\n4️⃣ Testing direct database access...')
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .limit(5)

      if (profilesError) {
        console.error('❌ Direct profiles query failed:', profilesError.message)
      } else {
        console.log('✅ Direct profiles query successful')
        console.log(`👥 Profiles found: ${profilesData?.length || 0}`)
        if (profilesData?.length > 0) {
          console.log(`📋 First profile:`, profilesData[0])
        }
      }

      const { data: blogPostsData, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title_pt, published')
        .limit(5)

      if (blogError) {
        console.error('❌ Direct blog_posts query failed:', blogError.message)
      } else {
        console.log('✅ Direct blog_posts query successful')
        console.log(`📝 Blog posts found: ${blogPostsData?.length || 0}`)
        if (blogPostsData?.length > 0) {
          console.log(`📋 First blog post:`, blogPostsData[0])
        }
      }
    } catch (error) {
      console.error('❌ Direct database access error:', error.message)
    }

    // 5. Logout
    await supabase.auth.signOut()
    console.log('\n✅ Logged out successfully')

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testAdminDataEndpoints()