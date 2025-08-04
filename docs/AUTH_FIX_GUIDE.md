# Guia de Correção de Autenticação e Segurança

Este guia resolve todos os problemas identificados no seu banco de dados Supabase, incluindo:
- ✅ Correção da autenticação
- ✅ Resolução dos erros de linting
- ✅ Configuração adequada de RLS
- ✅ Correção das views com SECURITY DEFINER

## Problemas Identificados

### 1. Erros de Linting
- **SECURITY DEFINER VIEW**: Views `users` e `products_full` com propriedade SECURITY DEFINER
- **RLS DISABLED**: Tabelas `slow_queries_monitor`, `audit_logs`, `rate_limits` sem RLS habilitado

### 2. Problemas de Autenticação
- Usuários sem perfis correspondentes
- Triggers duplicados ou incorretos
- Políticas RLS inadequadas

## Soluções Disponíveis

### Opção 1: Script SQL Simplificado (Recomendado)

Execute o script `scripts/fix-auth-simple.sql` diretamente no **SQL Editor** do Supabase:

1. Acesse o Dashboard do Supabase
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `scripts/fix-auth-simple.sql`
4. Execute o script

### Opção 2: Script JavaScript Automatizado

Execute via linha de comando:

```bash
# Instalar dependências se necessário
npm install @supabase/supabase-js

# Executar correção
node scripts/run-auth-fix-complete.js
```

### Opção 3: Verificação Manual

Após aplicar a correção, execute o script de verificação:

```bash
node scripts/verify-auth-fix.js
```

## O que cada script faz

### `fix-auth-simple.sql`
- ✅ Cria tabela `profiles` se não existir
- ✅ Habilita RLS na tabela `profiles`
- ✅ Cria políticas RLS adequadas
- ✅ Cria função `handle_new_user`
- ✅ Remove triggers duplicados
- ✅ Cria trigger correto para novos usuários
- ✅ Corrige views `users` e `products_full` (remove SECURITY DEFINER)
- ✅ Habilita RLS nas tabelas de monitoramento
- ✅ Cria políticas RLS para tabelas de monitoramento (apenas admins)
- ✅ Cria perfis para usuários existentes sem perfis

### `run-auth-fix-complete.js`
- ✅ Executa automaticamente todos os comandos SQL
- ✅ Fornece feedback detalhado do progresso
- ✅ Trata erros graciosamente
- ✅ Verifica o resultado final

### `verify-auth-fix.js`
- ✅ Verifica se a tabela `profiles` existe
- ✅ Confirma se RLS está habilitado
- ✅ Verifica se o trigger existe
- ✅ Testa as views corrigidas
- ✅ Verifica as tabelas de monitoramento
- ✅ Confirma contagem de usuários vs perfis

## Resultado Esperado

Após executar a correção, você deve ver:

```
📊 Resumo da verificação:
   ✅ Verificações aprovadas: 7/7
   ❌ Verificações falharam: 0/7
   📈 Taxa de sucesso: 100.0%

🎉 Todas as verificações passaram! A correção foi aplicada com sucesso.
```

## Verificação Manual

Você também pode verificar manualmente no SQL Editor:

```sql
-- Verificar contagem de usuários vs perfis
SELECT 
  'Total auth.users' as metric,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total profiles' as metric,
  COUNT(*) as count
FROM public.profiles;

-- Verificar se RLS está habilitado
SELECT 
  tablename,
  rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'slow_queries_monitor', 'audit_logs', 'rate_limits');

-- Verificar triggers
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

## Troubleshooting

### Erro: "relation does not exist"
- Execute primeiro a criação da tabela `profiles`
- Verifique se está no schema correto (`public`)

### Erro: "permission denied"
- Use a **Service Role Key** para executar os scripts
- Verifique se as variáveis de ambiente estão configuradas

### Erro: "function already exists"
- Os scripts usam `CREATE OR REPLACE` e `DROP IF EXISTS`
- Isso é normal e não causa problemas

### Views não funcionam
- Verifique se as tabelas base existem (`products`, `categories`)
- Execute a correção das views novamente

## Próximos Passos

1. **Execute a correção** usando um dos métodos acima
2. **Verifique o resultado** com o script de verificação
3. **Teste a autenticação** no seu aplicativo
4. **Monitore os logs** para garantir que tudo está funcionando

## Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Execute o script de verificação
3. Consulte a documentação do Supabase
4. Verifique as variáveis de ambiente

---

**Nota**: Este guia resolve todos os problemas de linting identificados e garante que a autenticação funcione corretamente com RLS adequado. 