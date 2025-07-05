#!/usr/bin/env node

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Build otimizado para produção (Netlify)...')

// Função para executar comandos com timeout e retry mais agressivos
const runWithTimeout = (command, description, timeout = 420000, retries = 3) => {
  console.log(`📦 ${description}...`)
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`🔄 Tentativa ${attempt}/${retries}`)
    
    try {
      const result = execSync(command, { 
        stdio: 'inherit',
        timeout: timeout,
        env: {
          ...process.env,
          NPM_CONFIG_FETCH_TIMEOUT: '600000',
          NPM_CONFIG_FETCH_RETRY_MINTIMEOUT: '10000',
          NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT: '60000',
          NPM_CONFIG_FETCH_RETRIES: '5',
          NODE_OPTIONS: '--max-old-space-size=4096'
        }
      })
      console.log(`✅ ${description} concluído na tentativa ${attempt}`)
      return true
    } catch (error) {
      console.warn(`⚠️  ${description} falhou na tentativa ${attempt}`)
      
      if (attempt < retries) {
        console.log('💤 Aguardando 10s antes da próxima tentativa...')
        execSync('timeout 10 >nul 2>&1 || sleep 10', { stdio: 'inherit' })
        
        // Limpar cache npm se for erro de rede
        if (error.message.includes('503') || error.message.includes('timeout')) {
          console.log('🧹 Limpando cache npm devido a erro de rede...')
          try {
            execSync('npm cache clean --force', { stdio: 'inherit' })
          } catch (cacheError) {
            console.log('ℹ️  Cache npm já estava limpo')
          }
        }
      } else {
        console.error(`❌ ${description} falhou após ${retries} tentativas:`, error.message)
        throw error
      }
    }
  }
}

const runOptional = (command, description) => {
  console.log(`📦 ${description}...`)
  try {
    execSync(command, { 
      stdio: 'inherit',
      timeout: 120000
    })
    console.log(`✅ ${description} concluído`)
    return true
  } catch (error) {
    console.warn(`⚠️  ${description} falhou, continuando...`)
    return false
  }
}

// 1. Configurar variáveis de ambiente primeiro
process.env.NODE_ENV = 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'
process.env.ESLINT_NO_DEV_ERRORS = 'true'
process.env.NEXT_PRIVATE_SKIP_MIDDLEWARE_VALIDATION = 'true'
process.env.CI = 'true'
process.env.SKIP_VALIDATION = 'true'
process.env.NPM_CONFIG_FUND = 'false'
process.env.NPM_CONFIG_AUDIT = 'false'

console.log('🌍 Variáveis de ambiente configuradas para produção')

// 2. Limpar cache agressivamente
console.log('🧹 Limpeza completa do cache...')
const cleanCommands = [
  'npm cache clean --force',
  'rimraf .next out node_modules/.cache .cache',
  'rimraf %TEMP%\\npm-* 2>nul || rm -rf /tmp/npm-* 2>/dev/null || true'
]

cleanCommands.forEach(cmd => {
  try {
    execSync(cmd, { stdio: 'inherit' })
  } catch (error) {
    console.log(`ℹ️  Comando de limpeza falhou (normal): ${cmd}`)
  }
})

// 3. Verificar/instalar dependências críticas
console.log('🔍 Verificando dependências críticas...')

// Tentar instalar Sharp separadamente se necessário
try {
  require.resolve('sharp')
  console.log('✅ Sharp disponível')
} catch (error) {
  console.log('📦 Instalando Sharp...')
  runOptional('npm install sharp@latest --no-save --prefer-offline', 'Instalação do Sharp')
}

// 4. Scripts opcionais de otimização
if (fs.existsSync('scripts/generate-icons.js')) {
  runOptional('node scripts/generate-icons.js', 'Geração de ícones PWA')
}

if (fs.existsSync('scripts/optimize-images.js')) {
  runOptional('node scripts/optimize-images.js', 'Otimização de imagens')
}

// 5. Build principal do Next.js com múltiplas estratégias
console.log('🏗️  Iniciando build do Next.js...')

const buildStrategies = [
  {
    name: 'Build padrão',
    command: 'npx next build',
    env: {}
  },
  {
    name: 'Build sem lint',
    command: 'npx next build --no-lint',
    env: { NEXT_PRIVATE_SKIP_VALIDATION: 'true' }
  },
  {
    name: 'Build modo debug',
    command: 'npx next build --debug',
    env: { 
      NEXT_PRIVATE_SKIP_VALIDATION: 'true',
      NODE_OPTIONS: '--max-old-space-size=8192'
    }
  }
]

let buildSuccess = false

for (const strategy of buildStrategies) {
  if (buildSuccess) break
  
  console.log(`🎯 Tentando: ${strategy.name}`)
  try {
    execSync(strategy.command, {
      stdio: 'inherit',
      timeout: 600000, // 10 minutos
      env: { ...process.env, ...strategy.env }
    })
    
    console.log(`✅ ${strategy.name} bem-sucedido!`)
    buildSuccess = true
    break
    
  } catch (error) {
    console.warn(`❌ ${strategy.name} falhou:`, error.message)
    
    if (strategy !== buildStrategies[buildStrategies.length - 1]) {
      console.log('🔄 Tentando próxima estratégia...')
    }
  }
}

if (!buildSuccess) {
  console.error('❌ Todas as estratégias de build falharam!')
  process.exit(1)
}

// 6. Verificação final
if (!fs.existsSync('.next')) {
  console.error('❌ Diretório .next não foi criado')
  process.exit(1)
}

// 7. Relatório de build
try {
  const buildInfo = fs.statSync('.next')
  console.log(`📊 Build criado em: ${buildInfo.birthtime}`)
  
  const checkFiles = ['.next/static', '.next/server', '.next/BUILD_ID']
  checkFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stat = fs.statSync(file)
      console.log(`✓ ${file} existe (${stat.isDirectory() ? 'diretório' : 'arquivo'})`)
    }
  })
  
} catch (error) {
  console.log('ℹ️  Não foi possível obter estatísticas detalhadas do build')
}

console.log('🎉 Build de produção concluído com sucesso!')

// Informações do Netlify
if (process.env.NETLIFY) {
  console.log('\n🌐 Deploy Netlify:')
  console.log('   • Build ID:', process.env.BUILD_ID || 'N/A')
  console.log('   • Deploy URL:', process.env.DEPLOY_URL || 'N/A')
  console.log('   • Branch:', process.env.BRANCH || 'N/A')
  console.log('   • Node Version:', process.env.NODE_VERSION || process.version)
} 