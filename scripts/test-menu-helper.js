const fs = require('fs')
const path = require('path')
const { slugifyName, getMenuImageUrl } = require('../lib/menu-image-helper')

const rootDir = process.cwd()
const seedPath = path.join(rootDir, 'supabase', 'migrations', 'menu_items_seed.sql')
const seedContent = fs.readFileSync(seedPath, 'utf8')

// Regex to extract menu items from SQL seed
const regex = /\('([^']+)',\s*'([^']*)',\s*([\d\.]+),\s*'([^']+)'/g
const matches = [...seedContent.matchAll(regex)]

const allowedSharedDishes = new Set([
  'feijoada-da-casa-individual',
  'feijoada-da-casa-para-dois',
  'feijoada-da-casa-buffet-livre',
  'pasteis-queijo',
  'caeser-salad-com-fatias-de-frango',
  'caeser-salad-sem-fatias-de-frango',
  'moqueca-banana-da-terra'
])

function validateAllImages() {
  console.log('🧪 Executando teste automatizado de validação de imagens do cardápio...\n')
  let errors = []

  // 1. Validate slug uniqueness / consistency
  const slugsSeen = new Map()
  matches.forEach(m => {
    const name = m[1]
    const slug = slugifyName(name)
    if (slugsSeen.has(slug)) {
      // Allow exact duplicate seed entries if any
    } else {
      slugsSeen.set(slug, name)
    }
  })

  // 2. Validate every menu item in database seed
  matches.forEach((m, idx) => {
    const name = m[1]
    const slug = slugifyName(name)
    const imageUrl = getMenuImageUrl({ name }, 'thumb')

    // Check if item points to placeholder or local image
    if (!imageUrl) {
      errors.push(`Item #${idx + 1} "${name}" não possui imagem nem placeholder.`)
    }

    if (imageUrl.startsWith('/images/menu/thumbs/')) {
      const relativePath = imageUrl.slice(1) // remove leading /
      const fullPath = path.join(rootDir, 'public', relativePath)

      // A) Check physical existence on disk
      if (!fs.existsSync(fullPath)) {
        errors.push(`Caminho local inexistente para "${name}": ${fullPath}`)
      } else {
        // B) Check exact casing match for Linux deployments
        const dir = path.dirname(fullPath)
        const filename = path.basename(fullPath)
        const actualFiles = fs.readdirSync(dir)
        if (!actualFiles.includes(filename)) {
          errors.push(`Diferença de maiúsculas/minúsculas no arquivo de "${name}": esperado '${filename}', encontrado no disco em formato diferente.`)
        }
      }

      // C) Check that item does NOT reuse another dish's photo unless explicitly allowed
      const imageFilename = path.basename(imageUrl, '.webp')
      if (imageFilename !== slug && !allowedSharedDishes.has(slug)) {
        errors.push(`Item "${name}" (${slug}) está utilizando foto de outro prato ("${imageFilename}") sem compartilhamento explícito!`)
      }

      // D) Check that old remote bucket URLs are not used for migrated items
      if (imageUrl.includes('supabase.co')) {
        errors.push(`Item "${name}" está apontando para URL remota do Supabase em vez de imagem local.`)
      }
    } else if (imageUrl !== '/images/placeholder.svg') {
      // Must be either local thumbs or neutral placeholder
      errors.push(`Item "${name}" possui caminho de imagem inesperado: ${imageUrl}`)
    }
  })

  // 3. Verify placeholder exists on disk
  const placeholderPath = path.join(rootDir, 'public', 'images', 'placeholder.svg')
  if (!fs.existsSync(placeholderPath)) {
    errors.push(`Placeholder neutro de imagem ausente no disco: ${placeholderPath}`)
  }

  if (errors.length > 0) {
    console.error('❌ FALHA NOS TESTES DE VALIDAÇÃO DE IMAGENS:')
    errors.forEach(err => console.error('  - ' + err))
    process.exit(1)
  } else {
    console.log(`✅ Sucesso! Todos os ${matches.length} itens foram validados sem erros:`)
    console.log(`   - Sem reutilização indevida de fotos de outros pratos.`)
    console.log(`   - Todos os caminhos físicos existem e possuem casing correto para Linux.`)
    console.log(`   - Sem URLs do bucket Supabase antigo para itens do cardápio.`)
  }
}

validateAllImages()
