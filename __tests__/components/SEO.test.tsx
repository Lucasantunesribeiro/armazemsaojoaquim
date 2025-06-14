import React from 'react'
import { render } from '@testing-library/react'
import SEO from '@/components/SEO'

// Mock do next/head
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

describe('SEO Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<SEO title="Test Title" />)
    expect(container).toBeTruthy()
  })

  it('renders with default props', () => {
    const { container } = render(<SEO />)
    expect(container).toBeTruthy()
  })

  it('renders with custom title', () => {
    const { container } = render(<SEO title="Custom Title" />)
    expect(container).toBeTruthy()
  })

  it('renders with custom description', () => {
    const { container } = render(
      <SEO title="Test" description="Custom description" />
    )
    expect(container).toBeTruthy()
  })

  it('renders with restaurant type', () => {
    const { container } = render(
      <SEO 
        title="Restaurant" 
        type="restaurant"
        restaurant={{
          name: "Armazém São Joaquim",
          address: {
            street: "Rua Almirante Alexandrino, 316",
            city: "Rio de Janeiro",
            state: "RJ",
            postalCode: "20241-260",
            country: "Brasil"
          },
          phone: "+55 21 2507-0840",
          email: "contato@armazemsaojoaquim.com.br"
        }}
      />
    )
    expect(container).toBeTruthy()
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