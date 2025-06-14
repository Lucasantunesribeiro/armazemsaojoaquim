'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Users, MapPin, Phone, Mail, User, CheckCircle, AlertCircle, ChefHat, Utensils, Heart, Star } from 'lucide-react'
import { useSupabase } from '../../components/providers/SupabaseProvider'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { toast } from 'react-hot-toast'
import { emailJSService, ReservationData } from '../../lib/emailjs-service'

interface ReservationForm {
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  observations: string
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

export default function ReservasPage() {
  const router = useRouter()
  const { user, loading } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userReservations, setUserReservations] = useState<UserReservation[]>([])
  const [loadingReservations, setLoadingReservations] = useState(false)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  
  const [formData, setFormData] = useState<ReservationForm>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    observations: ''
  })

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Faça login para acessar as reservas')
      router.push('/auth')
    }
  }, [user, loading, router])

  // Load user data when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      }))
      fetchUserReservations()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserReservations = async () => {
    if (!user) return

    setLoadingReservations(true)
    
    try {
      const response = await fetch(`/api/reservas?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            toast.error(errorData.error || 'Erro ao carregar reservas')
          } catch (jsonError) {
            console.error('Error parsing JSON error response:', jsonError)
            toast.error(`Erro ${response.status}: Falha ao carregar reservas`)
          }
        } else {
          toast.error('Erro ao carregar suas reservas')
        }
        return
      }

      const data = await response.json()
      
      if (data.success) {
        setUserReservations(data.data || [])
      } else {
        toast.error(data.error || 'Erro ao carregar reservas')
      }
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
      toast.error('Erro ao carregar suas reservas')
    } finally {
      setLoadingReservations(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Verificar se o usuário está logado
    if (!user) {
      toast.error('Você precisa estar logado para fazer uma reserva')
      router.push('/auth')
      return
    }

    // Validações básicas
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    // Validar horário de funcionamento
    const hour = parseInt(formData.time.split(':')[0])
    if (hour < 18 || hour >= 23) {
      toast.error('Horário de funcionamento: 18h às 23h')
      return
    }

    setIsSubmitting(true)

    try {
      // Create reservation using the new API
      const reservationResponse = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          nome: formData.name,
          email: formData.email,
          telefone: formData.phone,
          data: formData.date,
          horario: formData.time,
          pessoas: formData.guests,
          observacoes: formData.observations
        })
      })

      // Handle response with improved error handling
      if (!reservationResponse.ok) {
        const contentType = reservationResponse.headers.get('content-type')
        
        // TRATAMENTO ESPECÍFICO PARA ERRO 422
        if (reservationResponse.status === 422) {
          console.error('🚨 ERRO 422 DETECTADO - DADOS DETALHADOS:', {
            url: reservationResponse.url,
            status: reservationResponse.status,
            statusText: reservationResponse.statusText,
            headers: Object.fromEntries(reservationResponse.headers.entries()),
            requestData: {
              user_id: user.id,
              nome: formData.name,
              email: formData.email,
              telefone: formData.phone,
              data: formData.date,
              horario: formData.time,
              pessoas: formData.guests,
              observacoes: formData.observations
            }
          })
          
          try {
            const errorData = await reservationResponse.json()
            console.error('📄 Resposta 422:', errorData)
            toast.error(`Erro 422 - Dados inválidos: ${errorData.error || 'Validação falhou no servidor'}`)
          } catch (jsonError) {
            console.error('❌ Erro ao parsear resposta 422:', jsonError)
            const errorText = await reservationResponse.text()
            console.error('📄 Resposta 422 como texto:', errorText)
            toast.error('Erro 422 - Dados inválidos enviados para o servidor')
          }
          return
        }
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await reservationResponse.json()
            toast.error(errorData.error || 'Erro ao criar reserva')
          } catch (jsonError) {
            console.error('Error parsing JSON error response:', jsonError)
            toast.error(`Erro ${reservationResponse.status}: Falha ao criar reserva`)
          }
        } else {
          // Response is not JSON (probably HTML error page)
          const errorText = await reservationResponse.text()
          console.error('Non-JSON error response:', errorText)
          toast.error(`Erro ${reservationResponse.status}: Serviço temporariamente indisponível`)
        }
        return
      }

      // Parse successful response
      let reservationData
      try {
        const contentType = reservationResponse.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON')
        }
        reservationData = await reservationResponse.json()
      } catch (jsonError) {
        console.error('Error parsing reservation JSON response:', jsonError)
        toast.error('Erro na comunicação com o servidor. Tente novamente.')
        return
      }

      if (reservationData.success && reservationData.data) {
        const reservationInfo: ReservationData = {
          id: reservationData.data.id,
          nome: reservationData.data.nome,
          email: reservationData.data.email,
          telefone: reservationData.data.telefone,
          data: reservationData.data.data,
          horario: reservationData.data.horario,
          pessoas: reservationData.data.pessoas,
          observacoes: reservationData.data.observacoes,
          tokenConfirmacao: reservationData.data.tokenConfirmacao
        }

        // Enviar email de confirmação via EmailJS
        try {
          console.log('📧 Enviando email de confirmação...')
          const emailResult = await emailJSService.enviarEmailConfirmacao(reservationInfo)
          
          if (emailResult.success) {
            toast.success('Reserva criada! Verifique seu email para confirmação.')
          } else {
            console.error('Erro no email:', emailResult.error)
            toast.success('Reserva criada! Erro ao enviar email de confirmação.')
          }
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError)
          toast.success('Reserva criada! Erro ao enviar email de confirmação.')
        }
      } else {
        toast.error(reservationData.error || 'Erro ao criar reserva')
        return
      }

      // Reset form
      setFormData(prev => ({
        ...prev,
        date: '',
        time: '',
        guests: 2,
        observations: ''
      }))

      // Refresh reservations
      fetchUserReservations()

    } catch (error) {
      console.error('Erro ao fazer reserva:', error)
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        toast.error('Erro inesperado ao fazer reserva. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    // Adicionar timezone local para evitar conversão UTC
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'cancelada': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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



  // Cancelar reserva
  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return
    }

    setActionLoading(prev => ({ ...prev, [`cancel_${reservationId}`]: true }))

    try {
      const response = await fetch(`/api/reservas?id=${reservationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar reserva')
      }

      const result = await response.json()
      
      if (result.success) {
        // Remover a reserva da lista
        setUserReservations(prev => 
          prev.filter(reservation => reservation.id !== reservationId)
        )
        
        // Mostrar mensagem de sucesso
        toast.success('Reserva cancelada com sucesso!')
      } else {
        throw new Error(result.error || 'Erro ao cancelar reserva')
      }
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error)
      toast.error('Erro ao cancelar reserva. Tente novamente.')
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel_${reservationId}`]: false }))
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave flex items-center justify-center pt-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amarelo-armazem border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-madeira-escura font-inter">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave flex items-center justify-center pt-20">
        <div className="max-w-md mx-auto text-center space-y-6 p-6">
          <div className="w-20 h-20 bg-amarelo-armazem/20 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-amarelo-armazem" />
          </div>
          <h1 className="text-2xl font-bold text-madeira-escura font-playfair">
            Login Necessário
          </h1>
          <p className="text-cinza-medio font-inter">
            Você precisa estar logado para acessar o sistema de reservas.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center px-6 py-3 bg-amarelo-armazem hover:bg-vermelho-portas text-white font-semibold rounded-xl transition-all duration-300 font-inter"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave">
      {/* Header Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/armazem-interior-aconchegante.jpg"
            alt="Interior do Armazém São Joaquim"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-madeira-escura/90 via-madeira-escura/70 to-madeira-escura/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amarelo-armazem/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amarelo-armazem/30">
              <Calendar className="w-5 h-5 text-amarelo-armazem" />
              <span className="text-sm font-medium text-amarelo-armazem font-inter">
                Sistema de Reservas
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair leading-tight">
              Reserve Sua Mesa
              <span className="block text-amarelo-armazem">no Armazém</span>
            </h1>
            
            <p className="text-xl text-cinza-claro max-w-3xl mx-auto leading-relaxed font-inter">
              Garanta seu lugar em 170 anos de história gastronômica. 
              Experiências únicas aguardam você no coração de Santa Teresa.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-cinza-claro">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amarelo-armazem" />
                <span className="font-inter">Santa Teresa - RJ</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amarelo-armazem" />
                <span className="font-inter">(21) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-vermelho-portas" />
                <span className="font-inter">Desde 1854</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-amarelo-armazem to-transparent rounded-full blur-xl" />
        </div>
        <div className="absolute bottom-10 right-10 w-32 h-32 opacity-20">
          <div className="w-full h-full bg-gradient-to-tl from-vermelho-portas to-transparent rounded-full blur-xl" />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Reservation Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-cinza-claro/20">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-madeira-escura dark:text-white font-playfair mb-2">
                  Nova Reserva
                </h2>
                <p className="text-cinza-medio dark:text-slate-400 font-inter mb-4">
                  Preencha os dados para garantir sua mesa
                </p>
                
                {/* Informações sobre o processo de confirmação */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Como funciona a confirmação:</h3>
                      <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                        <li>• Após criar sua reserva, você receberá um email de confirmação</li>
                        <li>• Clique no link do email para confirmar sua presença</li>
                        <li>• Após a confirmação, o restaurante será notificado automaticamente</li>
                        <li>• Sua reserva só será válida após a confirmação por email</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-2"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="mt-2 w-full px-4 py-3 border border-cinza-claro/30 rounded-xl focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent bg-white dark:bg-slate-700 text-madeira-escura dark:text-white font-inter"
                    >
                      <option value="">Selecione</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="guests">Pessoas</Label>
                    <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                      className="mt-2 w-full px-4 py-3 border border-cinza-claro/30 rounded-xl focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent bg-white dark:bg-slate-700 text-madeira-escura dark:text-white font-inter"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'pessoa' : 'pessoas'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="observations">Observações (opcional)</Label>
                  <textarea
                    id="observations"
                    name="observations"
                    value={formData.observations}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-2 w-full px-4 py-3 border border-cinza-claro/30 rounded-xl focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent bg-white dark:bg-slate-700 text-madeira-escura dark:text-white font-inter resize-none"
                    placeholder="Ocasião especial, restrições alimentares, etc."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amarelo-armazem hover:bg-vermelho-portas text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg font-inter"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Confirmar Reserva</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* User Reservations & Info */}
            <div className="space-y-8">
              {/* Restaurant Info */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-cinza-claro/20">
                <h3 className="text-2xl font-bold text-madeira-escura dark:text-white font-playfair mb-6">
                  Informações do Restaurante
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-amarelo-armazem mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-madeira-escura dark:text-white font-inter">Endereço</h4>
                      <p className="text-cinza-medio dark:text-slate-400 font-inter">
                        Rua Áurea, 26<br />
                        Santa Teresa - Rio de Janeiro<br />
                        CEP: 20241-220
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-amarelo-armazem mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-madeira-escura dark:text-white font-inter">Funcionamento</h4>
                      <div className="text-cinza-medio dark:text-slate-400 font-inter space-y-1">
                        <p>Terça a Sexta: 12h às 22h</p>
                        <p>Sábado e Domingo: 12h às 23h</p>
                        <p className="text-vermelho-portas">Segunda: Fechado</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-amarelo-armazem mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-madeira-escura dark:text-white font-inter">Contato</h4>
                      <div className="text-cinza-medio dark:text-slate-400 font-inter space-y-1">
                        <p>(21) 99999-9999</p>
                        <p>armazemsaojoaquimoficial@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Reservations */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-cinza-claro/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-madeira-escura dark:text-white font-playfair">
                    Minhas Reservas
                  </h3>
                  {loadingReservations && (
                    <div className="w-6 h-6 border-2 border-amarelo-armazem border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>

                {userReservations.length > 0 ? (
                  <div className="space-y-4">
                    {userReservations.map((reservation) => (
                      <div 
                        key={reservation.id}
                        className="border border-cinza-claro/20 dark:border-slate-700 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-amarelo-armazem" />
                            <span className="font-semibold text-madeira-escura dark:text-white font-inter">
                              {formatDate(reservation.data)}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-cinza-medio" />
                            <span className="text-cinza-medio dark:text-slate-400 font-inter">
                              {reservation.horario}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-cinza-medio" />
                            <span className="text-cinza-medio dark:text-slate-400 font-inter">
                              {reservation.pessoas} pessoas
                            </span>
                          </div>
                        </div>
                        
                        {reservation.observacoes && (
                          <div className="mt-3 p-3 bg-cinza-claro dark:bg-slate-700 rounded-lg">
                            <p className="text-sm text-madeira-escura dark:text-white font-inter">
                              <strong>Observações:</strong> {reservation.observacoes}
                            </p>
                          </div>
                        )}
                        
                        {/* Ações da Reserva */}
                        {reservation.status === 'pendente' && (
                          <div className="mt-4 space-y-3">
                            {/* Aviso sobre confirmação por email */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                              <div className="flex items-start space-x-2">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="text-blue-800 dark:text-blue-200 font-medium font-inter">
                                    📧 Confirmação Necessária
                                  </p>
                                  <p className="text-blue-700 dark:text-blue-300 mt-1 font-inter">
                                    Para confirmar sua reserva, clique no link enviado para seu email. 
                                    Verifique também a pasta de spam.
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Botão de cancelar */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleCancelReservation(reservation.id)}
                                disabled={actionLoading[`cancel_${reservation.id}`]}
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                {actionLoading[`cancel_${reservation.id}`] ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Cancelando...</span>
                                  </div>
                                ) : (
                                  'Cancelar Reserva'
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-cinza-medio mx-auto mb-4" />
                    <p className="text-cinza-medio dark:text-slate-400 font-inter">
                      Você ainda não possui reservas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-madeira-escura to-madeira-media">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-4">
              Por Que Escolher o Armazém?
            </h2>
            <p className="text-xl text-cinza-claro font-inter">
              Mais de 170 anos de excelência gastronômica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white font-playfair mb-2">
                Tradição Preservada
              </h3>
              <p className="text-cinza-claro font-inter">
                Receitas autênticas passadas através de gerações desde 1854
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white font-playfair mb-2">
                Ingredientes Selecionados
              </h3>
              <p className="text-cinza-claro font-inter">
                Apenas os melhores produtos locais e ingredientes frescos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white font-playfair mb-2">
                Experiência Única
              </h3>
              <p className="text-cinza-claro font-inter">
                Ambiente histórico no coração de Santa Teresa
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}