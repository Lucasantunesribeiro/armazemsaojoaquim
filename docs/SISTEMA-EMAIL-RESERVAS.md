# Sistema de Email para Reservas - Armazém São Joaquim

## 📧 Visão Geral

Sistema completo de confirmação de reservas por email usando **Resend** como provedor de email. O fluxo funciona da seguinte forma:

1. **Cliente faz reserva** → Status: `pendente`
2. **Sistema envia email de confirmação** → Cliente recebe link
3. **Cliente clica no link** → Status muda para `confirmada`
4. **Admin recebe notificação** → Email com todos os dados

## 🚀 Configuração

### 1. Configurar Resend

1. Acesse [resend.com](https://resend.com) e crie uma conta
2. Verifique seu domínio ou use o domínio de teste
3. Gere uma API Key
4. Adicione a variável de ambiente:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Configurar Domínio (Produção)

Para usar seu próprio domínio:

1. No painel do Resend, vá em "Domains"
2. Adicione seu domínio (ex: `armazemsaojoaquim.com`)
3. Configure os registros DNS conforme instruído
4. Aguarde a verificação

### 3. Variáveis de Ambiente

Adicione no seu arquivo `.env.local`:

```bash
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Site Configuration  
NEXT_PUBLIC_SITE_URL=https://armazemsaojoaquim.netlify.app
```

## 📋 Fluxo Completo

### 1. Criação da Reserva

**Endpoint:** `POST /api/reservas`

```json
{
  "user_id": "user123",
  "nome": "João Silva",
  "email": "joao@email.com", 
  "telefone": "(21) 99999-9999",
  "data": "2024-12-25",
  "horario": "19:00",
  "pessoas": 4,
  "observacoes": "Mesa próxima à janela"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "res_abc123",
    "status": "pendente",
    "confirmation_token": "token_xyz789",
    // ... outros dados
  },
  "message": "Reserva criada com sucesso. Verifique seu email para confirmar.",
  "emailSent": true
}
```

### 2. Email de Confirmação

O cliente recebe um email com:
- ✅ Detalhes da reserva
- 🔗 Link de confirmação
- ⚠️ Aviso sobre status pendente

**Link de confirmação:**
```
https://seusite.com/api/reservas/confirm?token=TOKEN_UNICO
```

### 3. Confirmação da Reserva

**Endpoint:** `GET /api/reservas/confirm?token=TOKEN`

Quando o cliente clica no link:
1. ✅ Token é validado
2. 📝 Status muda para `confirmada`
3. 📧 Admin recebe notificação
4. 🎉 Cliente vê página de sucesso

### 4. Notificação para Admin

O admin (`armazemsaojoaquimoficial@gmail.com`) recebe:
- 👤 Dados completos do cliente
- 📅 Detalhes da reserva
- 🔗 Links rápidos (email, WhatsApp)
- 📋 Próximos passos

## 🧪 Testes

### Testar Configuração

```bash
GET /api/test-email
```

### Testar Email de Reserva

```bash
POST /api/test-email
Content-Type: application/json

{
  "type": "reservation",
  "email": "seu@email.com"
}
```

### Testar Notificação Admin

```bash
POST /api/test-email
Content-Type: application/json

{
  "type": "admin",
  "email": "admin@email.com"
}
```

## 📁 Estrutura de Arquivos

```
├── components/
│   └── email-templates/
│       ├── ReservationConfirmation.tsx  # Template para cliente
│       └── AdminNotification.tsx        # Template para admin
├── lib/
│   ├── email-service.ts                 # Serviço principal
│   └── config.ts                        # Configurações
└── app/api/
    ├── reservas/
    │   ├── route.ts                     # CRUD de reservas
    │   └── confirm/
    │       └── route.ts                 # Confirmação via token
    └── test-email/
        └── route.ts                     # Testes de email
```

## 🎨 Templates de Email

### ReservationConfirmation.tsx
- 🎨 Design responsivo
- 📱 Mobile-friendly
- 🔗 Botão de confirmação destacado
- ⚠️ Instruções claras

### AdminNotification.tsx
- 🔔 Notificação visual
- 👤 Dados do cliente organizados
- 📅 Detalhes da reserva
- 🚀 Ações rápidas (email, WhatsApp)

## 🔧 Personalização

### Alterar Remetente

No arquivo `lib/email-service.ts`:

```typescript
private fromEmail = 'Seu Restaurante <noreply@seudominio.com>';
private adminEmail = 'admin@seudominio.com';
```

### Customizar Templates

Os templates estão em `components/email-templates/`:
- Modifique cores, textos e layout
- Adicione seu logo
- Personalize mensagens

### Adicionar Novos Tipos de Email

1. Crie novo template em `email-templates/`
2. Adicione método no `EmailService`
3. Implemente endpoint se necessário

## 🚨 Tratamento de Erros

### Email não configurado
```json
{
  "success": false,
  "error": "Configuração de email não encontrada"
}
```

### Token inválido
```json
{
  "error": "Token de confirmação inválido ou expirado",
  "message": "Por favor, solicite uma nova reserva."
}
```

### Falha no envio
- ⚠️ Reserva é criada mesmo se email falhar
- 📝 Logs detalhados para debug
- 🔄 Sistema continua funcionando

## 📊 Monitoramento

### Logs Importantes

```bash
# Email enviado com sucesso
"Email de confirmação enviado com sucesso: email_id"

# Falha no envio
"Erro ao enviar email de confirmação: error_details"

# Confirmação processada
"Reserva confirmada: reservation_id"
```

### Métricas Sugeridas

- 📧 Taxa de emails enviados
- ✅ Taxa de confirmação
- ⏱️ Tempo médio para confirmação
- 🚨 Falhas de envio

## 🔐 Segurança

### Tokens de Confirmação
- 🔒 Gerados com `crypto.randomBytes(32)`
- ⏰ Podem ter expiração (implementar se necessário)
- 🔑 Únicos por reserva

### Validações
- ✅ Email válido
- ✅ Token único
- ✅ Status da reserva
- ✅ Dados obrigatórios

## 🚀 Deploy

### Netlify
1. Configure variáveis de ambiente no painel
2. Deploy automático via Git
3. Teste endpoints após deploy

### Vercel
1. Adicione variáveis no dashboard
2. Deploy via CLI ou Git
3. Verifique logs de função

## 📞 Suporte

### Problemas Comuns

**Email não chega:**
- ✅ Verifique RESEND_API_KEY
- ✅ Confirme domínio verificado
- ✅ Verifique spam/lixo eletrônico

**Token inválido:**
- ✅ Verifique URL completa
- ✅ Confirme token no banco
- ✅ Implemente expiração se necessário

**Falha na confirmação:**
- ✅ Verifique logs do servidor
- ✅ Teste endpoint manualmente
- ✅ Confirme banco de dados

### Contato Técnico

Para suporte técnico:
- 📧 Email: suporte@seudominio.com
- 💬 WhatsApp: (21) 98565-8443
- 🐛 Issues: GitHub do projeto

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e testado 