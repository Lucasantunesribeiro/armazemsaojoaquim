#!/usr/bin/env node

/**
 * Complete Fix Validation Script
 * Tests all the fixes for user search and performance issues
 */

const BASE_URL = 'http://localhost:3000'

// Test configurations
const TESTS = {
  userSearch: {
    name: 'User Search API',
    endpoint: '/api/admin/users',
    expectedMaxTime: 5000, // 5 seconds
    critical: true
  },
  userCount: {
    name: 'User Count API',
    endpoint: '/api/admin/users/count',
    expectedMaxTime: 2000, // 2 seconds
    critical: true
  },
  dashboard: {
    name: 'Dashboard Stats API',
    endpoint: '/api/admin/dashboard',
    expectedMaxTime: 5000, // 5 seconds
    critical: true
  },
  testUsersTable: {
    name: 'Test Users Table Access',
    endpoint: '/api/admin/test-users-table',
    expectedMaxTime: 3000, // 3 seconds
    critical: false
  }
}

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

async function makeRequest(endpoint, method = 'GET') {
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    let data = null
    try {
      data = await response.json()
    } catch (e) {
      data = { error: 'Invalid JSON response' }
    }
    
    return {
      success: response.ok,
      status: response.status,
      data,
      duration,
      response
    }
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    return {
      success: false,
      status: 0,
      data: { error: error.message },
      duration,
      networkError: true
    }
  }
}

async function testEndpoint(testConfig) {
  const { name, endpoint, expectedMaxTime, critical } = testConfig
  
  log(`\n🧪 Testing: ${name}`, 'cyan')
  log(`   Endpoint: ${endpoint}`, 'blue')
  
  const result = await makeRequest(endpoint)
  
  // Performance check
  const performanceOk = result.duration <= expectedMaxTime
  const performanceIcon = performanceOk ? '⚡' : '🐌'
  const performanceColor = performanceOk ? 'green' : 'red'
  
  log(`   ${performanceIcon} Duration: ${formatTime(result.duration)} (max: ${formatTime(expectedMaxTime)})`, performanceColor)
  
  // Status check
  const statusOk = result.success
  const statusIcon = statusOk ? '✅' : '❌'
  const statusColor = statusOk ? 'green' : 'red'
  
  log(`   ${statusIcon} Status: ${result.status}`, statusColor)
  
  // Data analysis
  if (result.success && result.data) {
    if (result.data.users !== undefined) {
      log(`   📊 Users found: ${result.data.users?.length || 0}`, 'green')
      if (result.data.pagination) {
        log(`   📄 Total: ${result.data.pagination.total}`, 'green')
      }
    }
    
    if (result.data.count !== undefined) {
      log(`   📊 Count: ${result.data.count}`, 'green')
    }
    
    if (result.data.data && result.data.data.total_users !== undefined) {
      log(`   📊 Dashboard stats:`, 'green')
      log(`      Users: ${result.data.data.total_users}`, 'green')
      log(`      Reservas: ${result.data.data.total_reservas}`, 'green')
      log(`      Blog posts: ${result.data.data.total_blog_posts}`, 'green')
    }
    
    if (result.data.tables) {
      log(`   📊 Table access test:`, 'green')
      Object.keys(result.data.tables).forEach(table => {
        const tableData = result.data.tables[table]
        const accessible = tableData.accessible ? '✅' : '❌'
        log(`      ${table}: ${accessible} (${tableData.count || 0} records)`, 'green')
      })
    }
    
    if (result.data.source) {
      log(`   🔧 Source: ${result.data.source}`, 'blue')
    }
  }
  
  // Error details
  if (!result.success) {
    log(`   ❌ Error: ${result.data?.error || 'Unknown error'}`, 'red')
    if (result.data?.details) {
      log(`   🔍 Details: ${result.data.details}`, 'red')
    }
  }
  
  return {
    ...result,
    performanceOk,
    critical,
    name
  }
}

async function runAllTests() {
  log('🚀 Starting Complete Fix Validation Tests', 'magenta')
  log('=' * 60, 'magenta')
  
  const results = []
  
  // Test each endpoint
  for (const [key, testConfig] of Object.entries(TESTS)) {
    try {
      const result = await testEndpoint(testConfig)
      results.push(result)
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      log(`❌ Test failed with exception: ${error.message}`, 'red')
      results.push({
        success: false,
        name: testConfig.name,
        critical: testConfig.critical,
        error: error.message
      })
    }
  }
  
  // Summary
  log('\n📋 TEST SUMMARY', 'magenta')
  log('=' * 60, 'magenta')
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const criticalFailed = results.filter(r => !r.success && r.critical).length
  const performancePassed = results.filter(r => r.performanceOk).length
  
  log(`✅ Passed: ${passed}/${results.length}`, passed === results.length ? 'green' : 'yellow')
  log(`❌ Failed: ${failed}/${results.length}`, failed === 0 ? 'green' : 'red')
  log(`🔥 Critical failures: ${criticalFailed}`, criticalFailed === 0 ? 'green' : 'red')
  log(`⚡ Performance OK: ${performancePassed}/${results.length}`, performancePassed === results.length ? 'green' : 'yellow')
  
  // Detailed results
  log('\n📊 DETAILED RESULTS', 'magenta')
  log('=' * 60, 'magenta')
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    const criticalMark = result.critical ? '🔥' : '  '
    const perfMark = result.performanceOk ? '⚡' : '🐌'
    
    log(`${icon} ${criticalMark} ${perfMark} ${result.name}`, result.success ? 'green' : 'red')
    
    if (result.duration) {
      log(`    Duration: ${formatTime(result.duration)}`, result.performanceOk ? 'green' : 'yellow')
    }
    
    if (!result.success && result.data?.error) {
      log(`    Error: ${result.data.error}`, 'red')
    }
  })
  
  // Final verdict
  log('\n🎯 FINAL VERDICT', 'magenta')
  log('=' * 60, 'magenta')
  
  if (criticalFailed === 0 && performancePassed === results.length) {
    log('🎉 ALL TESTS PASSED! The fix is working correctly.', 'green')
  } else if (criticalFailed === 0) {
    log('⚠️  Critical functionality works, but some performance issues remain.', 'yellow')
  } else {
    log('❌ CRITICAL ISSUES FOUND! The fix needs more work.', 'red')
  }
  
  // Recommendations
  log('\n💡 RECOMMENDATIONS', 'magenta')
  log('=' * 60, 'magenta')
  
  if (criticalFailed > 0) {
    log('• Fix critical authentication and data access issues first', 'red')
    log('• Check database triggers and RLS policies', 'red')
    log('• Verify API authentication configuration', 'red')
  }
  
  if (performancePassed < results.length) {
    log('• Run SQL performance optimization scripts', 'yellow')
    log('• Check database indexes and query optimization', 'yellow')
    log('• Consider implementing query caching', 'yellow')
  }
  
  if (passed === results.length) {
    log('• Consider adding more comprehensive tests', 'green')
    log('• Monitor performance in production', 'green')
    log('• Set up automated testing pipeline', 'green')
  }
  
  process.exit(criticalFailed > 0 ? 1 : 0)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n🛑 Tests interrupted by user', 'yellow')
  process.exit(0)
})

// Run tests
runAllTests().catch(error => {
  log(`💥 Test suite failed: ${error.message}`, 'red')
  process.exit(1)
})