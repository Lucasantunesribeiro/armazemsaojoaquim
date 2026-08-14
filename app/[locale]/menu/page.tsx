'use client'

import { useState, useEffect } from 'react'
import { Search, Download, AlertCircle, Clock } from 'lucide-react'
import SimpleImage from '@/components/ui/SimpleImage'
// import ImageLoadingTest from '@/components/test/ImageLoadingTest'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { trackDatabaseError, trackApiError } from '@/lib/error-tracking'
import { menuCache } from '@/lib/cache-manager'
import { useTranslations } from '@/hooks/useTranslations'
import { FALLBACK_MENU_ITEMS, type MenuItem } from '@/lib/menu-fallback'

const getCategoriesList = (t: any) => [
  t('menu.categories.all') || 'Todos',
  t('menu.categories.starters') || 'PETISCOS',
  t('menu.categories.salads') || 'SALADAS',
  t('menu.categories.mains') || 'PRATOS PRINCIPAIS',
  t('menu.categories.vegetarian') || 'VEGANO / VEGETARIANO',
  t('menu.categories.sandwiches') || 'SANDUÍCHES',
  t('menu.categories.sides') || 'GUARNIÇÕES',
  t('menu.categories.desserts') || 'SOBREMESAS',
  t('menu.categories.coffees') || 'CAFÉS',
  t('menu.categories.beverages') || 'BEBIDAS SEM ÁLCOOL',
  t('menu.categories.beers') || 'CERVEJAS',
  t('menu.categories.drinks') || 'COQUETÉIS',
  t('menu.categories.caipirinhas') || 'CAIPIRINHAS',
  t('menu.categories.spirits') || 'DESTILADOS',
  t('menu.categories.wines') || 'VINHOS'
]

