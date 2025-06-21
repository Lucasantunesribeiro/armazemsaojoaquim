'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
const heroImages = [
  {
    src: '/images/armazem-fachada-historica.jpg',
    fallback: '/images/placeholder.jpg',
    alt: 'Fachada histórica do Armazém São Joaquim',
    title: 'Patrimônio Histórico',
    subtitle: 'Desde 1854 preservando a história de Santa Teresa'
  },
  {
    src: '/images/armazem-interior-aconchegante.jpg',
    fallback: '/images/placeholder.jpg',
    alt: 'Interior aconchegante do restaurante',
    title: 'Ambiente Acolhedor',
    subtitle: 'Onde cada refeição é uma experiência única'
  },
  {
    src: '/images/santa-teresa-vista-panoramica.jpg',
    fallback: '/images/placeholder.jpg',
    alt: 'Vista panorâmica de Santa Teresa',
    title: 'Vista Deslumbrante',
    subtitle: 'O melhor de Santa Teresa em um só lugar'
  }
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  // Auto-play otimizado do carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 6000) // Aumentado para 6s para melhor UX

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // Marcar como carregado após o primeiro render
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
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

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  // Pause auto-play on user interaction
  const handleUserInteraction = useCallback(() => {
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }, [])

  const currentImage = heroImages[currentSlide]

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background Images - Otimizado para mobile com melhor cobertura */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={imageErrors[index] ? image.fallback : image.src}
              alt={image.alt}
              fill
              className="object-cover object-center"
              priority={index === 0}
              quality={90}
              sizes="100vw"
              onError={() => handleImageError(index)}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        ))}
      </div>

      {/* Overlay gradiente otimizado */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Conteúdo principal - Layout otimizado para mobile */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          {/* Logo/Título principal - Otimizado para mobile */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="block text-amber-300 drop-shadow-lg">Armazém</span>
              <span className="block text-white drop-shadow-lg">São Joaquim</span>
            </h1>
            
            {/* Subtítulo icônico - Responsivo */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 md:mb-8 font-light italic text-amber-200 drop-shadow-md">
              "En esta casa tenemos memoria"
            </p>

            {/* Informações dinâmicas baseadas no slide - Mobile first */}
            <div className="mb-8 md:mb-12 space-y-2 md:space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-amber-300 drop-shadow-md">
                {currentImage.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-sm px-4">
                {currentImage.subtitle}
              </p>
            </div>

            {/* Informações de contato rápido - Stack no mobile */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12 text-sm md:text-base">
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="whitespace-nowrap">Santa Teresa, RJ</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full min-w-0">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="whitespace-nowrap">Ter-Dom: 12h-22h</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full min-w-0">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="whitespace-nowrap">(21) 98565-8443</span>
              </div>
            </div>

            {/* Botões de ação - Mobile optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <a
                href="/menu"
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
              >
                Ver Cardápio
              </a>
              <a
                href="/reservas"
                className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                Fazer Reserva
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Controles do carousel - Pontos menores no mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-1.5 sm:space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index)
                handleUserInteraction()
              }}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-amber-400 scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Botões de navegação - Otimizados para mobile */}
      <button
        onClick={() => {
          prevSlide()
          handleUserInteraction()
        }}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 touch-target"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={() => {
          nextSlide()
          handleUserInteraction()
        }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 touch-target"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </section>
  )
}