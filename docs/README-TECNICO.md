# 📚 Documentação Técnica - Armazém São Joaquim

## 🏗️ Arquitetura do Sistema

### Visão Geral
O Armazém São Joaquim é uma aplicação web moderna construída com Next.js 14, utilizando o App Router e React Server Components. A aplicação serve como plataforma digital para um restaurante histórico em Santa Teresa, Rio de Janeiro.

### Stack Tecnológica

#### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **Shadcn/ui** - Componentes de interface
- **Radix UI** - Primitivos de interface acessíveis

#### Backend
- **Next.js API Routes** - Endpoints de API
- **Supabase** - Backend-as-a-Service (PostgreSQL)
- **Resend** - Serviço de email transacional
- **Netlify** - Hospedagem e deploy

#### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Jest** - Testes unitários
- **Playwright** - Testes end-to-end

## 📁 Estrutura do Projeto

```
armazem-saojoaquim/
├── app/                          # App Router (Next.js 14)
│   ├── api/                      # API Routes
│   │   ├── analytics/            # Métricas e analytics
│   │   ├── cardapio-pdf/         # Geração de PDF do cardápio
│   │   ├── check-availability/   # Verificação de disponibilidade
│   │   ├── errors/               # Tratamento de erros
│   │   ├── health/               # Health checks
│   │   ├── reservas/             # Sistema de reservas
│   │   └── send-email/           # Envio de emails
│   ├── auth/                     # Autenticação
│   ├── blog/                     # Sistema de blog
│   ├── menu/                     # Cardápio
│   ├── reservas/                 # Interface de reservas
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página inicial
│   └── error.tsx                 # Página de erro
├── components/                   # Componentes React
│   ├── atoms/                    # Componentes básicos
│   ├── molecules/                # Componentes compostos
│   ├── sections/                 # Seções de página
│   ├── layout/                   # Componentes de layout
│   ├── providers/                # Context providers
│   └── ui/                       # Componentes de interface
├── lib/                          # Utilitários e configurações
│   ├── hooks/                    # Custom hooks
│   ├── api.ts                    # Cliente de API
│   ├── supabase.ts               # Configuração Supabase
│   ├── utils.ts                  # Funções utilitárias
│   └── config.ts                 # Configurações
├── public/                       # Arquivos estáticos
│   ├── images/                   # Imagens
│   └── icons/                    # Ícones e favicons
├── scripts/                      # Scripts de automação
├── types/                        # Definições de tipos TypeScript
├── docs/                         # Documentação
├── next.config.js                # Configuração Next.js
├── tailwind.config.js            # Configuração Tailwind
├── netlify.toml                  # Configuração Netlify
└── package.json                  # Dependências e scripts
```

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Supabase
- Conta Resend (para emails)
- Conta Netlify (para deploy)

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/armazem-saojoaquim.git
cd armazem-saojoaquim
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NODE_ENV=development
```

4. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
```
http://localhost:3000
```

## 🗄️ Banco de Dados

### Schema Supabase

#### Tabela: profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

#### Tabela: reservas
```sql
CREATE TABLE reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_reserva DATE NOT NULL,
  horario TIME NOT NULL,
  numero_pessoas INTEGER NOT NULL,
  observacoes TEXT,
  status TEXT DEFAULT 'pendente',
  valor_estimado DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: menu_items
```sql
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  imagem_url TEXT,
  disponivel BOOLEAN DEFAULT true,
  ingredientes TEXT[],
  alergenos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela: blog_posts
```sql
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Políticas RLS (Row Level Security)

```sql
-- Profiles: usuários podem ver e editar apenas seu próprio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Reservas: usuários podem ver apenas suas próprias reservas
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations" ON reservas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations" ON reservas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Menu: público para leitura
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu items are viewable by everyone" ON menu_items
  FOR SELECT USING (true);

-- Blog: posts publicados são públicos
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (published = true);
```

## 🔌 APIs

### Endpoints Principais

#### Health Check
```
GET /api/health
```
Retorna status da aplicação e dependências.

#### Reservas
```
GET /api/reservas          # Listar reservas do usuário
POST /api/reservas         # Criar nova reserva
PUT /api/reservas          # Atualizar reserva
DELETE /api/reservas       # Cancelar reserva
```

#### Disponibilidade
```
POST /api/check-availability
Body: { date: "2024-01-15", time: "19:00", people: 4 }
```

#### Cardápio PDF
```
GET /api/cardapio-pdf
```
Gera e retorna PDF do cardápio atual.

#### Analytics
```
POST /api/analytics
Body: { event: "page_view", page: "/menu", data: {...} }
```

#### Email
```
POST /api/send-email
Body: { 
  to: "user@example.com",
  subject: "Confirmação de Reserva",
  template: "reservation_confirmation",
  data: {...}
}
```

### Tratamento de Erros

Todas as APIs seguem um padrão consistente de resposta:

```typescript
// Sucesso
{
  success: true,
  data: any,
  message?: string
}

// Erro
{
  success: false,
  error: string,
  code?: string,
  details?: any
}
```

## 🎨 Sistema de Design

