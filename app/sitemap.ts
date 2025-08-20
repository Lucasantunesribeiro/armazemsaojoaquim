import { MetadataRoute } from 'next'
import { blogApi } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://armazemsaojoaquim.com.br'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      // url: `${baseUrl}/reservas`, // Sistema de reservas desabilitado
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await blogApi.getAllPosts()
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Erro ao carregar posts para sitemap:', error)
    // Fallback com posts mockados
    const mockPosts = [
      {
        slug: 'historia-do-armazem-sao-joaquim',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        slug: 'segredos-da-nossa-feijoada',
        updated_at: '2025-06-08T20:51:57.634362+00:00'
      },
      {
        slug: 'arte-da-mixologia-no-armazem',
        updated_at: '2025-06-09T02:14:03.040244+00:00'
      }
    ]
    blogPages = mockPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  }

  return [...staticPages, ...blogPages]
} 