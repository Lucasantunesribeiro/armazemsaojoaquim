# 🔧 Guia de Solução de Problemas - Armazém São Joaquim

## 🚨 Erros Comuns e Soluções

### **Erro 404 - Recurso não encontrado**

#### **Sintomas:**
- `Failed to load resource: the server responded with a status of 404 ()`
- Recursos (imagens, scripts, APIs) não carregam

#### **Causas Comuns:**
1. **URLs incorretas** - Paths com typos ou estrutura errada
2. **Arquivos movidos/deletados** - Recursos que mudaram de local
3. **Rotas de API não implementadas** - Endpoints que não existem
4. **Problemas de build** - Arquivos não gerados corretamente

#### **Soluções Aplicadas:**
```typescript
// ✅ Verificação robusta de resposta antes de fazer parse JSON
if (!response.ok) {
  const contentType = response.headers.get('content-type')
  
  if (contentType && contentType.includes('application/json')) {
    try {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erro na API')
    } catch (jsonError) {
      throw new Error(`Erro ${response.status}: Falha na comunicação`)
    }
  } else {
    // Resposta não é JSON (provavelmente página de erro HTML)
    throw new Error(`Erro ${response.status}: Serviço indisponível`)
  }
}
```

---

### **Erro JSON - SyntaxError: Unexpected token '<'**

#### **Sintomas:**
- `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- Erro ao fazer parse de respostas de API

#### **Causa Raiz:**
O código JavaScript espera receber JSON mas recebe HTML (geralmente uma página de erro 404).

#### **Solução Implementada:**
```typescript
// ✅ Verificação de Content-Type antes do parse
const contentType = response.headers.get('content-type')
if (!contentType || !contentType.includes('application/json')) {
  throw new Error('Resposta inválida do servidor')
}

const data = await response.json() // Agora é seguro fazer parse
```

---

## 🛠️ Melhorias Implementadas

### **1. Função Utilitária para APIs**
Criada em `lib/api.ts`:
```typescript
export async function handleApiResponse<T>(response: Response): Promise<T>
export async function safeApiRequest<T>(url: string, options?: RequestInit): Promise<T>
```

### **2. Tratamento Robusto em Componentes**
- ✅ `app/reservas/page.tsx` - Sistema de reservas
- ✅ `components/sections/ContactSection.tsx` - Formulário de contato  
- ✅ `lib/hooks/useReservationAvailability.ts` - Hook de disponibilidade

### **3. Verificações Implementadas**
- **Content-Type**: Verifica se a resposta é JSON antes do parse
- **Status HTTP**: Trata diferentes códigos de erro apropriadamente
- **Network Errors**: Detecta problemas de conexão
- **Fallbacks**: Mensagens de erro amigáveis para o usuário

---

## 🔍 Como Diagnosticar Problemas

### **1. Verificar Console do Navegador**
```javascript
// Abra DevTools (F12) e procure por:
- "Failed to load resource: 404"
- "SyntaxError: Unexpected token '<'"
- "TypeError: Failed to fetch"
```

### **2. Verificar Network Tab**
- Status codes das requisições
- Content-Type das respostas
- Tempo de resposta

### **3. Verificar Logs do Servidor**
```bash
npm run dev  # Modo desenvolvimento
# Procure por erros no terminal
```

---

## 🚀 Prevenção de Problemas

### **1. Sempre Verificar Respostas de API**
```typescript
// ❌ Perigoso - pode causar erro de JSON
const data = await response.json()

// ✅ Seguro - verifica antes de fazer parse
if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
  const data = await response.json()
}
```

### **2. Usar Funções Utilitárias**
```typescript
import { safeApiRequest } from '../lib/api'

// ✅ Uso recomendado
const data = await safeApiRequest('/api/endpoint', { method: 'POST' })
```

### **3. Implementar Fallbacks**
```typescript
try {
  const result = await apiCall()
  return result
} catch (error) {
  console.error('API Error:', error)
  // Fallback ou mensagem amigável
  return { error: 'Serviço temporariamente indisponível' }
}
```

---

## 📋 Checklist de Verificação

### **Para Desenvolvedores:**
- [ ] Todas as rotas de API existem e funcionam
- [ ] Respostas de API sempre retornam JSON válido
- [ ] Tratamento de erro implementado em todas as chamadas
- [ ] Content-Type verificado antes do parse JSON
- [ ] Mensagens de erro amigáveis para usuários

### **Para Deploy:**
- [ ] Build executado sem erros
- [ ] Todas as rotas acessíveis
- [ ] Variáveis de ambiente configuradas
- [ ] Logs de erro monitorados

---

## 🔗 Links Úteis

- [MDN - HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Next.js - API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Última atualização:** Janeiro 2025  
**Status:** ✅ Problemas resolvidos e prevenção implementada 