'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import toast from 'react-hot-toast'

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

const ReservasPage = () => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [reservation, setReservation] = useState<ReservationData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '',
    occasion: '',
    requests: ''
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setReservation(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!reservation.date || !reservation.time || !reservation.guests) {
        toast.error('Por favor, preencha todos os campos obrigatórios')
        return
      }
    }
    
    if (step === 2) {
      if (!reservation.name || !reservation.email || !reservation.phone) {
        toast.error('Por favor, preencha todos os campos obrigatórios')
        return
      }
    }
    
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Simulação de envio de reserva
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Reserva enviada com sucesso! Entraremos em contato para confirmar.')
      setStep(4) // Tela de sucesso
    } catch (error) {
      toast.error('Erro ao enviar reserva. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setReservation({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: '',
      occasion: '',
      requests: ''
    })
    setStep(1)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1) // Mínimo de 1 dia de antecedência
    return today.toISOString().split('T')[0]
  }

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
                          value={reservation.date}
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
                          value={reservation.guests}
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
                          onClick={() => setReservation(prev => ({ ...prev, time }))}
                          className={`p-3 border rounded-lg text-center transition-all ${
                            reservation.time === time
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
                      value={reservation.occasion}
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
                    value={reservation.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="E-mail"
                      type="email"
                      name="email"
                      value={reservation.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      required
                    />

                    <Input
                      label="Telefone"
                      type="tel"
                      name="phone"
                      value={reservation.phone}
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
                      value={reservation.requests}
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
                        <p className="font-semibold text-madeira-escura">{formatDate(reservation.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">Horário</p>
                        <p className="font-semibold text-madeira-escura">{reservation.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">Pessoas</p>
                        <p className="font-semibold text-madeira-escura">{reservation.guests} {reservation.guests === '1' ? 'pessoa' : 'pessoas'}</p>
                      </div>
                      {reservation.occasion && (
                        <div>
                          <p className="text-sm text-cinza-medio">Ocasião</p>
                          <p className="font-semibold text-madeira-escura">{reservation.occasion}</p>
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
                        <p className="font-semibold text-madeira-escura">{reservation.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">E-mail</p>
                        <p className="font-semibold text-madeira-escura">{reservation.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-cinza-medio">Telefone</p>
                        <p className="font-semibold text-madeira-escura">{reservation.phone}</p>
                      </div>
                      {reservation.requests && (
                        <div>
                          <p className="text-sm text-cinza-medio">Pedidos Especiais</p>
                          <p className="font-semibold text-madeira-escura">{reservation.requests}</p>
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
                    <Button onClick={handleSubmit} variant="primary" size="lg" loading={loading}>
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
                      Recebemos sua solicitação de reserva para <strong>{formatDate(reservation.date)}</strong> às <strong>{reservation.time}</strong>.
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
                    <Button onClick={() => window.location.href = '/'} variant="primary">
                      Voltar ao Início
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