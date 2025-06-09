'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { Calendar, User, ArrowRight, Search } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'

interface BlogPost {
  id: string
  titulo: string
  resumo: string
  imagem: string | null
  slug: string
  created_at: string
  author_id: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchTerm])

  const fetchPosts = async () => {
    try {
      // Durante build time sem env vars, usa dados mock
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setPosts([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, titulo, resumo, imagem, slug, created_at, author_id')
        .eq('publicado', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar posts:', error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    if (!searchTerm) {
      setFilteredPosts(posts)
      return
    }

    const filtered = posts.filter(post =>
      post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.resumo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPosts(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amarelo-armazem"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-cinza-claro">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
              Histórias & Memórias
            </h1>
            <p className="text-xl text-cinza-medio max-w-3xl mx-auto mb-8">
              Mergulhe nas histórias fascinantes de Santa Teresa, suas tradições 
              e os segredos que fazem do Armazém um lugar especial
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cinza-medio w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar histórias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Featured Post */}
          {filteredPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="font-playfair text-2xl font-semibold text-madeira-escura mb-6">
                História em Destaque
              </h2>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto">
                    <Image
                      src={filteredPosts[0].imagem || '/images/armazem-default.jpg'}
                      alt={filteredPosts[0].titulo}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="flex items-center text-sm text-cinza-medio mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(filteredPosts[0].created_at)}</span>
                      <span className="mx-2">•</span>
                      <User className="w-4 h-4 mr-1" />
                      <span>Armazém São Joaquim</span>
                    </div>
                    
                    <h3 className="font-playfair text-3xl font-bold text-madeira-escura mb-4">
                      {filteredPosts[0].titulo}
                    </h3>
                    
                    <p className="text-cinza-medio mb-6 text-lg leading-relaxed">
                      {filteredPosts[0].resumo}
                    </p>
                    
                    <Link 
                      href={`/blog/${filteredPosts[0].slug}`}
                      className="inline-flex items-center text-amarelo-armazem font-semibold hover:text-vermelho-portas transition-colors text-lg"
                    >
                      Ler história completa
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="w-16 h-16 text-cinza-medio mx-auto mb-4" />
                <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-4">
                  Nenhuma história encontrada
                </h3>
                <p className="text-cinza-medio">
                  Tente ajustar o termo de busca ou volte mais tarde para novas histórias
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredPosts.length > 1 && (
                <div>
                  <h2 className="font-playfair text-2xl font-semibold text-madeira-escura mb-6">
                    Mais Histórias
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.slice(1).map((post) => (
                      <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                        <CardHeader className="p-0">
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <Image
                              src={post.imagem || '/images/armazem-default.jpg'}
                              alt={post.titulo}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-6">
                          <div className="flex items-center text-sm text-cinza-medio mb-3">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(post.created_at)}</span>
                            <span className="mx-2">•</span>
                            <User className="w-4 h-4 mr-1" />
                            <span>Armazém São Joaquim</span>
                          </div>
                          
                          <h3 className="font-playfair text-xl font-semibold text-madeira-escura mb-3 group-hover:text-amarelo-armazem transition-colors">
                            {post.titulo}
                          </h3>
                          
                          <p className="text-cinza-medio mb-4 line-clamp-3">
                            {post.resumo}
                          </p>
                          
                          <Link 
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center text-amarelo-armazem font-medium hover:text-vermelho-portas transition-colors"
                          >
                            Ler mais
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Newsletter Signup */}
          <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
            <div className="text-center">
              <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-4">
                Receba nossas histórias
              </h3>
              <p className="text-cinza-medio mb-6">
                Inscreva-se para receber as últimas histórias, eventos e novidades do Armazém
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="flex-1 px-4 py-3 border border-cinza-medio rounded-lg focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent"
                />
                <Button variant="primary">
                  Inscrever-se
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}