const fs = require('fs')
const path = require('path')

// Função para copiar recursivamente um diretório
function copyDir(src, dest) {
  // Criar diretório de destino se não existir
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  // Ler conteúdo do diretório fonte
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      // Recursivamente copiar subdiretórios
      copyDir(srcPath, destPath)
    } else {
      // Copiar arquivo
      fs.copyFileSync(srcPath, destPath)
      console.log(`Copiado: ${srcPath} -> ${destPath}`)
    }
  }
}

// Função para garantir que um diretório existe
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyStaticAssets() {
  try {
    console.log('🚀 Iniciando cópia de assets estáticos...')

    const publicDir = path.join(process.cwd(), 'public')
    const outDir = path.join(process.cwd(), 'out')
    
    // Garantir que o diretório de output existe
    ensureDir(outDir)

    // Verificar se o diretório public existe
    if (!fs.existsSync(publicDir)) {
      console.error('❌ Diretório public não encontrado!')
      process.exit(1)
    }

    // Copiar todo o conteúdo de public para out
    console.log('📁 Copiando arquivos de public/ para out/...')
    
    const publicEntries = fs.readdirSync(publicDir, { withFileTypes: true })
    
    for (const entry of publicEntries) {
      const srcPath = path.join(publicDir, entry.name)
      const destPath = path.join(outDir, entry.name)

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
        console.log(`Copiado: ${srcPath} -> ${destPath}`)
      }
    }

    // Verificar especificamente se as imagens foram copiadas
    const imagesDir = path.join(outDir, 'images')
    if (fs.existsSync(imagesDir)) {
      const imageCount = fs.readdirSync(imagesDir, { recursive: true }).length
      console.log(`✅ ${imageCount} arquivos de imagem copiados com sucesso!`)
    } else {
      console.warn('⚠️ Diretório de imagens não encontrado no output')
    }

    console.log('✅ Cópia de assets concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao copiar assets estáticos:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  copyStaticAssets()
}

module.exports = { copyStaticAssets } 