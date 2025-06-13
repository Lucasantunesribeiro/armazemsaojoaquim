'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
import OptimizedImage from '../ui/OptimizedImage'

const heroImages = [
  {
    src: '/images/armazem-fachada-historica.jpg',
    alt: 'Fachada histórica do Armazém São Joaquim',
    title: 'Patrimônio Histórico',
    subtitle: 'Desde 1854 preservando a história de Santa Teresa'
  },
  {
    src: '/images/armazem-interior-aconchegante.jpg', 
    alt: 'Interior aconchegante do restaurante',
    title: 'Ambiente Acolhedor',
    subtitle: 'Onde cada refeição é uma experiência única'
  },
  {
    src: '/images/santa-teresa-vista-panoramica.jpg',
    alt: 'Vista panorâmica de Santa Teresa',
    title: 'Coração de Santa Teresa',
    subtitle: 'No bairro mais charmoso do Rio de Janeiro'
  }
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play do carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0} // Prioridade apenas para a primeira imagem
              quality={90}
              sizes="100vw"
              className="object-cover"
              placeholder="blur"
            />
          </div>
        ))}
      </div>

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Conteúdo principal */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
          {/* Logo/Título principal - otimizado para LCP */}
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent leading-tight">
            Armazém São Joaquim
          </h1>
          
          {/* Subtítulo */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light italic">
            "En esta casa tenemos memoria"
          </p>

          {/* Informações dinâmicas baseadas no slide */}
          <div className="mb-12 space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-amber-300">
              {heroImages[currentSlide].title}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              {heroImages[currentSlide].subtitle}
            </p>
          </div>

          {/* Informações de contato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-black/30 backdrop-blur-sm rounded-lg p-4">
              <MapPin className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Localização</p>
                <p className="text-sm text-gray-300">Santa Teresa, RJ</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 bg-black/30 backdrop-blur-sm rounded-lg p-4">
              <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Funcionamento</p>
                <p className="text-sm text-gray-300">8h às 20h</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 bg-black/30 backdrop-blur-sm rounded-lg p-4">
              <Phone className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Contato</p>
                <p className="text-sm text-gray-300">(21) 98565-8443</p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/menu"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Ver Cardápio
            </a>
            <a
              href="/reservas"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Fazer Reserva
            </a>
          </div>
        </div>
      </div>

      {/* Controles do carousel */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-amber-400 scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Botões de navegação */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicador de progresso */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30">
        <div 
          className="h-full bg-amber-400 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / heroImages.length) * 100}%` }}
        />
      </div>
    </section>
  )
}