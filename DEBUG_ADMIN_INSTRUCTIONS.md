# 🔧 INSTRUÇÕES COMPLETAS PARA DEBUG DO ADMIN

## 🎯 FERRAMENTAS DE DEBUG IMPLEMENTADAS

### **1. Página de Debug** `/debug-auth`
- **URL:** `http://localhost:3000/debug-auth`
- **Função:** Mostra estado completo da autenticação
- **Logs:** Todos os dados de sessão, banco, roles, etc.

### **2. API de Teste Completo** `/api/test-auth`
- **URL:** `http://localhost:3000/api/test-auth`
- **Função:** Testa autenticação do lado servidor
- **Logs:** Console do servidor com detalhes completos

### **3. API de Verificação Admin** `/api/check-admin-user`
- **URL:** `http://localhost:3000/api/check-admin-user`
- **Função:** Verifica se usuário admin existe na base
- **Logs:** Dados específicos do usuário admin

### **4. Logs Detalhados no Middleware**
- **Arquivo:** `lib/auth/middleware.ts`
- **Função:** Logs completos no console do servidor
- **Detalhes:** Cada etapa da verificação admin

## 🚀 PASSO A PASSO PARA DEBUG

### **PASSO 1: Verificar se Admin Existe**
```bash
# Acesse no navegador:
http://localhost:3000/api/check-admin-user

# Ou via curl:
curl http://localhost:3000/api/check-admin-user
```

**Resultado esperado:**
```json
{
  "results": {
    "adminByEmail": {
      "found": true,
      "data": {
        "id": "3ddbfb5e-eddf-4e39-983d-d3ff2f10eded",
        "email": "armazemsaojoaquimoficial@gmail.com",
        "role": "admin"
      }
    }
  }
}
```

### **PASSO 2: Fazer Login e Verificar Estado**
1. **Abrir:** `http://localhost:3000/debug-auth`
2. **Inserir senha** no código (linha que diz: `password: 'sua_senha_aqui'`)
3. **Clicar:** "🔐 Simular Login Admin"
4. **Verificar console** do navegador para logs detalhados

### **PASSO 3: Analisar Logs do Servidor**
Após tentar acessar `/admin`, verificar logs no console do servidor:

```bash
# Logs esperados de SUCESSO:
🚀 MIDDLEWARE requireAdmin: INICIANDO VERIFICAÇÃO
✅ MIDDLEWARE requireAdmin: Sessão obtida na tentativa 1
✅ MIDDLEWARE requireAdmin: Usuário encontrado na tentativa 1
🎉 MIDDLEWARE requireAdmin: SUCESSO! USUÁRIO É ADMIN

# Logs de FALHA (procurar por):
❌ MIDDLEWARE requireAdmin: FALHA DE SESSÃO
❌ MIDDLEWARE requireAdmin: USUÁRIO NÃO É ADMIN
❌ MIDDLEWARE requireAdmin: Erro ao buscar usuário
```

### **PASSO 4: Verificar Fluxo Completo**
1. **Login:** `http://localhost:3000/auth`
2. **Email:** `armazemsaojoaquimoficial@gmail.com`
3. **Senha:** [inserir senha correta]
4. **Observar redirecionamento:** Deve ir para `/admin`

## 🔍 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### **❌ Problema: "Admin user not found"**
**Causa:** Usuário não existe na tabela `users`
**Solução:**
```sql
INSERT INTO users (id, email, name, role) VALUES 
('3ddbfb5e-eddf-4e39-983d-d3ff2f10eded', 'armazemsaojoaquimoficial@gmail.com', 'Admin', 'admin');
```

### **❌ Problema: "Session not found"**
**Causa:** Problema de sincronização cliente/servidor
**Debug:**
1. Verificar cookies no navegador (DevTools > Application > Cookies)
2. Procurar cookies que começam com `sb-`
3. Verificar se `localStorage` tem `armazem-sao-joaquim-auth`

### **❌ Problema: "User role is not admin"**
**Causa:** Role está diferente de 'admin'
**Debug:**
```sql
SELECT id, email, role FROM users WHERE email = 'armazemsaojoaquimoficial@gmail.com';
```
**Solução:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'armazemsaojoaquimoficial@gmail.com';
```

### **❌ Problema: "Database connection error"**
**Causa:** Problema de configuração Supabase
**Debug:**
1. Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Testar conexão com `/api/test-auth`

## 📊 DADOS IMPORTANTES

### **Admin User Info:**
- **ID:** `3ddbfb5e-eddf-4e39-983d-d3ff2f10eded`
- **Email:** `armazemsaojoaquimoficial@gmail.com`
- **Role:** `admin`
- **Tabela:** `public.users`

### **URLs de Teste:**
- **Debug Page:** `/debug-auth`
- **Auth Test API:** `/api/test-auth`
- **Admin Check API:** `/api/check-admin-user`
- **Login Page:** `/auth`
- **Admin Panel:** `/admin`

## 🎯 SEQUÊNCIA DE DEBUG RECOMENDADA

### **1. Primeiro Debug (Sem Login):**
```bash
# Verificar se admin existe
curl http://localhost:3000/api/check-admin-user
```

### **2. Segundo Debug (Com Login):**
```bash
# 1. Fazer login em /auth
# 2. Acessar /debug-auth
# 3. Verificar dados retornados
# 4. Tentar acessar /admin
# 5. Verificar logs do servidor
```

### **3. Debug Avançado:**
```bash
# Console do servidor deve mostrar:
# - Sessão encontrada
# - Usuário encontrado no banco
# - Role confirmada como 'admin'
# - Acesso liberado
```

## 📝 EXEMPLO DE LOGS DE SUCESSO

```bash
🚀 MIDDLEWARE requireAdmin: INICIANDO VERIFICAÇÃO
📊 MIDDLEWARE requireAdmin: Tentativa 1/3: {
  hasSession: true,
  userId: "3ddbfb5e-eddf-4e39-983d-d3ff2f10eded",
  userEmail: "armazemsaojoaquimoficial@gmail.com"
}
✅ MIDDLEWARE requireAdmin: Sessão obtida na tentativa 1
📊 MIDDLEWARE requireAdmin: DB Tentativa 1/2: {
  found: true,
  user: { 
    id: "3ddbfb5e-eddf-4e39-983d-d3ff2f10eded",
    email: "armazemsaojoaquimoficial@gmail.com",
    role: "admin" 
  }
}
✅ MIDDLEWARE requireAdmin: Usuário encontrado na tentativa 1
🎉 MIDDLEWARE requireAdmin: SUCESSO! USUÁRIO É ADMIN
🎉 MIDDLEWARE requireAdmin: Permitindo acesso ao painel admin
```

## ⚠️ IMPORTANTE

1. **Inserir senha correta** no arquivo `/app/debug-auth/page.tsx` linha 115
2. **Verificar logs** tanto do navegador quanto do servidor
3. **Testar sequencialmente** as URLs de debug
4. **Reportar resultados** com base nos logs obtidos

Execute este debug e me informe quais erros específicos você encontra!