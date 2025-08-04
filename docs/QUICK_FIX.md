# Correção Rápida do Erro de Autenticação

## Problema
Erro `AuthApiError: Database error granting user` ao tentar fazer login.

## Solução Rápida

### Opção 1: Script Direto (Mais Fácil)
```bash
node scripts/direct-auth-fix.js
```

### Opção 2: SQL Manual (Mais Confiável)
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Execute o conteúdo de `scripts/fix-auth-error.sql`

### Opção 3: Configurar Variáveis de Ambiente
1. Crie arquivo `.env` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=https://enolssforaepnrpfrima.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

2. Execute:
```bash
node scripts/simple-auth-fix.js
```

## O que os scripts fazem:

1. ✅ Verificam se o usuário `armazemsaojoaquimoficial@gmail.com` existe
2. ✅ Criam perfil se não existir
3. ✅ Configuram role como 'admin'
4. ✅ Habilitam RLS na tabela profiles
5. ✅ Criam políticas RLS adequadas
6. ✅ Verificam/criam triggers de autenticação

## Resultado Esperado:
```
✅ Usuário encontrado: armazemsaojoaquimoficial@gmail.com
✅ Perfil encontrado: armazemsaojoaquimoficial@gmail.com (Role: admin)
✅ RLS habilitado
✅ Políticas RLS criadas
✅ Trigger criado
✅ Correção concluída com sucesso!
```

## Após a correção:
1. Tente fazer login novamente
2. O erro "Database error granting user" deve ser resolvido

## Se ainda houver problemas:
1. Verifique se o usuário existe no Supabase Auth
2. Verifique se a Service Role Key tem permissões adequadas
3. Execute o SQL manualmente no Supabase Dashboard 