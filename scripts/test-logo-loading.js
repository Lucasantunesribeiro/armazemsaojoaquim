#!/usr/bin/env node

/**
 * Script para testar o carregamento do logo e diagnóstico de problemas
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Testando carregamento do logo...\n')

// Verificar arquivos locais do logo
const logoDir = path.join(__dirname, '..', 'public', 'images')
const logoFiles = ['logo.jpg', 'logo.avif', 'logo.webp', 'placeholder.svg']

console.log('📂 Verificando arquivos locais do logo:')
logoFiles.forEach(file => {
  const filePath = path.join(logoDir, file)
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    const sizeKB = (stats.size / 1024).toFixed(1)
    console.log(`✅ ${file} - ${sizeKB}KB`)
  } else {
    console.log(`❌ ${file} - NÃO ENCONTRADO`)
  }
})

console.log('\n🔍 Verificando estrutura do componente Logo:')
const logoComponentPath = path.join(__dirname, '..', 'components', 'atoms', 'Logo.tsx')
if (fs.existsSync(logoComponentPath)) {
  console.log('✅ Componente Logo.tsx encontrado')
  
  // Ler e analisar o conteúdo
  const logoContent = fs.readFileSync(logoComponentPath, 'utf8')
  
  // Verificar se está usando o caminho correto
  if (logoContent.includes('/images/logo.jpg')) {
    console.log('✅ Caminho da imagem está correto: /images/logo.jpg')
  } else {
    console.log('❌ Caminho da imagem pode estar incorreto')
  }
  
  // Verificar se tem fallback
  if (logoContent.includes('placeholder.svg')) {
    console.log('✅ Fallback para placeholder.svg configurado')
  } else {
    console.log('❌ Fallback não encontrado')
  }
  
  // Verificar se tem tratamento de erro
  if (logoContent.includes('onError')) {
    console.log('✅ Tratamento de erro implementado')
  } else {
    console.log('❌ Tratamento de erro não encontrado')
  }
} else {
  console.log('❌ Componente Logo.tsx não encontrado')
}

console.log('\n🔍 Verificando configuração do Next.js:')
const nextConfigPath = path.join(__dirname, '..', 'next.config.js')
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.js encontrado')
  
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8')
  
  // Verificar se images está configurado
  if (nextConfig.includes('images:')) {
    console.log('✅ Configuração de imagens encontrada')
  } else {
    console.log('❌ Configuração de imagens não encontrada')
  }
  
  // Verificar se Supabase está configurado
  if (nextConfig.includes('supabase.co')) {
    console.log('✅ Supabase Storage configurado')
  } else {
    console.log('❌ Supabase Storage não configurado')
  }
} else {
  console.log('❌ next.config.js não encontrado')
}

console.log('\n📊 DIAGNÓSTICO:')
console.log('Se o logo não está carregando, possíveis causas:')
console.log('1. Arquivo logo.jpg corrompido ou inacessível')
console.log('2. Configuração de otimização de imagens no Next.js')
console.log('3. Problemas de cache do navegador')
console.log('4. Configuração de CSP (Content Security Policy)')

console.log('\n🚀 SOLUÇÕES RECOMENDADAS:')
console.log('1. Limpar cache do navegador (Ctrl+F5)')
console.log('2. Verificar se o servidor de desenvolvimento está rodando')
console.log('3. Testar o acesso direto: http://localhost:3000/images/logo.jpg')
console.log('4. Verificar se não há bloqueios de CORS ou CSP')

console.log('\n💡 TESTE MANUAL:')
console.log('Abra o navegador e acesse:')
console.log('http://localhost:3000/images/logo.jpg')
console.log('Se a imagem carregar diretamente, o problema é no componente.')
console.log('Se não carregar, o problema é na configuração do servidor.') 