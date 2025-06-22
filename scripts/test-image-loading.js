const https = require('https')
const http = require('http')
const { URL } = require('url')

const testUrls = [
  'http://localhost:3001/images/placeholder.svg',
  'http://localhost:3001/images/menu_images/ceviche_carioca.svg',
  'http://localhost:3001/images/menu_images/farofa.svg',
  'http://localhost:3001/images/menu_images/bife_a_milanesa.svg',
  'https://tgzgqtxrjvlgfgxhgwzw.supabase.co/storage/v1/object/public/menu-images/caprese_mineira.png',
  'https://tgzgqtxrjvlgfgxhgwzw.supabase.co/storage/v1/object/public/menu-images/ceviche_carioca.png'
]

function testUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      const client = urlObj.protocol === 'https:' ? https : http
      
      const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        const status = res.statusCode
        const contentType = res.headers['content-type']
        const contentLength = res.headers['content-length']
        
        resolve({
          success: status === 200,
          status,
          contentType,
          contentLength,
          error: null
        })
      })
      
      req.on('error', (error) => {
        resolve({
          success: false,
          status: null,
          contentType: null,
          contentLength: null,
          error: error.message
        })
      })
      
      req.on('timeout', () => {
        req.destroy()
        resolve({
          success: false,
          status: null,
          contentType: null,
          contentLength: null,
          error: 'Timeout'
        })
      })
      
      req.end()
    } catch (error) {
      resolve({
        success: false,
        status: null,
        contentType: null,
        contentLength: null,
        error: error.message
      })
    }
  })
}

async function testImageLoading() {
  console.log('🧪 TESTANDO CARREGAMENTO DE IMAGENS...\n')
  
  for (const url of testUrls) {
    console.log(`🔍 Testando: ${url}`)
    
    const result = await testUrl(url)
    
    if (result.success) {
      console.log(`✅ OK - ${result.status} - ${result.contentType} - ${result.contentLength} bytes`)
    } else {
      console.log(`❌ ERRO - ${result.status || 'N/A'} - ${result.error}`)
    }
    
    console.log('') // linha em branco
  }
}

// Aguardar um pouco para o servidor iniciar
setTimeout(() => {
  testImageLoading()
}, 3000) 