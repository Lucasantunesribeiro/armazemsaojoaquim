'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save,
  Eye,
  Calendar,
  Image as ImageIcon,
  Tag,
  FileText,
  Globe,
  Clock,
  CheckCircle,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'
import { RichTextEditor } from './RichTextEditor'
import ImageUpload from '../../components/ImageUpload'

const blogPostSchema = z.object({
  title_pt: z.string().min(1, 'Título em português é obrigatório'),
  title_en: z.string().min(1, 'Título em inglês é obrigatório'),
  slug_pt: z.string().optional(),
  slug_en: z.string().optional(),
  content_pt: z.string().min(1, 'Conteúdo em português é obrigatório'),
  content_en: z.string().min(1, 'Conteúdo em inglês é obrigatório'),
  excerpt_pt: z.string().optional(),
  excerpt_en: z.string().optional(),
  meta_title_pt: z.string().optional(),
  meta_title_en: z.string().optional(),
  meta_description_pt: z.string().optional(),
  meta_description_en: z.string().optional(),
  category_pt: z.string().min(1, 'Categoria em português é obrigatória'),
  category_en: z.string().min(1, 'Categoria em inglês é obrigatória'),
  tags_pt: z.array(z.string()).default([]),
  tags_en: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  author_name: z.string().optional(),
  published_at: z.string().optional()
})

type BlogPostFormData = z.infer<typeof blogPostSchema>

interface BlogPostFormProps {
  initialData?: Partial<BlogPostFormData>
  postId?: string
  locale: string
}

