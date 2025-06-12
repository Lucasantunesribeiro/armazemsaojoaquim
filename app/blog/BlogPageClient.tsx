'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User, ArrowRight, Search, Heart, Coffee, Camera, MapPin } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  count: number
}

interface BlogPageClientProps {
  blogPosts: BlogPost[]
  categories: Category[]
}

export default function BlogPageClient({ blogPosts, categories }: BlogPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPosts = blogPosts
    .filter(post => selectedCategory === 'todos' || post.category === selectedCategory)
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  const featuredPosts = filteredPosts.filter(post => post.featured)
  const regularPosts = filteredPosts.filter(post => !post.featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave">
      {/* Header Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/santa-teresa-vista-panoramica-2.jpg"
            alt="Vista panorâmica de Santa Teresa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-madeira-escura/90 via-madeira-escura/70 to-madeira-escura/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amarelo-armazem/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amarelo-armazem/30">
              <Coffee className="w-5 h-5 text-amarelo-armazem" />
              <span className="text-sm font-medium text-amarelo-armazem font-inter">
                Blog do Armazém
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair leading-tight">
              Histórias & Sabores
              <span className="block text-amarelo-armazem">de Santa Teresa</span>
            </h1>
            
            <p className="text-xl text-cinza-claro max-w-3xl mx-auto leading-relaxed font-inter">
              Descubra as histórias, receitas e cultura que fazem do Armazém São Joaquim 
              um lugar especial há mais de 170 anos.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-cinza-claro">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span className="font-inter">Histórias Autênticas</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="font-inter">Santa Teresa, RJ</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4" />
                <span className="font-inter">{blogPosts.length} posts publicados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-cinza-claro/20">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cinza-medio w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar posts, tags, autores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-cinza-claro/30 rounded-xl focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent bg-white text-madeira-escura font-inter"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center space-x-3 px-6 py-3 rounded-xl font-medium font-inter transition-all duration-300
                    ${selectedCategory === category.id
                      ? 'bg-amarelo-armazem text-white shadow-lg scale-105'
                      : 'bg-white text-madeira-escura hover:bg-amarelo-armazem/10 border border-cinza-claro/20'
                    }
                  `}
                >
                  <span>{category.name}</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-bold
                    ${selectedCategory === category.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-amarelo-armazem/20 text-amarelo-armazem'
                    }
                  `}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-madeira-escura font-playfair mb-8 text-center">
                Posts em Destaque
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post) => (
                  <article 
                    key={post.id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-cinza-claro/20 group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-4 left-4 bg-amarelo-armazem text-white px-3 py-1 rounded-full text-sm font-medium font-inter">
                        {post.category}
                      </div>
                      
                      <div className="absolute top-4 right-4 bg-vermelho-portas text-white px-3 py-1 rounded-full text-sm font-bold font-inter flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>Destaque</span>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center space-x-4 text-sm text-cinza-medio mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span className="font-inter">{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-inter">{formatDate(post.publishedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-inter">{post.readingTime}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-madeira-escura font-playfair mb-3 group-hover:text-amarelo-armazem transition-colors duration-300">
                        {post.title}
                      </h3>
                      
                      <p className="text-cinza-medio font-inter leading-relaxed mb-6">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs bg-amarelo-armazem/10 text-amarelo-armazem px-2 py-1 rounded-full font-inter font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-cinza-claro/20">
                        <div className="flex items-center space-x-2 text-sm text-cinza-medio">
                          <Calendar className="w-4 h-4" />
                          <span className="font-inter">{formatDate(post.publishedAt)}</span>
                        </div>

                        <Link
                          href={`/blog/${post.id}`}
                          className="inline-flex items-center space-x-2 text-amarelo-armazem hover:text-vermelho-portas font-medium font-inter transition-colors duration-300"
                        >
                          <span>Ler mais</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-madeira-escura font-playfair mb-8 text-center">
                Últimos Posts
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post) => (
                  <article 
                    key={post.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-cinza-claro/20 group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-4 left-4 bg-amarelo-armazem text-white px-3 py-1 rounded-full text-sm font-medium font-inter">
                        {post.category}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center space-x-3 text-xs text-cinza-medio mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span className="font-inter">{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-inter">{post.readingTime}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-madeira-escura font-playfair mb-2 group-hover:text-amarelo-armazem transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-cinza-medio font-inter text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs bg-amarelo-armazem/10 text-amarelo-armazem px-2 py-1 rounded-full font-inter"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-cinza-claro/20">
                        <div className="flex items-center space-x-2 text-sm text-cinza-medio">
                          <Calendar className="w-4 h-4" />
                          <span className="font-inter">{formatDate(post.publishedAt)}</span>
                        </div>

                        <Link
                          href={`/blog/${post.id}`}
                          className="inline-flex items-center space-x-2 text-amarelo-armazem hover:text-vermelho-portas font-medium font-inter transition-colors duration-300"
                        >
                          <span>Ler mais</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-cinza-medio mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-madeira-escura mb-2 font-playfair">
                Nenhum post encontrado
              </h3>
              <p className="text-cinza-medio font-inter">
                Tente ajustar sua busca ou categoria selecionada
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-madeira-escura to-madeira-media">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto">
              <Coffee className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair">
              Receba Nossas Histórias
            </h2>
            
            <p className="text-xl text-cinza-claro font-inter">
              Inscreva-se em nossa newsletter e seja o primeiro a conhecer nossas receitas, 
              eventos especiais e histórias exclusivas do Armazém.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent font-inter"
              />
              <button className="px-6 py-3 bg-amarelo-armazem hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl font-inter">
                Inscrever
              </button>
            </div>

            <p className="text-sm text-cinza-claro font-inter">
              📧 Enviamos apenas conteúdo de qualidade. Sem spam.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
} 