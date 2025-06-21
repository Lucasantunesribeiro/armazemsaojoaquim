'use client'

import { useState, useEffect, useRef } from 'react'
import { Award, MapPin, Clock, Users, Heart, Star, Camera, Calendar } from 'lucide-react'
import Link from 'next/link'
import Button from '../ui/Button'
import ImageWithFallback from '../ImageWithFallback'

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const historicalImages = [
    {
      src: '/images/historia.jpg',
      alt: 'História do Armazém São Joaquim desde 1854',
      title: 'Nossa História Centenária',
      description: '170 anos preservando tradições gastronômicas'
    },
    {
      src: '/images/desenho-historico.jpg',
      alt: 'Desenho histórico do bairro de Santa Teresa',
      title: 'Santa Teresa Histórica',
      description: 'O charme colonial que preservamos'
    },
    {
      src: '/images/inicio-jornada.jpeg',
      alt: 'Início da jornada do Armazém São Joaquim',
      title: 'Início da Jornada',
      description: 'De onde começou nossa tradição'
    }
  ]

  const heritageStats = [
    { icon: Calendar, number: 170, suffix: ' anos', label: 'de História', color: 'text-amber-500 dark:text-amber-400' },
    { icon: Heart, number: 1000, suffix: '+', label: 'Clientes Satisfeitos/mês', color: 'text-red-500 dark:text-red-400' },
    { icon: Award, number: 4.8, suffix: '/5', label: 'Avaliação Média', color: 'text-green-500 dark:text-green-400' },
    { icon: Users, number: 5, suffix: ' gerações', label: 'de Tradição Familiar', color: 'text-blue-500 dark:text-blue-400' }
  ]

  const features = [
    {
      icon: MapPin,
      title: 'Localização Privilegiada',
      description: 'No coração histórico de Santa Teresa, com vista para a cidade maravilhosa.',
      highlight: 'Vista Única'
    },
    {
      icon: Award,
      title: 'Patrimônio Histórico',
      description: 'Edificação preservada de 1854, mantendo a autenticidade colonial.',
      highlight: 'Desde 1854'
    },
    {
      icon: Heart,
      title: 'Tradição Familiar',
      description: 'Receitas e técnicas passadas através de gerações de chefs apaixonados.',
      highlight: '5 Gerações'
    },
    {
      icon: Star,
      title: 'Experiência Autêntica',
      description: 'Combinamos história, gastronomia e hospitalidade em cada detalhe.',
      highlight: 'Experiência Única'
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            setIsVisible(true)
            setTimeout(() => setStatsAnimated(true), 500)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [statsAnimated])

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % historicalImages.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isVisible, historicalImages.length])

  const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      if (statsAnimated) {
        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
          current += increment
          if (current >= value) {
            setDisplayValue(value)
            clearInterval(timer)
          } else {
            setDisplayValue(Math.floor(current))
          }
        }, duration / steps)

        return () => clearInterval(timer)
      }
    }, [value]) // Removido statsAnimated da dependência pois é um ref/valor estático

    return (
      <span className="font-bold text-3xl md:text-4xl">
        {displayValue.toLocaleString('pt-BR')}{suffix}
      </span>
    )
  }

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-24 bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20 overflow-hidden"
      id="sobre"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className={`text-center mb-12 md:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-full px-4 md:px-6 py-2 mb-4 md:mb-6">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-800 dark:text-amber-300 text-xs md:text-sm font-semibold tracking-wide">NOSSA ESSÊNCIA</span>
          </div>
          
          <h2 className="font-playfair text-2xl md:text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">
            Uma Casa com <span className="text-amber-600 dark:text-amber-400">Memória</span>
          </h2>
          
          <p className="text-base md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
            Desde 1854, o Armazém São Joaquim é mais que um restaurante — é um guardião das tradições gastronômicas 
            de Santa Teresa, onde cada prato conta uma história e cada visita é uma viagem no tempo.
          </p>
        </div>

        {/* Historical Images Gallery */}
        <div className={`mb-12 md:mb-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Image Display */}
              <div className="relative group order-2 md:order-1">
                <div className="relative h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  {historicalImages.map((image, index) => (
                    <div
                      key={image.src}
                      className={`absolute inset-0 transition-all duration-1000 ${
                        index === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    >
                      <ImageWithFallback
                        src={image.src}
                        alt={image.alt}
                        className="about-image-mobile object-cover w-full h-full"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        fallbackSrc="/images/placeholder.jpg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                        <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{image.title}</h4>
                        <p className="text-white/90 text-sm">{image.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Image Navigation Dots - Reduzidos para mobile */}
                <div className="flex justify-center space-x-1.5 md:space-x-2 mt-4 md:mt-6">
                  {historicalImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                        index === activeImageIndex 
                          ? 'bg-amber-600 dark:bg-amber-400 scale-125' 
                          : 'bg-slate-300 dark:bg-slate-600 hover:bg-amber-400 dark:hover:bg-amber-500'
                      }`}
                      aria-label={`Ver imagem ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats Content */}
              <div className="space-y-6 md:space-y-8 order-1 md:order-2">
                <div className="text-center md:text-left">
                  <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">
                    Números que Contam Nossa História
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg mb-6 md:mb-8">
                    Cada número representa momentos especiais, sorrisos compartilhados e a confiança de gerações que escolheram fazer parte da nossa história.
                  </p>
                </div>

                {/* Stats Grid - Otimizado para mobile */}
                <div 
                  ref={statsRef}
                  className="grid grid-cols-2 gap-4 md:gap-6"
                >
                  {heritageStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <div
                        key={index}
                        className={`text-center p-4 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl 
                        transform hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700
                        ${statsAnimated ? 'animate-fade-in' : ''}`}
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl mb-3 md:mb-4 bg-gradient-to-br 
                        ${index === 0 ? 'from-amber-500 to-orange-500' : 
                          index === 1 ? 'from-red-500 to-pink-500' : 
                          index === 2 ? 'from-green-500 to-emerald-500' : 
                          'from-blue-500 to-cyan-500'}`}
                        >
                          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className={`${stat.color} mb-1 md:mb-2`}>
                          <AnimatedNumber value={stat.number} suffix={stat.suffix} />
                        </div>
                        <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - Otimizado para mobile */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl 
                transform hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700"
              >
                <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 
                text-xs font-bold px-2 md:px-3 py-1 rounded-full">
                  {feature.highlight}
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-10 h-10 md:w-12 md:h-12 rounded-xl 
                flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                
                <h4 className="font-semibold text-lg md:text-xl text-slate-900 dark:text-white mb-2 md:mb-3">
                  {feature.title}
                </h4>
                
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Call to Action - Otimizado para mobile */}
        <div className={`text-center transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 
          text-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
            transform -skew-x-12 translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Venha Fazer Parte da Nossa História
            </h3>
            
            <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
              Reserve sua mesa e descubra por que o Armazém São Joaquim é mais que um restaurante — é um patrimônio vivo de Santa Teresa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/reservas">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-amber-600 hover:bg-amber-50 font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Fazer Reserva
                </Button>
              </Link>
              
              <Link href="/menu">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Camera className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Ver Cardápio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection