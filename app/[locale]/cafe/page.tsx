'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Eye, Clock, Coffee, IceCream, Cake, Utensils, GlassWater, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import SimpleImage from '@/components/ui/SimpleImage'

// Dynamic import for Dialog component (used conditionally)
const Dialog = dynamic(() => import('@/components/ui/Dialog').then(mod => ({ default: mod.Dialog })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-24" />
})
const DialogContent = dynamic(() => import('@/components/ui/Dialog').then(mod => ({ default: mod.DialogContent })))
const DialogDescription = dynamic(() => import('@/components/ui/Dialog').then(mod => ({ default: mod.DialogDescription })))
const DialogHeader = dynamic(() => import('@/components/ui/Dialog').then(mod => ({ default: mod.DialogHeader })))
const DialogTitle = dynamic(() => import('@/components/ui/Dialog').then(mod => ({ default: mod.DialogTitle })))
const DialogTrigger = dynamic(() => import('@/components/ui/Dialog').then(mod => ({ default: mod.DialogTrigger })))

interface Product {
  id: string
  name: string
  category: 'CAFE' | 'DOCE' | 'SALGADO' | 'BEBIDA' | 'SORVETE'
  description: string
  price: number
  image_url: string
  available: boolean
  preparation_time: number
  ingredients: string[]
  allergens: string[]
  origin: string
  roast_level?: string
  created_at: string
  updated_at: string
}



