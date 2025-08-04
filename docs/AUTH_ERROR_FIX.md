# Correção de Erro de Autenticação

## Problema Identificado

Você está enfrentando o erro:
```
AuthApiError: Database error granting user
```

Este erro indica que há um problema com a configuração de autenticação no Supabase, especificamente com:
- Usuário sem perfil correspondente
- Problemas com RLS (Row Level Security)
- Triggers de autenticação não funcionando
- Políticas de segurança inadequadas

## Soluções Disponíveis

### Opção 1: Correção Rápida (Recomendada)

Execute o script de correção rápida:

```bash
node scripts/quick-auth-fix.js
```

Este script irá:
- ✅ Verificar se o usuário existe
- ✅ Criar perfil se não existir
- ✅ Configurar role como admin
- ✅ Habilitar RLS
- ✅ Criar políticas RLS
- ✅ Verificar/criar triggers

### Opção 2: Diagnóstico Completo

Execute o diagnóstico completo:

```bash
node scripts/diagnose-auth-error.js
```

Este script irá:
- 🔍 Diagnosticar todos os problemas
- 🔧 Aplicar correções automáticas
- 🧪 Testar o login após correção

### Opção 3: SQL Manual

Execute o script SQL no Supabase SQL Editor:

1. Acesse o Dashboard do Supabase
2. Vá para **SQL Editor**
3. Cole o conteúdo de `scripts/fix-auth-error.sql`
4. Execute o script

## Verificação Manual

Após aplicar a correção, verifique:

### 1. Verificar se o usuário existe
```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'armazemsaojoaquimoficial@gmail.com';
```

### 2. Verificar se o perfil existe
```sql
SELECT * FROM public.profiles 
WHERE email = 'armazemsaojoaquimoficial@gmail.com';
```

### 3. Verificar RLS
```sql
SELECT tablename, rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
```

### 4. Verificar políticas RLS
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### 5. Verificar triggers
```sql
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

## Resultado Esperado

Após a correção, você deve ver:

```
✅ Usuário encontrado: armazemsaojoaquimoficial@gmail.com
✅ Perfil encontrado: armazemsaojoaquimoficial@gmail.com (Role: admin)
✅ RLS habilitado
✅ Políticas RLS criadas
✅ Trigger criado
✅ Correção concluída com sucesso!
```

## Troubleshooting

### Erro: "User not found"
- Verifique se o email está correto
- Confirme se o usuário foi criado no Supabase Auth

### Erro: "Permission denied"
- Use a **Service Role Key** para executar os scripts
- Verifique se as variáveis de ambiente estão configuradas

### Erro: "RLS policy violation"
- Verifique se as políticas RLS estão corretas
- Confirme se o usuário tem role adequado

### Erro: "Trigger not found"
- Execute a criação do trigger novamente
- Verifique se a função `handle_new_user` existe

## Próximos Passos

1. **Execute a correção** usando um dos métodos acima
2. **Teste o login** no seu aplicativo
3. **Verifique os logs** para confirmar que não há mais erros
4. **Monitore** o comportamento da autenticação

## Verificação Final

Após a correção, teste o login:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'armazemsaojoaquimoficial@gmail.com',
  password: 'sua-senha'
});

if (error) {
  console.error('Erro de login:', error.message);
} else {
  console.log('Login bem-sucedido:', data.user.email);
}
```

## Suporte

Se o problema persistir:

1. **Verifique os logs** do Supabase
2. **Execute o diagnóstico** completo
3. **Consulte a documentação** do Supabase Auth
4. **Verifique as configurações** de RLS

---

**Nota**: Este guia resolve especificamente o erro "Database error granting user" e garante que a autenticação funcione corretamente. 