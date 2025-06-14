#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔍 Iniciando auditoria de performance e SEO...\n')

// Configurações
const config = {
  siteUrl: 'https://armazemsaojoaquim.netlify.app',
  outputDir: './audit-reports',
  thresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
    pwa: 80
  }
}

// Criar diretório de relatórios
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true })
}

// Função para executar Lighthouse
function runLighthouse() {
  console.log('🚦 Executando Lighthouse...')
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputFile = path.join(config.outputDir, `lighthouse-${timestamp}.json`)
    
    const command = `npx lighthouse ${config.siteUrl} --output=json --output-path=${outputFile} --chrome-flags="--headless --no-sandbox"`
    
    execSync(command, { stdio: 'inherit' })
    
    // Ler e analisar resultados
    const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
    const scores = {
      performance: Math.round(results.lhr.categories.performance.score * 100),
      accessibility: Math.round(results.lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(results.lhr.categories['best-practices'].score * 100),
      seo: Math.round(results.lhr.categories.seo.score * 100),
      pwa: results.lhr.categories.pwa ? Math.round(results.lhr.categories.pwa.score * 100) : 0
    }
    
    console.log('\n📊 Resultados Lighthouse:')
    Object.entries(scores).forEach(([category, score]) => {
      const threshold = config.thresholds[category]
      const status = score >= threshold ? '✅' : '❌'
      console.log(`   ${status} ${category}: ${score}/100 (meta: ${threshold})`)
    })
    
    return { scores, results }
    
  } catch (error) {
    console.error('❌ Erro ao executar Lighthouse:', error.message)
    return null
  }
}

// Função para analisar Core Web Vitals
function analyzeWebVitals() {
  console.log('\n⚡ Analisando Core Web Vitals...')
  
  const webVitalsChecks = [
    {
      name: 'Largest Contentful Paint (LCP)',
      target: '< 2.5s',
      check: 'Verificar se imagens principais têm priority={true}'
    },
    {
      name: 'First Input Delay (FID)',
      target: '< 100ms',
      check: 'Minimizar JavaScript blocking'
    },
    {
      name: 'Cumulative Layout Shift (CLS)',
      target: '< 0.1',
      check: 'Definir dimensões para imagens e elementos'
    }
  ]
  
  webVitalsChecks.forEach(vital => {
    console.log(`   📈 ${vital.name}: ${vital.target}`)
    console.log(`      💡 ${vital.check}`)
  })
}

// Função para verificar otimizações de imagem
function checkImageOptimizations() {
  console.log('\n🖼️  Verificando otimizações de imagem...')
  
  const imageDir = './public/images'
  if (!fs.existsSync(imageDir)) {
    console.log('❌ Diretório de imagens não encontrado')
    return
  }
  
  const images = []
  const scanDir = (dir) => {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        scanDir(filePath)
      } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
        images.push({
          path: filePath,
          size: stat.size,
          name: file
        })
      }
    })
  }
  
  scanDir(imageDir)
  
  const largeImages = images.filter(img => img.size > 500 * 1024) // > 500KB
  const unoptimizedImages = images.filter(img => !/\.webp$/i.test(img.name))
  
  console.log(`   📊 Total de imagens: ${images.length}`)
  console.log(`   ⚠️  Imagens grandes (>500KB): ${largeImages.length}`)
  console.log(`   🔄 Imagens sem WebP: ${unoptimizedImages.length}`)
  
  if (largeImages.length > 0) {
    console.log('\n   Imagens que precisam de otimização:')
    largeImages.forEach(img => {
      const sizeMB = (img.size / (1024 * 1024)).toFixed(2)
      console.log(`      - ${img.name}: ${sizeMB}MB`)
    })
  }
}

// Função para verificar SEO
function checkSEO() {
  console.log('\n🔍 Verificando SEO...')
  
  const seoChecks = [
    {
      name: 'Meta tags essenciais',
      files: ['app/layout.tsx', 'app/page.tsx'],
      check: 'title, description, og:image'
    },
    {
      name: 'Sitemap',
      files: ['app/sitemap.ts'],
      check: 'Sitemap dinâmico configurado'
    },
    {
      name: 'Robots.txt',
      files: ['public/robots.txt'],
      check: 'Configuração de crawling'
    },
    {
      name: 'Schema.org',
      files: ['components/SEO.tsx'],
      check: 'Structured data para restaurante'
    }
  ]
  
  seoChecks.forEach(check => {
    const exists = check.files.every(file => fs.existsSync(file))
    const status = exists ? '✅' : '❌'
    console.log(`   ${status} ${check.name}: ${check.check}`)
  })
}

