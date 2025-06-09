// Configurações centralizadas do projeto Armazém São Joaquim

// Função segura para acessar variáveis de ambiente
const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side: usar apenas NEXT_PUBLIC_ vars ou fallbacks
    switch (key) {
      case 'NODE_ENV':
        return process.env.NODE_ENV || 'production'
      case 'NEXT_PUBLIC_SITE_URL':
        return process.env.NEXT_PUBLIC_SITE_URL || 'https://armazemsaojoaquim.netlify.app'
      case 'NEXT_PUBLIC_SUPABASE_URL':
        return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
        return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      case 'NEXT_PUBLIC_GA_ID':
        return process.env.NEXT_PUBLIC_GA_ID || ''
      default:
        return defaultValue || ''
    }
  }
  // Server-side: acesso normal
  return process.env[key] || defaultValue || ''
}

// Constantes de ambiente
export const ENV = {
  NODE_ENV: getEnvVar('NODE_ENV', 'production'),
  SITE_URL: getEnvVar('NEXT_PUBLIC_SITE_URL', 'https://armazemsaojoaquim.netlify.app'),
  SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  GA_ID: getEnvVar('NEXT_PUBLIC_GA_ID'),
  IS_PRODUCTION: getEnvVar('NODE_ENV') === 'production',
  IS_DEVELOPMENT: getEnvVar('NODE_ENV') === 'development',
}

