#!/usr/bin/env node

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

// Configurações de otimização
const OPTIMIZATION_CONFIG = {
  webp: {
    quality: 85,
    effort: 6,
    lossless: false
  },
  avif: {
    quality: 80,
    effort: 9,
    lossless: false
  },
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true
  },
  png: {
    quality: 90,
    compressionLevel: 9,
    progressive: true
  }
}

// Extensões suportadas
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// Função para obter todos os arquivos de imagem recursivamente
async function getImageFiles(dir, fileList = []) {
  const files = await readdir(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const fileStat = await stat(filePath)
    
    if (fileStat.isDirectory()) {
      // Pular node_modules e .next
      if (!['node_modules', '.next', 'out', '.git'].includes(file)) {
        await getImageFiles(filePath, fileList)
      }
    } else {
      const ext = path.extname(file).toLowerCase()
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        fileList.push(filePath)
      }
    }
  }
  
  return fileList
}

// Função para otimizar uma imagem
async function optimizeImage(inputPath) {
  const dir = path.dirname(inputPath)
  const name = path.parse(inputPath).name
  const ext = path.extname(inputPath).toLowerCase()
  
  console.log(`🖼️  Otimizando: ${inputPath}`)
  
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    
    console.log(`   📏 Dimensões: ${metadata.width}x${metadata.height}`)
    console.log(`   📦 Tamanho original: ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB`)
    
    // Gerar versões otimizadas
    const promises = []
    
    // WebP
    const webpPath = path.join(dir, `${name}.webp`)
    if (!fs.existsSync(webpPath)) {
      promises.push(
        image
          .clone()
          .webp(OPTIMIZATION_CONFIG.webp)
          .toFile(webpPath)
          .then(() => {
            const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1)
            console.log(`   ✅ WebP criado: ${webpSize} KB`)
          })
      )
    }
    
    // AVIF
    const avifPath = path.join(dir, `${name}.avif`)
    if (!fs.existsSync(avifPath)) {
      promises.push(
        image
          .clone()
          .avif(OPTIMIZATION_CONFIG.avif)
          .toFile(avifPath)
          .then(() => {
            const avifSize = (fs.statSync(avifPath).size / 1024).toFixed(1)
            console.log(`   ✅ AVIF criado: ${avifSize} KB`)
          })
      )
    }
    
    // Otimizar original se necessário
    if (ext === '.jpg' || ext === '.jpeg') {
      const optimizedPath = path.join(dir, `${name}_optimized${ext}`)
      promises.push(
        image
          .clone()
          .jpeg(OPTIMIZATION_CONFIG.jpeg)
          .toFile(optimizedPath)
          .then(() => {
            const originalSize = fs.statSync(inputPath).size
            const optimizedSize = fs.statSync(optimizedPath).size
            
            if (optimizedSize < originalSize) {
              fs.renameSync(optimizedPath, inputPath)
              console.log(`   ✅ JPEG otimizado: ${(optimizedSize / 1024).toFixed(1)} KB`)
            } else {
              fs.unlinkSync(optimizedPath)
              console.log(`   ℹ️  JPEG já otimizado`)
            }
          })
      )
    } else if (ext === '.png') {
      const optimizedPath = path.join(dir, `${name}_optimized${ext}`)
      promises.push(
        image
          .clone()
          .png(OPTIMIZATION_CONFIG.png)
          .toFile(optimizedPath)
          .then(() => {
            const originalSize = fs.statSync(inputPath).size
            const optimizedSize = fs.statSync(optimizedPath).size
            
            if (optimizedSize < originalSize) {
              fs.renameSync(optimizedPath, inputPath)
              console.log(`   ✅ PNG otimizado: ${(optimizedSize / 1024).toFixed(1)} KB`)
            } else {
              fs.unlinkSync(optimizedPath)
              console.log(`   ℹ️  PNG já otimizado`)
            }
          })
      )
    }
    
    // Gerar versões responsivas
    const breakpoints = [640, 768, 1024, 1280, 1920]
    for (const width of breakpoints) {
      if (metadata.width && metadata.width > width) {
        const responsivePath = path.join(dir, `${name}_${width}w.webp`)
        if (!fs.existsSync(responsivePath)) {
          promises.push(
            image
              .clone()
              .resize(width, null, { withoutEnlargement: true })
              .webp(OPTIMIZATION_CONFIG.webp)
              .toFile(responsivePath)
              .then(() => {
                console.log(`   📱 Responsivo ${width}w criado`)
              })
          )
        }
      }
    }
    
    await Promise.all(promises)
    console.log(`   ✨ Concluído!\n`)
    
  } catch (error) {
    console.error(`   ❌ Erro ao otimizar ${inputPath}:`, error.message)
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando otimização de imagens...\n')
  
  const publicDir = path.join(process.cwd(), 'public')
  
  if (!fs.existsSync(publicDir)) {
    console.error('❌ Diretório public/ não encontrado')
    process.exit(1)
  }
  
  try {
    const imageFiles = await getImageFiles(publicDir)
    
    if (imageFiles.length === 0) {
      console.log('ℹ️  Nenhuma imagem encontrada para otimizar')
      return
    }
    
    console.log(`📊 Encontradas ${imageFiles.length} imagens para otimizar\n`)
    
    for (const imagePath of imageFiles) {
      await optimizeImage(imagePath)
    }
    
    console.log('🎉 Otimização concluída!')
    
  } catch (error) {
    console.error('❌ Erro durante a otimização:', error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { optimizeImage, getImageFiles } 