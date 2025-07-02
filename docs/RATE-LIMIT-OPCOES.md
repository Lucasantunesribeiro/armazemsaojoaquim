# 🛠️ Opções para Gerenciar Rate Limits do Supabase

## 📊 **RATE LIMITS ATUAIS (Documentação Oficial)**

Baseado em: https://supabase.com/docs/guides/auth/rate-limits

### **📧 Email Rate Limits**
| Endpoint | Limite | Customizável |
|----------|--------|--------------|
| Signup/Recover/Update Email | **2 emails/hora** | ❌ Só com SMTP próprio |
| OTP | 30 OTPs/hora | ✅ Sim |
| Magic Links | 60s entre requests | ✅ Sim |

### **🔐 Auth Rate Limits**
| Endpoint | Limite | Customizável |
|----------|--------|--------------|
| Verification | 360/hora (burst 30) | ❌ Não |
| Token Refresh | 1800/hora (burst 30) | ❌ Não |
| MFA Challenge | 15/hora (burst 5) | ❌ Não |
| Anonymous Signin | 30/hora (burst 30) | ❌ Não |

## 🎯 **COMO CONFIGURAR/REDUZIR**

### **Opção 1: Dashboard Supabase** 🎛️
1. Acesse: `https://supabase.com/dashboard/project/[SEU_PROJETO]/auth/rate-limits`
2. Configure limites customizáveis:
   - OTP rate limits
   - Magic link delays
   - Signup confirmation delays

### **Opção 2: SMTP Próprio** 📧
**✅ JÁ IMPLEMENTADO** - Resend SMTP configurado
- **Problema**: Rate limit ainda ativo mesmo com SMTP próprio
- **Causa**: Limitações internas do Supabase não documentadas

### **Opção 3: Contatar Supabase Support** 📞
```
URL: https://supabase.com/dashboard/support/new
Tipo: Rate Limit Increase Request
```

**Template de solicitação**:
```
Subject: Rate Limit Increase Request - Email Auth

Hi Supabase Team,

I'm experiencing email rate limits (2/hour) on my project even with custom SMTP configured via Resend.

Project ID: [SEU_PROJECT_ID]
Issue: email rate limit exceeded on /auth/v1/signup
SMTP: Configured with Resend
Request: Increase email rate limit or bypass for custom SMTP

Thank you!
```

### **Opção 4: Bypass via Admin API** 🔧
**✅ JÁ IMPLEMENTADO** - Sistema automático de bypass

Quando rate limit é detectado:
1. 🔄 Tenta signup normal
2. 🚫 Se rate limit → usa Admin API
3. ✅ Cria usuário sem rate limit
4. 📧 Envia email de confirmação

## 🚀 **SOLUÇÕES IMPLEMENTADAS**

### **1. Sistema Inteligente de Detecção**
- Detecta erro 429 automaticamente
- Salva timestamp e email no localStorage
- Interface visual com countdown

### **2. Bypass Automático**
- Admin API para contornar rate limits
- Fallback transparente para o usuário
- Mantém fluxo de confirmação por email

### **3. Prevenção de Tentativas**
- Bloqueia tentativas durante rate limit ativo
- Sugere email alternativo
- Calcula tempo restante automaticamente

## 📈 **MONITORAMENTO**

### **Status Atual**
```bash
curl https://armazemsaojoaquim.netlify.app/api/auth/check-smtp-status
```

### **Logs de Rate Limit**
- Console do navegador mostra detecção
- Timestamps salvos no localStorage
- Bypass attempts logados

## ⚠️ **LIMITAÇÕES CONHECIDAS**

1. **Rate limit por IP**: Não customizável
2. **Rate limit por projeto**: Limite global fixo
3. **SMTP próprio**: Não remove todos os limits
4. **Admin API**: Pode ter seus próprios limits

## 🔮 **PRÓXIMOS PASSOS**

1. **Monitorar eficácia** do bypass automático
2. **Contatar Supabase** se problema persistir
3. **Considerar alternativas** se necessário:
   - NextAuth.js
   - Auth0
   - Firebase Auth

## 📚 **Referências**

- [Supabase Rate Limits Docs](https://supabase.com/docs/guides/auth/rate-limits)
- [GitHub Discussion #35315](https://github.com/orgs/supabase/discussions/35315)
- [Rate Limiting Issues #19493](https://github.com/orgs/supabase/discussions/19493) 