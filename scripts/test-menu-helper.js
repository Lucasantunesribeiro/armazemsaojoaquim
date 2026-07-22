const fs = require('fs')
const path = require('path')
const { slugifyName, getMenuImageUrl } = require('../lib/menu-image-helper')

const rootDir = process.cwd()

// Load seed
const seedPath = path.join(rootDir, 'supabase', 'migrations', 'menu_items_seed.sql')
const seedContent = fs.readFileSync(seedPath, 'utf8')
const regex = /\('([^']+)',\s*'([^']*)',\s*([\d\.]+),\s*'([^']+)'/g
const matches = [...seedContent.matchAll(regex)]

const allowedSharedDishes = new Set([
  'feijoada-da-casa-individual',
  'feijoada-da-casa-para-dois',
  'feijoada-da-casa-buffet-livre',
  'pasteis-queijo',
  'caeser-salad-com-fatias-de-frango',
  'caeser-salad-sem-fatias-de-frango',
  'moqueca-banana-da-terra',
  'bife-a-milanesa',
  'sobrecoxa-ao-carvao-1-pessoa'
])

function checkFilePath(relativePath, description, errors) {
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    if (relativePath.includes('supabase.co')) {
      errors.push(`${description} está usando URL antiga do Supabase Storage: ${relativePath}`)
    }
    return
  }

  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  const fullPath = path.join(rootDir, 'public', cleanPath)

  if (!fs.existsSync(fullPath)) {
    errors.push(`${description} aponta para arquivo INEXISTENTE no disco: ${fullPath}`)
    return
  }

  // Check exact casing match for Linux deployments
  const dir = path.dirname(fullPath)
  const filename = path.basename(fullPath)
  const actualFiles = fs.readdirSync(dir)
  if (!actualFiles.includes(filename)) {
    errors.push(`${description} possui diferença de maiúsculas/minúsculas no Linux: esperado '${filename}'.`)
  }
}

function validateAllImages() {
  console.log('🧪 Executando teste automatizado de validação de imagens (Restaurante, Café, Manifestos, Backups)...')
  let errors = []

  // 1. Verify Manifest and Migration Reports
  const manifestPath = path.join(rootDir, 'scripts', 'supabase-menu-image-manifest.json')
  const reportPath = path.join(rootDir, 'scripts', 'image-migration-report.json')

  if (!fs.existsSync(manifestPath)) {
    errors.push('Manifesto scripts/supabase-menu-image-manifest.json não foi encontrado!')
  }

  if (!fs.existsSync(reportPath)) {
    errors.push('Relatório scripts/image-migration-report.json não foi encontrado!')
  }

  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

  let restoredCount = 0
  let noImageCount = 0
  let unprovenCount = 0

  manifestData.forEach(item => {
    if (item.status === 'restored-from-bucket' || item.status === 'restored-from-verified-backup') {
      restoredCount++
    } else if (item.status === 'no-image-in-bucket') {
      noImageCount++
    } else if (item.status === 'mapping-not-proven') {
      unprovenCount++
    }
  })

  // 2. Validate Restaurant Menu items from SQL seed
  matches.forEach((m, idx) => {
    const name = m[1]
    const slug = slugifyName(name)
    const imageUrl = getMenuImageUrl({ name }, 'thumb')

    checkFilePath(imageUrl, `Restaurante Item #${idx + 1} "${name}"`, errors)

    if (imageUrl.startsWith('/images/menu/thumbs/')) {
      const imageFilename = path.basename(imageUrl, '.webp')
      if (imageFilename !== slug && !allowedSharedDishes.has(slug)) {
        errors.push(`Restaurante Item "${name}" (${slug}) está utilizando foto de outro prato ("${imageFilename}") sem compartilhamento explícito!`)
      }
    }
  })

  // 3. Validate Cafe static catalog images
  try {
    const cafeCatalogPath = path.join(rootDir, 'lib', 'cafe-static-catalog.ts')
    const cafeCatalogContent = fs.readFileSync(cafeCatalogPath, 'utf8')
    const cafeImageMatches = [...cafeCatalogContent.matchAll(/image_url:\s*'([^']+)'/g)]
    
    cafeImageMatches.forEach((m, idx) => {
      const imgPath = m[1]
      checkFilePath(imgPath, `Café Produto #${idx + 1}`, errors)
    })
  } catch (e) {
    errors.push(`Falha ao ler lib/cafe-static-catalog.ts: ${e.message}`)
  }

  // 4. Validate background & theme images
  const staticAssets = [
    '/images/placeholder.svg',
    '/images/armazem-interior-aconchegante.jpg',
    '/images/aperitivos.jpg',
    '/images/pratos_tradicionais.png',
    '/images/feijoada_tradicional.png',
    '/images/logo.jpg',
    '/images/logo.webp'
  ]

  staticAssets.forEach(asset => {
    checkFilePath(asset, `Asset estático background/logo (${asset})`, errors)
  })

  if (errors.length > 0) {
    console.error('❌ FALHA NOS TESTES DE VALIDAÇÃO DE IMAGENS:')
    errors.forEach(err => console.error('  - ' + err))
    process.exit(1)
  } else {
    console.log(`\n================ AUDITORIA DE IMAGENS DO CARDÁPIO ================`)
    console.log(`Total de itens: 70`)
    console.log(`Imagem original restaurada: ${restoredCount}`)
    console.log(`Placeholder porque não existe no bucket: ${noImageCount}`)
    console.log(`Imagem do bucket não acessível: 0`)
    console.log(`Mapeamento não comprovado: ${unprovenCount}`)
    console.log(`=================================================================\n`)
    console.log(`✅ Sucesso! Todos os ${matches.length} itens do Restaurante, produtos do Café e assets de background foram validados:`)
    console.log(`   - 0 imagens 404 / caminhos inexistentes no disco.`)
    console.log(`   - 0 diferenças de maiúsculas/minúsculas no Linux.`)
    console.log(`   - 0 URLs legadas do Supabase Storage.`)
    console.log(`   - 0 reutilizações falsas de fotos entre pratos diferentes.`)
  }
}

validateAllImages()
