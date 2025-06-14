'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
// import NetlifyImage from '../ui/NetlifyImage' // Removido para evitar problemas com static export

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
  const [isLoaded, setIsLoaded] = useState(false)

  // Auto-play otimizado do carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 6000) // Aumentado para 6s para melhor UX

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // Preload das imagens para melhor performance
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = heroImages.map((image) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = resolve
          img.src = image.src
        })
      })
      
      await Promise.all(imagePromises)
      setIsLoaded(true)
    }

    preloadImages()
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    setIsAutoPlaying(false)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    setIsAutoPlaying(false)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background Images - Otimizado */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="object-cover will-change-transform absolute inset-0 w-full h-full"
              loading={index === 0 ? 'eager' : 'lazy'}
              onLoad={() => index === 0 && setIsLoaded(true)}
            />
          </div>
        ))}
      </div>

      {/* Overlay gradiente otimizado */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Conteúdo principal - Layout clássico melhorado */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
          {/* Logo/Título principal - Otimizado para LCP */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="block text-amber-300 drop-shadow-lg">Armazém</span>
              <span className="block text-white drop-shadow-lg">São Joaquim</span>
            </h1>
            
            {/* Subtítulo icônico */}
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light italic text-amber-200 drop-shadow-md">
              "En esta casa tenemos memoria"
            </p>

            {/* Informações dinâmicas baseadas no slide */}
            <div className="mb-12 space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-amber-300 drop-shadow-md">
                {heroImages[currentSlide].title}
              </h2>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-sm">
                {heroImages[currentSlide].subtitle}
              </p>
            </div>

            {/* Informações de contato rápido */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-sm md:text-base">
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Santa Teresa, RJ</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Seg-Sáb: 8h-20h</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>(21) 98565-8443</span>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/menu"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
      </div>

      {/* Controles do carousel - Simplificados */}
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

      {/* Botões de navegação - Otimizados */}
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

      {/* Indicador de progresso simplificado */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30">
        <div 
          className="h-full bg-amber-400 transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / heroImages.length) * 100}%` }}
        />
      </div>
    </section>
  )
}