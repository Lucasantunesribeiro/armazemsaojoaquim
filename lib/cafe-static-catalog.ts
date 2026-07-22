export interface CafeProduct {
  id: string
  name: string
  category: 'CAFE' | 'DOCE' | 'SALGADO' | 'BEBIDA' | string
  price: number
  description: string
  image_url: string
  available: boolean
}

/**
 * Catálogo estático degradado do Café contendo EXATAMENTE os 22 produtos autorizados
 * e extraídos de supabase/migrations/cafe_products_seed.sql.
 */
export const CAFE_STATIC_CATALOG: CafeProduct[] = [
  // CAFÉS
  {
    id: 'cafe-1',
    name: 'ESPRESSO',
    category: 'CAFE',
    price: 0,
    description: 'Café espresso tradicional',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-2',
    name: 'B 43',
    category: 'CAFE',
    price: 0,
    description: 'Licor 43, bayles, xarope de canela e espresso',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-3',
    name: 'CARAJILLO',
    category: 'CAFE',
    price: 0,
    description: 'Café especial com licor',
    image_url: '/images/placeholder.svg',
    available: false
  },

  // SOBREMESAS (DOCES)
  {
    id: 'cafe-4',
    name: 'MARQUISE AU CHOCOLAT',
    category: 'DOCE',
    price: 0,
    description: 'Saborosa sobremesa Francesa clássica e requintada com ganache de chocolate meio amargo, sorvete de creme e coulis do dia',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-5',
    name: 'DELICIA DE MANGA',
    category: 'DOCE',
    price: 0,
    description: 'Saborosa sobremesa brasileira feita de mousse de manga e coco, com molho de maracuja decorada com fatias de manga e coco ralado',
    image_url: '/images/menu/thumbs/delicia-de-manga.webp',
    available: false
  },
  {
    id: 'cafe-6',
    name: 'TARTE AUX POMMES',
    category: 'DOCE',
    price: 0,
    description: 'Deliciosa sobremesa Francesa atemporal de massa sablée recheada com purê fino de maçã, e laminas de maçã, guarnecida de sorvete de creme e coulis do dia',
    image_url: '/images/menu/thumbs/tarte-aux-pommes.webp',
    available: false
  },

  // BEBIDAS
  {
    id: 'cafe-7',
    name: 'ÁGUA MINERAL COM GAS',
    category: 'BEBIDA',
    price: 0,
    description: 'Água mineral com gás',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-8',
    name: 'ÁGUA MINERAL SEM GAS',
    category: 'BEBIDA',
    price: 0,
    description: 'Água mineral sem gás',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-9',
    name: 'ÁGUA DE COCO',
    category: 'BEBIDA',
    price: 0,
    description: 'Água de coco 500ml',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-10',
    name: 'REFRIGERANTE COCA-COLA TRADICIONAL',
    category: 'BEBIDA',
    price: 0,
    description: 'Coca-Cola tradicional',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-11',
    name: 'REFRIGERANTE COCA-COLA ZERO',
    category: 'BEBIDA',
    price: 0,
    description: 'Coca-Cola zero',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-12',
    name: 'REFRIGERANTE GUARANÁ TRADICIONAL',
    category: 'BEBIDA',
    price: 0,
    description: 'Guaraná tradicional',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-13',
    name: 'REFRIGERANTE GUARANÁ ZERO',
    category: 'BEBIDA',
    price: 0,
    description: 'Guaraná zero',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-14',
    name: 'SODAS ARTESANAIS',
    category: 'BEBIDA',
    price: 0,
    description: 'Hibisco, Gengibre, Capim-limão e Maracujá',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-15',
    name: 'LIMONADA',
    category: 'BEBIDA',
    price: 0,
    description: 'Suíça sem açúcar e coada',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-16',
    name: 'PINK LEMONADE',
    category: 'BEBIDA',
    price: 0,
    description: 'Limonada da casa, adoçada com xarope de hibisco',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-17',
    name: 'LARANJA MIX',
    category: 'BEBIDA',
    price: 0,
    description: 'Suco de laranja pera e bahia',
    image_url: '/images/placeholder.svg',
    available: false
  },
  {
    id: 'cafe-18',
    name: 'OLHA O MATE!',
    category: 'BEBIDA',
    price: 0,
    description: 'Mate adoçado com xarope artesanal. Opção: maracujá ou limão',
    image_url: '/images/placeholder.svg',
    available: false
  },

  // SALGADOS
  {
    id: 'cafe-19',
    name: 'PÃO DE ALHO',
    category: 'SALGADO',
    price: 0,
    description: 'Porção aperitiva de pão de alho (02 un)',
    image_url: '/images/menu/thumbs/pao-de-alho.webp',
    available: false
  },
  {
    id: 'cafe-20',
    name: 'PASTÉIS DE QUEIJO',
    category: 'SALGADO',
    price: 0,
    description: 'Porção aperitiva de pastel de queijo (06 un)',
    image_url: '/images/menu/thumbs/pastel-de-queijo.webp',
    available: true
  },
  {
    id: 'cafe-21',
    name: 'BOLINHO DE BACALHAU',
    category: 'SALGADO',
    price: 0,
    description: 'Porção aperitiva de bolinho de bacalhau (06 un)',
    image_url: '/images/menu/thumbs/bolinho-de-bacalhau.webp',
    available: true
  },
  {
    id: 'cafe-22',
    name: 'PASTÉIS DE PUPUNHA',
    category: 'SALGADO',
    price: 0,
    description: 'Porção aperitiva de pastel de palmito pupunha com leve toque de catupiry (06 un)',
    image_url: '/images/placeholder.svg',
    available: true
  }
]

export function getDegradedCafeProducts(): CafeProduct[] {
  return CAFE_STATIC_CATALOG
}
