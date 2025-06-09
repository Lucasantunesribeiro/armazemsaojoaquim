'use client'

import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Send } from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Card, CardContent } from '../ui/Card'
import toast from 'react-hot-toast'

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulação de envio (implementar integração real depois)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Mensagem enviada com sucesso! Retornaremos em breve.')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const businessHours = [
    { day: 'Segunda a Sexta', hours: '12:00 - 00:00' },
    { day: 'Sábado', hours: '11:30 - 00:00' },
    { day: 'Domingo', hours: '11:30 - 22:00' },
    { day: 'Happy Hour (Seg-Qui)', hours: '17:00 - 20:00' },
    { day: 'Happy Hour (Sex)', hours: '19:00 - 20:00' },
    { day: 'Café da Manhã', hours: '08:00 - 20:00 (todos os dias)' }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
              Venha nos Visitar
            </h2>
            <p className="text-xl text-cinza-medio max-w-3xl mx-auto">
              Estamos localizados no coração histórico de Santa Teresa, 
              prontos para recebê-lo com o melhor da hospitalidade carioca
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-6">
                    Informações de Contato
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-amarelo-armazem rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-madeira-escura" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-madeira-escura mb-1">Endereço</h4>
                        <p className="text-cinza-medio">
                          Rua São Joaquim, 123<br />
                          Santa Teresa, Rio de Janeiro - RJ<br />
                          CEP: 20241-320
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-vermelho-portas rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-madeira-escura mb-1">Telefone</h4>
                        <p className="text-cinza-medio">
                          <a href="tel:+552122457890" className="hover:text-amarelo-armazem transition-colors">
                            (21) 2245-7890
                          </a>
                        </p>
                        <p className="text-cinza-medio">
                          <a href="tel:+5521987654321" className="hover:text-amarelo-armazem transition-colors">
                            (21) 98765-4321
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-pedra-natural rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-madeira-escura mb-1">E-mail</h4>
                        <p className="text-cinza-medio">
                          <a href="mailto:contato@armazemsaojoaquim.com.br" className="hover:text-amarelo-armazem transition-colors">
                            contato@armazemsaojoaquim.com.br
                          </a>
                        </p>
                        <p className="text-cinza-medio">
                          <a href="mailto:reservas@armazemsaojoaquim.com.br" className="hover:text-amarelo-armazem transition-colors">
                            reservas@armazemsaojoaquim.com.br
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-verde-natura rounded-lg flex items-center justify-center mr-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-playfair text-2xl font-semibold text-madeira-escura">
                      Horário de Funcionamento
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {businessHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-cinza-claro last:border-b-0">
                        <span className="font-medium text-madeira-escura">{schedule.day}</span>
                        <span className={`${schedule.hours === 'Fechado' ? 'text-red-600' : 'text-cinza-medio'}`}>
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-amarelo-armazem/10 rounded-lg border-l-4 border-amarelo-armazem">
                    <p className="text-sm text-madeira-escura">
                      <strong>Atenção:</strong> Recomendamos fazer reserva, especialmente nos fins de semana.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardContent className="p-8">
                  <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-6">
                    Siga-nos nas Redes Sociais
                  </h3>
                  
                  <div className="flex space-x-4">
                    <a 
                      href="https://instagram.com/armazemsaojoaquim" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a 
                      href="https://facebook.com/armazemsaojoaquim" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                  </div>
                  
                  <p className="text-sm text-cinza-medio mt-4">
                    Acompanhe nossos eventos especiais, novidades do cardápio e momentos únicos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardContent className="p-8">
                  <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-6">
                    Envie uma Mensagem
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nome completo"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        required
                      />
                      <Input
                        label="Telefone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <Input
                      label="E-mail"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-madeira-escura mb-2">
                        Mensagem *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 border border-cinza-medio rounded-lg focus:ring-2 focus:ring-amarelo-armazem focus:border-transparent resize-none"
                        placeholder="Como podemos ajudá-lo? Conte-nos sobre sua dúvida, sugestão ou pedido especial..."
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      loading={loading}
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Mensagem
                    </Button>
                    
                    <p className="text-sm text-cinza-medio text-center">
                      Responderemos sua mensagem dentro de 24 horas úteis
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="mt-8">
                <CardContent className="p-0">
                  <div className="relative h-64 bg-cinza-claro rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amarelo-armazem/20 to-vermelho-portas/20 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-madeira-escura mx-auto mb-4" />
                        <h4 className="font-playfair text-xl font-semibold text-madeira-escura mb-2">
                          Venha nos Visitar
                        </h4>
                        <p className="text-cinza-medio mb-4">
                          Santa Teresa, Rio de Janeiro
                        </p>
                        <a 
                          href="https://maps.google.com/?q=Santa+Teresa,+Rio+de+Janeiro"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-amarelo-armazem text-madeira-escura rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Ver no Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection