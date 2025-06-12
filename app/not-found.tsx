'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, Home, ArrowLeft, Coffee, MapPin, Clock, Phone } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/santa-teresa-vista-panoramica.jpg"
            alt="Vista de Santa Teresa"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-madeira-escura/30 via-transparent to-amarelo-armazem/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* 404 Icon */}
            <div className="w-32 h-32 bg-gradient-to-br from-amarelo-armazem to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Search className="w-16 h-16 text-white" />
            </div>
            
            {/* 404 Number */}
            <h1 className="text-8xl md:text-9xl font-bold text-madeira-escura font-playfair leading-none">
              404
            </h1>
            
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-madeira-escura font-playfair">
              Página Não Encontrada
            </h2>
            
            {/* Description */}
            <p className="text-xl text-cinza-medio max-w-2xl mx-auto leading-relaxed font-inter">
              Parece que você se perdeu nas ruas de Santa Teresa! A página que você procura 
              não existe ou foi movida para outro endereço.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-amarelo-armazem hover:bg-yellow-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl font-inter"
              >
                <Home className="w-5 h-5 mr-2" />
                Voltar ao Início
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-madeira-escura font-semibold rounded-xl border-2 border-madeira-escura transition-all duration-300 hover:scale-105 hover:shadow-xl font-inter"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Página Anterior
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-amarelo-armazem to-transparent rounded-full blur-xl" />
        </div>
        <div className="absolute bottom-20 right-10 w-32 h-32 opacity-30">
          <div className="w-full h-full bg-gradient-to-tl from-vermelho-portas to-transparent rounded-full blur-xl" />
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-madeira-escura font-playfair mb-4">
              Que tal explorar nosso Armazém?
            </h3>
            <p className="text-xl text-cinza-medio font-inter">
              Descubra tudo o que temos para oferecer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Menu Card */}
            <Link
              href="/menu"
              className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-cinza-claro/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/produtos-venda.jpeg"
                  alt="Cardápio do Armazém"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-amarelo-armazem text-white px-3 py-1 rounded-full text-sm font-medium font-inter">
                  Cardápio
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-madeira-escura font-playfair mb-2 group-hover:text-amarelo-armazem transition-colors">
                  🍽️ Nosso Menu
                </h4>
                <p className="text-cinza-medio font-inter">
                  Pratos tradicionais brasileiros e drinks artesanais únicos
                </p>
              </div>
            </Link>

            {/* Reservations Card */}
            <Link
              href="/reservas"
              className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-cinza-claro/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/ambiente-interno.jpg"
                  alt="Ambiente do Armazém"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-vermelho-portas text-white px-3 py-1 rounded-full text-sm font-medium font-inter">
                  Reservas
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-madeira-escura font-playfair mb-2 group-hover:text-amarelo-armazem transition-colors">
                  📅 Fazer Reserva
                </h4>
                <p className="text-cinza-medio font-inter">
                  Reserve sua mesa e garanta momentos especiais conosco
                </p>
              </div>
            </Link>

            {/* Blog Card */}
            <Link
              href="/blog"
              className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-cinza-claro/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src="/images/historia.jpg"
                  alt="História do Armazém"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-madeira-escura text-white px-3 py-1 rounded-full text-sm font-medium font-inter">
                  Blog
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-madeira-escura font-playfair mb-2 group-hover:text-amarelo-armazem transition-colors">
                  📖 Nossas Histórias
                </h4>
                <p className="text-cinza-medio font-inter">
                  Descubra 170 anos de história e tradição em Santa Teresa
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-gradient-to-r from-madeira-escura to-madeira-media">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="w-20 h-20 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto">
              <Coffee className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-white font-playfair">
              Ainda com dúvidas?
            </h3>
            
            <p className="text-xl text-cinza-claro font-inter">
              Entre em contato conosco ou venha nos visitar em Santa Teresa
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="flex flex-col items-center space-y-3">
                <MapPin className="w-8 h-8 text-amarelo-armazem" />
                <div className="text-center">
                  <h4 className="font-semibold text-white font-inter">Localização</h4>
                  <p className="text-cinza-claro text-sm font-inter">Santa Teresa, Rio de Janeiro</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <Clock className="w-8 h-8 text-amarelo-armazem" />
                <div className="text-center">
                  <h4 className="font-semibold text-white font-inter">Funcionamento</h4>
                  <p className="text-cinza-claro text-sm font-inter">Ter-Dom: 12h às 23h</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <Phone className="w-8 h-8 text-amarelo-armazem" />
                <div className="text-center">
                  <h4 className="font-semibold text-white font-inter">Contato</h4>
                  <p className="text-cinza-claro text-sm font-inter">(21) 99999-9999</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 