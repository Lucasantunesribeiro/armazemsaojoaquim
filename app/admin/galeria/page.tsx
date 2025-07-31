'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff, Package, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAdmin } from '@/hooks/useAdmin'

interface Artwork {
  id: string
  title: string
  artist: string
  category: 'pintura' | 'escultura' | 'fotografia' | 'gravura' | 'desenho' | 'arte_digital'
  technique?: string
  dimensions?: string
  year_created?: number
  price: number
  description?: string
  image_url?: string
  gallery_images?: string[]
  available: boolean
  featured: boolean
  tags?: string[]
  provenance?: string
  certificate_authenticity: boolean
  artist_bio?: string
  condition: 'excelente' | 'muito_bom' | 'bom' | 'regular' | 'necessita_restauro'
  frame_included: boolean
  shipping_info?: string
  created_at: string
  updated_at?: string
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_address?: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  payment_method?: string
  shipping_method?: string
  notes?: string
  created_at: string
  updated_at?: string
}

const artworkCategories = [
  { value: 'pintura', label: 'Pintura' },
  { value: 'escultura', label: 'Escultura' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'gravura', label: 'Gravura' },
  { value: 'desenho', label: 'Desenho' },
  { value: 'arte_digital', label: 'Arte Digital' }
]

const conditionOptions = [
  { value: 'excelente', label: 'Excelente' },
  { value: 'muito_bom', label: 'Muito Bom' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'necessita_restauro', label: 'Necessita Restauro' }
]

const orderStatuses = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
]

