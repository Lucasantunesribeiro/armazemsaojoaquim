// This script tests the client-side admin authentication
// Run this in the browser console to debug the issue

async function testClientAdminAuth() {
  console.log('🧪 Testing Client-Side Admin Authentication...\n')
  
  // Test 1: Check if user is logged in
  console.log('1️⃣ Checking user session...')
  
  try {
    // Import Supabase client (this would work in browser context)
    const { createClient } = await import('/utils/supabase/client.js')
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('❌ No user session:', userError?.message || 'No user')
      return
    }
    
    console.log('✅ User session found:', user.email)
    
    // Test 2: Check profile access
    console.log('\n2️⃣ Testing profile access...')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Profile query failed:', profileError)
      console.log('Error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      })
      
      // Test 3: Try with different approach
      console.log('\n3️⃣ Trying alternative profile query...')
      
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(1)
      
      if (allError) {
        console.log('❌ Alternative query also failed:', allError.message)
      } else {
        console.log('✅ Alternative query worked, found profiles:', allProfiles.length)
      }
      
    } else {
      console.log('✅ Profile query successful:', profile)
      console.log('Admin status:', profile.role === 'admin')
    }
    
    // Test 4: Test API endpoint
    console.log('\n4️⃣ Testing API endpoint...')
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('❌ No session for API call')
      return
    }
    
    try {
      const response = await fetch('/api/admin/check-role', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API endpoint successful:', data)
      } else {
        const errorText = await response.text()
        console.log('❌ API endpoint failed:', response.status, errorText)
      }
    } catch (apiError) {
      console.log('❌ API request error:', apiError.message)
    }
    
  } catch (error) {
    console.log('💥 Test error:', error.message)
  }
  
  console.log('\n🎉 Client-side auth test completed!')
}

// Instructions for running in browser
console.log('To test client-side admin auth, run: testClientAdminAuth()')

// Auto-run if this is being executed directly
if (typeof window !== 'undefined') {
  testClientAdminAuth()
}