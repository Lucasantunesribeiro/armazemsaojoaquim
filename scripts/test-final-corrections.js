#!/usr/bin/env node

/**
 * Script final para testar todas as correções dos erros 404
 * Testa arquivos, URLs e configurações
 */

const fs = require('fs')
const path = require('path')

console.log('🎯 Teste Final das Correções de Erros 404\n')
console.log('=' .repeat(50))

let allTestsPassed = true

// Teste 1: Arquivo aperitivos.jpg existe
console.log('\n📁 TESTE 1: Verificação de Arquivos')
const aperitivosPath = path.join(__dirname, '..', 'public', 'images', 'aperitivos.jpg')
const aperitivosExists = fs.existsSync(aperitivosPath)

if (aperitivosExists) {
  console.log('✅ aperitivos.jpg - EXISTE')
} else {
  console.log('❌ aperitivos.jpg - NÃO EXISTE')
  allTestsPassed = false
}

// Teste 2: Código corrigido no MenuPreview
console.log('\n🔧 TESTE 2: Correções no Código')
const menuPreviewPath = path.join(__dirname, '..', 'components', 'sections', 'MenuPreview.tsx')
if (fs.existsSync(menuPreviewPath)) {
  const content = fs.readFileSync(menuPreviewPath, 'utf8')
  const hasWebpRef = content.includes("'/images/aperitivos.webp'")
  const hasJpgRef = content.includes("'/images/aperitivos.jpg'")
  
  if (!hasWebpRef && hasJpgRef) {
    console.log('✅ MenuPreview.tsx - Referência corrigida para .jpg')
  } else {
    console.log('❌ MenuPreview.tsx - Ainda referencia .webp ou não tem .jpg')
    allTestsPassed = false
  }
}

// Teste 3: Footer sem links de política ativos (melhorado)
console.log('\n🔗 TESTE 3: Links do Footer')
const footerPath = path.join(__dirname, '..', 'components', 'layout', 'Footer.tsx')
if (fs.existsSync(footerPath)) {
  const content = fs.readFileSync(footerPath, 'utf8')
  
  // Remove comentários de bloco primeiro
  const contentWithoutBlockComments = content.replace(/\/\*[\s\S]*?\*\//g, '')
  
  // Remove comentários de linha
  const contentWithoutComments = contentWithoutBlockComments.replace(/\/\/.*$/gm, '')
  
  // Procura por links ativos (não comentados) - regex mais preciso
  const activePolicyLinks = contentWithoutComments.match(/href:\s*['"]\/politica-privacidade['"]/g)
  const activeTermsLinks = contentWithoutComments.match(/href:\s*['"]\/termos-uso['"]/g)
  const activeCookieLinks = contentWithoutComments.match(/href:\s*['"]\/cookies['"]/g)
  
  if (!activePolicyLinks && !activeTermsLinks && !activeCookieLinks) {
    console.log('✅ Footer.tsx - Nenhum link de política ativo')
  } else {
    console.log('❌ Footer.tsx - Ainda contém links de política ativos')
    console.log('   Links encontrados:', {
      politica: !!activePolicyLinks,
      termos: !!activeTermsLinks, 
      cookies: !!activeCookieLinks
    })
    allTestsPassed = false
  }
}

// Teste 4: Priority do logo ajustado
console.log('\n🖼️  TESTE 4: Configuração do Logo')
const headerPath = path.join(__dirname, '..', 'components', 'layout', 'Header.tsx')
if (fs.existsSync(headerPath)) {
  const content = fs.readFileSync(headerPath, 'utf8')
  const hasPriorityTrue = content.includes('priority={true}')
  const hasPriorityFalse = content.includes('priority={false}')
  
  if (!hasPriorityTrue && hasPriorityFalse) {
    console.log('✅ Header.tsx - Priority do logo ajustado para false')
  } else {
    console.log('❌ Header.tsx - Priority do logo ainda é true ou não definido')
    allTestsPassed = false
  }
}

// Teste 5: Verificar configuração do Next.js
console.log('\n⚙️  TESTE 5: Configuração Next.js')
const nextConfigPath = path.join(__dirname, '..', 'next.config.js')
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8')
  const hasSupabaseRemotePattern = content.includes('enolssforaepnrpfrima.supabase.co')
  
  if (hasSupabaseRemotePattern) {
    console.log('✅ next.config.js - Configuração Supabase presente')
  } else {
    console.log('❌ next.config.js - Configuração Supabase ausente')
    allTestsPassed = false
  }
}

// Resultado Final
console.log('\n' + '=' .repeat(50))
if (allTestsPassed) {
  console.log('🎉 TODOS OS TESTES PASSARAM!')
  console.log('✅ Os erros 404 foram corrigidos com sucesso.')
  console.log('🚀 O site deve estar funcionando sem erros 404.')
} else {
  console.log('⚠️  ALGUNS TESTES FALHARAM!')
  console.log('❌ Verifique os itens marcados acima.')
  console.log('🔧 Pode ser necessário fazer ajustes adicionais.')
}

console.log('\n📝 Próximos passos:')
console.log('1. Acesse http://localhost:3000')
console.log('2. Verifique o console do navegador')
console.log('3. Navegue para /menu para testar as imagens')
console.log('4. Confirme que não há mais erros 404')

console.log('\n' + '=' .repeat(50)) 