export const config = {
  // ============================
  // INFORMAÇÕES BÁSICAS
  // ============================
  restaurant: {
    name: 'Armazém São Joaquim',
    tagline: '"En esta casa tenemos memoria"',
    description: 'Restaurante histórico em Santa Teresa com 170 anos de história',
    foundedYear: 1854,
    address: {
      street: 'Rua Almirante Alexandrino, 470',
      neighborhood: 'Santa Teresa',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20241-330',
      full: 'Rua Almirante Alexandrino, 470, Santa Teresa, Rio de Janeiro - RJ'
    },
    contact: {
      phone: '+55 21 98565-8443',
      email: 'armazemjoaquimoficial@gmail.com',
      whatsapp: '+5521985658443'
    },
    social: {
      instagram: 'https://www.instagram.com/armazemsaojoaquim/',
      facebook: 'https://facebook.com/armazemsaojoaquim',
      reservations: 'https://vivapp.bukly.com/d/hotel_view/5041'
    }
  },

  // ============================
  // HORÁRIOS DE FUNCIONAMENTO
  // ============================
  hours: {
    monday: { open: '12:00', close: '00:00', closed: false },
    tuesday: { open: '12:00', close: '00:00', closed: false },
    wednesday: { open: '12:00', close: '00:00', closed: false },
    thursday: { open: '12:00', close: '00:00', closed: false },
    friday: { open: '12:00', close: '00:00', closed: false },
    saturday: { open: '11:30', close: '00:00', closed: false },
    sunday: { open: '11:30', close: '22:00', closed: false },
  },

  // ============================
  // HAPPY HOURS
  // ============================
  happyHours: {
    monday: { start: '17:00', end: '20:00', active: true },
    tuesday: { start: '17:00', end: '20:00', active: true },
    wednesday: { start: '17:00', end: '20:00', active: true },
    thursday: { start: '17:00', end: '20:00', active: true },
    friday: { start: '19:00', end: '20:00', active: true },
    saturday: { start: null, end: null, active: false },
    sunday: { start: null, end: null, active: false },
  },

  // ============================
  // CAFÉ DA MANHÃ
  // ============================
  breakfast: {
    monday: { start: '08:00', end: '20:00', active: true },
    tuesday: { start: '08:00', end: '20:00', active: true },
    wednesday: { start: '08:00', end: '20:00', active: true },
    thursday: { start: '08:00', end: '20:00', active: true },
    friday: { start: '08:00', end: '20:00', active: true },
    saturday: { start: '08:00', end: '20:00', active: true },
    sunday: { start: '08:00', end: '20:00', active: true },
  },

  // ============================
  // CONFIGURAÇÕES DE RESERVA
  // ============================
  reservations: {
    maxPeoplePerReservation: 20,
    minPeoplePerReservation: 1,
    maxReservationsPerSlot: 10,
    advanceBookingDays: 30,
    availableTimeSlots: [
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
      '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
    ],
    breakfastSlots: [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30'
    ],
    defaultDuration: 120, // minutos
    cancellationWindow: 24 // horas
  },

  // ============================
  // CONFIGURAÇÕES DO MENU
  // ============================
  menu: {
    categories: [
      { name: 'Aperitivos', icon: 'Coffee', color: 'bg-vermelho-portas' },
      { name: 'Saladas', icon: 'Leaf', color: 'bg-verde-natura' },
      { name: 'Pratos Individuais', icon: 'Utensils', color: 'bg-amarelo-armazem' },
      { name: 'Guarnições', icon: 'Plus', color: 'bg-pedra-natural' },
      { name: 'Feijoada', icon: 'Bowl', color: 'bg-madeira-escura' },
      { name: 'Sanduíches', icon: 'Sandwich', color: 'bg-cinza-medio' },
      { name: 'Sobremesas', icon: 'Cake', color: 'bg-rosa-suave' }
    ],
    allergens: [
      'Glúten', 'Lactose', 'Ovos', 'Peixe', 'Crustáceos', 
      'Nozes', 'Amendoim', 'Soja', 'Gergelim', 'Sulfitos'
    ]
  },

  // ============================
  // CONFIGURAÇÕES DO SITE
  // ============================
  site: {
    name: 'Armazém São Joaquim',
    url: ENV.SITE_URL,
    title: 'Armazém São Joaquim - "En esta casa tenemos memoria"',
    description: 'Restaurante histórico em Santa Teresa, Rio de Janeiro. 170 anos de história, drinks excepcionais e gastronomia única no coração de Santa Teresa.',
    keywords: [
      'restaurante santa teresa',
      'bar rio de janeiro',
      'drinks artesanais',
      'pousada santa teresa',
      'armazém são joaquim',
      'história rio de janeiro',
      'bondinho santa teresa',
      'gastronomia carioca'
    ],
    author: 'Armazém São Joaquim',
    language: 'pt-BR',
    themeColor: '#F4D03F',
    googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
  },

  // ============================
  // CONFIGURAÇÕES DE IMAGEM
  // ============================
  images: {
    placeholder: '/images/placeholder.jpg',
    logo: '/images/logo.png',
    ogImage: '/og-image.jpg',
    heroImages: [
      '/images/armazem-fachada.jpg',
      '/images/armazem-interior.jpg',
      '/images/armazem-bar.jpg'
    ],
    defaultMenuImage: '/images/menu-default.jpg',
    defaultBlogImage: '/images/blog-default.jpg'
  },

  // ============================
  // CONFIGURAÇÕES DE VALIDAÇÃO
  // ============================
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\(\d{2}\)\s\d{5}-\d{4}$/,
    name: {
      minLength: 2,
      maxLength: 50
    },
    password: {
      minLength: 6,
      maxLength: 128
    },
    reservation: {
      observationsMaxLength: 500
    },
    blog: {
      titleMaxLength: 200,
      resumoMaxLength: 300,
      slugMaxLength: 100
    }
  },

  // ============================
  // CONFIGURAÇÕES DE PAGINAÇÃO
  // ============================
  pagination: {
    blogPostsPerPage: 9,
    menuItemsPerPage: 20,
    reservationsPerPage: 10,
    searchResultsPerPage: 15
  },

  // ============================
  // CONFIGURAÇÕES DE CACHE
  // ============================
  cache: {
    menuItems: 300, // 5 minutos
    blogPosts: 600, // 10 minutos
    staticPages: 3600, // 1 hora
    userReservations: 60, // 1 minuto
    revalidateInterval: 3600, // 1 hora
    imageCacheTTL: 31536000, // 1 ano
    staticCacheTTL: 86400, // 1 dia
  },

  // ============================
  // CONFIGURAÇÕES DE DESENVOLVIMENTO
  // ============================
  dev: {
    enableAnalytics: ENV.IS_PRODUCTION,
    enableDebugLogs: ENV.IS_DEVELOPMENT,
    mockData: ENV.IS_DEVELOPMENT && !ENV.SUPABASE_URL
  },

  // ============================
  // FEATURES FLAGS
  // ============================
  features: {
    newsletter: true,
    reservations: true,
    blog: true,
    menu: true,
    analytics: ENV.IS_PRODUCTION,
    seo: true,
    pwa: true,
    socialLogin: true,
    reviews: false, // Futuro
    delivery: false, // Futuro
    events: false, // Futuro
    enableAnalytics: ENV.IS_PRODUCTION,
    enableDebugLogs: ENV.IS_DEVELOPMENT,
    mockData: ENV.IS_DEVELOPMENT && !ENV.SUPABASE_URL
  },

  // ============================
  // CONSTANTES DE UI
  // ============================
  ui: {
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    toast: {
      duration: {
        success: 3000,
        error: 5000,
        warning: 4000,
        info: 3000
      }
    }
  },

  // ============================
  // CONFIGURAÇÕES DE API
  // ============================
  api: {
    timeout: 10000,
    retries: 3
  }
}

