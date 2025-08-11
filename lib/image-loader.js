/**
 * Custom image loader para produção (Netlify)
 * Evita problemas com otimização de imagem no deploy
 */

export default function imageLoader({ src, width, quality }) {
  // Para imagens locais, retorna o src original
  if (src.startsWith('/')) {
    return src
  }
  
  // Para imagens externas, pode aplicar otimizações se necessário
  return src
}
