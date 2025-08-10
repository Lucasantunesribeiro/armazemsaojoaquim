/**
 * Test script to verify the connection pool is working correctly
 */

// Simple test to check if the connection pool can be imported and used
async function testConnectionPool() {
  try {
    console.log('🧪 Testing connection pool import...')
    
    // Try to import the connection pool
    const { getAdminPool, executeAdminQuery, checkPoolHealth } = require('./lib/supabase-admin-pool.ts')
    
    console.log('✅ Connection pool imported successfully')
    
    // Test pool initialization
    console.log('🧪 Testing pool initialization...')
    const pool = getAdminPool()
    console.log('✅ Pool initialized:', pool ? 'Success' : 'Failed')
    
    // Test pool stats
    console.log('🧪 Testing pool stats...')
    const stats = pool.getStats()
    console.log('✅ Pool stats:', stats)
    
    // Test health check (this might fail if Supabase is not configured)
    console.log('🧪 Testing health check...')
    try {
      const health = await checkPoolHealth()
      console.log('✅ Health check result:', health)
    } catch (healthError) {
      console.log('⚠️ Health check failed (expected if Supabase not configured):', healthError.message)
    }
    
    console.log('🎉 Connection pool test completed successfully!')
    
  } catch (error) {
    console.error('❌ Connection pool test failed:', error)
    console.error('Stack trace:', error.stack)
    
    // Check if it's a module resolution issue
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('💡 This appears to be a module resolution issue.')
      console.error('💡 The connection pool file might have syntax errors or missing dependencies.')
    }
    
    process.exit(1)
  }
}

// Run the test
testConnectionPool()