'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Star, Image as ImageIcon, DollarSign, Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import SafeImage from '@/components/ui/SafeImage'
import Loading from '@/components/ui/Loading'
import { useAdmin } from '@/hooks/useAdmin'
import { useRouter } from 'next/navigation'

interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  price: number
  image_url: string
  category: string
  dimensions: string
  year_created: number
  historical_context: string
  stock_quantity: number
  featured: boolean
  created_at: string
  updated_at: string
}

const categories = [
  { value: 'SANTA_TERESA_HISTORICA', label: 'Santa Teresa Histórica' },
  { value: 'RIO_ANTIGO', label: 'Rio Antigo' },
  { value: 'ARTE_CONTEMPORANEA', label: 'Arte Contemporânea' },
  { value: 'RETRATOS_BAIRRO', label: 'Retratos do Bairro' }
]

export default function AdminGaleriaPage() {
  const { isAdmin, loading: adminLoading } = useAdmin()
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    totalValue: 0,
    lowStock: 0
  })

  // Form data para criação/edição
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    price: '',
    image_url: '',
    category: 'SANTA_TERESA_HISTORICA',
    dimensions: '',
    year_created: '',
    historical_context: '',
    stock_quantity: '1',
    featured: false
  })

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/unauthorized')
      return
    }
    
    if (isAdmin) {
      fetchArtworks()
    }
  }, [isAdmin, adminLoading, router])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery')
      const data = await response.json()
      
      if (data.success) {
        setArtworks(data.data)
        calculateStats(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar quadros:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (artworks: Artwork[]) => {
    const stats = {
      total: artworks.length,
      featured: artworks.filter(a => a.featured).length,
      totalValue: artworks.reduce((sum, a) => sum + (Number(a.price) * a.stock_quantity), 0),
      lowStock: artworks.filter(a => a.stock_quantity <= 1).length
    }
    setStats(stats)
  }

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.artist.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openModal = (artwork?: Artwork) => {
    if (artwork) {
      setSelectedArtwork(artwork)
      setFormData({
        title: artwork.title,
        artist: artwork.artist,
        description: artwork.description || '',
        price: artwork.price.toString(),
        image_url: artwork.image_url || '',
        category: artwork.category,
        dimensions: artwork.dimensions || '',
        year_created: artwork.year_created?.toString() || '',
        historical_context: artwork.historical_context || '',
        stock_quantity: artwork.stock_quantity.toString(),
        featured: artwork.featured
      })
      setIsEditMode(true)
    } else {
      setSelectedArtwork(null)
      setFormData({
        title: '',
        artist: '',
        description: '',
        price: '',
        image_url: '',
        category: 'SANTA_TERESA_HISTORICA',
        dimensions: '',
        year_created: '',
        historical_context: '',
        stock_quantity: '1',
        featured: false
      })
      setIsEditMode(false)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedArtwork(null)
    setIsEditMode(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = isEditMode ? `/api/gallery/${selectedArtwork?.id}` : '/api/gallery'
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        closeModal()
        fetchArtworks()
      } else {
        alert(data.error || 'Erro ao salvar quadro')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar quadro')
    }
  }

  const handleDelete = async (artworkId: string) => {
    if (!confirm('Tem certeza que deseja deletar este quadro?')) return
    
    try {
      const response = await fetch(`/api/gallery/${artworkId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchArtworks()
      } else {
        alert(data.error || 'Erro ao deletar quadro')
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao deletar quadro')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen pt-20">
        <Loading />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Gerenciar Galeria de Arte
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Administre os quadros da galeria Armazém São Joaquim
              </p>
            </div>
            <Button onClick={() => openModal()} className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Quadro
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total de Quadros</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.featured}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Em Destaque</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(stats.totalValue)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Valor Total</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lowStock}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Estoque Baixo</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Busca */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por título ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Lista de Quadros */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Quadro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                  {filteredArtworks.map((artwork) => (
                    <tr key={artwork.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <SafeImage
                            src={artwork.image_url || '/images/placeholder-art.jpg'}
                            alt={artwork.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {artwork.title}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              por {artwork.artist}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                        {formatPrice(artwork.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {categories.find(c => c.value === artwork.category)?.label}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          artwork.stock_quantity <= 1 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {artwork.stock_quantity} unid.
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {artwork.featured && (
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                          )}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            artwork.stock_quantity > 0 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {artwork.stock_quantity > 0 ? 'Disponível' : 'Esgotado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModal(artwork)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(artwork.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredArtworks.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Nenhum quadro encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece adicionando seu primeiro quadro.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => openModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Quadro
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {isEditMode ? 'Editar Quadro' : 'Novo Quadro'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Título *
                    </label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Artista *
                    </label>
                    <Input
                      type="text"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Preço (R$) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Dimensões
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 50x70cm"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ano
                    </label>
                    <Input
                      type="number"
                      value={formData.year_created}
                      onChange={(e) => setFormData({ ...formData, year_created: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Categoria *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estoque *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    URL da Imagem
                  </label>
                  <Input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contexto Histórico
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows={3}
                    value={formData.historical_context}
                    onChange={(e) => setFormData({ ...formData, historical_context: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Quadro em destaque
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {isEditMode ? 'Salvar Alterações' : 'Criar Quadro'}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}