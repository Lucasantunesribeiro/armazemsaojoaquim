'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Wine, Coffee, Utensils, Cake, Filter, Search } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { formatCurrency } from '../../lib/utils'
import { toast } from 'react-hot-toast'

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
  'Bebidas': Wine,
  'Drinks': Wine,
  'Pratos Principais': Utensils,
}

const categoryColors = {
  'Aperitivos': 'bg-vermelho-portas',
  'Saladas': 'bg-verde-natura',
  'Pratos Individuais': 'bg-amarelo-armazem',
  'Guarnições': 'bg-pedra-natural',
  'Feijoada': 'bg-madeira-escura',
  'Sanduíches': 'bg-cinza-medio',
  'Sobremesas': 'bg-rosa-suave',
  'Bebidas': 'bg-vermelho-portas',
  'Drinks': 'bg-vermelho-portas',
  'Pratos Principais': 'bg-amarelo-armazem',
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['Todos', 'Bebidas', 'Aperitivos', 'Saladas', 'Pratos Individuais', 'Guarnições', 'Feijoada', 'Sanduíches', 'Sobremesas']

  useEffect(() => {
    fetchMenuItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [menuItems, selectedCategory, searchTerm])

  const fetchMenuItems = async () => {
    try {
      console.log('Carregando dados do menu...')
      
      // Verificar se as variáveis de ambiente estão configuradas
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Variáveis de ambiente não configuradas:', {
          url: !!supabaseUrl,
          key: !!supabaseKey
        })
        toast.error('Configuração faltando - usando dados de exemplo')
        setMenuItems(getMockMenuItems())
        return
      }
      
      // Tentar carregar do Supabase
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select(`
            id,
            nome,
            descricao,
            preco,
            categoria,
            disponivel,
            ingredientes,
            alergenos
          `)
          .eq('disponivel', true)

        if (error) {
          console.error('❌ Erro Supabase:', error)
          toast.error(`Erro no banco: ${error.message}`)
          setMenuItems(getMockMenuItems())
          return
        }

        if (data && data.length > 0) {
          console.log(`✅ Carregados ${data.length} itens do Supabase`)
          console.log('📊 Primeiro item (PT):', data[0])
          
          // Mapear campos PT → EN
          const mappedItems = data.map((item: any) => ({
            id: item.id,
            name: item.nome,
            description: item.descricao,
            price: item.preco,
            category: item.categoria,
            available: item.disponivel,
            ingredients: item.ingredientes,
            allergens: item.alergenos
          }))
          
          console.log('📊 Primeiro item (EN):', mappedItems[0])
          setMenuItems(mappedItems as MenuItem[])
          toast.success(`Cardápio carregado: ${data.length} itens`)
          return
        } else {
          console.log('⚠️ Banco de dados vazio')
          toast('Banco vazio, usando itens de exemplo', { icon: '⚠️' })
          setMenuItems(getMockMenuItems())
        }
      } catch (supabaseError) {
        console.error('❌ Erro no Supabase:', supabaseError)
        toast.error('Erro na conexão, usando dados de exemplo')
        setMenuItems(getMockMenuItems())
      }

             // Fallback para dados mock
       console.log('📝 Usando dados de exemplo...')
       setMenuItems(getMockMenuItems())
       
     } catch (generalError) {
       console.error('❌ Erro geral:', generalError)
       toast.error('Erro ao carregar menu')
       setMenuItems(getMockMenuItems())
    } finally {
      setLoading(false)
    }
  }

  const getMockMenuItems = (): MenuItem[] => [
    // Aperitivos
    {
      id: '1',
      name: 'Pastéis de Santa Teresa',
      description: 'Pastéis tradicionais fritos na hora com queijo coalho crocante',
      price: 18.90,
      category: 'Aperitivos',
      available: true,
      ingredients: ['massa', 'queijo coalho', 'temperos locais'],
      allergens: ['glúten', 'leite']
    },
    {
      id: '2',
      name: 'Bolinho de Bacalhau',
      description: 'Bolinhos crocantes recheados com bacalhau desfiado',
      price: 24.90,
      category: 'Aperitivos',
      available: true,
      ingredients: ['bacalhau', 'batata', 'ovos', 'salsa'],
      allergens: ['peixe', 'ovos', 'glúten']
    },
    // Pratos Individuais
    {
      id: '3',
      name: 'Feijoada Completa',
      description: 'Feijoada tradicional servida com arroz, couve, farofa e laranja',
      price: 45.90,
      category: 'Pratos Individuais',
      available: true,
      ingredients: ['feijão preto', 'carnes variadas', 'arroz', 'couve', 'farofa'],
      allergens: null
    },
    {
      id: '4',
      name: 'Bobó de Camarão',
      description: 'Cremoso bobó de camarão com leite de coco e dendê',
      price: 52.90,
      category: 'Pratos Individuais',
      available: true,
      ingredients: ['camarão', 'mandioca', 'leite de coco', 'dendê'],
      allergens: ['crustáceos']
    },
    {
      id: '5',
      name: 'Moqueca de Peixe',
      description: 'Moqueca capixaba com peixe fresco, tomate e pimentão',
      price: 48.90,
      category: 'Pratos Individuais',
      available: true,
      ingredients: ['peixe', 'tomate', 'pimentão', 'leite de coco'],
      allergens: ['peixe']
    },
    // Sanduíches
    {
      id: '6',
      name: 'Sanduba do Armazém',
      description: 'Pão artesanal com linguiça calabresa, queijo e vinagrete',
      price: 22.90,
      category: 'Sanduíches',
      available: true,
      ingredients: ['pão artesanal', 'linguiça calabresa', 'queijo', 'vinagrete'],
      allergens: ['glúten', 'leite']
    },
    // Bebidas
    {
      id: '7',
      name: 'Caipirinha de Cachaça Artesanal',
      description: 'Caipirinha tradicional com cachaça artesanal e limão galego',
      price: 15.90,
      category: 'Bebidas',
      available: true,
      ingredients: ['cachaça artesanal', 'limão galego', 'açúcar mascavo'],
      allergens: null
    },
    {
      id: '8',
      name: 'Chopp Artesanal',
      description: 'Chopp gelado da cervejaria local de Santa Teresa',
      price: 12.90,
      category: 'Bebidas',
      available: true,
      ingredients: ['malte', 'lúpulo', 'fermento'],
      allergens: ['glúten']
    },
    // Sobremesas
    {
      id: '9',
      name: 'Brigadeiro Gourmet',
      description: 'Brigadeiro artesanal com chocolate belga e granulado especial',
      price: 8.90,
      category: 'Sobremesas',
      available: true,
      ingredients: ['chocolate belga', 'leite condensado', 'manteiga', 'granulado'],
      allergens: ['leite', 'glúten']
    },
    {
      id: '10',
      name: 'Pudim de Leite Condensado',
      description: 'Pudim cremoso da casa com calda de açúcar queimado',
      price: 12.90,
      category: 'Sobremesas',
      available: true,
      ingredients: ['leite condensado', 'ovos', 'açúcar', 'baunilha'],
      allergens: ['leite', 'ovos']
    }
  ]

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
                      {items.map((item) => {
                        // Debug individual item
                        if (!item.name || item.price == null) {
                          console.error('🚨 Item inválido:', item)
                        }
                        
                        return (
                        <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-playfair text-xl font-semibold text-madeira-escura group-hover:text-amarelo-armazem transition-colors">
                                {item.name || 'Nome não disponível'}
                              </h3>
                              <span className="text-2xl font-bold text-vermelho-portas">
                                {item.price != null ? formatCurrency(item.price) : 'Preço não disponível'}
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
                        )
                      })}
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