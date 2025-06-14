# 🚀 Guia de Configuração - Armazém São Joaquim

## 📋 Problemas Identificados e Soluções

### ✅ Problemas Resolvidos

1. **Sistema de reservas não funcionando** - Integração real com Supabase implementada
2. **Diferenças de estilos entre local e produção** - Configurações de CSS otimizadas
3. **Preparação para entrega ao cliente** - Setup completo documentado

---

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Copie o arquivo `env.example` para `.env.local`:

```bash
cp env.example .env.local
```

Configure as seguintes variáveis **OBRIGATÓRIAS**:

```env
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend Email (OBRIGATÓRIO para emails)
RESEND_API_KEY=re_123456789...

# Site URL (OBRIGATÓRIO)
NEXT_PUBLIC_SITE_URL=https://armazemsaojoaquim.netlify.app
```

### 2. Banco de Dados (Supabase)

#### 2.1. Criar Tabela de Reservas

Execute a migração SQL no painel do Supabase:

```sql
-- Executar o arquivo: supabase/migrations/001_create_reservations_table.sql
```

#### 2.2. Configurar RLS (Row Level Security)

As políticas de segurança já estão incluídas na migração, garantindo que:
- Usuários só vejam suas próprias reservas
- Confirmação por email funcione corretamente

### 3. Serviço de Email (Resend)

#### 3.1. Criar Conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta
3. Verifique o domínio `armazemsaojoaquimoficial@gmail.com`
4. Gere uma API Key

#### 3.2. Configurar Templates de Email

Os templates já estão implementados em:
- `components/email-templates/ReservationConfirmation.tsx`
- `components/email-templates/AdminNotification.tsx`

---

## 🚀 Deploy em Produção

### Netlify (Recomendado)

#### 1. Configurar Variáveis de Ambiente

No painel do Netlify, adicione:

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_123456789...
NEXT_PUBLIC_SITE_URL=https://armazemsaojoaquim.netlify.app
```

#### 2. Comandos de Build

O projeto já está configurado para build automático:

```bash
# Comando definido no netlify.toml
node scripts/netlify-build.js
```

### Vercel (Alternativa)

```bash
# Instalar CLI do Vercel
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🧪 Testes

### 1. Testar Sistema de Reservas

```bash
# Teste das APIs
npm run test:simple

# Teste completo
npm run test:all
```

### 2. Verificar Funcionalidades

1. **Login/Cadastro**: `/auth`
2. **Fazer Reserva**: `/reservas`
3. **API de Reservas**: `/api/reservas`
4. **Emails**: Verificar se chegam corretamente

---

## 🎨 Corrigindo Diferenças de CSS

### Problema Identificado

Diferenças entre ambiente local e produção causadas por:
- Minificação agressiva do CSS
- Plugins do Tailwind inconsistentes
- Ordem de carregamento de estilos

### Soluções Implementadas

1. **PostCSS otimizado** (`postcss.config.js`):
   - Configurações de produção mais conservadoras
   - Preservação de custom properties

2. **Tailwind configurado** (`tailwind.config.js`):
   - Plugins oficiais incluídos
   - Safelist para classes dinâmicas
   - Componentes base para consistência

3. **CSS global otimizado** (`app/globals.css`):
   - Variáveis CSS para consistência
   - Fallbacks para compatibilidade

---

## 📊 Performance e Otimização

### 1. Imagens

```bash
# Otimizar imagens
npm run optimize-images
```

### 2. Performance

```bash
# Verificar performance
npm run lighthouse
npm run perf:check
```

### 3. Build Otimizado

```bash
# Build com todas as otimizações
npm run build:optimized
```

---

## 🔒 Segurança

### 1. Variáveis Sensíveis

❌ **NUNCA** exponha:
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` 
- `JWT_SECRET`

✅ **Pode ser público**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

### 2. Headers de Segurança

Configurados automaticamente no `next.config.js`:
- X-Frame-Options
- X-Content-Type-Options
- CSP (Content Security Policy)

---

## 🐛 Troubleshooting

### 1. Reservas não aparecem

**Causa**: Usuário não logado ou erro na API
**Solução**: 
1. Verificar se usuário está autenticado
2. Verificar logs da API: `/api/reservas`
3. Verificar configuração do Supabase

### 2. Emails não chegam

**Causa**: RESEND_API_KEY não configurada
**Solução**:
1. Verificar variável de ambiente
2. Testar API do Resend
3. Verificar domínio verificado

### 3. Estilos diferentes em produção

**Causa**: Configuração de build
**Solução**:
1. Verificar `postcss.config.js`
2. Limpar cache: `npm run clean`
3. Rebuild: `npm run build:check`

### 4. Build falha no Netlify

**Causa**: Dependências ou configuração
**Solução**:
1. Verificar Node.js versão (20.x)
2. Verificar variáveis de ambiente
3. Verificar logs do build

---

## 🆘 Suporte

### Logs Importantes

```bash
# Logs do Netlify
netlify build --debug

# Logs locais
npm run dev

# Logs da API
curl -X GET "https://seu-site.netlify.app/api/health"
```

### Contatos

- **Email**: armazemsaojoaquimoficial@gmail.com
- **Desenvolvedor**: [Inserir contato]

---

## ✅ Checklist Final

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Tabela de reservas criada no Supabase
- [ ] Resend API configurada e testada
- [ ] Templates de email funcionando
- [ ] Testes passando
- [ ] Build local funcionando

### Após Deploy

- [ ] Site carregando corretamente
- [ ] Login/cadastro funcionando
- [ ] Sistema de reservas operacional
- [ ] Emails sendo enviados
- [ ] Estilos consistentes
- [ ] Performance adequada (Lighthouse > 90)

### Entrega ao Cliente

- [ ] Documentação atualizada
- [ ] Credenciais transferidas
- [ ] Treinamento realizado
- [ ] Suporte configurado

---

## 🎯 Próximos Passos

1. **Monitoramento**: Configurar alertas para erros
2. **Analytics**: Google Analytics configurado
3. **Backup**: Sistema de backup automático
4. **Escalabilidade**: Planejamento para crescimento
5. **Manutenção**: Cronograma de atualizações

---

**Projeto finalizado e pronto para produção! 🎉** 