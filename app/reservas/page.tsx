'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, AlertCircle, MessageSquare, ArrowLeft, ArrowRight, User } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { LoadingSpinner } from '../../components/ui/Loading'
import { useSupabase } from '../../components/providers/SupabaseProvider'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-hot-toast'

interface ReservationData {
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: string
  occasion: string
  requests: string
}

interface UserReservation {
  id: string
  data: string
  horario: string
  pessoas: number
  status: string
  observacoes: string | null
  created_at: string
}

const ReservasPage = () => {
  const { user } = useSupabase()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<'new' | 'list'>('new')
  const [userReservations, setUserReservations] = useState<UserReservation[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    occasion: '',
    requests: ''
  })

  const [errors, setErrors] = useState<Partial<ReservationData>>({})

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', 
    '21:00', '21:30', '22:00', '22:30', '23:00'
  ]

  const breakfastSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30'
  ]

  const guestOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+']

  const occasionOptions = [
    'Jantar casual',
    'Encontro romântico',
    'Aniversário',
    'Comemoração',
    'Reunião de trabalho',
    'Evento especial',
    'Outro'
  ]

  useEffect(() => {
    if (user && viewMode === 'list') {
      fetchUserReservations()
    }
  }, [user, viewMode])

  const fetchUserReservations = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserReservations(data || [])
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
      toast.error('Erro ao carregar suas reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof ReservationData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Partial<ReservationData> = {}

    if (currentStep === 1) {
      if (!formData.date) newErrors.date = 'Data é obrigatória'
      if (!formData.time) newErrors.time = 'Horário é obrigatório'
      if (!formData.guests) newErrors.guests = 'Número de pessoas é obrigatório'
    }

    if (currentStep === 2) {
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
      if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const sendConfirmationEmail = async (reservationId: string) => {
    try {
      const { emailService } = await import('../../lib/email-service')
      
      const emailData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests),
        occasion: formData.occasion,
        requests: formData.requests,
        reservationId
      }
      
      const success = await emailService.sendConfirmationEmail(emailData)
      setConfirmationSent(success)
      return success
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    setIsSubmitting(true)
    try {
      let userId = user?.id

      // Se não está logado, solicitar login via email
      if (!userId) {
        const { error } = await supabase.auth.signInWithOtp({
          email: formData.email,
        })

        if (error) throw error
        
        toast.success('Código de verificação enviado para seu email! Confirme para continuar.')
        return
      }

      // Criar reserva apenas se usuário está autenticado
      const { data: reservation, error } = await supabase
        .from('reservas')
        .insert([
          {
            data: formData.date,
            horario: formData.time,
            pessoas: parseInt(formData.guests),
            status: 'pendente',
            user_id: userId,
            observacoes: `Ocasião: ${formData.occasion}\nSolicitações: ${formData.requests}`.trim()
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Enviar email de confirmação
      await sendConfirmationEmail(reservation.id)

      setShowSuccess(true)
      toast.success('Reserva solicitada com sucesso!')
      
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error)
      toast.error(error.message || 'Erro ao criar reserva. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: '2',
      occasion: '',
      requests: ''
    })
    setStep(1)
    setShowSuccess(false)
    setErrors({})
    setConfirmationSent(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'text-green-600 bg-green-100'
      case 'pendente': return 'text-yellow-600 bg-yellow-100'
      case 'cancelada': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmada': return 'Confirmada'
      case 'pendente': return 'Pendente'
      case 'cancelada': return 'Cancelada'
      default: return status
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Visualização das reservas existentes
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen pt-20 bg-cinza-claro">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-playfair text-3xl md:text-4xl font-bold text-madeira-escura">
                Minhas Reservas
              </h1>
              <Button 
                variant="outline" 
                onClick={() => setViewMode('new')}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Nova Reserva
              </Button>
            </div>

            {!user ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <User className="w-16 h-16 text-cinza-medio mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Faça login para ver suas reservas</h3>
                <p className="text-cinza-medio mb-6">
                  Você precisa estar logado para visualizar suas reservas
                </p>
                <Button onClick={() => setViewMode('new')}>
                  Fazer Nova Reserva
                </Button>
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : userReservations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Calendar className="w-16 h-16 text-cinza-medio mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma reserva encontrada</h3>
                <p className="text-cinza-medio mb-6">
                  Você ainda não possui reservas. Que tal fazer a primeira?
                </p>
                <Button onClick={() => setViewMode('new')}>
                  Fazer Primeira Reserva
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userReservations.map((reservation) => (
                  <div key={reservation.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-madeira-escura">
                            {formatDate(reservation.data)} às {reservation.horario}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-cinza-medio">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{reservation.pessoas} pessoa{reservation.pessoas > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Criada em {formatDate(reservation.created_at)}</span>
                          </div>
                        </div>
                        {reservation.observacoes && (
                          <p className="text-sm text-cinza-medio mt-2">
                            {reservation.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Formulário de nova reserva (resto do código permanece igual...)
  return (
    <div className="min-h-screen bg-cinza-claro py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-4">
              Faça sua Reserva
            </h1>
            <p className="text-xl text-cinza-medio max-w-2xl mx-auto">
              Reserve sua mesa no Armazém São Joaquim e garante uma experiência inesquecível no coração de Santa Teresa
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= i ? 'bg-amarelo-armazem text-madeira-escura' : 'bg-white text-cinza-medio border-2 border-cinza-medio'
                  }`}>
                    {step > i ? <CheckCircle className="w-6 h-6" /> : i}
                  </div>
                  {i < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-colors ${
                      step > i ? 'bg-amarelo-armazem' : 'bg-cinza-medio'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-madeira-escura to-pedra-natural text-white p-8">
              <h2 className="font-playfair text-2xl font-semibold">
                {step === 1 && 'Escolha Data e Horário'}
                {step === 2 && 'Seus Dados'}
                {step === 3 && 'Confirmação'}
                {step === 4 && 'Reserva Enviada!'}
              </h2>
              <p className="text-white/80">
                {step === 1 && 'Selecione quando gostaria de nos visitar'}
                {step === 2 && 'Precisamos de alguns dados para confirmar sua reserva'}
                {step === 3 && 'Revise os dados da sua reserva antes de enviar'}
                {step === 4 && 'Sua reserva foi enviada com sucesso'}
              </p>
            </CardHeader>

            <CardContent className="p-8">
              {/* Step 1: Data e Horário */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-madeira-escura mb-2">
                        Data da Reserva *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cinza-medio" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={getMinDate()}
                          className="w-full pl-12 pr-4 py-3 border border-cinza-medio rounded-lg focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-madeira-escura mb-2">
                        Número de Pessoas *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cinza-medio" />
                        <select
                          name="guests"
                          value={formData.guests}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 border border-cinza-medio rounded-lg focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent appearance-none"
                          required
                        >
                          <option value="">Selecione</option>
                          {guestOptions.map(option => (
                            <option key={option} value={option}>{option} {option === '1' ? 'pessoa' : 'pessoas'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-madeira-escura mb-4">
                      Horário Disponível *
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, time }))}
                          className={`p-3 border rounded-lg text-center transition-all ${
                            formData.time === time
                              ? 'bg-amarelo-armazem border-amarelo-armazem text-madeira-escura'
                              : 'border-cinza-medio hover:border-amarelo-armazem hover:bg-amarelo-armazem/10'
                          }`}
                        >
                          <Clock className="w-4 h-4 mx-auto mb-1" />
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-madeira-escura mb-2">
                      Ocasião
                    </label>
                    <select
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-cinza-medio rounded-lg focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent"
                    >
                      <option value="">Selecione a ocasião (opcional)</option>
                      {occasionOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNext} variant="primary" size="lg">
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Dados do Cliente */}
              {step === 2 && (
                <div className="space-y-6">
                  <Input
                    label="Nome completo"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="E-mail"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      required
                    />

                    <Input
                      label="Telefone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="requests" className="block text-sm font-medium text-madeira-escura mb-2">
                      Pedidos Especiais (opcional)
                    </label>
                    <textarea
                      id="requests"
                      name="requests"
                      value={formData.requests}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-cinza-medio rounded-lg focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent resize-none"
                      placeholder="Alguma restrição alimentar, pedido especial ou informação adicional?"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button onClick={handleBack} variant="outline">
                      Voltar
                    </Button>
                    <Button onClick={handleNext} variant="primary" size="lg">
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmação */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="bg-amarelo-armazem/10 border border-amarelo-armazem rounded-lg p-6">
                    <h3 className="font-playfair text-xl font-semibold text-madeira-escura mb-4">
                      Dados da Reserva
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-cinza-medio">Data</p>
                        <p className="font-semibold text-madeira-escura">{formatDate(formData.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">Horário</p>
                        <p className="font-semibold text-madeira-escura">{formData.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">Pessoas</p>
                        <p className="font-semibold text-madeira-escura">{formData.guests} {formData.guests === '1' ? 'pessoa' : 'pessoas'}</p>
                      </div>
                      {formData.occasion && (
                        <div>
                          <p className="text-sm text-cinza-medio">Ocasião</p>
                          <p className="font-semibold text-madeira-escura">{formData.occasion}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-cinza-medio rounded-lg p-6">
                    <h3 className="font-playfair text-xl font-semibold text-madeira-escura mb-4">
                      Dados do Cliente
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-cinza-medio">Nome</p>
                        <p className="font-semibold text-madeira-escura">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">E-mail</p>
                        <p className="font-semibold text-madeira-escura">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">Telefone</p>
                        <p className="font-semibold text-madeira-escura">{formData.phone}</p>
                      </div>
                      {formData.requests && (
                        <div>
                          <p className="text-sm text-cinza-medio">Pedidos Especiais</p>
                          <p className="font-semibold text-madeira-escura">{formData.requests}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Importante:</p>
                        <ul className="space-y-1">
                          <li>• Sua reserva será confirmada por telefone ou e-mail em até 24 horas</li>
                          <li>• Em caso de atraso superior a 15 minutos, a mesa poderá ser liberada</li>
                          <li>• Para grupos acima de 8 pessoas, entre em contato diretamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button onClick={handleBack} variant="outline">
                      Voltar
                    </Button>
                    <Button onClick={handleSubmit} variant="primary" size="lg" loading={isSubmitting}>
                      Confirmar Reserva
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Sucesso */}
              {step === 4 && (
                <div className="text-center space-y-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-4">
                      Reserva Enviada com Sucesso!
                    </h3>
                    <p className="text-cinza-medio mb-6">
                      Recebemos sua solicitação de reserva para <strong>{formatDate(formData.date)}</strong> às <strong>{formData.time}</strong>.
                      Entraremos em contato em breve para confirmar.
                    </p>
                  </div>

                  <div className="bg-amarelo-armazem/10 border border-amarelo-armazem rounded-lg p-6">
                    <h4 className="font-semibold text-madeira-escura mb-3">Próximos Passos:</h4>
                    <ul className="text-left text-cinza-medio space-y-2">
                      <li>✓ Aguarde nossa confirmação por telefone ou e-mail</li>
                      <li>✓ Chegue com 5-10 minutos de antecedência</li>
                      <li>✓ Traga um documento de identificação</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={resetForm} variant="outline">
                      Nova Reserva
                    </Button>
                    <Button onClick={() => setViewMode('list')} variant="primary">
                      Ver Minhas Reservas
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-amarelo-armazem mx-auto mb-3" />
                <h3 className="font-semibold text-madeira-escura mb-2">Telefone</h3>
                <p className="text-cinza-medio text-sm mb-2">(21) 2245-7890</p>
                <p className="text-cinza-medio text-sm">(21) 98765-4321</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-amarelo-armazem mx-auto mb-3" />
                <h3 className="font-semibold text-madeira-escura mb-2">E-mail</h3>
                <p className="text-cinza-medio text-sm">reservas@armazemsaojoaquim.com.br</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-amarelo-armazem mx-auto mb-3" />
                <h3 className="font-semibold text-madeira-escura mb-2">Localização</h3>
                <p className="text-cinza-medio text-sm">Santa Teresa, Rio de Janeiro</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservasPage