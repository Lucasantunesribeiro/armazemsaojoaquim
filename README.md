# 🏛️ Armazém São Joaquim

**"En esta casa tenemos memoria"**

Site oficial do restaurante histórico Armazém São Joaquim, localizado no coração de Santa Teresa, Rio de Janeiro. Um projeto que celebra 170 anos de história, gastronomia e cultura carioca.

## 🌟 Sobre o Projeto

O Armazém São Joaquim é mais que um restaurante - é um patrimônio histórico que preserva a autenticidade de Santa Teresa desde 1854. Este site apresenta nossa história, cardápio, sistema de reservas e blog com memórias do bairro mais charmoso do Rio.

### ✨ Características Principais

- 🏛️ **Patrimônio Histórico**: Construção de 1854 preservada com autenticidade
- 🍽️ **Gastronomia Única**: Pratos tradicionais brasileiros com toque contemporâneo  
- 🍸 **Drinks Premiados**: Mixologia artesanal que celebra tradição e inovação
- 📅 **Sistema de Reservas Inteligente**: Calendário com disponibilidade em tempo real
- 📧 **Notificações Automáticas**: Emails de confirmação e lembrete via Resend
- 📖 **Blog Cultural**: Histórias e memórias de Santa Teresa
- 🎨 **Design Responsivo**: Experiência otimizada para todos os dispositivos

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router e API Routes
- **TypeScript** - Tipagem estática para maior robustez
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **Framer Motion** - Animações fluidas e interativas
- **Lucide React** - Biblioteca de ícones moderna

### Backend & Database
- **Supabase** - Backend-as-a-Service com PostgreSQL
- **Supabase Auth** - Sistema completo de autenticação
- **Row Level Security (RLS)** - Segurança avançada de dados

### Email & Notifications
- **Resend** - Serviço de email transacional moderno
- **React Calendar** - Componente de calendário interativo
- **Date-fns** - Manipulação de datas

### Validação & Formulários
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de esquemas TypeScript-first
- **React Hot Toast** - Notificações elegantes

### Deploy & Hosting
- **Netlify** - Deploy contínuo e hosting com funções serverless
- **Netlify Functions** - Processamento serverless para API routes

## ⚙️ Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Resend (para emails)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/armazem-sao-joaquim.git
cd armazem-sao-joaquim
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_do_supabase

# Resend (para emails)
RESEND_API_KEY=re_sua_chave_do_resend

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Execute o desenvolvimento**
```bash
npm run dev
```

## 🌐 Deploy no Netlify

### Configuração Automática

1. **Conecte o repositório** no dashboard do Netlify

2. **Configure as variáveis de ambiente** no dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública do Supabase
   - `RESEND_API_KEY`: Chave da API do Resend
   - `NEXT_PUBLIC_SITE_URL`: https://seu-site.netlify.app

3. **Deploy automático**: O site será automaticamente deployado quando você fizer push para a branch principal

### Configuração Manual

Se preferir configurar manualmente:

```bash
# Build do projeto
npm run build

# Deploy via Netlify CLI
netlify deploy --prod --dir=.next
```

### ⚠️ Importantes Configurações do Netlify

**Site Settings > Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua_chave
RESEND_API_KEY=re_LAxt8r3a_3Las97m5Km5KQmwQfLRt5PrN
NEXT_PUBLIC_SITE_URL=https://armazemsaojoaquim.netlify.app
NODE_ENV=production
```

**Build Settings:**
- Build command: `npm ci && npm run build`
- Publish directory: `.next`
- Functions directory: `netlify/functions` (automático)

## 📧 Configuração do Resend

1. **Crie uma conta** em [resend.com](https://resend.com)
2. **Adicione seu domínio** (opcional, pode usar sandbox)
3. **Copie a API key** e adicione como variável de ambiente
4. **Configure o remetente** no arquivo `app/api/send-email/route.ts`

### Testando o Serviço de Email

Acesse: `https://seu-site.netlify.app/api/send-email` (GET) para verificar o status.

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
│   ├── api/                     # API Routes
│   │   └── send-email/          # Serviço de email
│   ├── auth/                    # Autenticação
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
│       └── Calendar.tsx        # Calendário de reservas
├── lib/                        # Utilitários e configurações
│   ├── hooks/                  # Custom hooks
│   │   └── useReservationAvailability.ts
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

### 📅 Sistema de Reservas Inteligente
- **Calendário Visual**: Interface intuitiva com disponibilidade em cores
- **Verificação em Tempo Real**: Consulta automática de disponibilidade
- **Validação de Horários**: Respeitando horário de funcionamento
- **Gestão de Capacidade**: Controle automático de lotação
- **Confirmação por Email**: Templates HTML personalizados
- **Lembretes Automáticos**: Notificações antes da reserva

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

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
npm run build:check  # Build + verificação de tipos
npm run clean        # Limpeza de cache
```

## 🔧 Troubleshooting

### Problemas Comuns

**1. Erro de API Key do Resend**
```bash
# Verifique se a variável está configurada
echo $RESEND_API_KEY
# Ou no Netlify: Site Settings > Environment Variables
```

**2. Problemas de Build**
```bash
# Limpe o cache e reinstale
npm run clean
rm -rf node_modules package-lock.json
npm install
```

**3. Erros do Supabase**
```bash
# Verifique as configurações no dashboard
# Certifique-se que RLS está habilitado
```

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