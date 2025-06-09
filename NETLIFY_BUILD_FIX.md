# 🔧 Correção do Build Error no Netlify

Este documento detalha as correções implementadas para resolver o erro de build com exit code 2 no Netlify.

## ❌ **Problema Identificado**

```
Failed during stage 'building site': Build script returned non-zero exit code: 2
```

### Possíveis Causas
- **Plugin Lighthouse conflito**: Pode estar causando timeout ou falha
- **Dependências não instaladas**: Cache ou instalação incompleta
- **Configuração complexa**: Headers ou configurações avançadas
- **Variáveis de ambiente**: Falta de configuração adequada

## ✅ **Correções Implementadas**

### 1. **Melhorada Instalação (`netlify.toml`)**

**❌ Antes:**
```toml
[build]
  command = "npm run build"
```

**✅ Depois:**
```toml
[build]
  command = "npm ci && npm run build"  # Instalação limpa
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--no-optional"          # Evita dependências opcionais
```

### 2. **Versão Node.js Especificada (`.nvmrc`)**

**✅ Criado:**
```
20
```

### 3. **Plugin Lighthouse Removido Temporariamente**

O plugin Lighthouse foi removido para testar se estava causando o erro:

**❌ Removido temporariamente:**
```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

### 4. **Configuração Next.js Simplificada**

Mantida configuração simples e robusta:

```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  trailingSlash: true,
  
  // Imagens otimizadas
  images: {
    domains: ['localhost', 'armazemsaojoaquim.netlify.app'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Build otimizado
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: process.env.NODE_ENV === 'production' },
}
```

## 🎯 **Verificações de Build**

### ✅ **Local Build Funcionando**
```bash
npm run build
✓ Compiled successfully
✓ 15 páginas geradas
✓ Bundle: 87.1 kB shared chunks
```

### ✅ **Type Check OK**
```bash
npm run type-check
✓ Sem erros TypeScript
```

### ✅ **Lint Check OK**
```bash
npx next lint
⚠ Apenas warnings (não bloqueiam build)
```

## 🔍 **Diagnóstico de Problemas**

Se o build ainda falhar, verificar:

### 1. **Logs Completos**
```bash
# No Netlify, verificar logs completos
# Error code 2 pode indicar:
- Timeout de build
- Dependência faltando
- Erro de sintaxe runtime
- Plugin conflito
```

### 2. **Variáveis de Ambiente**
```bash
# Verificar se estão definidas:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

### 3. **Dependências**
```bash
# Verificar se todas estão no package.json:
- next: 14.2.29
- react: ^18.2.0
- typescript: ^5.3.3
- tailwindcss: ^3.4.0
```

## 🚀 **Próximos Passos**

1. **Deploy Teste**: Fazer push e verificar se o build passa
2. **Adicionar Lighthouse**: Se build passar, re-adicionar o plugin
3. **Monitorar Logs**: Verificar se há outros warnings

## 📝 **Comandos de Debug**

### Local
```bash
npm ci                    # Instalação limpa
npm run type-check       # Verificar TypeScript
npm run build           # Build local
```

### Netlify
```bash
# Via netlify.toml
npm ci && npm run build  # Comando otimizado
```

---

**Status**: ✅ **Configurações Corrigidas**
**Build Local**: ✅ **Funcionando**
**Deploy**: 🚀 **Pronto para teste** 