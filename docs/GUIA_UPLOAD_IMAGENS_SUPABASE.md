# 📤 Guia de Upload de Imagens - Supabase Storage

## 🎯 **Objetivo**
Fazer upload das 4 imagens disponíveis localmente para o Supabase Storage, reduzindo de 22 para 18 imagens faltantes.

## 📊 **Status Atual**
- ✅ **Imagens funcionais**: 27/49 (55%)
- 🔄 **Disponíveis para upload**: 4/49 (8%)
- ❌ **Faltantes**: 18/49 (37%)

## 🚀 **Imagens Prontas para Upload**

### 1. **caesar_salad_com_fatias_de_frango.png**
- **Arquivo local**: `caesar_salad_com_frango.png`
- **Tamanho**: 1.6MB
- **Ação**: Upload e renomear para `caesar_salad_com_fatias_de_frango.png`

### 2. **caesar_salad_sem_fatias_de_frango.png**
- **Arquivo local**: `caesar_salad_sem_frango.png`
- **Tamanho**: 1.7MB
- **Ação**: Upload e renomear para `caesar_salad_sem_fatias_de_frango.png`

### 3. **picanha_ao_carvao_2_pessoas.png**
- **Arquivo local**: `picanha_ao_carvao.png`
- **Tamanho**: 1.8MB
- **Ação**: Upload e renomear para `picanha_ao_carvao_2_pessoas.png`

### 4. **saladinha_da_casa.png**
- **Arquivo local**: `salada_da_casa.png`
- **Tamanho**: 1.6MB
- **Ação**: Upload e renomear para `saladinha_da_casa.png`

## 📋 **Passo a Passo - Upload Manual**

### **Método 1: Supabase Dashboard (Recomendado)**

1. **Acesse o Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/enolssforaepnrpfrima
   ```

2. **Navegue para Storage**
   - Clique em "Storage" no menu lateral
   - Selecione o bucket "menu-images"

3. **Upload das Imagens**
   
   **Para cada imagem:**
   - Clique em "Upload file"
   - Selecione o arquivo local (ex: `caesar_salad_com_frango.png`)
   - **IMPORTANTE**: Renomeie para o nome correto antes de confirmar
   - Confirme o upload

4. **Verificação**
   - Execute: `node scripts/check-all-menu-images.js`
   - Confirme que as 4 imagens agora aparecem como "✅ EXISTENTES"

### **Método 2: Supabase CLI (Alternativo)**

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Upload das imagens
supabase storage upload menu-images/caesar_salad_com_fatias_de_frango.png public/images/menu_images/caesar_salad_com_frango.png
supabase storage upload menu-images/caesar_salad_sem_fatias_de_frango.png public/images/menu_images/caesar_salad_sem_frango.png
supabase storage upload menu-images/picanha_ao_carvao_2_pessoas.png public/images/menu_images/picanha_ao_carvao.png
supabase storage upload menu-images/saladinha_da_casa.png public/images/menu_images/salada_da_casa.png
```

## 🔍 **Verificação Pós-Upload**

Execute o script de verificação:
```bash
node scripts/check-all-menu-images.js
```

**Resultado esperado:**
- ✅ Imagens existentes: **31/49** (era 27/49)
- ❌ Imagens faltantes: **18/49** (era 22/49)
- 📈 Taxa de sucesso: **63%** (era 55%)

## 📝 **Imagens Restantes (18 faltantes)**

Após o upload das 4 disponíveis, ainda faltarão:

### **Carnes e Pratos Principais (6 itens)**
1. `marquise_au_chocolat.png`
2. `linguica_na_brasa.png`
3. `sobrecoxa_ao_carvao_1_pessoa.png`
4. `hamburguer_vegetariano.png`
5. `bife_a_milanesa.png`
6. `mix_vegetariano.png`

### **Aperitivos e Acompanhamentos (7 itens)**
7. `vinagrete_de_polvo.png`
8. `patatas_brava.png`
9. `legumes_na_brasa.png`
10. `envelopado_de_acelga.png`
11. `farofa.png`
12. `pasteis_de_pupunha.png`
13. `patatas_bravas.png`

### **Feijoadas e Pratos Especiais (4 itens)**
14. `feijoada_da_casa_individual.png`
15. `feijoada_da_casa_para_dois.png`
16. `feijoada_da_casa_buffet.png`
17. `ceviche_carioca.png`

### **Acompanhamentos (1 item)**
18. `pure_de_batata.png`

## ⚡ **Impacto Esperado**

Após o upload das 4 imagens disponíveis:
- **Redução de 18% nos erros 400** (de 22 para 18)
- **Melhoria na experiência do usuário** para 4 itens do menu
- **Aumento da taxa de sucesso** de 55% para 63%

## 🎉 **Próximos Passos**

1. **Executar o upload das 4 imagens disponíveis**
2. **Verificar funcionamento** com o script de teste
3. **Obter/criar as 18 imagens restantes**
4. **Atingir 100% de funcionalidade** das imagens do menu

---

## 📞 **Suporte**

Se encontrar problemas durante o upload:
1. Verifique as permissões do bucket `menu-images`
2. Confirme que o projeto Supabase está ativo
3. Execute `node scripts/check-all-menu-images.js` para diagnóstico 