/**
 * Helper to map menu items strictly to their OWN local optimized WebP images (thumbs and large).
 * If an item does not have its own photo, returns '/images/placeholder.svg' (neutral placeholder).
 * Supports hybrid fallback for admin uploads (remote URLs).
 */

const LOCAL_MENU_IMAGES = new Set<string>([
  'arroz.webp',
  'atum-em-crosta.webp',
  'bife-ancho.webp',
  'bolinho-de-bacalhau.webp',
  'bolinho-de-feijoada.webp',
  'caesar-salad-com-frango.webp',
  'caesar-salad-sem-frango.webp',
  'caprese-mineira.webp',
  'chori-pao.webp',
  'croqueta-de-costela.webp',
  'delicia-de-manga.webp',
  'feijao.webp',
  'feijoada-tradicional.webp',
  'hamburguer-da-casa.webp',
  'iscas-de-frango.webp',
  'iscas-de-peixe.webp',
  'mix-na-brasa.webp',
  'moqueca-de-banana-da-terra.webp',
  'palmito-pupunha.webp',
  'pao-de-alho.webp',
  'pasteis-carne-seca-e-creme-de-queijo.webp',
  'pastel-de-queijo.webp',
  'picanha-ao-carvao.webp',
  'polvo-grelhado-com-arroz-negro.webp',
  'posta-de-salmao-grelhado.webp',
  'pratos-tradicionais.webp',
  'risoto-de-bacalhau.webp',
  'salada-da-casa.webp',
  'salada-de-graos-com-frango.webp',
  'salada-de-graos-com-tilapia.webp',
  'tarte-aux-pommes.webp',
  'tilapia-grelhada.webp',
  'tilapia-na-brasa.webp',
  'torresmo.webp',
  'aperitivos.webp'
])

// Strict mappings ONLY when DB item name maps to its OWN exact image file
const STRICT_EXACT_MAP: Record<string, string> = {
  'feijoada-da-casa-individual': 'feijoada-tradicional.webp',
  'feijoada-da-casa-para-dois': 'feijoada-tradicional.webp',
  'feijoada-da-casa-buffet-livre': 'feijoada-tradicional.webp',
  'pasteis-queijo': 'pastel-de-queijo.webp',
  'caeser-salad-com-fatias-de-frango': 'caesar-salad-com-frango.webp',
  'caeser-salad-sem-fatias-de-frango': 'caesar-salad-sem-frango.webp',
  'moqueca-banana-da-terra': 'moqueca-de-banana-da-terra.webp'
}

export function slugifyName(name: string): string {
  if (!name) return ''
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, ' ')
    .trim()
    .replace(/[\s_-]+/g, '-')
}

export interface MenuItemLike {
  name?: string | null
  image_url?: string | null
}

export function getMenuImageUrl(
  item: MenuItemLike,
  variant: 'thumb' | 'large' = 'thumb'
): string {
  if (!item) return '/images/placeholder.svg'

  const subDir = variant === 'large' ? 'large' : 'thumbs'

  // If image_url is already a local path under /images/menu/
  if (item.image_url && item.image_url.startsWith('/images/menu/')) {
    const filename = item.image_url.split('/').pop()
    if (filename && LOCAL_MENU_IMAGES.has(filename)) {
      return `/images/menu/${subDir}/${filename}`
    }
  }

  // Check from image_url filename if present
  let urlFilenameSlug = ''
  if (item.image_url) {
    const rawFilename = item.image_url.split('/').pop() || ''
    const cleanName = rawFilename.split('?')[0].replace(/\.(png|jpg|jpeg|webp|avif)$/i, '')
    urlFilenameSlug = slugifyName(cleanName)
  }

  const nameSlug = slugifyName(item.name || '')

  // 1. Direct filename match in local set (e.g., bife-ancho.webp)
  const candidate1 = `${urlFilenameSlug}.webp`
  if (urlFilenameSlug && LOCAL_MENU_IMAGES.has(candidate1)) {
    return `/images/menu/${subDir}/${candidate1}`
  }

  // 2. Direct name slug match in local set
  const candidate2 = `${nameSlug}.webp`
  if (nameSlug && LOCAL_MENU_IMAGES.has(candidate2)) {
    return `/images/menu/${subDir}/${candidate2}`
  }

  // 3. Strict exact mapping for shared identical dishes (e.g. feijoada variations)
  if (nameSlug && STRICT_EXACT_MAP[nameSlug]) {
    return `/images/menu/${subDir}/${STRICT_EXACT_MAP[nameSlug]}`
  }

  if (urlFilenameSlug && STRICT_EXACT_MAP[urlFilenameSlug]) {
    return `/images/menu/${subDir}/${STRICT_EXACT_MAP[urlFilenameSlug]}`
  }

  // 4. Hybrid Fallback: if remote image_url exists (e.g. new admin upload), return it
  if (item.image_url && item.image_url.trim() !== '' && !item.image_url.startsWith('/images/menu_images/')) {
    return item.image_url
  }

  // 5. Neutral placeholder fallback for items without their own photo
  return '/images/placeholder.svg'
}
