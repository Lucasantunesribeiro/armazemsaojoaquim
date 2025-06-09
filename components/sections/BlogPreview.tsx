import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, User } from 'lucide-react'
import Button from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'

const BlogPreview = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'A História do Bondinho de Santa Teresa',
      excerpt: 'Descubra como o icônico bondinho se tornou símbolo do bairro e parte da identidade carioca.',
      image: '/images/bondinho-santa-teresa.jpg',
      author: 'Armazém São Joaquim',
      date: '2024-01-15',
      slug: 'historia-bondinho-santa-teresa'
    },
    {
      id: 2,
      title: 'Os Segredos da Mixologia Artesanal',
      excerpt: 'Conheça as técnicas e ingredientes especiais que tornam nossos drinks únicos.',
      image: '/images/drinks-artesanais.jpg',
      author: 'Chef Bartender',
      date: '2024-01-10',
      slug: 'segredos-mixologia-artesanal'
    },
    {
      id: 3,
      title: 'Santa Teresa: Boemia e Cultura',
      excerpt: 'Explore a rica vida cultural e boêmia que faz de Santa Teresa um bairro único no Rio.',
      image: '/images/santa-teresa-cultura.jpg',
      author: 'Equipe Cultural',
      date: '2024-01-05',
      slug: 'santa-teresa-boemia-cultura'
    }
  ]

  return (
    <section className="py-20 bg-cinza-claro">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
              Histórias & Memórias
            </h2>
            <p className="text-xl text-cinza-medio max-w-3xl mx-auto mb-8">
              Mergulhe nas histórias fascinantes de Santa Teresa, suas tradições 
              e os segredos que fazem do Armazém um lugar especial
            </p>
            <Link href="/blog">
              <Button variant="outline" size="lg">
                Ver Todos os Posts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-cinza-medio mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-1" />
                    <span>{post.author}</span>
                  </div>
                  
                  <h3 className="font-playfair text-xl font-semibold text-madeira-escura mb-3 group-hover:text-amarelo-armazem transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-cinza-medio mb-4 line-clamp-3">
                    {post.excerpt}
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
    </section>
  )
}

export default BlogPreview