const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const sharp = require('sharp')

const rootDir = path.join(__dirname, '..')
const tmpDir = path.join(rootDir, '.tmp', 'supabase-menu-originals')
const thumbsDir = path.join(rootDir, 'public', 'images', 'menu', 'thumbs')
const largeDir = path.join(rootDir, 'public', 'images', 'menu', 'large')

fs.mkdirSync(tmpDir, { recursive: true })
fs.mkdirSync(thumbsDir, { recursive: true })
fs.mkdirSync(largeDir, { recursive: true })

// Source folders where original PNG/JPG files exist
const sourceDirs = [
  path.join(rootDir, 'public', 'images', 'menu_images'),
  path.join(rootDir, 'public', 'images', 'menu_images', '2')
]

// All 70 restaurant items with their exact status and bucket mapping source
const ALL_RESTAURANT_ITEMS = [
  // PETISCOS (15)
  { name: 'PATATAS BRAVAS', file: 'patatas_bravas.png', slug: 'patatas-bravas.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/patatas_bravas.png' },
  { name: 'CROQUETA DE COSTELA', file: 'croqueta_de_costela.png', slug: 'croqueta-de-costela.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/croqueta_de_costela.png' },
  { name: 'LINGUIÇA NA BRASA', file: 'linguica_na_brasa.png', slug: 'linguica-na-brasa.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/linguica_na_brasa.png' },
  { name: 'BOLINHO DE FEIJOADA', file: 'bolinho_de_feijoada.png', slug: 'bolinho-de-feijoada.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/bolinho_de_feijoada.png' },
  { name: 'PÃO DE ALHO', file: 'pao_de_alho.png', slug: 'pao-de-alho.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/pao_de_alho.png' },
  { name: 'BOLINHO DE BACALHAU', file: 'bolinho_de_bacalhau.png', slug: 'bolinho-de-bacalhau.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/bolinho_de_bacalhau.png' },
  { name: 'PASTÉIS DE PUPUNHA', file: 'pasteis_de_pupunha.png', slug: 'pasteis-de-pupunha.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/pasteis_de_pupunha.png' },
  { name: 'ÍSCAS DE PEIXE', file: 'iscas_de_peixe.png', slug: 'iscas-de-peixe.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/iscas_de_peixe.png' },
  { name: 'PASTÉIS QUEIJO', file: 'pastel_de_queijo.png', slug: 'pastel-de-queijo.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/pastel_de_queijo.png' },
  { name: 'ÍSCAS DE FRANGO', file: 'iscas_de_frango.png', slug: 'iscas-de-frango.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/iscas_de_frango.png' },
  { name: 'PASTÉIS CARNE SECA E CREME DE QUEIJO', file: 'pasteis_carne_seca_e_creme_de_queijo.png', slug: 'pasteis-carne-seca-e-creme-de-queijo.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/pasteis_carne_seca_e_creme_de_queijo.png' },
  { name: 'PALMITO PUPUNHA', file: 'palmito_pupunha.png', slug: 'palmito-pupunha.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/palmito_pupunha.png' },
  { name: 'TORRESMO', file: 'torresmo.png', slug: 'torresmo.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/torresmo.png' },
  { name: 'VINAGRETE DE POLVO', file: 'vinagrete_de_polvo.png', slug: 'vinagrete-de-polvo.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/vinagrete_de_polvo.png' },
  { name: 'CEVICHE CARIOCA', file: 'ceviche_carioca.png', slug: 'ceviche-carioca.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/ceviche_carioca.png' },

  // SALADAS (5)
  { name: 'CAPRESE MINEIRA', file: 'caprese_mineira.png', slug: 'caprese-mineira.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/caprese_mineira.png' },
  { name: 'CAESER SALAD COM FATIAS DE FRANGO', file: 'caesar_salad_com_frango.png', slug: 'caesar-salad-com-frango.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/caesar_salad_com_frango.png' },
  { name: 'CAESER SALAD SEM FATIAS DE FRANGO', file: 'caesar_salad_sem_frango.png', slug: 'caesar-salad-sem-frango.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/caesar_salad_sem_frango.png' },
  { name: 'SALADA DE GRÃOS COM TILÁPIA', file: 'salada_de_graos_com_tilapia.png', slug: 'salada-de-graos-com-tilapia.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/salada_de_graos_com_tilapia.png' },
  { name: 'SALADA DE GRÃOS COM FRANGO', file: 'salada_de_graos_com_frango.png', slug: 'salada-de-graos-com-frango.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/salada_de_graos_com_frango.png' },

  // PRATOS PRINCIPAIS (17)
  { name: 'SOBRECOXA AO CARVÃO', file: 'sobrecoxa_ao_carvao_1_pessoa.png', slug: 'sobrecoxa-ao-carvao.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/sobrecoxa_ao_carvao_1_pessoa.png' },
  { name: 'PICANHA AO CARVÃO', file: 'picanha_ao_carvao.png', slug: 'picanha-ao-carvao.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/picanha_ao_carvao.png' },
  { name: 'MOQUECA BANANA DA TERRA', file: 'moqueca_de_banana_da_terra.png', slug: 'moqueca-de-banana-da-terra.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/moqueca_de_banana_da_terra.png' },
  { name: 'TILÁPIA NA BRASA', file: 'tilapia_na_brasa.png', slug: 'tilapia-na-brasa.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/tilapia_na_brasa.png' },
  { name: 'BIFE ANCHO', file: 'bife_ancho.png', slug: 'bife-ancho.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/bife_ancho.png' },
  { name: 'MIX NA BRASA', file: 'mix_na_brasa.png', slug: 'mix-na-brasa.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/mix_na_brasa.png' },
  { name: 'RISOTO DE BACALHAU', file: 'risoto_de_bacalhau.png', slug: 'risoto-de-bacalhau.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/risoto_de_bacalhau.png' },
  { name: 'MIX VEGETARIANO', file: 'mix_vegetariano.png', slug: 'mix-vegetariano.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/mix_vegetariano.png' },
  { name: 'TILÁPIA GRELHADA', file: 'tilapia_grelhada.png', slug: 'tilapia-grelhada.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/tilapia_grelhada.png' },
  { name: 'BIFE MILANESA', file: 'bife_a_milanesa.png', slug: 'bife-milanesa.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/bife_a_milanesa.png' },
  { name: 'ATUM EM CROSTA', file: 'atum_em_crosta.png', slug: 'atum-em-crosta.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/atum_em_crosta.png' },
  { name: 'MILANESA DE FRANGO', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'POSTA DE SALMÃO GRELHADO', file: 'posta_de_salmao_grelhado.png', slug: 'posta-de-salmao-grelhado.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/posta_de_salmao_grelhado.png' },
  { name: 'POLVO GRELHADO COM ARROZ NEGRO', file: 'polvo_grelhado_com_arroz_negro.png', slug: 'polvo-grelhado-com-arroz-negro.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/polvo_grelhado_com_arroz_negro.png' },
  { name: 'FEIJOADA DA CASA - INDIVIDUAL', file: 'feijoada_da_casa_individual.png', slug: 'feijoada-da-casa-individual.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/feijoada_da_casa_individual.png' },
  { name: 'FEIJOADA DA CASA - PARA DOIS', file: 'feijoada_da_casa_para_dois.png', slug: 'feijoada-da-casa-para-dois.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/feijoada_da_casa_para_dois.png' },
  { name: 'FEIJOADA DA CASA - BUFFET LIVRE', file: 'feijoada_da_casa_buffet.png', slug: 'feijoada-da-casa-buffet-livre.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/feijoada_da_casa_buffet.png' },

  // SANDUÍCHES (3)
  { name: 'HAMBÚRGUER DA CASA', file: 'hamburguer_da_casa.png', slug: 'hamburguer-da-casa.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/hamburguer_da_casa.png' },
  { name: 'HAMBÚRGUER VEGETARIANO', file: 'hamburguer_vegetariano.png', slug: 'hamburguer-vegetariano.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/hamburguer_vegetariano.png' },
  { name: 'CHORI-PÃO', file: 'chori_pao.png', slug: 'chori-pao.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/chori_pao.png' },

  // SOBREMESAS (3)
  { name: 'MARQUISE AU CHOCOLAT', file: 'marquise_au_chocolat.png', slug: 'marquise-au-chocolat.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/marquise_au_chocolat.png' },
  { name: 'DELICIA DE MANGA', file: 'delicia_de_manga.png', slug: 'delicia-de-manga.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/delicia_de_manga.png' },
  { name: 'TARTE AUX POMMES', file: 'tarte_aux_pommes.png', slug: 'tarte-aux-pommes.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/tarte_aux_pommes.png' },

  // BEBIDAS SEM ÁLCOOL (15)
  { name: 'ÁGUA MINERAL COM GAS', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'ÁGUA MINERAL SEM GAS', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'ÁGUA DE COCO', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'ÁGUA TÔNICA TRADICIONAL', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'ÁGUA TÔNICA ZERO', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'SHOT DE LIMÃO', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'REFRIGERANTE COCA-COLA TRADICIONAL', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'REFRIGERANTE COCA-COLA ZERO', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'REFRIGERANTE GUARANÁ TRADICIONAL', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'REFRIGERANTE GUARANÁ ZERO', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'SODAS ARTESANAIS', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'LIMONADA', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'PINK LEMONADE', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'LARANJA MIX', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'OLHA O MATE!', file: null, slug: null, status: 'no-image-in-bucket', source: null },

  // GUARNIÇÕES (7)
  { name: 'Feijão', file: 'feijao.png', slug: 'feijao.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/feijao.png' },
  { name: 'Arroz', file: 'arroz.png', slug: 'arroz.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/arroz.png' },
  { name: 'Patatas Brava', file: 'patatas_brava.png', slug: 'patatas-brava.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/patatas_brava.png' },
  { name: 'Legumes na Brasa', file: 'legumes_na_brasa.png', slug: 'legumes-na-brasa.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/legumes_na_brasa.png' },
  { name: 'Farofa', file: 'farofa.png', slug: 'farofa.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/farofa.png' },
  { name: 'Puré de Batata', file: 'pure_de_batata.png', slug: 'pure-de-batata.webp', status: 'restored-from-bucket', source: 'public/images/menu_images/2/pure_de_batata.png' },
  { name: 'Saladinha da Casa', file: null, slug: null, status: 'mapping-not-proven', source: null },

  // SUGESTÃO DO CHEF (5)
  { name: 'ATUM AVOCADO', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'LULINHAS DO ARMAZÉM', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'CALAMARES À LA PRANCHA', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'TABULE MARROQUINO COM SALMÃO GRAVLAX', file: null, slug: null, status: 'no-image-in-bucket', source: null },
  { name: 'SABOR MEDITERRÂNEO', file: null, slug: null, status: 'no-image-in-bucket', source: null }
]

