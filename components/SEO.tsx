import Head from 'next/head'
import { ENV } from '../lib/config'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'restaurant' | 'menu' | 'reservation'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  noindex?: boolean
  canonical?: string
  alternateLanguages?: { href: string; hrefLang: string }[]
  article?: {
    publishedTime?: string
    modifiedTime?: string
    author?: string
    section?: string
    tags?: string[]
  }
  restaurant?: {
    name?: string
    address?: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    phone?: string
    email?: string
    openingHours?: string[]
    priceRange?: string
    cuisine?: string[]
    rating?: {
      value: number
      count: number
    }
  }
}

const DEFAULT_SEO = {
  title: 'Armazém São Joaquim - Restaurante Histórico em Santa Teresa',
  description: 'Restaurante histórico em Santa Teresa, Rio de Janeiro. 170 anos de história, drinks excepcionais e gastronomia única no coração de Santa Teresa.',
  keywords: [
    'restaurante santa teresa',
    'armazém são joaquim',
    'restaurante histórico rio de janeiro',
    'drinks santa teresa',
    'gastronomia santa teresa',
    'restaurante tradicional',
    'culinária carioca',
    'boteco histórico',
    'choperia santa teresa',
    'feijoada tradicional'
  ],
  image: '/images/armazem-hero.jpg',
  url: 'https://armazemsaojoaquim.com.br',
  type: 'restaurant' as const,
  author: 'Armazém São Joaquim',
}

