const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPANDO CACHE E CORRIGINDO LOGO...\n');

// Função para deletar diretório recursivamente
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    return true;
  }
  return false;
}

// Limpar cache do Next.js
const nextFolder = path.join(process.cwd(), '.next');
if (deleteFolderRecursive(nextFolder)) {
  console.log('✅ Cache do Next.js limpo (.next deletado)');
} else {
  console.log('⚠️  Pasta .next não encontrada');
}

// Limpar node_modules/.cache se existir
const cacheFolder = path.join(process.cwd(), 'node_modules/.cache');
if (deleteFolderRecursive(cacheFolder)) {
  console.log('✅ Cache de node_modules limpo');
} else {
  console.log('⚠️  Cache de node_modules não encontrado');
}

console.log('\n🔧 PRÓXIMAS ETAPAS:');
console.log('1. Execute: npm run dev');
console.log('2. Verifique o console do navegador para erros');
console.log('3. Teste Ctrl+F5 para forçar reload sem cache');
console.log('4. Se ainda não funcionar, teste: npm run build && npm run start');

console.log('\n✨ Limpeza concluída!');