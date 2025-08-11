const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://enolssforaepnrpfrima.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2xzc2ZvcmFlcG5ycGZyaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTQ2MzksImV4cCI6MjA2NDk5MDYzOX0.oZJdelgrqkyPA9g3cjGikrTLLNvv9sCkrTIl9jK4wBk'
const adminPassword = process.env.ADMIN_PASSWORD || 'armazem2000'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBlogApiResponse() {
  console.log('🧪 Testing Blog API Response...\n')

  try {
    // 1. Login as admin
    console.log('1️⃣ Logging in as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: adminPassword
    })

    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }

    console.log('✅ Login successful')
    const session = authData.session
    
    // 2. Test Blog Posts API
    console.log('\n2️⃣ Testing /api/admin/blog/posts endpoint...')
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
        console.log(`📊 Response structure:`, Object.keys(blogData))
        
        if (blogData.success && blogData.data) {
          console.log(`📝 Posts found: ${blogData.data.posts?.length || 0}`)
          console.log(`📈 Stats:`, blogData.data.stats)
          
          if (blogData.data.posts?.length > 0) {
            const firstPost = blogData.data.posts[0]
            console.log(`📋 First post structure:`, Object.keys(firstPost))
            console.log(`📋 First post details:`, {
              id: firstPost.id,
              title_pt: firstPost.title_pt,
              title_en: firstPost.title_en,
              image_url: firstPost.image_url,
              published: firstPost.published,
              category_pt: firstPost.category_pt,
              category_en: firstPost.category_en
            })
          }
        } else {
          console.log('⚠️ Unexpected response structure:', blogData)
        }
      } else {
        const errorData = await blogResponse.text()
        console.error('❌ Blog posts endpoint failed:', errorData)
      }
    } catch (error) {
      console.error('❌ Blog posts endpoint error:', error.message)
    }

    // 3. Logout
    await supabase.auth.signOut()
    console.log('\n✅ Logged out successfully')

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testBlogApiResponse()