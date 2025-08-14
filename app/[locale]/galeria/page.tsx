'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, Heart, Eye, Star, MapPin, Calendar, Palette, User, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'

// Dynamic import for SafeImage component
const SafeImage = dynamic(() => import('@/components/ui/SafeImage'), {
  loading: () => <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg" />
})
import { useTranslations } from '@/hooks/useTranslations'

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

interface GaleriaPageProps {
  params: Promise<{ locale: string }>
}

export default function GaleriaPage({ params }: GaleriaPageProps) {
  // TODOS OS HOOKS DEVEM VIR PRIMEIRO - NUNCA MOVER PARA DENTRO DE CONDICIONAIS
  const [locale, setLocale] = useState<string>('pt')
  const [artworks, setArtworks] = useState<Artwork[]>([])  
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { t, isReady } = useTranslations()
  
  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale)
    })
  }, [params])

  const getCategories = () => [
    { 
      value: 'all', 
      label: t('gallery.categories.all') || 'Todas as Categorias', 
      icon: Palette 
    },
    { 
      value: 'SANTA_TERESA_HISTORICA', 
      label: t('gallery.categories.historical') || 'Santa Teresa Histórica', 
      icon: MapPin 
    },
    { 
      value: 'RIO_ANTIGO', 
      label: t('gallery.categories.oldRio') || 'Rio Antigo', 
      icon: Calendar 
    },
    { 
      value: 'ARTE_CONTEMPORANEA', 
      label: t('gallery.categories.contemporary') || 'Arte Contemporânea', 
      icon: Palette 
    },
    { 
      value: 'RETRATOS_BAIRRO', 
      label: t('gallery.categories.neighborhood') || 'Retratos do Bairro', 
      icon: User 
    }
  ]

  const fetchArtworks = useCallback(async () => {
    if (!isReady) return // Proteção adicional
    
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory)
      }
      
      const response = await fetch(`/api/gallery?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setArtworks(data.data)
      }
    } catch (error) {
      console.error('Error loading artworks:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, isReady])

  useEffect(() => {
    if (isReady) {
      fetchArtworks()
    }
  }, [fetchArtworks])

  // Early return APÓS todos os hooks
  if (!isReady) {
    return (
      <div className="min-h-screen pt-32">
        <Loading />
      </div>
    )
  }

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFavorite = (artworkId: string) => {
    setFavorites(prev => 
      prev.includes(artworkId) 
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    )
  }

  const shareArtwork = (artwork: Artwork) => {
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `${locale === 'en' ? 'Check out this artwork:' : 'Confira esta obra de arte:'} ${artwork.title} ${t('gallery.artwork.by') || 'por'} ${artwork.artist}`,
        url: window.location.href
      })
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(`${artwork.title} ${t('gallery.artwork.by') || 'por'} ${artwork.artist} - ${window.location.href}`)
      alert(locale === 'en' ? 'Link copied to clipboard!' : 'Link copiado para a área de transferência!')
    }
  }

  const openModal = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedArtwork(null)
    setIsModalOpen(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getCategoryLabel = (category: string) => {
    const categories = getCategories()
    const cat = categories.find(c => c.value === category)
    return cat?.label || category
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen pt-32 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 font-serif">
              {t('gallery.title') || 'Galeria de Arte'}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 max-w-3xl mx-auto">
              {t('gallery.subtitle') || 'Memórias de Santa Teresa em cada pincelada'}
            </p>
            <div className="flex items-center justify-center space-x-2 text-amber-700 dark:text-amber-300">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">{t('gallery.quote') || '"En esta casa tenemos memoria"'}</span>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('gallery.search.placeholder') || 'Buscar por título, artista ou descrição...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full"
                />
              </div>

              {/* Categorias */}
              <div className="flex flex-wrap gap-2">
                {getCategories().map((category) => {
                  const IconComponent = category.icon
                  return (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category.value)}
                      className="flex items-center space-x-2"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{category.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Grade de Quadros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork) => (
              <Card key={artwork.id} className="group overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <SafeImage
                    src={artwork.image_url || '/images/placeholder-art.jpg'}
                    alt={artwork.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(artwork)}
                      className="bg-white/90 hover:bg-white text-slate-900 border-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFavorite(artwork.id)}
                      className={`border-0 ${favorites.includes(artwork.id) 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-white/90 hover:bg-white text-slate-900'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(artwork.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareArtwork(artwork)}
                      className="bg-white/90 hover:bg-white text-slate-900 border-0"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Badge de destaque */}
                  {artwork.featured && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{t('gallery.artwork.featured') || 'Destaque'}</span>
                    </div>
                  )}

                  {/* Badge de categoria */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 text-white px-2 py-1 rounded-full text-xs">
                    {getCategoryLabel(artwork.category)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {artwork.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {t('gallery.artwork.by') || 'por'} {artwork.artist}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                    {artwork.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {formatPrice(artwork.price)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {artwork.dimensions}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <Palette className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('gallery.artwork.noResults.title') || 'Nenhum quadro encontrado'}</h3>
                <p>{t('gallery.artwork.noResults.message') || 'Tente ajustar os filtros ou termos de busca.'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {isModalOpen && selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Imagem */}
              <div className="relative">
                <SafeImage
                  src={selectedArtwork.image_url || '/images/placeholder-art.jpg'}
                  alt={selectedArtwork.title}
                  className="w-full h-auto rounded-lg"
                />
                {selectedArtwork.featured && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{t('gallery.artwork.featured') || 'Destaque'}</span>
                  </div>
                )}
              </div>

              {/* Detalhes */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {selectedArtwork.title}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                    {t('gallery.artwork.by') || 'por'} {selectedArtwork.artist}
                  </p>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                    {formatPrice(selectedArtwork.price)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Palette className="w-4 h-4" />
                    <span>{getCategoryLabel(selectedArtwork.category)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-4 h-4 border border-slate-400 rounded"></div>
                    <span>{selectedArtwork.dimensions}</span>
                  </div>
                  {selectedArtwork.year_created && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedArtwork.year_created}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{t('gallery.artwork.details.description') || 'Descrição'}</h4>
                    <p className="text-slate-700 dark:text-slate-300">{selectedArtwork.description}</p>
                  </div>
                  
                  {selectedArtwork.historical_context && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{t('gallery.artwork.details.historicalContext') || 'Contexto Histórico'}</h4>
                      <p className="text-slate-700 dark:text-slate-300">{selectedArtwork.historical_context}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => shareArtwork(selectedArtwork)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t('gallery.artwork.actions.share') || 'Compartilhar'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleFavorite(selectedArtwork.id)}
                    className={favorites.includes(selectedArtwork.id) ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(selectedArtwork.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="w-full mt-4"
                >
                  {t('gallery.artwork.actions.close') || 'Fechar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}