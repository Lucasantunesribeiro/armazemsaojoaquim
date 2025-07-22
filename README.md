# Armazém São Joaquim

Sistema de reservas e cardápio online para o restaurante Armazém São Joaquim localizado em Santa Teresa, Rio de Janeiro.

## 🏪 Sobre o Restaurante

O Armazém São Joaquim é um restaurante tradicional localizado no coração de Santa Teresa, oferecendo culinária brasileira autêntica em um ambiente acolhedor e histórico.

## ✨ Funcionalidades

### Para Clientes
- **Visualização do Cardápio**: Cardápio interativo com categorias e imagens dos pratos
- **Sistema de Reservas**: Reserva de mesas online com validação de disponibilidade
- **Blog**: Artigos sobre a história do restaurante e pratos especiais
- **Modo Escuro/Claro**: Interface adaptável às preferências do usuário
- **Design Responsivo**: Otimizado para desktop, tablet e mobile

### Para Administradores
- **Painel Administrativo**: Interface completa para gestão do restaurante
- **Gestão de Cardápio**: CRUD completo para pratos e categorias
- **Gestão de Reservas**: Visualização e controle das reservas
- **Gestão de Blog**: Criar e editar artigos do blog
- **Upload de Imagens**: Sistema integrado para upload de fotos dos pratos
- **Dashboard**: Estatísticas e métricas do restaurante

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14.2.30** - Framework React para produção
- **React 18** - Biblioteca de interface de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Biblioteca de animações (removida na versão final)

### Backend
- **Supabase** - Backend-as-a-Service (BaaS)
  - Autenticação de usuários
  - Banco de dados PostgreSQL
  - Storage para imagens
  - Row Level Security (RLS)

### Integração e Comunicação
- **Resend** - Serviço de email transacional
- **React Hook Form** - Gestão de formulários
- **Zod** - Validação de schemas

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **Jest** - Framework de testes
- **Playwright** - Testes end-to-end

## 🚀 Configuração e Instalação

### Pré-requisitos
- Node.js 20.x
- npm ≥ 10.0.0

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local` e configure as seguintes variáveis:

```bash
cp .env.example .env.local
```

#### Variáveis Obrigatórias:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase (secreta)
- `RESEND_API_KEY`: Chave da API do Resend para emails
- `RESEND_FROM_EMAIL`: Email verificado no Resend

### 3. Configuração do Banco de Dados
O projeto utiliza Supabase. Certifique-se de:
1. Criar um projeto no [Supabase](https://supabase.com)
2. Configurar as tabelas necessárias (usuários, reservas, cardápio, blog)
3. Configurar as políticas RLS (Row Level Security)

### 4. Executar o Projeto

#### Desenvolvimento
```bash
npm run dev
```

#### Build de Produção
```bash
npm run build
npm run start
```

#### Outros Comandos Úteis
```bash
npm run lint          # Verificar código
npm run type-check     # Verificar tipos TypeScript  
npm run test           # Executar testes
```

## 📁 Estrutura do Projeto

```
/
├── app/                    # App Router do Next.js 13+
│   ├── admin/             # Páginas administrativas
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   ├── blog/              # Blog do restaurante
│   ├── menu/              # Cardápio
│   └── reservas/          # Sistema de reservas
├── components/            # Componentes React reutilizáveis
│   ├── admin/            # Componentes específicos do admin
│   ├── sections/         # Seções principais do site
│   └── ui/               # Componentes de interface
├── lib/                  # Utilitários e configurações
│   ├── hooks/           # Custom React hooks
│   └── supabase.ts      # Cliente Supabase
├── public/               # Arquivos estáticos
│   └── images/          # Imagens do site
└── types/               # Definições de tipos TypeScript
```

## 🔒 Segurança

O projeto implementa várias camadas de segurança:

- **Autenticação**: Supabase Auth para login seguro
- **Autorização**: RLS (Row Level Security) no banco de dados
- **Validação**: Schemas Zod para validação de dados
- **Sanitização**: Proteção contra XSS e outros ataques
- **CORS**: Configurado adequadamente para produção

## 📱 Deploy

### Netlify (Recomendado)
O projeto está configurado para deploy no Netlify:

1. Conecte o repositório ao Netlify
2. Configure as variáveis de ambiente no painel do Netlify
3. O deploy será automático a cada push para a branch principal

### Outras Plataformas
O projeto também é compatível com:
- **Vercel**
- **Railway**
- **Render**

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:coverage

# Testes end-to-end
npm run test:e2e
```

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através do email: armazemsaojoaquimoficial@gmail.com

## 📄 Licença

Este projeto é proprietário e destinado exclusivamente ao Armazém São Joaquim.

---

**Versão**: 1.0.0  
**Última atualização**: Julho 2025  
**Desenvolvido com ❤️ para o Armazém São Joaquim**