export function BlogPostForm({ initialData, postId, locale }: BlogPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{ categories_pt: string[], categories_en: string[] }>({
    categories_pt: [],
    categories_en: []
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [currentTagInput, setCurrentTagInput] = useState('')
  const [activeTab, setActiveTab] = useState<'pt' | 'en'>('pt')
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      published: false,
      featured: false,
      tags_pt: [],
      tags_en: [],
      ...initialData
    }
  })
  
  const watchedValues = watch()
  
  useEffect(() => {
    loadCategories()
    loadTags()
  }, [])
  
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }
  
  const loadTags = async () => {
    try {
      const response = await fetch(`/api/admin/blog/tags?locale=${activeTab}`)
      const data = await response.json()
      setAvailableTags(data.tags || [])
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  
  const handleTitleChange = (field: 'title_pt' | 'title_en', value: string) => {
    setValue(field, value)
    const slugField = field === 'title_pt' ? 'slug_pt' : 'slug_en'
    if (!watchedValues[slugField]) {
      setValue(slugField, generateSlug(value))
    }
  }
  
  const addTag = (tagType: 'tags_pt' | 'tags_en') => {
    if (!currentTagInput.trim()) return
    
    const currentTags = watchedValues[tagType] || []
    if (!currentTags.includes(currentTagInput.trim())) {
      setValue(tagType, [...currentTags, currentTagInput.trim()])
    }
    setCurrentTagInput('')
  }
  
  const removeTag = (tagType: 'tags_pt' | 'tags_en', tagToRemove: string) => {
    const currentTags = watchedValues[tagType] || []
    setValue(tagType, currentTags.filter(tag => tag !== tagToRemove))
  }
  
  const onSubmit = async (data: BlogPostFormData) => {
    try {
      setLoading(true)
      
      // Auto-generate slugs if not provided
      if (!data.slug_pt && data.title_pt) {
        data.slug_pt = generateSlug(data.title_pt)
      }
      if (!data.slug_en && data.title_en) {
        data.slug_en = generateSlug(data.title_en)
      }
      
      // Set published_at if publishing
      if (data.published && !data.published_at) {
        data.published_at = new Date().toISOString()
      }
      
      const url = postId 
        ? `/api/admin/blog/posts/${postId}`
        : '/api/admin/blog/posts'
      
      const method = postId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save blog post')
      }
      
      const result = await response.json()
      
      toast.success(postId ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!')
      router.push(`/${locale}/admin/blog`)
    } catch (error) {
      console.error('Error saving blog post:', error)
      toast.error('Erro ao salvar post. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSchedulePost = () => {
    const scheduledDate = prompt('Digite a data e hora para publicação (YYYY-MM-DD HH:MM):')
    if (scheduledDate) {
      try {
        const date = new Date(scheduledDate)
        setValue('published_at', date.toISOString())
        setValue('published', false)
        toast.success('Post agendado com sucesso!')
      } catch (error) {
        toast.error('Data inválida. Use o formato YYYY-MM-DD HH:MM')
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {postId ? 'Editar Post' : 'Novo Post'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {postId ? 'Edite as informações do post' : 'Crie um novo post para o blog'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSchedulePost}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Agendar
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('pt')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pt'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4" />
                Português
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'en'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4" />
                English
              </button>
            </div>
            
            {/* Portuguese Content */}
            {activeTab === 'pt' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title_pt">Título *</Label>
                  <Input
                    id="title_pt"
                    {...register('title_pt')}
                    onChange={(e) => handleTitleChange('title_pt', e.target.value)}
                    placeholder="Digite o título do post em português"
                    className={errors.title_pt ? 'border-red-500' : ''}
                  />
                  {errors.title_pt && (
                    <p className="text-red-500 text-sm mt-1">{errors.title_pt.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="slug_pt">Slug</Label>
                  <Input
                    id="slug_pt"
                    {...register('slug_pt')}
                    placeholder="slug-do-post"
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt_pt">Resumo</Label>
                  <Textarea
                    id="excerpt_pt"
                    {...register('excerpt_pt')}
                    placeholder="Breve descrição do post"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content_pt">Conteúdo *</Label>
                  <Controller
                    name="content_pt"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Escreva o conteúdo do post em português..."
                      />
                    )}
                  />
                  {errors.content_pt && (
                    <p className="text-red-500 text-sm mt-1">{errors.content_pt.message}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* English Content */}
            {activeTab === 'en' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title_en">Title *</Label>
                  <Input
                    id="title_en"
                    {...register('title_en')}
                    onChange={(e) => handleTitleChange('title_en', e.target.value)}
                    placeholder="Enter the post title in English"
                    className={errors.title_en ? 'border-red-500' : ''}
                  />
                  {errors.title_en && (
                    <p className="text-red-500 text-sm mt-1">{errors.title_en.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="slug_en">Slug</Label>
                  <Input
                    id="slug_en"
                    {...register('slug_en')}
                    placeholder="post-slug"
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt_en">Excerpt</Label>
                  <Textarea
                    id="excerpt_en"
                    {...register('excerpt_en')}
                    placeholder="Brief description of the post"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content_en">Content *</Label>
                  <Controller
                    name="content_en"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Write the post content in English..."
                      />
                    )}
                  />
                  {errors.content_en && (
                    <p className="text-red-500 text-sm mt-1">{errors.content_en.message}</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configurações de Publicação
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publicado</Label>
                <Controller
                  name="published"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="published"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Destaque</Label>
                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="author_name">Autor</Label>
                <Input
                  id="author_name"
                  {...register('author_name')}
                  placeholder="Nome do autor"
                />
              </div>
              
              {watchedValues.published_at && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Agendado para: {new Date(watchedValues.published_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Categories */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Categorias
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="category_pt">Categoria (PT) *</Label>
                <select
                  id="category_pt"
                  {...register('category_pt')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.categories_pt.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category_pt && (
                  <p className="text-red-500 text-sm mt-1">{errors.category_pt.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="category_en">Category (EN) *</Label>
                <select
                  id="category_en"
                  {...register('category_en')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.categories_en.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category_en && (
                  <p className="text-red-500 text-sm mt-1">{errors.category_en.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tags
            </h3>
            
            <div className="space-y-4">
              {/* Portuguese Tags */}
              <div>
                <Label>Tags (PT)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentTagInput}
                    onChange={(e) => setCurrentTagInput(e.target.value)}
                    placeholder="Digite uma tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag('tags_pt')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addTag('tags_pt')}
                    size="sm"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(watchedValues.tags_pt || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag('tags_pt', tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* English Tags */}
              <div>
                <Label>Tags (EN)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentTagInput}
                    onChange={(e) => setCurrentTagInput(e.target.value)}
                    placeholder="Enter a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag('tags_en')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addTag('tags_en')}
                    size="sm"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(watchedValues.tags_en || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag('tags_en', tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Featured Image */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Imagem Destacada
            </h3>
            
            <div>
              <Label htmlFor="image_url">Imagem</Label>
              <ImageUpload
                value={watchedValues.image_url}
                onChange={(url) => setValue('image_url', url)}
                onRemove={() => setValue('image_url', '')}
              />

              {watchedValues.image_url && (
                <div className="mt-3">
                  <img
                    src={watchedValues.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* SEO Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configurações SEO
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta_title_pt">Meta Título (PT)</Label>
                <Input
                  id="meta_title_pt"
                  {...register('meta_title_pt')}
                  placeholder="Título para SEO em português"
                />
              </div>
              
              <div>
                <Label htmlFor="meta_title_en">Meta Title (EN)</Label>
                <Input
                  id="meta_title_en"
                  {...register('meta_title_en')}
                  placeholder="SEO title in English"
                />
              </div>
              
              <div>
                <Label htmlFor="meta_description_pt">Meta Descrição (PT)</Label>
                <Textarea
                  id="meta_description_pt"
                  {...register('meta_description_pt')}
                  placeholder="Descrição para SEO em português"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="meta_description_en">Meta Description (EN)</Label>
                <Textarea
                  id="meta_description_en"
                  {...register('meta_description_en')}
                  placeholder="SEO description in English"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}