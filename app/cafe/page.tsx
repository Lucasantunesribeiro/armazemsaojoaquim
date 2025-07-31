'use client'

import { useState } from 'react'
import { Coffee, IceCream, Clock, MapPin, Wifi, Book, Star, Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import SEO from '@/components/SEO'

interface Product {
  id: string
  name: string
  category: 'cafes' | 'sorvetes' | 'doces' | 'salgados' | 'bebidas'
  price: number
  description: string
  imageUrl: string
  featured: boolean
  ingredients?: string
  allergens?: string
}

const products: Product[] = [
  // Cafés Especiais
  {
    id: '1',
    name: 'Café Armazém',
    category: 'cafes',
    price: 8.50,
    description: 'Blend especial da casa, torrado artesanalmente com notas de chocolate e caramelo',
    imageUrl: '/images/cafe/cafe-armazem.jpg',
    featured: true,
    ingredients: 'Café 100% arábica, Açúcar demerara'
  },
  {
    id: '2',
    name: 'Cappuccino Tradicional',
    category: 'cafes',
    price: 12.00,
    description: 'Café espresso com leite vaporizado e espuma cremosa, polvilhado com canela',
    imageUrl: '/images/cafe/cappuccino.jpg',
    featured: false,
    ingredients: 'Café espresso, Leite integral, Canela em pó'
  },
  {
    id: '3',
    name: 'Café Gelado Santa Teresa',
    category: 'cafes',
    price: 14.00,
    description: 'Café gelado com toque de baunilha e chantilly, inspirado no clima do bairro',
    imageUrl: '/images/cafe/cafe-gelado.jpg',
    featured: true,
    ingredients: 'Café espresso, Leite gelado, Essência de baunilha, Chantilly'
  },

  // Sorvetes Itália
  {
    id: '4',
    name: 'Sorvete Italiano Tradicional',
    category: 'sorvetes',
    price: 16.00,
    description: 'Autêntico gelato italiano em sabores clássicos: chocolate, baunilha, morango',
    imageUrl: '/images/cafe/gelato-tradicional.jpg',
    featured: true,
    ingredients: 'Leite integral, Creme de leite, Açúcar, Saborizantes naturais'
  },
  {
    id: '5',
    name: 'Gelato Artesanal Premium',
    category: 'sorvetes',
    price: 22.00,
    description: 'Gelato premium com sabores únicos: pistache, tiramisu, limão siciliano',
    imageUrl: '/images/cafe/gelato-premium.jpg',
    featured: true,
    ingredients: 'Ingredientes importados, Nozes premium, Frutas selecionadas'
  },
  {
    id: '6',
    name: 'Affogato al Caffè',
    category: 'sorvetes',
    price: 18.00,
    description: 'Sorvete de baunilha "afogado" em café espresso quente - o melhor dos dois mundos',
    imageUrl: '/images/cafe/affogato.jpg',
    featured: true,
    ingredients: 'Gelato de baunilha, Café espresso duplo'
  },

  // Doces
  {
    id: '7',
    name: 'Tiramisu da Casa',
    category: 'doces',
    price: 15.00,
    description: 'Tradicional tiramisu italiano com camadas de mascarpone e café',
    imageUrl: '/images/cafe/tiramisu.jpg',
    featured: false,
    ingredients: 'Mascarpone, Café, Biscoitos savoiardi, Cacau em pó'
  },
  {
    id: '8',
    name: 'Cannoli Siciliano',
    category: 'doces',
    price: 12.00,
    description: 'Massa crocante recheada com ricota doce e gotas de chocolate',
    imageUrl: '/images/cafe/cannoli.jpg',
    featured: false,
    ingredients: 'Ricota fresca, Açúcar, Gotas de chocolate, Massa italiana'
  },

  // Salgados
  {
    id: '9',
    name: 'Panini Italiano',
    category: 'salgados',
    price: 18.00,
    description: 'Pão italiano grelhado com presunto parma, mussarela de búfala e tomate seco',
    imageUrl: '/images/cafe/panini.jpg',
    featured: false,
    ingredients: 'Pão ciabatta, Presunto parma, Mussarela de búfala, Tomate seco'
  },
  {
    id: '10',
    name: 'Focaccia Artesanal',
    category: 'salgados',
    price: 14.00,
    description: 'Pão italiano com azeite, alecrim e sal grosso, servido quentinho',
    imageUrl: '/images/cafe/focaccia.jpg',
    featured: false,
    ingredients: 'Farinha italiana, Azeite extravirgem, Alecrim fresco, Sal grosso'
  }
]

const categories = [
  { id: 'todos', name: 'Todos', icon: Star },
  { id: 'cafes', name: 'Cafés', icon: Coffee },
  { id: 'sorvetes', name: 'Sorvetes Itália', icon: IceCream },
  { id: 'doces', name: 'Doces', icon: Heart },
  { id: 'salgados', name: 'Salgados', icon: Book }
]

export default function CafePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([])
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const filteredProducts = selectedCategory === 'todos' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const handleOrder = () => {
    if (cart.length === 0 || !customerName || !email || !phone) return

    const orderData = {
      customer: { name: customerName, email, phone },
      products: cart,
      total: getTotalPrice(),
      orderDate: new Date().toISOString()
    }

    console.log('Pedido:', orderData)
    alert('Pedido enviado! Prepare-se para uma experiência única.')
    setCart([])
    setCustomerName('')
    setEmail('')
    setPhone('')
  }

  return (
    <>
      <SEO 
        title="Café do Armazém - Parceria Sorvete Itália | Santa Teresa"
        description="Desfrute de cafés especiais e autênticos sorvetes italianos no coração de Santa Teresa. Parceria exclusiva com Sorvete Itália."
        keywords={["café", "sorvete italiano", "gelato", "Santa Teresa", "Rio de Janeiro", "Sorvete Itália", "café especial"]}
        ogImage="/images/cafe/cafe-ambiente.jpg"
      />

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/cafe/ambiente-aconchegante.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <div className="mb-6">
              <Badge className="bg-orange-600 text-white px-4 py-2 text-lg font-semibold">
                Parceria Sorvete Itália
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6">
              Café do Armazém
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">
              Cafés especiais & Autênticos sorvetes italianos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                <span>Rua Almirante Alexandrino, 470 B</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                <span>Aberto todos os dias: 8h às 22h</span>
              </div>
            </div>
          </div>
        </section>

        {/* Parceria Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-6 text-slate-800 dark:text-white">
                  Parceria Exclusiva
                </h2>
                <div className="space-y-4 text-lg text-slate-600 dark:text-slate-300">
                  <p>
                    Unimos nossa paixão pelos <strong>cafés especiais</strong> com a tradição italiana 
                    do <strong>Sorvete Itália</strong>, criando uma experiência única em Santa Teresa.
                  </p>
                  <p>
                    Nosso ambiente aconchegante é perfeito para trabalhar, estudar ou simplesmente 
                    desfrutar de momentos especiais com os autênticos sabores da Itália.
                  </p>
                  <p>
                    Localizado no anexo do restaurante, oferecemos um espaço dedicado aos amantes 
                    de café e gelato artesanal, mantendo a qualidade que o Armazém São Joaquim representa.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/images/cafe/parceria-italia.jpg"
                  alt="Parceria Café do Armazém e Sorvete Itália"
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-orange-600 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-lg font-bold">Sorvete</div>
                  <div className="text-sm">Itália</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Categories */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4 text-slate-800 dark:text-white">
                Nosso Menu
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Da tradicional Itália ao coração de Santa Teresa
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                      selectedCategory === category.id
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </button>
                )
              })}
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="p-6 hover:shadow-xl transition-all">
                  <div className="relative mb-4">
                    <img 
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {product.featured && (
                      <Badge className="absolute top-2 right-2 bg-orange-600 text-white">
                        Destaque
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{product.description}</p>
                  
                  {product.ingredients && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500 mb-2">Ingredientes:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.ingredients.split(', ').map((ingredient) => (
                          <Badge key={ingredient} variant="outline" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-600">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <Button 
                      onClick={() => addToCart(product)}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Adicionar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cart & Order Section */}
        {cart.length > 0 && (
          <section className="py-20 px-4 bg-orange-50 dark:bg-slate-800">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  Seu Pedido
                </h3>
                
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          R$ {item.product.price.toFixed(2).replace('.', ',')} cada
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-4 text-red-500 hover:text-red-700"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6 mb-6">
                  <div className="text-right text-2xl font-bold text-orange-600">
                    Total: R$ {getTotalPrice().toFixed(2).replace('.', ',')}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleOrder}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                  disabled={!customerName || !email || !phone}
                >
                  Confirmar Pedido - R$ {getTotalPrice().toFixed(2).replace('.', ',')}
                </Button>
              </Card>
            </div>
          </section>
        )}

        {/* Ambiente Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4 text-slate-800 dark:text-white">
                Nosso Ambiente
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Espaço perfeito para trabalhar, estudar ou relaxar
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">WiFi Rápido</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Internet de alta velocidade para trabalho</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Book className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Ambiente Silencioso</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Perfeito para estudar e concentrar</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Cafés Especiais</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Grãos selecionados e torrados artesanalmente</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IceCream className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Gelato Artesanal</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Sorvetes italianos autênticos</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}