const { chromium } = require('@playwright/test')
const { spawn } = require('child_process')
const http = require('http')

function waitForServer(url, timeoutMs = 30000) {
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode < 500) {
          resolve()
        } else {
          retry()
        }
      }).on('error', () => {
        retry()
      })
    }

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${url}`))
      } else {
        setTimeout(check, 500)
      }
    }

    check()
  })
}

async function runNetworkAudit() {
  console.log('🚀 Starting Next.js production server on port 3099...')
  const devServer = spawn('npx', ['next', 'start', '-p', '3099'], {
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3099' }
  })

  await waitForServer('http://localhost:3099/pt/menu', 40000)
  console.log('✅ Server is ready! Launching headless Chromium...')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()

  const requests = []
  const consoleErrors = []

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  page.on('request', req => {
    requests.push({
      url: req.url(),
      resourceType: req.resourceType(),
      method: req.method()
    })
  })

  const responses = []
  page.on('response', async res => {
    try {
      const buffer = await res.buffer().catch(() => Buffer.from(''))
      responses.push({
        url: res.url(),
        status: res.status(),
        size: buffer.length,
        contentType: res.headers()['content-type'] || ''
      })
    } catch {}
  })

  console.log('📱 Navigating to http://localhost:3099/pt/menu...')
  await page.goto('http://localhost:3099/pt/menu', { waitUntil: 'networkidle' })

  // Wait 2 seconds for any delayed requests
  await page.waitForTimeout(2000)

  // Analyze initial network requests
  const imageRequests = requests.filter(r => r.resourceType === 'image')
  const localImages = imageRequests.filter(r => !r.url.includes('supabase.co'))
  const supabaseImages = imageRequests.filter(r => r.url.includes('supabase.co'))
  
  const menuItemsRequests = requests.filter(r => r.url.includes('menu_items') || r.url.includes('/api/menu'))
  const pousadaRoomsRequests = requests.filter(r => r.url.includes('pousada_rooms') || r.url.includes('/api/pousada/rooms'))

  let totalImageBytes = 0
  responses.forEach(res => {
    if (res.contentType.includes('image') || res.url.match(/\.(webp|jpg|jpeg|png|svg)/i)) {
      totalImageBytes += res.size
    }
  })

  console.log('\n================ AUDITORIA DE REDE REAL ================')
  console.log(`Total de requisições de imagem no carregamento inicial: ${imageRequests.length}`)
  console.log(`Imagens locais carregadas: ${localImages.length}`)
  console.log(`Imagens do Supabase Storage: ${supabaseImages.length}`)
  console.log(`Bytes transferidos por imagens: ${totalImageBytes} bytes (${(totalImageBytes / 1024).toFixed(2)} KB)`)
  console.log('\nNomes das imagens carregadas:')
  imageRequests.forEach(r => console.log(' - ' + r.url))
  console.log(`\nRequisições a menu_items: ${menuItemsRequests.length}`)
  console.log(`Requisições a pousada_rooms: ${pousadaRoomsRequests.length}`)
  console.log(`Erros no console: ${consoleErrors.length}`)
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => console.log(' ❌ ' + err))
  }

  // Scroll to bottom to test lazy loading
  console.log('\n📜 Scrolling to bottom of page to test progressive lazy loading...')
  const initialImageCount = imageRequests.length
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0
      const distance = 300
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance
        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })

  await page.waitForTimeout(2000)

  const finalImageRequests = requests.filter(r => r.resourceType === 'image')
  console.log(`Total de requisições de imagem após rolagem completa: ${finalImageRequests.length}`)
  console.log(`Imagens adicionais baixadas sob demanda (lazy loading): ${finalImageRequests.length - initialImageCount}`)
  console.log('=======================================================\n')

  await browser.close()
  devServer.kill()
}

runNetworkAudit().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})