export default function MenuPage() {
  const { t } = useTranslations()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  
  const CATEGORIES = getCategoriesList(t)

  useEffect(() => {
    fetchMenuItems()
    // Inicializar categoria selecionada com a primeira categoria traduzida
    if (!selectedCategory && CATEGORIES.length > 0) {
      setSelectedCategory(CATEGORIES[0])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterItems()
  }, [menuItems, selectedCategory, searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMenuItems = async () => {
    try {
      // Verificar cache primeiro
      const cachedItems = menuCache.get<MenuItem[]>('menu-items')
      if (cachedItems) {
        setMenuItems(cachedItems)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('featured', { ascending: false })

      if (error) {
        trackDatabaseError(error, {
          component: 'MenuPage',
          action: 'Fetch Menu Items',
          additionalData: { query: 'menu_items' }
        })
        
        // Usar dados de fallback se a consulta falhar
        const fallbackItems = getFallbackMenuItems()
        setMenuItems(fallbackItems)
        menuCache.set('menu-items', fallbackItems) // Cache dos dados de fallback
        toast.error(t('menu.errors.loadError') || 'Erro ao carregar menu. Exibindo versão local.')
        return
      }

      if (data && data.length > 0) {
        // Mapear os dados do banco para a interface esperada
        const mappedItems = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          available: item.available,
          featured: item.featured,
          allergens: item.allergens,
          image_url: item.image_url,
          preparation_time: item.preparation_time,
          ingredients: item.ingredients
        }))
        
        // Ordenar no cliente para evitar problemas com múltiplas cláusulas order()
        const sortedItems = mappedItems.sort((a: MenuItem, b: MenuItem) => {
          // Primeiro por featured (destacados primeiro)
          if (a.featured !== b.featured) {
            return b.featured ? 1 : -1
          }
          // Depois por categoria
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          // Por último por nome
          return a.name.localeCompare(b.name)
        })
        
        setMenuItems(sortedItems)
        menuCache.set('menu-items', sortedItems) // Cache dos dados do banco
        toast.success(t('menu.success.loaded') || 'Menu carregado com sucesso')
      } else {
        // Se não há dados no banco, usar dados de fallback
        const fallbackItems = getFallbackMenuItems()
        setMenuItems(fallbackItems)
        menuCache.set('menu-items', fallbackItems) // Cache dos dados de fallback
        toast.success(t('menu.success.example') || 'Exibindo cardápio de exemplo')
      }
    } catch (error) {
      trackApiError(error, {
        component: 'MenuPage',
        action: 'Fetch Menu Items - Unexpected Error',
        additionalData: { errorType: 'unexpected' }
      })
      
      // Usar dados de fallback em caso de erro
      const fallbackItems = getFallbackMenuItems()
      setMenuItems(fallbackItems)
      menuCache.set('menu-items', fallbackItems) // Cache dos dados de fallback
      toast.error(t('menu.errors.loadError') || 'Erro ao carregar menu. Exibindo versão local.')
    } finally {
      setLoading(false)
    }
  }

  const getFallbackMenuItems = (): MenuItem[] => FALLBACK_MENU_ITEMS

  const filterItems = () => {
    let filtered = menuItems

    // Filtrar por categoria
    const allCategoriesText = t('menu.categories.all') || 'Todos'
    if (selectedCategory !== allCategoriesText) {
      // Mapeamento entre categorias traduzidas e originais
      const categoryMapping: { [key: string]: string } = {
        [t('menu.categories.starters') || 'PETISCOS']: 'PETISCOS',
        [t('menu.categories.salads') || 'SALADAS']: 'SALADAS',
        [t('menu.categories.mains') || 'PRATOS PRINCIPAIS']: 'PRATOS PRINCIPAIS',
        [t('menu.categories.vegetarian') || 'VEGANO / VEGETARIANO']: 'VEGANO / VEGETARIANO',
        [t('menu.categories.sandwiches') || 'SANDUÍCHES']: 'SANDUÍCHES',
        [t('menu.categories.sides') || 'GUARNIÇÕES']: 'GUARNIÇÕES',
        [t('menu.categories.desserts') || 'SOBREMESAS']: 'SOBREMESAS',
        [t('menu.categories.coffees') || 'CAFÉS']: 'CAFÉS',
        [t('menu.categories.beverages') || 'BEBIDAS SEM ÁLCOOL']: 'BEBIDAS SEM ÁLCOOL',
        [t('menu.categories.beers') || 'CERVEJAS']: 'CERVEJAS',
        [t('menu.categories.drinks') || 'COQUETÉIS']: 'COQUETÉIS',
        [t('menu.categories.caipirinhas') || 'CAIPIRINHAS']: 'CAIPIRINHAS',
        [t('menu.categories.spirits') || 'DESTILADOS']: 'DESTILADOS',
        [t('menu.categories.wines') || 'VINHOS']: 'VINHOS'
      }
      
      // Obter a categoria original baseada na tradução selecionada
      const originalCategory = categoryMapping[selectedCategory]
      
      if (originalCategory) {
        filtered = filtered.filter(item => item.category === originalCategory)
      }
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(searchLower)
        )
      )
    }

    setFilteredItems(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      const response = await fetch('/api/cardapio-pdf')
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.message || 'Erro ao baixar o cardápio')
        return
      }

      // Criar blob e download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cardapio-armazem-sao-joaquim.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Cardápio baixado com sucesso!')
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      toast.error('Erro ao baixar o cardápio')
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave flex items-center justify-center pt-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amarelo-armazem border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-madeira-escura font-inter">{t('menu.loading') || 'Carregando cardápio...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave">
      {/* Header Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <SimpleImage
            src="/images/armazem-interior-aconchegante.jpg"
            alt="Interior do Armazém São Joaquim"
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
              <span className="text-sm font-medium text-amarelo-armazem font-inter">
                {t('menu.badge') || 'Cardápio Tradicional'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair leading-tight">
              {t('menu.title') || 'Nosso Cardápio'}
              <span className="block text-amarelo-armazem">{t('menu.subtitle') || 'Tradicional'}</span>
            </h1>
            
            <p className="text-xl text-cinza-claro max-w-3xl mx-auto leading-relaxed font-inter">
              {t('menu.description') || 'Sabores autênticos que contam 170 anos de história gastronômica em Santa Teresa'}
            </p>

            {/* Download PDF Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center space-x-2 bg-amarelo-armazem hover:bg-vermelho-portas text-madeira-escura hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>{downloadingPdf ? (t('menu.downloading') || 'Baixando...') : (t('menu.downloadPdf') || 'Baixar Cardápio PDF')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cinza-medio w-5 h-5" />
              <input
                type="text"
                placeholder={t('menu.searchPlaceholder') || 'Buscar pratos, ingredientes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-cinza-claro rounded-xl focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-amarelo-armazem text-madeira-escura'
                      : 'bg-white/80 text-cinza-medio hover:bg-amarelo-armazem/20 hover:text-madeira-escura'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-amarelo-armazem/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-amarelo-armazem" />
              </div>
              <h3 className="text-xl font-bold text-madeira-escura mb-2">
                {t('menu.noResults.title') || 'Nenhum item encontrado'}
              </h3>
              <p className="text-cinza-medio">
                {t('menu.noResults.message') || 'Tente ajustar os filtros ou termo de busca'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <SimpleImage
                      src={item.image_url}
                      alt={item.name}
                      fill
                      loading="eager"
                      className="group-hover:scale-105 transition-transform duration-300 object-cover"
                    />
                    
                    {/* Featured Badge */}
                    {item.featured && (
                      <div className="absolute top-3 left-3 bg-amarelo-armazem text-madeira-escura px-3 py-1 rounded-full text-sm font-semibold">
                        {t('menu.featured') || 'Destaque'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-madeira-escura font-playfair">
                        {item.name}
                      </h3>
                      <span className="text-xl font-bold text-amarelo-armazem">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-cinza-medio text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Preparation Time */}
                    {item.preparation_time && (
                      <div className="flex items-center space-x-2 text-sm text-cinza-medio">
                        <Clock className="w-4 h-4" />
                        <span>{item.preparation_time} min</span>
                      </div>
                    )}

                    {/* Allergens */}
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((allergen, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-vermelho-portas/10 text-vermelho-portas text-xs rounded-full"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}