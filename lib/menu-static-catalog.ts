import { getMenuImageUrl } from './menu-image-helper'

export interface MenuItemCatalog {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  available: boolean
  featured: boolean
  allergens: string[] | null
  image_url: string
  preparation_time: number | null
  ingredients: string[] | null
}

interface MenuItemSeedItem {
  name: string
  description: string
  price: number
  category: string
  available: boolean
  featured: boolean
  allergens?: string[] | null
  preparation_time?: number | null
  ingredients?: string[] | null
}

const RAW_MENU_SEED: MenuItemSeedItem[] = [
  // PETISCOS
  { name: 'PATATAS BRAVAS', description: 'Porção aperitiva de patatas bravas com molho de pimenta e maionese aioli da casa', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'CROQUETA DE COSTELA', description: 'Croquetas recheadas com costela desfiada bem temperada com molho aioli da casa (06 un)', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'LINGUIÇA NA BRASA', description: 'Linguiça artesanal assada na brasa acompanhada de farofa e vinagrete', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'BOLINHO DE FEIJOADA', description: 'Porção aperitiva de bolinho de feijoada (06 un)', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'PÃO DE ALHO', description: 'Porção aperitiva de pão de alho (02 un)', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'BOLINHO DE BACALHAU', description: 'Porção aperitiva de bolinho de bacalhau (06 un)', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'PASTÉIS DE PUPUNHA', description: 'Porção aperitiva de pastel de palmito pupunha com leve toque de catupiry (06 un)', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'ÍSCAS DE PEIXE', description: 'Porção aperitiva de iscas de peixe empanadas e crocantes acompanhadas de molho tártaro', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'PASTÉIS QUEIJO', description: 'Porção aperitiva de pastel de queijo (06 un)', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'ÍSCAS DE FRANGO', description: 'Porção aperitiva de iscas de frango empanadas e crocantes com molho de mostarda e mel', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'PASTÉIS CARNE SECA E CREME DE QUEIJO', description: 'Porção aperitiva de pastel de carne seca e creme de queijo (06 un)', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'PALMITO PUPUNHA', description: 'Palmito pupunha assado na brasa com azeite de ervas e flor de sal', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'TORRESMO', description: 'Porção de torresmo crocante e suculento', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'VINAGRETE DE POLVO', description: 'Polvo fatiado com vinagrete fresco de tomate, cebola roxa e pimentões', price: 0, category: 'PETISCOS', available: false, featured: false },
  { name: 'CEVICHE CARIOCA', description: 'Peixe branco fresco marinado no limão com cebola roxa, coentro e pimenta', price: 0, category: 'PETISCOS', available: false, featured: false },

  // SALADAS
  { name: 'CAPRESE MINEIRA', description: 'Tomates frescos, queijo minas padrão, manjericão e redução de balsâmico', price: 0, category: 'SALADAS', available: false, featured: false },
  { name: 'CAESER SALAD COM FATIAS DE FRANGO', description: 'Alface americana, tiras de frango grelhado, croutons, queijo parmesão e molho caesar', price: 0, category: 'SALADAS', available: false, featured: false },
  { name: 'CAESER SALAD SEM FATIAS DE FRANGO', description: 'Alface americana, croutons, queijo parmesão ralado e molho caesar tradicional', price: 0, category: 'SALADAS', available: false, featured: false },
  { name: 'SALADA DE GRÃOS COM TILÁPIA', description: 'Mix de grãos (quinoa, lentilha, grão de bico) com filé de tilápia grelhado', price: 0, category: 'SALADAS', available: false, featured: false },
  { name: 'SALADA DE GRÃOS COM FRANGO', description: 'Mix de grãos frescos com tiras de frango grelhado ao molho cítrico', price: 0, category: 'SALADAS', available: false, featured: false },

  // PRATOS PRINCIPAIS
  { name: 'SOBRECOXA AO CARVÃO', description: 'Sobrecoxa de frango desossada e marinada assada na brasa de carvão', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'PICANHA AO CARVÃO', description: 'Corte nobre de picanha grelhada na brasa de carvão no ponto de sua preferência', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'MOQUECA BANANA DA TERRA', description: 'Moqueca vegetariana de banana da terra com pimentões, leite de coco e azeite de dendê', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'TILÁPIA NA BRASA', description: 'Filé de tilápia assado na brasa com alho, ervas e limão', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'BIFE ANCHO', description: 'Corte alto de bife ancho suculento preparado na brasa', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'MIX NA BRASA', description: 'Seleção especial de carnes assadas na brasa (picanha, linguiça e frango)', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'RISOTO DE BACALHAU', description: 'Risoto cremoso com lascas de bacalhau azeitado, azeitonas pretas e tomate confit', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'MIX VEGETARIANO', description: 'Seleção de legumes assados na brasa com quinoa e molho de ervas', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'TILÁPIA GRELHADA', description: 'Filé de tilápia grelhado na chapa com azeite de ervas', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'BIFE MILANESA', description: 'Bife empanado crocante dourado por fora e macio por dentro', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'ATUM EM CROSTA', description: 'Atum selado em crosta de gergelim acompanhado de molho tarê', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'MILANESA DE FRANGO', description: 'Filé de frango empanado crocante', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'POSTA DE SALMÃO GRELHADO', description: 'Posta de salmão fresco grelhada com molho de maracujá ou ervas', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'POLVO GRELHADO COM ARROZ NEGRO', description: 'Tentáculos de polvo grelhados servidos sobre risoto de arroz negro', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'FEIJOADA DA CASA - INDIVIDUAL', description: 'Feijoada tradicional completa servida em porção individual', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'FEIJOADA DA CASA - PARA DOIS', description: 'Feijoada tradicional completa bem servida para duas pessoas', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },
  { name: 'FEIJOADA DA CASA - BUFFET LIVRE', description: 'Buffet livre de feijoada com todos os acompanhamentos tradicionais aos finais de semana', price: 0, category: 'PRATOS PRINCIPAIS', available: false, featured: false },

  // SANDUÍCHES
  { name: 'HAMBÚRGUER DA CASA', description: 'Hambúrguer artesanal de fraldinha (180g), queijo derretido, bacon crocante e maionese especial no pão brioche', price: 0, category: 'SANDUÍCHES', available: false, featured: false },
  { name: 'HAMBÚRGUER VEGETARIANO', description: 'Hambúrguer artesanal de grão de bico e cogumelos no pão brioche', price: 0, category: 'SANDUÍCHES', available: false, featured: false },
  { name: 'CHORI-PÃO', description: 'Sanduíche tradicional argentino de linguiça artesanal no pão francês com chimichurri da casa', price: 0, category: 'SANDUÍCHES', available: false, featured: false },

  // SOBREMESAS
  { name: 'MARQUISE AU CHOCOLAT', description: 'Sobremesa de mousse ganache de chocolate meio amargo com coulis de frutas vermelhas', price: 0, category: 'SOBREMESAS', available: false, featured: false },
  { name: 'DELICIA DE MANGA', description: 'Sobremesa de mousse de manga e coco com calda de maracujá', price: 0, category: 'SOBREMESAS', available: false, featured: false },
  { name: 'TARTE AUX POMMES', description: 'Torta de maçã francesa com massa crocante e sorvete de creme', price: 0, category: 'SOBREMESAS', available: false, featured: false },

  // BEBIDAS SEM ÁLCOOL
  { name: 'ÁGUA MINERAL COM GAS', description: 'Água mineral com gás 500ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'ÁGUA MINERAL SEM GAS', description: 'Água mineral sem gás 500ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'ÁGUA DE COCO', description: 'Água de coco natural 500ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'ÁGUA TÔNICA TRADICIONAL', description: 'Lata 350ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'ÁGUA TÔNICA ZERO', description: 'Lata 350ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'SHOT DE LIMÃO', description: 'Shot concentrado de limão taiti', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'REFRIGERANTE COCA-COLA TRADICIONAL', description: 'Lata 350ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'REFRIGERANTE COCA-COLA ZERO', description: 'Lata 350ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'REFRIGERANTE GUARANÁ TRADICIONAL', description: 'Lata 350ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'REFRIGERANTE GUARANÁ ZERO', description: 'Lata 350ml', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'SODAS ARTESANAIS', description: 'Sabores: Hibisco, Gengibre, Capim-limão ou Maracujá', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'LIMONADA', description: 'Limonada suíça coada', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'PINK LEMONADE', description: 'Limonada da casa com xarope artesanal de hibisco', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'LARANJA MIX', description: 'Suco natural de laranja pera e bahia', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },
  { name: 'OLHA O MATE!', description: 'Chá mate gelado artesanal com limão ou maracujá', price: 0, category: 'BEBIDAS SEM ÁLCOOL', available: false, featured: false },

  // GUARNIÇÕES
  { name: 'Feijão', description: 'Porção de feijão caseiro temperado', price: 0, category: 'GUARNIÇÕES', available: false, featured: false },
  { name: 'Arroz', description: 'Porção de arroz branco soltinho', price: 0, category: 'GUARNIÇÕES', available: false, featured: false },
  { name: 'Patatas Brava', description: 'Porção de batatas rústicas com tempero picante', price: 0, category: 'GUARNIÇÕES', available: false, featured: false },
  { name: 'Legumes na Brasa', description: 'Porção de legumes frescos assados na brasa', price: 0, category: 'GUARNIÇÕES', available: false, featured: false },
  { name: 'Farofa', description: 'Porção de farofa crocante da casa', price: 0, category: 'GUARNIÇÕES', available: false, featured: false },
  { name: 'Puré de Batata', description: 'Porção de purê de batata cremoso', price: 0, category: 'GUARNIÇÕES', available: false, featured: false },
  { name: 'Saladinha da Casa', description: 'Porção individual de folhosos e tomate', price: 0, category: 'GUARNIÇÕES', available: false, featured: false },

  // SUGESTÃO DO CHEF
  { name: 'ATUM AVOCADO', description: 'Tartare de atum temperado com teriyaki e mostarda sobre guacamole', price: 0, category: 'SUGESTÃO DO CHEF', available: false, featured: true },
  { name: 'LULINHAS DO ARMAZÉM', description: 'Anéis de lulinha empanadas com vinho branco e ervas', price: 0, category: 'SUGESTÃO DO CHEF', available: false, featured: true },
  { name: 'CALAMARES À LA PRANCHA', description: 'Calamares com vinho branco, ervas e batatas bravas', price: 0, category: 'SUGESTÃO DO CHEF', available: false, featured: true },
  { name: 'TABULE MARROQUINO COM SALMÃO GRAVLAX', description: 'Cuscuz marroquinho com mini legumes e lâminas de salmão gravlax', price: 0, category: 'SUGESTÃO DO CHEF', available: false, featured: true },
  { name: 'SABOR MEDITERRÂNEO', description: 'Frutos do mar grelhados (polvo, tilápia e lulinhas) com legumes braseados', price: 0, category: 'SUGESTÃO DO CHEF', available: false, featured: true }
]

export const MENU_STATIC_CATALOG: MenuItemCatalog[] = RAW_MENU_SEED.map((item, idx) => ({
  ...item,
  id: `static-${idx + 1}`,
  allergens: item.allergens || null,
  preparation_time: item.preparation_time || null,
  ingredients: item.ingredients || null,
  image_url: getMenuImageUrl({ name: item.name }, 'thumb')
}))

export function getDegradedMenuCatalog(): MenuItemCatalog[] {
  return MENU_STATIC_CATALOG
}
