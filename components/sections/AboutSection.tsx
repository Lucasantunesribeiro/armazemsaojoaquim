'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Award, MapPin, Clock, Users, Heart, Star, Camera, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/Button'
import ImageWithFallback from '../ImageWithFallback'
import { useTranslations } from '@/hooks/useTranslations'

const AboutSection = () => {
  const { t } = useTranslations()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Get current locale from pathname
  const getCurrentLocale = () => {
    if (pathname.startsWith('/en')) return 'en'
    if (pathname.startsWith('/pt')) return 'pt'
    return 'pt' // default
  }

  const currentLocale = getCurrentLocale()

  const historicalImages = [
    {
      src: '/images/historia.webp',
      alt: t('home.history.alt1'),
      title: t('home.history.title1'),
      description: t('home.history.description1')
    },
    {
      src: '/images/desenho-historico.webp',
      alt: t('home.history.alt2'),
      title: t('home.history.title2'),
      description: t('home.history.description2')
    },
    {
      src: '/images/inicio-jornada.webp',
      alt: t('home.history.alt3'),
      title: t('home.history.title3'),
      description: t('home.history.description3')
    }
  ]

  const heritageStats = [
    { icon: Calendar, number: 170, suffix: t('home.about.stats.yearsSuffix'), label: t('home.about.stats.historyLabel'), color: 'text-amber-500 dark:text-amber-400' },
    { icon: Heart, number: 1000, suffix: '+', label: t('home.about.stats.clientsLabel'), color: 'text-red-500 dark:text-red-400' },
    { icon: Award, number: 4.8, suffix: '/5', label: t('home.about.stats.ratingLabel'), color: 'text-green-500 dark:text-green-400' },
    { icon: Users, number: 5, suffix: t('home.about.stats.generationsSuffix'), label: t('home.about.stats.traditionLabel'), color: 'text-blue-500 dark:text-blue-400' }
  ]

  const features = [
    {
      icon: MapPin,
      title: t('home.about.features.location.title'),
      description: t('home.about.features.location.description'),
      highlight: t('home.about.features.location.highlight')
    },
    {
      icon: Award,
      title: t('home.about.features.heritage.title'),
      description: t('home.about.features.heritage.description'),
      highlight: t('home.about.features.heritage.highlight')
    },
    {
      icon: Heart,
      title: t('home.about.features.tradition.title'),
      description: t('home.about.features.tradition.description'),
      highlight: t('home.about.features.tradition.highlight')
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
      { threshold: 0.1, rootMargin: '50px' }
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
    }, [value, statsAnimated])

    return (
      <span className="font-bold text-2xl sm:text-3xl md:text-4xl">
        {displayValue.toLocaleString('pt-BR')}{suffix}
      </span>
    )
  }

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 overflow-hidden"
      id="sobre"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header Section */}
        <div className={`text-center mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700/50 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-semibold tracking-wide">{t('home.about.badge')}</span>
          </div>
          
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            {t('home.about.title.part1')} <span className="text-amber-600 dark:text-amber-400">{t('home.about.title.part2')}</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed px-2">
            {t('home.about.description')}
          </p>
        </div>

        {/* Historical Images Gallery & Story */}
        <div className={`mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            
            {/* Image Gallery */}
            <div className="relative group order-2 lg:order-1">
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                {historicalImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ${
                      index === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                  >
                    <ImageWithFallback
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white">
                      <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{image.title}</h4>
                      <p className="text-white/90 text-sm">{image.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Image Navigation Dots */}
              <div className="flex justify-center space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                {historicalImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 min-w-[12px] min-h-[12px] touch-manipulation ${
                      index === activeImageIndex 
                        ? 'bg-amber-600 dark:bg-amber-400 scale-125' 
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-amber-400 dark:hover:bg-amber-500 hover:scale-110 active:scale-95'
                    }`}
                    aria-label={t('home.about.imageNav').replace('{{number}}', (index + 1).toString())}
                  />
                ))}
              </div>
            </div>

            {/* Story Text */}
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              <div className="text-center lg:text-left">
                <h3 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                  {t('home.about.motto')}
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto lg:mx-0 mb-4 sm:mb-6"></div>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6">
                  {t('home.about.story.paragraph1')}
                </p>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('home.about.story.paragraph2')}
                </p>
              </div>

              {/* Heritage Stats */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {heritageStats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div 
                      key={index}
                      className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="inline-flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mb-2 sm:mb-4 text-amber-500 dark:text-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <div className={`${stat.color} mb-1 sm:mb-2`}>
                        <AnimatedNumber value={stat.number} suffix={stat.suffix} />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-tight">
                        {stat.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="group relative bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-bl-2xl flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{feature.highlight}</span>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  
                  <h4 className="font-playfair text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {feature.title}
                  </h4>
                  
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className={`text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white p-8 sm:p-12 rounded-3xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>
            
            <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400 mx-auto mb-4 sm:mb-6" />
            
            <h3 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              {t('home.about.cta.title')}
            </h3>
            
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              {t('home.about.cta.description')}
            </p>
            
            <Link prefetch={true} href={`/${currentLocale}/galeria`}>
              <Button 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('home.about.cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection