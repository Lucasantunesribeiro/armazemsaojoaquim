import { Suspense } from 'react'
import { getAllPosts, getFeaturedPosts } from '@/lib/api'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { FeaturedPostCard } from '@/components/blog/FeaturedPostCard'
import { BlogLoadingSkeleton } from '@/components/blog/BlogLoadingSkeleton'
import { Metadata } from 'next'

interface BlogPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params
  
  return {
    title: locale === 'en' ? 'Blog - Armazém São Joaquim' : 'Blog - Armazém São Joaquim',
    description: locale === 'en' 
      ? 'Stories, recipes and traditions from our restaurant in Santa Teresa'
      : 'Histórias, receitas e tradições do nosso restaurante em Santa Teresa',
  }
}

async function BlogContent({ locale }: { locale: string }) {
  try {
    console.log(`[BlogPage] Loading posts for locale: ${locale}`)
    
    const [allPosts, featuredPosts] = await Promise.all([
      getAllPosts(locale === 'en' ? 'en' : 'pt'),
      getFeaturedPosts(locale === 'en' ? 'en' : 'pt')
    ])
    
    console.log(`[BlogPage] Loaded ${allPosts.length} posts, ${featuredPosts.length} featured`)
    
    if (!allPosts || allPosts.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                {locale === 'en' ? 'Our Stories' : 'Nossas Histórias'}
              </h1>
              
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                <div className="text-6xl mb-4">📖</div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  {locale === 'en' ? 'Blog System Ready!' : 'Sistema de Blog Pronto!'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                  {locale === 'en' 
                    ? 'The multilingual blog system has been implemented. To see the stories, please apply the database migration:'
                    : 'O sistema de blog multilíngue foi implementado. Para ver as histórias, aplique a migração do banco de dados:'
                  }
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    {locale === 'en' ? 'Apply Migration:' : 'Aplicar Migração:'}
                  </h3>
                  <code className="text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">
                    supabase/migrations/20250131_blog_multilingual.sql
                  </code>
                </div>
                
                <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">
                    {locale === 'en' 
                      ? 'After migration: 4 example posts in PT and EN will be available!'
                      : 'Após a migração: 4 posts de exemplo em PT e EN estarão disponíveis!'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {locale === 'en' ? 'Our Stories' : 'Nossas Histórias'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              {locale === 'en' 
                ? 'Discover the stories, flavors and traditions that make Armazém São Joaquim special'
                : 'Descubra as histórias, sabores e tradições que tornam o Armazém São Joaquim especial'
              }
            </p>
          </div>
          
          {/* Featured Posts */}
          {featuredPosts && featuredPosts.length > 0 && (
            <section className="mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">
                {locale === 'en' ? 'Featured Stories' : 'Histórias em Destaque'}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {featuredPosts.slice(0, 2).map((post) => (
                  <FeaturedPostCard key={post.id} post={post} locale={locale} />
                ))}
              </div>
            </section>
          )}
          
          {/* All Posts */}
          <section>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">
              {locale === 'en' ? 'All Stories' : 'Todas as Histórias'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {allPosts.filter(post => !post.featured).map((post) => (
                <BlogPostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[BlogPage] Error loading blog content:', error)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-red-800">
                {locale === 'en' ? 'Loading Error' : 'Erro de Carregamento'}
              </h2>
              <p className="text-sm sm:text-base text-red-600">
                {locale === 'en' 
                  ? 'We are having technical difficulties loading our stories. Please try again later.'
                  : 'Estamos com dificuldades técnicas para carregar nossas histórias. Tente novamente mais tarde.'
                }
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {locale === 'en' ? 'Try Again' : 'Tentar Novamente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params
  
  return (
    <Suspense fallback={<BlogLoadingSkeleton />}>
      <BlogContent locale={locale} />
    </Suspense>
  )
}