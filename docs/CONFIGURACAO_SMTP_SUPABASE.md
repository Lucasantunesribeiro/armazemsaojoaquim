# 📧 Configuração SMTP Supabase - Guia Completo

## 🔍 **Problema Identificado**
- ✅ Sistema de autenticação funcionando (Admin API)
- ❌ Emails de confirmação não sendo enviados (erro 500 SMTP)
- 🎯 **Objetivo**: Configurar SMTP para verificação por email funcionar

## 🚀 **Solução: 2 Opções Recomendadas**

### **OPÇÃO 1: SMTP Padrão Supabase (MAIS SIMPLES)**

#### Passo 1: Acessar Dashboard Supabase
1. Vá para: https://supabase.com/dashboard/project/enolssforaepnrpfrima/auth/settings
2. Faça login com sua conta Supabase

#### Passo 2: Configurar URLs
Na seção **Site URL**:
```
Site URL: https://armazemsaojoaquim.netlify.app
```

Na seção **Redirect URLs**:
```
https://armazemsaojoaquim.netlify.app/auth/callback
https://armazemsaojoaquim.netlify.app/**
```

#### Passo 3: SMTP Settings
1. Vá para **Auth > Settings > SMTP Settings**
2. **DEIXE DESABILITADO** (Use SMTP padrão do Supabase)
3. **Salve as configurações**

#### Passo 4: Email Templates (Opcional)
1. Vá para **Auth > Email Templates**
2. Teste o template padrão primeiro
3. Personalize depois se necessário

---

### **OPÇÃO 2: SMTP Customizado com Resend (MAIS CONTROLE)**

#### Passo 1: Criar conta Resend
1. Acesse: https://resend.com
2. Crie conta gratuita
3. Verifique seu domínio (ou use resend.dev temporariamente)

#### Passo 2: Obter API Key
1. No dashboard Resend, vá para **API Keys**
2. Crie nova API Key
3. Copie a chave (formato: `re_xxxxxxxxxx`)

#### Passo 3: Configurar SMTP no Supabase
No Dashboard Supabase > Auth > Settings > SMTP Settings:

```
✅ Enable custom SMTP
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Pass: [sua-api-key-resend]
Sender Name: Armazém São Joaquim
Sender Email: noreply@armazemsaojoaquim.com
```

#### Passo 4: Testar Configuração
1. Clique em **Test Configuration**
2. Se der erro, verifique API key
3. Salve apenas se teste passar

---

## 🧪 **Como Testar Após Configuração**

### Teste 1: Via Script
```bash
node scripts/diagnose-smtp-config.js
```

### Teste 2: No Site
1. Acesse: https://armazemsaojoaquim.netlify.app/auth
2. Tente criar nova conta
3. Verifique se recebe email de confirmação

### Teste 3: Logs do Supabase
1. Vá para **Logs > Auth**
2. Procure por erros SMTP
3. Deve mostrar "Email sent successfully"

---

## 🛠️ **Resolução de Problemas Comuns**

### Erro: "Error sending confirmation email"
**Causa**: SMTP não configurado ou inválido
**Solução**: 
- Use OPÇÃO 1 (SMTP padrão) primeiro
- Se não funcionar, configure OPÇÃO 2

### Erro: "Invalid SMTP credentials"
**Causa**: API key incorreta ou expirada
**Solução**:
- Gere nova API key no Resend
- Verifique se copiou corretamente

### Emails não chegam
**Causa**: Pode estar na pasta spam
**Solução**:
- Verifique pasta spam/lixo eletrônico
- Configure SPF/DKIM no seu domínio
- Use email de teste diferente

### Erro 500 persiste
**Causa**: Configuração anterior em cache
**Solução**:
- Aguarde 5-10 minutos após salvar
- Limpe cache do navegador
- Teste em aba anônima

---

## ⚡ **Configuração Rápida Recomendada**

Para resolver **HOJE MESMO**:

1. **Acesse**: https://supabase.com/dashboard/project/enolssforaepnrpfrima/auth/settings

2. **Configure URLs**:
   - Site URL: `https://armazemsaojoaquim.netlify.app`
   - Redirect URLs: `https://armazemsaojoaquim.netlify.app/auth/callback`

3. **SMTP Settings**: 
   - **DEIXE DESABILITADO** (usar padrão Supabase)

4. **Salve e aguarde 5 minutos**

5. **Teste signup** no site

---

## 📊 **Status Após Configuração**

Quando funcionar corretamente, você verá:

✅ **No Console do Navegador**:
```
✅ Registration successful! Check your email for confirmation.
```

✅ **No Email**:
- Assunto: "Confirm your signup"
- Link de confirmação funcional

✅ **Nos Logs Supabase**:
```
Email sent successfully to user@example.com
```

---

## 🔗 **Links Úteis**

- [Supabase SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Troubleshooting Auth Errors](https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Resend Documentation](https://resend.com/docs)

---

## 📞 **Próximos Passos**

1. **CONFIGURE SMTP** seguindo OPÇÃO 1 ou 2
2. **TESTE** usando o script ou site
3. **CONFIRME** que emails chegam
4. **PERSONALIZE** templates se necessário

**Tempo estimado**: 10-15 minutos
**Dificuldade**: Fácil 🟢 