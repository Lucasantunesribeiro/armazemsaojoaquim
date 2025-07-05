/**
 * Custom image loader para evitar erros 400 na otimização de imagens
 * Baseado na solução do GitHub: https://github.com/vercel/next.js/discussions/20138
 */

interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

export const customImageLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  // Para imagens locais (começando com /), usar o src diretamente
  if (src.startsWith('/')) {
    return src
  }
  
  // Para URLs externas, adicionar parâmetros de otimização
  const url = new URL(src)
  url.searchParams.set('w', width.toString())
  url.searchParams.set('q', (quality || 75).toString())
  
  return url.toString()
}

/**
 * Loader simplificado que evita otimização problemática
 * Implementa width conforme requerido pelo Next.js
 */
export const simpleImageLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  // Para imagens locais (começando com /), retornar sem otimização
  if (src.startsWith('/')) {
    return src
  }
  
  // Para URLs externas, adicionar parâmetros se necessário
  const url = new URL(src)
  if (width) {
    url.searchParams.set('w', width.toString())
  }
  if (quality) {
    url.searchParams.set('q', quality.toString())
  }
  
  return url.toString()
} 