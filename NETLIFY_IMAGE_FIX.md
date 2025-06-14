# 🔧 Correção de Imagens no Netlify

## Problema Identificado
As imagens não estavam aparecendo no Netlify devido a problemas de:
1. **Otimização de imagem do Next.js** incompatível com static export
2. **Configuração de build** incorreta
3. **Assets não copiados** para o diretório de output

## ✅ Correções Implementadas

### 1. Configuração do Next.js (`next.config.js`)
```javascript
// Adicionado:
output: 'export',        // Para static export
trailingSlash: true,     // URLs compatíveis com hosting estático
distDir: 'out',          // Diretório de output
images: {
  unoptimized: true,     // CRUCIAL: desabilita otimização para Netlify
  // ...
}
```

### 2. Configuração do Netlify (`netlify.toml`)
```toml
[build]
  command = "npm run build:netlify"  # Script atualizado
  publish = "out"                    # Diretório correto
```

### 3. Novos Scripts (`package.json`)
```json
{
  "build": "next build && node scripts/copy-static-assets.js",
  "build:netlify": "next build && node scripts/copy-static-assets.js"
}
```

### 4. Script de Cópia de Assets (`scripts/copy-static-assets.js`)
- Copia **todos** os arquivos de `public/` para `out/`
- Garante que imagens sejam incluídas no build
- Verifica se a cópia foi bem-sucedida

### 5. Componentes de Imagem Compatíveis
- **`NetlifyImage`**: Componente otimizado para Netlify
- **`SimpleImage`**: Fallback simples e confiável

## 🚀 Passos para Deploy

1. **Fazer commit das alterações:**
   ```bash
   git add .
   git commit -m "fix: corrigir imagens no Netlify"
   git push
   ```

2. **No Netlify Dashboard:**
   - Verificar se Build Command é: `npm run build:netlify`
   - Verificar se Publish Directory é: `out`
   - Fazer redeploy se necessário

3. **Testar:**
   - Acessar `/test-images` no site para verificar se as imagens carregam
   - Verificar imagens na página principal

## 🔍 Debugging

### Se as imagens ainda não aparecerem:

1. **Verificar logs de build no Netlify:**
   - Procurar por erros na cópia de assets
   - Verificar se o diretório `out/images/` foi criado

2. **Testar localmente:**
   ```bash
   npm run build:netlify
   cd out
   python -m http.server 8000  # ou serve -s .
   ```

3. **Verificar paths:**
   - Todas as imagens devem usar paths absolutos: `/images/...`
   - Verificar se os arquivos existem em `out/images/`

## 📝 Componentes Atualizados

### HeroSection
- Alterado de `OptimizedImage` para `NetlifyImage`
- Removido `fill` prop (incompatível com static export)

### Outros componentes que usam imagens:
- Substituir `Next/Image` por `NetlifyImage` ou `SimpleImage`
- Usar `unoptimized: true` se continuar usando `Next/Image`

## ⚡ Performance

Apesar de `unoptimized: true`, as imagens ainda são otimizadas:
- **WebP e AVIF** disponíveis no diretório `public/images/`
- **Lazy loading** implementado nos componentes
- **Caching** configurado no Netlify

## 🔄 Rollback (se necessário)

Para voltar à configuração anterior:
1. Remover `output: 'export'` do `next.config.js`
2. Alterar `publish` de volta para `.next` no `netlify.toml`
3. Usar `npm run build` normal

---

## 📞 Status de Correção

- ✅ Next.js configurado para static export
- ✅ Netlify configurado para usar `out/`
- ✅ Script de cópia de assets criado
- ✅ Componentes de imagem atualizados
- ✅ Página de teste criada (`/test-images`)
- ⏳ **Pendente**: Deploy e teste no Netlify

**Próximo passo:** Fazer push e redeploy no Netlify! 