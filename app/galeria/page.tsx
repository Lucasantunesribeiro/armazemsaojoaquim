'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Eye, Palette, Frame, Calendar, MapPin, User, Mail, Phone, Search, Filter } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import SEO from '@/components/SEO'

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
  condition?: 'excelente' | 'muito_bom' | 'bom' | 'regular' | 'necessita_restauro'
  frame_included: boolean
  shipping_info?: string
  created_at: string
}

const categories = [
  { id: 'todos', name: 'Todas', icon: Eye },
  { id: 'pintura', name: 'Pinturas', icon: Palette },
  { id: 'escultura', name: 'Esculturas', icon: Frame },
  { id: 'fotografia', name: 'Fotografias', icon: Eye },
  { id: 'gravura', name: 'Gravuras', icon: Frame },
  { id: 'desenho', name: 'Desenhos', icon: Palette },
  { id: 'arte_digital', name: 'Arte Digital', icon: Frame }
]

const conditionLabels = {
  'excelente': 'Excelente',
  'muito_bom': 'Muito Bom',
  'bom': 'Bom',
  'regular': 'Regular',
  'necessita_restauro': 'Necessita Restauro'
}

export default function GaleriaPage() {
  const { supabase } = useSupabase()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<{artwork: Artwork, quantity: number}[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  
  // Checkout form data
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('galeria_artworks')
        .select('*')
        .eq('available', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArtworks = artworks.filter(artwork => {
    const matchesCategory = selectedCategory === 'todos' || artwork.category === selectedCategory
    const matchesSearch = !searchTerm || 
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const addToCart = (artwork: Artwork) => {
    const existing = cart.find(item => item.artwork.id === artwork.id)
    if (existing) {
      setCart(cart.map(item => 
        item.artwork.id === artwork.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { artwork, quantity: 1 }])
    }
  }

  const removeFromCart = (artworkId: string) => {
    setCart(cart.filter(item => item.artwork.id !== artworkId))
  }

  const updateQuantity = (artworkId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(artworkId)
    } else {
      setCart(cart.map(item => 
        item.artwork.id === artworkId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.artwork.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0 || !customerName || !email || !phone) return

    try {
      // Create order
      const orderData = {
        customer_name: customerName,
        customer_email: email,
        customer_phone: phone,
        customer_address: address,
        total_amount: getTotalPrice(),
        status: 'pending'
      }

      const { data: order, error: orderError } = await supabase
        .from('galeria_orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        artwork_id: item.artwork.id,
        quantity: item.quantity,
        unit_price: item.artwork.price,
        total_price: item.artwork.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('galeria_order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      alert('Pedido realizado com sucesso! Entraremos em contato em breve.')
      setCart([])
      setShowCheckout(false)
      setCustomerName('')
      setEmail('')
      setPhone('')
      setAddress('')
    } catch (error) {
      console.error('Erro ao processar pedido:', error)
      alert('Erro ao processar pedido. Tente novamente.')
    }
  }

  return (
    <>
      <SEO 
        title="Galeria de Arte - Armazém São Joaquim"
        description="Descubra obras de arte únicas em nossa galeria. Pinturas, esculturas, fotografias e mais no coração de Santa Teresa, Rio de Janeiro."
        keywords={["galeria de arte", "arte", "pinturas", "esculturas", "Santa Teresa", "Rio de Janeiro", "obras de arte"]}
        ogImage="/images/galeria/galeria-hero.jpg"
      />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/galeria/ambiente-artistico.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <div className="mb-6">
              <Badge className="bg-purple-600 text-white px-4 py-2 text-lg font-semibold">
                Arte & Cultura
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6">
              Galeria Armazém
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">
              Obras de arte selecionadas no coração de Santa Teresa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                <span>Rua Almirante Alexandrino, 470</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                <span>Visitação: Ter-Dom, 10h às 18h</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Gallery Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-6 text-slate-800 dark:text-white">
                  Arte em Santa Teresa
                </h2>
                <div className="space-y-4 text-lg text-slate-600 dark:text-slate-300">
                  <p>
                    Nossa galeria reúne <strong>obras exclusivas</strong> de artistas locais e nacionais, 
                    celebrando a rica tradição artística do bairro de Santa Teresa.
                  </p>
                  <p>
                    Do tradicional ao contemporâneo, cada peça conta uma história única, 
                    conectando visitantes à essência cultural do Rio de Janeiro.
                  </p>
                  <p>
                    Oferecemos <strong>aquisição de obras</strong>, certificados de autenticidade 
                    e serviços especializados para colecionadores e apreciadores de arte.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/images/galeria/curadoria-especializada.jpg"
                  alt="Curadoria especializada da Galeria Armazém"
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-purple-600 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-lg font-bold">Arte</div>
                  <div className="text-sm">Selecionada</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-12 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, artista ou tema..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-500">Filtrar por categoria:</span>
              </div>
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
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.name}
                  </button>
                )
              })}
            </div>

            {/* Artworks Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="p-6 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 dark:bg-slate-700 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded" />
                  </Card>
                ))
              ) : filteredArtworks.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || selectedCategory !== 'todos' 
                      ? 'Nenhuma obra encontrada com os filtros aplicados.' 
                      : 'Nenhuma obra disponível no momento.'
                    }
                  </p>
                </div>
              ) : (
                filteredArtworks.map((artwork) => (
                  <Card key={artwork.id} className="p-6 hover:shadow-xl transition-all group">
                    <div className="relative mb-4">
                      <img 
                        src={artwork.image_url || '/images/galeria/placeholder-artwork.jpg'}
                        alt={artwork.title}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => setSelectedArtwork(artwork)}
                      />
                      {artwork.featured && (
                        <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
                          Destaque
                        </Badge>
                      )}
                      {artwork.certificate_authenticity && (
                        <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                          Certificado
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1">{artwork.title}</h3>
                    <p className="text-purple-600 dark:text-purple-400 font-semibold mb-2">
                      {artwork.artist}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === artwork.category)?.name}
                      </Badge>
                      {artwork.technique && (
                        <Badge variant="outline" className="text-xs">
                          {artwork.technique}
                        </Badge>
                      )}
                      {artwork.year_created && (
                        <Badge variant="outline" className="text-xs">
                          {artwork.year_created}
                        </Badge>
                      )}
                    </div>

                    {artwork.description && (
                      <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm line-clamp-2">
                        {artwork.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4 text-sm">
                      {artwork.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dimensões:</span>
                          <span>{artwork.dimensions}</span>
                        </div>
                      )}
                      {artwork.condition && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Condição:</span>
                          <span>{conditionLabels[artwork.condition]}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Moldura:</span>
                        <span>{artwork.frame_included ? 'Inclusa' : 'Não inclusa'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-purple-600">
                        R$ {artwork.price.toLocaleString('pt-BR')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedArtwork(artwork)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => addToCart(artwork)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Cart */}
        {cart.length > 0 && (
          <section className="py-20 px-4 bg-purple-50 dark:bg-slate-800">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Carrinho de Compras
                </h3>
                
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.artwork.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.artwork.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {item.artwork.artist} - R$ {item.artwork.price.toLocaleString('pt-BR')} cada
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item.artwork.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.artwork.id)}
                          className="ml-4 text-red-500 hover:text-red-700"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6 mb-6">
                  <div className="text-right text-2xl font-bold text-purple-600">
                    Total: R$ {getTotalPrice().toLocaleString('pt-BR')}
                  </div>
                </div>

                <Button 
                  onClick={() => setShowCheckout(!showCheckout)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  {showCheckout ? 'Ocultar Checkout' : 'Finalizar Compra'}
                </Button>

                {showCheckout && (
                  <div className="mt-8 pt-8 border-t">
                    <h4 className="text-lg font-bold mb-4">Dados para Contato</h4>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
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

                      <div>
                        <Label htmlFor="address">Endereço (Opcional)</Label>
                        <Input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Endereço para entrega"
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Importante:</strong> Após enviar o pedido, entraremos em contato para 
                        confirmar disponibilidade, forma de pagamento e detalhes de entrega/retirada.
                      </p>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                      disabled={!customerName || !email || !phone}
                    >
                      Enviar Pedido - R$ {getTotalPrice().toLocaleString('pt-BR')}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </section>
        )}

        {/* Artwork Detail Modal */}
        {selectedArtwork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold font-playfair">{selectedArtwork.title}</h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedArtwork(null)}
                  >
                    Fechar
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <img 
                      src={selectedArtwork.image_url || '/images/galeria/placeholder-artwork.jpg'}
                      alt={selectedArtwork.title}
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-600 mb-2">
                        {selectedArtwork.artist}
                      </h3>
                      {selectedArtwork.artist_bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {selectedArtwork.artist_bio}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Categoria:</span>
                        <span>{categories.find(c => c.id === selectedArtwork.category)?.name}</span>
                      </div>
                      {selectedArtwork.technique && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Técnica:</span>
                          <span>{selectedArtwork.technique}</span>
                        </div>
                      )}
                      {selectedArtwork.dimensions && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Dimensões:</span>
                          <span>{selectedArtwork.dimensions}</span>
                        </div>
                      )}
                      {selectedArtwork.year_created && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Ano:</span>
                          <span>{selectedArtwork.year_created}</span>
                        </div>
                      )}
                      {selectedArtwork.condition && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Condição:</span>
                          <span>{conditionLabels[selectedArtwork.condition]}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-semibold">Moldura:</span>
                        <span>{selectedArtwork.frame_included ? 'Inclusa' : 'Não inclusa'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Certificado:</span>
                        <span>{selectedArtwork.certificate_authenticity ? 'Sim' : 'Não'}</span>
                      </div>
                    </div>

                    {selectedArtwork.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Descrição:</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedArtwork.description}
                        </p>
                      </div>
                    )}

                    {selectedArtwork.provenance && (
                      <div>
                        <h4 className="font-semibold mb-2">Proveniência:</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedArtwork.provenance}
                        </p>
                      </div>
                    )}

                    {selectedArtwork.shipping_info && (
                      <div>
                        <h4 className="font-semibold mb-2">Informações de Entrega:</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedArtwork.shipping_info}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="text-3xl font-bold text-purple-600 mb-4">
                        R$ {selectedArtwork.price.toLocaleString('pt-BR')}
                      </div>
                      <Button 
                        onClick={() => {
                          addToCart(selectedArtwork)
                          setSelectedArtwork(null)
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        size="lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Adicionar ao Carrinho
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Services Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4 text-slate-800 dark:text-white">
                Nossos Serviços
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Além da aquisição de obras, oferecemos serviços especializados
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Frame className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Certificação</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Certificados de autenticidade para todas as obras
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Consultoria</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Orientação especializada para colecionadores
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Entrega Segura</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Embalagem especializada e entrega protegida
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}