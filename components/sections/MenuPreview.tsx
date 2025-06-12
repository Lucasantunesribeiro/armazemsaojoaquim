'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Wine, Coffee, Utensils, ChefHat, Star, Clock, Users, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'

const MenuPreview = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const menuCategories = [
    {
      icon: ChefHat,
      title: 'Aperitivos Especiais',
      description: 'Entradas que despertam os sentidos com sabores únicos',
      items: [
        { name: 'Patatas Bravas Armazém', price: 'R$ 28', description: 'Com molho especial da casa' },
        { name: 'Croqueta de Costela 12h', price: 'R$ 32', description: 'Costela desfiada com redução' },
        { name: 'Ceviche Carioca', price: 'R$ 38', description: 'Peixe fresco com toque tropical' }
      ],
      gradient: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50',
      image: '/images/aperitivos.jpg'
    },
    {
      icon: Utensils,
      title: 'Pratos Principais',
      description: 'Gastronomia brasileira com técnicas contemporâneas',
      items: [
        { name: 'Bife Ancho Premium', price: 'R$ 89', description: '400g com chimichurri caseiro' },
        { name: 'Atum em Crosta Pistache', price: 'R$ 76', description: 'Selado com risotto de limão' },
        { name: 'Polvo Grelhado Mediterrâneo', price: 'R$ 68', description: 'Com batatas confitadas' }
      ],
      gradient: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      image: '/images/pratos-principais.jpg'
    },
    {
      icon: Wine,
      title: 'Feijoada Tradicional',
      description: 'A autêntica feijoada brasileira do Armazém',
      items: [
        { name: 'Feijoada Individual', price: 'R$ 45', description: 'Porção individual completa' },
        { name: 'Feijoada para Dois', price: 'R$ 82', description: 'Ideal para compartilhar' },
        { name: 'Buffet de Feijoada', price: 'R$ 55', description: 'Buffet livre aos sábados' }
      ],
      gradient: 'from-slate-600 to-slate-800',
      bgColor: 'bg-slate-50',
      image: '/images/feijoada.jpg'
    }
  ]

  const specialties = [
    { icon: Star, title: 'Drinks Premiados', count: '12+' },
    { icon: Coffee, title: 'Cafés Especiais', count: '8+' },
    { icon: Wine, title: 'Vinhos Selecionados', count: '25+' },
    { icon: Users, title: 'Pratos para Compartilhar', count: '6+' }
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
      className="relative py-24 overflow-hidden bg-gradient-to-br from-white via-slate-50 to-amber-50/20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L60.5 39.5L100 50L60.5 60.5L50 100L39.5 60.5L0 50L39.5 39.5z' fill='%23D4AF37' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
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
            <div className="inline-flex items-center space-x-2 bg-amber-100 border border-amber-200 rounded-full px-6 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800 text-sm font-semibold tracking-wide">GASTRONOMIA ESPECIAL</span>
            </div>

            <h2 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-slate-900 via-amber-900 to-amber-700 bg-clip-text text-transparent mb-8 leading-tight">
              Sabores que Contam<br />
              <span className="text-amber-600">Nossa História</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-12">
              Uma experiência gastronômica que combina tradição familiar e inovação contemporânea
            </p>

            <Link href="/menu" className="group inline-block">
              <Button 
                size="lg" 
                className={cn(
                  "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
                  "text-white font-bold text-lg px-8 py-4 rounded-2xl",
                  "shadow-xl hover:shadow-amber-500/25",
                  "transform hover:scale-105 hover:-translate-y-1",
                  "transition-all duration-300"
                )}
              >
                <span className="flex items-center space-x-2">
                  <span>Cardápio Completo</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Specialties Stats */}
          <div className={cn(
            "grid grid-cols-2 md:grid-cols-4 gap-6 mb-20",
            "transition-all duration-1000 delay-300 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "group text-center p-6 rounded-2xl transition-all duration-500",
                    "bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg",
                    "hover:bg-white/80 hover:scale-105 hover:-translate-y-2",
                    "hover:shadow-xl"
                  )}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 transition-all duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{specialty.count}</div>
                  <div className="text-sm text-slate-600 font-medium">{specialty.title}</div>
                </div>
              )
            })}
          </div>

          {/* Menu Categories */}
          <div className={cn(
            "mb-20",
            "transition-all duration-1000 delay-500 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {menuCategories.map((category, index) => {
                const Icon = category.icon
                return (
                  <button
                    key={index}
                    onClick={() => setActiveCategory(index)}
                    className={cn(
                      "flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300",
                      index === activeCategory
                        ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg scale-105`
                        : 'bg-white/50 text-slate-700 hover:bg-white/80 hover:scale-105'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{category.title}</span>
                  </button>
                )
              })}
            </div>

            {/* Active Category Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                <div>
                  <h3 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    {menuCategories[activeCategory].title}
                  </h3>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    {menuCategories[activeCategory].description}
                  </p>
                </div>

                <div className="space-y-4">
                  {menuCategories[activeCategory].items.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "group p-6 rounded-2xl transition-all duration-300",
                        "bg-white/60 backdrop-blur-sm border border-white/20",
                        "hover:bg-white/80 hover:scale-105 hover:-translate-y-1",
                        "hover:shadow-lg"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
                          {item.name}
                        </h4>
                        <span className={cn(
                          "text-xl font-bold px-3 py-1 rounded-lg",
                          `bg-gradient-to-r ${menuCategories[activeCategory].gradient} text-white`
                        )}>
                          {item.price}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Image */}
              <div className="relative order-1 lg:order-2">
                <div className="relative group">
                  <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                    <div className={cn(
                      "w-full h-full rounded-3xl transition-all duration-700",
                      `bg-gradient-to-br ${menuCategories[activeCategory].gradient}`
                    )}>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                            {React.createElement(menuCategories[activeCategory].icon, { 
                              className: "w-12 h-12 text-white" 
                            })}
                          </div>
                          <h3 className="text-3xl font-bold mb-2">{menuCategories[activeCategory].title}</h3>
                          <p className="text-lg opacity-90">{menuCategories[activeCategory].description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full opacity-70 animate-pulse" />
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full opacity-50 animate-pulse delay-1000" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Call to Action */}
          <div className={cn(
            "transition-all duration-1000 delay-700 ease-out",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}>
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 rounded-3xl p-12 overflow-hidden shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              <div className="relative z-10 text-center text-white">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Clock className="w-6 h-6 text-amber-400" />
                  <span className="text-amber-200 font-semibold">Experiência Gastronômica Completa</span>
                </div>

                <h3 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Pronto para uma <span className="text-amber-400">experiência única</span>?
                </h3>
                
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Reserve sua mesa e desfrute da autenticidade culinária de Santa Teresa em um ambiente histórico incomparável
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/reservas" className="group">
                    <Button 
                      size="lg" 
                      className={cn(
                        "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
                        "text-white font-bold text-lg px-8 py-4 rounded-2xl",
                        "shadow-xl hover:shadow-amber-500/25",
                        "transform hover:scale-105 hover:-translate-y-1",
                        "transition-all duration-300"
                      )}
                    >
                      <span className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Reservar Mesa Agora</span>
                      </span>
                    </Button>
                  </Link>

                  <Link href="/menu" className="group">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className={cn(
                        "border-2 border-white text-white hover:bg-white hover:text-slate-900",
                        "font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-sm",
                        "shadow-xl hover:shadow-white/25",
                        "transform hover:scale-105 hover:-translate-y-1",
                        "transition-all duration-300"
                      )}
                    >
                      <span className="flex items-center space-x-2">
                        <ChefHat className="w-5 h-5" />
                        <span>Ver Cardápio Completo</span>
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Products Image */}
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/produtos-venda.jpeg"
              alt="Produtos artesanais e especiais à venda no Armazém São Joaquim"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            
            {/* Floating Info Cards */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Produtos Especiais</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Desfrute de nossos produtos artesanais selecionados especialmente para você
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