'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Coffee, IceCream, MapPin, Clock, Star, ShoppingCart, Plus, Minus, Heart, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/textarea'
// Dialog removido - usando modal customizado simples
import { useTranslations } from '@/hooks/useTranslations'

interface Product {
  id: string
  name: string
  category: 'CAFE' | 'SORVETE' | 'DOCE' | 'SALGADO' | 'BEBIDA'
  price: number
  description: string
  image_url: string
  available: boolean
}

interface CartItem extends Product {
  quantity: number
}

export default function CafePage() {
  const { t } = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/cafe/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory === 'ALL' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'CAFE': return t('cafe.menu.categories.coffee')
      case 'SORVETE': return t('cafe.menu.categories.icecream')
      case 'DOCE': return t('cafe.menu.categories.sweets')
      case 'SALGADO': return t('cafe.menu.categories.savory')
      case 'BEBIDA': return t('cafe.menu.categories.drinks')
      default: return category
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CAFE': return <Coffee className="w-4 h-4" />
      case 'SORVETE': return <IceCream className="w-4 h-4" />
      default: return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CAFE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      case 'SORVETE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'DOCE': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
      case 'SALGADO': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'BEBIDA': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== productId))
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        customer_name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        products: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total_price: getTotalPrice(),
        notes: customerData.notes
      }

      const response = await fetch('/api/cafe/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        alert(t('cafe.cart.orderSuccess'))
        setCart([])
        setCustomerData({ name: '', email: '', phone: '', notes: '' })
        setIsOrderModalOpen(false)
      }
    } catch (error) {
      console.error('Erro ao realizar pedido:', error)
      alert(t('cafe.cart.orderError'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{
            backgroundImage: `url('/images/cafe/cafe-ambiente.jpg')`,
          }}
        />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif">
            {t('cafe.title')}
          </h1>
          <p className="text-lg md:text-xl mb-6 font-light">
            {t('cafe.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
              <Coffee className="w-5 h-5 mr-2" />
              {t('cafe.cta.viewMenu')}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3">
              <MapPin className="w-5 h-5 mr-2" />
              {t('cafe.cta.directions')}
            </Button>
          </div>
        </div>
      </section>

      {/* Parceria Sorvete Itália */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-8 h-8 text-amber-600" />  
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white font-serif">
                {t('cafe.partnership.title')}
              </h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p className="text-lg leading-relaxed">
                {t('cafe.partnership.description1')}
              </p>
              <p className="text-lg leading-relaxed">
                {t('cafe.partnership.description2')}
              </p>
              <p className="text-lg leading-relaxed">
                {t('cafe.partnership.description3')}
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/images/cafe/sorvete-italia-parceria.jpg"
              alt="Parceria Sorvete Itália"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
              style={{ objectFit: 'cover' }}
            />
            <div className="absolute -bottom-4 -right-4 bg-amber-600 text-white p-4 rounded-2xl shadow-lg">
              <div className="text-sm font-bold">{t('cafe.partnership.label')}</div>
              <div className="text-lg">{t('cafe.partnership.name')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white font-serif">
              {t('cafe.menu.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {t('cafe.menu.description')}
            </p>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('ALL')}
              className="px-6"
            >
              {t('cafe.menu.filters.all')}
            </Button>
            <Button
              variant={selectedCategory === 'CAFE' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('CAFE')}
              className="px-6"
            >
              <Coffee className="w-4 h-4 mr-2" />
              {t('cafe.menu.categories.coffee')}
            </Button>
            <Button
              variant={selectedCategory === 'SORVETE' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('SORVETE')}
              className="px-6"
            >
              <IceCream className="w-4 h-4 mr-2" />
              {t('cafe.menu.categories.icecream')}
            </Button>
            <Button
              variant={selectedCategory === 'DOCE' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('DOCE')}
              className="px-6"
            >
              {t('cafe.menu.categories.sweets')}
            </Button>
            <Button
              variant={selectedCategory === 'SALGADO' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('SALGADO')}
              className="px-6"
            >
              {t('cafe.menu.categories.savory')}
            </Button>
            <Button
              variant={selectedCategory === 'BEBIDA' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('BEBIDA')}
              className="px-6"
            >
              {t('cafe.menu.categories.drinks')}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">{t('cafe.menu.loading')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative h-48">
                    <Image
                      src={product.image_url || '/images/cafe/product-placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getCategoryColor(product.category)}>
                        {getCategoryIcon(product.category)}
                        <span className="ml-1">{getCategoryLabel(product.category)}</span>
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-amber-600">
                        R$ {product.price.toFixed(2)}
                      </div>
                      {product.category === 'SORVETE' && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          <IceCream className="w-3 h-3 mr-1" />
                          {t('cafe.partnership.name')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {cart.find(item => item.id === product.id) ? (
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(product.id, (cart.find(item => item.id === product.id)?.quantity || 0) - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-bold text-lg min-w-[2rem] text-center">
                            {cart.find(item => item.id === product.id)?.quantity || 0}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(product.id, (cart.find(item => item.id === product.id)?.quantity || 0) + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => addToCart(product)}
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                          disabled={!product.available}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {product.available ? t('cafe.menu.addToCart') : t('cafe.menu.unavailable')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Localização */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white font-serif">
              {t('cafe.location.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {t('cafe.location.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('cafe.location.address.title')}</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Rua Almirante Alexandrino, 470 B<br />
                    Largo dos Guimarães, Santa Teresa
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('cafe.hours.title')}</h3>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <p>{t('cafe.hours.weekdays')}</p>
                    <p>{t('cafe.hours.weekend')}</p>
                    <p>{t('cafe.hours.sunday')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('cafe.atmosphere.title')}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <div>✓ {t('cafe.atmosphere.workRemote')}</div>
                  <div>✓ {t('cafe.atmosphere.study')}</div>
                  <div>✓ {t('cafe.atmosphere.meetings')}</div>
                  <div>✓ {t('cafe.atmosphere.relax')}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>{t('cafe.location.mapTitle')}</p>
                <p className="text-sm">{t('cafe.location.mapComingSoon')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrinho Flutuante */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 shadow-2xl"
            onClick={() => setIsOrderModalOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} • R$ {getTotalPrice().toFixed(2)}
          </Button>
          
          {/* Modal do Carrinho */}
          {isOrderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOrderModalOpen(false)}
              />
              <div className="relative bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Finalizar Pedido</h3>
                  <button 
                    onClick={() => setIsOrderModalOpen(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Itens do Carrinho */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Seus itens:</h4>
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            R$ {item.price.toFixed(2)} x {item.quantity}
                          </div>
                        </div>
                        <div className="font-bold text-amber-600">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-amber-600">R$ {getTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Cliente */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Seus dados:</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          value={customerData.name}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerData.email}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={customerData.notes}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Alguma observação especial?"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmitOrder}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={!customerData.name}
                  >
                    Confirmar Pedido • R$ {getTotalPrice().toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}