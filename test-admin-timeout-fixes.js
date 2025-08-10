/**
 * Test script to verify admin API timeout and error handling improvements
 */

const API_BASE = 'http://localhost:3000/api/admin'

// Test configuration
const TEST_CONFIG = {
  timeout: 15000, // 15 seconds
  retries: 3,
  endpoints: [
    '/users?page=1&limit=10',
    '/blog/posts?page=1&limit=10'
  ]
}

// Mock session token (you'll need to replace this with a real admin token)
const MOCK_TOKEN = 'mock-admin-token'

async function testEndpoint(endpoint, options = {}) {
  const startTime = Date.now()
  console.log(`🧪 Testing endpoint: ${endpoint}`)
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout)
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOCK_TOKEN}`,
        ...options.headers
      },
      signal: controller.signal,
      ...options
    })
    
    clearTimeout(timeoutId)
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`⏱️  Response time: ${duration}ms`)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    // Check response headers for our optimizations
    const cacheControl = response.headers.get('Cache-Control')
    const responseTime = response.headers.get('X-Response-Time')
    const contentType = response.headers.get('Content-Type')
    
    console.log(`🗄️  Cache-Control: ${cacheControl || 'Not set'}`)
    console.log(`⏰ X-Response-Time: ${responseTime || 'Not set'}`)
    console.log(`📄 Content-Type: ${contentType || 'Not set'}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Success! Data keys: ${Object.keys(data).join(', ')}`)
      
      if (data.success && data.data) {
        const itemCount = data.data.users?.length || data.data.posts?.length || 0
        console.log(`📋 Items returned: ${itemCount}`)
        
        if (data.data.pagination) {
          console.log(`📄 Pagination: Page ${data.data.pagination.page} of ${data.data.pagination.pages}`)
        }
        
        if (data.data.stats) {
          console.log(`📊 Stats: ${JSON.stringify(data.data.stats)}`)
        }
      }
      
      return { success: true, duration, data }
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log(`❌ Error: ${errorData.error || response.statusText}`)
      return { success: false, duration, error: errorData.error || response.statusText }
    }
    
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`💥 Exception after ${duration}ms: ${error.message}`)
    
    if (error.name === 'AbortError') {
      console.log(`⏰ Request timed out after ${TEST_CONFIG.timeout}ms`)
    }
    
    return { success: false, duration, error: error.message }
  }
}

async function testRetryMechanism(endpoint) {
  console.log(`\n🔄 Testing retry mechanism for: ${endpoint}`)
  
  // Simulate a failing endpoint by using an invalid endpoint
  const failingEndpoint = endpoint + '?simulate_error=true'
  
  for (let attempt = 1; attempt <= TEST_CONFIG.retries; attempt++) {
    console.log(`\n🎯 Attempt ${attempt}/${TEST_CONFIG.retries}`)
    
    const result = await testEndpoint(failingEndpoint)
    
    if (result.success) {
      console.log(`✅ Success on attempt ${attempt}`)
      break
    } else {
      console.log(`❌ Failed attempt ${attempt}: ${result.error}`)
      
      if (attempt < TEST_CONFIG.retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
}

async function testProgressiveTimeouts() {
  console.log(`\n⏰ Testing progressive timeout warnings...`)
  
  // This would normally be handled by the client-side code
  // For now, we'll just test that our API responds within reasonable time
  const endpoint = '/users?page=1&limit=5'
  
  const warnings = []
  const startTime = Date.now()
  
  // Set up warning timers
  const warning5s = setTimeout(() => {
    warnings.push('5s warning')
    console.log('⚠️  5s warning: Request taking longer than expected...')
  }, 5000)
  
  const warning8s = setTimeout(() => {
    warnings.push('8s warning')
    console.log('⚠️  8s warning: Still processing request...')
  }, 8000)
  
  try {
    const result = await testEndpoint(endpoint)
    
    clearTimeout(warning5s)
    clearTimeout(warning8s)
    
    const duration = Date.now() - startTime
    console.log(`✅ Request completed in ${duration}ms`)
    console.log(`⚠️  Warnings triggered: ${warnings.length > 0 ? warnings.join(', ') : 'None'}`)
    
    return result
  } catch (error) {
    clearTimeout(warning5s)
    clearTimeout(warning8s)
    throw error
  }
}

async function runAllTests() {
  console.log('🚀 Starting Admin API Performance Tests')
  console.log('=====================================\n')
  
  const results = {
    endpoints: [],
    retryTests: [],
    timeoutTests: []
  }
  
  // Test each endpoint
  for (const endpoint of TEST_CONFIG.endpoints) {
    console.log(`\n📡 Testing endpoint: ${endpoint}`)
    console.log('─'.repeat(50))
    
    const result = await testEndpoint(endpoint)
    results.endpoints.push({ endpoint, ...result })
    
    console.log('') // Add spacing
  }
  
  // Test progressive timeouts
  console.log('\n⏰ Testing Progressive Timeouts')
  console.log('─'.repeat(50))
  
  const timeoutResult = await testProgressiveTimeouts()
  results.timeoutTests.push(timeoutResult)
  
  // Summary
  console.log('\n📊 Test Summary')
  console.log('═'.repeat(50))
  
  const successfulEndpoints = results.endpoints.filter(r => r.success).length
  const totalEndpoints = results.endpoints.length
  
  console.log(`✅ Successful endpoints: ${successfulEndpoints}/${totalEndpoints}`)
  
  const avgResponseTime = results.endpoints
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.duration, 0) / successfulEndpoints
  
  if (successfulEndpoints > 0) {
    console.log(`⏱️  Average response time: ${Math.round(avgResponseTime)}ms`)
  }
  
  // Performance recommendations
  console.log('\n💡 Performance Analysis')
  console.log('─'.repeat(50))
  
  results.endpoints.forEach(result => {
    if (result.success) {
      if (result.duration < 1000) {
        console.log(`✅ ${result.endpoint}: Excellent (${result.duration}ms)`)
      } else if (result.duration < 3000) {
        console.log(`⚠️  ${result.endpoint}: Good (${result.duration}ms)`)
      } else if (result.duration < 5000) {
        console.log(`🐌 ${result.endpoint}: Slow (${result.duration}ms)`)
      } else {
        console.log(`🚨 ${result.endpoint}: Very slow (${result.duration}ms)`)
      }
    } else {
      console.log(`❌ ${result.endpoint}: Failed - ${result.error}`)
    }
  })
  
  console.log('\n🎯 Recommendations:')
  
  if (avgResponseTime > 2000) {
    console.log('• Consider implementing caching for frequently accessed data')
    console.log('• Review database query performance and add indexes')
    console.log('• Consider implementing pagination with smaller page sizes')
  }
  
  if (successfulEndpoints < totalEndpoints) {
    console.log('• Check authentication and authorization setup')
    console.log('• Verify database connection and RLS policies')
    console.log('• Review error handling and retry mechanisms')
  }
  
  console.log('\n✨ Test completed!')
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error)
    process.exit(1)
  })
}

module.exports = {
  testEndpoint,
  testRetryMechanism,
  testProgressiveTimeouts,
  runAllTests
}