'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Phone, Mail, Clock, Instagram, Send, Star, Calendar, Coffee, ExternalLink, Heart } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'
import Image from 'next/image'

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast.success('Mensagem enviada com sucesso! Retornaremos em breve.')
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        throw new Error('Erro ao enviar')
      }
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

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Localização',
      content: ['Rua Almirante Alexandrino, 470', 'Santa Teresa, Rio de Janeiro - RJ', 'CEP: 20241-262'],
      gradient: 'from-red-500 to-pink-600',
      action: () => window.open('https://maps.google.com/?q=Santa+Teresa+Rio+de+Janeiro', '_blank')
    },
    {
      icon: Phone,
      title: 'Telefone & WhatsApp',
      content: ['+55 21 98565-8443'],
      gradient: 'from-green-500 to-emerald-600',
      action: () => window.open('tel:+5521985658443', '_blank')
    },
    {
      icon: Mail,
      title: 'E-mail',
      content: ['armazemsaojoaquimoficial@gmail.com'],
      gradient: 'from-blue-500 to-indigo-600',
      action: () => window.open('mailto:armazemsaojoaquimoficial@gmail.com', '_blank')
    },
    {
      icon: Clock,
      title: 'Horário',
      content: ['Segunda a Sábado: 8:00 - 20:00', 'Domingo: Fechado'],
      gradient: 'from-amber-500 to-orange-600'
    }
  ]

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/armazemsaojoaquim/',
      gradient: 'from-purple-500 to-pink-600',
      followers: '2.5K+'
    },
    {
      name: 'Pousada',
      icon: ExternalLink,
      url: 'https://vivapp.bukly.com/d/hotel_view/5041',
      gradient: 'from-blue-500 to-indigo-600',
      followers: 'Reservas'
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.6'%3E%3Cpath d='M30 0L35 25L60 30L35 35L30 60L25 35L0 30L25 25z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={cn(
            "text-center mb-20",
            "transition-all duration-1000 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-6 py-2 mb-6">
              <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-200 text-sm font-semibold tracking-wide">VAMOS CONVERSAR</span>
            </div>

            <h2 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Venha nos <span className="text-amber-400">Visitar</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              Estamos no coração histórico de Santa Teresa, prontos para recebê-lo com a melhor hospitalidade carioca
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information & Social */}
            <div className={cn(
              "space-y-8",
              "transition-all duration-1000 delay-300 ease-out",
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}>
              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <div
                      key={index}
                      className={cn(
                        "group relative bg-white/5 backdrop-blur-xl rounded-3xl p-6",
                        "border border-white/10 hover:border-amber-400/50",
                        "transition-all duration-500 hover:bg-white/10",
                        "transform hover:scale-105 hover:-translate-y-2",
                        "shadow-2xl hover:shadow-amber-500/20",
                        info.action ? 'cursor-pointer' : ''
                      )}
                      onClick={info.action}
                    >
                      <div className="absolute -top-4 left-6">
                        <div className={cn(
                          "p-4 rounded-2xl shadow-xl",
                          `bg-gradient-to-br ${info.gradient}`
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="pt-8">
                        <h3 className="font-bold text-lg text-amber-200 mb-3">
                          {info.title}
                        </h3>
                        <div className="space-y-1">
                          {info.content.map((line, lineIndex) => (
                            <p key={lineIndex} className="text-white/80 text-sm leading-relaxed">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Social Media */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center space-x-3 mb-6">
                  <Star className="w-6 h-6 text-amber-400" />
                  <h3 className="font-playfair text-2xl font-bold text-white">
                    Siga-nos & Reserve
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group flex items-center space-x-4 p-4 rounded-2xl",
                          "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
                          "border border-white/10 hover:border-amber-400/50",
                          "transition-all duration-300 hover:scale-105"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-xl shadow-lg",
                          `bg-gradient-to-br ${social.gradient}`
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                            {social.name}
                          </div>
                          <div className="text-sm text-white/60">
                            {social.followers}
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-200 font-semibold text-sm">Dica Especial</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Acompanhe nossas redes para eventos especiais, novidades do cardápio e promoções exclusivas
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={cn(
              "transition-all duration-1000 delay-500 ease-out",
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}>
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center space-x-3 mb-8">
                  <Send className="w-6 h-6 text-amber-400" />
                  <h3 className="font-playfair text-2xl font-bold text-white">
                    Envie uma Mensagem
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-amber-200 text-sm font-semibold mb-2">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        required
                        className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-white/10 backdrop-blur-sm border border-white/20",
                          "text-white placeholder-white/50",
                          "focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
                          "transition-all duration-200"
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-amber-200 text-sm font-semibold mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(21) 99999-9999"
                        className={cn(
                          "w-full px-4 py-3 rounded-xl",
                          "bg-white/10 backdrop-blur-sm border border-white/20",
                          "text-white placeholder-white/50",
                          "focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
                          "transition-all duration-200"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-amber-200 text-sm font-semibold mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-sm border border-white/20",
                        "text-white placeholder-white/50",
                        "focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-amber-200 text-sm font-semibold mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Como podemos ajudá-lo? Conte-nos sobre sua dúvida, sugestão ou pedido especial..."
                      required
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/10 backdrop-blur-sm border border-white/20",
                        "text-white placeholder-white/50",
                        "focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
                        "transition-all duration-200 resize-none"
                      )}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className={cn(
                      "w-full bg-gradient-to-r from-amber-500 to-amber-600",
                      "hover:from-amber-600 hover:to-amber-700",
                      "text-white font-bold text-lg py-4 rounded-xl",
                      "shadow-xl hover:shadow-amber-500/25",
                      "transform hover:scale-105 hover:-translate-y-1",
                      "transition-all duration-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <Send className="w-5 h-5" />
                      <span>{loading ? 'Enviando...' : 'Enviar Mensagem'}</span>
                    </span>
                  </Button>
                </form>

                <div className="mt-8 p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-green-200 font-semibold text-sm">Reservas Rápidas</span>
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    Para reservas urgentes, ligue diretamente ou use nosso WhatsApp
                  </p>
                  <a
                    href="tel:+5521985658443"
                    className={cn(
                      "inline-flex items-center space-x-2 px-4 py-2 rounded-lg",
                      "bg-green-500 hover:bg-green-600 text-white",
                      "text-sm font-semibold transition-colors duration-200"
                    )}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Ligar Agora</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Address Image */}
            <div className="lg:col-span-2">
              <div className="relative h-80 lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
                <Image
                  src="/images/endereco.jpg"
                  alt="Localização do Armazém São Joaquim em Santa Teresa"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                
                {/* Location Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="bg-amber-500 p-3 rounded-xl">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">Nossa Localização</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                          Rua Áurea, 26 - Santa Teresa<br />
                          Rio de Janeiro - RJ, 20241-220
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          📍 No coração histórico de Santa Teresa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection