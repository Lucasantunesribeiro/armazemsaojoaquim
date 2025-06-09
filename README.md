# 🏛️ Armazém São Joaquim

**"En esta casa tenemos memoria"**

Site oficial do restaurante histórico Armazém São Joaquim, localizado no coração de Santa Teresa, Rio de Janeiro. Um projeto que celebra 170 anos de história, gastronomia e cultura carioca.

## 🌟 Sobre o Projeto

O Armazém São Joaquim é mais que um restaurante - é um patrimônio histórico que preserva a autenticidade de Santa Teresa desde 1854. Este site apresenta nossa história, cardápio, sistema de reservas e blog com memórias do bairro mais charmoso do Rio.

### ✨ Características Principais

- 🏛️ **Patrimônio Histórico**: Construção de 1854 preservada com autenticidade
- 🍽️ **Gastronomia Única**: Pratos tradicionais brasileiros com toque contemporâneo  
- 🍸 **Drinks Premiados**: Mixologia artesanal que celebra tradição e inovação
- 📱 **Sistema de Reservas**: Gestão completa de reservas online
- 📖 **Blog Cultural**: Histórias e memórias de Santa Teresa
- 🎨 **Design Responsivo**: Experiência otimizada para todos os dispositivos

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática para maior robustez
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **Framer Motion** - Animações fluidas e interativas
- **Lucide React** - Biblioteca de ícones moderna

### Backend & Database
- **Supabase** - Backend-as-a-Service com PostgreSQL
- **Supabase Auth** - Sistema completo de autenticação
- **Row Level Security (RLS)** - Segurança avançada de dados

### Validação & Formulários
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de esquemas TypeScript-first
- **React Hot Toast** - Notificações elegantes

### Deploy & Hosting
- **Netlify** - Deploy contínuo e hosting otimizado
- **Edge Functions** - Processamento serverless

## 🎨 Design System

### Paleta de Cores
```css
--amarelo-armazem: #F4D03F    /* Amarelo principal */
--vermelho-portas: #C0392B     /* Vermelho das portas históricas */
--pedra-natural: #85756E       /* Tons de pedra natural */
--madeira-escura: #3E2723      /* Madeira envelhecida */
--cinza-claro: #F8F9FA         /* Fundo neutro */
--cinza-medio: #6C757D         /* Texto secundário */
```

### Tipografia
- **Playfair Display** - Títulos e headings (serif elegante)
- **Inter** - Corpo do texto (sans-serif moderna)

## 📁 Estrutura do Projeto

```
armazem-sao-joaquim/
├── app/                          # App Router (Next.js 14)
│   ├── auth/                     # Autenticação
│   │   ├── callback/            # Callback OAuth
│   │   └── page.tsx             # Login/Registro
│   ├── blog/                    # Sistema de Blog
│   │   ├── [slug]/              # Posts individuais
│   │   └── page.tsx             # Lista de posts
│   ├── menu/                    # Cardápio
│   ├── reservas/                # Sistema de Reservas
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # Homepage
├── components/                  # Componentes React
│   ├── layout/                 # Componentes de layout
│   ├── providers/              # Context providers
│   ├── sections/               # Seções da homepage
│   └── ui/                     # Componentes UI reutilizáveis
├── lib/                        # Utilitários e configurações
│   ├── api.ts                  # Funções da API
│   ├── config.ts               # Configurações centralizadas
│   ├── supabase.ts             # Cliente Supabase
│   └── utils.ts                # Funções utilitárias
├── types/                      # Tipos TypeScript
│   └── database.types.ts       # Tipos do banco de dados
└── supabase/                   # Scripts SQL e configurações
    ├── 01_create_tables.sql    # Criação de tabelas
    ├── 02_create_indexes.sql   # Índices de performance
    ├── 03_enable_rls.sql       # Row Level Security
    └── 04_create_policies.sql  # Políticas de segurança
```

## 📱 Funcionalidades

### 🏠 Homepage
- Hero section com carousel de imagens
- Seção sobre a história do restaurante
- Preview do cardápio
- Preview do blog
- Formulário de contato

### 🔐 Sistema de Autenticação
- Login com email/senha
- Registro de novos usuários
- Login social (Google)
- Confirmação por email

### 🍽️ Cardápio Digital
- Categorias organizadas (Drinks, Entradas, Pratos, Sobremesas)
- Filtro por categoria e busca
- Informações de ingredientes e alérgenos
- Preços atualizados

### 📅 Sistema de Reservas
- Formulário de reserva intuitivo
- Validação de disponibilidade
- Gestão de reservas pessoais
- Confirmação por email

### 📖 Blog Cultural
- Posts sobre a história de Santa Teresa
- Sistema de busca
- Categories de conteúdo
- SEO otimizado

## 🛡️ Segurança

- **Row Level Security (RLS)** - Proteção de dados no nível da linha
- **Validação Client/Server** - Validação dupla com Zod
- **Sanitização de dados** - Prevenção contra XSS
- **HTTPS obrigatório** - Comunicação segura
- **Variáveis de ambiente** - Secrets protegidos

## 📊 Performance

- **Lighthouse Score**: 95+ em todas as métricas
- **Core Web Vitals**: Otimizado
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Carregamento otimizado
- **Caching**: Estratégias de cache inteligentes

## 🌐 SEO

- **Meta tags** dinâmicas
- **Schema.org** markup
- **Sitemap** automático
- **OpenGraph** tags
- **Twitter Cards**
- **JSON-LD** structured data

## 📞 Contato

**Armazém São Joaquim**
- 📍 Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ
- 📞 +55 21 98565-8443
- 📧 armazemjoaquimoficial@gmail.com
- 📷 [@armazemsaojoaquim](https://www.instagram.com/armazemsaojoaquim/)
- 🏨 [Reservas Pousada](https://vivapp.bukly.com/d/hotel_view/5041)
- 🌐 [armazemsaojoaquim.netlify.app](https://armazemsaojoaquim.netlify.app)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

*"En esta casa tenemos memoria" - 170 anos preservando a história de Santa Teresa* 🏛️ 