export default function CafePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  useEffect(() => {
    console.log('🔄 CafePage: Componente montado')
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('📡 CafePage: Iniciando busca de produtos...')
      const response = await fetch('/api/cafe/products')
      console.log('📡 CafePage: Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📡 CafePage: Produtos recebidos:', data)
        setProducts(data.data || [])
      } else {
        console.error('❌ CafePage: Erro na resposta da API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('💥 CafePage: Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
      console.log('✅ CafePage: Loading finalizado')
    }
  }

  const viewProductDetails = (product: Product) => {
    console.log('👁️ CafePage: Visualizando detalhes do produto:', product.name)
    setSelectedProduct(product)
    setIsDetailsModalOpen(true)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CAFE': return <Coffee className="w-4 h-4" />
      case 'DOCE': return <Cake className="w-4 h-4" />
      case 'SALGADO': return <Utensils className="w-4 h-4" />
      case 'BEBIDA': return <GlassWater className="w-4 h-4" />
      case 'SORVETE': return <IceCream className="w-4 h-4" />
      default: return <Coffee className="w-4 h-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'CAFE': return 'Cafés'
      case 'DOCE': return 'Doces'
      case 'SALGADO': return 'Salgados'
      case 'BEBIDA': return 'Bebidas'
      case 'SORVETE': return 'Sorvetes'
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CAFE': return 'bg-amber-100 text-amber-800'
      case 'DOCES': return 'bg-pink-100 text-pink-800'
      case 'SALGADOS': return 'bg-orange-100 text-orange-800'
      case 'BEBIDAS': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProducts = products.filter(product => {
    // Filtro por categoria
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory
    
    // Filtro por busca
    const searchMatch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.ingredients && product.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    
    return categoryMatch && searchMatch
  })

  console.log('🎨 CafePage: Renderizando com', filteredProducts.length, 'produtos')

  if (loading) {
    console.log('⏳ CafePage: Mostrando loading...')
    return (
      <div className="flex items-center justify-center min-h-screen pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinza-claro/20 via-white to-amarelo-armazem/10">
      {/* Header Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <SimpleImage
            src="/images/cafe/cafe-ambiente.avif"
            alt="Ambiente do Café do Armazém"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-madeira-escura/90 via-madeira-escura/70 to-madeira-escura/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amarelo-armazem/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amarelo-armazem/30">
              <Coffee className="w-4 h-4 text-amarelo-armazem" />
              <span className="text-sm font-medium text-amarelo-armazem font-inter">
                Café Especial
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair leading-tight">
              Café do Armazém
              <span className="block text-amarelo-armazem">Sabores Especiais</span>
            </h1>
            
            <p className="text-xl text-cinza-claro max-w-3xl mx-auto leading-relaxed font-inter">
              Desfrute de cafés especiais, doces artesanais e bebidas únicas em nosso ambiente histórico
            </p>
          </div>
        </div>
      </section>

      {/* Cafe Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cinza-medio w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cafés, doces, ingredientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-cinza-claro rounded-xl focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {['all', 'CAFE', 'DOCE', 'SALGADO', 'BEBIDA', 'SORVETE'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center space-x-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-amarelo-armazem text-madeira-escura'
                      : 'bg-white/80 text-cinza-medio hover:bg-amarelo-armazem/20 hover:text-madeira-escura'
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span>{category === 'all' ? 'Todos' : getCategoryLabel(category)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cafe Items */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-amarelo-armazem/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-amarelo-armazem" />
              </div>
              <h3 className="text-xl font-bold text-madeira-escura mb-2">
                Nenhum item encontrado
              </h3>
              <p className="text-cinza-medio">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <SimpleImage
                      src={product.image_url}
                      alt={product.name}
                      fill
                      loading="eager"
                      className="group-hover:scale-105 transition-transform duration-300 object-cover"
                    />
                    
                    {/* Available Badge */}
                    {!product.available && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Indisponível
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-madeira-escura font-playfair">
                        {product.name}
                      </h3>
                      <span className="text-xl font-bold text-amarelo-armazem">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-cinza-medio text-sm leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* Category and Time */}
                    <div className="flex items-center justify-between text-xs text-cinza-medio">
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(product.category)}
                        <span>{getCategoryLabel(product.category)}</span>
                      </div>
                      {product.preparation_time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{product.preparation_time} min</span>
                        </div>
                      )}
                    </div>

                    {/* Ingredients */}
                    {product.ingredients && product.ingredients.length > 0 && (
                      <div className="text-xs text-cinza-medio">
                        <span className="font-medium">Ingredientes:</span> {product.ingredients.slice(0, 3).join(', ')}
                        {product.ingredients.length > 3 && '...'}
                      </div>
                    )}

                    {/* Allergens */}
                    {product.allergens && product.allergens.length > 0 && (
                      <div className="text-xs text-red-600">
                        <span className="font-medium">Alergênicos:</span> {product.allergens.join(', ')}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => viewProductDetails(product)}
                      disabled={!product.available}
                      className="w-full bg-amarelo-armazem hover:bg-vermelho-portas text-madeira-escura hover:text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{product.available ? 'Ver Detalhes' : 'Indisponível'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalhes do Produto */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Detalhes do produto
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Imagem do produto */}
                <div className="aspect-square bg-slate-100 flex items-center justify-center rounded-lg overflow-hidden">
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 text-center p-4">
                      <Coffee className="w-12 h-12 mx-auto mb-2" />
                      <p>Imagem não disponível</p>
                    </div>
                  )}
                </div>

                {/* Informações do produto */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge className={`${getCategoryColor(selectedProduct.category)}`}>
                      {getCategoryLabel(selectedProduct.category)}
                    </Badge>
                    <div className="text-2xl font-bold text-amber-600">
                      R$ {selectedProduct.price.toFixed(2)}
                    </div>
                  </div>

                  {selectedProduct.preparation_time > 0 && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Tempo de preparo: {selectedProduct.preparation_time} minutos
                    </div>
                  )}

                  <p className="text-slate-600">{selectedProduct.description}</p>

                  {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Ingredientes:</h4>
                      <p className="text-sm text-slate-600">
                        {selectedProduct.ingredients.join(', ')}
                      </p>
                    </div>
                  )}

                  {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-red-600">Alergênicos:</h4>
                      <p className="text-sm text-red-600">
                        {selectedProduct.allergens.join(', ')}
                      </p>
                    </div>
                  )}

                  {selectedProduct.origin && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Origem:</h4>
                      <p className="text-sm text-slate-600">{selectedProduct.origin}</p>
                    </div>
                  )}

                  {selectedProduct.roast_level && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Nível de Torra:</h4>
                      <p className="text-sm text-slate-600">{selectedProduct.roast_level}</p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => setIsDetailsModalOpen(false)} 
                  className="w-full"
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Informações do Café */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mt-8">
        <CardHeader>
          <CardTitle>☕ Sobre o Café do Armazém</CardTitle>
          <CardDescription>
            Um espaço acolhedor no coração do Armazém São Joaquim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Horário de Funcionamento</h3>
              <p className="text-sm text-slate-600">
                Segunda a Sexta: 8h às 18h<br />
                Sábado: 9h às 17h<br />
                Domingo: 10h às 16h
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Especialidades</h3>
              <p className="text-sm text-slate-600">
                • Cafés especiais da região<br />
                • Doces caseiros tradicionais<br />
                • Salgados frescos<br />
                • Bebidas geladas naturais
              </p>
            </div>
          </div>
        </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}