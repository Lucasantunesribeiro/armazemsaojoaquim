#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Iniciando build de produção otimizado...\n')

// Função para executar comandos
const exec = (command, description) => {
  console.log(`📦 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} concluído\n`)
  } catch (error) {
    console.error(`❌ Erro em ${description}:`, error.message)
    process.exit(1)
  }
}

// Função para verificar se o arquivo existe
const fileExists = (filePath) => {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

// Função para criar diretório se não existir
const ensureDir = (dirPath) => {
  const fullPath = path.join(process.cwd(), dirPath)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`📁 Diretório criado: ${dirPath}`)
  }
}

// Verificar dependências
console.log('🔍 Verificando dependências...')
if (!fileExists('package.json')) {
  console.error('❌ package.json não encontrado')
  process.exit(1)
}

if (!fileExists('next.config.js')) {
  console.error('❌ next.config.js não encontrado')
  process.exit(1)
}

// Verificar se sharp está instalado
try {
  require.resolve('sharp')
  console.log('✅ Sharp encontrado')
} catch (error) {
  console.log('📦 Instalando Sharp...')
  exec('npm install sharp', 'Instalação do Sharp')
}

// Criar diretórios necessários
ensureDir('public')
ensureDir('scripts')

// 1. Gerar ícones PWA
if (fileExists('public/favicon.svg')) {
  exec('node scripts/generate-icons.js', 'Geração de ícones PWA')
} else {
  console.log('⚠️  favicon.svg não encontrado, pulando geração de ícones')
}

// 2. Otimizar imagens
if (fileExists('scripts/optimize-images.js')) {
  exec('node scripts/optimize-images.js', 'Otimização de imagens')
} else {
  console.log('⚠️  Script de otimização de imagens não encontrado')
}

// 3. Verificar variáveis de ambiente
console.log('🔧 Verificando variáveis de ambiente...')
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Variáveis de ambiente faltando: ${missingEnvVars.join(', ')}`)
  console.warn('   Certifique-se de configurá-las no Netlify')
}

// 4. Limpar cache do Next.js
console.log('🧹 Limpando cache...')
try {
  execSync('rm -rf .next', { stdio: 'inherit' })
  console.log('✅ Cache limpo\n')
} catch (error) {
  console.log('ℹ️  Cache já estava limpo\n')
}

// 5. Type checking
exec('npm run type-check', 'Verificação de tipos TypeScript')

// 6. Linting
exec('npm run lint', 'Verificação de código (ESLint)')

// 7. Build do Next.js
exec('npm run build', 'Build do Next.js')

// 8. Verificar se o build foi bem-sucedido
if (!fileExists('.next')) {
  console.error('❌ Build falhou - diretório .next não encontrado')
  process.exit(1)
}

// 9. Análise do bundle (opcional)
if (process.env.ANALYZE === 'true') {
  console.log('📊 Analisando bundle...')
  try {
    exec('npx @next/bundle-analyzer', 'Análise do bundle')
  } catch (error) {
    console.log('ℹ️  Bundle analyzer não disponível, pulando análise')
  }
}

// 10. Verificar tamanho dos arquivos
console.log('📏 Verificando tamanho dos arquivos...')
try {
  const buildDir = path.join(process.cwd(), '.next')
  const staticDir = path.join(buildDir, 'static')
  
  if (fs.existsSync(staticDir)) {
    const getDirectorySize = (dirPath) => {
      let totalSize = 0
      const files = fs.readdirSync(dirPath, { withFileTypes: true })
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name)
        if (file.isDirectory()) {
          totalSize += getDirectorySize(filePath)
        } else {
          totalSize += fs.statSync(filePath).size
        }
      }
      
      return totalSize
    }
    
    const totalSize = getDirectorySize(staticDir)
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2)
    
    console.log(`📦 Tamanho total dos assets: ${sizeInMB} MB`)
    
    if (totalSize > 10 * 1024 * 1024) { // 10MB
      console.warn('⚠️  Assets são grandes (>10MB). Considere otimizar imagens e código.')
    }
  }
} catch (error) {
  console.log('ℹ️  Não foi possível calcular o tamanho dos arquivos')
}

// 11. Gerar relatório de build
console.log('📋 Gerando relatório de build...')
const buildReport = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  environment: process.env.NODE_ENV || 'production',
  success: true,
  steps: [
    'Geração de ícones PWA',
    'Otimização de imagens',
    'Verificação de tipos',
    'Linting',
    'Build do Next.js'
  ]
}

try {
  fs.writeFileSync(
    path.join(process.cwd(), 'build-report.json'),
    JSON.stringify(buildReport, null, 2)
  )
  console.log('✅ Relatório de build salvo em build-report.json\n')
} catch (error) {
  console.log('⚠️  Não foi possível salvar o relatório de build\n')
}

// 12. Dicas de otimização
console.log('💡 Dicas de otimização:')
console.log('   • Certifique-se de que todas as imagens estão otimizadas')
console.log('   • Use lazy loading para componentes não críticos')
console.log('   • Configure cache headers no Netlify')
console.log('   • Monitore Core Web Vitals em produção')
console.log('   • Use preload para recursos críticos')

console.log('\n🎉 Build de produção concluído com sucesso!')
console.log('🚀 Pronto para deploy no Netlify!')

// Verificar se é deploy do Netlify
if (process.env.NETLIFY) {
  console.log('\n🌐 Deploy do Netlify detectado')
  console.log('   • Build ID:', process.env.BUILD_ID || 'N/A')
  console.log('   • Deploy URL:', process.env.DEPLOY_URL || 'N/A')
  console.log('   • Branch:', process.env.BRANCH || 'N/A')
} 