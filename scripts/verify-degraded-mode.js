const { chromium } = require('@playwright/test')
const { spawn } = require('child_process')
const http = require('http')

const EXPECTED_CAFE_NAMES = [
  'ESPRESSO',
  'B 43',
  'CARAJILLO',
  'MARQUISE AU CHOCOLAT',
  'DELICIA DE MANGA',
  'TARTE AUX POMMES',
  'ÁGUA MINERAL COM GAS',
  'ÁGUA MINERAL SEM GAS',
  'ÁGUA DE COCO',
  'REFRIGERANTE COCA-COLA TRADICIONAL',
  'REFRIGERANTE COCA-COLA ZERO',
  'REFRIGERANTE GUARANÁ TRADICIONAL',
  'REFRIGERANTE GUARANÁ ZERO',
  'SODAS ARTESANAIS',
  'LIMONADA',
  'PINK LEMONADE',
  'LARANJA MIX',
  'OLHA O MATE!',
  'PÃO DE ALHO',
  'PASTÉIS DE QUEIJO',
  'BOLINHO DE BACALHAU',
  'PASTÉIS DE PUPUNHA'
]

function waitForServer(url, timeoutMs = 30000) {
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) resolve()
        else retry()
      }).on('error', retry)
    }
    const retry = () => {
      if (Date.now() - startTime > timeoutMs) reject(new Error(`Timeout waiting for ${url}`))
      else setTimeout(check, 500)
    }
    check()
  })
}

async function verifyDegradedMode() {
  console.log('🚀 Iniciando servidor Next.js de produção em porta dedicada 3098...')
  const server = spawn('npx', ['next', 'start', '-p', '3098'], {
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3098' }
  })

  await waitForServer('http://localhost:3098/pt/menu', 30000)
  console.log('✅ Servidor pronto! Iniciando testes de rede e UI no Playwright...')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()

  const requests = []
  const failedRequests = []
  const directSupabaseCalls = []

  page.on('request', req => {
    const url = req.url()
    requests.push(url)
    if (url.includes('supabase.co/rest/v1/menu_items')) {
      directSupabaseCalls.push(url)
    }
  })

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('supabase.co')) {
      failedRequests.push({ url: res.url(), status: res.status() })
    }
  })

  // Test 1: Home page /pt
  console.log('📱 Testando rota /pt...')
  await page.goto('http://localhost:3098/pt', { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(500)

  // Test 2: Restaurant Menu /pt/menu
  console.log('📱 Testando rota /pt/menu...')
  await page.goto('http://localhost:3098/pt/menu', { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(500)

  // Test 3: Cafe /pt/cafe & "Ver Detalhes" modal functionality
  console.log('📱 Testando rota /pt/cafe e modal "Ver Detalhes"...')
  await page.goto('http://localhost:3098/pt/cafe', { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(500)

  // Verify "Ver Detalhes" button exists and opens modal
  console.log('  ⌛ Aguardando renderização do botão "Ver Detalhes"...')
  await page.waitForSelector('button:has-text("Ver Detalhes")', { timeout: 15000 })
  const detailButtons = await page.$$('button:has-text("Ver Detalhes")')
  if (detailButtons.length === 0) {
    console.error('❌ ERRO: Botão "Ver Detalhes" não encontrado ou está desativado no modo degradado!')
    process.exit(1)
  }

  await detailButtons[0].click()
  await page.waitForTimeout(500)
  const modalText = await page.textContent('[role="dialog"]')
  if (!modalText.includes('Consulte no local')) {
    console.error('❌ ERRO: Modal de detalhes não exibiu "Consulte no local" para o preço!')
    process.exit(1)
  }
  console.log('  ✓ Modal "Ver Detalhes" abre com sucesso em modo degradado exibindo "Consulte no local"')

  // API Verifications
  const menuApiResponse = await page.evaluate(async () => {
    const res = await fetch('/api/menu?limit=100')
    return { status: res.status, data: await res.json() }
  })

  const cafeApiResponse = await page.evaluate(async () => {
    const res = await fetch('/api/cafe/products')
    return { status: res.status, data: await res.json() }
  })

  console.log('\n================ RESULTADOS DO TESTE DE MODO DEGRADADO ================')
  console.log(`Direct browser calls to supabase.co/rest/v1/menu_items: ${directSupabaseCalls.length}`)
  console.log(`Failed HTTP requests (status >= 400): ${failedRequests.length}`)
  console.log(`Status de /api/menu?limit=100: ${menuApiResponse.status}`)
  console.log(`Itens retornados em /api/menu: ${menuApiResponse.data.count} (esperado: 70)`)
  console.log(`Status de /api/cafe/products: ${cafeApiResponse.status}`)
  console.log(`Itens retornados em /api/cafe/products: ${cafeApiResponse.data.count} (esperado: 22)`)

  // Strict Cafe Audit Check
  const returnedCafeNames = cafeApiResponse.data.data.map(p => p.name)
  const missingCafeNames = EXPECTED_CAFE_NAMES.filter(n => !returnedCafeNames.includes(n))
  const unauthorizedCafeNames = returnedCafeNames.filter(n => !EXPECTED_CAFE_NAMES.includes(n))

  if (cafeApiResponse.data.count !== 22) {
    console.error(`❌ ERRO AUDITORIA CAFÉ: Contagem incorreta (${cafeApiResponse.data.count} != 22)`)
    process.exit(1)
  }

  if (missingCafeNames.length > 0) {
    console.error('❌ ERRO AUDITORIA CAFÉ: Produtos ausentes do seed oficial:', missingCafeNames)
    process.exit(1)
  }

  if (unauthorizedCafeNames.length > 0) {
    console.error('❌ ERRO AUDITORIA CAFÉ: Produtos não autorizados detectados no fallback:', unauthorizedCafeNames)
    process.exit(1)
  }

  // Check that degraded mode does NOT falsely claim available: true
  const hasConfirmedAvailability = cafeApiResponse.data.data.some(p => p.available === true)
  if (hasConfirmedAvailability) {
    console.error('❌ ERRO AUDITORIA CAFÉ: O catálogo degradado não pode declarar available: true como disponibilidade confirmada!')
    process.exit(1)
  }

  console.log('  ✓ Validação estrita do Café: EXATAMENTE 22 produtos autorizados sem itens não oficiais')
  console.log('  ✓ Modo degradado não declara disponibilidade falsa (available: false mantido)')
  console.log('========================================================================\n')

  await browser.close()
  server.kill()

  if (directSupabaseCalls.length > 0) {
    console.error('❌ ERRO: O navegador realizou chamadas diretas ao Supabase REST API!')
    process.exit(1)
  }

  if (failedRequests.length > 0) {
    console.error('❌ ERRO: Houve requisições locais com erro HTTP 404/500!')
    process.exit(1)
  }

  console.log('🎉 TODOS OS CRITÉRIOS DO MODO DEGRADADO FORAM ATENDIDOS COM SUCESSO!')
}

verifyDegradedMode().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
