# 🏪 Armazém São Joaquim - Experiência Digital

Bem-vindo ao site oficial do **Armazém São Joaquim**, um restaurante tradicional localizado no coração de Santa Teresa, Rio de Janeiro. Nossa plataforma digital oferece uma experiência completa para descobrir nossa culinária, fazer reservas e conhecer nossa história.

## 🌟 O Que Oferecemos

### 🍽️ **Cardápio Digital Interativo**
- **Visualização Completa**: Explore nosso menu com fotos profissionais de cada prato
- **Categorias Organizadas**: Petiscos, pratos principais, sanduíches, saladas, sobremesas e bebidas
- **Informações Detalhadas**: Preços, descrições, ingredientes e tempo de preparo
- **Filtros Inteligentes**: Busque por categoria, nome ou disponibilidade
- **Download em PDF**: Baixe nosso cardápio completo para consulta offline



### 🏠 **Pousada e Hospedagem**
- **Quartos Disponíveis**: Visualize quartos padrão, deluxe e suítes
- **Fotos dos Ambientes**: Conheça cada espaço antes de reservar
- **Comodidades Detalhadas**: WiFi, TV, ar condicionado, banheiro privativo
- **Localização Estratégica**: No coração de Santa Teresa, próximo aos principais pontos turísticos


### ☕ **Café e Doces**
- **Cardápio Especializado**: Cafés artesanais, doces caseiros e salgados frescos
- **Origem dos Produtos**: Conheça a procedência de nossos ingredientes
- **Informações Nutricionais**: Alergênicos e ingredientes detalhados
- **Pedidos Online**: Faça pedidos para retirada ou entrega
- **História dos Sabores**: Descubra as tradições por trás de cada receita

### 📖 **Blog e Histórias**
- **História do Restaurante**: Conheça nossa trajetória desde 1920
- **Receitas Tradicionais**: Compartilhamos segredos da culinária brasileira
- **Dicas Culinárias**: Aprenda técnicas e truques dos nossos chefs
- **Histórias de Santa Teresa**: Descubra o bairro através de nossos olhos
- **Conteúdo Atualizado**: Novos posts regularmente com histórias e receitas

## 🚀 **Stack Tecnológica**

### **Frontend & Framework**
- **Next.js 15.4.5** - Framework React com App Router
- **React 18.2.0** - Biblioteca de interface de usuário
- **TypeScript 5.3.3** - Tipagem estática para JavaScript
- **Tailwind CSS 3.3.6** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis (Dialog, Select, Tabs, etc.)
- **Shadcn/ui** - Sistema de componentes baseado em Radix UI
- **Lucide React** - Biblioteca de ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### **Backend & Database**
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **PostgreSQL** - Banco de dados relacional
- **Next.js API Routes** - Endpoints serverless
- **Supabase Auth** - Autenticação e autorização
- **Row Level Security (RLS)** - Segurança a nível de linha

### **Styling & UI/UX**
- **Tailwind CSS** - Framework CSS com design system customizado
- **CSS Variables** - Sistema de cores dinâmicas
- **Responsive Design** - Mobile-first com breakpoints customizados
- **Dark Mode** - Suporte a tema escuro
- **Animations** - Transições e micro-interações
- **Accessibility** - Componentes acessíveis (WCAG 2.1)

### **Performance & Optimization**
- **Next.js Image Optimization** - Otimização automática de imagens
- **Dynamic Imports** - Code splitting e lazy loading
- **Bundle Analysis** - Análise de bundle size
- **Edge Runtime** - Compatibilidade com Edge Functions
- **Caching** - Sistema de cache customizado
- **PWA** - Progressive Web App capabilities

### **Development & Tools**
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Jest** - Framework de testes
- **Playwright** - Testes end-to-end
- **TypeScript** - Verificação de tipos
- **Hot Reload** - Desenvolvimento com hot reload

### **Deployment & Infrastructure**
- **Netlify** - Plataforma de deploy e hosting
- **Netlify Functions** - Serverless functions
- **Edge Functions** - Funções na edge
- **CDN** - Content Delivery Network
- **SSL/HTTPS** - Certificados SSL automáticos

### **Email & Communication**
- **Resend** - Serviço de email transacional
- **EmailJS** - Envio de emails via cliente
- **SMTP** - Configuração de email customizada