// Função para verificar acessibilidade
function checkAccessibility() {
  console.log('\n♿ Verificando acessibilidade...')
  
  const a11yChecks = [
    'Alt text em todas as imagens',
    'Contraste de cores adequado',
    'Navegação por teclado',
    'ARIA labels em elementos interativos',
    'Estrutura semântica HTML',
    'Focus indicators visíveis'
  ]
  
  a11yChecks.forEach(check => {
    console.log(`   📋 ${check}`)
  })
}

// Função para gerar recomendações
function generateRecommendations() {
  console.log('\n💡 Recomendações de melhoria:')
  
  const recommendations = [
    {
      category: 'Performance',
      items: [
        'Implementar lazy loading para imagens below-the-fold',
        'Otimizar Critical Rendering Path',
        'Usar React.memo em componentes pesados',
        'Implementar code splitting por rota'
      ]
    },
    {
      category: 'SEO',
      items: [
        'Adicionar schema.org para LocalBusiness',
        'Otimizar meta descriptions únicas por página',
        'Implementar breadcrumbs',
        'Adicionar FAQ schema para página de reservas'
      ]
    },
    {
      category: 'UX',
      items: [
        'Adicionar skeleton loading states',
        'Implementar offline fallback',
        'Melhorar feedback visual em formulários',
        'Adicionar animações de transição suaves'
      ]
    },
    {
      category: 'Monitoramento',
      items: [
        'Configurar Real User Monitoring (RUM)',
        'Implementar error boundary global',
        'Adicionar métricas de negócio (conversões)',
        'Configurar alertas para Core Web Vitals'
      ]
    }
  ]
  
  recommendations.forEach(category => {
    console.log(`\n   🎯 ${category.category}:`)
    category.items.forEach(item => {
      console.log(`      • ${item}`)
    })
  })
}

// Função para verificar dependências
function checkDependencies() {
  console.log('\n📦 Verificando dependências...')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    const outdatedPackages = []
    const securityIssues = []
    
    // Verificar versões principais
    const criticalPackages = ['next', 'react', '@supabase/supabase-js']
    criticalPackages.forEach(pkg => {
      if (dependencies[pkg]) {
        console.log(`   ✅ ${pkg}: ${dependencies[pkg]}`)
      } else {
        console.log(`   ❌ ${pkg}: não encontrado`)
      }
    })
    
    // Sugerir verificação de segurança
    console.log('\n   💡 Execute "npm audit" para verificar vulnerabilidades')
    console.log('   💡 Execute "npm outdated" para verificar atualizações')
    
  } catch (error) {
    console.error('❌ Erro ao verificar dependências:', error.message)
  }
}

// Função principal
async function main() {
  try {
    // Executar todas as verificações
    const lighthouseResults = runLighthouse()
    analyzeWebVitals()
    checkImageOptimizations()
    checkSEO()
    checkAccessibility()
    checkDependencies()
    generateRecommendations()
    
    // Gerar relatório final
    const reportPath = path.join(config.outputDir, `audit-summary-${new Date().toISOString().split('T')[0]}.md`)
    const report = generateMarkdownReport(lighthouseResults)
    fs.writeFileSync(reportPath, report)
    
    console.log(`\n📄 Relatório completo salvo em: ${reportPath}`)
    console.log('\n🎉 Auditoria concluída!')
    
  } catch (error) {
    console.error('❌ Erro durante auditoria:', error.message)
    process.exit(1)
  }
}

// Função para gerar relatório em Markdown
function generateMarkdownReport(lighthouseResults) {
  const date = new Date().toLocaleDateString('pt-BR')
  
  return `# Relatório de Auditoria - Armazém São Joaquim

**Data:** ${date}
**URL:** ${config.siteUrl}

## 📊 Scores Lighthouse

${lighthouseResults ? Object.entries(lighthouseResults.scores).map(([category, score]) => 
  `- **${category}:** ${score}/100`
).join('\n') : 'Lighthouse não executado'}

## 🎯 Próximas Ações Prioritárias

### Alta Prioridade
- [ ] Otimizar imagens grandes (>500KB)
- [ ] Implementar lazy loading
- [ ] Adicionar priority={true} em imagens LCP
- [ ] Verificar Core Web Vitals em produção

### Média Prioridade
- [ ] Melhorar SEO schema.org
- [ ] Implementar skeleton loading
- [ ] Otimizar bundle JavaScript
- [ ] Configurar monitoring avançado

### Baixa Prioridade
- [ ] Adicionar PWA features
- [ ] Implementar offline support
- [ ] Melhorar animações
- [ ] Otimizar fonts loading

## 📈 Métricas para Acompanhar

- Core Web Vitals (LCP, FID, CLS)
- Taxa de conversão de reservas
- Tempo de carregamento por página
- Taxa de rejeição
- Acessibilidade score

---
*Relatório gerado automaticamente*
`
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { main, runLighthouse, checkImageOptimizations } 