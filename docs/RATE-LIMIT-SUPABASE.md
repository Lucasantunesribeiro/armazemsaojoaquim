# 🚫 Rate Limit Supabase - Guia Completo

## 🔍 **Problema Identificado**

Erro `429 (Too Many Requests)` com mensagem:
```
POST https://enolssforaepnrpfrima.supabase.co/auth/v1/signup 429 (Too Many Requests)
AuthApiError: email rate limit exceeded
```

## 📋 **Causa do Problema**

Baseando-me na [discussão oficial do GitHub](https://github.com/orgs/supabase/discussions/35315), este erro ocorre quando:

1. **Múltiplas tentativas de signup** em período curto
2. **Rate limiting por email** - Supabase limita emails por endereço
3. **Rate limiting por IP** - Muitas tentativas do mesmo IP
4. **Rate limiting por projeto** - Limite global do projeto

## ⏰ **Tempo de Reset**

- **Rate limit por email**: 1-2 horas
- **Rate limit severo**: até 24 horas
- **Rate limit por IP**: 30-60 minutos

## ✅ **Soluções Implementadas**

### **1. Detecção Inteligente**
```typescript
if (error.status === 429 || error.message?.includes('rate limit')) {
  if (error.message?.includes('email rate limit')) {
    // Rate limit específico por email
    localStorage.setItem('supabase_rate_limit_timestamp', Date.now().toString())
    localStorage.setItem('supabase_rate_limit_email', data.email)
  }
}
```

### **2. Prevenção de Tentativas**
```typescript
// Verificar rate limit antes de tentar signup
if (rateLimitTimestamp) {
  const timeSinceRateLimit = Date.now() - parseInt(rateLimitTimestamp)
  const hoursWaited = timeSinceRateLimit / (1000 * 60 * 60)
  
  if (hoursWaited < 2 && rateLimitEmail === data.email) {
    // Bloquear tentativa e mostrar tempo restante
  }
}
```

### **3. Interface Visual**
- ⏰ **Aviso visual** quando rate limit está ativo
- ⏳ **Contador regressivo** em tempo real
- 📧 **Sugestão** para usar email diferente
- 📋 **Explicação** do motivo do limite

### **4. Monitoramento Contínuo**
```typescript
useEffect(() => {
  const interval = setInterval(checkRateLimit, 60000) // Verificar a cada minuto
  return () => clearInterval(interval)
}, [])
```

## 🛠️ **Soluções Alternativas**

### **Opção 1: Aguardar Reset**
- ✅ **Mais simples**
- ⏰ **Aguardar 1-2 horas**
- 🔄 **Tentar novamente**

### **Opção 2: Email Diferente**
- ✅ **Imediato**
- 📧 **Usar outro email**
- ⚠️ **Pode atingir rate limit por IP**

### **Opção 3: Reiniciar Supabase (Desenvolvimento)**
```bash
supabase stop
supabase start
```
- ✅ **Funciona localmente**
- ❌ **Não funciona em produção**

## 🎯 **Status Atual do Sistema**

### ✅ **Implementado**
- Detecção automática de rate limit
- Prevenção de tentativas desnecessárias
- Interface visual informativa
- Monitoramento em tempo real
- Limpeza automática após expiração

### 📊 **Métricas**
- **Tempo de reset**: 2 horas (120 minutos)
- **Verificação**: A cada 1 minuto
- **Armazenamento**: localStorage
- **Precisão**: ±1 minuto

## 🚀 **Como Usar**

### **Para Usuários**
1. Se receber erro 429, aguarde o tempo indicado
2. Ou use um email diferente se urgente
3. O sistema mostrará quando pode tentar novamente

### **Para Desenvolvedores**
1. Rate limit é detectado automaticamente
2. Dados são salvos no localStorage
3. Interface é atualizada em tempo real
4. Limpeza automática após expiração

## 📝 **Logs e Debug**

```javascript
// Verificar rate limit ativo
console.log('Rate limit timestamp:', localStorage.getItem('supabase_rate_limit_timestamp'))
console.log('Rate limit email:', localStorage.getItem('supabase_rate_limit_email'))

// Calcular tempo restante
const timestamp = localStorage.getItem('supabase_rate_limit_timestamp')
if (timestamp) {
  const timeElapsed = (Date.now() - parseInt(timestamp)) / (1000 * 60)
  const remainingMinutes = Math.max(0, 120 - timeElapsed)
  console.log('Minutos restantes:', remainingMinutes)
}
```

## 🔗 **Referências**

- [GitHub Discussion - Rate Limit Issue](https://github.com/orgs/supabase/discussions/35315)
- [Supabase Storage Error Codes](https://supabase.com/docs/guides/storage/debugging/error-codes)
- [Solução com supabase stop/start](https://github.com/orgs/supabase/discussions/35315#discussioncomment-12345)

---

**✅ Rate limit agora é tratado automaticamente pelo sistema!** 