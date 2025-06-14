import { render } from '@testing-library/react'
import SEO from '@/components/SEO'

// Mock do next/head
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

describe('SEO Component', () => {
  it('renders with default props', () => {
    const { container } = render(<SEO />)
    
    // Verificar se o componente renderiza sem erros
    expect(container).toBeTruthy()
  })

  it('renders with custom title', () => {
    const customTitle = 'Página de Teste'
    render(<SEO title={customTitle} />)
    
    // Verificar se o título customizado está presente
    const titleElement = document.querySelector('title')
    expect(titleElement?.textContent).toContain(customTitle)
  })

  it('renders with custom description', () => {
    const customDescription = 'Descrição de teste para SEO'
    render(<SEO description={customDescription} />)
    
    // Verificar se a meta description está presente
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription?.getAttribute('content')).toBe(customDescription)
  })

  it('renders with custom canonical URL', () => {
    const customCanonical = 'https://example.com/test'
    render(<SEO canonical={customCanonical} />)
    
    // Verificar se o link canonical está presente
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    expect(canonicalLink?.getAttribute('href')).toBe(customCanonical)
  })

  it('renders Open Graph meta tags', () => {
    const props = {
      title: 'Teste OG',
      description: 'Descrição OG',
      image: 'https://example.com/image.jpg'
    }
    
    render(<SEO {...props} />)
    
    // Verificar meta tags do Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    
    expect(ogTitle?.getAttribute('content')).toContain(props.title)
    expect(ogDescription?.getAttribute('content')).toBe(props.description)
    expect(ogImage?.getAttribute('content')).toBe(props.image)
  })

  it('renders Twitter Card meta tags', () => {
    const props = {
      title: 'Teste Twitter',
      description: 'Descrição Twitter'
    }
    
    render(<SEO {...props} />)
    
    // Verificar meta tags do Twitter
    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
    expect(twitterTitle?.getAttribute('content')).toContain(props.title)
    expect(twitterDescription?.getAttribute('content')).toBe(props.description)
  })

  it('renders structured data for restaurant', () => {
    render(<SEO />)
    
    // Verificar se o JSON-LD está presente
    const structuredData = document.querySelector('script[type="application/ld+json"]')
    expect(structuredData).toBeTruthy()
    
    if (structuredData?.textContent) {
      const jsonData = JSON.parse(structuredData.textContent)
      expect(jsonData['@type']).toBe('Restaurant')
      expect(jsonData.name).toBe('Armazém São Joaquim')
    }
  })
}) 