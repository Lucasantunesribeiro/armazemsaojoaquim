'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import ImageUpload from '../components/ImageUpload'

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  category: string
  available: boolean
  featured: boolean
  allergens: string[]
  image_url?: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
}

export default function AdminMenu() {
  const { adminFetch, isAuthorized, isLoading: adminApiLoading } = useAdminApi()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [filter, setFilter] = useState<string>('all')
  


  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    featured: false,
    allergens: '',
    image_url: ''
  })

  useEffect(() => {
    loadData()
  }, [isAuthorized, adminApiLoading])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // Wait for admin verification if still loading
      if (adminApiLoading) {
        return
      }
      
      if (!isAuthorized) {
        setError('Admin access required')
        return
      }
      
      const [itemsData, categoriesData] = await Promise.all([
        adminFetch('/api/admin/menu'),
        adminFetch('/api/admin/categorias')
      ])
      
      setMenuItems(itemsData)
      setCategories(categoriesData)
    } catch (error) {
      if (error instanceof Error) setError(error.message)
      else setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [isAuthorized, adminApiLoading, adminFetch])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price).toFixed(2),
        allergens: formData.allergens.split(',').map(a => a.trim()).filter(a => a)
      }

      if (editingItem) {
        await adminFetch(`/api/admin/menu/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData)
        })
      } else {
        await adminFetch('/api/admin/menu', {
          method: 'POST',
          body: JSON.stringify(submitData)
        })
      }
      
      setShowForm(false)
      setEditingItem(null)
      resetForm()
      loadData()
    } catch (error) {
      if (error instanceof Error) setError(error.message)
      else setError('Erro ao salvar item')
    }
  }, [formData, editingItem, adminFetch, loadData])

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      available: true,
      featured: false,
      allergens: '',
      image_url: ''
    })
  }, [])

  const handleEdit = useCallback((item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
      featured: item.featured,
      allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : '',
      image_url: item.image_url || ''
    })
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return
    
    try {
      await adminFetch(`/api/admin/menu/${id}`, { method: 'DELETE' })
      loadData()
    } catch (error) {
      if (error instanceof Error) setError(error.message)
      else setError('Erro ao excluir item')
    }
  }, [adminFetch, loadData])

  const toggleAvailable = useCallback(async (id: string, available: boolean) => {
    try {
      await adminFetch(`/api/admin/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ available: !available })
      })
      loadData()
    } catch (error) {
      if (error instanceof Error) setError(error.message)
      else setError('Erro ao atualizar disponibilidade')
    }
  }, [adminFetch, loadData])

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (filter === 'all') return true
      if (filter === 'available') return item.available
      if (filter === 'featured') return item.featured
      return item.category === filter
    })
  }, [menuItems, filter])

  // Show loading while admin verification is in progress
  if (adminApiLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message if not admin
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-600 dark:text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingItem(null)
            resetForm()
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Todos" />
        <FilterButton active={filter === 'available'} onClick={() => setFilter('available')} label="Disponíveis" />
        <FilterButton active={filter === 'featured'} onClick={() => setFilter('featured')} label="Em Destaque" />
        {categories.map(cat => (
          <FilterButton
            key={cat.id}
            active={filter === cat.name}
            onClick={() => setFilter(cat.name)}
            label={cat.name}
          />
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alérgenos (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.allergens}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergens: e.target.value }))}
                  placeholder="Ex: glúten, laticínios, nozes"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, image_url: '' }))}
              />
              
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Disponível</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Em Destaque</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {item.image_url && (
              <div className="relative h-48">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {item.featured && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <span className="text-lg font-bold text-green-600">
                  R$ {parseFloat(item.price).toFixed(2)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.category}</span>
                <div className="flex items-center space-x-1">
                  {item.available ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                  {item.featured && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
              
              {item.allergens && item.allergens.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Alérgenos: {Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleAvailable(item.id, item.available)}
                  className={`text-sm px-3 py-1 rounded ${
                    item.available 
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {item.available ? 'Desabilitar' : 'Habilitar'}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Nenhum item encontrado para este filtro</p>
        </div>
      )}
    </div>
  )
}

// Componente auxiliar
function FilterButton({ active, onClick, label }: { 
  active: boolean; 
  onClick: () => void; 
  label: string 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  )
}