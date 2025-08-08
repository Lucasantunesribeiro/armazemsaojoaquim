'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea, Switch, Separator } from '@/components/ui'
import { toast } from 'sonner'
import { 
  Settings, 
  Save, 
  Mail, 
  Globe, 
  Search,
  Zap,
  RefreshCw
} from 'lucide-react'

interface SettingValue {
  value: any
  description: string
  updated_at?: string
}

interface Settings {
  general: Record<string, SettingValue>
  email: Record<string, SettingValue>
  seo: Record<string, SettingValue>
  features: Record<string, SettingValue>
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      const data = await response.json()
      setSettings(data.settings)
      setIsDefault(data.isDefault)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    if (!settings) return

    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category as keyof Settings],
        [key]: {
          ...prev![category as keyof Settings][key],
          value
        }
      }
    }))
  }

  const saveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      toast.success('Configurações salvas com sucesso')
      setIsDefault(false)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando configurações...</span>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar configurações</p>
          <Button onClick={fetchSettings} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações gerais do site
          </p>
          {isDefault && (
            <p className="text-amber-600 text-sm mt-1">
              ⚠️ Usando configurações padrão. Salve para persistir as alterações.
            </p>
          )}
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nome do Site</Label>
              <Input
                id="site_name"
                value={settings.general.site_name?.value || ''}
                onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                placeholder="Nome do seu site"
              />
              <p className="text-xs text-muted-foreground">
                {settings.general.site_name?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de Contato</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.general.contact_email?.value || ''}
                onChange={(e) => updateSetting('general', 'contact_email', e.target.value)}
                placeholder="contato@exemplo.com"
              />
              <p className="text-xs text-muted-foreground">
                {settings.general.contact_email?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefone de Contato</Label>
              <Input
                id="contact_phone"
                value={settings.general.contact_phone?.value || ''}
                onChange={(e) => updateSetting('general', 'contact_phone', e.target.value)}
                placeholder="+55 11 99999-9999"
              />
              <p className="text-xs text-muted-foreground">
                {settings.general.contact_phone?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={settings.general.address?.value || ''}
                onChange={(e) => updateSetting('general', 'address', e.target.value)}
                placeholder="Endereço completo"
              />
              <p className="text-xs text-muted-foreground">
                {settings.general.address?.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Descrição do Site</Label>
            <Textarea
              id="site_description"
              value={settings.general.site_description?.value || ''}
              onChange={(e) => updateSetting('general', 'site_description', e.target.value)}
              placeholder="Descrição do seu site"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              {settings.general.site_description?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configurações de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">Servidor SMTP</Label>
              <Input
                id="smtp_host"
                value={settings.email.smtp_host?.value || ''}
                onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
              />
              <p className="text-xs text-muted-foreground">
                {settings.email.smtp_host?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port">Porta SMTP</Label>
              <Input
                id="smtp_port"
                value={settings.email.smtp_port?.value || ''}
                onChange={(e) => updateSetting('email', 'smtp_port', e.target.value)}
                placeholder="587"
              />
              <p className="text-xs text-muted-foreground">
                {settings.email.smtp_port?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_user">Usuário SMTP</Label>
              <Input
                id="smtp_user"
                value={settings.email.smtp_user?.value || ''}
                onChange={(e) => updateSetting('email', 'smtp_user', e.target.value)}
                placeholder="seu.email@gmail.com"
              />
              <p className="text-xs text-muted-foreground">
                {settings.email.smtp_user?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_from">Email Remetente</Label>
              <Input
                id="smtp_from"
                type="email"
                value={settings.email.smtp_from?.value || ''}
                onChange={(e) => updateSetting('email', 'smtp_from', e.target.value)}
                placeholder="noreply@exemplo.com"
              />
              <p className="text-xs text-muted-foreground">
                {settings.email.smtp_from?.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Configurações de SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Título Padrão</Label>
              <Input
                id="meta_title"
                value={settings.seo.meta_title?.value || ''}
                onChange={(e) => updateSetting('seo', 'meta_title', e.target.value)}
                placeholder="Título das páginas"
              />
              <p className="text-xs text-muted-foreground">
                {settings.seo.meta_title?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image">Imagem para Redes Sociais</Label>
              <Input
                id="og_image"
                value={settings.seo.og_image?.value || ''}
                onChange={(e) => updateSetting('seo', 'og_image', e.target.value)}
                placeholder="/images/og-image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                {settings.seo.og_image?.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Descrição Padrão</Label>
            <Textarea
              id="meta_description"
              value={settings.seo.meta_description?.value || ''}
              onChange={(e) => updateSetting('seo', 'meta_description', e.target.value)}
              placeholder="Descrição padrão das páginas"
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              {settings.seo.meta_description?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Funcionalidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Blog Habilitado</Label>
              <p className="text-sm text-muted-foreground">
                {settings.features.blog_enabled?.description}
              </p>
            </div>
            <Switch
              checked={settings.features.blog_enabled?.value || false}
              onCheckedChange={(checked) => updateSetting('features', 'blog_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Newsletter Habilitada</Label>
              <p className="text-sm text-muted-foreground">
                {settings.features.newsletter_enabled?.description}
              </p>
            </div>
            <Switch
              checked={settings.features.newsletter_enabled?.value || false}
              onCheckedChange={(checked) => updateSetting('features', 'newsletter_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Comentários Habilitados</Label>
              <p className="text-sm text-muted-foreground">
                {settings.features.comments_enabled?.description}
              </p>
            </div>
            <Switch
              checked={settings.features.comments_enabled?.value || false}
              onCheckedChange={(checked) => updateSetting('features', 'comments_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer com botão de salvar */}
      <div className="flex justify-end pt-6">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </Button>
      </div>
    </div>
  )
}