# Configuração de URLs do Supabase

## Problema

O erro "Problema no banco de dados" pode ocorrer quando o Supabase não está configurado corretamente para aceitar URLs de desenvolvimento (`localhost:3000`).

## Diagnóstico

Execute o script de diagnóstico para verificar as configurações atuais:

```bash
node scripts/check-supabase-urls.js
```

Este script irá:
- Verificar se as variáveis de ambiente estão configuradas
- Testar a conexão com o Supabase
- Verificar as configurações de URL atuais
- Identificar se `localhost:3000` está nas URLs permitidas

## Solução Automática

Execute o script de correção para adicionar automaticamente as URLs de desenvolvimento:

```bash
node scripts/fix-supabase-urls.js
```

Este script irá:
- Obter as configurações atuais do Supabase
- Adicionar URLs de desenvolvimento necessárias
- Manter as URLs de produção existentes
- Verificar se a configuração foi aplicada corretamente

## URLs Necessárias

### Desenvolvimento
- `http://localhost:3000`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/reset-password`
- `http://localhost:3000/**`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3000/auth/callback`
- `http://127.0.0.1:3000/auth/reset-password`
- `http://127.0.0.1:3000/**`

### Produção
- `https://armazemsaojoaquim.netlify.app`
- `https://armazemsaojoaquim.netlify.app/auth/callback`
- `https://armazemsaojoaquim.netlify.app/**`
- `https://armazemsaojoaquim.netlify.app/auth/reset-password`

## Configuração Manual

Se preferir configurar manualmente no painel do Supabase:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Authentication** > **URL Configuration**
4. Configure:
   - **Site URL**: `https://armazemsaojoaquim.netlify.app`
   - **Redirect URLs**: Adicione todas as URLs listadas acima

## Verificação

Após aplicar as correções, teste a autenticação:

1. Acesse `http://localhost:3000/pt/auth`
2. Tente fazer login
3. Verifique se não há mais erros de "Problema no banco de dados"

## Troubleshooting

### Erro persistente após correção
1. Verifique se as variáveis de ambiente estão corretas
2. Execute novamente o script de diagnóstico
3. Verifique se o Supabase está online

### Erro em produção
1. Verifique se as URLs de produção estão configuradas
2. Teste com o domínio de produção
3. Verifique logs do Supabase

### Variáveis de ambiente necessárias
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

## Prevenção

Para evitar problemas futuros:

1. Sempre configure URLs de desenvolvimento ao criar um novo projeto
2. Use os scripts fornecidos para automatizar a configuração
3. Teste autenticação em ambos os ambientes (desenvolvimento e produção)
4. Mantenha documentação atualizada das configurações

## Scripts Disponíveis

- `scripts/check-supabase-urls.js` - Diagnóstico das configurações
- `scripts/fix-supabase-urls.js` - Correção automática das URLs
- `scripts/run-auth-fix.js` - Correção completa de autenticação

## Logs Úteis

Monitore os logs do console para identificar problemas:

```javascript
// No console do navegador
console.log('🔄 Tentando fazer login:', {
  email: data.email,
  environment: window.location.hostname !== 'localhost' ? 'production' : 'development'
})
```

Isso ajudará a identificar se o problema está relacionado ao ambiente de desenvolvimento vs produção. 