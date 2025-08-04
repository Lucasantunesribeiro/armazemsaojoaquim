// Sistema de traduções simples para PT-BR ↔ EN-US
export type Language = 'pt' | 'en'

export interface Translation {
  // Navigation
  nav: {
    home: string
    restaurant: string
    cafe: string
    hotel: string
    gallery: string
    blog: string
    contact: string
  }
  
  // Header actions
  header: {
    login: string
    logout: string
    adminPanel: string
    reserve: string
    makeReservation: string
    toggleTheme: string
    changeLanguage: string
    currentLanguage: string
    switchToEnglish: string
    switchToPortuguese: string
  }

  // Home page
  home: {
    hero: {
      title: string
      subtitle: string
      description: string
      discoverMenu: string
      makeReservation: string
    }
    history: {
      title: string
      description: string
      since: string
      tradition: string
    }
    experience: {
      title: string
      restaurant: {
        title: string
        description: string
      }
      cafe: {
        title: string
        description: string
      }
      hotel: {
        title: string
        description: string
      }
    }
    cta: {
      title: string
      description: string
      visitUs: string
      contact: string
    }
  }

  // Cafe page
  cafe: {
    title: string
    subtitle: string
    description: string
    hours: {
      title: string
      weekdays: string
      weekends: string
      closed: string
    }
    menu: {
      title: string
      beverages: string
      food: string
      desserts: string
      viewFullMenu: string
    }
    atmosphere: {
      title: string
      description: string
    }
  }


  // Menu page
  menu: {
    title: string
    subtitle: string
    badge: string
    description: string
    downloadPdf: string
    downloading: string
    searchPlaceholder: string
    loading: string
    featured: string
    categories: {
      all: string
      starters: string
      mains: string
      sandwiches: string
      salads: string
      sides: string
      desserts: string
      beverages: string
      beers: string
      drinks: string
      wines: string
      sparklings: string
      spirits: string
      specials: string
    }
    noResults: {
      title: string
      message: string
    }
    success: {
      loaded: string
      example: string
    }
    errors: {
      loadError: string
    }
    download: string
    price: string
    available: string
    unavailable: string
  }

  // Blog page
  blog: {
    title: string
    subtitle: string
    featuredPosts: string
    allPosts: string
    readMore: string
    author: string
    publishedOn: string
    categories: string
    tags: string
    searchPlaceholder: string
    noPostsFound: string
    backToBlog: string
    badge: string
    heroTitle: string
    heroSubtitle: string
    heroDescription: string
    noPostsMessage: string
    searchPosts: string
    loadMore: string
    readTime: string
    emptyState: {
      title: string
      message: string
    }
    stats: {
      articles: string
      yearsOfHistory: string
      founded: string
    }
    featured: {
      title: string
      description: string
      readFullArticle: string
      readTime: string
    }
    allArticles: {
      title: string
      description: string
    }
    newsletter: {
      title: string
      description: string
      placeholder: string
      button: string
      disclaimer: string
    }
  }
  
  // Contact page
  contact: {
    badge: string
    title: string
    titleHighlight: string
    description: string
    cta: string
    info: {
      location: {
        title: string
        address: string
        neighborhood: string
        zipcode: string
      }
      phone: {
        title: string
        number: string
      }
      email: {
        title: string
        address: string
      }
      hours: {
        title: string
        weekdays: string
        sunday: string
      }
    }
    social: {
      title: string
      instagram: {
        name: string
        followers: string
      }
      pousada: {
        name: string
        followers: string
      }
      tip: {
        title: string
        description: string
      }
    }
    form: {
      title: string
      name: string
      namePlaceholder: string
      phone: string
      phonePlaceholder: string
      email: string
      emailPlaceholder: string
      message: string
      messagePlaceholder: string
      sendButton: string
      sending: string
      success: string
      error: string
      sendError: string
      serviceUnavailable: string
      networkError: string
      unexpectedError: string
      emailSubject: string
      quickReservations: {
        title: string
        description: string
        callNow: string
      }
    }
    map: {
      title: string
      fallbackAlt: string
      overlay: {
        title: string
        description: string
        viewOnMaps: string
      }
    }
  }

  // Common
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    edit: string
    delete: string
    close: string
    back: string
    next: string
    previous: string
    search: string
    filter: string
    clear: string
    apply: string
    reset: string
    submit: string
    update: string
    create: string
    view: string
    more: string
    less: string
    readMore: string
    showMore: string
    showLess: string
    openMenu: string
  }
  

  // Gallery
  gallery: {
    title: string
    subtitle: string
    quote: string
    search: {
      placeholder: string
    }
    categories: {
      all: string
      landscape: string
      transport: string
      architecture: string
      historical: string
      oldRio: string
      contemporary: string
      neighborhood: string
    }
    artwork: {
      featured: string
      by: string
      noResults: {
        title: string
        message: string
      }
      actions: {
        addToCart: string
        inCart: string
        close: string
      }
      details: {
        description: string
        historicalContext: string
      }
    }
  }

  // Pousada (Hotel)
  pousada: {
    hero: {
      title: string
      subtitle: string
      reserveNow: string
      viewLocation: string
    }
    history: {
      title: string
      description1: string
      description2: string
      description3: string
      yearBadge: string
      heritageBadge: string
    }
    location: {
      title: string
      subtitle: string
      address: {
        title: string
        street: string
        neighborhood: string
      }
      nearby: {
        title: string
        selaron: string
        lapa: string
        airport: string
      }
      mapPlaceholder: {
        title: string
        subtitle: string
      }
    }
    rooms: {
      title: string
      subtitle: string
      filters: {
        all: string
        standard: string
        deluxe: string
        suite: string
      }
      loading: string
      availability: {
        available: string
        occupied: string
      }
      details: {
        guests: string
        amenities: string
        moreAmenities: string
      }
      pricing: {
        flexible: string
        nonRefundable: string
      }
      actions: {
        reserve: string
        unavailable: string
      }
    }
    amenities: {
      title: string
      wifi: {
        title: string
        description: string
      }
      tv: {
        title: string
        description: string
      }
      safe: {
        title: string
        description: string
      }
      minibar: {
        title: string
        description: string
      }
    }
    checkin: {
      title: string
      checkinTitle: string
      checkinTime: string
      checkinNote: string
      checkoutTitle: string
      checkoutTime: string
      checkoutNote: string
      cta: {
        title: string
        description: string
        button: string
      }
    }
  }
  
  // Footer
  footer: {
    since1854: string
    rightsReserved: string
    ourLocation: string
    contact: string
    address: string
    phone: string
    email: string
    socialMedia: string
    followUs: string
    newsletter: {
      title: string
      description: string
      placeholder: string
      button: string
    }
    navigation: string
    utilityLinks: string
    downloadMenu: string
    whatsapp: string
    hours: {
      title: string
      monday: string
      tuesdayFriday: string
      weekends: string
      closed: string
    }
    specialNote: {
      title: string
      description: string
    }
    ourNumbers: string
    years: string
    founded: string
    rating: string
    dishes: string
    quickContact: string
    secureWebsite: string
    madeWithLove: string
    historicHeritage: string
    companyDescription: string
    privacyPolicy: string
    termsOfService: string
  }
  
  // Auth
  auth: {
    signIn: string
    signUp: string
    signOut: string
    email: string
    password: string
    confirmPassword: string
    forgotPassword: string
    resetPassword: string
    createAccount: string
    alreadyHaveAccount: string
    dontHaveAccount: string
    enterEmail: string
    enterPassword: string
    invalidEmail: string
    passwordTooShort: string
    passwordsDontMatch: string
    signInError: string
    signUpError: string
    checkEmail: string
    passwordResetSent: string
  }
}

