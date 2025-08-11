const https = require('https')
const fs = require('fs')

// URLs para testar
const URLS_TO_TEST = [
  'https://689a1a4531baf100085e142b--armazemsaojoaquim.netlify.app/',
  'https://689a1a4531baf100085e142b--armazemsaojoaquim.netlify.app/api/health/simple',
  'https://689a1a4531baf100085e142b--armazemsaojoaquim.netlify.app/api/hello',
  'https://689a1a4531baf100085e142b--armazemsaojoaquim.netlify.app/pt',
  'https://689a1a4531baf100085e142b--armazemsaojoaquim.netlify.app/en'
]

// Função para fazer request com timeout
function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DiagnosticBot/1.0)',
        'Accept': 'text/html,application/json,*/*'
      },
      timeout: timeout
    }, (response) => {
      let data = ''
      
      response.on('data', (chunk) => {
        data += chunk
      })
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data,
          url
        })
      })
    })

    request.on('error', (error) => {
      reject({
        error: error.message,
        url
      })
    })

    request.on('timeout', () => {
      request.destroy()
      reject({
        error: 'Request timeout',
        url
      })
    })

    request.end()
  })
}

// Função para testar Supabase conectividade
function testSupabaseConnectivity() {
  const supabaseUrl = 'https://enolssforaepnrpfrima.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub2xzc2ZvcmFlcG5ycGZyaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTQ2MzksImV4cCI6MjA2NDk5MDYzOX0.oZJdelgrqkyPA9g3cjGikrTLLNvv9sCkrTIl9jK4wBk'
  
  return new Promise((resolve, reject) => {
    const testUrl = `${supabaseUrl}/rest/v1/`
    
    const request = https.request(testUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    }, (response) => {
      let data = ''
      
      response.on('data', (chunk) => {
        data += chunk
      })
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data,
          service: 'Supabase REST API'
        })
      })
    })

    request.on('error', (error) => {
      reject({
        error: error.message,
        service: 'Supabase REST API'
      })
    })

    request.on('timeout', () => {
      request.destroy()
      reject({
        error: 'Request timeout',
        service: 'Supabase REST API'
      })
    })

    request.end()
  })
}

// Função principal
async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DE ERRO 500 - ARMAZÉM SÃO JOAQUIM\n')
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`)
  
  const results = []
  
  // Testar URLs da aplicação
  console.log('📡 Testando endpoints da aplicação:\n')
  
  for (const url of URLS_TO_TEST) {
    try {
      console.log(`🌐 Testando: ${url}`)
      const result = await makeRequest(url, 15000)
      
      console.log(`   ✅ Status: ${result.statusCode}`)
      console.log(`   📏 Body length: ${result.body.length} chars`)
      console.log(`   🕒 Server: ${result.headers.server || 'Unknown'}`)
      
      if (result.statusCode >= 400) {
        console.log(`   ❌ Error body: ${result.body.substring(0, 500)}`)
      }
      
      results.push({
        type: 'endpoint',
        url,
        success: result.statusCode < 400,
        statusCode: result.statusCode,
        error: result.statusCode >= 400 ? result.body : null,
        headers: result.headers
      })
      
      console.log('')
    } catch (error) {
      console.log(`   💥 Error: ${error.error}`)
      results.push({
        type: 'endpoint',
        url,
        success: false,
        error: error.error
      })
      console.log('')
    }
  }
  
  // Testar conectividade com Supabase
  console.log('🗄️ Testando conectividade Supabase:\n')
  
  try {
    const supabaseResult = await testSupabaseConnectivity()
    console.log(`✅ Supabase Status: ${supabaseResult.statusCode}`)
    console.log(`📄 Response: ${supabaseResult.body.substring(0, 200)}`)
    
    results.push({
      type: 'supabase',
      success: supabaseResult.statusCode === 200,
      statusCode: supabaseResult.statusCode,
      response: supabaseResult.body
    })
  } catch (error) {
    console.log(`❌ Supabase Error: ${error.error}`)
    results.push({
      type: 'supabase',
      success: false,
      error: error.error
    })
  }
  
  console.log('\n🏁 RESUMO DO DIAGNÓSTICO:\n')
  
  // Análise dos resultados
  const endpointResults = results.filter(r => r.type === 'endpoint')
  const failedEndpoints = endpointResults.filter(r => !r.success)
  const supabaseResult = results.find(r => r.type === 'supabase')
  
  console.log(`📊 Endpoints testados: ${endpointResults.length}`)
  console.log(`❌ Endpoints com erro: ${failedEndpoints.length}`)
  console.log(`🗄️ Supabase funcionando: ${supabaseResult?.success ? 'SIM' : 'NÃO'}`)
  
  // Identificar padrões de erro
  const errorPatterns = failedEndpoints.map(e => ({
    url: e.url,
    statusCode: e.statusCode,
    errorType: e.error?.includes('Internal Server Error') ? '500_GENERIC' : 'OTHER'
  }))
  
  console.log('\n🎯 DIAGNÓSTICO DETALHADO:\n')
  
  if (failedEndpoints.length === endpointResults.length) {
    console.log('🚨 TODOS os endpoints falharam -> Problema na inicialização da aplicação')
    console.log('   Possíveis causas:')
    console.log('   - Erro no layout.tsx ou providers')
    console.log('   - Variável de ambiente ausente no Netlify')
    console.log('   - Erro de import/dependency')
    console.log('   - Problema na configuração Next.js/Netlify')
  } else if (failedEndpoints.some(e => e.url.includes('/api/'))) {
    console.log('🔧 Falha em APIs -> Problema em server functions')
    console.log('   Possíveis causas:')
    console.log('   - Erro em middleware')
    console.log('   - Configuração de runtime edge/node')
    console.log('   - Conexão com Supabase')
  }
  
  if (!supabaseResult?.success) {
    console.log('🗄️ Supabase inacessível -> Problema de conectividade/auth')
    console.log('   - Verificar keys no Netlify environment variables')
    console.log('   - Confirmar se projeto Supabase está ativo')
  }
  
  // Salvar relatório
  const reportPath = './diagnostic-report.json'
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalEndpoints: endpointResults.length,
      failedEndpoints: failedEndpoints.length,
      supabaseWorking: supabaseResult?.success || false,
      errorPatterns
    },
    recommendations: [
      'Verificar variáveis de ambiente no Netlify',
      'Analisar build logs do Netlify',
      'Verificar função de inicialização (layout.tsx, providers)',
      'Testar conectividade Supabase',
      'Revisar configuração next.config.js'
    ]
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Relatório salvo em: ${reportPath}`)
  
  console.log('\n🎯 PRÓXIMOS PASSOS RECOMENDADOS:\n')
  console.log('1. ✅ Verificar variáveis de ambiente no Netlify Dashboard')
  console.log('2. 🔍 Analisar build logs detalhados no Netlify')
  console.log('3. 🧪 Testar aplicação localmente com npm run build && npm run start')
  console.log('4. 🌐 Verificar se middleware ou layout estão causando o erro')
  console.log('5. 🔄 Fazer redeploy após identificar e corrigir a causa raiz')
}

// Executar diagnóstico
diagnose().catch(error => {
  console.error('💥 Erro inesperado no diagnóstico:', error)
  process.exit(1)
})