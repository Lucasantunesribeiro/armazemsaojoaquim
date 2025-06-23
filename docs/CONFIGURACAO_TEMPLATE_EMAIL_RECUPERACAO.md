# Configuração do Template de Email de Recuperação de Senha

## Problema Identificado

O erro `otp_expired` indica que o link de redefinição de senha está expirando ou não está sendo processado corretamente. Implementamos as seguintes soluções:

## Soluções Implementadas

### 1. Callback de Autenticação Melhorado

**Arquivo:** `app/auth/callback/page.tsx`

- ✅ Tratamento específico para `type=recovery`
- ✅ Redirecionamento para página dedicada de reset de senha
- ✅ Mensagens de erro personalizadas para links expirados

### 2. Página Dedicada para Reset de Senha

**Arquivo:** `app/auth/reset-password/page.tsx`

- ✅ Interface dedicada para redefinição de senha
- ✅ Validação de sessão ativa
- ✅ Formulário seguro com confirmação de senha
- ✅ Feedback visual e de segurança

### 3. Template de Email Personalizado

**Arquivo:** `supabase/email-templates/password-recovery.html`

- ✅ Design premium com branding do Armazém São Joaquim
- ✅ Avisos claros sobre expiração (60 minutos)
- ✅ Instruções detalhadas para o usuário
- ✅ Responsivo para mobile

## Como Configurar no Supabase

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto "Armazém São Joaquim"

### Passo 2: Configurar o Template de Email

1. No dashboard, vá em **Authentication** → **Email Templates**
2. Selecione **Reset Password**
3. Cole o conteúdo do arquivo `supabase/email-templates/password-recovery.html`
4. Clique em **Save**

### Passo 3: Configurar URLs de Redirecionamento

1. Vá em **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL:** `https://armazemsaojoaquim.netlify.app`
   - **Redirect URLs:** 
     - `https://armazemsaojoaquim.netlify.app/auth/callback`
     - `https://armazemsaojoaquim.netlify.app/auth/reset-password`

### Passo 4: Verificar Configurações de SMTP

1. Vá em **Authentication** → **Settings**
2. Verifique se o SMTP está configurado corretamente
3. Teste o envio de email

## Fluxo de Recuperação de Senha

### 1. Usuário Solicita Reset
```
Usuário clica em "Esqueci minha senha" → 
Insere email → 
Sistema envia email com template personalizado
```

### 2. Processamento do Link
```
Usuário clica no link do email → 
Callback processa type=recovery → 
Redireciona para /auth/reset-password
```

### 3. Redefinição da Senha
```
Usuário define nova senha → 
Sistema valida e atualiza → 
Redireciona para página principal
```

## Tratamento de Erros

### Links Expirados
- ✅ Detecção automática de `otp_expired`
- ✅ Redirecionamento para formulário de nova solicitação
- ✅ Mensagem explicativa para o usuário

### Sessão Inválida
- ✅ Verificação de sessão ativa na página de reset
- ✅ Redirecionamento automático para login se inválida

### Erros de Validação
- ✅ Validação em tempo real dos campos
- ✅ Mensagens de erro específicas
- ✅ Feedback visual para o usuário

## URLs Importantes

- **Login:** `/auth`
- **Callback:** `/auth/callback`
- **Reset Password:** `/auth/reset-password`
- **Site Principal:** `/`

## Variáveis de Template

O template utiliza as seguintes variáveis do Supabase:

- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .User.UserMetadata.name }}` - Nome do usuário (opcional)

## Testes

### Para testar o fluxo:

1. Acesse `/auth`
2. Clique em "Esqueci minha senha"
3. Insira um email válido
4. Verifique o email recebido
5. Clique no link do email
6. Defina uma nova senha

### Verificações de Segurança:

- ✅ Link expira em 60 minutos
- ✅ Validação de sessão ativa
- ✅ HTTPS obrigatório
- ✅ Validação de senha forte

## Logs e Monitoramento

Para verificar problemas:

1. **Console do Browser:** Erros de JavaScript
2. **Network Tab:** Requisições de API
3. **Supabase Logs:** Erros de autenticação
4. **Netlify Logs:** Erros de deployment

## Próximos Passos

1. ✅ Implementar todas as correções
2. ⏳ Testar em produção
3. ⏳ Monitorar logs de erro
4. ⏳ Ajustar conforme necessário

---

**Nota:** Após implementar essas correções, o sistema de recuperação de senha deve funcionar corretamente, eliminando os erros de `otp_expired`. 