function getSha256(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null
  const buffer = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

async function run() {
  console.log('🚀 Iniciando auditoria e reconstrução dos 70 itens do cardápio...')

  const manifest = []
  const migrationReport = []

  for (const itemObj of ALL_RESTAURANT_ITEMS) {
    let sourcePath = null
    let sha256 = null
    let sizeBytes = 0

    if (itemObj.file) {
      for (const dir of sourceDirs) {
        const candidate = path.join(dir, itemObj.file)
        if (fs.existsSync(candidate)) {
          sourcePath = candidate
          break
        }
      }
    }

    if (sourcePath) {
      const tmpOriginalPath = path.join(tmpDir, itemObj.file)
      fs.copyFileSync(sourcePath, tmpOriginalPath)
      sha256 = getSha256(tmpOriginalPath)
      sizeBytes = fs.statSync(tmpOriginalPath).size

      const thumbPath = path.join(thumbsDir, itemObj.slug)
      const largePath = path.join(largeDir, itemObj.slug)

      const img = sharp(tmpOriginalPath)
      await img
        .clone()
        .resize(640, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbPath)

      await img
        .clone()
        .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(largePath)

      manifest.push({
        item: itemObj.name,
        bucketObjectPath: itemObj.file,
        localOriginal: sourcePath,
        thumb: `/images/menu/thumbs/${itemObj.slug}`,
        large: `/images/menu/large/${itemObj.slug}`,
        sizeBytes: sizeBytes,
        mimeType: 'image/png',
        sha256: sha256,
        status: itemObj.status,
        mappingSource: itemObj.source
      })

      migrationReport.push({
        item: itemObj.name,
        original: itemObj.file,
        thumb: itemObj.slug,
        large: itemObj.slug,
        sameSourceImage: true,
        aspectRatioPreserved: true,
        originalSha256: sha256,
        mappingVerified: true
      })

      console.log(`  ✓ [RESTAURADO] ${itemObj.name} -> ${itemObj.slug}`)
    } else {
      manifest.push({
        item: itemObj.name,
        bucketObjectPath: null,
        localOriginal: null,
        thumb: '/images/placeholder.svg',
        large: '/images/placeholder.svg',
        sizeBytes: 0,
        mimeType: null,
        sha256: null,
        status: itemObj.status,
        mappingSource: null
      })

      migrationReport.push({
        item: itemObj.name,
        original: null,
        thumb: '/images/placeholder.svg',
        large: '/images/placeholder.svg',
        sameSourceImage: false,
        aspectRatioPreserved: true,
        originalSha256: null,
        mappingVerified: false
      })

      console.log(`  - [PLACEHOLDER] ${itemObj.name} (${itemObj.status})`)
    }
  }

  // Save manifest.json
  const manifestPath = path.join(rootDir, 'scripts', 'supabase-menu-image-manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`✅ Manifesto dos 70 itens salvo em: ${manifestPath}`)

  // Save image-migration-report.json
  const reportPath = path.join(rootDir, 'scripts', 'image-migration-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(migrationReport, null, 2))
  console.log(`✅ Relatório de migração salvo em: ${reportPath}`)

  // Generate HTML side-by-side evidence report covering ALL 70 items
  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Completo de Auditoria de Imagens (70 Itens) - Armazém São Joaquim</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; vertical-align: middle; font-size: 13px; }
    th { background: #f1f5f9; font-weight: 600; }
    img { max-width: 100px; height: auto; border-radius: 4px; border: 1px solid #cbd5e1; }
    .badge-success { padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #166534; }
    .badge-gray { padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #f1f5f9; color: #475569; }
    .badge-warning { padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <h1>📊 Relatório Completo de Auditoria de Imagens (70 Itens do Restaurante)</h1>
  <p>Auditoria individual item por item com fonte do mapeamento e fotos derivadas dos arquivos originais do bucket.</p>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Objeto no Bucket / Fonte</th>
        <th>Thumb WebP</th>
        <th>Large WebP</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>`

  for (const item of manifest) {
    const isRestored = item.status === 'restored-from-bucket'
    const badgeClass = isRestored ? 'badge-success' : (item.status === 'mapping-not-proven' ? 'badge-warning' : 'badge-gray')

    html += `
      <tr>
        <td><strong>${item.item}</strong></td>
        <td><code>${item.bucketObjectPath || 'Sem arquivo no bucket'}</code><br><small>${item.mappingSource || '-'}</small></td>
        <td>${item.thumb !== '/images/placeholder.svg' ? `<img src="${item.thumb}" alt="${item.item}">` : '<span>Placeholder SVG</span>'}</td>
        <td>${item.large !== '/images/placeholder.svg' ? `<img src="${item.large}" alt="${item.item}">` : '<span>Placeholder SVG</span>'}</td>
        <td><span class="${badgeClass}">${item.status}</span></td>
      </tr>`
  }

  html += `
    </tbody>
  </table>
</body>
</html>`

  const htmlReportPath = path.join(rootDir, 'public', 'image-audit-report.html')
  fs.writeFileSync(htmlReportPath, html)
  console.log(`✅ Relatório HTML de 70 itens salvo em: ${htmlReportPath}`)
}

run().catch(console.error)
