import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

// Helper function to check admin privileges
async function checkAdminAuth(supabase: any) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { authorized: false, status: 401, message: 'Unauthorized' }
  }

  // Check if user is admin - for now, allow any authenticated user to be admin
  // TODO: Implement proper role-based access control
  if (!session.user.email?.includes('armazemsaojoaquimoficial@gmail.com')) {
    return { authorized: false, status: 403, message: 'Forbidden' }
  }

  return { authorized: true, userId: session.user.id }
}

// GET - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check admin auth
    const authResult = await checkAdminAuth(supabase)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check admin auth
    const authResult = await checkAdminAuth(supabase)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const body = await request.json()
    const { title, content, excerpt, featured_image, published, slug } = body

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, content, and slug are required' 
      }, { status: 400 })
    }

    // Check if slug already exists (excluding current post)
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single()

    if (existingPost) {
      return NextResponse.json({ 
        error: 'Slug already exists. Please choose a different slug.' 
      }, { status: 400 })
    }

    // Get current post to compare published status
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select('published, published_at')
      .eq('id', params.id)
      .single()

    const updateData: BlogPostUpdate = {
      title,
      content,
      excerpt: excerpt || null,
      featured_image: featured_image || null,
      published: published || false,
      slug,
      updated_at: new Date().toISOString()
    }

    // Set published_at if publishing for the first time
    if (published && (!currentPost?.published || !currentPost?.published_at)) {
      updateData.published_at = new Date().toISOString()
    }

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Check admin auth
    const authResult = await checkAdminAuth(supabase)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}