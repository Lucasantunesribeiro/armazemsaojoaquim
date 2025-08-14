import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts } from '@/lib/api'
import { BlogPostContent } from '@/components/blog/BlogPostContent'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { Metadata } from 'next'

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const language = locale === 'en' ? 'en' : 'pt'
  
  try {
    const post = await getPostBySlug(slug, language)
    
    if (!post) {
      return {
        title: 'Post não encontrado - Armazém São Joaquim'
      }
    }
    
    return {
      title: `${post.title} - Armazém São Joaquim`,
      description: post.excerpt || post.meta_description || undefined,
      openGraph: {
        title: post.meta_title || post.title,
        description: post.excerpt || post.meta_description || undefined,
        images: post.image_url ? [post.image_url] : [],
      },
    }
  } catch (error) {
    console.error('[BlogPost] Error generating metadata:', error)
    return {
      title: 'Blog - Armazém São Joaquim'
    }
  }
}

export async function generateStaticParams() {
  try {
    const [postsPt, postsEn] = await Promise.all([
      getAllPosts('pt'),
      getAllPosts('en')
    ])
    
    const paramsPt = postsPt.map((post) => ({
      locale: 'pt',
      slug: post.slug,
    }))
    
    const paramsEn = postsEn.map((post) => ({
      locale: 'en', 
      slug: post.slug,
    }))
    
    return [...paramsPt, ...paramsEn]
  } catch (error) {
    console.error('[BlogPost] Error generating static params:', error)
    return []
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params
  const language = locale === 'en' ? 'en' : 'pt'
  
  try {
    const [post, relatedPosts] = await Promise.all([
      getPostBySlug(slug, language),
      getAllPosts(language).then(posts => posts.slice(0, 3))
    ])
    
    if (!post) {
      notFound()
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-20">
        <BlogPostContent post={post} locale={locale} />
        {relatedPosts && relatedPosts.length > 0 && (
          <RelatedPosts posts={relatedPosts.filter(p => p.id !== post.id)} locale={locale} />
        )}
      </div>
    )
  } catch (error) {
    console.error('[BlogPost] Error loading post:', error)
    notFound()
  }
}