'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Save, X } from 'lucide-react'

interface BlogPostFormProps {
  initialData?: any
}

export function BlogPostForm({ initialData = null }: BlogPostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title_pt: initialData?.title_pt || '',
    title_en: initialData?.title_en || '',
    slug_pt: initialData?.slug_pt || '',
    slug_en: initialData?.slug_en || '',
    content_pt: initialData?.content_pt || '',
    content_en: initialData?.content_en || '',
    excerpt_pt: initialData?.excerpt_pt || '',
    excerpt_en: initialData?.excerpt_en || '',
    image_url: initialData?.image_url || '',
    meta_title_pt: initialData?.meta_title_pt || '',
    meta_title_en: initialData?.meta_title_en || '',
    meta_description_pt: initialData?.meta_description_pt || '',
    meta_description_en: initialData?.meta_description_en || '',
    category_pt: initialData?.category_pt || 'geral',
    category_en: initialData?.category_en || 'general',
    tags_pt: initialData?.tags_pt?.join(', ') || '',
    tags_en: initialData?.tags_en?.join(', ') || '',
    published: initialData?.published || false,
    featured: initialData?.featured || false,
  })

  // Auto-generate slugs
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (field: 'title_pt' | 'title_en', value: string) => {
    const slugField = field === 'title_pt' ? 'slug_pt' : 'slug_en'
    setFormData(prev => ({
      ...prev,
      [field]: value,
      [slugField]: generateSlug(value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const postData = {
        ...formData,
        tags_pt: formData.tags_pt.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        tags_en: formData.tags_en.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        published_at: formData.published ? new Date().toISOString() : null,
        author_name: 'Administrador' // Get from session in real implementation
      }

      const url = initialData ? `/api/admin/blog/${initialData.id}` : '/api/admin/blog'
      const method = initialData ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar post')
      }

      router.push('/pt/admin/blog')
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar post:', error)
      alert('Erro ao salvar post. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {initialData ? 'Editar Post' : 'Novo Post'}
          </h1>
          <p className="text-gray-600">
            Crie conteúdo simultâneo em português e inglês
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => router.push('/pt/admin/blog')}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Status Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Publicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
              />
              <Label>Publicado</Label>
              {formData.published && <Badge variant="default">Ativo</Badge>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label>Post em Destaque</Label>
              {formData.featured && <Badge variant="secondary">Destaque</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Multilingual Content */}
        <Tabs defaultValue="pt" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pt">🇧🇷 Português</TabsTrigger>
            <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
          </TabsList>

          {/* Portuguese Content */}
          <TabsContent value="pt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo em Português</CardTitle>
                <CardDescription>Informações do post em português</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title_pt">Título *</Label>
                    <Input
                      id="title_pt"
                      value={formData.title_pt}
                      onChange={(e) => handleTitleChange('title_pt', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slug_pt">Slug (URL) *</Label>
                    <Input
                      id="slug_pt"
                      value={formData.slug_pt}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug_pt: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt_pt">Resumo</Label>
                  <Textarea
                    id="excerpt_pt"
                    value={formData.excerpt_pt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt_pt: e.target.value }))}
                    rows={3}
                    placeholder="Um breve resumo do post..."
                  />
                </div>

                <div>
                  <Label htmlFor="content_pt">Conteúdo *</Label>
                  <Textarea
                    id="content_pt"
                    value={formData.content_pt}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_pt: e.target.value }))}
                    rows={12}
                    required
                    placeholder="Conteúdo completo do post em HTML..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category_pt">Categoria</Label>
                    <Input
                      id="category_pt"
                      value={formData.category_pt}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_pt: e.target.value }))}
                      placeholder="gastronomia, cultura, bebidas..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags_pt">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags_pt"
                      value={formData.tags_pt}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags_pt: e.target.value }))}
                      placeholder="mixologia, coquetéis, santa teresa"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* English Content */}
          <TabsContent value="en" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>English Content</CardTitle>
                <CardDescription>Post information in English</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title_en">Title *</Label>
                    <Input
                      id="title_en"
                      value={formData.title_en}
                      onChange={(e) => handleTitleChange('title_en', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slug_en">Slug (URL) *</Label>
                    <Input
                      id="slug_en"
                      value={formData.slug_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug_en: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt_en">Excerpt</Label>
                  <Textarea
                    id="excerpt_en"
                    value={formData.excerpt_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt_en: e.target.value }))}
                    rows={3}
                    placeholder="A brief summary of the post..."
                  />
                </div>

                <div>
                  <Label htmlFor="content_en">Content *</Label>
                  <Textarea
                    id="content_en"
                    value={formData.content_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                    rows={12}
                    required
                    placeholder="Full post content in HTML..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category_en">Category</Label>
                    <Input
                      id="category_en"
                      value={formData.category_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_en: e.target.value }))}
                      placeholder="gastronomy, culture, drinks..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags_en">Tags (comma separated)</Label>
                    <Input
                      id="tags_en"
                      value={formData.tags_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags_en: e.target.value }))}
                      placeholder="mixology, cocktails, santa teresa"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SEO & Media */}
        <Card>
          <CardHeader>
            <CardTitle>SEO e Mídia</CardTitle>
            <CardDescription>Configurações de SEO e imagem destacada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image_url">URL da Imagem Destacada</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meta_title_pt">Meta Title (PT)</Label>
                <Input
                  id="meta_title_pt"
                  value={formData.meta_title_pt}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title_pt: e.target.value }))}
                  placeholder="Título para SEO em português"
                />
              </div>
              
              <div>
                <Label htmlFor="meta_title_en">Meta Title (EN)</Label>
                <Input
                  id="meta_title_en"
                  value={formData.meta_title_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title_en: e.target.value }))}
                  placeholder="SEO title in English"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meta_description_pt">Meta Description (PT)</Label>
                <Textarea
                  id="meta_description_pt"
                  value={formData.meta_description_pt}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description_pt: e.target.value }))}
                  rows={3}
                  placeholder="Descrição para SEO em português..."
                />
              </div>
              
              <div>
                <Label htmlFor="meta_description_en">Meta Description (EN)</Label>
                <Textarea
                  id="meta_description_en"
                  value={formData.meta_description_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description_en: e.target.value }))}
                  rows={3}
                  placeholder="SEO description in English..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {initialData ? 'Atualizar Post' : 'Criar Post'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}