export const translations: Record<Language, Translation> = {
  pt: {
    nav: {
      home: 'Início',
      restaurant: 'Restaurante', 
      cafe: 'Café',
      hotel: 'Pousada',
      gallery: 'Galeria',
      blog: 'Blog',
      contact: 'Contato'
    },
    
    header: {
      login: 'Entrar',
      logout: 'Sair da conta',
      adminPanel: 'Painel Admin',
      reserve: 'Reservar',
      makeReservation: 'Fazer Reserva',
      toggleTheme: 'Alternar tema',
      changeLanguage: 'Mudar idioma',
      currentLanguage: 'Idioma atual',
      switchToEnglish: 'Alterar para English',
      switchToPortuguese: 'Alterar para Português'
    },

    home: {
      hero: {
        title: 'Bem-vindos ao Armazém São Joaquim',
        subtitle: 'Tradição e autenticidade no coração de Santa Teresa',
        description: 'Desde 1854 preservando a tradição gastronômica de Santa Teresa. Desfrute de pratos únicos em um ambiente histórico no coração do Rio de Janeiro.',
        discoverMenu: 'Conheça nosso cardápio',
        makeReservation: 'Fazer reserva',
        sectionAriaLabel: 'Seção principal do Armazém São Joaquim',
        slideInfo: 'Slide {{current}} de {{total}}',
        keyboardNavigation: 'Use as setas do teclado para navegar entre os slides',
        spacebarControl: 'Pressione espaço para pausar/continuar a apresentação automática',
        previousSlide: 'Slide anterior',
        nextSlide: 'Próximo slide'
      },
      history: {
        title: 'Nossa História',
        description: 'Há mais de 150 anos, o Armazém São Joaquim é um patrimônio cultural de Santa Teresa, oferecendo uma experiência gastronômica única em um ambiente repleto de história e charme.',
        since: 'Desde',
        tradition: 'Anos de tradição',
        alt1: 'História do Armazém São Joaquim desde 1854',
        title1: 'Nossa História Centenária',
        description1: '170 anos preservando tradições gastronômicas',
        alt2: 'Desenho histórico do bairro de Santa Teresa',
        title2: 'Santa Teresa Histórica',
        description2: 'O charme colonial que preservamos',
        alt3: 'Início da jornada do Armazém São Joaquim',
        title3: 'Início da Jornada',
        description3: 'De onde começou nossa tradição'
      },
      about: {
        badge: 'NOSSA ESSÊNCIA',
        title: {
          part1: 'Uma Casa com',
          part2: 'Memória'
        },
        description: 'Desde 1854, o Armazém São Joaquim é mais que um restaurante — é um guardião das tradições gastronômicas de Santa Teresa, onde cada prato conta uma história e cada visita é uma viagem no tempo.',
        motto: '"En esta casa tenemos memoria"',
        story: {
          paragraph1: 'Esta frase, gravada em nossa entrada, resume nossa essência. Somos guardiões de 170 anos de história, onde cada receita é um testemunho do tempo e cada ingrediente carrega a sabedoria de gerações passadas.',
          paragraph2: 'Localizado no coração boêmio de Santa Teresa, nosso armazém preserva não apenas sabores autênticos, mas também as histórias e tradições que fazem deste bairro um patrimônio cultural único do Rio de Janeiro.'
        },
        stats: {
          yearsSuffix: ' anos',
          historyLabel: 'de História',
          clientsLabel: 'Clientes Satisfeitos/mês',
          ratingLabel: 'Avaliação Média',
          generationsSuffix: ' gerações',
          traditionLabel: 'de Tradição Familiar'
        },
        features: {
          location: {
            title: 'Localização Privilegiada',
            description: 'No coração histórico de Santa Teresa, com vista para a cidade maravilhosa.',
            highlight: 'Vista Única'
          },
          heritage: {
            title: 'Patrimônio Histórico',
            description: 'Edificação preservada de 1854, mantendo a autenticidade colonial.',
            highlight: 'Desde 1854'
          },
          tradition: {
            title: 'Tradição Familiar',
            description: 'Receitas e técnicas passadas através de gerações de chefs apaixonados.',
            highlight: '5 Gerações'
          },
          experience: {
            title: 'Experiência Autêntica',
            description: 'Combinamos história, gastronomia e hospitalidade em cada detalhe.',
            highlight: 'Experiência Única'
          }
        },
        cta: {
          title: 'Venha Fazer Parte da Nossa História',
          description: 'Reserve sua mesa e experimente sabores que atravessaram 170 anos, em um ambiente onde cada detalhe conta nossa rica história.',
          button: 'Fazer Reserva'
        },
        imageNav: 'Ver imagem {{number}}'
      },
      menuPreview: {
        badge: 'GASTRONOMIA ESPECIAL',
        title: 'Sabores que Contam',
        titleHighlight: 'Nossa História',
        description: 'Uma experiência gastronômica que combina tradição familiar e inovação contemporânea',
        fullMenu: 'Cardápio Completo',
        specialties: {
          drinks: 'Drinks Premiados',
          coffees: 'Cafés Especiais', 
          wines: 'Vinhos Selecionados',
          sharing: 'Pratos para Compartilhar'
        },
        categories: {
          appetizers: {
            title: 'Aperitivos Especiais',
            description: 'Entradas que despertam os sentidos com sabores únicos',
            items: {
              patatas: {
                name: 'Patatas Bravas Armazém',
                description: 'Batatas douradas com aioli de páprica levemente picante'
              },
              croqueta: {
                name: 'Croqueta de Costela 12h',
                description: 'Costela bovina cozida lentamente, temperada e frita'
              },
              ceviche: {
                name: 'Ceviche Carioca',
                description: 'Tilápia marinada no limão com leite de coco, cebola roxa, pimenta dedo de moça, milho peruano, chips de batata'
              }
            }
          },
          mains: {
            title: 'Pratos Principais',
            description: 'Gastronomia brasileira com técnicas contemporâneas',
            items: {
              ancho: {
                name: 'Bife Ancho',
                description: 'Corte argentino com legumes grelhados e batatas bravas.'
              },
              tuna: {
                name: 'Atum em Crosta',
                description: 'Selado com risotto de limão'
              },
              octopus: {
                name: 'Polvo Grelhado Mediterrâneo',
                description: 'Com batatas confitadas'
              }
            }
          },
          feijoada: {
            title: 'Feijoada Tradicional',
            description: 'A autêntica feijoada brasileira do Armazém',
            items: {
              individual: {
                name: 'Feijoada Individual',
                description: 'Porção individual completa'
              },
              couple: {
                name: 'Feijoada para Dois',
                description: 'Ideal para compartilhar'
              },
              buffet: {
                name: 'Buffet de Feijoada',
                description: 'Buffet livre aos sábados'
              }
            }
          }
        },
        cta: {
          experience: 'Experiência Gastronômica Completa',
          title: 'Pronto para uma',
          titleHighlight: 'experiência única',
          description: 'Reserve sua mesa e desfrute da autenticidade culinária de Santa Teresa em um ambiente histórico incomparável',
          reserveNow: 'Reservar Mesa Agora',
          viewFullMenu: 'Ver Cardápio Completo'
        },
        products: {
          title: 'Produtos Especiais',
          description: 'Desfrute de nossos produtos artesanais selecionados especialmente para você',
          alt: 'Produtos artesanais e especiais à venda no Armazém São Joaquim'
        }
      },
      blogPreview: {
        badge: 'NOSSO BLOG',
        title: 'Histórias de',
        titleHighlight: 'Santa Teresa',
        description: 'Mergulhe nas histórias, tradições e cultura que fazem de Santa Teresa um dos bairros mais especiais do Rio de Janeiro.',
        neighborhood: {
          title: 'Descobrindo Santa Teresa',
          description: 'Compartilhamos as histórias e curiosidades do bairro mais boêmio do Rio de Janeiro, preservando a memória e tradições locais.',
          images: {
            panoramic: {
              title: 'Santa Teresa Vista Aérea',
              description: 'O charme colonial visto do alto',
              alt: 'Vista panorâmica de Santa Teresa'
            },
            tram: {
              title: 'Bondinho Histórico',
              description: 'Símbolo do transporte tradicional',
              alt: 'Bondinho histórico de Santa Teresa'
            }
          }
        },
        stats: {
          articles: 'Artigos Publicados',
          photos: 'Fotos Históricas'
        },
        posts: {
          featured: 'DESTAQUE',
          readMore: 'Ler Mais',
          read: 'Ler',
          readMoreAria: 'Ler mais sobre'
        },
        cta: {
          title: 'Explore Mais de Santa Teresa',
          description: 'Descubra todas as histórias, curiosidades e segredos do bairro mais charmoso do Rio de Janeiro.',
          button: 'Ver Todos os Artigos'
        },
        imageNav: 'Ver imagem'
      },
      experience: {
        title: 'Experiência Completa',
        restaurant: {
          title: 'Restaurante',
          description: 'Culinária tradicional brasileira com toques contemporâneos em um ambiente histórico e acolhedor.'
        },
        cafe: {
          title: 'Café',
          description: 'Cafés especiais, doces artesanais e um ambiente perfeito para momentos de contemplação.'
        },
        hotel: {
          title: 'Pousada',
          description: 'Hospedagem charmosa no coração de Santa Teresa com todo conforto e autenticidade.'
        }
      },
      cta: {
        title: 'Venha nos visitar',
        description: 'Experimente o melhor da gastronomia carioca em um dos lugares mais charmosos do Rio de Janeiro.',
        visitUs: 'Visite-nos',
        contact: 'Entre em contato'
      }
    },

    cafe: {
      title: 'Café do Armazém',
      subtitle: 'O melhor café de Santa Teresa',
      description: 'Desfrute de cafés especiais, doces artesanais e um ambiente acolhedor com vista para as montanhas.',
      cta: {
        viewMenu: 'Ver Cardápio',
        directions: 'Como Chegar'
      },
      partnership: {
        title: 'Parceria Sorvete Itália',
        description1: 'Orgulhosamente em parceria com a tradicional Sorvete Itália, trazemos para Santa Teresa os sabores artesanais que conquistaram gerações de cariocas.',
        description2: 'Fundada em 1931, a Sorvete Itália mantém sua receita original, produzindo sorvetes e picolés com ingredientes selecionados e técnicas tradicionais italiana.',
        description3: 'No Café do Armazém, você encontra os sabores clássicos como limão siciliano, chocolate belga e pistache, além de criações exclusivas desenvolvidas especialmente para nosso espaço.',
        label: 'Parceiro Oficial',
        name: 'Sorvete Itália'
      },
      menu: {
        title: 'Nosso Cardápio',
        description: 'Uma seleção especial de cafés artesanais, doces caseiros e os melhores sorvetes da tradicional Sorvete Itália',
        loading: 'Carregando produtos...',
        addToCart: 'Adicionar',
        unavailable: 'Indisponível',
        filters: {
          all: 'Todos'
        },
        categories: {
          coffee: 'Cafés',
          icecream: 'Sorvetes',
          sweets: 'Doces',
          savory: 'Salgados',
          drinks: 'Bebidas'
        }
      },
      hours: {
        title: 'Horário de funcionamento',
        weekdays: 'Segunda a sexta: 8h às 18h',
        weekend: 'Sábado: 8h às 19h',
        sunday: 'Domingo: 9h às 17h',
        closed: 'Fechado'
      },
      atmosphere: {
        title: 'Ambiente Ideal Para',
        description: 'Um espaço aconchegante onde a tradição se encontra com o conforto moderno.',
        workRemote: 'Trabalho Remoto',
        study: 'Estudos',
        meetings: 'Reuniões Casuais',
        relax: 'Relaxar'
      },
      location: {
        title: 'Nossa Localização',
        description: 'Bem no coração de Santa Teresa, próximo aos principais pontos turísticos e com fácil acesso',
        address: {
          title: 'Endereço'
        },
        mapTitle: 'Mapa Interativo',
        mapComingSoon: 'Em breve'
      },
      cart: {
        item: 'item',
        items: 'itens',
        finalizeOrder: 'Finalizar Pedido',
        reviewOrder: 'Revise seu pedido e preencha seus dados',
        yourItems: 'Seus itens',
        total: 'Total',
        yourData: 'Seus dados',
        confirmOrder: 'Confirmar Pedido',
        orderSuccess: 'Pedido realizado com sucesso!',
        orderError: 'Erro ao realizar pedido',
        form: {
          fullName: 'Nome completo',
          fullNamePlaceholder: 'Seu nome completo',
          phone: 'Telefone',
          email: 'E-mail',
          emailPlaceholder: 'seu@email.com',
          notes: 'Observações',
          notesPlaceholder: 'Alguma observação sobre seu pedido...'
        }
      }
    },

    pousada: {
      title: 'Pousada São Joaquim',
      subtitle: 'Hospedagem charmosa em Santa Teresa',
      description: 'Quartos confortáveis e aconchegantes no coração de Santa Teresa, com vista para as montanhas e proximidade aos principais pontos turísticos.',
      rooms: {
        title: 'Nossos quartos',
        standard: 'Quarto padrão',
        deluxe: 'Quarto deluxe',
        suite: 'Suíte',
        checkAvailability: 'Verificar disponibilidade'
      },
      amenities: {
        title: 'Comodidades',
        wifi: 'Wi-Fi gratuito',
        breakfast: 'Café da manhã incluído',
        parking: 'Estacionamento',
        airConditioning: 'Ar condicionado',
        minibar: 'Frigobar',
        balcony: 'Varanda com vista'
      },
      booking: {
        title: 'Faça sua reserva',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        guests: 'Hóspedes',
        book: 'Reservar'
      }
    },

    menu: {
      title: 'Nosso Cardápio',
      subtitle: 'Tradicional',
      badge: 'Cardápio Tradicional',
      description: 'Sabores autênticos que contam 170 anos de história gastronômica em Santa Teresa',
      downloadPdf: 'Baixar Cardápio PDF',
      downloading: 'Baixando...',
      searchPlaceholder: 'Buscar pratos, ingredientes...',
      loading: 'Carregando cardápio...',
      featured: 'Destaque',
      categories: {
        all: 'Todos',
        starters: 'Petiscos',
        mains: 'Pratos Principais',
        sandwiches: 'Sanduíches',
        salads: 'Saladas',
        sides: 'Guarnições',
        desserts: 'Sobremesas',
        beverages: 'Bebidas Sem Álcool',
        beers: 'Cervejas',
        drinks: 'Drinks',
        wines: 'Vinhos',
        sparklings: 'Espumantes',
        spirits: 'Destilados',
        specials: 'Especiais da casa'
      },
      noResults: {
        title: 'Nenhum item encontrado',
        message: 'Tente ajustar os filtros ou termo de busca'
      },
      success: {
        loaded: 'Menu carregado com sucesso',
        example: 'Exibindo cardápio de exemplo'
      },
      errors: {
        loadError: 'Erro ao carregar menu. Exibindo versão local.'
      },
      download: 'Baixar cardápio PDF',
      price: 'Preço',
      available: 'Disponível',
      unavailable: 'Indisponível'
    },

    blog: {
      title: 'Nosso Blog',
      subtitle: 'Histórias, receitas e novidades do Armazém',
      featuredPosts: 'Posts em destaque',
      allPosts: 'Todos os posts',
      readMore: 'Ler mais',
      author: 'Autor',
      publishedOn: 'Publicado em',
      categories: 'Categorias',
      tags: 'Tags',
      searchPlaceholder: 'Buscar artigos...',
      noPostsFound: 'Nenhum artigo encontrado',
      backToBlog: 'Voltar ao blog',
      badge: 'Blog Cultural',
      heroTitle: 'Histórias de Santa Teresa',
      heroSubtitle: 'Santa Teresa',
      heroDescription: 'Descubra 170 anos de tradição, cultura e sabores únicos no coração do bairro mais charmoso do Rio',
      noPostsMessage: 'Tente ajustar sua busca ou explore outros termos',
      searchPosts: 'Buscar artigos...',
      loadMore: 'Carregar Mais Artigos',
      readTime: 'min',
      emptyState: {
        title: 'Em Breve, Novas Histórias',
        message: 'Estamos preparando conteúdos especiais sobre nossa história e tradições. Volte em breve para descobrir mais sobre o Armazém São Joaquim!'
      },
      stats: {
        articles: 'Artigos',
        yearsOfHistory: 'Anos de História',
        founded: 'Fundação'
      },
      featured: {
        title: 'Artigo em Destaque',
        description: 'Mergulhe nas histórias que moldaram nossa tradição',
        readFullArticle: 'Ler artigo completo',
        readTime: 'min de leitura'
      },
      allArticles: {
        title: 'Todos os Artigos',
        description: 'Explore nossa coleção completa de histórias e tradições'
      },
      newsletter: {
        title: 'Não Perca Nossas Histórias',
        description: 'Receba as últimas novidades, receitas especiais e histórias exclusivas do Armazém São Joaquim',
        placeholder: 'Seu melhor e-mail',
        button: 'Inscrever-se',
        disclaimer: 'Prometemos não enviar spam. Apenas histórias deliciosas! 🍽️'
      }
    },

    contact: {
      badge: 'VAMOS CONVERSAR',
      title: 'Venha nos',
      titleHighlight: 'Visitar',
      description: 'Estamos no coração histórico de Santa Teresa, prontos para recebê-lo com a melhor hospitalidade carioca',
      cta: 'Entre em contato',
      info: {
        location: {
          title: 'Localização',
          address: 'Rua Almirante Alexandrino, 470',
          neighborhood: 'Santa Teresa, Rio de Janeiro - RJ',
          zipcode: 'CEP: 20241-262'
        },
        phone: {
          title: 'Telefone & WhatsApp',
          number: '+55 21 98565-8443'
        },
        email: {
          title: 'E-mail',
          address: 'armazemsaojoaquimoficial@gmail.com'
        },
        hours: {
          title: 'Horário',
          weekdays: 'Segunda a Sábado: 8:00 - 20:00',
          sunday: 'Domingo: Fechado'
        }
      },
      social: {
        title: 'Siga-nos & Reserve',
        instagram: {
          name: 'Instagram',
          followers: '2.5K+'
        },
        pousada: {
          name: 'Pousada',
          followers: 'Reservas'
        },
        tip: {
          title: 'Dica Especial',
          description: 'Acompanhe nossas redes para eventos especiais, novidades do cardápio e promoções exclusivas'
        }
      },
      form: {
        title: 'Envie uma Mensagem',
        name: 'Nome completo',
        namePlaceholder: 'Seu nome',
        phone: 'Telefone',
        phonePlaceholder: '(21) 99999-9999',
        email: 'E-mail',
        emailPlaceholder: 'seu@email.com',
        message: 'Mensagem',
        messagePlaceholder: 'Como podemos ajudá-lo? Conte-nos sobre sua dúvida, sugestão ou pedido especial...',
        sendButton: 'Enviar Mensagem',
        sending: 'Enviando...',
        success: 'Mensagem enviada com sucesso! Retornaremos em breve.',
        error: 'Erro ao enviar mensagem',
        sendError: 'Falha no envio da mensagem',
        serviceUnavailable: 'Serviço temporariamente indisponível',
        networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
        unexpectedError: 'Erro inesperado ao enviar mensagem. Tente novamente.',
        emailSubject: 'Nova mensagem de contato',
        quickReservations: {
          title: 'Reservas Rápidas',
          description: 'Para reservas urgentes, ligue diretamente ou use nosso WhatsApp',
          callNow: 'Ligar Agora'
        }
      },
      map: {
        title: 'Localização do Armazém São Joaquim',
        fallbackAlt: 'Localização do Armazém São Joaquim em Santa Teresa',
        overlay: {
          title: 'Nossa Localização',
          description: 'No coração histórico de Santa Teresa',
          viewOnMaps: 'Ver no Maps'
        }
      }
    },
    
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Salvar',
      edit: 'Editar',
      delete: 'Excluir',
      close: 'Fechar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      clear: 'Limpar',
      apply: 'Aplicar',
      reset: 'Resetar',
      submit: 'Enviar',
      update: 'Atualizar',
      create: 'Criar',
      view: 'Ver',
      more: 'Mais',
      less: 'Menos',
      readMore: 'Ler mais',
      showMore: 'Mostrar mais',
      showLess: 'Mostrar menos',
      openMenu: 'Abrir menu'
    },
    

    gallery: {
      title: 'Galeria de Arte',
      subtitle: 'Memórias de Santa Teresa em cada pincelada. Descubra a história do bairro boêmio através do olhar de artistas locais e contemporâneos.',
      quote: '"En esta casa tenemos memoria"',
      search: {
        placeholder: 'Buscar por título, artista ou descrição...'
      },
      categories: {
        all: 'Todas as Categorias',
        landscape: 'Paisagem',
        transport: 'Transporte',
        architecture: 'Arquitetura',
        historical: 'Santa Teresa Histórica',
        oldRio: 'Rio Antigo',
        contemporary: 'Arte Contemporânea',
        neighborhood: 'Retratos do Bairro'
      },
      artwork: {
        featured: 'Destaque',
        by: 'por',
        noResults: {
          title: 'Nenhum quadro encontrado',
          message: 'Tente ajustar os filtros ou termos de busca.'
        },
        actions: {
          addToCart: 'Adicionar ao Carrinho',
          inCart: 'No Carrinho',
          close: 'Fechar'
        },
        details: {
          description: 'Descrição',
          historicalContext: 'Contexto Histórico'
        }
      }
    },

    pousada: {
      hero: {
        title: 'Lobie Armazém São Joaquim',
        subtitle: 'Casarão histórico de 1854 • Tombado pela União • Santa Teresa',
        reserveNow: 'Reservar Agora',
        viewLocation: 'Ver Localização'
      },
      history: {
        title: 'História & Patrimônio',
        description1: 'O **Lobie Armazém São Joaquim** é um casarão histórico construído em **1854**, tombado pela União e totalmente reformado preservando sua arquitetura original.',
        description2: 'Por mais de **150 anos** funcionou como armazém, sendo um marco comercial no coração de Santa Teresa. Hoje, oferece hospitalidade com o charme do passado e o conforto moderno.',
        description3: 'O prédio amarelo com janelas e portas vermelhas é um ícone do **Largo dos Guimarães**, preservando a memória arquitetônica do Rio de Janeiro.',
        yearBadge: '1854',
        heritageBadge: 'Patrimônio Histórico'
      },
      location: {
        title: 'Localização Privilegiada',
        subtitle: 'No coração de Santa Teresa, próximo aos principais pontos turísticos do Rio de Janeiro',
        address: {
          title: 'Endereço',
          street: 'Rua Almirante Alexandrino, 470',
          neighborhood: 'Largo dos Guimarães, Santa Teresa'
        },
        nearby: {
          title: 'Proximidades:',
          selaron: 'Escadaria Selarón',
          lapa: 'Arcos da Lapa', 
          airport: 'Aeroporto Santos Dumont'
        },
        mapPlaceholder: {
          title: 'Mapa Interativo',
          subtitle: 'Em breve'
        }
      },
      rooms: {
        title: 'Nossas Acomodações',
        subtitle: '7 suítes modernas divididas em 3 categorias, todas com comodidades completas',
        filters: {
          all: 'Todos os Quartos',
          standard: 'Standard',
          deluxe: 'Deluxe',
          suite: 'Suítes'
        },
        loading: 'Carregando quartos...',
        availability: {
          available: 'Disponível',
          occupied: 'Ocupado'
        },
        details: {
          guests: 'pessoas',
          amenities: 'Comodidades:',
          moreAmenities: 'mais'
        },
        pricing: {
          flexible: 'Tarifa Flexível:',
          nonRefundable: 'Tarifa Não-Reembolsável:'
        },
        actions: {
          reserve: 'Reservar Quarto',
          unavailable: 'Indisponível'
        }
      },
      amenities: {
        title: 'Comodidades & Serviços',
        wifi: {
          title: 'WiFi Gratuita',
          description: 'Internet de alta velocidade em todos os quartos'
        },
        tv: {
          title: 'TV a Cabo',
          description: 'Canais nacionais e internacionais'
        },
        safe: {
          title: 'Cofre Digital',
          description: 'Segurança para seus pertences'
        },
        minibar: {
          title: 'Frigobar',
          description: 'Bebidas e snacks disponíveis'
        }
      },
      checkin: {
        title: 'Informações Importantes',
        checkinTitle: 'Check-in',
        checkinTime: '15:00h',
        checkinNote: 'Recepção disponível até 22:00h',
        checkoutTitle: 'Check-out',
        checkoutTime: '11:00h', 
        checkoutNote: 'Extensão disponível mediante consulta',
        cta: {
          title: 'Pronto para sua estadia?',
          description: 'Reserve agora e viva a experiência única de se hospedar em um patrimônio histórico no coração de Santa Teresa.',
          button: 'Fazer Reserva'
        }
      }
    },
    
    footer: {
      since1854: 'Desde 1854',
      rightsReserved: 'Todos os direitos reservados',
      ourLocation: 'Nossa Localização',
      contact: 'Contato',
      address: 'Endereço',
      phone: 'Telefone',
      email: 'E-mail',
      socialMedia: 'Redes Sociais',
      followUs: 'Siga-nos',
      newsletter: {
        title: 'Não Perca Nossas Histórias',
        description: 'Receba as últimas novidades, receitas especiais, eventos exclusivos e histórias fascinantes do nosso patrimônio de 170 anos',
        placeholder: 'Digite seu melhor e-mail',
        button: 'Inscrever-se'
      },
      navigation: 'Navegação',
      utilityLinks: 'Links Úteis',
      downloadMenu: 'Baixar Cardápio PDF',
      whatsapp: 'WhatsApp',
      hours: {
        title: 'Funcionamento',
        monday: 'Segunda-feira',
        tuesdayFriday: 'Terça a Sexta',
        weekends: 'Sábado e Domingo',
        closed: 'Fechado'
      },
      specialNote: {
        title: 'Nota:',
        description: 'Recomendamos fazer reserva para garantir sua mesa, especialmente nos finais de semana e feriados.'
      },
      ourNumbers: 'Nossos Números',
      years: 'Anos',
      founded: 'Fundação',
      rating: 'Avaliação',
      dishes: 'Pratos',
      quickContact: 'Contato Rápido',
      secureWebsite: 'Site Seguro',
      madeWithLove: 'Feito com ❤️',
      historicHeritage: 'Patrimônio histórico preservado desde 1854 • Santa Teresa - RJ',
      companyDescription: 'O Armazém São Joaquim é mais do que um restaurante - é um pedaço vivo da história do Rio de Janeiro. Localizado no charmoso bairro de Santa Teresa, oferecemos uma experiência gastronômica única que combina tradição, sabor e memórias afetivas em cada prato servido.',
      privacyPolicy: 'Política de Privacidade',
      termsOfService: 'Termos de Serviço'
    },
    
    auth: {
      signIn: 'Entrar',
      signUp: 'Cadastrar',
      signOut: 'Sair',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      forgotPassword: 'Esqueci minha senha',
      resetPassword: 'Redefinir Senha',
      createAccount: 'Criar Conta',
      alreadyHaveAccount: 'Já possui uma conta?',
      dontHaveAccount: 'Não possui uma conta?',
      enterEmail: 'Digite seu e-mail',
      enterPassword: 'Digite sua senha',
      invalidEmail: 'E-mail inválido',
      passwordTooShort: 'Senha muito curta',
      passwordsDontMatch: 'Senhas não coincidem',
      signInError: 'Erro ao fazer login',
      signUpError: 'Erro ao criar conta',
      checkEmail: 'Verifique seu e-mail',
      passwordResetSent: 'E-mail de redefinição enviado'
    }
  },
  
  en: {
    nav: {
      home: 'Home',
      restaurant: 'Restaurant',
      cafe: 'Café',
      hotel: 'Hotel',
      gallery: 'Gallery',
      blog: 'Blog',
      contact: 'Contact'
    },
    
    header: {
      login: 'Sign In',
      logout: 'Sign Out',
      adminPanel: 'Admin Panel',
      reserve: 'Reserve',
      makeReservation: 'Make Reservation',
      toggleTheme: 'Toggle theme',
      changeLanguage: 'Change language',
      currentLanguage: 'Current language',
      switchToEnglish: 'Switch to English',
      switchToPortuguese: 'Switch to Portuguese'
    },

    home: {
      hero: {
        title: 'Welcome to Armazém São Joaquim',
        subtitle: 'Tradition and authenticity in the heart of Santa Teresa',
        description: 'Since 1854 preserving the gastronomic tradition of Santa Teresa. Enjoy unique dishes in a historic environment in the heart of Rio de Janeiro.',
        discoverMenu: 'Discover our menu',
        makeReservation: 'Make reservation',
        sectionAriaLabel: 'Main section of Armazém São Joaquim',
        slideInfo: 'Slide {{current}} of {{total}}',
        keyboardNavigation: 'Use keyboard arrows to navigate between slides',
        spacebarControl: 'Press spacebar to pause/resume automatic presentation',
        previousSlide: 'Previous slide',
        nextSlide: 'Next slide'
      },
      history: {
        title: 'Our History',
        description: 'For over 150 years, Armazém São Joaquim has been a cultural heritage of Santa Teresa, offering a unique gastronomic experience in an environment full of history and charm.',
        since: 'Since',
        tradition: 'Years of tradition',
        alt1: 'History of Armazém São Joaquim since 1854',
        title1: 'Our Centennial History',
        description1: '170 years preserving gastronomic traditions',
        alt2: 'Historic drawing of Santa Teresa neighborhood',
        title2: 'Historic Santa Teresa',
        description2: 'The colonial charm we preserve',
        alt3: 'Beginning of Armazém São Joaquim journey',
        title3: 'Beginning of the Journey',
        description3: 'Where our tradition started'
      },
      about: {
        badge: 'OUR ESSENCE',
        title: {
          part1: 'A House with',
          part2: 'Memory'
        },
        description: 'Since 1854, Armazém São Joaquim is more than a restaurant — it\'s a guardian of Santa Teresa\'s gastronomic traditions, where each dish tells a story and each visit is a journey through time.',
        motto: '"En esta casa tenemos memoria"',
        story: {
          paragraph1: 'This phrase, engraved at our entrance, summarizes our essence. We are guardians of 170 years of history, where each recipe is a testimony of time and each ingredient carries the wisdom of past generations.',
          paragraph2: 'Located in the bohemian heart of Santa Teresa, our warehouse preserves not only authentic flavors, but also the stories and traditions that make this neighborhood a unique cultural heritage of Rio de Janeiro.'
        },
        stats: {
          yearsSuffix: ' years',
          historyLabel: 'of History',
          clientsLabel: 'Satisfied Customers/month',
          ratingLabel: 'Average Rating',
          generationsSuffix: ' generations',
          traditionLabel: 'of Family Tradition'
        },
        features: {
          location: {
            title: 'Privileged Location',
            description: 'In the historic heart of Santa Teresa, with views of the wonderful city.',
            highlight: 'Unique View'
          },
          heritage: {
            title: 'Historic Heritage',
            description: 'Preserved building from 1854, maintaining colonial authenticity.',
            highlight: 'Since 1854'
          },
          tradition: {
            title: 'Family Tradition',
            description: 'Recipes and techniques passed down through generations of passionate chefs.',
            highlight: '5 Generations'
          },
          experience: {
            title: 'Authentic Experience',
            description: 'We combine history, gastronomy and hospitality in every detail.',
            highlight: 'Unique Experience'
          }
        },
        cta: {
          title: 'Come Be Part of Our History',
          description: 'Reserve your table and experience flavors that have crossed 170 years, in an environment where every detail tells our rich history.',
          button: 'Make Reservation'
        },
        imageNav: 'View image {{number}}'
      },
      menuPreview: {
        badge: 'SPECIAL GASTRONOMY',
        title: 'Flavors that Tell',
        titleHighlight: 'Our Story',
        description: 'A gastronomic experience that combines family tradition and contemporary innovation',
        fullMenu: 'Full Menu',
        specialties: {
          drinks: 'Award-winning Drinks',
          coffees: 'Specialty Coffees',
          wines: 'Selected Wines',
          sharing: 'Sharing Dishes'
        },
        categories: {
          appetizers: {
            title: 'Special Appetizers',
            description: 'Starters that awaken the senses with unique flavors',
            items: {
              patatas: {
                name: 'Armazém Patatas Bravas',
                description: 'Golden potatoes with slightly spicy paprika aioli'
              },
              croqueta: {
                name: '12h Rib Croquette',
                description: 'Slow-cooked beef ribs, seasoned and fried'
              },
              ceviche: {
                name: 'Carioca Ceviche',
                description: 'Tilapia marinated in lime with coconut milk, red onion, finger pepper, Peruvian corn, potato chips'
              }
            }
          },
          mains: {
            title: 'Main Courses',
            description: 'Brazilian gastronomy with contemporary techniques',
            items: {
              ancho: {
                name: 'Ancho Steak',
                description: 'Argentine cut with grilled vegetables and bravas potatoes.'
              },
              tuna: {
                name: 'Crusted Tuna',
                description: 'Seared with lemon risotto'
              },
              octopus: {
                name: 'Mediterranean Grilled Octopus',
                description: 'With confit potatoes'
              }
            }
          },
          feijoada: {
            title: 'Traditional Feijoada',
            description: 'The authentic Brazilian feijoada from Armazém',
            items: {
              individual: {
                name: 'Individual Feijoada',
                description: 'Complete individual portion'
              },
              couple: {
                name: 'Feijoada for Two',
                description: 'Perfect for sharing'
              },
              buffet: {
                name: 'Feijoada Buffet',
                description: 'All-you-can-eat buffet on Saturdays'
              }
            }
          }
        },
        cta: {
          experience: 'Complete Gastronomic Experience',
          title: 'Ready for a',
          titleHighlight: 'unique experience',
          description: 'Reserve your table and enjoy the culinary authenticity of Santa Teresa in an incomparable historic environment',
          reserveNow: 'Reserve Table Now',
          viewFullMenu: 'View Full Menu'
        },
        products: {
          title: 'Special Products',
          description: 'Enjoy our artisanal products specially selected for you',
          alt: 'Artisanal and special products for sale at Armazém São Joaquim'
        }
      },
      blogPreview: {
        badge: 'OUR BLOG',
        title: 'Stories of',
        titleHighlight: 'Santa Teresa',
        description: 'Dive into the stories, traditions and culture that make Santa Teresa one of the most special neighborhoods in Rio de Janeiro.',
        neighborhood: {
          title: 'Discovering Santa Teresa',
          description: 'We share the stories and curiosities of Rio de Janeiro\'s most bohemian neighborhood, preserving local memory and traditions.',
          images: {
            panoramic: {
              title: 'Santa Teresa Aerial View',
              description: 'Colonial charm seen from above',
              alt: 'Panoramic view of Santa Teresa'
            },
            tram: {
              title: 'Historic Tram',
              description: 'Symbol of traditional transportation',
              alt: 'Historic tram of Santa Teresa'
            }
          }
        },
        stats: {
          articles: 'Published Articles',
          photos: 'Historic Photos'
        },
        posts: {
          featured: 'FEATURED',
          readMore: 'Read More',
          read: 'Read',
          readMoreAria: 'Read more about'
        },
        cta: {
          title: 'Explore More of Santa Teresa',
          description: 'Discover all the stories, curiosities and secrets of Rio de Janeiro\'s most charming neighborhood.',
          button: 'View All Articles'
        },
        imageNav: 'View image'
      },
      experience: {
        title: 'Complete Experience',
        restaurant: {
          title: 'Restaurant',
          description: 'Traditional Brazilian cuisine with contemporary touches in a historic and cozy environment.'
        },
        cafe: {
          title: 'Café',
          description: 'Specialty coffees, artisanal desserts, and a perfect environment for moments of contemplation.'
        },
        hotel: {
          title: 'Hotel',
          description: 'Charming accommodation in the heart of Santa Teresa with all comfort and authenticity.'
        }
      },
      cta: {
        title: 'Come visit us',
        description: 'Experience the best of Rio cuisine in one of the most charming places in Rio de Janeiro.',
        visitUs: 'Visit us',
        contact: 'Get in touch'
      }
    },

    cafe: {
      title: 'Armazém Café',
      subtitle: 'The best coffee in Santa Teresa',
      description: 'Enjoy specialty coffees, artisanal desserts, and a cozy atmosphere with mountain views.',
      cta: {
        viewMenu: 'View Menu',
        directions: 'Get Directions'
      },
      partnership: {
        title: 'Sorvete Itália Partnership',
        description1: 'Proudly partnered with the traditional Sorvete Itália, we bring to Santa Teresa the artisanal flavors that have conquered generations of Rio locals.',
        description2: 'Founded in 1931, Sorvete Itália maintains its original recipe, producing ice cream and popsicles with selected ingredients and traditional Italian techniques.',
        description3: 'At Café do Armazém, you will find classic flavors like Sicilian lemon, Belgian chocolate and pistachio, as well as exclusive creations developed especially for our space.',
        label: 'Official Partner',
        name: 'Sorvete Itália'
      },
      menu: {
        title: 'Our Menu',
        description: 'A special selection of artisanal coffees, homemade sweets and the best ice cream from the traditional Sorvete Itália',
        loading: 'Loading products...',
        addToCart: 'Add to Cart',
        unavailable: 'Unavailable',
        filters: {
          all: 'All'
        },
        categories: {
          coffee: 'Coffees',
          icecream: 'Ice Cream',
          sweets: 'Sweets',
          savory: 'Savory',
          drinks: 'Drinks'
        }
      },
      hours: {
        title: 'Opening hours',
        weekdays: 'Monday to Friday: 8am to 6pm',
        weekend: 'Saturday: 8am to 7pm',
        sunday: 'Sunday: 9am to 5pm',
        closed: 'Closed'
      },
      atmosphere: {
        title: 'Perfect Environment For',
        description: 'A cozy space where tradition meets modern comfort.',
        workRemote: 'Remote Work',
        study: 'Studies',
        meetings: 'Casual Meetings',
        relax: 'Relax'
      },
      location: {
        title: 'Our Location',
        description: 'Right in the heart of Santa Teresa, close to major tourist attractions and with easy access',
        address: {
          title: 'Address'
        },
        mapTitle: 'Interactive Map',
        mapComingSoon: 'Coming Soon'
      },
      cart: {
        item: 'item',
        items: 'items',
        finalizeOrder: 'Finalize Order',
        reviewOrder: 'Review your order and fill in your details',
        yourItems: 'Your items',
        total: 'Total',
        yourData: 'Your data',
        confirmOrder: 'Confirm Order',
        orderSuccess: 'Order placed successfully!',
        orderError: 'Error placing order',
        form: {
          fullName: 'Full name',
          fullNamePlaceholder: 'Your full name',
          phone: 'Phone',
          email: 'Email',
          emailPlaceholder: 'your@email.com',
          notes: 'Notes',
          notesPlaceholder: 'Any notes about your order...'
        }
      }
    },

    pousada: {
      title: 'Pousada São Joaquim',
      subtitle: 'Charming accommodation in Santa Teresa',
      description: 'Comfortable and cozy rooms in the heart of Santa Teresa, with mountain views and proximity to major tourist attractions.',
      hero: {
        title: 'Lobie Armazém São Joaquim',
        subtitle: 'Historic mansion from 1854 • National Heritage • Santa Teresa',
        reserveNow: 'Book Now',
        viewLocation: 'View Location'
      },
      history: {
        title: 'History & Heritage',
        description1: 'The **Lobie Armazém São Joaquim** is a historic mansion built in **1854**, listed as National Heritage and completely renovated while preserving its original architecture.',
        description2: 'For more than **150 years** it operated as a warehouse, being a commercial landmark in the heart of Santa Teresa. Today, it offers hospitality with the charm of the past and modern comfort.',
        description3: 'The yellow building with red windows and doors is an icon of **Largo dos Guimarães**, preserving the architectural memory of Rio de Janeiro.',
        yearBadge: '1854',
        heritageBadge: 'Historic Heritage'
      },
      location: {
        title: 'Privileged Location',
        subtitle: 'In the heart of Santa Teresa, close to Rio de Janeiro\'s main tourist attractions',
        address: {
          title: 'Address',
          street: 'Rua Almirante Alexandrino, 470',
          neighborhood: 'Largo dos Guimarães, Santa Teresa'
        },
        nearby: {
          title: 'Nearby:',
          selaron: 'Selarón Steps',
          lapa: 'Lapa Arches', 
          airport: 'Santos Dumont Airport'
        },
        mapPlaceholder: {
          title: 'Interactive Map',
          subtitle: 'Coming Soon'
        }
      },
      rooms: {
        title: 'Our Accommodations',
        subtitle: '7 modern suites divided into 3 categories, all with complete amenities',
        standard: 'Standard room',
        deluxe: 'Deluxe room',
        suite: 'Suite',
        checkAvailability: 'Check availability',
        filters: {
          all: 'All Rooms',
          standard: 'Standard',
          deluxe: 'Deluxe',
          suite: 'Suites'
        },
        loading: 'Loading rooms...',
        availability: {
          available: 'Available',
          occupied: 'Occupied'
        },
        details: {
          guests: 'guests',
          amenities: 'Amenities:',
          moreAmenities: 'more'
        },
        pricing: {
          flexible: 'Flexible Rate:',
          nonRefundable: 'Non-Refundable Rate:'
        },
        actions: {
          reserve: 'Reserve Room',
          unavailable: 'Unavailable'
        }
      },
      amenities: {
        title: 'Amenities & Services',
        wifi: {
          title: 'Free WiFi',
          description: 'High-speed internet in all rooms'
        },
        tv: {
          title: 'Cable TV',
          description: 'National and international channels'
        },
        safe: {
          title: 'Digital Safe',
          description: 'Security for your belongings'
        },
        minibar: {
          title: 'Minibar',
          description: 'Drinks and snacks available'
        },
        breakfast: 'Breakfast included',
        parking: 'Parking',
        airConditioning: 'Air conditioning',
        balcony: 'Balcony with view'
      },
      checkin: {
        title: 'Important Information',
        checkinTitle: 'Check-in',
        checkinTime: '3:00 PM',
        checkinNote: 'Reception available until 10:00 PM',
        checkoutTitle: 'Check-out',
        checkoutTime: '11:00 AM', 
        checkoutNote: 'Extension available upon consultation',
        cta: {
          title: 'Ready for your stay?',
          description: 'Book now and live the unique experience of staying in a historic heritage in the heart of Santa Teresa.',
          button: 'Make Reservation'
        }
      },
      booking: {
        title: 'Make your reservation',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        guests: 'Guests',
        book: 'Book'
      }
    },

    menu: {
      title: 'Our Menu',
      subtitle: 'Traditional',
      badge: 'Traditional Menu',
      description: 'Authentic flavors that tell 170 years of gastronomic history in Santa Teresa',
      downloadPdf: 'Download PDF Menu',
      downloading: 'Downloading...',
      searchPlaceholder: 'Search dishes, ingredients...',
      loading: 'Loading menu...',
      featured: 'Featured',
      categories: {
        all: 'All',
        starters: 'Appetizers',
        mains: 'Main Courses',
        sandwiches: 'Sandwiches',
        salads: 'Salads',
        sides: 'Sides',
        desserts: 'Desserts',
        beverages: 'Non-Alcoholic Beverages',
        beers: 'Beers',
        drinks: 'Cocktails',
        wines: 'Wines',
        sparklings: 'Sparkling Wines',
        spirits: 'Spirits',
        specials: 'House specials'
      },
      noResults: {
        title: 'No items found',
        message: 'Try adjusting filters or search terms'
      },
      success: {
        loaded: 'Menu loaded successfully',
        example: 'Displaying sample menu'
      },
      errors: {
        loadError: 'Error loading menu. Showing local version.'
      },
      download: 'Download PDF menu',
      price: 'Price',
      available: 'Available',
      unavailable: 'Unavailable'
    },

    blog: {
      title: 'Our Blog',
      subtitle: 'Stories, recipes and news from Armazém',
      featuredPosts: 'Featured posts',
      allPosts: 'All posts',
      readMore: 'Read more',
      author: 'Author',
      publishedOn: 'Published on',
      categories: 'Categories',
      tags: 'Tags',
      searchPlaceholder: 'Search articles...',
      noPostsFound: 'No articles found',
      backToBlog: 'Back to blog',
      badge: 'Cultural Blog',
      heroTitle: 'Stories of Santa Teresa',
      heroSubtitle: 'Santa Teresa',
      heroDescription: 'Discover 170 years of tradition, culture and unique flavors in the heart of Rio\'s most charming neighborhood',
      noPostsMessage: 'Try adjusting your search or explore other terms',
      searchPosts: 'Search articles...',
      loadMore: 'Load More Articles',
      readTime: 'min',
      emptyState: {
        title: 'Coming Soon, New Stories',
        message: 'We are preparing special content about our history and traditions. Come back soon to discover more about Armazém São Joaquim!'
      },
      stats: {
        articles: 'Articles',
        yearsOfHistory: 'Years of History',
        founded: 'Founded'
      },
      featured: {
        title: 'Featured Article',
        description: 'Dive into the stories that shaped our tradition',
        readFullArticle: 'Read full article',
        readTime: 'min read'
      },
      allArticles: {
        title: 'All Articles',
        description: 'Explore our complete collection of stories and traditions'
      },
      newsletter: {
        title: 'Don\'t Miss Our Stories',
        description: 'Receive the latest news, special recipes and exclusive stories from Armazém São Joaquim',
        placeholder: 'Your best email',
        button: 'Subscribe',
        disclaimer: 'We promise not to send spam. Just delicious stories! 🍽️'
      }
    },
    
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      apply: 'Apply',
      reset: 'Reset',
      submit: 'Submit',
      update: 'Update',
      create: 'Create',
      view: 'View',
      more: 'More',
      less: 'Less',
      readMore: 'Read more',
      showMore: 'Show more',
      showLess: 'Show less',
      openMenu: 'Open menu'
    },
    

    gallery: {
      title: 'Art Gallery',
      subtitle: 'Santa Teresa memories in every brushstroke. Discover the bohemian neighborhood\'s history through the eyes of local and contemporary artists.',
      quote: '"En esta casa tenemos memoria"',
      search: {
        placeholder: 'Search by title, artist or description...'
      },
      categories: {
        all: 'All Categories',
        landscape: 'Landscape',
        transport: 'Transport',
        architecture: 'Architecture',
        historical: 'Historic Santa Teresa',
        oldRio: 'Old Rio',
        contemporary: 'Contemporary Art',
        neighborhood: 'Neighborhood Portraits'
      },
      artwork: {
        featured: 'Featured',
        by: 'by',
        noResults: {
          title: 'No artwork found',
          message: 'Try adjusting filters or search terms.'
        },
        actions: {
          addToCart: 'Add to Cart',
          inCart: 'In Cart',
          close: 'Close'
        },
        details: {
          description: 'Description',
          historicalContext: 'Historical Context'
        }
      }
    },

    contact: {
      badge: "LET'S TALK",
      title: 'Come',
      titleHighlight: 'Visit Us',
      description: 'We are in the historic heart of Santa Teresa, ready to welcome you with the best Rio hospitality',
      cta: 'Contact us',
      info: {
        location: {
          title: 'Location',
          address: 'Rua Almirante Alexandrino, 470',
          neighborhood: 'Santa Teresa, Rio de Janeiro - RJ',
          zipcode: 'ZIP: 20241-262'
        },
        phone: {
          title: 'Phone & WhatsApp',
          number: '+55 21 98565-8443'
        },
        email: {
          title: 'Email',
          address: 'armazemsaojoaquimoficial@gmail.com'
        },
        hours: {
          title: 'Hours',
          weekdays: 'Monday to Saturday: 8:00 AM - 8:00 PM',
          sunday: 'Sunday: Closed'
        }
      },
      social: {
        title: 'Follow Us & Book',
        instagram: {
          name: 'Instagram',
          followers: '2.5K+'
        },
        pousada: {
          name: 'Hotel',
          followers: 'Bookings'
        },
        tip: {
          title: 'Special Tip',
          description: 'Follow our social media for special events, menu updates and exclusive promotions'
        }
      },
      form: {
        title: 'Send a Message',
        name: 'Full name',
        namePlaceholder: 'Your name',
        phone: 'Phone',
        phonePlaceholder: '(21) 99999-9999',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        message: 'Message',
        messagePlaceholder: 'How can we help you? Tell us about your question, suggestion or special request...',
        sendButton: 'Send Message',
        sending: 'Sending...',
        success: 'Message sent successfully! We will get back to you soon.',
        error: 'Error sending message',
        sendError: 'Failed to send message',
        serviceUnavailable: 'Service temporarily unavailable',
        networkError: 'Connection error. Check your internet and try again.',
        unexpectedError: 'Unexpected error sending message. Please try again.',
        emailSubject: 'New contact message',
        quickReservations: {
          title: 'Quick Reservations',
          description: 'For urgent reservations, call directly or use our WhatsApp',
          callNow: 'Call Now'
        }
      },
      map: {
        title: 'Armazém São Joaquim Location',
        fallbackAlt: 'Armazém São Joaquim location in Santa Teresa',
        overlay: {
          title: 'Our Location',
          description: 'In the historic heart of Santa Teresa',
          viewOnMaps: 'View on Maps'
        }
      }
    },
    
    footer: {
      since1854: 'Since 1854',
      rightsReserved: 'All rights reserved',
      ourLocation: 'Our Location',
      contact: 'Contact',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      socialMedia: 'Social Media',
      followUs: 'Follow Us',
      newsletter: {
        title: "Don't Miss Our Stories",
        description: 'Receive the latest news, special recipes, exclusive events and fascinating stories from our 170-year heritage',
        placeholder: 'Enter your best email',
        button: 'Subscribe'
      },
      navigation: 'Navigation',
      utilityLinks: 'Useful Links',
      downloadMenu: 'Download PDF Menu',
      whatsapp: 'WhatsApp',
      hours: {
        title: 'Opening Hours',
        monday: 'Monday',
        tuesdayFriday: 'Tuesday to Friday',
        weekends: 'Saturday and Sunday',
        closed: 'Closed'
      },
      specialNote: {
        title: 'Note:',
        description: 'We recommend making a reservation to guarantee your table, especially on weekends and holidays.'
      },
      ourNumbers: 'Our Numbers',
      years: 'Years',
      founded: 'Founded',
      rating: 'Rating',
      dishes: 'Dishes',
      quickContact: 'Quick Contact',
      secureWebsite: 'Secure Website',
      madeWithLove: 'Made with ❤️',
      historicHeritage: 'Historic heritage preserved since 1854 • Santa Teresa - RJ',
      companyDescription: 'Armazém São Joaquim is more than a restaurant - it is a living piece of Rio de Janeiro\'s history. Located in the charming neighborhood of Santa Teresa, we offer a unique gastronomic experience that combines tradition, flavor and affective memories in every dish served.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service'
    },
    
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      invalidEmail: 'Invalid email',
      passwordTooShort: 'Password too short',
      passwordsDontMatch: "Passwords don't match",
      signInError: 'Sign in error',
      signUpError: 'Sign up error',
      checkEmail: 'Check your email',
      passwordResetSent: 'Password reset email sent'
    }
  }
}

// Helper function to get translation
export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[language]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

// Helper function to detect language from URL
export function detectLanguageFromUrl(pathname: string): Language {
  console.log('🔍 Detecting locale from:', pathname)
  
  if (pathname.startsWith('/en')) {
    console.log('  → Detected: EN')
    return 'en'
  }
  if (pathname.startsWith('/pt')) {
    console.log('  → Detected: PT')
    return 'pt'
  }
  
  console.log('  → Default: PT')
  return 'pt' // Default to Portuguese
}

// Helper function to get language from localStorage
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'pt'
  
  const stored = localStorage.getItem('armazem-language')
  return (stored === 'en' || stored === 'pt') ? stored : 'pt'
}

// Helper function to store language
export function storeLanguage(language: Language): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('armazem-language', language)
}