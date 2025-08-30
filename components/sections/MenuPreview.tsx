'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Wine, Coffee, Utensils, ChefHat, Star, Clock, Users, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { useTranslations } from '@/hooks/useTranslations'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  available: boolean
  featured: boolean
}

const MenuPreview = () => {
  const { t } = useTranslations()
  const [isVisible, setIsVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Função para buscar itens do menu do banco de dados
  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu?limit=100')
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar itens do menu:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar preço de um item específico
  const getItemPrice = (itemName: string): string => {
    const item = menuItems.find(menuItem => 
      menuItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(menuItem.name.toLowerCase())
    )
    return item ? `R$ ${item.price.toFixed(2).replace('.', ',')}` : 'R$ --'
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const menuCategories = [
    {
      icon: ChefHat,
      title: t('home.menuPreview.categories.appetizers.title'),
      description: t('home.menuPreview.categories.appetizers.description'),
      items: [
        { name: t('home.menuPreview.categories.appetizers.items.patatas.name'), price: getItemPrice('Patatas Bravas'), description: t('home.menuPreview.categories.appetizers.items.patatas.description') },
        { name: t('home.menuPreview.categories.appetizers.items.croqueta.name'), price: getItemPrice('Croqueta de Costela'), description: t('home.menuPreview.categories.appetizers.items.croqueta.description') },
        { name: t('home.menuPreview.categories.appetizers.items.ceviche.name'), price: getItemPrice('Ceviche Carioca'), description: t('home.menuPreview.categories.appetizers.items.ceviche.description') }
      ],
      gradient: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50',
      image: '/images/aperitivos.jpg'
    },
    {
      icon: Utensils,
      title: t('home.menuPreview.categories.mains.title'),
      description: t('home.menuPreview.categories.mains.description'),
      items: [
        { name: t('home.menuPreview.categories.mains.items.ancho.name'), price: getItemPrice('Bife Ancho'), description: t('home.menuPreview.categories.mains.items.ancho.description') },
        { name: t('home.menuPreview.categories.mains.items.tuna.name'), price: getItemPrice('Atum em Crosta'), description: t('home.menuPreview.categories.mains.items.tuna.description') },
        { name: t('home.menuPreview.categories.mains.items.octopus.name'), price: getItemPrice('Polvo Grelhado'), description: t('home.menuPreview.categories.mains.items.octopus.description') }
      ],
      gradient: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      image: '/images/pratos_tradicionais.png'
    },
    {
      icon: Wine,
      title: t('home.menuPreview.categories.feijoada.title'),
      description: t('home.menuPreview.categories.feijoada.description'),
      items: [
        { name: t('home.menuPreview.categories.feijoada.items.individual.name'), price: getItemPrice('Feijoada Individual'), description: t('home.menuPreview.categories.feijoada.items.individual.description') },
        { name: t('home.menuPreview.categories.feijoada.items.couple.name'), price: getItemPrice('Feijoada para Dois'), description: t('home.menuPreview.categories.feijoada.items.couple.description') },
        { name: t('home.menuPreview.categories.feijoada.items.buffet.name'), price: getItemPrice('Buffet de Feijoada'), description: t('home.menuPreview.categories.feijoada.items.buffet.description') }
      ],
      gradient: 'from-slate-600 to-slate-800',
      bgColor: 'bg-slate-50',
      image: '/images/feijoada_tradicional.png'
    }
  ]

  const specialties = [
    { icon: Star, title: t('home.menuPreview.specialties.drinks'), count: '12+' },
    { icon: Coffee, title: t('home.menuPreview.specialties.coffees'), count: '8+' },
    { icon: Wine, title: t('home.menuPreview.specialties.wines'), count: '25+' },
    { icon: Users, title: t('home.menuPreview.specialties.sharing'), count: '6+' }
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

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setActiveCategory((prev) => (prev + 1) % menuCategories.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isVisible, menuCategories.length])

  return (
    <section 
      ref={sectionRef}
      className="relative py-12 md:py-24 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-amber-50/20 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-3">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L60.5 39.5L100 50L60.5 60.5L50 100L39.5 60.5L0 50L39.5 39.5z' fill='%23D4AF37' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={cn(
            "text-center mb-12 md:mb-20",
            "transition-all duration-1000 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/50 rounded-full px-4 md:px-6 py-2 mb-4 md:mb-6">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-800 dark:text-amber-200 text-xs md:text-sm font-semibold tracking-wide">{t('home.menuPreview.badge')}</span>
            </div>

            <h2 className="font-playfair text-3xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-br from-slate-900 via-amber-900 to-amber-700 dark:from-white dark:via-amber-200 dark:to-amber-400 bg-clip-text text-transparent mb-4 md:mb-8 leading-tight px-2">
              {t('home.menuPreview.title')}<br />
              <span className="text-amber-600 dark:text-amber-400">{t('home.menuPreview.titleHighlight')}</span>
            </h2>
            
            <p className="text-base md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 px-4">
              {t('home.menuPreview.description')}
            </p>

            <Link prefetch={true} href="/menu" className="group inline-block">
              <Button 
                size="lg" 
                className={cn(
                  "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
                  "text-white font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl",
                  "shadow-xl hover:shadow-amber-500/25",
                  "transform hover:scale-105 hover:-translate-y-1",
                  "transition-all duration-300"
                )}
              >
                <span className="flex items-center space-x-2">
                  <span>{t('home.menuPreview.fullMenu')}</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Specialties Stats - Responsivo */}
          <div className={cn(
            "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-20",
            "transition-all duration-1000 delay-300 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "group text-center p-4 md:p-6 rounded-2xl transition-all duration-500",
                    "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg",
                    "hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105 hover:-translate-y-2",
                    "hover:shadow-xl"
                  )}
                >
                  <div className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 transition-all duration-300">
                    <Icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">{specialty.count}</div>
                  <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">{specialty.title}</div>
                </div>
              )
            })}
          </div>

          {/* Menu Categories - Mobile Otimizado - COMENTADO */}
          {/* <div className={cn(
            "mb-12 md:mb-20",
            "transition-all duration-1000 delay-500 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            {/* Category Tabs - Scroll horizontal no mobile */}
            {/* <div className="flex overflow-x-auto scrollbar-hide pb-2 md:justify-center gap-3 md:gap-4 mb-8 md:mb-12 -mx-4 px-4 md:mx-0 md:px-0">
              {menuCategories.map((category, index) => {
                const Icon = category.icon
                return (
                  <button
                    key={index}
                    onClick={() => setActiveCategory(index)}
                    className={cn(
                      "flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2 md:py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap",
                      index === activeCategory
                        ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg scale-105`
                        : 'bg-white/50 dark:bg-gray-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105'
                    )}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">{category.title}</span>
                  </button>
                )
              })}
            </div>

            {/* Active Category Content */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                <div className="text-center lg:text-left">
                  <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">
                    {menuCategories[activeCategory].title}
                  </h3>
                  <p className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    {menuCategories[activeCategory].description}
                  </p>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {menuCategories[activeCategory].items.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "group p-4 md:p-6 rounded-2xl transition-all duration-300",
                        "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20",
                        "hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-105 hover:-translate-y-1",
                        "hover:shadow-lg"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h4 className="font-bold text-base md:text-lg text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </h4>
                        <span className={cn(
                          "text-base md:text-xl font-bold px-3 py-1 rounded-lg self-start sm:self-auto",
                          `bg-gradient-to-r ${menuCategories[activeCategory].gradient} text-white`
                        )}>
                          {item.price}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Image - Real Images */}
              {/* <div className="relative order-1 lg:order-2">
                <div className="relative group">
                  <div className="relative h-64 md:h-80 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={menuCategories[activeCategory].image}
                      alt={menuCategories[activeCategory].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      quality={90}
                      priority={true}
                      loading="eager"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Overlay info */}
                    {/* <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                          {React.createElement(menuCategories[activeCategory].icon, { 
                            className: "w-6 h-6 text-white" 
                          })}
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold">{menuCategories[activeCategory].title}</h3>
                          <p className="text-sm md:text-base opacity-90">{menuCategories[activeCategory].description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  {/* <div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full opacity-70 animate-pulse" />
                  <div className="absolute -bottom-6 -left-6 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full opacity-50 animate-pulse delay-1000" />
                </div>
              </div>
            </div>
          </div> */}

          {/* Enhanced Call to Action - Mobile optimizado */}
          <div className={cn(
            "transition-all duration-1000 delay-700 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              <div className="relative z-10 text-center text-white">
                <div className="flex items-center justify-center space-x-2 mb-4 md:mb-6">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  <span className="text-amber-200 font-semibold text-sm md:text-base">{t('home.menuPreview.cta.experience')}</span>
                </div>

                <h3 className="font-playfair text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                  {t('home.menuPreview.cta.title')} <span className="text-amber-400">{t('home.menuPreview.cta.titleHighlight')}</span>?
                </h3>
                
                <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                  {t('home.menuPreview.cta.description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <Link prefetch={true} href="/reservas" className="group">
                    <Button 
                      size="lg" 
                      className={cn(
                        "w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
                        "text-white font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl",
                        "shadow-xl hover:shadow-amber-500/25",
                        "transform hover:scale-105 hover:-translate-y-1",
                        "transition-all duration-300"
                      )}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <Users className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{t('home.menuPreview.cta.reserveNow')}</span>
                      </span>
                    </Button>
                  </Link>

                  <Link prefetch={true} href="/menu" className="group">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className={cn(
                        "w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-slate-900 dark:border-gray-300 dark:hover:bg-gray-300",
                        "font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-2xl backdrop-blur-sm",
                        "shadow-xl hover:shadow-white/25",
                        "transform hover:scale-105 hover:-translate-y-1",
                        "transition-all duration-300"
                      )}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <ChefHat className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{t('home.menuPreview.cta.viewFullMenu')}</span>
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Products Image - Responsivo */}
          <div className="mt-12 md:mt-16 relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/produtos-venda.jpeg"
              alt={t('home.menuPreview.products.alt')}
              fill
              className="object-cover transition-transform duration-700 hover:scale-110"
              quality={90}
              priority={true}
              loading="eager"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            
            {/* Floating Info Cards */}
            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg">
                <h4 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white mb-1 md:mb-2">{t('home.menuPreview.products.title')}</h4>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  {t('home.menuPreview.products.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MenuPreview