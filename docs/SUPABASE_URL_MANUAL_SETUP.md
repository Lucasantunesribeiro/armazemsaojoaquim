# Configuração Manual de URLs do Supabase

## Problema Identificado

O diagnóstico revelou que as configurações de URL do Supabase não estão configuradas:

- ❌ **Site URL**: Não configurado
- ❌ **Redirect URLs**: Vazio
- ⚠️ **localhost:3000** não está nas URLs permitidas

## Solução Manual

Como a API do Supabase não permite atualização automática das configurações, você precisa configurar manualmente no painel:

### Passo 1: Acessar o Painel do Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: **enolssforaepnrpfrima**

### Passo 2: Configurar Authentication URLs

1. No menu lateral, clique em **Authentication**
2. Clique em **URL Configuration**
3. Configure os seguintes campos:

#### Site URL
```
https://armazemsaojoaquim.netlify.app
```

#### Redirect URLs
Adicione as seguintes URLs (uma por linha):

**Para Desenvolvimento:**
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
http://localhost:3000/**
http://127.0.0.1:3000
http://127.0.0.1:3000/auth/callback
http://127.0.0.1:3000/auth/reset-password
http://127.0.0.1:3000/**
```

**Para Produção:**
```
https://armazemsaojoaquim.netlify.app
https://armazemsaojoaquim.netlify.app/auth/callback
https://armazemsaojoaquim.netlify.app/**
https://armazemsaojoaquim.netlify.app/auth/reset-password
```

### Passo 3: Salvar Configurações

1. Clique em **Save changes**
2. Aguarde a confirmação de que as configurações foram salvas

### Passo 4: Verificar Configuração

Após salvar, execute novamente o script de diagnóstico:

```bash
node scripts/check-supabase-urls.js
```

Você deve ver:
- ✅ **Site URL**: https://armazemsaojoaquim.netlify.app
- ✅ **Redirect URLs**: [lista com todas as URLs]
- ✅ **localhost configurado corretamente**

## Teste da Solução

1. Acesse `http://localhost:3000/pt/auth`
2. Tente fazer login
3. Verifique se não há mais erros de "Problema no banco de dados"

## URLs Importantes

### Callback URLs
Essas URLs são usadas para redirecionar após autenticação:
- `http://localhost:3000/auth/callback` (desenvolvimento)
- `https://armazemsaojoaquim.netlify.app/auth/callback` (produção)

### Reset Password URLs
Essas URLs são usadas para reset de senha:
- `http://localhost:3000/auth/reset-password` (desenvolvimento)
- `https://armazemsaojoaquim.netlify.app/auth/reset-password` (produção)

### Wildcard URLs
Essas URLs permitem qualquer subpágina:
- `http://localhost:3000/**` (desenvolvimento)
- `https://armazemsaojoaquim.netlify.app/**` (produção)

## Troubleshooting

### Se ainda houver erro após configuração:
1. Aguarde alguns minutos para as configurações propagarem
2. Limpe o cache do navegador
3. Teste em uma aba anônima
4. Verifique se não há erros no console do navegador

### Se o erro persistir:
1. Verifique se todas as URLs foram adicionadas corretamente
2. Certifique-se de que não há espaços extras nas URLs
3. Teste com `http://127.0.0.1:3000` em vez de `localhost`

## Prevenção

Para evitar problemas futuros:
1. Sempre configure URLs de desenvolvimento ao criar novos projetos
2. Use os scripts de diagnóstico para verificar configurações
3. Mantenha documentação atualizada das configurações
4. Teste autenticação em ambos os ambientes regularmente 