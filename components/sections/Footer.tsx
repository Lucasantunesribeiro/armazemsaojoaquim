import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Clock, Heart, Award, Calendar, ExternalLink } from 'lucide-react'
import Image from 'next/image'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden">
      {/* Heritage Pattern Background */}
      <div className="absolute inset-0 bg-gradient-heritage opacity-95" />
      <div className="absolute inset-0 bg-[url('/patterns/colonial-pattern.svg')] opacity-5" />
      
      <div className="relative text-creme-antigo">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <Link href="/" className="flex items-center space-x-4 group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Image 
                        src="/images/logo.jpg" 
                        alt="Armazém São Joaquim" 
                        width={120} 
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-colonial rounded-full flex items-center justify-center border-2 border-creme-antigo">
                      <span className="text-xs font-bold text-cinza-carvao">170</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="font-playfair font-bold text-3xl text-colonial leading-tight">
                      Armazém São Joaquim
                    </h2>
                    <p className="text-bege-pedra font-medium italic">
                      "En esta casa tenemos memoria"
                    </p>
                  </div>
                </Link>
                
                <div className="max-w-md space-y-4">
                  <p className="text-bege-pedra leading-relaxed">
                    Desde 1854, preservamos a história e a autenticidade de Santa Teresa. 
                    Um patrimônio cultural onde cada prato conta uma história e cada momento 
                    é uma celebração da tradição brasileira.
                  </p>
                  
                  {/* Heritage Badge */}
                  <div className="inline-flex items-center space-x-2 bg-overlay-heritage px-4 py-2 rounded-lg border border-colonial/30">
                    <Award className="w-5 h-5 text-colonial" />
                    <span className="text-sm font-semibold text-colonial">
                      Patrimônio Cultural de Santa Teresa
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/armazemsaojoaquim/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-overlay-heritage border border-colonial/30 rounded-xl flex items-center justify-center hover:bg-colonial hover:border-colonial transition-all duration-300 hover:scale-110"
                  >
                    <Instagram className="w-6 h-6 text-colonial group-hover:text-cinza-carvao transition-colors" />
                  </a>
                  <a
                    href="https://vivapp.bukly.com/d/hotel_view/5041"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-overlay-heritage border border-colonial/30 rounded-xl flex items-center justify-center hover:bg-colonial hover:border-colonial transition-all duration-300 hover:scale-110"
                  >
                    <ExternalLink className="w-6 h-6 text-colonial group-hover:text-cinza-carvao transition-colors" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h3 className="font-playfair font-bold text-xl text-colonial border-b-2 border-colonial/30 pb-2">
                  Navegação
                </h3>
                <nav className="space-y-3">
                  {[
                    { name: 'Nossa História', href: '/historia' },
                    { name: 'Cardápio Completo', href: '/menu' },
                    { name: 'Fazer Reserva', href: '/reservas' },
                    { name: 'Blog Cultural', href: '/blog' },
                    { name: 'Fale Conosco', href: '/contato' },
                  ].map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block text-bege-pedra hover:text-colonial transition-colors duration-300 hover:translate-x-2 transform"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Pousada Link */}
                <div className="pt-4 border-t border-colonial/30">
                  <a
                    href="https://vivapp.bukly.com/d/hotel_view/5041"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-colonial hover:text-amarelo-milho font-semibold transition-colors"
                  >
                    <span>Pousada São Joaquim</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Contact & Hours */}
              <div className="space-y-6">
                <h3 className="font-playfair font-bold text-xl text-colonial border-b-2 border-colonial/30 pb-2">
                  Contato & Funcionamento
                </h3>
                
                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-overlay-heritage rounded-lg border border-colonial/20">
                    <MapPin className="w-5 h-5 text-colonial mt-1 flex-shrink-0" />
                    <div className="text-bege-pedra">
                      <p className="font-semibold text-colonial">Endereço</p>
                      <p className="text-sm leading-relaxed">
                        Rua Almirante Alexandrino, 470<br />
                        Santa Teresa, Rio de Janeiro - RJ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-overlay-heritage rounded-lg border border-colonial/20">
                    <Phone className="w-5 h-5 text-colonial flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-colonial">WhatsApp</p>
                      <a 
                        href="tel:+5521985658443" 
                        className="text-bege-pedra hover:text-colonial transition-colors"
                      >
                        +55 21 98565-8443
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-overlay-heritage rounded-lg border border-colonial/20">
                    <Mail className="w-5 h-5 text-colonial flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-colonial">E-mail</p>
                      <a 
                        href="mailto:armazemjoaquimoficial@gmail.com" 
                        className="text-bege-pedra hover:text-colonial transition-colors text-sm"
                      >
                        armazemjoaquimoficial@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="p-4 bg-overlay-heritage rounded-lg border border-colonial/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-5 h-5 text-colonial" />
                    <h4 className="font-semibold text-colonial">Funcionamento</h4>
                  </div>
                  <div className="space-y-1 text-sm text-bege-pedra">
                    <div className="flex justify-between">
                      <span>Terça a Quinta:</span>
                      <span className="text-colonial font-medium">17h às 01h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sexta e Sábado:</span>
                      <span className="text-colonial font-medium">17h às 02h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo:</span>
                      <span className="text-colonial font-medium">15h às 23h</span>
                    </div>
                    <div className="flex justify-between text-vermelho-tijolo">
                      <span>Segunda-feira:</span>
                      <span className="font-medium">Fechado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-colonial/30 bg-madeira-jacaranda/20">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-bege-pedra text-sm">
                  <p>© {currentYear} Armazém São Joaquim. Todos os direitos reservados.</p>
                  <span className="hidden lg:block">•</span>
                  <p>CNPJ: 12.345.678/0001-90</p>
                </div>
                
                <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4">
                  <div className="flex items-center space-x-2 text-bege-pedra text-sm">
                    <span>Desenvolvido com</span>
                    <Heart className="w-4 h-4 text-rosa-bougainville animate-pulse" />
                    <span>em Santa Teresa</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-bege-pedra/80">
                    <Calendar className="w-3 h-3" />
                    <span>Desde 1854 • 170 anos de tradição</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer