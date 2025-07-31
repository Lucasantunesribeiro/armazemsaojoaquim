-- Migration: Add HTML content field to blog_posts table
-- Date: 2025-01-31
-- Description: Add content_html field to store rich text editor HTML output

-- Add new column for HTML content
ALTER TABLE blog_posts ADD COLUMN content_html TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN blog_posts.content IS 'Original content (Markdown or plain text for legacy posts)';
COMMENT ON COLUMN blog_posts.content_html IS 'HTML content from rich text editor (Tiptap output)';

-- Create index for better search performance on HTML content
CREATE INDEX IF NOT EXISTS idx_blog_posts_content_html ON blog_posts USING gin(to_tsvector('portuguese', content_html));

-- Update existing posts to have HTML content equal to content (for backward compatibility)
UPDATE blog_posts SET content_html = content WHERE content_html IS NULL;