'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, MapPin, Clock, ExternalLink, Star, Award, Users, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Button from '../ui/Button'
import { config } from '../../lib/config'
import { cn } from '../../lib/utils'

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  
  const heroImages = [
    {
      src: '/images/armazem-fachada-historica.jpg',
      alt: 'Fachada histórica do Armazém São Joaquim em Santa Teresa',
      title: 'Nossa História'
    },
    {
      src: '/images/armazem-interior-aconchegante.jpg',
      alt: 'Interior aconchegante do restaurante com decoração autêntica',
      title: 'Ambiente Acolhedor'
    },
    {
      src: '/images/santa-teresa-vista-panoramica.jpg',
      alt: 'Vista panorâmica de Santa Teresa a partir do Armazém',
      title: 'Vista Única'
    }
  ]

  // Partículas com posições fixas para evitar hydration mismatch
  const particles = [
    { left: 10, top: 20, delay: 0.5, duration: 4 },
    { left: 85, top: 15, delay: 1.2, duration: 3.5 },
    { left: 25, top: 80, delay: 0.8, duration: 4.2 },
    { left: 70, top: 60, delay: 1.8, duration: 3.8 },
    { left: 45, top: 30, delay: 0.3, duration: 4.5 },
    { left: 90, top: 75, delay: 1.5, duration: 3.2 },
    { left: 15, top: 50, delay: 2.1, duration: 4.1 },
    { left: 60, top: 10, delay: 0.7, duration: 3.9 },
    { left: 35, top: 90, delay: 1.4, duration: 3.6 },
    { left: 80, top: 40, delay: 0.9, duration: 4.3 },
    { left: 5, top: 70, delay: 1.7, duration: 3.4 },
    { left: 95, top: 25, delay: 0.4, duration: 4.7 },
    { left: 50, top: 85, delay: 1.9, duration: 3.1 },
    { left: 20, top: 35, delay: 0.6, duration: 4.4 },
    { left: 75, top: 5, delay: 1.3, duration: 3.7 },
    { left: 40, top: 65, delay: 2.2, duration: 4.0 },
    { left: 65, top: 95, delay: 0.2, duration: 3.3 },
    { left: 30, top: 45, delay: 1.6, duration: 4.6 },
    { left: 85, top: 80, delay: 1.0, duration: 3.5 },
    { left: 55, top: 20, delay: 2.0, duration: 4.2 }
  ]

  useEffect(() => {
    setMounted(true)
    setIsVisible(true)
    
    // Preload images to prevent layout shifts
    const imagePromises = heroImages.map((image) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image()
        img.onload = () => resolve()
        img.onerror = () => reject()
        img.src = image.src
      })
    })

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => setImagesLoaded(true))

    // Image rotation interval
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/20"
      aria-label="Seção principal do Armazém São Joaquim"
      role="banner"
    >
      {/* Background Images with Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        {/* Animated gradient overlay while loading */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-amber-900/80 via-slate-900/90 to-slate-800/80",
            "transition-opacity duration-1000",
            imagesLoaded ? 'opacity-0' : 'opacity-100'
          )}
          aria-hidden="true"
        />
        
        {/* Hero Images with Ken Burns effect */}
        {heroImages.map((image, index) => (
          <div
            key={image.src}
            className={cn(
              "absolute inset-0 transition-all duration-1000",
              index === currentImageIndex && imagesLoaded ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              className={cn(
                "object-cover transition-transform duration-[6000ms] ease-out",
                index === currentImageIndex ? 'scale-110' : 'scale-100'
              )}
              quality={90}
              sizes="100vw"
            />
            {/* Dynamic overlay based on image */}
            <div className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === 0 ? "bg-gradient-to-br from-amber-900/60 via-slate-900/70 to-slate-800/80" :
              index === 1 ? "bg-gradient-to-br from-slate-900/60 via-amber-900/70 to-slate-800/80" :
              "bg-gradient-to-br from-slate-800/60 via-slate-900/70 to-amber-900/80"
            )} />
          </div>
        ))}
      </div>

      {/* Floating particles animation - only render after mount */}
      {mounted && (
        <div className="absolute inset-0 z-5 pointer-events-none">
          {particles.map((particle, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 bg-amber-400/30 rounded-full",
                "animate-pulse"
              )}
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "relative z-10 text-center text-white px-4 max-w-7xl mx-auto",
        "transition-all duration-1000 ease-out",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}>
        {/* Header with enhanced typography */}
        <header className="mb-16">
          {/* Badge */}
          <div className={cn(
            "inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-sm",
            "border border-amber-500/30 rounded-full px-6 py-2 mb-8",
            "transition-all duration-500 delay-200",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200 text-sm font-semibold tracking-wide">DESDE 1854</span>
          </div>

          <h1 className={cn(
            "font-playfair text-4xl md:text-6xl lg:text-8xl font-bold mb-6",
            "bg-gradient-to-br from-white via-amber-100 to-amber-300",
            "bg-clip-text text-transparent",
            "drop-shadow-2xl leading-tight",
            "transition-all duration-700 delay-300",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            Armazém<br />
            <span className="text-amber-300">São Joaquim</span>
          </h1>
          
          <p className={cn(
            "text-xl md:text-2xl lg:text-3xl mb-6 max-w-4xl mx-auto",
            "leading-relaxed font-light text-white/90",
            "transition-all duration-700 delay-500",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            Uma jornada gastronômica através da <span className="text-amber-300 font-medium">história</span> de Santa Teresa
          </p>

          <div className={cn(
            "flex items-center justify-center space-x-2 mb-8",
            "transition-all duration-700 delay-700",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400"></div>
            <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-amber-200 text-sm italic tracking-widest">"En esta casa tenemos memoria"</span>
            <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400"></div>
          </div>
        </header>

        {/* Enhanced Action Buttons */}
        <div className={cn(
          "flex flex-col sm:flex-row gap-6 justify-center mb-20",
          "transition-all duration-700 delay-900",
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          <Link href="/menu" className="group">
            <Button 
              size="lg" 
              className={cn(
                "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
                "text-white font-bold text-lg px-8 py-4 rounded-2xl",
                "shadow-2xl hover:shadow-amber-500/25",
                "transform hover:scale-105 hover:-translate-y-1",
                "transition-all duration-300 border-2 border-amber-400/50",
                "min-w-[220px] relative overflow-hidden"
              )}
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Nosso Cardápio</span>
                <ExternalLink className="w-5 h-5 transition-transform group-hover:rotate-12" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
          
          <Link href="/reservas" className="group">
            <Button 
              variant="outline" 
              size="lg" 
              className={cn(
                "border-2 border-white text-white hover:bg-white hover:text-slate-900",
                "font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-sm",
                "shadow-2xl hover:shadow-white/25",
                "transform hover:scale-105 hover:-translate-y-1",
                "transition-all duration-300 min-w-[220px]",
                "bg-white/10 hover:bg-white"
              )}
            >
              <span className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Fazer Reserva</span>
              </span>
            </Button>
          </Link>

          <a 
            href="https://vivapp.bukly.com/d/hotel_view/5041" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className={cn(
                "border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900",
                "font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-sm",
                "shadow-2xl hover:shadow-amber-400/25",
                "transform hover:scale-105 hover:-translate-y-1",
                "transition-all duration-300 min-w-[220px]",
                "bg-amber-400/10 hover:bg-amber-400"
              )}
            >
              <span className="flex items-center space-x-2">
                <span>Nossa Pousada</span>
                <ExternalLink className="w-5 h-5 transition-transform group-hover:rotate-12" />
              </span>
            </Button>
          </a>
        </div>

        {/* Enhanced Info Cards */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto",
          "transition-all duration-700 delay-1100",
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          <div className={cn(
            "group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8",
            "border border-white/10 hover:border-amber-400/50",
            "hover:bg-white/10 transition-all duration-500",
            "transform hover:scale-105 hover:-translate-y-2",
            "shadow-2xl hover:shadow-amber-500/20"
          )}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-2xl shadow-xl">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="pt-8 text-center">
              <h3 className="font-playfair text-xl font-bold mb-4 text-amber-200">Localização Privilegiada</h3>
              <address className="text-white/80 leading-relaxed not-italic">
                <div className="font-semibold text-white">{config.restaurant.address.street}</div>
                <div className="text-amber-200">{config.restaurant.address.neighborhood}</div>
                <div className="text-sm mt-2 text-white/60">Rio de Janeiro, RJ</div>
              </address>
            </div>
          </div>
          
          <div className={cn(
            "group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8",
            "border border-white/10 hover:border-amber-400/50",
            "hover:bg-white/10 transition-all duration-500",
            "transform hover:scale-105 hover:-translate-y-2",
            "shadow-2xl hover:shadow-amber-500/20"
          )}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-2xl shadow-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="pt-8 text-center">
              <h3 className="font-playfair text-xl font-bold mb-4 text-amber-200">Horário de Funcionamento</h3>
              <div className="text-white/80 leading-relaxed space-y-1">
                <div className="font-semibold text-white">Segunda a Sábado</div>
                <div className="text-2xl font-bold text-amber-200">8:00 - 20:00</div>
                <div className="text-sm text-white/60">Domingo: Fechado</div>
              </div>
            </div>
          </div>
          
          <div className={cn(
            "group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8",
            "border border-white/10 hover:border-amber-400/50",
            "hover:bg-white/10 transition-all duration-500",
            "transform hover:scale-105 hover:-translate-y-2",
            "shadow-2xl hover:shadow-amber-500/20"
          )}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-2xl shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="pt-8 text-center">
              <h3 className="font-playfair text-xl font-bold mb-4 text-amber-200">Reservas & Contato</h3>
              <div className="text-white/80 leading-relaxed space-y-2">
                <a 
                  href={`tel:${config.restaurant.contact.phone}`}
                  className={cn(
                    "block text-xl font-bold text-white hover:text-amber-300",
                    "transition-colors duration-200 underline decoration-amber-400/50",
                    "hover:decoration-amber-400"
                  )}
                >
                  {config.restaurant.contact.phone}
                </a>
                <div className="text-sm text-white/60">
                  WhatsApp disponível
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Image Title */}
        <div className={cn(
          "mt-16 mb-8",
          "transition-all duration-500",
          isVisible ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="text-amber-200 text-lg font-semibold">
            {heroImages[currentImageIndex]?.title}
          </div>
        </div>
      </div>

      {/* Enhanced Image Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4 bg-black/20 backdrop-blur-lg rounded-full px-6 py-3 border border-white/10">
          {heroImages.map((image, index) => (
            <button
              key={index}
              aria-label={`Ver ${image.alt}`}
              className={cn(
                "relative w-4 h-4 rounded-full transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black/50",
                "hover:scale-125",
                index === currentImageIndex 
                  ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50' 
                  : 'bg-white/30 hover:bg-white/50'
              )}
              onClick={() => setCurrentImageIndex(index)}
            >
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-75" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center space-y-2 text-white/60">
          <div className="text-xs uppercase tracking-wider">Role para baixo</div>
          <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}