export default function AdminGaleriaPage() {
  const { supabase } = useSupabase()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [activeTab, setActiveTab] = useState<'artworks' | 'orders'>('artworks')
  
  // Artwork state
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [showArtworkForm, setShowArtworkForm] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Artwork>>({
    title: '',
    artist: '',
    category: 'pintura',
    technique: '',
    dimensions: '',
    year_created: new Date().getFullYear(),
    price: 0,
    description: '',
    image_url: '',
    gallery_images: [],
    available: true,
    featured: false,
    tags: [],
    provenance: '',
    certificate_authenticity: false,
    artist_bio: '',
    condition: 'excelente',
    frame_included: false,
    shipping_info: ''
  })

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadArtworks()
      loadOrders()
    }
  }, [adminLoading, isAdmin])

  const loadArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('galeria_artworks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('galeria_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSubmitArtwork = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingArtwork) {
        const { error } = await supabase
          .from('galeria_artworks')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArtwork.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('galeria_artworks')
          .insert([formData])

        if (error) throw error
      }

      await loadArtworks()
      setShowArtworkForm(false)
      setEditingArtwork(null)
      resetForm()
      alert(editingArtwork ? 'Obra atualizada!' : 'Obra criada!')
    } catch (error) {
      console.error('Erro ao salvar obra:', error)
      alert('Erro ao salvar obra')
    }
  }

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork)
    setFormData({
      title: artwork.title,
      artist: artwork.artist,
      category: artwork.category,
      technique: artwork.technique,
      dimensions: artwork.dimensions,
      year_created: artwork.year_created,
      price: artwork.price,
      description: artwork.description,
      image_url: artwork.image_url,
      gallery_images: artwork.gallery_images || [],
      available: artwork.available,
      featured: artwork.featured,
      tags: artwork.tags || [],
      provenance: artwork.provenance,
      certificate_authenticity: artwork.certificate_authenticity,
      artist_bio: artwork.artist_bio,
      condition: artwork.condition,
      frame_included: artwork.frame_included,
      shipping_info: artwork.shipping_info
    })
    setShowArtworkForm(true)
  }

  const handleDeleteArtwork = async (artwork: Artwork) => {
    if (!confirm(`Tem certeza que deseja excluir a obra "${artwork.title}"?`)) return

    try {
      const { error } = await supabase
        .from('galeria_artworks')
        .delete()
        .eq('id', artwork.id)

      if (error) throw error
      
      await loadArtworks()
      alert('Obra excluída!')
    } catch (error) {
      console.error('Erro ao excluir obra:', error)
      alert('Erro ao excluir obra')
    }
  }

  const toggleAvailability = async (artwork: Artwork) => {
    try {
      const { error } = await supabase
        .from('galeria_artworks')
        .update({ 
          available: !artwork.available,
          updated_at: new Date().toISOString()
        })
        .eq('id', artwork.id)

      if (error) throw error
      await loadArtworks()
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error)
    }
  }

  const toggleFeatured = async (artwork: Artwork) => {
    try {
      const { error } = await supabase
        .from('galeria_artworks')
        .update({ 
          featured: !artwork.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', artwork.id)

      if (error) throw error
      await loadArtworks()
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('galeria_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error
      await loadOrders()
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      category: 'pintura',
      technique: '',
      dimensions: '',
      year_created: new Date().getFullYear(),
      price: 0,
      description: '',
      image_url: '',
      gallery_images: [],
      available: true,
      featured: false,
      tags: [],
      provenance: '',
      certificate_authenticity: false,
      artist_bio: '',
      condition: 'excelente',
      frame_included: false,
      shipping_info: ''
    })
  }

  const handleArrayInput = (field: 'tags' | 'gallery_images', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData({ ...formData, [field]: array })
  }

  const filteredArtworks = selectedCategory === 'all' 
    ? artworks 
    : artworks.filter(artwork => artwork.category === selectedCategory)

  if (adminLoading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (!isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Acesso negado</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Galeria de Arte
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Administre obras de arte e pedidos da galeria
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('artworks')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'artworks'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-700'
            }`}
          >
            Obras de Arte ({artworks.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-700'
            }`}
          >
            Pedidos ({orders.length})
          </button>
        </div>

        {/* Artworks Tab */}
        {activeTab === 'artworks' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                >
                  Todas ({artworks.length})
                </Button>
                {artworkCategories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.value)}
                    size="sm"
                  >
                    {category.label} ({artworks.filter(a => a.category === category.value).length})
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => {
                  setShowArtworkForm(true)
                  setEditingArtwork(null)
                  resetForm()
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Obra
              </Button>
            </div>

            {/* Artwork Form Modal */}
            {showArtworkForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">
                      {editingArtwork ? 'Editar Obra' : 'Nova Obra'}
                    </h2>
                    
                    <form onSubmit={handleSubmitArtwork} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Título da Obra</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Paisagem de Santa Teresa"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="artist">Artista</Label>
                          <Input
                            id="artist"
                            value={formData.artist}
                            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                            placeholder="Nome do artista"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="category">Categoria</Label>
                          <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            className="w-full p-2 border rounded-lg"
                            required
                          >
                            {artworkCategories.map(category => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="technique">Técnica</Label>
                          <Input
                            id="technique"
                            value={formData.technique || ''}
                            onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                            placeholder="Ex: Óleo sobre tela"
                          />
                        </div>

                        <div>
                          <Label htmlFor="year_created">Ano de Criação</Label>
                          <Input
                            id="year_created"
                            type="number"
                            value={formData.year_created || ''}
                            onChange={(e) => setFormData({ ...formData, year_created: parseInt(e.target.value) })}
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="price">Preço (R$)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="dimensions">Dimensões</Label>
                          <Input
                            id="dimensions"
                            value={formData.dimensions || ''}
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                            placeholder="Ex: 50x70 cm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="condition">Condição</Label>
                          <select
                            id="condition"
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                            className="w-full p-2 border rounded-lg"
                            required
                          >
                            {conditionOptions.map(condition => (
                              <option key={condition.value} value={condition.value}>
                                {condition.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <textarea
                          id="description"
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full p-2 border rounded-lg h-24"
                          placeholder="Descrição da obra..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="artist_bio">Biografia do Artista</Label>
                        <textarea
                          id="artist_bio"
                          value={formData.artist_bio || ''}
                          onChange={(e) => setFormData({ ...formData, artist_bio: e.target.value })}
                          className="w-full p-2 border rounded-lg h-20"
                          placeholder="Breve biografia do artista..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="image_url">URL da Imagem Principal</Label>
                          <Input
                            id="image_url"
                            value={formData.image_url || ''}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>

                        <div>
                          <Label htmlFor="gallery_images">Imagens da Galeria (separadas por vírgula)</Label>
                          <Input
                            id="gallery_images"
                            value={formData.gallery_images?.join(', ') || ''}
                            onChange={(e) => handleArrayInput('gallery_images', e.target.value)}
                            placeholder="url1, url2, url3"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                          <Input
                            id="tags"
                            value={formData.tags?.join(', ') || ''}
                            onChange={(e) => handleArrayInput('tags', e.target.value)}
                            placeholder="paisagem, natureza, cores"
                          />
                        </div>

                        <div>
                          <Label htmlFor="provenance">Proveniência</Label>
                          <Input
                            id="provenance"
                            value={formData.provenance || ''}
                            onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                            placeholder="Origem da obra"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shipping_info">Informações de Entrega</Label>
                        <Input
                          id="shipping_info"
                          value={formData.shipping_info || ''}
                          onChange={(e) => setFormData({ ...formData, shipping_info: e.target.value })}
                          placeholder="Detalhes sobre entrega e embalagem"
                        />
                      </div>

                      <div className="flex gap-6 flex-wrap">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="available"
                            checked={formData.available}
                            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                          />
                          <Label htmlFor="available">Disponível para venda</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          />
                          <Label htmlFor="featured">Obra em destaque</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="certificate_authenticity"
                            checked={formData.certificate_authenticity}
                            onChange={(e) => setFormData({ ...formData, certificate_authenticity: e.target.checked })}
                          />
                          <Label htmlFor="certificate_authenticity">Certificado de autenticidade</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="frame_included"
                            checked={formData.frame_included}
                            onChange={(e) => setFormData({ ...formData, frame_included: e.target.checked })}
                          />
                          <Label htmlFor="frame_included">Moldura incluída</Label>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                          {editingArtwork ? 'Atualizar' : 'Criar'} Obra
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowArtworkForm(false)
                            setEditingArtwork(null)
                            resetForm()
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              </div>
            )}

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando obras...</p>
                </div>
              ) : filteredArtworks.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCategory === 'all' 
                      ? 'Nenhuma obra cadastrada ainda.' 
                      : `Nenhuma obra encontrada na categoria ${artworkCategories.find(c => c.value === selectedCategory)?.label}.`
                    }
                  </p>
                </div>
              ) : (
                filteredArtworks.map((artwork) => (
                  <Card key={artwork.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{artwork.title}</h3>
                        <p className="text-purple-600 dark:text-purple-400">{artwork.artist}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-purple-100 text-purple-800">
                            {artworkCategories.find(c => c.value === artwork.category)?.label}
                          </Badge>
                          {artwork.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Destaque
                            </Badge>
                          )}
                          {artwork.certificate_authenticity && (
                            <Badge className="bg-green-100 text-green-800">
                              Certificado
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(artwork)}
                          className={artwork.featured ? 'text-yellow-600' : ''}
                        >
                          {artwork.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAvailability(artwork)}
                          className={artwork.available ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                        >
                          {artwork.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditArtwork(artwork)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteArtwork(artwork)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {artwork.image_url && (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preço:</span>
                        <span className="font-bold text-purple-600">R$ {artwork.price.toLocaleString('pt-BR')}</span>
                      </div>
                      {artwork.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dimensões:</span>
                          <span>{artwork.dimensions}</span>
                        </div>
                      )}
                      {artwork.year_created && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ano:</span>
                          <span>{artwork.year_created}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge className={artwork.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {artwork.available ? 'Disponível' : 'Indisponível'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(artwork.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Nenhum pedido realizado ainda.</p>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Pedido #{order.id.slice(0, 8)}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.customer_email}</p>
                      {order.customer_phone && (
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        R$ {order.total_amount.toLocaleString('pt-BR')}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="p-2 border rounded-lg text-sm"
                      >
                        {orderStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Data do Pedido:</p>
                      <p className="font-semibold">
                        {new Date(order.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {order.customer_address && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Endereço:</p>
                        <p className="font-semibold">{order.customer_address}</p>
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Observações:</p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Badge className={orderStatuses.find(s => s.value === order.status)?.color}>
                      {orderStatuses.find(s => s.value === order.status)?.label}
                    </Badge>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}