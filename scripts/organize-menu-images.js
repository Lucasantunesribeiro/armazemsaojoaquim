const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const rootDir = path.join(__dirname, '..')
const menuImagesDir = path.join(rootDir, 'public', 'images', 'menu_images')
const imagesDir = path.join(rootDir, 'public', 'images')
const thumbsDir = path.join(rootDir, 'public', 'images', 'menu', 'thumbs')
const largeDir = path.join(rootDir, 'public', 'images', 'menu', 'large')

// Ensure destination directories exist
fs.mkdirSync(thumbsDir, { recursive: true })
fs.mkdirSync(largeDir, { recursive: true })

function normalizeSlug(filename) {
  let name = filename.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '')
  // Remove width suffixes like _640w, _768w, _1024w, _1280w
  name = name.replace(/_\d+w$/i, '')
  // Replace underscores and spaces with hyphens
  name = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return name + '.webp'
}

async function processImage(sourcePath, slugName) {
  const thumbPath = path.join(thumbsDir, slugName)
  const largePath = path.join(largeDir, slugName)

  try {
    const image = sharp(sourcePath)
    const metadata = await image.metadata()

    // Generate Thumb (max width 640, quality 75)
    await image
      .clone()
      .resize(640, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath)

    // Generate Large (max width 1200, quality 80)
    await image
      .clone()
      .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(largePath)

    const origSize = fs.statSync(sourcePath).size
    const thumbSize = fs.statSync(thumbPath).size
    const largeSize = fs.statSync(largePath).size

    return { slugName, origSize, thumbSize, largeSize }
  } catch (err) {
    console.error(`Error processing ${sourcePath}:`, err.message)
    return null
  }
}

async function run() {
  console.log('🖼️ Organizing and optimizing menu images...')

  // Collect source files. Prefer PNG/JPG/WEBP main files over _640w variants
  const sources = new Map()

  const filesInMenuImages = fs.readdirSync(menuImagesDir)
  for (const file of filesInMenuImages) {
    if (file.endsWith('.placeholder') || file.endsWith('.svg') || fs.statSync(path.join(menuImagesDir, file)).isDirectory()) continue
    if (!/\.(png|jpg|jpeg|webp|avif)$/i.test(file)) continue
    
    // Skip width-suffixed files if we can process main file
    if (/_\d+w\./i.test(file)) continue

    const slug = normalizeSlug(file)
    const filePath = path.join(menuImagesDir, file)
    
    // Prefer PNG/JPG over WebP if both exist (PNG/JPG has higher original resolution)
    if (!sources.has(slug) || file.endsWith('.png') || file.endsWith('.jpg')) {
      sources.set(slug, filePath)
    }
  }

  // Also check public/images for feijoada / pratos / etc.
  const filesInImages = fs.readdirSync(imagesDir)
  for (const file of filesInImages) {
    if (file.startsWith('feijoada') || file.startsWith('pratos') || file.startsWith('aperitivos')) {
      if (!/\.(png|jpg|jpeg|webp|avif)$/i.test(file)) continue
      if (/_\d+w\./i.test(file)) continue
      const slug = normalizeSlug(file)
      const filePath = path.join(imagesDir, file)
      if (!sources.has(slug) || file.endsWith('.png') || file.endsWith('.jpg')) {
        sources.set(slug, filePath)
      }
    }
  }

  let totalOrig = 0
  let totalThumb = 0
  let totalLarge = 0
  let count = 0

  for (const [slug, sourcePath] of sources.entries()) {
    const res = await processImage(sourcePath, slug)
    if (res) {
      count++
      totalOrig += res.origSize
      totalThumb += res.thumbSize
      totalLarge += res.largeSize
      console.log(`✅ [${count}] ${slug} | Orig: ${(res.origSize / 1024).toFixed(1)}KB -> Thumb: ${(res.thumbSize / 1024).toFixed(1)}KB, Large: ${(res.largeSize / 1024).toFixed(1)}KB`)
    }
  }

  console.log('\n================ RESULTADOS DE OTIMIZAÇÃO ================')
  console.log(`Total de imagens processadas: ${count}`)
  console.log(`Tamanho acumulado dos originais: ${(totalOrig / (1024 * 1024)).toFixed(2)} MB`)
  console.log(`Tamanho total novo (thumbs): ${(totalThumb / (1024 * 1024)).toFixed(2)} MB`)
  console.log(`Tamanho total novo (large): ${(totalLarge / (1024 * 1024)).toFixed(2)} MB`)
  const reductionThumb = ((1 - totalThumb / totalOrig) * 100).toFixed(1)
  const reductionLarge = ((1 - totalLarge / totalOrig) * 100).toFixed(1)
  console.log(`Redução das miniaturas: ${reductionThumb}%`)
  console.log(`Redução das ampliadas: ${reductionLarge}%`)
  console.log('=========================================================\n')
}

run()
