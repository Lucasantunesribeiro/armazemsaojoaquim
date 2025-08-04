// Mock Supabase utilities para teste
export const getBlogPosts = async () => {
  return [
    {
      slug: 'historia-do-armazem-sao-joaquim',
      title: 'História do Armazém São Joaquim',
      excerpt: 'Conheça a história do nosso restaurante...',
      content: 'Conteúdo do blog...',
      created_at: new Date().toISOString(),
    },
    {
      slug: 'segredos-da-nossa-feijoada',
      title: 'Segredos da Nossa Feijoada',
      excerpt: 'Os segredos por trás da nossa famosa feijoada...',
      content: 'Conteúdo do blog...',
      created_at: new Date().toISOString(),
    },
    {
      slug: 'santa-teresa-bairro-historico',
      title: 'Santa Teresa: Bairro Histórico',
      excerpt: 'Descubra as maravilhas do bairro de Santa Teresa...',
      content: 'Conteúdo do blog...',
      created_at: new Date().toISOString(),
    },
  ]
}

export const getBlogPost = async (slug: string) => {
  const posts = await getBlogPosts()
  return posts.find(post => post.slug === slug) || null
}

export const getMenuItems = async () => {
  return [
    {
      id: 1,
      nome: 'Feijoada Completa',
      descricao: 'Feijoada tradicional com todos os acompanhamentos',
      preco: 45.00,
      categoria: 'Pratos Principais'
    },
    {
      id: 2,
      nome: 'Caipirinha',
      descricao: 'Caipirinha tradicional',
      preco: 15.00,
      categoria: 'Bebidas'
    }
  ]
}