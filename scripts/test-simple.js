#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')

console.log('🧪 Executando testes simplificados...\n')

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:3000/api/health', { 
      signal: AbortSignal.timeout(3000) 
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function runTests() {
  let passed = 0
  let failed = 0
  let total = 0

  // 1. Testes de unidade
  log('📦 Executando testes de unidade...', 'blue')
  try {
    execSync('npm test -- --watchAll=false --silent', { 
      stdio: 'inherit',
      timeout: 30000 
    })
    log('✅ Testes de unidade: PASSOU', 'green')
    passed++
  } catch (error) {
    log('❌ Testes de unidade: FALHOU', 'red')
    failed++
  }
  total++

  // 2. Verificar se o servidor está rodando
  log('\n🌐 Verificando servidor...', 'blue')
  const serverRunning = await checkServerStatus()
  
  if (serverRunning) {
    log('✅ Servidor está rodando', 'green')
    passed++
    
    // 3. Teste básico de API
    log('\n🔗 Testando APIs básicas...', 'blue')
    try {
      const healthResponse = await fetch('http://localhost:3000/api/health')
      if (healthResponse.ok) {
        log('✅ API Health: PASSOU', 'green')
        passed++
      } else {
        throw new Error(`Status: ${healthResponse.status}`)
      }
    } catch (error) {
      log(`❌ API Health: FALHOU - ${error.message}`, 'red')
      failed++
    }
    total += 2
    
  } else {
    log('⚠️ Servidor não está rodando', 'yellow')
    log('💡 Para testes completos, execute: npm run dev', 'cyan')
    failed++
    total++
  }

  // 4. Verificar arquivos essenciais
  log('\n📁 Verificando arquivos essenciais...', 'blue')
  const essentialFiles = [
    'package.json',
    'next.config.js',
    'tailwind.config.js',
    'jest.config.js',
    'jest.setup.js'
  ]

  let filesOk = 0
  for (const file of essentialFiles) {
    if (fs.existsSync(file)) {
      filesOk++
    }
  }

  if (filesOk === essentialFiles.length) {
    log('✅ Arquivos essenciais: PASSOU', 'green')
    passed++
  } else {
    log(`❌ Arquivos essenciais: FALHOU (${filesOk}/${essentialFiles.length})`, 'red')
    failed++
  }
  total++

  // 5. Verificar estrutura de pastas
  log('\n📂 Verificando estrutura de pastas...', 'blue')
  const essentialDirs = [
    'app',
    'components',
    'lib',
    'public',
    '__tests__'
  ]

  let dirsOk = 0
  for (const dir of essentialDirs) {
    if (fs.existsSync(dir)) {
      dirsOk++
    }
  }

  if (dirsOk === essentialDirs.length) {
    log('✅ Estrutura de pastas: PASSOU', 'green')
    passed++
  } else {
    log(`❌ Estrutura de pastas: FALHOU (${dirsOk}/${essentialDirs.length})`, 'red')
    failed++
  }
  total++

  // Relatório final
  log('\n📊 RELATÓRIO FINAL', 'cyan')
  log(`Total de testes: ${total}`)
  log(`✅ Passou: ${passed}`, 'green')
  log(`❌ Falhou: ${failed}`, 'red')
  log(`📈 Taxa de sucesso: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed === 0) {
    log('\n🎉 Todos os testes passaram!', 'green')
    process.exit(0)
  } else {
    log('\n⚠️ Alguns testes falharam', 'yellow')
    process.exit(1)
  }
}

runTests().catch(error => {
  log(`❌ Erro durante execução: ${error.message}`, 'red')
  process.exit(1)
}) 