'use client'

import { useState, useEffect } from 'react'
import { Eye, Clock, Coffee, IceCream, Cake, Utensils, GlassWater } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'

interface Product {
  id: string
  name: string
  category: 'CAFE' | 'DOCES' | 'SALGADOS' | 'BEBIDAS'
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
      case 'DOCES': return <Cake className="w-4 h-4" />
      case 'SALGADOS': return <Utensils className="w-4 h-4" />
      case 'BEBIDAS': return <GlassWater className="w-4 h-4" />
      default: return <Coffee className="w-4 h-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'CAFE': return 'Cafés'
      case 'DOCES': return 'Doces'
      case 'SALGADOS': return 'Salgados'
      case 'BEBIDAS': return 'Bebidas'
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

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

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
    <div className="container mx-auto py-8 px-4 pt-32">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-800 mb-2">☕ Café do Armazém</h1>
        <p className="text-slate-600">Sabores especiais em um ambiente histórico</p>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </Button>
          <Button
            variant={selectedCategory === 'CAFE' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('CAFE')}
          >
            <Coffee className="w-4 h-4 mr-2" />
            Cafés
          </Button>
          <Button
            variant={selectedCategory === 'DOCES' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('DOCES')}
          >
            <Cake className="w-4 h-4 mr-2" />
            Doces
          </Button>
          <Button
            variant={selectedCategory === 'SALGADOS' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('SALGADOS')}
          >
            <Utensils className="w-4 h-4 mr-2" />
            Salgados
          </Button>
          <Button
            variant={selectedCategory === 'BEBIDAS' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('BEBIDAS')}
          >
            <GlassWater className="w-4 h-4 mr-2" />
            Bebidas
          </Button>
        </div>
      </div>

      {/* Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-slate-100 flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-center p-4">
                  <Coffee className="w-12 h-12 mx-auto mb-2" />
                  <p>Imagem não disponível</p>
                </div>
              )}
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge className={`${getCategoryColor(product.category)} mt-1`}>
                    {getCategoryLabel(product.category)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-600">
                    R$ {product.price.toFixed(2)}
                  </div>
                  {product.preparation_time > 0 && (
                    <div className="text-sm text-slate-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {product.preparation_time} min
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
              
              {product.ingredients.length > 0 && (
                <div className="text-xs text-slate-500">
                  <strong>Ingredientes:</strong> {product.ingredients.slice(0, 3).join(', ')}
                  {product.ingredients.length > 3 && '...'}
                </div>
              )}

              {product.allergens.length > 0 && (
                <div className="text-xs text-red-600">
                  <strong>Alergênicos:</strong> {product.allergens.join(', ')}
                </div>
              )}

              <Button 
                onClick={() => viewProductDetails(product)}
                disabled={!product.available}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                {product.available ? 'Ver Detalhes' : 'Indisponível'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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

                  {selectedProduct.ingredients.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Ingredientes:</h4>
                      <p className="text-sm text-slate-600">
                        {selectedProduct.ingredients.join(', ')}
                      </p>
                    </div>
                  )}

                  {selectedProduct.allergens.length > 0 && (
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
  )
}