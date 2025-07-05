#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { createClient } = require('@supabase/supabase-js')

// Configurações
const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  backup: {
    directory: './backups',
    retention: 30, // dias
    compression: true,
    encryption: false, // Implementar se necessário
    schedule: '0 2 * * *' // Cron: todo dia às 2h
  },
  storage: {
    local: true,
    cloud: false, // AWS S3, Google Cloud, etc.
    cloudConfig: {
      provider: 'aws',
      bucket: 'armazem-backups',
      region: 'us-east-1'
    }
  }
}

console.log('💾 Sistema de Backup - Armazém São Joaquim\n')

class BackupManager {
  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.serviceKey)
    this.backupDir = path.resolve(config.backup.directory)
    this.ensureBackupDirectory()
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
      console.log(`📁 Diretório de backup criado: ${this.backupDir}`)
    }
  }

  async createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `armazem_backup_${timestamp}`
    const backupPath = path.join(this.backupDir, backupName)
    
    console.log(`🚀 Iniciando backup completo: ${backupName}`)
    
    try {
      // Criar diretório do backup
      fs.mkdirSync(backupPath, { recursive: true })
      
      // 1. Backup do banco de dados
      await this.backupDatabase(backupPath)
      
      // 2. Backup de arquivos estáticos
      await this.backupStaticFiles(backupPath)
      
      // 3. Backup de configurações
      await this.backupConfigurations(backupPath)
      
      // 4. Backup de logs
      await this.backupLogs(backupPath)
      
      // 5. Criar manifesto do backup
      await this.createManifest(backupPath, backupName)
      
      // 6. Comprimir backup se habilitado
      if (config.backup.compression) {
        await this.compressBackup(backupPath, backupName)
      }
      
      // 7. Upload para cloud se habilitado
      if (config.storage.cloud) {
        await this.uploadToCloud(backupPath, backupName)
      }
      
      // 8. Limpar backups antigos
      await this.cleanOldBackups()
      
      console.log(`✅ Backup completo criado com sucesso: ${backupName}`)
      return { success: true, backupName, path: backupPath }
      
    } catch (error) {
      console.error(`❌ Erro durante backup: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  async backupDatabase(backupPath) {
    console.log('📊 Fazendo backup do banco de dados...')
    
    const tables = [
      'profiles',
      'reservas', 
      'menu_items',
      'blog_posts',
      'analytics_events',
      'system_logs'
    ]
    
    const dbBackupPath = path.join(backupPath, 'database')
    fs.mkdirSync(dbBackupPath, { recursive: true })
    
    for (const table of tables) {
      try {
        console.log(`  📋 Backup da tabela: ${table}`)
        
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
        
        if (error) {
          console.warn(`  ⚠️ Erro ao fazer backup da tabela ${table}: ${error.message}`)
          continue
        }
        
        const tableBackup = {
          table,
          timestamp: new Date().toISOString(),
          count: data?.length || 0,
          data: data || []
        }
        
        fs.writeFileSync(
          path.join(dbBackupPath, `${table}.json`),
          JSON.stringify(tableBackup, null, 2)
        )
        
        console.log(`  ✅ ${table}: ${tableBackup.count} registros`)
        
      } catch (error) {
        console.warn(`  ⚠️ Erro ao processar tabela ${table}: ${error.message}`)
      }
    }
    
    // Backup do schema (se disponível)
    try {
      const { data: schemaInfo } = await this.supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_schema', 'public')
      
      if (schemaInfo) {
        fs.writeFileSync(
          path.join(dbBackupPath, 'schema.json'),
          JSON.stringify(schemaInfo, null, 2)
        )
      }
    } catch (error) {
      console.warn(`  ⚠️ Não foi possível fazer backup do schema: ${error.message}`)
    }
  }

  async backupStaticFiles(backupPath) {
    console.log('📁 Fazendo backup de arquivos estáticos...')
    
    const staticPath = path.join(backupPath, 'static')
    fs.mkdirSync(staticPath, { recursive: true })
    
    const filesToBackup = [
      'public/images',
      'public/icons',
      'public/manifest.json',
      'public/robots.txt',
      'public/sitemap.xml'
    ]
    
    for (const filePath of filesToBackup) {
      try {
        if (fs.existsSync(filePath)) {
          const destPath = path.join(staticPath, path.basename(filePath))
          
          if (fs.statSync(filePath).isDirectory()) {
            this.copyDirectory(filePath, destPath)
          } else {
            fs.copyFileSync(filePath, destPath)
          }
          
          console.log(`  ✅ ${filePath}`)
        }
      } catch (error) {
        console.warn(`  ⚠️ Erro ao copiar ${filePath}: ${error.message}`)
      }
    }
  }

  async backupConfigurations(backupPath) {
    console.log('⚙️ Fazendo backup de configurações...')
    
    const configPath = path.join(backupPath, 'config')
    fs.mkdirSync(configPath, { recursive: true })
    
    const configFiles = [
      'package.json',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'netlify.toml',
      '.env.example'
    ]
    
    for (const file of configFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.copyFileSync(file, path.join(configPath, file))
          console.log(`  ✅ ${file}`)
        }
      } catch (error) {
        console.warn(`  ⚠️ Erro ao copiar ${file}: ${error.message}`)
      }
    }
    
    // Backup de variáveis de ambiente (sem valores sensíveis)
    const envTemplate = {
      NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
      SUPABASE_SERVICE_ROLE_KEY: 'your_service_role_key',
      RESEND_API_KEY: 'your_resend_api_key',
      NODE_ENV: 'production'
    }
    
    fs.writeFileSync(
      path.join(configPath, 'env-template.json'),
      JSON.stringify(envTemplate, null, 2)
    )
  }

  async backupLogs(backupPath) {
    console.log('📝 Fazendo backup de logs...')
    
    const logsPath = path.join(backupPath, 'logs')
    fs.mkdirSync(logsPath, { recursive: true })
    
    // Backup de logs do sistema (se existirem)
    const logDirs = [
      '.next/cache',
      'logs',
      'tmp'
    ]
    
    for (const logDir of logDirs) {
      try {
        if (fs.existsSync(logDir)) {
          const destPath = path.join(logsPath, path.basename(logDir))
          this.copyDirectory(logDir, destPath)
          console.log(`  ✅ ${logDir}`)
        }
      } catch (error) {
        console.warn(`  ⚠️ Erro ao copiar logs de ${logDir}: ${error.message}`)
      }
    }
    
    // Criar log do backup
    const backupLog = {
      timestamp: new Date().toISOString(),
      version: this.getAppVersion(),
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime()
    }
    
    fs.writeFileSync(
      path.join(logsPath, 'backup-info.json'),
      JSON.stringify(backupLog, null, 2)
    )
  }

  async createManifest(backupPath, backupName) {
    console.log('📋 Criando manifesto do backup...')
    
    const manifest = {
      name: backupName,
      timestamp: new Date().toISOString(),
      version: this.getAppVersion(),
      type: 'full',
      size: this.getDirectorySize(backupPath),
      files: this.getFileList(backupPath),
      checksum: this.calculateChecksum(backupPath),
      retention_until: new Date(Date.now() + config.backup.retention * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        node_version: process.version,
        platform: process.platform,
        backup_tool_version: '1.0.0'
      }
    }
    
    fs.writeFileSync(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    )
    
    console.log(`  ✅ Manifesto criado (${manifest.files.length} arquivos, ${this.formatSize(manifest.size)})`)
  }

  async compressBackup(backupPath, backupName) {
    console.log('🗜️ Comprimindo backup...')
    
    try {
      const tarFile = `${backupPath}.tar.gz`
      execSync(`tar -czf "${tarFile}" -C "${path.dirname(backupPath)}" "${backupName}"`)
      
      // Remover diretório original após compressão
      this.removeDirectory(backupPath)
      
      const compressedSize = fs.statSync(tarFile).size
      console.log(`  ✅ Backup comprimido: ${this.formatSize(compressedSize)}`)
      
    } catch (error) {
      console.warn(`  ⚠️ Erro na compressão: ${error.message}`)
    }
  }

  async uploadToCloud(backupPath, backupName) {
    console.log('☁️ Fazendo upload para cloud...')
    
    // Implementar upload para AWS S3, Google Cloud, etc.
    // Por enquanto, apenas simular
    console.log('  ⚠️ Upload para cloud não implementado ainda')
  }

  async cleanOldBackups() {
    console.log('🧹 Limpando backups antigos...')
    
    try {
      const files = fs.readdirSync(this.backupDir)
      const cutoffDate = new Date(Date.now() - config.backup.retention * 24 * 60 * 60 * 1000)
      
      let removedCount = 0
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime < cutoffDate) {
          if (stats.isDirectory()) {
            this.removeDirectory(filePath)
          } else {
            fs.unlinkSync(filePath)
          }
          removedCount++
          console.log(`  🗑️ Removido: ${file}`)
        }
      }
      
      if (removedCount === 0) {
        console.log('  ✅ Nenhum backup antigo para remover')
      } else {
        console.log(`  ✅ ${removedCount} backups antigos removidos`)
      }
      
    } catch (error) {
      console.warn(`  ⚠️ Erro na limpeza: ${error.message}`)
    }
  }

  async restoreFromBackup(backupName) {
    console.log(`🔄 Iniciando restauração do backup: ${backupName}`)
    
    const backupPath = path.join(this.backupDir, backupName)
    
    if (!fs.existsSync(backupPath)) {
      // Tentar encontrar arquivo comprimido
      const compressedPath = `${backupPath}.tar.gz`
      if (fs.existsSync(compressedPath)) {
        console.log('📦 Descomprimindo backup...')
        execSync(`tar -xzf "${compressedPath}" -C "${this.backupDir}"`)
      } else {
        throw new Error(`Backup não encontrado: ${backupName}`)
      }
    }
    
    try {
      // Verificar manifesto
      const manifestPath = path.join(backupPath, 'manifest.json')
      if (!fs.existsSync(manifestPath)) {
        throw new Error('Manifesto do backup não encontrado')
      }
      
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      console.log(`📋 Backup criado em: ${manifest.timestamp}`)
      console.log(`📊 Versão da aplicação: ${manifest.version}`)
      
      // Confirmar restauração
      console.log('\n⚠️ ATENÇÃO: Esta operação irá sobrescrever dados existentes!')
      console.log('Pressione Ctrl+C para cancelar ou Enter para continuar...')
      
      // Em produção, implementar confirmação interativa
      // process.stdin.setRawMode(true)
      // await new Promise(resolve => process.stdin.once('data', resolve))
      
      // 1. Restaurar banco de dados
      await this.restoreDatabase(backupPath)
      
      // 2. Restaurar arquivos estáticos
      await this.restoreStaticFiles(backupPath)
      
      // 3. Restaurar configurações
      await this.restoreConfigurations(backupPath)
      
      console.log('✅ Restauração concluída com sucesso!')
      console.log('⚠️ Reinicie a aplicação para aplicar todas as mudanças')
      
    } catch (error) {
      console.error(`❌ Erro durante restauração: ${error.message}`)
      throw error
    }
  }

  async restoreDatabase(backupPath) {
    console.log('📊 Restaurando banco de dados...')
    
    const dbBackupPath = path.join(backupPath, 'database')
    
    if (!fs.existsSync(dbBackupPath)) {
      console.warn('  ⚠️ Backup de banco não encontrado')
      return
    }
    
    const files = fs.readdirSync(dbBackupPath)
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'schema.json') {
        const tableName = file.replace('.json', '')
        
        try {
          console.log(`  📋 Restaurando tabela: ${tableName}`)
          
          const backupData = JSON.parse(
            fs.readFileSync(path.join(dbBackupPath, file), 'utf8')
          )
          
          if (backupData.data && backupData.data.length > 0) {
            // Limpar tabela existente (cuidado!)
            await this.supabase
              .from(tableName)
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
            
            // Inserir dados do backup
            const { error } = await this.supabase
              .from(tableName)
              .insert(backupData.data)
            
            if (error) {
              console.warn(`  ⚠️ Erro ao restaurar ${tableName}: ${error.message}`)
            } else {
              console.log(`  ✅ ${tableName}: ${backupData.count} registros restaurados`)
            }
          }
          
        } catch (error) {
          console.warn(`  ⚠️ Erro ao processar ${tableName}: ${error.message}`)
        }
      }
    }
  }

  async restoreStaticFiles(backupPath) {
    console.log('📁 Restaurando arquivos estáticos...')
    
    const staticBackupPath = path.join(backupPath, 'static')
    
    if (!fs.existsSync(staticBackupPath)) {
      console.warn('  ⚠️ Backup de arquivos estáticos não encontrado')
      return
    }
    
    const files = fs.readdirSync(staticBackupPath)
    
    for (const file of files) {
      try {
        const sourcePath = path.join(staticBackupPath, file)
        const destPath = path.join('public', file)
        
        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, destPath)
        } else {
          fs.copyFileSync(sourcePath, destPath)
        }
        
        console.log(`  ✅ ${file}`)
        
      } catch (error) {
        console.warn(`  ⚠️ Erro ao restaurar ${file}: ${error.message}`)
      }
    }
  }

  async restoreConfigurations(backupPath) {
    console.log('⚙️ Restaurando configurações...')
    
    const configBackupPath = path.join(backupPath, 'config')
    
    if (!fs.existsSync(configBackupPath)) {
      console.warn('  ⚠️ Backup de configurações não encontrado')
      return
    }
    
    // Apenas mostrar diferenças, não sobrescrever automaticamente
    const files = fs.readdirSync(configBackupPath)
    
    for (const file of files) {
      if (file === 'env-template.json') continue
      
      try {
        const backupFile = path.join(configBackupPath, file)
        const currentFile = file
        
        if (fs.existsSync(currentFile)) {
          const backupContent = fs.readFileSync(backupFile, 'utf8')
          const currentContent = fs.readFileSync(currentFile, 'utf8')
          
          if (backupContent !== currentContent) {
            console.log(`  ⚠️ ${file} tem diferenças (backup não aplicado automaticamente)`)
          } else {
            console.log(`  ✅ ${file} (sem mudanças)`)
          }
        } else {
          fs.copyFileSync(backupFile, currentFile)
          console.log(`  ✅ ${file} (restaurado)`)
        }
        
      } catch (error) {
        console.warn(`  ⚠️ Erro ao verificar ${file}: ${error.message}`)
      }
    }
  }

  // Métodos utilitários
  copyDirectory(source, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    
    const files = fs.readdirSync(source)
    
    for (const file of files) {
      const sourcePath = path.join(source, file)
      const destPath = path.join(dest, file)
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath)
      } else {
        fs.copyFileSync(sourcePath, destPath)
      }
    }
  }

  removeDirectory(dir) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  getDirectorySize(dir) {
    let size = 0
    
    const files = fs.readdirSync(dir)
    
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stats = fs.statSync(filePath)
      
      if (stats.isDirectory()) {
        size += this.getDirectorySize(filePath)
      } else {
        size += stats.size
      }
    }
    
    return size
  }

  getFileList(dir, basePath = '') {
    let files = []
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const relativePath = path.join(basePath, item)
      const stats = fs.statSync(itemPath)
      
      if (stats.isDirectory()) {
        files = files.concat(this.getFileList(itemPath, relativePath))
      } else {
        files.push({
          path: relativePath,
          size: stats.size,
          modified: stats.mtime.toISOString()
        })
      }
    }
    
    return files
  }

  calculateChecksum(dir) {
    // Implementar checksum MD5 ou SHA256 do diretório
    // Por enquanto, retornar timestamp como checksum simples
    return Date.now().toString(36)
  }

  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  getAppVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      return packageJson.version || '1.0.0'
    } catch {
      return '1.0.0'
    }
  }

  async listBackups() {
    console.log('📋 Backups disponíveis:\n')
    
    try {
      const files = fs.readdirSync(this.backupDir)
      const backups = []
      
      for (const file of files) {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        
        let manifestData = null
        
        if (stats.isDirectory()) {
          const manifestPath = path.join(filePath, 'manifest.json')
          if (fs.existsSync(manifestPath)) {
            manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
          }
        } else if (file.endsWith('.tar.gz')) {
          // Para arquivos comprimidos, extrair manifesto temporariamente
          try {
            const tempDir = path.join(this.backupDir, 'temp_extract')
            fs.mkdirSync(tempDir, { recursive: true })
            
            execSync(`tar -xzf "${filePath}" -C "${tempDir}" --wildcards "*/manifest.json"`)
            
            const extractedManifest = fs.readdirSync(tempDir)[0]
            if (extractedManifest) {
              const manifestPath = path.join(tempDir, extractedManifest, 'manifest.json')
              if (fs.existsSync(manifestPath)) {
                manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
              }
            }
            
            this.removeDirectory(tempDir)
          } catch (error) {
            // Ignorar erro de extração
          }
        }
        
        backups.push({
          name: file,
          size: this.formatSize(stats.size),
          created: stats.mtime.toISOString(),
          manifest: manifestData
        })
      }
      
      // Ordenar por data de criação (mais recente primeiro)
      backups.sort((a, b) => new Date(b.created) - new Date(a.created))
      
      if (backups.length === 0) {
        console.log('Nenhum backup encontrado.')
        return
      }
      
      for (const backup of backups) {
        console.log(`📦 ${backup.name}`)
        console.log(`   📅 Criado: ${new Date(backup.created).toLocaleString('pt-BR')}`)
        console.log(`   📊 Tamanho: ${backup.size}`)
        
        if (backup.manifest) {
          console.log(`   🏷️ Versão: ${backup.manifest.version}`)
          console.log(`   📁 Arquivos: ${backup.manifest.files?.length || 0}`)
        }
        
        console.log('')
      }
      
    } catch (error) {
      console.error(`❌ Erro ao listar backups: ${error.message}`)
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  const backupManager = new BackupManager()
  
  switch (command) {
    case 'create':
    case 'backup':
      await backupManager.createFullBackup()
      break
      
    case 'restore':
      const backupName = args[1]
      if (!backupName) {
        console.error('❌ Nome do backup é obrigatório para restauração')
        console.log('Uso: node backup-system.js restore <nome_do_backup>')
        process.exit(1)
      }
      await backupManager.restoreFromBackup(backupName)
      break
      
    case 'list':
      await backupManager.listBackups()
      break
      
    case 'clean':
      await backupManager.cleanOldBackups()
      break
      
    default:
      console.log('💾 Sistema de Backup - Armazém São Joaquim')
      console.log('')
      console.log('Comandos disponíveis:')
      console.log('  create/backup  - Criar backup completo')
      console.log('  restore <nome> - Restaurar backup específico')
      console.log('  list          - Listar backups disponíveis')
      console.log('  clean         - Limpar backups antigos')
      console.log('')
      console.log('Exemplos:')
      console.log('  node backup-system.js create')
      console.log('  node backup-system.js restore armazem_backup_2024-01-15T02-00-00-000Z')
      console.log('  node backup-system.js list')
      break
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(`💥 Erro: ${error.message}`)
    process.exit(1)
  })
}

module.exports = BackupManager 