import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('☕ Cafe Products API: Iniciando busca de produtos...')

    // Mock data dos produtos do Café Armazém São Joaquim
    const mockProducts = [
      // CAFÉS ESPECIAIS
      {
        id: '1',
        name: 'Café Santa Teresa',
        category: 'CAFE',
        description: 'Blend especial da casa com grãos selecionados do interior mineiro. Torra média com notas de chocolate e caramelo.',
        price: 8.50,
        image_url: '/images/cafe/cafe-santa-teresa.jpg',
        available: true,
        preparation_time: 5,
        ingredients: ['Grãos arábica premium', 'Água filtrada'],
        allergens: [],
        origin: 'Minas Gerais',
        roast_level: 'Média',
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-01T08:00:00Z'
      },
      {
        id: '2',
        name: 'Cappuccino do Bondinho',
        category: 'CAFE',
        description: 'Cappuccino cremoso servido em xícara temática do bondinho. Espuma de leite vaporizado com arte latte.',
        price: 12.00,
        image_url: '/images/cafe/cappuccino-bondinho.jpg',
        available: true,
        preparation_time: 8,
        ingredients: ['Espresso Santa Teresa', 'Leite integral', 'Espuma de leite'],
        allergens: ['Lactose'],
        origin: 'Receita da casa',
        roast_level: 'Média',
        created_at: '2024-01-02T08:00:00Z',
        updated_at: '2024-01-02T08:00:00Z'
      },
      
      // DOCES CASEIROS
      {
        id: '3',
        name: 'Pão de Açúcar da Vovó',
        category: 'DOCES',
        description: 'Bolo caseiro tradicional com cobertura de açúcar cristal. Receita de família passada por gerações.',
        price: 6.50,
        image_url: '/images/cafe/pao-acucar-vovo.jpg',
        available: true,
        preparation_time: 0,
        ingredients: ['Farinha de trigo', 'Açúcar', 'Ovos', 'Manteiga', 'Fermento'],
        allergens: ['Glúten', 'Lactose', 'Ovos'],
        origin: 'Receita tradicional mineira',
        roast_level: null,
        created_at: '2024-01-03T08:00:00Z',
        updated_at: '2024-01-03T08:00:00Z'
      },
      {
        id: '4',
        name: 'Pudim de Leite Condensado',
        category: 'DOCES',
        description: 'Pudim cremoso feito com leite condensado artesanal. Servido com calda de caramelo queimado.',
        price: 8.00,
        image_url: '/images/cafe/pudim-leite-condensado.jpg',
        available: true,
        preparation_time: 0,
        ingredients: ['Leite condensado', 'Ovos', 'Leite', 'Açúcar para caramelo'],
        allergens: ['Lactose', 'Ovos'],
        origin: 'Receita da casa',
        roast_level: null,
        created_at: '2024-01-04T08:00:00Z',
        updated_at: '2024-01-04T08:00:00Z'
      },
      
      // SALGADOS
      {
        id: '5',
        name: 'Pão de Queijo Mineiro',
        category: 'SALGADOS',
        description: 'Pão de queijo tradicional mineiro feito com polvilho azedo e queijo curado. Servido quentinho.',
        price: 4.50,
        image_url: '/images/cafe/pao-queijo-mineiro.jpg',
        available: true,
        preparation_time: 10,
        ingredients: ['Polvilho azedo', 'Queijo minas', 'Ovos', 'Leite', 'Óleo'],
        allergens: ['Lactose', 'Ovos'],
        origin: 'Tradicional de Minas Gerais',
        roast_level: null,
        created_at: '2024-01-05T08:00:00Z',
        updated_at: '2024-01-05T08:00:00Z'
      },
      {
        id: '6',
        name: 'Coxinha da Casa',
        category: 'SALGADOS',
        description: 'Coxinha recheada com frango desfiado temperado com ervas finas. Massa dourada e crocante.',
        price: 7.00,
        image_url: '/images/cafe/coxinha-casa.jpg',
        available: true,
        preparation_time: 12,
        ingredients: ['Frango', 'Batata', 'Farinha de trigo', 'Temperos', 'Farinha de rosca'],
        allergens: ['Glúten'],
        origin: 'Receita aprimorada da casa',
        roast_level: null,
        created_at: '2024-01-06T08:00:00Z',
        updated_at: '2024-01-06T08:00:00Z'
      },
      
      // BEBIDAS GELADAS
      {
        id: '7',
        name: 'Limonada Suíça',
        category: 'BEBIDAS',
        description: 'Limonada refrescante com leite condensado e gelo. Perfeita para os dias quentes do Rio.',
        price: 9.50,
        image_url: '/images/cafe/limonada-suica.jpg',
        available: true,
        preparation_time: 5,
        ingredients: ['Limão tahiti', 'Leite condensado', 'Gelo', 'Açúcar'],
        allergens: ['Lactose'],
        origin: 'Clássico brasileiro',
        roast_level: null,
        created_at: '2024-01-07T08:00:00Z',
        updated_at: '2024-01-07T08:00:00Z'
      },
      {
        id: '8',
        name: 'Água de Coco Gelada',
        category: 'BEBIDAS',
        description: 'Água de coco natural servida gelada. Direto do coco verde para máximo frescor.',
        price: 6.00,
        image_url: '/images/cafe/agua-coco.jpg',
        available: true,
        preparation_time: 2,
        ingredients: ['Coco verde'],
        allergens: [],
        origin: 'Natural',
        roast_level: null,
        created_at: '2024-01-08T08:00:00Z',
        updated_at: '2024-01-08T08:00:00Z'
      }
    ]

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const maxPrice = searchParams.get('max_price')
    const available = searchParams.get('available')
    
    let filteredProducts = mockProducts

    // Filtros
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

    console.log(`✅ Cafe Products API: ${filteredProducts.length} produtos encontrados (mock data)`)

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length,
      total: mockProducts.length,
      categories: ['CAFE', 'DOCES', 'SALGADOS', 'BEBIDAS']
    })
  } catch (error) {
    console.error('💥 Erro na API de produtos do café:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}