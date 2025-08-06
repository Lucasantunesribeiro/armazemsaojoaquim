import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    console.log(`📝 Blog Post API: Buscando post com slug "${slug}"...`)

    // Mock data dos posts do blog (mesmo do route principal)
    const mockPosts = [
      {
        id: '1',
        title: 'A História do Armazém São Joaquim',
        slug: 'historia-armazem-sao-joaquim',
        excerpt: 'Descubra como um antigo armazém do século XIX se transformou em um dos pontos gastronômicos mais charmosos de Santa Teresa.',
        content: `
          <p>O Armazém São Joaquim tem uma história rica que remonta ao século XIX. Localizado no coração do bairro histórico de Santa Teresa, o edifício já serviu como ponto de encontro para comerciantes e moradores locais.</p>
          
          <p>Durante a reforma cuidadosa, foram preservados elementos arquitetônicos originais como as vigas de madeira de lei, os tijolos aparentes e os azulejos portugueses encontrados nas paredes internas.</p>
          
          <p>Hoje, o espaço mantém viva essa tradição histórica, oferecendo uma experiência gastronômica única que honra o passado enquanto abraça o presente.</p>
          
          <h3>Descobertas Arqueológicas</h3>
          <p>Durante as escavações para a reforma, foram encontrados objetos históricos que hoje fazem parte da decoração do restaurante, incluindo moedas antigas, utensílios domésticos e fragmentos de cerâmica portuguesa.</p>
          
          <h3>Preservação do Patrimônio</h3>
          <p>Todo o processo de restauração foi acompanhado pelo Instituto do Patrimônio Histórico, garantindo que as características originais do edifício fossem mantidas para as futuras gerações.</p>
        `,
        featured_image: '/images/blog/historia-armazem.jpg',
        published: true,
        author: 'Equipe Armazém',
        published_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        tags: ['História', 'Santa Teresa', 'Patrimônio'],
        category: 'História',
        language: 'pt-BR',
        reading_time: 3,
        related_posts: ['segredos-feijoada-armazem', 'arte-mixologia-armazem']
      },
      {
        id: '2',
        title: 'Os Segredos da Nossa Feijoada',
        slug: 'segredos-feijoada-armazem',
        excerpt: 'Conheça os ingredientes especiais e o preparo tradicional que tornam nossa feijoada única no Rio de Janeiro.',
        content: `
          <p>Nossa feijoada é preparada seguindo uma receita tradicional mineira, passada de geração em geração. O segredo está na seleção criteriosa dos ingredientes e no tempo de cozimento.</p>
          
          <p>Utilizamos feijão preto especial, carnes defumadas artesanalmente e temperos frescos colhidos na própria horta. O resultado é um prato que desperta todos os sentidos.</p>
          
          <p>Servida tradicionalmente aos sábados, nossa feijoada vem acompanhada de arroz, farofa crocante, couve refogada e laranja para complementar perfeitamente a experiência.</p>
          
          <h3>Ingredientes Selecionados</h3>
          <ul>
            <li>Feijão preto premium do interior de Minas Gerais</li>
            <li>Costela suína defumada por 12 horas</li>
            <li>Linguiça artesanal da casa</li>
            <li>Bacon especial de porco caipira</li>
            <li>Carne seca tradicional do sertão</li>
          </ul>
          
          <h3>Processo de Preparo</h3>
          <p>O preparo leva mais de 6 horas, começando na madrugada de sábado. O feijão é cozido lentamente em fogo baixo, permitindo que todos os sabores se integrem perfeitamente.</p>
          
          <h3>Acompanhamentos Tradicionais</h3>
          <p>Nossa farofa é torrada com bacon e temperos especiais. A couve é refogada no momento do serviço para manter a textura crocante. O arroz branco soltinho completa a harmonia do prato.</p>
        `,
        featured_image: '/images/blog/segredos-feijoada.jpg',
        published: true,
        author: 'Chef da Casa',
        published_at: '2024-02-01T14:00:00Z',
        created_at: '2024-02-01T13:00:00Z',
        updated_at: '2024-02-01T14:00:00Z',
        tags: ['Culinária', 'Feijoada', 'Receitas'],
        category: 'Gastronomia',
        language: 'pt-BR',
        reading_time: 4,
        related_posts: ['historia-armazem-sao-joaquim', 'arte-mixologia-armazem']
      },
      {
        id: '3',
        title: 'A Arte da Mixologia no Armazém',
        slug: 'arte-mixologia-armazem',
        excerpt: 'Nossos bartenders criam drinks especiais inspirados na cultura carioca e na história do bairro de Santa Teresa.',
        content: `
          <p>No Armazém São Joaquim, a coquetelaria é uma arte. Nossos bartenders especializados criam drinks únicos que contam histórias através de sabores e aromas.</p>
          
          <p>Utilizamos ingredientes frescos locais, cachaças artesanais e técnicas modernas para criar experiências únicas. Cada drink tem uma história e uma conexão com o bairro.</p>
          
          <p>Experimente nosso "Bondinho Dourado", um coquetel exclusivo que homenageia o famoso transporte histórico de Santa Teresa, ou o "Pôr do Sol Teresa", inspirado nas vistas deslumbrantes do bairro.</p>
          
          <h3>Drinks Exclusivos da Casa</h3>
          
          <h4>Bondinho Dourado</h4>
          <p>Cachaça envelhecida, licor de jabuticaba, xarope de açúcar mascavo e limão siciliano. Servido em taça gelada com decoração que lembra os trilhos do bondinho.</p>
          
          <h4>Pôr do Sol Teresa</h4>
          <p>Gin artesanal carioca, aperol, xarope de hibisco e água tônica premium. As cores imitam o pôr do sol visto do alto de Santa Teresa.</p>
          
          <h4>Memórias do Armazém</h4>
          <p>Coquetel à base de rum envelhecido, xarope de rapadura e especiarias. Uma homenagem aos sabores que passaram por este antigo armazém.</p>
          
          <h3>Técnicas Especiais</h3>
          <p>Nossos bartenders utilizam técnicas como clarificação, infusões controladas por temperatura e cristalização para criar texturas e sabores únicos.</p>
          
          <h3>Ingredientes Locais</h3>
          <p>Trabalhamos com produtores locais para obter ervas frescas, frutas da época e cachaças artesanais que representam o melhor da cultura carioca.</p>
        `,
        featured_image: '/images/blog/drinks.jpg',
        published: true,
        author: 'Bartender Chefe',
        published_at: '2024-02-10T16:00:00Z',
        created_at: '2024-02-10T15:00:00Z',
        updated_at: '2024-02-10T16:00:00Z',
        tags: ['Drinks', 'Mixologia', 'Coquetéis'],
        category: 'Bebidas',
        language: 'pt-BR',
        reading_time: 3,
        related_posts: ['historia-armazem-sao-joaquim', 'eventos-especiais-armazem']
      },
      {
        id: '4',
        title: 'Eventos Especiais no Armazém',
        slug: 'eventos-especiais-armazem',
        excerpt: 'Descubra como nosso espaço histórico pode ser o cenário perfeito para seus eventos especiais e celebrações.',
        content: `
          <p>O Armazém São Joaquim oferece um ambiente único para eventos especiais. Nosso espaço histórico proporciona uma atmosfera inesquecível para celebrações íntimas e corporativas.</p>
          
          <p>Com capacidade para até 80 pessoas, oferecemos pacotes personalizados que incluem menu degustação, drinks especiais e decoração temática que respeita o charme histórico do local.</p>
          
          <p>Seja um aniversário, casamento, lançamento de produto ou confraternização empresarial, nossa equipe se dedica a criar experiências memoráveis para seus convidados.</p>
          
          <h3>Tipos de Eventos</h3>
          
          <h4>Casamentos Íntimos</h4>
          <p>Cerimônias para até 50 pessoas com decoração romântica que valoriza os elementos históricos do espaço. Inclui menu especial e sommelier para harmonização de vinhos.</p>
          
          <h4>Eventos Corporativos</h4>
          <p>Lançamentos de produtos, confraternizações e reuniões de negócios em ambiente diferenciado. Oferecemos equipamentos audiovisuais e serviços de catering personalizados.</p>
          
          <h4>Aniversários e Celebrações</h4>
          <p>Festas de aniversário, formaturas e comemorações familiares. Ambiente acolhedor com opções de menu para todos os gostos e idades.</p>
          
          <h3>Serviços Inclusos</h3>
          <ul>
            <li>Coordenação completa do evento</li>
            <li>Decoração temática</li>
            <li>Menu personalizado</li>
            <li>Serviço de bar especializado</li>
            <li>Sonorização ambiente</li>
            <li>Fotógrafo parceiro (opcional)</li>
          </ul>
          
          <h3>Espaços Disponíveis</h3>
          <p>Nosso espaço conta com área interna climatizada, varanda coberta e pequeno jardim interno. Cada ambiente pode ser configurado conforme a necessidade do evento.</p>
          
          <h3>Como Reservar</h3>
          <p>Para consultas e orçamentos, entre em contato conosco com pelo menos 30 dias de antecedência. Nossa equipe fará uma visita técnica gratuita para planejar todos os detalhes do seu evento.</p>
        `,
        featured_image: '/images/blog/eventos.jpg',
        published: true,
        author: 'Coordenação de Eventos',
        published_at: '2024-02-20T12:00:00Z',
        created_at: '2024-02-20T11:00:00Z',
        updated_at: '2024-02-20T12:00:00Z',
        tags: ['Eventos', 'Celebrações', 'Espaços'],
        category: 'Eventos',
        language: 'pt-BR',
        reading_time: 2,
        related_posts: ['arte-mixologia-armazem', 'segredos-feijoada-armazem']
      }
    ]

    // Buscar post pelo slug
    const post = mockPosts.find(p => p.slug === slug && p.published)

    if (!post) {
      console.log(`❌ Blog Post API: Post com slug "${slug}" não encontrado`)
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Buscar posts relacionados
    const relatedPosts = mockPosts.filter(p => 
      post.related_posts?.includes(p.slug) && p.published
    ).map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featured_image,
      category: p.category,
      published_at: p.published_at,
      reading_time: p.reading_time
    }))

    console.log(`✅ Blog Post API: Post "${post.title}" encontrado (mock data)`)

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        related_posts: relatedPosts
      }
    })
  } catch (error) {
    console.error('💥 Erro na API de post individual do blog:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}