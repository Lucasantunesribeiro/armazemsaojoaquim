'use client'

import React from 'react'
import Link from 'next/link'
import { 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Facebook,
  Youtube,
  Heart,
  Utensils,
  Calendar,
  Star,
  ChefHat,
  Coffee,
  ExternalLink,
  Download,
  Shield,
  FileText,
  HelpCircle
} from 'lucide-react'
import { FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa'
import Logo from '../atoms/Logo'
import LogoSimple from '../atoms/LogoSimple'
import NewsletterSignup from '../ui/NewsletterSignup'
import MapButton from '../ui/MapButton'
import { cn } from '../../lib/utils'
import { useTranslations } from '@/hooks/useTranslations'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslations()

  const navigationLinks = [
    { name: t('nav.home'), href: '/', icon: Coffee },
    { name: t('nav.restaurant'), href: '/menu', icon: Utensils },
    { name: t('header.makeReservation'), href: '/reservas', icon: Calendar },
    { name: t('nav.blog'), href: '/blog', icon: FileText },
  ]

  const utilityLinks = [
    { name: t('footer.downloadMenu'), href: '/api/cardapio-pdf', icon: Download },
    { name: t('footer.whatsapp'), href: 'https://wa.me/552194099166', icon: FaWhatsapp, external: true },
  ]

  const legalLinks: { name: string; href: string }[] = [
    // Páginas temporariamente desabilitadas - serão implementadas em breve
    // { name: 'Política de Privacidade', href: '/politica-privacidade' },
    // { name: 'Termos de Uso', href: '/termos-uso' },
    // { name: 'Política de Cookies', href: '/cookies' },
  ]

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/armazemsaojoaquim',
      icon: FaInstagram,
      color: 'hover:text-pink-400',
      bgColor: 'hover:bg-pink-500/10'
    },
    {
          name: 'WhatsApp',
    href: 'https://wa.me/552194099166',
    icon: FaWhatsapp,
      color: 'hover:text-green-400',
      bgColor: 'hover:bg-green-500/10'
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com/@armazemsaojoaquim',
      icon: FaTiktok,
      color: 'hover:text-slate-900 dark:hover:text-white',
      bgColor: 'hover:bg-slate-100 dark:hover:bg-slate-800'
    }
  ]

  const scheduleData = [
    { day: t('footer.hours.monday'), hours: t('footer.hours.closed'), closed: true },
    { day: t('footer.hours.tuesdayFriday'), hours: '12h - 22h', closed: false },
    { day: t('footer.hours.weekends'), hours: '12h - 23h', closed: false },
  ]

  return (
    <footer className="relative bg-gradient-to-br from-madeira-escura via-madeira-escura to-preto-suave text-white overflow-hidden">
      {/* Rich Snippets for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "Armazém São Joaquim",
            "description": "Restaurante histórico em Santa Teresa, Rio de Janeiro, preservando tradições gastronômicas desde 1854",
            "url": "https://armazemsaojoaquim.com.br",
            "telephone": "+55-21-94099-1666",
            "email": "armazemsaojoaquimoficial@gmail.com",
            "foundingDate": "1854",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Rua Áurea, 26",
              "addressLocality": "Santa Teresa",
              "addressRegion": "Rio de Janeiro",
              "postalCode": "20241-220",
              "addressCountry": "BR"
            },
            "openingHours": [
              "Tu-Fr 12:00-22:00",
              "Sa-Su 12:00-23:00"
            ],
            "servesCuisine": "Brazilian",
            "priceRange": "$$",
            "acceptsReservations": true,
            "hasMenu": "https://armazemsaojoaquim.com.br/menu",
            "sameAs": [
              "https://instagram.com/armazemsaojoaquim",
              "https://facebook.com/armazemsaojoaquim"
            ]
          })
        }}
      />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="h-full w-full bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F4C430' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-amarelo-armazem to-transparent rounded-full blur-2xl" />
      </div>
      <div className="absolute bottom-0 right-0 w-60 h-60 opacity-10">
        <div className="w-full h-full bg-gradient-to-tl from-vermelho-portas to-transparent rounded-full blur-2xl" />
      </div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 opacity-5">
        <div className="w-full h-full bg-gradient-to-r from-verde-natura to-transparent rounded-full blur-xl" />
      </div>

      <div className="relative z-10">
                 {/* Newsletter Section */}
         <div className="border-b border-white/10">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <div className="text-center max-w-3xl mx-auto">
               <NewsletterSignup
                 variant="default"
                 title={t('footer.newsletter.title')}
                 description={t('footer.newsletter.description')}
                 placeholder={t('footer.newsletter.placeholder')}
                 buttonText={t('footer.newsletter.button')}
               />
             </div>
           </div>
         </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
              
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <LogoSimple />
                </div>
                
                <p className="text-cinza-claro leading-relaxed font-inter max-w-md text-base">
                  {t('footer.brandDescription')}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2 text-sm text-cinza-claro">
                    <Heart className="w-4 h-4 text-vermelho-portas" />
                    <span className="font-inter">170 {t('footer.yearsOfHistory')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-cinza-claro">
                    <Star className="w-4 h-4 text-amarelo-armazem" />
                    <span className="font-inter">{t('footer.culturalHeritage')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-cinza-claro">
                    <ChefHat className="w-4 h-4 text-verde-natura" />
                    <span className="font-inter">{t('footer.artisanalCuisine')}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-amarelo-armazem font-playfair">
                    {t('footer.socialMedia')}
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
                          className={cn(
                            "w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm",
                            "flex items-center justify-center text-cinza-claro",
                            "border border-white/20 transition-all duration-300",
                            "hover:scale-110 hover:shadow-lg hover:border-amarelo-armazem/50",
                            social.color, social.bgColor
                          )}
                          aria-label={`Seguir no ${social.name}`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold font-playfair text-amarelo-armazem">
                  {t('footer.navigation')}
                </h4>
                <nav className="space-y-3">
                  {navigationLinks.map((link) => {
                    const IconComponent = link.icon
                    return (
                      <Link prefetch={true}
                        key={link.name}
                        href={link.href}
                        className={cn(
                          "flex items-center space-x-3 text-cinza-claro",
                          "hover:text-amarelo-armazem transition-all duration-300",
                          "font-inter hover:translate-x-2 transform group"
                        )}
                      >
                        <IconComponent className="w-4 h-4 text-amarelo-armazem/70 group-hover:text-amarelo-armazem" />
                        <span>{link.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Utility Links */}
                <div className="pt-4 space-y-4">
                  <h5 className="text-sm font-semibold text-amarelo-armazem font-inter">
                    {t('footer.utilityLinks')}
                  </h5>
                  <div className="space-y-2">
                    {utilityLinks.map((link) => {
                      const IconComponent = link.icon
                      return (
                        <a
                          key={link.name}
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          className={cn(
                            "flex items-center space-x-3 text-sm text-cinza-claro",
                            "hover:text-amarelo-armazem transition-all duration-300",
                            "font-inter group"
                          )}
                        >
                          <IconComponent className="w-4 h-4 text-amarelo-armazem/70 group-hover:text-amarelo-armazem" />
                          <span>{link.name}</span>
                          {link.external && <ExternalLink className="w-3 h-3 opacity-50" />}
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold font-playfair text-amarelo-armazem">
                  {t('footer.contact')}
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-amarelo-armazem mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-cinza-claro font-inter text-sm leading-relaxed">
                        <strong>Rua Almirante Alexandrino, 470</strong><br />
                        Santa Teresa<br />
                        Rio de Janeiro - RJ<br />
                        CEP: 20241-262
                      </p>
                      <MapButton
                        address="Rua Almirante Alexandrino, 470, Santa Teresa, Rio de Janeiro - RJ"
                        variant="link"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-amarelo-armazem flex-shrink-0" />
                    <a 
                      href="tel:+552194099166" 
                      className="text-cinza-claro hover:text-amarelo-armazem transition-colors duration-300 font-inter text-sm"
                    >
                      (21) 94099-1666
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

                {/* Emergency Contact */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h5 className="text-sm font-semibold text-amarelo-armazem font-inter mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
{t('footer.quickContact')}
                  </h5>
                  <a 
                    href="https://wa.me/552194099166"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700",
                      "text-white px-4 py-2 rounded-lg text-sm font-inter",
                      "transition-all duration-300 hover:scale-105"
                    )}
                  >
                    <Phone className="w-4 h-4" />
                    <span>{t('footer.whatsapp')}</span>
                  </a>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amarelo-armazem" />
                  <h4 className="text-lg font-semibold font-playfair text-amarelo-armazem">
                    {t('footer.hours.title')}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {scheduleData.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-cinza-claro font-inter text-sm">
                        {schedule.day}:
                      </span>
                      <span className={cn(
                        "font-inter text-sm font-medium",
                        schedule.closed ? "text-vermelho-portas" : "text-white"
                      )}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Special Notice */}
                <div className="bg-amarelo-armazem/10 backdrop-blur-sm rounded-lg p-4 border border-amarelo-armazem/20">
                  <p className="text-xs text-amarelo-armazem font-inter leading-relaxed">
                    <strong>Nota:</strong> Recomendamos fazer reserva para garantir sua mesa, 
                    especialmente nos finais de semana e feriados.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-amarelo-armazem font-inter">
                    Nossos Números
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center bg-white/5 rounded p-2">
                      <div className="font-bold text-amarelo-armazem">170+</div>
                      <div className="text-cinza-claro">Anos</div>
                    </div>
                    <div className="text-center bg-white/5 rounded p-2">
                      <div className="font-bold text-amarelo-armazem">1854</div>
                      <div className="text-cinza-claro">Fundação</div>
                    </div>
                    <div className="text-center bg-white/5 rounded p-2">
                      <div className="font-bold text-amarelo-armazem">4.8★</div>
                      <div className="text-cinza-claro">Avaliação</div>
                    </div>
                    <div className="text-center bg-white/5 rounded p-2">
                      <div className="font-bold text-amarelo-armazem">50+</div>
                      <div className="text-cinza-claro">Pratos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0 gap-6">
              
              {/* Copyright */}
              <div className="text-center lg:text-left">
                <p className="text-sm text-cinza-claro font-inter">
                  © {currentYear} <strong className="text-amarelo-armazem">Armazém São Joaquim</strong>. 
                  {t('footer.rightsReserved')}.
                </p>
                <p className="text-xs text-cinza-medio mt-1 font-inter">
                  {t('footer.historicHeritage')}
                </p>
              </div>

              {/* Legal Links - Temporariamente desabilitado */}
              {/* 
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                {legalLinks.map((link, index) => (
                  <React.Fragment key={link.name}>
                    <Link prefetch={true} 
                      href={link.href} 
                      className="text-cinza-claro hover:text-amarelo-armazem transition-colors duration-300 font-inter"
                    >
                      {link.name}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <span className="text-cinza-medio">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              */}

              {/* Badges */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-cinza-claro font-inter">{t('footer.secureWebsite')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                  <Heart className="w-4 h-4 text-vermelho-portas" />
                  <span className="text-xs text-cinza-claro font-inter">{t('footer.madeWithLove')}</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-white/5">
              {/* Location Map Embed */}
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-amarelo-armazem font-playfair mb-4">
                  📍 {t('footer.ourLocation')}
                </h3>
                <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg border border-white/10">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.222964964393!2d-43.188993!3d-22.913273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997e58a0b1e1b1%3A0x4d11c63743e5a5a5!2sRua%20Almirante%20Alexandrino%2C%20470%20-%20Santa%20Teresa%2C%20Rio%20de%20Janeiro%20-%20RJ%2C%2020241-262!5e0!3m2!1spt-BR!2sbr!4v1718040000000!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
    
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização do Armazém São Joaquim"
                    className="rounded-xl"
                  />
                </div>
                <div className="mt-4 space-x-4">
                  <MapButton
                    address="Rua Almirante Alexandrino, 470, Santa Teresa, Rio de Janeiro - RJ"
                    variant="default"
                    className="mx-auto"
                  />
                </div>
              </div>

              {/* Company Description */}
              <div className="text-center">
                <p className="text-xs text-cinza-medio font-inter leading-relaxed max-w-4xl mx-auto">
                  {t('footer.companyDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 