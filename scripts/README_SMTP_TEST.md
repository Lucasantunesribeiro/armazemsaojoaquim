# 📧 Script de Teste SMTP - Guia de Uso

## 🎯 **Objetivo**

Este script testa a configuração SMTP do Supabase e diagnostica problemas comuns de email.

## 🚀 **Como Executar**

### **Opção 1: Via npm script (Recomendado)**
```bash
npm run test:smtp
```

### **Opção 2: Via npm script (Alternativo)**
```bash
npm run smtp:test
```

### **Opção 3: Diretamente**
```bash
node scripts/test-smtp-configuration.js
```

## 📋 **Pré-requisitos**

1. **Arquivo .env configurado** com:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_service_key_aqui (opcional)
   ```

2. **Dependências instaladas:**
   ```bash
   npm install
   ```

## 🧪 **O que o Script Testa**

### **TESTE 1: Conexão Supabase** 📡
- Verifica se as variáveis de ambiente estão configuradas
- Testa conectividade básica com Supabase
- Valida URLs e chaves de API

### **TESTE 2: Signup com Email** 📧
- Tenta criar um usuário de teste
- Verifica se email de confirmação é enviado
- Detecta problemas de SMTP

### **TESTE 3: Convite Admin** 🔐
- Testa envio via Admin API (se service key disponível)
- Verifica SMTP com privilégios elevados
- Identifica problemas de configuração

### **TESTE 4: Reset de Senha** 🔑
- Testa funcionalidade de reset de senha
- Envia email real (requer confirmação)
- Valida fluxo completo de recuperação

## 📊 **Interpretando os Resultados**

### **✅ Status: SUCESSO**
- SMTP configurado corretamente
- Emails sendo enviados
- Sistema funcionando

### **❌ Status: FALHA**
- SMTP não configurado ou com erro
- Credenciais incorretas
- Rate limit ativo

### **⚠️ Status: AVISO**
- Configuração parcial
- Alguns recursos indisponíveis
- Necessita atenção

## 🔍 **Problemas Comuns e Soluções**

### **Erro: "Variáveis de ambiente não configuradas"**
```
Solução:
1. Criar/verificar arquivo .env
2. Adicionar variáveis obrigatórias
3. Reiniciar o script
```

### **Erro: "Error sending confirmation email"**
```
Causa: SMTP não configurado ou inválido
Solução:
1. Configurar SMTP no Dashboard Supabase
2. Verificar credenciais do provedor
3. Seguir guia: docs/CONFIGURACAO_SMTP_GMAIL_SUPABASE.md
```

### **Erro: "Rate limit exceeded"**
```
Causa: Muitas tentativas de teste
Solução:
1. Aguardar 1-2 horas
2. Usar email diferente
3. Configurar SMTP customizado
```

### **Erro: "Connection failed"**
```
Causa: Problemas de rede ou URL incorreta
Solução:
1. Verificar internet
2. Validar NEXT_PUBLIC_SUPABASE_URL
3. Verificar status do Supabase
```

## 📈 **Relatório Final**

O script gera um relatório final com:

- ✅ **Status de cada teste**
- 🔍 **Diagnóstico dos problemas**
- 💡 **Soluções recomendadas**
- 📋 **Próximos passos**

## 🛠️ **Configuração Após os Testes**

### **Se SMTP não estiver funcionando:**

1. **Acesse Dashboard Supabase:**
   ```
   https://supabase.com/dashboard/project/enolssforaepnrpfrima/auth/settings
   ```

2. **Configure SMTP (Resend recomendado):**
   ```
   Host: smtp.resend.com
   Port: 587
   User: resend
   Pass: [SUA_API_KEY_RESEND]
   ```

3. **Teste novamente:**
   ```bash
   npm run test:smtp
   ```

## 📞 **Suporte**

### **Se encontrar problemas:**

1. **Execute o script** para obter diagnóstico
2. **Consulte a documentação:** `docs/CONFIGURACAO_SMTP_GMAIL_SUPABASE.md`
3. **Verifique logs:** Dashboard Supabase > Logs > Auth

### **Comandos úteis:**
```bash
# Testar SMTP
npm run test:smtp

# Verificar configuração geral
npm run validate

# Testar APIs
npm run test:api
```

## 🎯 **Próximos Passos**

1. **Execute o teste:** `npm run test:smtp`
2. **Analise os resultados**
3. **Configure SMTP** se necessário
4. **Teste signup real** no site
5. **Monitore logs** por 24h

---

**💡 Dica:** Execute este script sempre que alterar configurações de SMTP para validar as mudanças! 