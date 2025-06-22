# 📋 Lista de Imagens Faltantes - Supabase Storage

## 🎯 **Status Atualizado (Dezembro 2024)**

### ✅ **Imagens Funcionais**: 27/49 (55%)
### 🔄 **Disponíveis para Upload**: 4/49 (8%) 
### ❌ **Não Disponíveis**: 18/49 (37%)

---

## 🔄 **IMAGENS DISPONÍVEIS PARA UPLOAD IMEDIATO**

### **Saladas (2 itens)**
1. ✅ `caesar_salad_com_fatias_de_frango.png` → `caesar_salad_com_frango.png` (1.6MB)
2. ✅ `caesar_salad_sem_fatias_de_frango.png` → `caesar_salad_sem_frango.png` (1.7MB)

### **Carnes Principais (1 item)**
3. ✅ `picanha_ao_carvao_2_pessoas.png` → `picanha_ao_carvao.png` (1.8MB)

### **Saladas (1 item)**
4. ✅ `saladinha_da_casa.png` → `salada_da_casa.png` (1.6MB)

---

## ❌ **IMAGENS NÃO DISPONÍVEIS LOCALMENTE (18 itens)**

### **🥩 Carnes e Pratos Principais (5 itens)**
1. `linguica_na_brasa.png`
2. `sobrecoxa_ao_carvao_1_pessoa.png`
3. `hamburguer_vegetariano.png`
4. `bife_a_milanesa.png`
5. `mix_vegetariano.png`

### **🍰 Sobremesas (1 item)**
6. `marquise_au_chocolat.png`

### **🥗 Aperitivos e Petiscos (7 itens)**
7. `vinagrete_de_polvo.png`
8. `patatas_brava.png`
9. `patatas_bravas.png` *(verificar se são diferentes)*
10. `legumes_na_brasa.png`
11. `envelopado_de_acelga.png`
12. `pasteis_de_pupunha.png`
13. `ceviche_carioca.png`

### **🍽️ Acompanhamentos (2 itens)**
14. `farofa.png`
15. `pure_de_batata.png`

### **🍲 Feijoadas Especiais (3 itens)**
16. `feijoada_da_casa_individual.png`
17. `feijoada_da_casa_para_dois.png`
18. `feijoada_da_casa_buffet.png`

---

## 📊 **IMPACTO DO UPLOAD DAS 4 DISPONÍVEIS**

**Situação Atual:**
- ✅ Funcionais: 27/49 (55%)
- ❌ Com erro 400: 22/49 (45%)

**Após Upload:**
- ✅ Funcionais: 31/49 (63%) ⬆️ +8%
- ❌ Com erro 400: 18/49 (37%) ⬇️ -8%

---

## 🚀 **AÇÕES RECOMENDADAS**

### **Fase 1: Upload Imediato (4 imagens)**
```bash
# Execute para ver instruções detalhadas
node scripts/upload-available-images.js
```

**Guia detalhado**: `docs/GUIA_UPLOAD_IMAGENS_SUPABASE.md`

### **Fase 2: Obtenção das 18 Restantes**
1. **Fotografar pratos reais** do restaurante
2. **Contratar designer** para criar imagens dos pratos
3. **Usar imagens de banco de dados** (com licença apropriada)
4. **Gerar com IA** (Midjourney, DALL-E, etc.)

---

## 🔧 **Scripts de Verificação**

```bash
# Verificar status atual
node scripts/check-all-menu-images.js

# Analisar imagens disponíveis localmente  
node scripts/upload-available-images.js

# Verificar após uploads
node scripts/test-final-corrections.js
```

---

## 📈 **Metas de Progresso**

- [x] **55%** - Situação atual (27 imagens)
- [ ] **63%** - Após upload das 4 disponíveis (31 imagens)
- [ ] **75%** - Meta intermediária (37 imagens)
- [ ] **100%** - Meta final (49 imagens)

---

## 💡 **Observações Importantes**

1. **Nomes alternativos**: Algumas imagens locais têm nomes ligeiramente diferentes
2. **Duplicatas possíveis**: `patatas_brava.png` vs `patatas_bravas.png`
3. **Prioridade**: Focar primeiro nas 4 disponíveis para ganho rápido
4. **Fallback funcionando**: Sistema usa placeholder.svg para imagens ausentes

---

## 📞 **Referências**

- **Bucket Supabase**: `menu-images`
- **URL Base**: `https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/`
- **Diretório Local**: `public/images/menu_images/` 