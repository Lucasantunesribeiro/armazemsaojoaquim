import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('☕ Cafe Products API: Iniciando busca de produtos...')

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const maxPrice = searchParams.get('max_price')
    const available = searchParams.get('available')

    // Buscar produtos do banco
    let query = supabase
      .from('cafe_products')
      .select('*')

    // Aplicar filtros
    if (category && category !== 'all') {
      query = query.eq('category', category.toUpperCase())
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (available === 'true') {
      query = query.eq('available', true)
    }

    // Ordenar por categoria e nome
    query = query.order('category').order('name')

    const { data, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar produtos do café:', error)
      // Fallback para dados mock em caso de erro
      return getFallbackProducts(category, maxPrice, available)
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum produto encontrado no banco, usando fallback')
      return getFallbackProducts(category, maxPrice, available)
    }

    console.log(`✅ Cafe Products API: ${data.length} produtos encontrados no banco`)

    return NextResponse.json({
      success: true,
      data: data,
      count: data.length,
      categories: ['CAFE', 'DOCE', 'SALGADO', 'BEBIDA', 'SORVETE']
    })

  } catch (error) {
    console.error('💥 Erro na API de produtos do café:', error)
    // Fallback para dados mock em caso de erro
    return getFallbackProducts()
  }
}

function getFallbackProducts(category?: string | null, maxPrice?: string | null, available?: string | null) {
  console.log('📦 Usando produtos de fallback do café')

  // Dados de fallback baseados no PDF extraído
  const mockProducts = [
    // CAFÉS
    {
      id: '1',
      name: 'ESPRESSO',
      category: 'CAFE',
      description: 'Café espresso tradicional',
      price: 9.00,
      image_url: '/images/cafe/espresso.webp',
      available: true,
      preparation_time: 3,
      ingredients: ['Café espresso'],
      allergens: [],
      origin: 'Brasil',
      roast_level: 'Média',
      created_at: '2024-01-01T08:00:00Z',
      updated_at: '2024-01-01T08:00:00Z'
    },
    {
      id: '2',
      name: 'B 43',
      category: 'CAFE',
      description: 'Licor 43, bayles, xarope de canela e espresso',
      price: 32.00,
      image_url: '/images/cafe/b43.webp',
      available: true,
      preparation_time: 8,
      ingredients: ['Licor 43', 'Baileys', 'Xarope de canela', 'Espresso'],
      allergens: ['Lactose', 'Álcool'],
      origin: 'Receita da casa',
      roast_level: 'Média',
      created_at: '2024-01-02T08:00:00Z',
      updated_at: '2024-01-02T08:00:00Z'
    },
    {
      id: '3',
      name: 'CARAJILLO',
      category: 'CAFE',
      description: 'Café especial com licor',
      price: 32.00,
      image_url: '/images/cafe/carajillo.webp',
      available: true,
      preparation_time: 8,
      ingredients: ['Café espresso', 'Licor'],
      allergens: ['Álcool'],
      origin: 'Receita tradicional',
      roast_level: 'Média',
      created_at: '2024-01-03T08:00:00Z',
      updated_at: '2024-01-03T08:00:00Z'
    },

    // DOCES
    {
      id: '4',
      name: 'MARQUISE AU CHOCOLAT',
      category: 'DOCE',
      description: 'Saborosa sobremesa Francesa clássica e requintada com ganache de chocolate meio amargo, sorvete de creme e coulis do dia',
      price: 25.00,
      image_url: '/images/cafe/marquise-chocolat.webp',
      available: true,
      preparation_time: 15,
      ingredients: ['Chocolate meio amargo', 'Sorvete de creme', 'Coulis'],
      allergens: ['Lactose', 'Glúten'],
      origin: 'França',
      roast_level: null,
      created_at: '2024-01-04T08:00:00Z',
      updated_at: '2024-01-04T08:00:00Z'
    },
    {
      id: '5',
      name: 'DELICIA DE MANGA',
      category: 'DOCE',
      description: 'Saborosa sobremesa brasileira feita de mousse de manga e coco, com molho de maracuja decorada com fatias de manga e coco ralado',
      price: 25.00,
      image_url: '/images/cafe/delicia-manga.webp',
      available: true,
      preparation_time: 12,
      ingredients: ['Manga', 'Coco', 'Maracujá'],
      allergens: ['Lactose'],
      origin: 'Brasil',
      roast_level: null,
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-05T08:00:00Z'
    },
    {
      id: '6',
      name: 'TARTE AUX POMMES',
      category: 'DOCE',
      description: 'Deliciosa sobremesa Francesa atemporal de massa sablée recheada com purê fino de maçã, e laminas de maçã, guarnecida de sorvete de creme e coulis do dia',
      price: 25.00,
      image_url: '/images/cafe/tarte-pommes.webp',
      available: true,
      preparation_time: 15,
      ingredients: ['Massa sablée', 'Maçã', 'Sorvete de creme', 'Coulis'],
      allergens: ['Glúten', 'Lactose'],
      origin: 'França',
      roast_level: null,
      created_at: '2024-01-06T08:00:00Z',
      updated_at: '2024-01-06T08:00:00Z'
    },

    // SALGADOS
    {
      id: '7',
      name: 'PÃO DE ALHO',
      category: 'SALGADO',
      description: 'Porção aperitiva de pão de alho (02 un)',
      price: 12.00,
      image_url: '/images/cafe/pao-alho.webp',
      available: true,
      preparation_time: 10,
      ingredients: ['Pão', 'Alho', 'Manteiga'],
      allergens: ['Glúten', 'Lactose'],
      origin: 'Receita da casa',
      roast_level: null,
      created_at: '2024-01-07T08:00:00Z',
      updated_at: '2024-01-07T08:00:00Z'
    },
    {
      id: '8',
      name: 'PASTÉIS DE QUEIJO',
      category: 'SALGADO',
      description: 'Porção aperitiva de pastel de queijo (06 un)',
      price: 29.00,
      image_url: '/images/cafe/pasteis-queijo.webp',
      available: true,
      preparation_time: 15,
      ingredients: ['Massa de pastel', 'Queijo'],
      allergens: ['Glúten', 'Lactose'],
      origin: 'Receita da casa',
      roast_level: null,
      created_at: '2024-01-08T08:00:00Z',
      updated_at: '2024-01-08T08:00:00Z'
    },
    {
      id: '9',
      name: 'BOLINHO DE BACALHAU',
      category: 'SALGADO',
      description: 'Porção aperitiva de bolinho de bacalhau (06 un)',
      price: 29.00,
      image_url: '/images/cafe/bolinho-bacalhau.webp',
      available: true,
      preparation_time: 15,
      ingredients: ['Bacalhau', 'Batata', 'Ovos', 'Farinha'],
      allergens: ['Peixe', 'Glúten', 'Ovos'],
      origin: 'Receita tradicional',
      roast_level: null,
      created_at: '2024-01-09T08:00:00Z',
      updated_at: '2024-01-09T08:00:00Z'
    },

    // BEBIDAS
    {
      id: '10',
      name: 'ÁGUA MINERAL COM GAS',
      category: 'BEBIDA',
      description: 'Água mineral com gás',
      price: 9.00,
      image_url: '/images/cafe/agua-gas.webp',
      available: true,
      preparation_time: 1,
      ingredients: ['Água mineral'],
      allergens: [],
      origin: 'Natural',
      roast_level: null,
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-10T08:00:00Z'
    },
    {
      id: '11',
      name: 'ÁGUA MINERAL SEM GAS',
      category: 'BEBIDA',
      description: 'Água mineral sem gás',
      price: 9.00,
      image_url: '/images/cafe/agua-sem-gas.webp',
      available: true,
      preparation_time: 1,
      ingredients: ['Água mineral'],
      allergens: [],
      origin: 'Natural',
      roast_level: null,
      created_at: '2024-01-11T08:00:00Z',
      updated_at: '2024-01-11T08:00:00Z'
    },
    {
      id: '12',
      name: 'PINK LEMONADE',
      category: 'BEBIDA',
      description: 'Limonada da casa, adoçada com xarope de hibisco',
      price: 14.00,
      image_url: '/images/cafe/pink-lemonade.webp',
      available: true,
      preparation_time: 5,
      ingredients: ['Limão', 'Xarope de hibisco', 'Água'],
      allergens: [],
      origin: 'Receita da casa',
      roast_level: null,
      created_at: '2024-01-12T08:00:00Z',
      updated_at: '2024-01-12T08:00:00Z'
    },
    {
      id: '13',
      name: 'LARANJA MIX',
      category: 'BEBIDA',
      description: 'Suco de laranja pera e bahia',
      price: 14.00,
      image_url: '/images/cafe/laranja-mix.webp',
      available: true,
      preparation_time: 5,
      ingredients: ['Laranja pera', 'Laranja bahia'],
      allergens: [],
      origin: 'Natural',
      roast_level: null,
      created_at: '2024-01-13T08:00:00Z',
      updated_at: '2024-01-13T08:00:00Z'
    }
  ]

  let filteredProducts = mockProducts

  // Aplicar filtros nos dados de fallback
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    )
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(product => 
      product.price <= parseFloat(maxPrice)
    )
  }

  if (available === 'true') {
    filteredProducts = filteredProducts.filter(product => product.available)
  }

  console.log(`✅ Cafe Products API: ${filteredProducts.length} produtos de fallback filtrados`)

  return NextResponse.json({
    success: true,
    data: filteredProducts,
    count: filteredProducts.length,
    total: mockProducts.length,
    categories: ['CAFE', 'DOCE', 'SALGADO', 'BEBIDA', 'SORVETE']
  })
}