### **Analytics & Monitoring**
- **Google Analytics** - Análise de tráfego
- **Performance Monitoring** - Monitoramento de performance
- **Error Tracking** - Rastreamento de erros
- **Audit Logging** - Log de auditoria

### **Internationalization**
- **Next.js i18n** - Internacionalização
- **Multi-language Support** - Suporte a PT-BR e EN
- **Locale Routing** - Roteamento por idioma

## 🏗️ **Arquitetura do Projeto**

### **Estrutura de Pastas**
```
├── app/                    # App Router do Next.js
│   ├── [locale]/          # Rotas internacionalizadas
│   │   ├── admin/         # Painel administrativo
│   │   ├── auth/          # Autenticação
│   │   ├── blog/          # Blog e artigos
│   │   ├── cafe/          # Página do café
│   │   ├── galeria/       # Galeria de fotos
│   │   ├── menu/          # Cardápio
│   │   ├── pousada/       # Informações da pousada
│   │   └── page.tsx       # Página inicial
│   └── api/               # API Routes
│       ├── admin/         # Endpoints administrativos
│       ├── auth/          # Autenticação
│       ├── blog/          # Gerenciamento do blog
│       ├── cafe/          # API do café
│       ├── gallery/       # Galeria de imagens
│       ├── menu/          # Cardápio
│       └── reservas/      # Sistema de reservas
├── components/            # Componentes React
│   ├── admin/            # Componentes administrativos
│   ├── atoms/            # Componentes atômicos
│   ├── molecules/        # Componentes moleculares
│   ├── sections/         # Seções da página
│   └── ui/               # Componentes de UI (Shadcn)
├── lib/                  # Utilitários e configurações
│   ├── auth/             # Lógica de autenticação
│   ├── supabase/         # Configuração do Supabase
│   └── utils.ts          # Funções utilitárias
├── hooks/                # Custom hooks
├── types/                # Definições TypeScript
├── contexts/             # React contexts
└── public/               # Arquivos estáticos
```

### **Padrões de Desenvolvimento**
- **Atomic Design** - Estrutura de componentes hierárquica
- **Server Components** - Componentes renderizados no servidor
- **Client Components** - Componentes interativos no cliente
- **Custom Hooks** - Lógica reutilizável encapsulada
- **Type Safety** - Tipagem completa com TypeScript
- **Error Boundaries** - Tratamento de erros robusto
- **Loading States** - Estados de carregamento otimizados

### **Segurança**
- **Row Level Security (RLS)** - Segurança a nível de banco
- **Middleware Protection** - Proteção de rotas administrativas
- **Input Validation** - Validação com Zod
- **CSRF Protection** - Proteção contra CSRF
- **XSS Prevention** - Prevenção de ataques XSS
- **Rate Limiting** - Limitação de taxa de requisições

## 🛠️ **Como Foi Desenvolvido**

### **Metodologia de Desenvolvimento**
- **Mobile-First Approach** - Desenvolvimento priorizando dispositivos móveis
- **Component-Driven Development** - Desenvolvimento baseado em componentes
- **Progressive Enhancement** - Melhoria progressiva da experiência
- **Performance-First** - Otimização de performance desde o início
- **Accessibility-First** - Acessibilidade como prioridade

### **Processo de Desenvolvimento**
1. **Análise de Requisitos** - Definição das funcionalidades e necessidades
2. **Design System** - Criação de sistema de design consistente
3. **Arquitetura** - Definição da estrutura e padrões do projeto
4. **Desenvolvimento Iterativo** - Implementação em sprints
5. **Testes Contínuos** - Testes automatizados e manuais
6. **Deploy Automatizado** - Deploy contínuo via Netlify

### **Decisões Técnicas**
- **Next.js App Router** - Escolhido para melhor performance e SEO
- **Supabase** - Backend completo com autenticação e banco de dados
- **Tailwind CSS** - Para desenvolvimento rápido e consistente
- **TypeScript** - Para maior segurança e manutenibilidade
- **Shadcn/ui** - Para componentes acessíveis e customizáveis

### **Otimizações Implementadas**
- **Code Splitting** - Carregamento otimizado de código
- **Image Optimization** - Otimização automática de imagens
- **Caching Strategy** - Estratégia de cache para melhor performance
- **Bundle Optimization** - Otimização do bundle para menor tamanho
- **SEO Optimization** - Otimização para mecanismos de busca

