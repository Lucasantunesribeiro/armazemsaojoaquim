import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get unique categories from blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('category_pt, category_en')
    
    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }
    
    // Extract unique categories
    const categoriesPt = new Set<string>()
    const categoriesEn = new Set<string>()
    
    posts?.forEach(post => {
      if (post.category_pt) categoriesPt.add(post.category_pt)
      if (post.category_en) categoriesEn.add(post.category_en)
    })
    
    // Add default categories if none exist
    if (categoriesPt.size === 0) {
      categoriesPt.add('Geral')
      categoriesPt.add('Culinária')
      categoriesPt.add('História')
      categoriesPt.add('Eventos')
      categoriesPt.add('Turismo')
    }
    
    if (categoriesEn.size === 0) {
      categoriesEn.add('General')
      categoriesEn.add('Culinary')
      categoriesEn.add('History')
      categoriesEn.add('Events')
      categoriesEn.add('Tourism')
    }
    
    return NextResponse.json({
      categories_pt: Array.from(categoriesPt).sort(),
      categories_en: Array.from(categoriesEn).sort()
    })
  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}