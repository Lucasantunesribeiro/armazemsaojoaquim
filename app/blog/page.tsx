import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User, ArrowRight, Search, Tag, Heart, Eye, MessageCircle, Share2, Coffee, Camera, MapPin } from 'lucide-react'
import BlogPageClient from './BlogPageClient'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  readingTime: string
  category: string
  tags: string[]
  featured: boolean
  image: string
}

// Mock data baseado nos dados reais do CSV
const mockBlogPosts: BlogPost[] = [
  {
    id: '0049d04f-ad1c-4299-9986-8bc39e06fa8c',
    title: 'Os Segredos da Nossa Feijoada',
    excerpt: 'Descubra os segredos por trás da nossa famosa feijoada tradicional',
    content: 'Nossa feijoada é preparada seguindo uma receita tradicional passada de geração em geração. O segredo está no tempo de cozimento e na seleção dos ingredientes...',
    author: 'Armazém São Joaquim',
    publishedAt: '2025-06-08',
    readingTime: '5 min',
    category: 'Receitas',
    tags: ['feijoada', 'receitas', 'culinária', 'tradição'],
    featured: true,
    image: '/images/blog/segredos-feijoada.jpg'
  },
  {
    id: '5ea5f6d7-589e-4135-a5c2-a493f93c7eb5',
    title: 'A Arte da Mixologia no Armazém',
    excerpt: 'Conheça o cuidado e a paixão por trás de cada drink servido no Armazém São Joaquim.',
    content: 'Nossos drinks são muito mais que simples coquetéis - são obras de arte líquidas que contam histórias...',
    author: 'Armazém São Joaquim',
    publishedAt: '2025-06-09',
    readingTime: '8 min',
    category: 'Bebidas',
    tags: ['drinks', 'mixologia', 'cachaça', 'gin'],
    featured: true,
    image: '/images/blog/drinks.jpg'
  },
  {
    id: '686bf363-dfb6-4972-96d7-245f93f2d857',
    title: 'Eventos e Celebrações no Armazém',
    excerpt: 'Descubra como transformar seus momentos especiais em memórias inesquecíveis no Armazém.',
    content: 'O Armazém São Joaquim é o lugar perfeito para celebrar momentos especiais...',
    author: 'Armazém São Joaquim',
    publishedAt: '2025-06-09',
    readingTime: '6 min',
    category: 'Eventos',
    tags: ['eventos', 'celebrações', 'música ao vivo', 'santa teresa'],
    featured: false,
    image: '/images/blog/eventos.jpg'
  },
  {
    id: 'a0dbcfb7-aa55-4b7f-b081-4525b57f54c8',
    title: 'A História do Armazém São Joaquim',
    excerpt: 'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.',
    content: 'O Armazém São Joaquim tem uma rica história de 170 anos no coração de Santa Teresa...',
    author: 'Armazém São Joaquim',
    publishedAt: '2024-01-15',
    readingTime: '8 min',
    category: 'História',
    tags: ['tradição', 'santa teresa', 'história', 'patrimônio'],
    featured: true,
    image: '/images/armazem-historia.jpg'
  }
]

const categories = [
  { id: 'todos', name: 'Todos os Posts', count: mockBlogPosts.length },
  { id: 'História', name: 'História', count: mockBlogPosts.filter(p => p.category === 'História').length },
  { id: 'Receitas', name: 'Receitas', count: mockBlogPosts.filter(p => p.category === 'Receitas').length },
  { id: 'Cultura', name: 'Cultura', count: mockBlogPosts.filter(p => p.category === 'Cultura').length },
  { id: 'Bebidas', name: 'Bebidas', count: mockBlogPosts.filter(p => p.category === 'Bebidas').length },
  { id: 'Arte', name: 'Arte', count: mockBlogPosts.filter(p => p.category === 'Arte').length }
]

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Tentar carregar do Supabase primeiro
    try {
      const { supabase } = await import('../../lib/supabase')
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('publicado', true)
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data.map((post: any) => ({
          id: post.id,
          title: post.titulo,
          excerpt: post.resumo || '',
          content: post.conteudo,
          author: post.author_id || 'Armazém São Joaquim',
          publishedAt: new Date(post.created_at).toISOString().split('T')[0],
          readingTime: '5 min',
          category: 'Blog',
          tags: ['armazém', 'santa teresa'],
          featured: false,
          image: post.imagem || '/images/placeholder.jpg'
        }))
      }
    } catch (supabaseError) {
      console.warn('Supabase error, falling back to mock data:', supabaseError)
    }

    // Fallback para dados mock
    return mockBlogPosts
  } catch (error) {
    console.warn('Error fetching blog posts:', error)
    return mockBlogPosts
  }
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts()
  
  const categories = [
    { id: 'todos', name: 'Todos os Posts', count: blogPosts.length },
    { id: 'História', name: 'História', count: blogPosts.filter(p => p.category === 'História').length },
    { id: 'Receitas', name: 'Receitas', count: blogPosts.filter(p => p.category === 'Receitas').length },
    { id: 'Cultura', name: 'Cultura', count: blogPosts.filter(p => p.category === 'Cultura').length },
    { id: 'Bebidas', name: 'Bebidas', count: blogPosts.filter(p => p.category === 'Bebidas').length },
    { id: 'Arte', name: 'Arte', count: blogPosts.filter(p => p.category === 'Arte').length },
    { id: 'Eventos', name: 'Eventos', count: blogPosts.filter(p => p.category === 'Eventos').length }
  ]

  return (
    <BlogPageClient blogPosts={blogPosts} categories={categories} />
  )
}