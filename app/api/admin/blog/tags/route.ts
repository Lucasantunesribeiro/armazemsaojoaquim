import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'pt'
    
    // Get all tags from blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('tags_pt, tags_en')
    
    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      )
    }
    
    // Extract and flatten all tags
    const allTags = new Set<string>()
    
    posts?.forEach(post => {
      const tags = locale === 'pt' ? post.tags_pt : post.tags_en
      if (tags && Array.isArray(tags)) {
        tags.forEach(tag => allTags.add(tag))
      }
    })
    
    // Add some default tags if none exist
    if (allTags.size === 0) {
      const defaultTags = locale === 'pt' 
        ? ['gastronomia', 'tradição', 'inovação', 'história', 'pousada', 'eventos', 'celebração', 'planejamento', 'turismo', 'cultura']
        : ['gastronomy', 'tradition', 'innovation', 'history', 'inn', 'events', 'celebration', 'planning', 'tourism', 'culture']
      
      defaultTags.forEach(tag => allTags.add(tag))
    }
    
    return NextResponse.json({
      tags: Array.from(allTags).sort()
    })
  } catch (error) {
    console.error('Error in tags API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}