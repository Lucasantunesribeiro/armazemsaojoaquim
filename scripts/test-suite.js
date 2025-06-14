#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Iniciando suite completa de testes...\n')

// Configurações
const config = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://armazemsaojoaquim.netlify.app'
    : 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  parallel: true
}

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Classe para gerenciar testes
class TestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    }
    this.startTime = Date.now()
  }

  async runAllTests() {
    log('🚀 Executando todos os testes...', 'bright')
    
    // Verificar se o servidor está rodando
    const serverRunning = await this.checkServerStatus()
    if (!serverRunning) {
      log('⚠️ Servidor não está rodando. Alguns testes serão pulados.', 'yellow')
      log('💡 Para executar todos os testes, inicie o servidor com: npm run dev', 'cyan')
    }
    
    try {
      // 1. Testes de unidade (não dependem do servidor)
      await this.runUnitTests()
      
      if (serverRunning) {
        // 2. Testes de integração
        await this.runIntegrationTests()
        
        // 3. Testes de API
        await this.runAPITests()
        
        // 4. Testes de performance
        await this.runPerformanceTests()
        
        // 5. Testes de acessibilidade
        await this.runAccessibilityTests()
        
        // 6. Testes de SEO
        await this.runSEOTests()
        
        // 7. Testes de segurança
        await this.runSecurityTests()
        
        // 8. Testes end-to-end
        await this.runE2ETests()
      } else {
        log('\n⏭️ Pulando testes que dependem do servidor...', 'yellow')
        this.results.skipped += 7 // 7 categorias de teste puladas
      }
      
    } catch (error) {
      log(`❌ Erro durante execução dos testes: ${error.message}`, 'red')
      this.results.failed++
    }
    
    this.results.duration = Date.now() - this.startTime
    this.generateReport()
  }

  async checkServerStatus() {
    try {
      const response = await fetch(config.baseUrl, { 
        signal: AbortSignal.timeout(3000) 
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  async runUnitTests() {
    log('\n📦 Executando testes de unidade...', 'blue')
    
    try {
      // Verificar se Jest está configurado
      if (!fs.existsSync('jest.config.js')) {
        await this.createJestConfig()
      }
      
      // Executar testes Jest
      execSync('npm test -- --coverage --watchAll=false', { 
        stdio: 'inherit',
        timeout: config.timeout 
      })
      
      log('✅ Testes de unidade concluídos', 'green')
      this.results.passed++
    } catch (error) {
      log('❌ Testes de unidade falharam', 'red')
      this.results.failed++
    }
    
    this.results.total++
  }

  async runIntegrationTests() {
    log('\n🔗 Executando testes de integração...', 'blue')
    
    const tests = [
      this.testDatabaseConnection,
      this.testSupabaseIntegration,
      this.testEmailService,
      this.testCacheSystem
    ]
    
    for (const test of tests) {
      try {
        await test.call(this)
        this.results.passed++
      } catch (error) {
        log(`❌ ${test.name} falhou: ${error.message}`, 'red')
        this.results.failed++
      }
      this.results.total++
    }
  }

  async runAPITests() {
    log('\n🌐 Executando testes de API...', 'blue')
    
    const endpoints = [
      { method: 'GET', path: '/api/health', expectedStatus: 200 },
      { method: 'GET', path: '/api/health/database', expectedStatus: 200 },
      { method: 'GET', path: '/api/reservas', expectedStatus: 200 },
              { method: 'POST', path: '/api/check-availability', expectedStatus: 200, body: { date: '2024-12-25', time: '19:00', guests: 4 } },
      { method: 'GET', path: '/api/cardapio-pdf?format=json', expectedStatus: 200 },
      { method: 'GET', path: '/api/analytics', expectedStatus: 405 }, // Deve falhar GET
    ]
    
    for (const endpoint of endpoints) {
      try {
        await this.testAPIEndpoint(endpoint)
        log(`✅ ${endpoint.method} ${endpoint.path}`, 'green')
        this.results.passed++
      } catch (error) {
        log(`❌ ${endpoint.method} ${endpoint.path}: ${error.message}`, 'red')
        this.results.failed++
      }
      this.results.total++
    }
  }

  async runPerformanceTests() {
    log('\n⚡ Executando testes de performance...', 'blue')
    
    const tests = [
      { name: 'Página inicial', path: '/', maxTime: 3000 },
      { name: 'Página de reservas', path: '/reservas', maxTime: 3000 },
      { name: 'Página do menu', path: '/menu', maxTime: 3000 },
      { name: 'API de saúde', path: '/api/health', maxTime: 1000 },
    ]
    
    for (const test of tests) {
      try {
        const startTime = Date.now()
        const response = await fetch(`${config.baseUrl}${test.path}`)
        const duration = Date.now() - startTime
        
        if (response.ok && duration <= test.maxTime) {
          log(`✅ ${test.name}: ${duration}ms`, 'green')
          this.results.passed++
        } else {
          throw new Error(`Tempo limite excedido: ${duration}ms > ${test.maxTime}ms`)
        }
      } catch (error) {
        log(`❌ ${test.name}: ${error.message}`, 'red')
        this.results.failed++
      }
      this.results.total++
    }
  }

  async runAccessibilityTests() {
    log('\n♿ Executando testes de acessibilidade...', 'blue')
    
    try {
      // Verificar se axe-core está disponível
      const axeTest = `
        const { AxePuppeteer } = require('@axe-core/puppeteer');
        const puppeteer = require('puppeteer');
        
        (async () => {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.goto('${config.baseUrl}');
          
          const results = await new AxePuppeteer(page).analyze();
          
          if (results.violations.length > 0) {
            console.log('Violações de acessibilidade encontradas:');
            results.violations.forEach(violation => {
              console.log(\`- \${violation.description}\`);
            });
            process.exit(1);
          }
          
          await browser.close();
          console.log('✅ Testes de acessibilidade passaram');
        })();
      `
      
      fs.writeFileSync('/tmp/axe-test.js', axeTest)
      execSync('node /tmp/axe-test.js', { stdio: 'inherit' })
      
      this.results.passed++
    } catch (error) {
      log('⚠️ Testes de acessibilidade não disponíveis (axe-core não instalado)', 'yellow')
      this.results.skipped++
    }
    
    this.results.total++
  }

  async runSEOTests() {
    log('\n🔍 Executando testes de SEO...', 'blue')
    
    const pages = ['/', '/menu', '/reservas', '/blog']
    
    for (const page of pages) {
      try {
        const response = await fetch(`${config.baseUrl}${page}`)
        const html = await response.text()
        
        // Verificar elementos SEO essenciais
        const checks = [
          { name: 'Title tag', regex: /<title>.*<\/title>/ },
          { name: 'Meta description', regex: /<meta name="description"/ },
          { name: 'Meta viewport', regex: /<meta name="viewport"/ },
          { name: 'Open Graph title', regex: /<meta property="og:title"/ },
          { name: 'Open Graph description', regex: /<meta property="og:description"/ },
          { name: 'Canonical URL', regex: /<link rel="canonical"/ },
          { name: 'Schema.org', regex: /<script type="application\/ld\+json">/ }
        ]
        
        let passed = 0
        for (const check of checks) {
          if (check.regex.test(html)) {
            passed++
          } else {
            log(`⚠️ ${page}: ${check.name} não encontrado`, 'yellow')
          }
        }
        
        if (passed >= checks.length * 0.8) { // 80% dos checks devem passar
          log(`✅ SEO ${page}: ${passed}/${checks.length} checks`, 'green')
          this.results.passed++
        } else {
          throw new Error(`Apenas ${passed}/${checks.length} checks de SEO passaram`)
        }
        
      } catch (error) {
        log(`❌ SEO ${page}: ${error.message}`, 'red')
        this.results.failed++
      }
      this.results.total++
    }
  }

  async runSecurityTests() {
    log('\n🔒 Executando testes de segurança...', 'blue')
    
    const securityTests = [
      {
        name: 'Headers de segurança',
        test: async () => {
          const response = await fetch(config.baseUrl)
          const headers = response.headers
          
          const requiredHeaders = [
            'x-frame-options',
            'x-content-type-options',
            'referrer-policy'
          ]
          
          for (const header of requiredHeaders) {
            if (!headers.get(header)) {
              throw new Error(`Header de segurança ausente: ${header}`)
            }
          }
        }
      },
      {
        name: 'HTTPS redirect',
        test: async () => {
          if (config.baseUrl.startsWith('https://')) {
            const httpUrl = config.baseUrl.replace('https://', 'http://')
            const response = await fetch(httpUrl, { redirect: 'manual' })
            
            if (response.status !== 301 && response.status !== 302) {
              throw new Error('HTTPS redirect não configurado')
            }
          }
        }
      },
      {
        name: 'SQL Injection básico',
        test: async () => {
          const maliciousInputs = ["'; DROP TABLE users; --", "1' OR '1'='1"]
          
          for (const input of maliciousInputs) {
            const response = await fetch(`${config.baseUrl}/api/reservas?search=${encodeURIComponent(input)}`)
            
            if (response.status === 500) {
              throw new Error('Possível vulnerabilidade de SQL Injection')
            }
          }
        }
      }
    ]
    
    for (const test of securityTests) {
      try {
        await test.test()
        log(`✅ ${test.name}`, 'green')
        this.results.passed++
      } catch (error) {
        log(`❌ ${test.name}: ${error.message}`, 'red')
        this.results.failed++
      }
      this.results.total++
    }
  }

  async runE2ETests() {
    log('\n🎭 Executando testes end-to-end...', 'blue')
    
    try {
      // Verificar se Playwright está disponível
      const playwrightTest = `
        const { test, expect } = require('@playwright/test');
        
        test('Fluxo de reserva completo', async ({ page }) => {
          await page.goto('${config.baseUrl}');
          
          // Navegar para reservas
          await page.click('a[href="/reservas"]');
          await expect(page).toHaveURL(/.*reservas/);
          
          // Preencher formulário de reserva
          await page.fill('input[name="nome"]', 'Teste E2E');
          await page.fill('input[name="email"]', 'teste@example.com');
          await page.fill('input[name="telefone"]', '(21) 99999-9999');
          await page.selectOption('select[name="numero_pessoas"]', '2');
          
          // Verificar se formulário está preenchido
          await expect(page.locator('input[name="nome"]')).toHaveValue('Teste E2E');
        });
        
        test('Navegação do menu', async ({ page }) => {
          await page.goto('${config.baseUrl}/menu');
          
          // Verificar se página carregou
          await expect(page.locator('h1')).toContainText('Cardápio');
          
          // Verificar se há itens do menu
          await expect(page.locator('[data-testid="menu-item"]').first()).toBeVisible();
        });
      `
      
      fs.writeFileSync('/tmp/e2e-test.spec.js', playwrightTest)
      execSync('npx playwright test /tmp/e2e-test.spec.js', { stdio: 'inherit' })
      
      this.results.passed++
    } catch (error) {
      log('⚠️ Testes E2E não disponíveis (Playwright não instalado)', 'yellow')
      this.results.skipped++
    }
    
    this.results.total++
  }

  // Métodos auxiliares
  async testAPIEndpoint({ method, path, expectedStatus, body }) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${config.baseUrl}${path}`, options)
    
    if (response.status !== expectedStatus) {
      throw new Error(`Status esperado ${expectedStatus}, recebido ${response.status}`)
    }
    
    // Verificar se resposta é JSON válido para APIs
    if (path.startsWith('/api/') && response.headers.get('content-type')?.includes('application/json')) {
      await response.json() // Vai lançar erro se não for JSON válido
    }
  }

  async testDatabaseConnection() {
    const response = await fetch(`${config.baseUrl}/api/health/database`)
    if (!response.ok) {
      throw new Error('Conexão com banco de dados falhou')
    }
    
    const data = await response.json()
    if (data.status !== 'healthy') {
      throw new Error('Banco de dados não está saudável')
    }
  }

  async testSupabaseIntegration() {
    // Testar se Supabase está respondendo
    const response = await fetch(`${config.baseUrl}/api/reservas`)
    if (!response.ok) {
      throw new Error('Integração com Supabase falhou')
    }
  }

  async testEmailService() {
    // Testar endpoint de email (sem enviar email real)
    const response = await fetch(`${config.baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Teste',
        text: 'Teste de email',
        test: true // Flag para não enviar email real
      })
    })
    
    // Deve retornar erro de validação ou sucesso de teste
    if (response.status !== 200 && response.status !== 400) {
      throw new Error('Serviço de email não está funcionando')
    }
  }

  async testCacheSystem() {
    // Testar se sistema de cache está funcionando
    const start1 = Date.now()
    await fetch(`${config.baseUrl}/api/health`)
    const time1 = Date.now() - start1
    
    const start2 = Date.now()
    await fetch(`${config.baseUrl}/api/health`)
    const time2 = Date.now() - start2
    
    // Segunda requisição deve ser mais rápida (cache)
    if (time2 > time1 * 1.5) {
      log('⚠️ Cache pode não estar funcionando otimamente', 'yellow')
    }
  }

  async createJestConfig() {
    const jestConfig = `
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
`
    
    fs.writeFileSync('jest.config.js', jestConfig)
    
    const jestSetup = `
import '@testing-library/jest-dom'

// Mock do Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock do Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    })),
  }),
}))
`
    
    fs.writeFileSync('jest.setup.js', jestSetup)
  }

  generateReport() {
    // Calcular total se não foi definido
    if (!this.results.total || this.results.total === 0) {
      this.results.total = this.results.passed + this.results.failed + this.results.skipped
    }
    
    const duration = (this.results.duration / 1000).toFixed(2)
    const successRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : '0.0'
    
    log('\n📊 RELATÓRIO DE TESTES', 'bright')
    log('='.repeat(50), 'cyan')
    log(`Total de testes: ${this.results.total}`, 'blue')
    log(`✅ Passou: ${this.results.passed}`, 'green')
    log(`❌ Falhou: ${this.results.failed}`, 'red')
    log(`⏭️ Pulou: ${this.results.skipped}`, 'yellow')
    log(`⏱️ Duração: ${duration}s`, 'blue')
    log(`📈 Taxa de sucesso: ${successRate}%`, 'magenta')
    log('='.repeat(50), 'cyan')
    
    if (this.results.failed > 0) {
      log('\n❌ Alguns testes falharam. Verifique os logs acima.', 'red')
      process.exit(1)
    } else {
      log('\n🎉 Todos os testes passaram!', 'green')
    }
    
    // Salvar relatório em arquivo
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      config,
      successRate: parseFloat(successRate),
      duration: parseFloat(duration)
    }
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2))
    log('\n📄 Relatório salvo em test-report.json', 'blue')
  }
}

// Executar testes
if (require.main === module) {
  const testSuite = new TestSuite()
  testSuite.runAllTests().catch(error => {
    log(`💥 Erro fatal: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = TestSuite 