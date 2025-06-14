import {
  ClientHeroSection,
  ClientAboutSection,
  ClientMenuPreview,
  ClientBlogPreview,
  ClientContactSection,
} from '@/components/ClientComponents'
import SEO from '@/components/SEO'

export default function HomePage() {
  return (
    <>
      <SEO 
        title="Armazém São Joaquim - Restaurante Histórico em Santa Teresa"
        description="Desde 1854 preservando a tradição gastronômica de Santa Teresa. Desfrute de pratos únicos em um ambiente histórico no coração do Rio de Janeiro."
        canonical="https://armazemsaojoaquim.netlify.app"
      />
      
      <ClientHeroSection />
      <ClientAboutSection />
      <ClientMenuPreview />
      <ClientBlogPreview />
      <ClientContactSection />
    </>
  )
}