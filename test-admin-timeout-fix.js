/**
 * Test script to verify admin timeout fixes
 */

const https = require('https')
const http = require('http')

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const TEST_TOKEN = process.env.TEST_ADMIN_TOKEN || 'test-token'

async function testAdminEndpoint() {
  console.log('🧪 Testing admin timeout fixes...\n')
  
  const tests = [
    {
      name: 'Fast Admin Check',
      url: '/api/auth/check-role',
      timeout: 3000,
      expectedMaxTime: 2000
    },
    {
      name: 'Admin Fallback Check',
      url: '/api/admin/check-role',
      timeout: 3000,
      expectedMaxTime: 2500
    }
  ]
  
  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`)
    console.log(`🔗 URL: ${BASE_URL}${test.url}`)
    
    const startTime = Date.now()
    
    try {
      const response = await makeRequest(test.url, {
        timeout: test.timeout,
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      console.log(`⏱️  Response time: ${responseTime}ms`)
      console.log(`📊 Status: ${response.status}`)
      
      if (response.status === 200 || response.status === 401) {
        const data = JSON.parse(response.body)
        console.log(`📋 Response data:`, {
          isAdmin: data.isAdmin,
          authenticated: data.authenticated,
          method: data.method,
          responseTime: data.responseTime,
          error: data.error
        })
        
        if (responseTime <= test.expectedMaxTime) {
          console.log(`✅ ${test.name}: PASSED (${responseTime}ms <= ${test.expectedMaxTime}ms)`)
        } else {
          console.log(`⚠️  ${test.name}: SLOW (${responseTime}ms > ${test.expectedMaxTime}ms)`)
        }
      } else {
        console.log(`❌ ${test.name}: FAILED (Status: ${response.status})`)
        console.log(`📄 Response: ${response.body}`)
      }
      
    } catch (error) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      console.log(`❌ ${test.name}: ERROR after ${responseTime}ms`)
      console.log(`🔍 Error: ${error.message}`)
      
      if (error.message.includes('timeout')) {
        console.log(`⏰ Timeout occurred - this indicates the fix is needed`)
      }
    }
    
    console.log('─'.repeat(50))
  }
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path)
    const isHttps = url.protocol === 'https:'
    const client = isHttps ? https : http
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 5000
    }
    
    const req = client.request(requestOptions, (res) => {
      let body = ''
      
      res.on('data', (chunk) => {
        body += chunk
      })
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        })
      })
    })
    
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timeout after ${options.timeout}ms`))
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

// Test network connectivity
async function testNetworkConnectivity() {
  console.log('🌐 Testing network connectivity...')
  
  try {
    const response = await makeRequest('/api/health', { timeout: 2000 })
    console.log(`✅ Network connectivity: OK (Status: ${response.status})`)
    return true
  } catch (error) {
    console.log(`❌ Network connectivity: FAILED (${error.message})`)
    return false
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Admin Timeout Fix Tests')
  console.log('=' .repeat(60))
  
  // Test network first
  const networkOk = await testNetworkConnectivity()
  console.log('─'.repeat(50))
  
  if (!networkOk) {
    console.log('❌ Network connectivity failed - skipping API tests')
    return
  }
  
  // Test admin endpoints
  await testAdminEndpoint()
  
  console.log('\n📋 Test Summary:')
  console.log('- Fast response times indicate timeout fixes are working')
  console.log('- Slow responses or timeouts indicate further optimization needed')
  console.log('- Check the browser console for SupabaseProvider logs')
  
  console.log('\n🔧 Next steps if issues persist:')
  console.log('1. Check database connection pool settings')
  console.log('2. Verify Supabase RPC functions are optimized')
  console.log('3. Consider increasing cache TTL values')
  console.log('4. Monitor network latency to Supabase')
}

// Run tests
runTests().catch(console.error)