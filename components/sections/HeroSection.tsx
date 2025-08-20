'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MapPin, Clock, Phone } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
import Link from 'next/link'

export default function HeroSection() {
  const { t, isReady } = useTranslations()

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout>()
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useRef(false)

  // Memoize hero images data - MUST BE BEFORE CONDITIONAL RETURNS
  const heroImages = useMemo(() => [
    {
      src: '/images/armazem-fachada-historica.webp',
      fallback: '/images/placeholder.jpg',
      alt: 'Fachada histórica do Armazém São Joaquim',
      title: isReady ? t('home.history.title') : 'História',
      subtitle: isReady ? t('home.history.description') : 'Nossa tradição',
      cta: isReady ? t('home.hero.discoverMenu') : 'Descobrir Menu'
    },
    {
      src: '/images/armazem-interior-aconchegante.webp',
      fallback: '/images/placeholder.jpg',
      alt: 'Interior aconchegante do restaurante',
      title: isReady ? t('home.hero.title') : 'Bem-vindos',
      subtitle: isReady ? t('home.hero.subtitle') : 'Experiência única',
      cta: isReady ? t('home.hero.makeReservation') : 'Fazer Reserva'
    },
    {
      src: '/images/santa-teresa-vista-panoramica.webp',
      fallback: '/images/placeholder.jpg',
      alt: 'Vista panorâmica de Santa Teresa',
      title: isReady ? t('home.location.title') : 'Localização',
      subtitle: isReady ? t('home.location.description') : 'Santa Teresa, RJ',
      cta: isReady ? t('home.hero.visitUs') : 'Nos Visite'
    }
  ], [t, isReady])

  const quickInfo = useMemo(() => [
    { icon: MapPin, text: 'Santa Teresa, RJ', label: isReady ? t('nav.contact') : 'Contato', href: '#location' },
    { icon: Clock, text: 'Ter-Dom: 12h-22h', label: isReady ? t('cafe.hours.title') : 'Horário', href: '#hours' },
            { icon: Phone, text: '(21) 98565-8443', label: isReady ? t('footer.phone') : 'Telefone', href: 'tel:+5521985658443' }
  ], [t, isReady])

  // Callbacks - MUST BE BEFORE CONDITIONAL RETURNS
  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }, [])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % 3) // Fixed number for heroImages.length
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3) // Fixed number for heroImages.length
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide])

  // ALL USEEFFECTS - MUST BE BEFORE CONDITIONAL RETURNS
  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Intersection Observer for performance
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView.current = entry.isIntersecting
        if (!entry.isIntersecting && isAutoPlaying) {
          setIsAutoPlaying(false)
        }
      },
      { threshold: 0.5 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isAutoPlaying])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsAutoPlaying(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Auto-play carousel with performance optimization - MOVED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    if (!isAutoPlaying || !isInView.current || isHovered || prefersReducedMotion) return

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3) // Fixed number to avoid circular dependency
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, isHovered, prefersReducedMotion])

  // Preload next image - MOVED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const nextIndex = (currentSlide + 1) % 3 // Fixed number to avoid circular dependency
    const heroImages = [
      '/images/armazem-fachada-historica.webp',
      '/images/armazem-interior-aconchegante.webp',
      '/images/santa-teresa-vista-panoramica.webp'
    ]
    const nextImage = new window.Image()
    nextImage.src = heroImages[nextIndex]
  }, [currentSlide])

  // Wait for translations to be ready
  if (!isReady) {
    return (
      <section className="relative h-screen min-h-[600px] max-h-[1000px] overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium">Carregando...</p>
          </div>
        </div>
      </section>
    )
  }

  const currentImage = heroImages[currentSlide]

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen min-h-[600px] max-h-[1000px] overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="banner"
      aria-label={t('home.hero.sectionAriaLabel')}
    >
      {/* Background Images with Art Direction */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`
              absolute inset-0 transition-opacity duration-1000 ease-in-out
              ${index === currentSlide ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <Image
              src={imageErrors[index] ? image.fallback : image.src}
              alt={image.alt}
              fill
              className="object-cover object-center"
              priority={index === 0} // Only prioritize first image
              quality={90}
              sizes="100vw"
              onError={() => handleImageError(index)}
              onLoad={index === 0 ? handleImageLoad : undefined}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Cc5xmwBcDvvGgKOeT7/8AhLLdwxWfILvUP//Z"
            />
          </div>
        ))}
      </div>

      {/* Progressive Enhancement Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium">{t('common.loading')}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        <div className="w-full max-w-5xl mx-auto text-center text-white">
          
          {/* Main Title with Fluid Typography */}
          <div className="mb-6 sm:mb-8">
            <h1 className="font-playfair font-bold leading-[0.9] tracking-tight">
              <span className="block text-[clamp(3.5rem,12vw,8rem)] text-amber-300 drop-shadow-2xl mb-2 transform transition-transform duration-500 hover:scale-105">
                Armazém
              </span>
              <span className="block text-[clamp(3.5rem,12vw,8rem)] text-white drop-shadow-2xl transform transition-transform duration-500 hover:scale-105">
                São Joaquim
              </span>
            </h1>
            
            {/* Iconic Subtitle */}
            <p className="text-[clamp(0.875rem,2.5vw,1.5rem)] mt-4 sm:mt-6 font-light italic text-amber-200 drop-shadow-lg tracking-wide">
              "En esta casa tenemos memoria"
            </p>
          </div>

          {/* Dynamic Slide Information */}
          <div className="mb-6 sm:mb-8 transition-all duration-500 ease-out">
            <h2 className="text-[clamp(1.25rem,4vw,2rem)] font-semibold text-amber-300 drop-shadow-lg mb-3">
              {currentImage.title}
            </h2>
            <p className="text-[clamp(0.875rem,2.5vw,1.125rem)] text-gray-200 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              {currentImage.subtitle}
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
              {quickInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  className="group flex items-center space-x-2 sm:space-x-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 hover:border-amber-400/50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label={info.label}
                >
                  <info.icon className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 group-hover:text-amber-300 transition-colors flex-shrink-0" />
                  <span className="text-white text-xs sm:text-sm font-medium group-hover:text-amber-100 transition-colors">
                    {info.text}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Link
              href="/menu"
              className="group bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>{t('home.hero.discoverMenu')}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link
              href="/reservas"
              className="group bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>{currentImage.cta}</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 lg:left-6 top-2/3 sm:top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 dark:bg-white/20 dark:hover:bg-white/30 text-white dark:text-white p-3 sm:p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 min-w-[48px] min-h-[48px] touch-manipulation backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500 group"
        aria-label={t('home.hero.previousSlide')}
      >
        <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 lg:right-6 top-2/3 sm:top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 dark:bg-white/20 dark:hover:bg-white/30 text-white dark:text-white p-3 sm:p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 min-w-[48px] min-h-[48px] touch-manipulation backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500 group"
        aria-label={t('home.hero.nextSlide')}
      >
        <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Screen Reader Information */}
      <div className="sr-only">
        <p>{t('home.hero.slideInfo').replace('{{current}}', (currentSlide + 1).toString()).replace('{{total}}', heroImages.length.toString())}</p>
        <p>{t('home.hero.keyboardNavigation')}</p>
        <p>{t('home.hero.spacebarControl')}</p>
      </div>
    </section>
  )
}