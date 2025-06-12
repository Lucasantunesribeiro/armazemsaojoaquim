#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Build simplificado para Netlify...')

// Função simples para executar comandos
const run = (command, description) => {
  console.log(`📦 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} concluído`)
    return true
  } catch (error) {
    console.warn(`⚠️  ${description} falhou, continuando...`)
    return false
  }
}

// 1. Limpar cache
console.log('🧹 Limpando cache...')
try {
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' })
  }
} catch (error) {
  console.log('ℹ️  Cache já estava limpo')
}

// 2. Verificar Sharp (opcional)
try {
  require.resolve('sharp')
  console.log('✅ Sharp encontrado')
} catch (error) {
  console.log('📦 Instalando Sharp...')
  run('npm install sharp', 'Instalação do Sharp')
}

// 3. Gerar ícones (opcional)
if (fs.existsSync('scripts/generate-icons.js')) {
  run('node scripts/generate-icons.js', 'Geração de ícones PWA')
}

// 4. Build principal
console.log('🏗️  Executando build do Next.js...')
try {
  execSync('npx next build', { stdio: 'inherit' })
  console.log('✅ Build concluído com sucesso!')
} catch (error) {
  console.error('❌ Build falhou:', error.message)
  process.exit(1)
}

// 5. Verificar resultado
if (!fs.existsSync('.next')) {
  console.error('❌ Diretório .next não foi criado')
  process.exit(1)
}

console.log('🎉 Build simplificado concluído!') 