## 🎨 **Experiência do Usuário**

### ✨ **Design Responsivo**
- **Mobile-First**: Otimizado para smartphones e tablets
- **Desktop Perfeito**: Experiência completa em computadores
- **Navegação Intuitiva**: Interface clara e fácil de usar
- **Carregamento Rápido**: Performance otimizada para melhor experiência

### 🌓 **Modo Escuro/Claro**
- **Adaptação Automática**: Detecta preferência do seu dispositivo
- **Alternância Manual**: Mude entre temas conforme sua preferência
- **Conforto Visual**: Reduz fadiga visual em diferentes ambientes

### 🌍 **Suporte Multilíngue**
- **Português**: Idioma principal com expressões locais
- **Inglês**: Para turistas internacionais
- **Tradução Completa**: Todo o conteúdo disponível nos dois idiomas

## 📱 **Como Usar**

### **1. Navegação Principal**
- **Página Inicial**: Visão geral e destaques do restaurante
- **Cardápio**: Menu completo com todas as opções
- **Pousada**: Informações sobre hospedagem
- **Café**: Cardápio de cafés e doces
- **Blog**: Histórias e receitas
- **Contato**: Localização e informações de contato



### **2. Explorar o Cardápio**
1. Navegue pelas categorias
2. Use os filtros para encontrar pratos específicos
3. Clique nos pratos para ver detalhes
4. Visualize fotos e ingredientes
5. Baixe o PDF para consulta offline

## 📍 **Localização e Contato**

### **Endereço**
```
R. Alm. Alexandrino, 470
Santa Teresa, Rio de Janeiro - RJ
CEP: 20241-260
```

### **Horários de Funcionamento**
- **Restaurante**: Terça a Domingo, 12h às 23h
- **Café**: Segunda a Sexta, 12h às 00h | Sábado, 11h30 às 00h | Domingo, 11h30 às 22h
- **Pousada**: Check-in 14h, Check-out 12h


## 🚗 **Como Chegar**

### **Transporte Público**
- **Metrô**: Estação Carioca (Linha 1) - 15 min a pé
- **Ônibus**: Linhas que passam por Santa Teresa
- **VLT**: Estação Carioca - 12 min a pé
- **Bonde de Santa Teresa**: Parada próxima ao restaurante

### **Carro**
- **Estacionamento**: Disponível nas proximidades
- **GPS**: Use o endereço completo para navegação
- **Acesso**: Fácil acesso pela R. Alm. Alexandrino

## 💡 **Dicas para sua Visita**


### **Melhores Horários**
- **Almoço**: 12h às 14h (mais movimentado)
- **Jantar**: 19h às 21h (atmosfera mais romântica)
- **Café da manhã**: 8h às 10h (mais tranquilo)

### **O que Experimentar**
- **Petiscos**: Coxinhas, pastéis e bolinhos
- **Pratos principais**: Feijoada, moqueca e churrasco
- **Sobremesas**: Pudim de leite e brigadeiro
- **Bebidas**: Caipirinhas e cervejas artesanais

## 🌟 **Por que Escolher o Armazém São Joaquim?**

### **Tradição e Qualidade**
- **História**: Mais de 100 anos de tradição culinária
- **Receitas**: Passadas de geração em geração
- **Ingredientes**: Frescos e de qualidade superior
- **Chefs**: Experientes e apaixonados pela culinária

### **Ambiente Único**
- **Localização**: No coração histórico de Santa Teresa
- **Arquitetura**: Construção centenária preservada
- **Vista**: Panorâmica da cidade do Rio de Janeiro
- **Atmosfera**: Acolhedora e familiar

### **Experiência Completa**
- **Restaurante**: Culinária brasileira autêntica
- **Pousada**: Hospedagem confortável e acolhedora
- **Café**: Momentos especiais com doces e cafés
- **Eventos**: Casamentos, aniversários e celebrações

## 🔗 **Conecte-se Conosco**

- **Website**: [www.armazemsaojoaquim.com.br](https://www.armazemsaojoaquim.com.br)
- **Instagram**: [@armazemsaojoaquim](https://instagram.com/armazemsaojoaquim)
- **Facebook**: [Armazém São Joaquim](https://facebook.com/armazemsaojoaquim)

---

**Venha nos visitar e faça parte da nossa história!** 🍽️✨
