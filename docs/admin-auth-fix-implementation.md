# Correções de Autenticação Admin - Implementação

## Problema Identificado

O sistema de autenticação admin estava enfrentando loops recursivos que causavam erros de "infinite recursion". Os principais problemas eram:

1. **Middleware recursivo**: A função `ensureAdminProfile()` era chamada a cada requisição do middleware
2. **Gatilho problemático**: O trigger `trigger_prevent_unauthorized_role_change` causava loops ao tentar ler a tabela `profiles` durante updates
3. **Políticas RLS complexas**: Políticas que tentavam verificar roles durante suas próprias execuções
4. **Recuperação de erro agressiva**: Sistema de recuperação que tentava criar perfis automaticamente

## Soluções Implementadas

### 1. Middleware Simplificado

**Arquivo**: `middleware.ts`

- ✅ **Removida** chamada `ensureAdminProfile(session.user)` 
- ✅ **Removida** lógica de recuperação de erro `recoverFromAuthError()`
- ✅ **Simplificada** verificação para usar apenas `verifyAdminStatus()`

```typescript
// ANTES (problemático)
await ensureAdminProfile(session.user)
if (!adminResult.isAdmin && adminResult.error) {
  adminResult = await recoverFromAuthError(AuthErrorType.RLS_ERROR, session.user)
}

// DEPOIS (seguro)
const adminResult = await verifyAdminStatus(session.user)
```

### 2. Nova Migração SQL

**Arquivo**: `supabase/migrations/20250131_fix_recursive_admin_auth.sql`

#### Funções Seguras Criadas:

```sql
-- Função segura para verificar admin (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION check_admin_role(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar por email
CREATE OR REPLACE FUNCTION check_admin_by_email(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_email = 'armazemsaojoaquimoficial@gmail.com' THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE email = user_email AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Gatilho Problemático Removido:

```sql
-- Remove o gatilho que causava recursão
DROP TRIGGER IF EXISTS trigger_prevent_unauthorized_role_change ON profiles;
DROP FUNCTION IF EXISTS prevent_unauthorized_role_change();
```

#### Políticas RLS Simplificadas:

```sql
-- Políticas simples e não-recursivas
CREATE POLICY "profiles_select_own" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles
FOR SELECT USING (check_admin_role());

CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND (
    OLD.role = NEW.role OR check_admin_role()
  )
);
```

### 3. Sistema de Verificação Admin Atualizado

**Arquivo**: `lib/auth/admin-verification.ts`

- ✅ **Removida** função `ensureAdminProfile()` que causava loops
- ✅ **Adicionada** função `checkAdminCredentials()` para verificação simples
- ✅ **Atualizada** `verifyAdminStatus()` para usar RPC function segura

```typescript
// Nova abordagem usando RPC function
const { data: isAdminResult, error: rpcError } = await supabase
  .rpc('check_admin_role', { user_id: userId })
```

### 4. Recuperação de Erro Simplificada

**Arquivo**: `lib/auth/error-recovery.ts`

- ✅ **Removidas** tentativas de criar perfis automaticamente
- ✅ **Simplificadas** estratégias para usar apenas verificação por email
- ✅ **Eliminados** loops de retry que causavam problemas

```typescript
// ANTES (problemático)
await ensureAdminProfile(user)
const result = await verifyAdminStatus(user)

// DEPOIS (seguro)
const isAdmin = checkAdminCredentials(user.email || '')
return { isAdmin, method: 'email_fallback' }
```

## Arquivos Modificados

### Principais
- `middleware.ts` - Removida lógica recursiva
- `lib/auth/admin-verification.ts` - Sistema simplificado
- `lib/auth/error-recovery.ts` - Estratégias não-recursivas
- `lib/auth/enhanced-login.ts` - Removida criação automática de perfil
- `lib/auth/index.ts` - Exports atualizados

### Migração
- `supabase/migrations/20250131_fix_recursive_admin_auth.sql` - Correções de banco

### Scripts e Documentação
- `scripts/apply-admin-auth-fix.js` - Script de aplicação
- `docs/admin-auth-fix-implementation.md` - Esta documentação

## Como Aplicar as Correções

### Opção 1: Script Automático
```bash
node scripts/apply-admin-auth-fix.js
```

### Opção 2: Manual
```bash
# Aplicar migração
supabase db push

# Ou executar SQL diretamente no banco
# Copie o conteúdo de supabase/migrations/20250131_fix_recursive_admin_auth.sql
```

### Opção 3: Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo da migração
4. Execute

## Verificação das Correções

### 1. Verificar Funções Criadas
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('check_admin_role', 'check_admin_by_email');
```

### 2. Verificar Políticas RLS
```sql
SELECT policyname, tablename 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### 3. Verificar Gatilho Removido
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_prevent_unauthorized_role_change';
-- Deve retornar vazio
```

## Benefícios das Correções

### ✅ Performance
- Eliminação de loops recursivos
- Menos consultas ao banco de dados
- Cache mais eficiente

### ✅ Estabilidade
- Sem mais erros "infinite recursion"
- Sistema de fallback robusto
- Verificações apenas por leitura

### ✅ Segurança
- RLS ainda funcional
- Verificações de admin mantidas
- Funções com SECURITY DEFINER

### ✅ Manutenibilidade
- Código mais simples
- Menos pontos de falha
- Lógica mais clara

## Monitoramento Pós-Implementação

### Logs a Observar
- ✅ Ausência de erros "infinite recursion"
- ✅ Logs de verificação admin com métodos: `email`, `cache`, `rpc_function`
- ✅ Tempos de resposta melhorados no middleware

### Métricas de Sucesso
- Zero erros de recursão nos logs
- Acesso admin funcionando normalmente
- Performance do middleware melhorada
- Cache de admin funcionando corretamente

## Rollback (Se Necessário)

Em caso de problemas, as correções podem ser revertidas:

1. **Restaurar middleware anterior** (manter backup)
2. **Remover nova migração** do histórico
3. **Restaurar funções originais** se necessário

Porém, recomenda-se manter as correções pois elas resolvem problemas fundamentais do sistema.
