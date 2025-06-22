# 🖼️ Solução: Imagens do Menu Não Carregando

## 🚨 **Problema Identificado**
- **55% das imagens (27 de 49)** estão funcionando no Supabase Storage
- **45% das imagens (22 de 49)** retornam erro 400 (não existem no bucket)
- O sistema de fallback com SVGs está funcionando corretamente

## ✅ **Solução Rápida - 3 Passos**

### **1. Upload das 4 Imagens Disponíveis**
Existem 4 imagens prontas no diretório local que precisam ser enviadas:

```bash
public/images/menu_images/caesar_salad_com_frango.png (1.6MB)
public/images/menu_images/caesar_salad_sem_frango.png (1.7MB)  
public/images/menu_images/picanha_ao_carvao.png (1.8MB)
public/images/menu_images/salada_da_casa.png (1.6MB)
```

**Como fazer o upload:**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **Storage → Buckets → menu-images**
3. Faça upload das 4 imagens acima

### **2. Corrigir URLs no Banco de Dados**
Execute estas queries SQL no Supabase para corrigir nomes incorretos:

```sql
-- Corrigir imagens com nomes diferentes
UPDATE menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caesar_salad_com_frango.png'
WHERE name = 'Caesar Salad com Fatias de Frango';

UPDATE menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caesar_salad_sem_frango.png'
WHERE name = 'Caesar Salad sem Fatias de Frango';

UPDATE menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/picanha_ao_carvao.png'
WHERE name = 'Picanha ao Carvão (2 pessoas)';

UPDATE menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/salada_da_casa.png'
WHERE name = 'Saladinha da Casa';

-- Corrigir URL do arroz (tem barra dupla)
UPDATE menu_items 
SET image_url = 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/arroz.png'
WHERE name = 'Arroz';
```

### **3. Verificar Resultado**
Após fazer o upload e executar o SQL:

```bash
# Verificar novamente o status
node scripts/check-all-menu-images.js
```

**Resultado esperado:** De 55% → 63% de imagens funcionando

## 📋 **Imagens que Ainda Precisam Ser Criadas (18)**

### **Pratos Principais**
- bife_a_milanesa.png
- sobrecoxa_ao_carvao.png  
- mix_vegetariano.png
- hamburguer_vegetariano.png

### **Petiscos**
- linguica_na_brasa.png
- vinagrete_de_polvo.png
- patatas_brava.png
- pasteis_de_pupunha.png
- envelopado_de_acelga.png

### **Feijoadas**
- feijoada_da_casa_individual.png
- feijoada_da_casa_para_dois.png
- feijoada_da_casa_buffet.png

### **Outros**
- ceviche_carioca.png
- marquise_au_chocolat.png
- farofa.png
- pure_de_batata.png
- legumes_na_brasa.png
- patatas_bravas.png

## 🎯 **Importante**
- O sistema de **fallback com SVGs está funcionando** perfeitamente
- As imagens faltantes mostram um **placeholder elegante** com o nome do prato
- O site está **100% funcional** mesmo sem todas as imagens
- As imagens podem ser adicionadas **incrementalmente** sem quebrar nada

## 🛠️ **Comandos Úteis**
```bash
# Verificar status das imagens
node scripts/check-all-menu-images.js

# Ver quais imagens podem ser enviadas
node scripts/upload-available-images.js

# Testar o sistema localmente
npm run dev
``` 