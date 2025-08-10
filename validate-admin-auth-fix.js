const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function validateAdminAuthFix() {
  console.log('🔍 VALIDATING ADMIN AUTHENTICATION FIX')
  console.log('=====================================\n')
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }
  
  function logTest(name, passed, details = '') {
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${name}`)
    if (details) console.log(`   ${details}`)
    
    results.tests.push({ name, passed, details })
    if (passed) results.passed++
    else results.failed++
  }
  
  // Test 1: Environment Variables
  console.log('1️⃣ Environment Variables')
  logTest('SUPABASE_URL exists', !!supabaseUrl, supabaseUrl ? 'URL configured' : 'Missing URL')
  logTest('SUPABASE_ANON_KEY exists', !!supabaseAnonKey, supabaseAnonKey ? 'Anon key configured' : 'Missing anon key')
  logTest('SUPABASE_SERVICE_KEY exists', !!supabaseServiceKey, supabaseServiceKey ? 'Service key configured' : 'Missing service key')
  logTest('ADMIN_PASSWORD exists', !!process.env.ADMIN_PASSWORD, process.env.ADMIN_PASSWORD ? 'Password configured' : 'Missing password')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Cannot continue without basic Supabase configuration')
    return
  }
  
  // Test 2: Database Connection
  console.log('\n2️⃣ Database Connection')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('count').limit(1)
    logTest('Database connection', !error, error ? error.message : 'Connected successfully')
  } catch (err) {
    logTest('Database connection', false, err.message)
  }
  
  // Test 3: Admin Authentication
  console.log('\n3️⃣ Admin Authentication')
  let adminSession = null
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'armazemsaojoaquimoficial@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'armazem2000'
    })
    
    if (authError) {
      logTest('Admin login', false, authError.message)
    } else {
      logTest('Admin login', true, `Logged in as ${authData.user.email}`)
      adminSession = authData.session
    }
  } catch (err) {
    logTest('Admin login', false, err.message)
  }
  
  // Test 4: Profile Access (The main issue that was causing 500 errors)
  console.log('\n4️⃣ Profile Access')
  
  if (adminSession) {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', adminSession.user.id)
        .single()
      
      if (profileError) {
        logTest('Profile query', false, `Error: ${profileError.message}`)
      } else {
        logTest('Profile query', true, `Retrieved profile for ${profileData.email}`)
        logTest('Admin role verification', profileData.role === 'admin', `Role: ${profileData.role}`)
      }
    } catch (err) {
      logTest('Profile query', false, err.message)
    }
  } else {
    logTest('Profile query', false, 'Cannot test - no admin session')
  }
  
  // Test 5: RLS Policies
  console.log('\n5️⃣ RLS Policies')
  
  try {
    // Test that RLS is enabled
    const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: "SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public'"
    }).catch(() => ({ data: null, error: 'RPC not available' }))
    
    if (rlsData && rlsData.length > 0) {
      logTest('RLS enabled on profiles', rlsData[0].rowsecurity, `RLS status: ${rlsData[0].rowsecurity}`)
    } else {
      logTest('RLS status check', false, 'Could not verify RLS status')
    }
    
    // Test policy functionality by trying to access profiles
    const { data: policyTest, error: policyError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    logTest('RLS policies allow access', !policyError, policyError ? policyError.message : 'Policies working correctly')
    
  } catch (err) {
    logTest('RLS policy test', false, err.message)
  }
  
  // Test 6: Admin Functions
  console.log('\n6️⃣ Admin Functions')
  
  try {
    // Test the is_admin_user function
    const { data: adminFuncData, error: adminFuncError } = await supabaseAdmin.rpc('is_admin_user')
    
    if (adminFuncError) {
      logTest('is_admin_user function', false, adminFuncError.message)
    } else {
      logTest('is_admin_user function', adminFuncData === true, `Function result: ${adminFuncData}`)
    }
  } catch (err) {
    logTest('is_admin_user function', false, err.message)
  }
  
  // Test 7: Session Management
  console.log('\n7️⃣ Session Management')
  
  if (adminSession) {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      logTest('Session persistence', !sessionError && !!sessionData.session, 
        sessionError ? sessionError.message : 'Session maintained')
      
      if (sessionData.session) {
        logTest('Session user matches', sessionData.session.user.id === adminSession.user.id,
          `Session user: ${sessionData.session.user.email}`)
      }
    } catch (err) {
      logTest('Session check', false, err.message)
    }
  }
  
  // Test 8: Error Recovery
  console.log('\n8️⃣ Error Recovery')
  
  // Test that the system handles missing profiles gracefully
  try {
    const { data: missingProfile, error: missingError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single()
    
    // This should return an error, but not a 500 error
    logTest('Graceful handling of missing profiles', 
      missingError && missingError.code !== 'PGRST500',
      missingError ? `Error code: ${missingError.code}` : 'Unexpected success')
  } catch (err) {
    logTest('Error recovery test', false, err.message)
  }
  
  // Cleanup
  if (adminSession) {
    await supabase.auth.signOut()
  }
  
  // Final Report
  console.log('\n📊 VALIDATION SUMMARY')
  console.log('====================')
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`)
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Admin authentication fix is successful.')
    console.log('\n✨ The following issues have been resolved:')
    console.log('   • 500 errors when querying profiles table')
    console.log('   • Admin authentication and login')
    console.log('   • RLS policies blocking legitimate access')
    console.log('   • Admin role verification')
    console.log('   • Session management')
  } else {
    console.log('\n⚠️ Some tests failed. Please review the issues above.')
    
    const criticalFailures = results.tests.filter(t => 
      !t.passed && (
        t.name.includes('Admin login') || 
        t.name.includes('Profile query') ||
        t.name.includes('Database connection')
      )
    )
    
    if (criticalFailures.length > 0) {
      console.log('\n🚨 CRITICAL FAILURES:')
      criticalFailures.forEach(test => {
        console.log(`   • ${test.name}: ${test.details}`)
      })
    }
  }
  
  console.log('\n📝 Next Steps:')
  if (results.failed === 0) {
    console.log('   1. Test the admin panel in the browser')
    console.log('   2. Verify admin functionality works as expected')
    console.log('   3. Monitor for any remaining issues')
  } else {
    console.log('   1. Address the failed tests above')
    console.log('   2. Re-run this validation script')
    console.log('   3. Check logs for additional error details')
  }
}

validateAdminAuthFix().catch(console.error)