### Cores Principais
```css
:root {
  --primary: #d97706;      /* Amber-600 */
  --primary-dark: #92400e; /* Amber-700 */
  --secondary: #374151;    /* Gray-700 */
  --accent: #f59e0b;       /* Amber-500 */
  --background: #fafafa;   /* Gray-50 */
  --surface: #ffffff;      /* White */
  --text: #111827;         /* Gray-900 */
  --text-muted: #6b7280;   /* Gray-500 */
}
```

### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Fonte Secundária**: System fonts fallback
- **Escala**: Tailwind CSS typography scale

### Componentes

#### Atomic Design
- **Atoms**: Button, Input, Label, Badge
- **Molecules**: Card, Modal, Navigation
- **Organisms**: Header, Footer, Forms
- **Templates**: Layout components
- **Pages**: Complete page implementations

#### Exemplo de Componente
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors'
  const variantClasses = {
    primary: 'bg-amber-600 text-white hover:bg-amber-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-amber-600 text-amber-600 hover:bg-amber-50'
  }
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait'
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

## 🔒 Segurança

### Autenticação
- **Supabase Auth** para gerenciamento de usuários
- **JWT tokens** para sessões
- **Row Level Security (RLS)** no banco de dados

### Autorização
- **Role-based access control (RBAC)**
- **Políticas RLS** para controle granular
- **Middleware** para proteção de rotas

### Proteções Implementadas
- **CSRF Protection** via SameSite cookies
- **XSS Protection** via Content Security Policy
- **SQL Injection** prevenção via Supabase
- **Rate Limiting** em APIs críticas
- **Input Validation** com Zod schemas

### Headers de Segurança
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  }
]
```

## 📊 Monitoramento e Analytics

### Métricas Coletadas
- **Performance**: Core Web Vitals, tempo de carregamento
- **Usuário**: Pageviews, sessões, conversões
- **Negócio**: Reservas, cancelamentos, receita
- **Sistema**: Erros, uptime, latência de API

### Ferramentas
- **Vercel Analytics** para métricas de performance
- **Custom Analytics** para métricas de negócio
- **Sentry** para monitoramento de erros (opcional)
- **Uptime monitoring** via Netlify

### Dashboard de Monitoramento
```typescript
// lib/monitoring.ts
export class MonitoringService {
  trackEvent(event: string, properties?: Record<string, any>) {
    // Implementação de tracking
  }

  trackError(error: Error, context?: Record<string, any>) {
    // Implementação de error tracking
  }

  trackPerformance(metric: string, value: number) {
    // Implementação de performance tracking
  }
}
```

## 🚀 Deploy e CI/CD

### Netlify Deploy
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### Scripts de Build
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit",
    "build:production": "node scripts/build-production.js"
  }
}
```

### Processo de Deploy
1. **Commit** para branch main
2. **Netlify** detecta mudanças
3. **Build** automático executado
4. **Testes** executados
5. **Deploy** para produção
6. **Health checks** pós-deploy

## 🧪 Testes

### Estrutura de Testes
```
tests/
├── unit/                 # Testes unitários
│   ├── components/       # Testes de componentes
│   ├── lib/             # Testes de utilitários
│   └── api/             # Testes de API
├── integration/         # Testes de integração
├── e2e/                # Testes end-to-end
└── fixtures/           # Dados de teste
```

### Configuração Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Exemplo de Teste
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## 📈 Performance

### Otimizações Implementadas
- **Server-Side Rendering (SSR)** para SEO
- **Static Site Generation (SSG)** para páginas estáticas
- **Image Optimization** com Next.js Image
- **Code Splitting** automático
- **Bundle Analysis** com @next/bundle-analyzer
- **Caching** em múltiplas camadas

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Estratégias de Cache
```typescript
// lib/cache.ts
export const cacheConfig = {
  static: '1y',           // Arquivos estáticos
  api: '5m',             // Respostas de API
  pages: '1h',           // Páginas renderizadas
  images: '30d',         // Imagens otimizadas
}
```

## 🔧 Manutenção

### Backup e Recuperação
```bash
# Criar backup completo
node scripts/backup-system.js create

# Restaurar backup
node scripts/backup-system.js restore backup_name

# Listar backups
node scripts/backup-system.js list
```

### Logs e Debugging
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta)
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta)
  }
}
```

### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkExternalServices(),
    checkFileSystem()
  ])

  const status = checks.every(check => 
    check.status === 'fulfilled'
  ) ? 'healthy' : 'unhealthy'

  return Response.json({ status, checks })
}
```

## 📚 Recursos Adicionais

### Documentação de APIs
- **Swagger/OpenAPI** em `/api/docs`
- **Postman Collection** disponível
- **Exemplos de uso** em `/docs/api-examples`

### Guias de Desenvolvimento
- **Contribuição**: `/docs/CONTRIBUTING.md`
- **Estilo de Código**: `/docs/CODE_STYLE.md`
- **Troubleshooting**: `/docs/TROUBLESHOOTING.md`

### Links Úteis
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

---

## 🤝 Suporte

Para dúvidas técnicas ou problemas:
1. Consulte a documentação
2. Verifique issues existentes no GitHub
3. Crie uma nova issue com detalhes
4. Entre em contato com a equipe de desenvolvimento

**Última atualização**: Janeiro 2024
**Versão da documentação**: 1.0.0 