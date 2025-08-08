'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { 
  Save, 
  Settings,
  Globe,
  Mail,
  Shield,
  Database,
  Palette,
  Bell,
  Key,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { Button, Input, Card, Textarea, Switch } from '@/components/ui'

interface ConfiguracoesPageProps {
  params: Promise<{ locale: string }>
}

interface SiteSettings {
  site_name: string
  site_description: string
  site_url: string
  contact_email: string
  contact_phone: string
  address: string
  social_facebook: string
  social_instagram: string
  social_whatsapp: string
  maintenance_mode: boolean
  allow_registrations: boolean
  email_notifications: boolean
  sms_notifications: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  theme_primary_color: string
  theme_secondary_color: string
  seo_title: string
  seo_description: string
  seo_keywords: string
  google_analytics_id: string
  facebook_pixel_id: string
}

export default function ConfiguracoesPage({ params }: ConfiguracoesPageProps) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale || 'pt'
  
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    site_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    social_facebook: '',
    social_instagram: '',
    social_whatsapp: '',
    maintenance_mode: false,
    allow_registrations: true,
    email_notifications: true,
    sms_notifications: false,
    backup_frequency: 'weekly',
    theme_primary_color: '#3B82F6',
    theme_secondary_color: '#10B981',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    google_analytics_id: '',
    facebook_pixel_id: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to load settings
      // const response = await fetch('/api/admin/settings')
      // const data = await response.json()
      // setSettings(data)
      
      // Mock data for now
      setSettings({
        site_name: 'Armazém São Joaquim',
        site_description: 'Pousada e Restaurante tradicional com o melhor da culinária regional',
        site_url: 'https://armazemsaojoaquim.com.br',
        contact_email: 'contato@armazemsaojoaquim.com.br',
        contact_phone: '(11) 99999-9999',
        address: 'Rua Principal, 123 - Centro, São Joaquim - SP',
        social_facebook: 'https://facebook.com/armazemsaojoaquim',
        social_instagram: 'https://instagram.com/armazemsaojoaquim',
        social_whatsapp: '5511999999999',
        maintenance_mode: false,
        allow_registrations: true,
        email_notifications: true,
        sms_notifications: false,
        backup_frequency: 'weekly',
        theme_primary_color: '#3B82F6',
        theme_secondary_color: '#10B981',
        seo_title: 'Armazém São Joaquim - Pousada e Restaurante',
        seo_description: 'Desfrute da melhor experiência gastronômica e hospedagem em São Joaquim',
        seo_keywords: 'pousada, restaurante, são joaquim, gastronomia, hospedagem',
        google_analytics_id: '',
        facebook_pixel_id: ''
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // TODO: Implement API call to save settings
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBackup = async () => {
    try {
      setMessage({ type: 'info', text: 'Iniciando backup...' })
      // TODO: Implement backup functionality
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage({ type: 'success', text: 'Backup realizado com sucesso!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao realizar backup' })
    }
  }

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'contact', label: 'Contato', icon: Mail },
    { id: 'social', label: 'Redes Sociais', icon: Globe },
    { id: 'system', label: 'Sistema', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'backup', label: 'Backup', icon: Database }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações do Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie as configurações gerais do site
          </p>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Message */}
      {message && (
        <Card className={`p-4 ${
          message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
          message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
          'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
            {message.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            {message.type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            <span className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800 dark:text-green-200' :
              message.type === 'error' ? 'text-red-800 dark:text-red-200' :
              'text-blue-800 dark:text-blue-200'
            }`}>
              {message.text}
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configurações Gerais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Site
                    </label>
                    <Input
                      value={settings.site_name}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      placeholder="Nome do seu site"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL do Site
                    </label>
                    <Input
                      value={settings.site_url}
                      onChange={(e) => handleInputChange('site_url', e.target.value)}
                      placeholder="https://seusite.com.br"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição do Site
                  </label>
                  <Textarea
                    value={settings.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    placeholder="Descrição breve do seu site"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Contact Settings */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informações de Contato
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email de Contato
                    </label>
                    <Input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      placeholder="contato@seusite.com.br"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone de Contato
                    </label>
                    <Input
                      value={settings.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Endereço
                  </label>
                  <Textarea
                    value={settings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Endereço completo"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Redes Sociais
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Facebook
                    </label>
                    <Input
                      value={settings.social_facebook}
                      onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                      placeholder="https://facebook.com/seuperfil"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instagram
                    </label>
                    <Input
                      value={settings.social_instagram}
                      onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                      placeholder="https://instagram.com/seuperfil"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp (apenas números)
                    </label>
                    <Input
                      value={settings.social_whatsapp}
                      onChange={(e) => handleInputChange('social_whatsapp', e.target.value)}
                      placeholder="5511999999999"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configurações do Sistema
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Modo de Manutenção
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ativar para mostrar página de manutenção aos visitantes
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Permitir Cadastros
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Permitir que novos usuários se cadastrem no site
                      </p>
                    </div>
                    <Switch
                      checked={settings.allow_registrations}
                      onCheckedChange={(checked) => handleInputChange('allow_registrations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Notificações por Email
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enviar notificações por email para administradores
                      </p>
                    </div>
                    <Switch
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frequência de Backup
                    </label>
                    <select
                      value={settings.backup_frequency}
                      onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Aparência
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cor Primária
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.theme_primary_color}
                        onChange={(e) => handleInputChange('theme_primary_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                      <Input
                        value={settings.theme_primary_color}
                        onChange={(e) => handleInputChange('theme_primary_color', e.target.value)}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cor Secundária
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.theme_secondary_color}
                        onChange={(e) => handleInputChange('theme_secondary_color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                      <Input
                        value={settings.theme_secondary_color}
                        onChange={(e) => handleInputChange('theme_secondary_color', e.target.value)}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Settings */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  SEO e Analytics
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título SEO
                    </label>
                    <Input
                      value={settings.seo_title}
                      onChange={(e) => handleInputChange('seo_title', e.target.value)}
                      placeholder="Título que aparece nos resultados de busca"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descrição SEO
                    </label>
                    <Textarea
                      value={settings.seo_description}
                      onChange={(e) => handleInputChange('seo_description', e.target.value)}
                      placeholder="Descrição que aparece nos resultados de busca"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Palavras-chave
                    </label>
                    <Input
                      value={settings.seo_keywords}
                      onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                      placeholder="palavra1, palavra2, palavra3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Google Analytics ID
                      </label>
                      <Input
                        value={settings.google_analytics_id}
                        onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Facebook Pixel ID
                      </label>
                      <Input
                        value={settings.facebook_pixel_id}
                        onChange={(e) => handleInputChange('facebook_pixel_id', e.target.value)}
                        placeholder="123456789012345"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Backup e Restauração
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Sobre os Backups
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Os backups incluem todas as configurações, dados de usuários e conteúdo do site. 
                          Recomendamos fazer backups regulares para garantir a segurança dos seus dados.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Backup Manual
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Crie um backup completo do sistema agora
                      </p>
                      <Button
                        onClick={handleBackup}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Criar Backup
                      </Button>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Restaurar Backup
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Restaure o sistema a partir de um backup
                      </p>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Restaurar
                      </Button>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Histórico de Backups
                    </h3>
                    <div className="space-y-2">
                      {[
                        { date: '2024-01-22 14:30', size: '2.5 MB', status: 'success' },
                        { date: '2024-01-15 14:30', size: '2.3 MB', status: 'success' },
                        { date: '2024-01-08 14:30', size: '2.1 MB', status: 'success' }
                      ].map((backup, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {backup.date}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {backup.size}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}