# Configuração das Variáveis de Ambiente

## Problema

Os scripts estão falhando porque as variáveis de ambiente não estão configuradas:

```
❌ Variáveis de ambiente necessárias não encontradas
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
```

## Solução

### 1. Obter as Credenciais do Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings > API**
4. Copie as seguintes informações:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

### 2. Configurar as Variáveis de Ambiente

#### Opção A: Arquivo .env (Recomendado)

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as seguintes linhas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://enolssforaepnrpfrima.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

3. Instale o dotenv se necessário:
```bash
npm install dotenv
```

4. Execute o script:
```bash
node scripts/simple-auth-fix.js
```

#### Opção B: Variáveis de Ambiente do Sistema

No Windows (PowerShell):
```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://enolssforaepnrpfrima.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"
node scripts/simple-auth-fix.js
```

No Linux/Mac:
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://enolssforaepnrpfrima.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"
node scripts/simple-auth-fix.js
```

### 3. Verificar a Configuração

Para verificar se as variáveis estão configuradas corretamente:

```bash
node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL); console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'Não configurada');"
```

## Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env` no Git
- Adicione `.env` ao `.gitignore`
- A Service Role Key tem privilégios elevados, mantenha-a segura

## Próximos Passos

Após configurar as variáveis de ambiente:

1. Execute o script de correção:
```bash
node scripts/simple-auth-fix.js
```

2. Se ainda houver problemas, execute o SQL manualmente:
   - Acesse o Supabase Dashboard
   - Vá para SQL Editor
   - Execute o conteúdo de `scripts/fix-auth-error.sql`

## Troubleshooting

### Erro: "Invalid API key"
- Verifique se a Service Role Key está correta
- Certifique-se de que está usando a Service Role Key, não a anon key

### Erro: "Project not found"
- Verifique se a URL do projeto está correta
- Confirme se o projeto existe e está ativo

### Erro: "Permission denied"
- Verifique se a Service Role Key tem permissões adequadas
- Certifique-se de que está usando a Service Role Key, não a anon key 