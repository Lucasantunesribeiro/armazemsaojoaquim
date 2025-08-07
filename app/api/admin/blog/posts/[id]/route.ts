import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching blog post:', error)
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in blog post API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()
    
    const {
      title_pt,
      title_en,
      slug_pt,
      slug_en,
      content_pt,
      content_en,
      excerpt_pt,
      excerpt_en,
      meta_title_pt,
      meta_title_en,
      meta_description_pt,
      meta_description_en,
      category_pt,
      category_en,
      tags_pt,
      tags_en,
      image_url,
      published,
      featured,
      author_name,
      published_at
    } = body
    
    const { data: post, error } = await supabase
      .from('blog_posts')
      .update({
        title_pt,
        title_en,
        slug_pt,
        slug_en,
        content_pt,
        content_en,
        excerpt_pt,
        excerpt_en,
        meta_title_pt,
        meta_title_en,
        meta_description_pt,
        meta_description_en,
        category_pt,
        category_en,
        tags_pt,
        tags_en,
        image_url,
        published,
        featured,
        author_name,
        published_at: published && published_at ? published_at : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in blog post update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error in blog post deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}