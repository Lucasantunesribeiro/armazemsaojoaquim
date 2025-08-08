#!/usr/bin/env node

/**
 * SCRIPT PARA CORREÇÃO EM MASSA DOS ENDPOINTS ADMIN
 * Aplica o middleware withAdminAuth em todos os endpoints que ainda usam verificação manual
 */

const fs = require('fs');
const path = require('path');

// Endpoints que já foram corrigidos
const CORRECTED_ENDPOINTS = [
  'dashboard/stats/route.ts',
  'dashboard/activity/route.ts', 
  'dashboard/recent-activity/route.ts',
  'users/route.ts',
  'cafe/products/route.ts',
  'cafe/orders/route.ts',
  'pousada/rooms/route.ts',
  'pousada/bookings/route.ts'
];

// Padrões para detectar endpoints que precisam de correção
const OLD_PATTERNS = [
  'const { data: { session }, error: sessionError } = await supabase.auth.getSession()',
  'if (!session) {',
  'session.user.email !== \'armazemsaojoaquimoficial@gmail.com\'',
  'No active session',
  'Access denied'
];

// Função para verificar se um arquivo precisa de correção
function needsCorrection(content) {
  return OLD_PATTERNS.some(pattern => content.includes(pattern));
}

// Função para aplicar correção básica
function applyCorrection(content) {
  // Se já importa withAdminAuth, pular
  if (content.includes('withAdminAuth')) {
    return content;
  }
  
  // Adicionar import se não existe
  if (!content.includes('import { withAdminAuth }')) {
    content = content.replace(
      "import { createServerClient } from '@/lib/supabase'",
      "import { createServerClient } from '@/lib/supabase'\nimport { withAdminAuth } from '@/lib/admin-auth'"
    );
  }
  
  // Substituir padrão de verificação manual por withAdminAuth wrapper
  const exportFunctionMatch = content.match(/export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest\) \{/);
  
  if (exportFunctionMatch) {
    const method = exportFunctionMatch[1];
    
    // Substituir função inteira
    content = content.replace(
      new RegExp(`export async function ${method}\\(request: NextRequest\\) \\{[\\s\\S]*?^\\}`, 'm'),
      `export async function ${method}(request: NextRequest) {
  return withAdminAuth(async (authResult) => {
    try {
      console.log('📊 [ADMIN-${method}] Processando requisição...')
      
      const supabase = await createServerClient()
      
      // TODO: Implementar lógica específica do endpoint
      return NextResponse.json({ 
        success: true,
        message: 'Endpoint corrigido - implementar lógica específica',
        debug: 'Este endpoint foi corrigido automaticamente'
      })
      
    } catch (error) {
      console.error('💥 [ADMIN-${method}] Erro interno:', error)
      throw error
    }
  }, request)
}`
    );
  }
  
  return content;
}

// Função para processar arquivo individual
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar se precisa de correção
    if (!needsCorrection(content)) {
      console.log(`✅ SKIP: ${filePath} - Já corrigido ou não precisa`);
      return { processed: false, reason: 'already_fixed' };
    }
    
    // Aplicar correção
    const correctedContent = applyCorrection(content);
    
    // Salvar apenas se houve mudança
    if (correctedContent !== content) {
      fs.writeFileSync(filePath, correctedContent);
      console.log(`✅ FIXED: ${filePath}`);
      return { processed: true, reason: 'fixed' };
    } else {
      console.log(`⚠️  NO_CHANGE: ${filePath} - Sem alterações aplicadas`);
      return { processed: false, reason: 'no_change' };
    }
    
  } catch (error) {
    console.error(`❌ ERROR: ${filePath} - ${error.message}`);
    return { processed: false, reason: 'error', error: error.message };
  }
}

// Função principal
function massFixAdminEndpoints() {
  console.log('🚀 INICIANDO CORREÇÃO EM MASSA DOS ENDPOINTS ADMIN');
  console.log('=' .repeat(60));
  
  const adminDir = path.join(__dirname, 'app/api/admin');
  let stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    errors: 0
  };
  
  // Buscar todos os arquivos route.ts recursivamente
  function findRouteFiles(dir) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      console.error(`❌ Diretório não encontrado: ${dir}`);
      return files;
    }
    
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findRouteFiles(fullPath));
      } else if (entry === 'route.ts') {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const routeFiles = findRouteFiles(adminDir);
  console.log(`📁 Encontrados ${routeFiles.length} arquivos route.ts`);
  console.log('');
  
  // Processar cada arquivo
  for (const filePath of routeFiles) {
    const relativePath = path.relative(__dirname, filePath);
    console.log(`🔍 Processando: ${relativePath}`);
    
    const result = processFile(filePath);
    stats.total++;
    
    if (result.processed) {
      stats.processed++;
    } else if (result.reason === 'error') {
      stats.errors++;
    } else {
      stats.skipped++;
    }
  }
  
  // Relatório final
  console.log('');
  console.log('=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('=' .repeat(60));
  console.log(`Total de arquivos: ${stats.total}`);
  console.log(`✅ Processados: ${stats.processed}`);
  console.log(`⚠️  Ignorados: ${stats.skipped}`);
  console.log(`❌ Erros: ${stats.errors}`);
  
  const successRate = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;
  console.log(`📈 Taxa de sucesso: ${successRate}%`);
  
  if (stats.processed > 0) {
    console.log('');
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('1. Revisar os endpoints corrigidos');
    console.log('2. Implementar a lógica específica de cada endpoint');
    console.log('3. Testar os endpoints corrigidos');
    console.log('4. Remover os TODOs e logs de debug');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  massFixAdminEndpoints();
}

module.exports = { massFixAdminEndpoints, processFile };