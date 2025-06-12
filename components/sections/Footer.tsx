'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Heart } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Início', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Reservas', href: '/reservas' },
    { name: 'Blog', href: '/blog' },
  ]

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/armazemsaojoaquim',
      icon: Instagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/armazemsaojoaquim',
      icon: Facebook,
      color: 'hover:text-blue-500'
    }
  ]

  return (
    <footer className="relative bg-gradient-to-br from-madeira-escura via-madeira-media to-madeira-escura text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Top Section */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-4">
                  <Image 
                    src="/images/logo.jpg" 
                    alt="Armazém São Joaquim" 
                    width={60} 
                    height={60} 
                    className="rounded-full ring-2 ring-amarelo-armazem/30"
                  />
                  <div>
                    <h3 className="text-2xl font-bold font-playfair text-amarelo-armazem">
                      Armazém São Joaquim
                    </h3>
                    <p className="text-sm italic text-cinza-claro font-inter">
                      "En esta casa tenemos memoria"
                    </p>
                  </div>
                </div>
                
                <p className="text-cinza-claro leading-relaxed font-inter max-w-md">
                  Desde <strong className="text-amarelo-armazem">1854</strong>, preservamos a tradição gastronômica 
                  de Santa Teresa. Um patrimônio histórico que oferece experiências autênticas 
                  no coração do Rio de Janeiro.
                </p>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-cinza-claro">
                    <Heart className="w-4 h-4 text-vermelho-portas" />
                    <span className="font-inter">170 anos de história</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-cinza-claro">
                    <MapPin className="w-4 h-4 text-amarelo-armazem" />
                    <span className="font-inter">Santa Teresa - RJ</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold font-playfair text-amarelo-armazem">
                  Navegação
                </h4>
                <nav className="space-y-3">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block text-cinza-claro hover:text-amarelo-armazem transition-colors duration-300 font-inter hover:translate-x-1 transform"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Social Links */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-amarelo-armazem font-inter">
                    Redes Sociais
                  </h5>
                  <div className="flex items-center space-x-4">
                    {socialLinks.map((social) => {
                      const IconComponent = social.icon
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                            w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm 
                            flex items-center justify-center text-cinza-claro
                            hover:bg-white/20 ${social.color} transition-all duration-300
                            hover:scale-110 hover:shadow-lg
                          `}
                          aria-label={`Seguir no ${social.name}`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold font-playfair text-amarelo-armazem">
                  Contato
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-amarelo-armazem mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-cinza-claro font-inter text-sm leading-relaxed">
                        Rua Áurea, 26<br />
                        Santa Teresa<br />
                        Rio de Janeiro - RJ<br />
                        CEP: 20241-220
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-amarelo-armazem flex-shrink-0" />
                    <a 
                      href="tel:+5521999999999" 
                      className="text-cinza-claro hover:text-amarelo-armazem transition-colors duration-300 font-inter text-sm"
                    >
                      (21) 99999-9999
                    </a>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-amarelo-armazem flex-shrink-0" />
                    <a 
                      href="mailto:armazemsaojoaquimoficial@gmail.com" 
                      className="text-cinza-claro hover:text-amarelo-armazem transition-colors duration-300 font-inter text-sm break-all"
                    >
                      armazemsaojoaquimoficial@gmail.com
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amarelo-armazem" />
                    <h5 className="text-sm font-semibold text-amarelo-armazem font-inter">
                      Funcionamento
                    </h5>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-cinza-claro font-inter">Ter - Sex:</span>
                      <span className="text-white font-inter">12h - 22h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cinza-claro font-inter">Sáb - Dom:</span>
                      <span className="text-white font-inter">12h - 23h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cinza-claro font-inter">Segunda:</span>
                      <span className="text-vermelho-portas font-inter">Fechado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              
              {/* Copyright */}
              <div className="text-center md:text-left">
                <p className="text-sm text-cinza-claro font-inter">
                  © {currentYear} <strong className="text-amarelo-armazem">Armazém São Joaquim</strong>. 
                  Todos os direitos reservados.
                </p>
                <p className="text-xs text-cinza-medio mt-1 font-inter">
                  Patrimônio histórico preservado desde 1854
                </p>
              </div>

              {/* Legal Links */}
              <div className="flex items-center space-x-6 text-sm">
                <Link 
                  href="/politica-privacidade" 
                  className="text-cinza-claro hover:text-amarelo-armazem transition-colors duration-300 font-inter"
                >
                  Política de Privacidade
                </Link>
                <Link 
                  href="/termos-uso" 
                  className="text-cinza-claro hover:text-amarelo-armazem transition-colors duration-300 font-inter"
                >
                  Termos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-amarelo-armazem to-transparent rounded-full blur-xl" />
        </div>
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10">
          <div className="w-full h-full bg-gradient-to-tl from-vermelho-portas to-transparent rounded-full blur-xl" />
        </div>
      </div>
    </footer>
  )
}