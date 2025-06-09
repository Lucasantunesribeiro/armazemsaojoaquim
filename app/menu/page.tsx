'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Wine, Coffee, Utensils, Cake, Filter, Search } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { formatCurrency } from '../../lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  available: boolean
  ingredients: string[] | null
  allergens: string[] | null
}

const categoryIcons = {
  'Aperitivos': Coffee,
  'Saladas': Utensils,
  'Pratos Individuais': Utensils,
  'Guarnições': Coffee,
  'Feijoada': Wine,
  'Sanduíches': Coffee,
  'Sobremesas': Cake,
}

const categoryColors = {
  'Aperitivos': 'bg-vermelho-portas',
  'Saladas': 'bg-verde-natura',
  'Pratos Individuais': 'bg-amarelo-armazem',
  'Guarnições': 'bg-pedra-natural',
  'Feijoada': 'bg-madeira-escura',
  'Sanduíches': 'bg-cinza-medio',
  'Sobremesas': 'bg-rosa-suave',
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['Todos', 'Aperitivos', 'Saladas', 'Pratos Individuais', 'Guarnições', 'Feijoada', 'Sanduíches', 'Sobremesas']

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [menuItems, selectedCategory, searchTerm])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('name')

      if (error) {
        console.error('Erro ao carregar menu:', error)
      } else {
        setMenuItems(data || [])
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = menuItems

    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredItems(filtered)
  }

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amarelo-armazem"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 bg-cinza-claro">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
              Nosso Cardápio
            </h1>
            <p className="text-xl text-cinza-medio max-w-3xl mx-auto">
              Descubra os sabores únicos que fazem do Armazém São Joaquim 
              um lugar especial em Santa Teresa
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cinza-medio w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar pratos e bebidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center"
                >
                  {category !== 'Todos' && categoryIcons[category as keyof typeof categoryIcons] && (
                    React.createElement(categoryIcons[category as keyof typeof categoryIcons], {
                      className: "w-4 h-4 mr-2"
                    })
                  )}
                  {category === 'Todos' && <Filter className="w-4 h-4 mr-2" />}
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          {Object.keys(groupedItems).length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="w-16 h-16 text-cinza-medio mx-auto mb-4" />
                <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-4">
                  Nenhum item encontrado
                </h3>
                <p className="text-cinza-medio">
                  Tente ajustar os filtros ou termo de busca
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedItems).map(([categoria, items]) => {
                const IconComponent = categoryIcons[categoria as keyof typeof categoryIcons]
                const colorClass = categoryColors[categoria as keyof typeof categoryColors]
                
                return (
                  <div key={categoria}>
                    {/* Category Header */}
                    <div className="flex items-center mb-8">
                      <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center mr-4`}>
                        {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                      </div>
                      <h2 className="font-playfair text-3xl font-bold text-madeira-escura">
                        {categoria}
                      </h2>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item) => (
                        <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-playfair text-xl font-semibold text-madeira-escura group-hover:text-amarelo-armazem transition-colors">
                                {item.name}
                              </h3>
                              <span className="text-2xl font-bold text-vermelho-portas">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            
                            <p className="text-cinza-medio mb-4 leading-relaxed">
                              {item.description}
                            </p>
                            
                            {item.ingredients && item.ingredients.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-sm font-semibold text-madeira-escura mb-1">
                                  Ingredientes:
                                </h4>
                                <p className="text-sm text-cinza-medio">
                                  {item.ingredients.join(', ')}
                                </p>
                              </div>
                            )}
                            
                            {item.allergens && item.allergens.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-sm font-semibold text-vermelho-portas mb-1">
                                  Alérgenos:
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {item.allergens.map((allergen: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                    >
                                      {allergen}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center p-8 bg-gradient-to-r from-amarelo-armazem to-vermelho-portas rounded-lg">
            <h3 className="font-playfair text-3xl font-bold text-white mb-4">
              Pronto para experimentar?
            </h3>
            <p className="text-white/90 mb-6 text-lg">
              Reserve sua mesa e venha saborear o melhor de Santa Teresa
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-madeira-escura hover:bg-cinza-claro">
              Fazer Reserva
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}