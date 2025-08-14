'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, ShoppingCart, DollarSign, Coffee, IceCream } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'

interface Product {
  id: string
  name: string
  category: 'CAFE' | 'SORVETE' | 'DOCE' | 'SALGADO' | 'BEBIDA'
  price: number
  description: string
  image_url: string
  available: boolean
  created_at: string
  updated_at: string
}

interface Order {
  id: string
  customer_name: string
  email: string
  phone: string
  products: any[]
  total_price: number
  order_date: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  notes: string
  created_at: string
}

const initialProductData: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  category: 'CAFE',
  price: 0,
  description: '',
  image_url: '',
  available: true
}

export default function AdminCafePage() {
  const { authenticatedFetch, hasToken } = useAuthenticatedFetch()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productData, setProductData] = useState(initialProductData)

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/cafe/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/cafe/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    try {
      const url = editingProduct 
        ? `/api/admin/cafe/products/${editingProduct.id}`
        : '/api/admin/cafe/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        await fetchProducts()
        setIsProductModalOpen(false)
        setEditingProduct(null)
        setProductData(initialProductData)
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/admin/cafe/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/cafe/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error)
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setProductData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image_url: product.image_url,
      available: product.available
    })
    setIsProductModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setProductData(initialProductData)
    setIsProductModalOpen(true)
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'CAFE': return 'Cafés'
      case 'SORVETE': return 'Sorvetes'
      case 'DOCE': return 'Doces'
      case 'SALGADO': return 'Salgados'
      case 'BEBIDA': return 'Bebidas'
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CAFE': return 'bg-amber-100 text-amber-800'
      case 'SORVETE': return 'bg-blue-100 text-blue-800'
      case 'DOCE': return 'bg-pink-100 text-pink-800'
      case 'SALGADO': return 'bg-orange-100 text-orange-800'
      case 'BEBIDA': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PREPARING': return 'bg-blue-100 text-blue-800'
      case 'READY': return 'bg-green-100 text-green-800'
      case 'DELIVERED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente'
      case 'PREPARING': return 'Preparando'
      case 'READY': return 'Pronto'
      case 'DELIVERED': return 'Entregue'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestão do Café</h1>
        <p className="text-slate-600">Gerencie produtos e pedidos do Café do Armazém</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Disponíveis</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.available).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Dia</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              R$ {orders
                .filter(o => o.status === 'DELIVERED' && new Date(o.created_at).toDateString() === new Date().toDateString())
                .reduce((total, o) => total + o.total_price, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produtos */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>Gerencie o menu do café</CardDescription>
            </div>
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Edite as informações do produto' : 'Adicione um novo produto ao menu'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={productData.name}
                        onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={productData.category} onValueChange={(value: any) => setProductData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAFE">Cafés</SelectItem>
                          <SelectItem value="SORVETE">Sorvetes</SelectItem>
                          <SelectItem value="DOCE">Doces</SelectItem>
                          <SelectItem value="SALGADO">Salgados</SelectItem>
                          <SelectItem value="BEBIDA">Bebidas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={productData.description}
                      onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productData.price}
                        onChange={(e) => setProductData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">URL da Imagem</Label>
                      <Input
                        id="image_url"
                        value={productData.image_url}
                        onChange={(e) => setProductData(prev => ({ ...prev, image_url: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={productData.available}
                      onCheckedChange={(checked) => setProductData(prev => ({ ...prev, available: checked }))}
                    />
                    <Label>Produto disponível</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProduct}>
                      {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge className={getCategoryColor(product.category)}>
                        {getCategoryLabel(product.category)}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(product)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-amber-600">R$ {product.price.toFixed(2)}</span>
                    <Badge variant={product.available ? "default" : "secondary"}>
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  {product.category === 'SORVETE' && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      <IceCream className="w-3 h-3 mr-1" />
                      Sorvete Itália
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>Gerencie os pedidos do café</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 15).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="text-sm text-slate-600">
                    {order.email} {order.phone && `• ${order.phone}`}
                  </div>
                  <div className="text-sm text-slate-600">
                    {order.products.length} item{order.products.length !== 1 ? 's' : ''} • 
                    R$ {order.total_price.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Produtos: {order.products.map(p => `${p.name} (${p.quantity}x)`).join(', ')}
                  </div>
                  {order.notes && (
                    <div className="text-xs text-slate-500 mt-1">
                      Obs: {order.notes}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="PREPARING">Preparando</SelectItem>
                      <SelectItem value="READY">Pronto</SelectItem>
                      <SelectItem value="DELIVERED">Entregue</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-slate-600">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}