export default function SEO({
  title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  url = DEFAULT_SEO.url,
  type = DEFAULT_SEO.type,
  author = DEFAULT_SEO.author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  noindex = false,
  canonical,
  alternateLanguages = [],
  article,
  restaurant
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | Armazém São Joaquim`
    : DEFAULT_SEO.title

  const fullUrl = url.startsWith('http') ? url : `${DEFAULT_SEO.url}${url}`
  const fullImage = image.startsWith('http') ? image : `${DEFAULT_SEO.url}${image}`
  const canonicalUrl = canonical || fullUrl

  const defaultRestaurant = {
    name: 'Armazém São Joaquim',
    address: {
      street: 'Rua São Joaquim, 123',
      city: 'Rio de Janeiro',
      state: 'RJ',
      postalCode: '20241-000',
      country: 'BR'
    },
    phone: '+55 21 99999-9999',
    email: 'contato@armazemsaojoaquim.com.br',
    openingHours: [
      'Mo-Th 11:00-23:00',
      'Fr-Sa 11:00-00:00',
      'Su 11:00-22:00'
    ],
    priceRange: '$$',
    cuisine: ['Brazilian', 'Traditional', 'Regional'],
    rating: {
      value: 4.8,
      count: 127
    }
  }

  const seo = {
    title: title || DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    image: image || DEFAULT_SEO.image,
    url: url || DEFAULT_SEO.url,
    restaurant: { ...defaultRestaurant, ...restaurant }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': fullUrl,
    name: 'Armazém São Joaquim',
    description,
    url: fullUrl,
    image: fullImage,
    logo: `${DEFAULT_SEO.url}/images/armazem-logo.webp`,
    telephone: '+55 21 2232-5441',
    email: 'contato@armazemsaojoaquim.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Almirante Alexandrino, 316',
      addressLocality: 'Santa Teresa',
      addressRegion: 'Rio de Janeiro',
      addressCountry: 'BR',
      postalCode: '20241-260',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -22.9154,
      longitude: -43.1895,
    },
    openingHours: [
      'Tu-Th 17:00-01:00',
      'Fr-Sa 17:00-02:00',
      'Su 12:00-22:00',
    ],
    priceRange: '$$',
    cuisineType: ['Brazilian', 'Traditional', 'Bar Food'],
    acceptsReservations: true,
    hasMenu: `${DEFAULT_SEO.url}/menu`,
    servesCuisine: 'Brazilian',
    foundingDate: '1850',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.6',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Pix'],
    currenciesAccepted: 'BRL',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: -22.9154,
        longitude: -43.1895,
      },
      geoRadius: '50000',
    },
    sameAs: [
      'https://www.instagram.com/armazemsaojoaquim',
      'https://www.facebook.com/armazemsaojoaquim',
      'https://www.tripadvisor.com.br/armazemsaojoaquim',
    ],
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: DEFAULT_SEO.url,
      },
    ],
  }

  // Add current page to breadcrumb if not home
  if (url !== DEFAULT_SEO.url) {
    breadcrumbData.itemListElement.push({
      '@type': 'ListItem',
      position: 2,
      name: title || 'Página',
      item: fullUrl,
    })
  }

  // Schema.org para LocalBusiness/Restaurant
  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: seo.restaurant.name,
    description: seo.description,
    image: [seo.image],
    url: seo.url,
    telephone: seo.restaurant.phone,
    email: seo.restaurant.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: seo.restaurant.address.street,
      addressLocality: seo.restaurant.address.city,
      addressRegion: seo.restaurant.address.state,
      postalCode: seo.restaurant.address.postalCode,
      addressCountry: seo.restaurant.address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -22.9068,
      longitude: -43.1729
    },
    openingHoursSpecification: seo.restaurant.openingHours?.map((hours: string) => {
      const [days, time] = hours.split(' ')
      const [open, close] = time.split('-')
      
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days.split('-').map((day: string) => {
          const dayMap: Record<string, string> = {
            'Mo': 'Monday',
            'Tu': 'Tuesday', 
            'We': 'Wednesday',
            'Th': 'Thursday',
            'Fr': 'Friday',
            'Sa': 'Saturday',
            'Su': 'Sunday'
          }
          return dayMap[day] || day
        }),
        opens: open,
        closes: close
      }
    }),
    priceRange: seo.restaurant.priceRange,
    servesCuisine: seo.restaurant.cuisine,
    aggregateRating: seo.restaurant.rating ? {
      '@type': 'AggregateRating',
      ratingValue: seo.restaurant.rating.value,
      reviewCount: seo.restaurant.rating.count,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    hasMenu: {
      '@type': 'Menu',
      name: 'Cardápio Principal',
      description: 'Cardápio com pratos tradicionais brasileiros',
      url: `${seo.url}/menu`
    },
    acceptsReservations: true,
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Vista Panorâmica',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification', 
        name: 'Ambiente Histórico',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Acessibilidade',
        value: true
      }
    ],
    sameAs: [
      'https://www.instagram.com/armazemsaojoaquim',
      'https://www.facebook.com/armazemsaojoaquim',
      'https://www.tripadvisor.com.br/armazemsaojoaquim'
    ]
  }

  // Schema.org para artigos do blog
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: seo.title,
    description: seo.description,
    image: [seo.image],
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author || 'Armazém São Joaquim'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Armazém São Joaquim',
      logo: {
        '@type': 'ImageObject',
        url: `${ENV.SITE_URL}/images/logo.jpg`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': seo.url
    },
    articleSection: article.section,
    keywords: article.tags?.join(', ')
  } : null

  // Schema.org para FAQ (página de reservas)
  const faqSchema = type === 'reservation' ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Como fazer uma reserva?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Você pode fazer sua reserva através do nosso formulário online, escolhendo a data, horário e número de pessoas. Confirmaremos sua reserva por email.'
        }
      },
      {
        '@type': 'Question',
        name: 'Qual é o horário de funcionamento?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Funcionamos de segunda a quinta das 11h às 23h, sexta e sábado das 11h à meia-noite, e domingo das 11h às 22h.'
        }
      },
      {
        '@type': 'Question',
        name: 'Vocês aceitam grupos grandes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, aceitamos grupos de até 20 pessoas. Para grupos maiores, entre em contato conosco para arranjos especiais.'
        }
      },
      {
        '@type': 'Question',
        name: 'Há opções vegetarianas no cardápio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, oferecemos diversas opções vegetarianas e veganas. Consulte nosso cardápio online ou pergunte ao garçom.'
        }
      }
    ]
  } : null

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: ENV.SITE_URL
      },
      ...(type === 'menu' ? [{
        '@type': 'ListItem',
        position: 2,
        name: 'Cardápio',
        item: `${ENV.SITE_URL}/menu`
      }] : []),
      ...(type === 'reservation' ? [{
        '@type': 'ListItem',
        position: 2,
        name: 'Reservas',
        item: `${ENV.SITE_URL}/reservas`
      }] : []),
      ...(type === 'article' ? [
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${ENV.SITE_URL}/blog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: title || 'Artigo',
          item: seo.url
        }
      ] : [])
    ]
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || fullUrl} />
      
      {/* Alternate Languages */}
      {alternateLanguages.map((lang) => (
        <link
          key={lang.hrefLang}
          rel="alternate"
          hrefLang={lang.hrefLang}
          href={lang.href}
        />
      ))}
      
      {/* Open Graph */}
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={title || 'Armazém São Joaquim'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Armazém São Joaquim" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Restaurant specific Open Graph */}
      {type === 'restaurant' && (
        <>
          <meta property="restaurant:contact_info:street_address" content="Rua Almirante Alexandrino, 316" />
          <meta property="restaurant:contact_info:locality" content="Santa Teresa" />
          <meta property="restaurant:contact_info:region" content="Rio de Janeiro" />
          <meta property="restaurant:contact_info:postal_code" content="20241-260" />
          <meta property="restaurant:contact_info:country_name" content="Brasil" />
          <meta property="restaurant:contact_info:phone_number" content="+5521223254410" />
        </>
      )}
      
      {/* Article specific Open Graph */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title || 'Armazém São Joaquim'} />
      <meta name="twitter:site" content="@armazemsaojoaquim" />
      <meta name="twitter:creator" content="@armazemsaojoaquim" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#F4C430" />
      <meta name="msapplication-TileColor" content="#F4C430" />
      <meta name="apple-mobile-web-app-title" content="Armazém São Joaquim" />
      <meta name="application-name" content="Armazém São Joaquim" />
      
      {/* Business Information */}
      <meta name="geo.region" content="BR-RJ" />
      <meta name="geo.placename" content="Santa Teresa, Rio de Janeiro" />
      <meta name="geo.position" content="-22.9154;-43.1895" />
      <meta name="ICBM" content="-22.9154, -43.1895" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2),
        }}
      />
      
      {/* Restaurant specific Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantSchema)
        }}
      />

      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema)
          }}
        />
      )}

      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      )}

      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </Head>
  )
} 