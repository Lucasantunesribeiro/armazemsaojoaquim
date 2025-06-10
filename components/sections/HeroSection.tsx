'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock } from 'lucide-react'
import Button from '../ui/Button'
import { config } from '../../lib/config'

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  
  const heroImages = [
    {
      src: '/images/armazem-fachada-historica.jpg',
      alt: 'Fachada histórica do Armazém São Joaquim em Santa Teresa'
    },
    {
      src: '/images/armazem-interior-aconchegante.jpg',
      alt: 'Interior aconchegante do restaurante com decoração autêntica'
    },
    {
      src: '/images/santa-teresa-vista-panoramica.jpg',
      alt: 'Vista panorâmica de Santa Teresa a partir do Armazém'
    }
  ]

  useEffect(() => {
    // Preload images to prevent layout shifts
    const imagePromises = heroImages.map((image) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = image.src
      })
    })

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => setImagesLoaded(true)) // Continue even if some images fail

    // Image rotation interval
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [heroImages.length])

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Seção principal do Armazém São Joaquim"
      role="banner"
    >
      {/* Background Images with optimized loading */}
      <div className="absolute inset-0 z-0">
        {/* Skeleton/placeholder while loading */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-amarelo-armazem via-vermelho-portas to-madeira-escura transition-opacity duration-1000 ${
            imagesLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />
        
        {/* Hero Images */}
        {heroImages.map((image, index) => (
          <div
            key={image.src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex && imagesLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              width="1920"
              height="1080"
              style={{
                aspectRatio: '16/9',
                contentVisibility: index === currentImageIndex ? 'visible' : 'hidden'
              }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <header>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            Armazém São Joaquim
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Uma experiência gastronômica única no coração de Santa Teresa
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <a href="/menu" aria-label="Ver cardápio completo do restaurante">
            <Button 
              size="lg" 
              className="shadow-xl min-w-[200px]"
              aria-describedby="menu-description"
            >
              Ver Cardápio
            </Button>
          </a>
          <span id="menu-description" className="sr-only">
            Explore nosso cardápio com pratos tradicionais brasileiros e drinks artesanais
          </span>
          
          <a href="/reservas" aria-label="Fazer reserva de mesa no restaurante">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-madeira-escura shadow-xl min-w-[200px]"
              aria-describedby="reserva-description"
            >
              Fazer Reserva
            </Button>
          </a>
          <span id="reserva-description" className="sr-only">
            Reserve sua mesa e garanta uma experiência inesquecível conosco
          </span>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div 
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center min-h-[120px] flex flex-col justify-center"
            role="region"
            aria-labelledby="location-heading"
          >
            <MapPin className="w-8 h-8 mx-auto mb-3 text-amarelo-armazem" aria-hidden="true" />
            <h2 id="location-heading" className="font-semibold mb-2">Localização</h2>
            <address className="text-sm opacity-90 not-italic">
              {config.restaurant.address.street}<br />
              {config.restaurant.address.neighborhood}
            </address>
          </div>
          
          <div 
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center min-h-[120px] flex flex-col justify-center"
            role="region"
            aria-labelledby="hours-heading"
          >
            <Clock className="w-8 h-8 mx-auto mb-3 text-amarelo-armazem" aria-hidden="true" />
            <h2 id="hours-heading" className="font-semibold mb-2">Horário</h2>
            <div className="text-sm opacity-90">
              <p>Seg-Sex: 12h às 00h</p>
              <p>Sáb: 11h30-00h | Dom: 11h30-22h</p>
            </div>
          </div>
          
          <div 
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center min-h-[120px] flex flex-col justify-center"
            role="region"
            aria-labelledby="contact-heading"
          >
            <Calendar className="w-8 h-8 mx-auto mb-3 text-amarelo-armazem" aria-hidden="true" />
            <h2 id="contact-heading" className="font-semibold mb-2">Reservas</h2>
            <p className="text-sm opacity-90">
              <a 
                href={`tel:${config.restaurant.contact.phone}`}
                className="hover:text-amarelo-armazem transition-colors focus:text-amarelo-armazem focus:outline-none focus:ring-2 focus:ring-amarelo-armazem rounded"
                aria-label={`Ligar para ${config.restaurant.contact.phone} para fazer reserva`}
              >
                {config.restaurant.contact.phone}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Image Navigation Dots */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10"
        role="tablist"
        aria-label="Navegação de imagens do carrossel"
      >
        {heroImages.map((image, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === currentImageIndex}
            aria-label={`Ver ${image.alt}`}
            aria-controls={`hero-image-${index}`}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 ${
              index === currentImageIndex 
                ? 'bg-amarelo-armazem scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
      
      {/* Hidden divs for screen readers */}
      {heroImages.map((image, index) => (
        <div
          key={`sr-${index}`}
          id={`hero-image-${index}`}
          className="sr-only"
          role="tabpanel"
          aria-hidden={index !== currentImageIndex}
        >
          {image.alt}
        </div>
      ))}
    </section>
  )
}