'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useAdmin } from '@/hooks/useAdmin'
import { CafeProduct, CafeProductInsert, CafeProductCategory } from '@/types/database.types'

const productCategories: { value: CafeProductCategory; label: string }[] = [
  { value: 'cafes', label: 'Cafés' },
  { value: 'sorvetes', label: 'Sorvetes' },
  { value: 'doces', label: 'Doces' },
  { value: 'salgados', label: 'Salgados' },
  { value: 'bebidas', label: 'Bebidas' }
]

const commonIngredients = [
  'Café espresso',
  'Leite integral',
  'Açúcar',
  'Canela',
  'Chocolate',
  'Baunilha',
  'Chantilly',
  'Ricota',
  'Mascarpone',
  'Biscoitos',
  'Frutas frescas',
  'Nozes'
]

const commonAllergens = [
  'Leite',
  'Ovos',
  'Glúten',
  'Nozes',
  'Amendoim',
  'Soja',
  'Lactose'
]

export default function AdminCafePage() {
  const { supabase } = useSupabase()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const [products, setProducts] = useState<CafeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CafeProduct | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CafeProductCategory | 'all'>('all')
  
  // Form state
  const [formData, setFormData] = useState<Partial<CafeProductInsert>>({
    name: '',
    category: 'cafes',
    price: 0,
    description: '',
    image_url: '',
    available: true,
    featured: false,
    ingredients: [],
    allergens: []
  })

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadProducts()
    }
  }, [adminLoading, isAdmin])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('cafe_products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('cafe_products')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cafe_products')
          .insert([formData as CafeProductInsert])

        if (error) throw error
      }

      await loadProducts()
      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      alert(editingProduct ? 'Produto atualizado!' : 'Produto criado!')
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto')
    }
  }

  const handleEdit = (product: CafeProduct) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category as CafeProductCategory,
      price: product.price,
      description: product.description,
      image_url: product.image_url,
      available: product.available,
      featured: product.featured,
      ingredients: product.ingredients || [],
      allergens: product.allergens || []
    })
    setShowForm(true)
  }

  const handleDelete = async (product: CafeProduct) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) return

    try {
      const { error } = await supabase
        .from('cafe_products')
        .delete()
        .eq('id', product.id)

      if (error) throw error
      
      await loadProducts()
      alert('Produto excluído!')
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto')
    }
  }

  const toggleAvailability = async (product: CafeProduct) => {
    try {
      const { error } = await supabase
        .from('cafe_products')
        .update({ 
          available: !product.available,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)

      if (error) throw error
      await loadProducts()
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error)
    }
  }

  const toggleFeatured = async (product: CafeProduct) => {
    try {
      const { error } = await supabase
        .from('cafe_products')
        .update({ 
          featured: !product.featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)

      if (error) throw error
      await loadProducts()
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'cafes',
      price: 0,
      description: '',
      image_url: '',
      available: true,
      featured: false,
      ingredients: [],
      allergens: []
    })
  }

  const handleArrayToggle = (array: string[], item: string, field: 'ingredients' | 'allergens') => {
    if (array.includes(item)) {
      setFormData({
        ...formData,
        [field]: array.filter(i => i !== item)
      })
    } else {
      setFormData({
        ...formData,
        [field]: [...array, item]
      })
    }
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

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
              Gerenciar Produtos do Café
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Administre o menu do Café do Armazém - Parceria Sorvete Itália
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingProduct(null)
              resetForm()
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            size="sm"
          >
            Todos ({products.length})
          </Button>
          {productCategories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.value)}
              size="sm"
            >
              {category.label} ({products.filter(p => p.category === category.value).length})
            </Button>
          ))}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Café Armazém"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as CafeProductCategory })}
                        className="w-full p-2 border rounded-lg"
                        required
                      >
                        {productCategories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border rounded-lg h-24"
                      placeholder="Descrição do produto..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">URL da Imagem</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label>Ingredientes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {commonIngredients.map(ingredient => (
                        <label key={ingredient} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(formData.ingredients || []).includes(ingredient)}
                            onChange={() => handleArrayToggle(formData.ingredients || [], ingredient, 'ingredients')}
                            className="rounded"
                          />
                          <span className="text-sm">{ingredient}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Alérgenos</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {commonAllergens.map(allergen => (
                        <label key={allergen} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(formData.allergens || []).includes(allergen)}
                            onChange={() => handleArrayToggle(formData.allergens || [], allergen, 'allergens')}
                            className="rounded"
                          />
                          <span className="text-sm">{allergen}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="available"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      />
                      <Label htmlFor="available">Disponível no menu</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      />
                      <Label htmlFor="featured">Produto em destaque</Label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                      {editingProduct ? 'Atualizar' : 'Criar'} Produto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingProduct(null)
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

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCategory === 'all' 
                  ? 'Nenhum produto cadastrado ainda.' 
                  : `Nenhum produto encontrado na categoria ${productCategories.find(c => c.value === selectedCategory)?.label}.`
                }
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-orange-100 text-orange-800">
                        {productCategories.find(c => c.value === product.category)?.label}
                      </Badge>
                      {product.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeatured(product)}
                      className={product.featured ? 'text-yellow-600' : ''}
                    >
                      {product.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(product)}
                      className={product.available ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                    >
                      {product.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {product.description}
                </p>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                {product.ingredients && product.ingredients.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Ingredientes:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.ingredients.slice(0, 3).map((ingredient) => (
                        <Badge key={ingredient} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                      {product.ingredients.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.ingredients.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {product.allergens && product.allergens.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Alérgenos:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.allergens.map((allergen) => (
                        <Badge key={allergen} variant="outline" className="text-xs bg-red-50 text-red-700">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Badge className={product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {product.available ? 'Disponível' : 'Indisponível'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}