// ============================
// HELPERS
// ============================

export const getBusinessHours = (day: keyof typeof config.hours) => {
  return config.hours[day]
}

export const getHappyHours = (day: keyof typeof config.happyHours) => {
  return config.happyHours[day]
}

export const getBreakfastHours = (day: keyof typeof config.breakfast) => {
  return config.breakfast[day]
}

export const isBusinessOpen = () => {
  const now = new Date()
  const dayNames: (keyof typeof config.hours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday'
  ]
  const today = dayNames[now.getDay()]
  const todayHours = getBusinessHours(today)
  
  if (todayHours.closed) return false
  
  const currentTime = now.toTimeString().slice(0, 5)
  return currentTime >= todayHours.open! && currentTime <= todayHours.close!
}

export const isHappyHourActive = () => {
  const now = new Date()
  const dayNames: (keyof typeof config.happyHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday'
  ]
  const today = dayNames[now.getDay()]
  const todayHappyHour = getHappyHours(today)
  
  if (!todayHappyHour.active) return false
  
  const currentTime = now.toTimeString().slice(0, 5)
  return currentTime >= todayHappyHour.start! && currentTime <= todayHappyHour.end!
}

export const isBreakfastTime = () => {
  const now = new Date()
  const dayNames: (keyof typeof config.breakfast)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday'
  ]
  const today = dayNames[now.getDay()]
  const todayBreakfast = getBreakfastHours(today)
  
  if (!todayBreakfast.active) return false
  
  const currentTime = now.toTimeString().slice(0, 5)
  return currentTime >= todayBreakfast.start! && currentTime <= todayBreakfast.end!
}

export const getNextOpenTime = () => {
  const now = new Date()
  const dayNames: (keyof typeof config.hours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday'
  ]
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now)
    checkDate.setDate(now.getDate() + i)
    const dayName = dayNames[checkDate.getDay()]
    const dayHours = getBusinessHours(dayName)
    
    if (!dayHours.closed) {
      if (i === 0) {
        // Hoje
        const currentTime = now.toTimeString().slice(0, 5)
        if (currentTime < dayHours.open!) {
          return { date: checkDate, time: dayHours.open! }
        }
      } else {
        // Próximos dias
        return { date: checkDate, time: dayHours.open! }
      }
    }
  }
  
  return null
}

export const formatBusinessHours = (day: keyof typeof config.hours) => {
  const hours = getBusinessHours(day)
  if (hours.closed) return 'Fechado'
  return `${hours.open} às ${hours.close}`
}

export const formatHappyHours = (day: keyof typeof config.happyHours) => {
  const happyHour = getHappyHours(day)
  if (!happyHour.active) return 'Sem Happy Hour'
  return `${happyHour.start} às ${happyHour.end}`
}

export const formatBreakfastHours = (day: keyof typeof config.breakfast) => {
  const breakfast = getBreakfastHours(day)
  if (!breakfast.active) return 'Sem Café da Manhã'
  return `${breakfast.start} às ${breakfast.end}`
}

export default config 