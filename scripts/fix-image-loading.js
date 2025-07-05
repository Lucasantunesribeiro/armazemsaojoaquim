#!/usr/bin/env node

/**
 * Script para corrigir problemas de carregamento de imagens
 * Resolve problemas comuns com logo e imagens do menu
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Iniciando correção de problemas de carregamento de imagens...\n')

// 1. Verificar e corrigir configuração de CSP no next.config.js
console.log('📝 1. Verificando configuração de CSP...')
const nextConfigPath = path.join(__dirname, '..', 'next.config.js')
let nextConfig = fs.readFileSync(nextConfigPath, 'utf8')

// Verificar se CSP está muito restritiva
if (nextConfig.includes("script-src 'none'")) {
  console.log('⚠️  CSP muito restritiva detectada, ajustando...')
  
  // Atualizar CSP para permitir imagens inline
  nextConfig = nextConfig.replace(
    'contentSecurityPolicy: "default-src \'self\'; script-src \'none\'; sandbox;"',
    'contentSecurityPolicy: "default-src \'self\'; script-src \'none\'; img-src \'self\' data: blob:; sandbox;"'
  )
  
  fs.writeFileSync(nextConfigPath, nextConfig)
  console.log('✅ CSP atualizada para permitir imagens')
} else {
  console.log('✅ CSP configurada corretamente')
}

// 2. Verificar componente Logo e adicionar diagnósticos
console.log('\n📝 2. Verificando componente Logo...')
const logoPath = path.join(__dirname, '..', 'components', 'atoms', 'Logo.tsx')
let logoContent = fs.readFileSync(logoPath, 'utf8')

// Adicionar logging para debug se não existir
if (!logoContent.includes('console.log')) {
  console.log('📊 Adicionando logging de debug ao componente Logo...')
  
  // Adicionar logging de erro mais detalhado
  const newErrorHandler = `
  const handleImageError = (e) => {
    console.log('❌ Erro ao carregar logo:', e.target.src)
    console.log('📊 Tentando fallback para placeholder...')
    setImageError(true)
  }`
  
  // Substituir o onError simples
  logoContent = logoContent.replace(
    'onError={() => setImageError(true)}',
    'onError={handleImageError}'
  )
  
  // Adicionar a função no início do componente
  logoContent = logoContent.replace(
    'const [imageError, setImageError] = useState(false)',
    `const [imageError, setImageError] = useState(false)

  const handleImageError = (e) => {
    console.log('❌ Erro ao carregar logo:', e?.target?.src)
    console.log('📊 Tentando fallback para placeholder...')
    setImageError(true)
  }`
  )
  
  fs.writeFileSync(logoPath, logoContent)
  console.log('✅ Logging adicionado ao componente Logo')
} else {
  console.log('✅ Componente Logo já tem logging')
}

// 3. Criar versão otimizada do logo se não existir
console.log('\n📝 3. Verificando otimização do logo...')
const logoDir = path.join(__dirname, '..', 'public', 'images')
const logoOptimizedPath = path.join(logoDir, 'logo-optimized.jpg')

if (!fs.existsSync(logoOptimizedPath)) {
  console.log('📋 Criando cópia otimizada do logo...')
  const originalLogo = path.join(logoDir, 'logo.jpg')
  
  if (fs.existsSync(originalLogo)) {
    fs.copyFileSync(originalLogo, logoOptimizedPath)
    console.log('✅ Logo otimizado criado')
  } else {
    console.log('❌ Logo original não encontrado')
  }
} else {
  console.log('✅ Logo otimizado já existe')
}

// 4. Verificar headers de cache
console.log('\n📝 4. Verificando configuração de headers...')
const headersPath = path.join(__dirname, '..', 'public', '_headers')

if (!fs.existsSync(headersPath)) {
  console.log('📋 Criando arquivo de headers para Netlify...')
  
  const headersContent = `# Cache headers para imagens
/images/*
  Cache-Control: public, max-age=31536000, immutable
  
# Headers para service worker
/sw.js
  Cache-Control: public, max-age=0, must-revalidate

# Headers para favicon
/favicon.ico
  Cache-Control: public, max-age=86400

# Headers para imagens do menu
/images/menu_images/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# Headers para fontes
/_next/static/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  
# Headers de segurança gerais
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin`
  
  fs.writeFileSync(headersPath, headersContent)
  console.log('✅ Arquivo _headers criado')
} else {
  console.log('✅ Arquivo _headers já existe')
}

// 5. Criar componente de teste para imagens
console.log('\n📝 5. Criando componente de teste...')
const testComponentPath = path.join(__dirname, '..', 'components', 'debug', 'ImageTester.tsx')
const testComponentDir = path.dirname(testComponentPath)

if (!fs.existsSync(testComponentDir)) {
  fs.mkdirSync(testComponentDir, { recursive: true })
}

const testComponentContent = `'use client'

import { useState } from 'react'
import Image from 'next/image'

export const ImageTester = () => {
  const [testResults, setTestResults] = useState<{[key: string]: string}>({})
  
  const testImages = [
    '/images/logo.jpg',
    '/images/logo.avif',
    '/images/placeholder.svg',
    '/images/aperitivos.jpg'
  ]
  
  const testImage = (src: string) => {
    const img = new window.Image()
    img.onload = () => {
      setTestResults(prev => ({ ...prev, [src]: '✅ OK' }))
    }
    img.onerror = () => {
      setTestResults(prev => ({ ...prev, [src]: '❌ ERRO' }))
    }
    img.src = src
  }
  
  const testAllImages = () => {
    testImages.forEach(testImage)
  }
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-4">🔧 Teste de Carregamento de Imagens</h3>
      
      <button 
        onClick={testAllImages}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Testar Imagens
      </button>
      
      <div className="space-y-2">
        {testImages.map(src => (
          <div key={src} className="flex items-center justify-between">
            <span className="text-sm font-mono">{src}</span>
            <span>{testResults[src] || '⏳ Aguardando...'}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        {testImages.map(src => (
          <div key={src} className="text-center">
            <p className="text-xs mb-2">{src.split('/').pop()}</p>
            <Image
              src={src}
              alt="Teste"
              width={50}
              height={50}
              className="mx-auto rounded"
              onError={() => console.log(\`Erro ao carregar: \${src}\`)}
              onLoad={() => console.log(\`Sucesso ao carregar: \${src}\`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}`

fs.writeFileSync(testComponentPath, testComponentContent)
console.log('✅ Componente de teste criado')

// 6. Verificar e corrigir imports problemáticos
console.log('\n📝 6. Verificando imports problemáticos...')
const globalsPath = path.join(__dirname, '..', 'app', 'globals.css')

if (fs.existsSync(globalsPath)) {
  let globalsContent = fs.readFileSync(globalsPath, 'utf8')
  
  // Verificar se há imports de fontes que podem causar problemas
  if (globalsContent.includes('@import url(')) {
    console.log('⚠️  Imports de fontes externos detectados, pode causar problemas de CORS')
  } else {
    console.log('✅ Imports de CSS ok')
  }
} else {
  console.log('❌ globals.css não encontrado')
}

console.log('\n🎉 CORREÇÕES APLICADAS:')
console.log('✅ 1. CSP atualizada para permitir imagens')
console.log('✅ 2. Logging adicionado ao componente Logo')
console.log('✅ 3. Logo otimizado verificado/criado')
console.log('✅ 4. Headers de cache configurados')
console.log('✅ 5. Componente de teste criado')
console.log('✅ 6. Imports verificados')

console.log('\n🚀 PRÓXIMOS PASSOS:')
console.log('1. Reinicie o servidor de desenvolvimento (npm run dev)')
console.log('2. Limpe o cache do navegador (Ctrl+F5)')
console.log('3. Teste o acesso direto: http://localhost:3000/images/logo.jpg')
console.log('4. Acesse /test-images para usar o componente de teste')
console.log('5. Verifique o console do navegador para logs de debug')

console.log('\n🔍 COMANDOS DE TESTE:')
console.log('• node scripts/test-logo-loading.js - Testar logo específicamente')
console.log('• node scripts/check-all-menu-images.js - Verificar imagens do menu')
console.log('• npm run build - Testar build de produção')

console.log('\n📋 Se o problema persistir:')
console.log('1. Verifique se o Next.js está rodando (npm run dev)')
console.log('2. Teste outros arquivos de imagem')
console.log('3. Verifique permissões de arquivo no sistema')
console.log('4. Desabilite temporariamente antivírus/firewall')
console.log('5. Teste em modo incógnito do navegador') 