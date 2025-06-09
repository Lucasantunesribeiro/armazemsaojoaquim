import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-preto-suave text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-amarelo-armazem rounded-lg flex items-center justify-center">
                  <span className="text-madeira-escura font-bold text-xl">A</span>
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-xl">Armazém São Joaquim</h3>
                  <p className="text-sm text-white/70">"En esta casa tenemos memoria"</p>
                </div>
              </div>
              <p className="text-white/80 mb-6 max-w-md">
                Desde 1854, preservando a história e a autenticidade de Santa Teresa. 
                Um lugar onde cada drink conta uma história e cada refeição é uma celebração.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/armazemsaojoaquim/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amarelo-armazem hover:text-madeira-escura transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/armazemsaojoaquim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amarelo-armazem hover:text-madeira-escura transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4 text-amarelo-armazem">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-white/80 hover:text-amarelo-armazem transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/menu" className="text-white/80 hover:text-amarelo-armazem transition-colors">
                    Cardápio
                  </Link>
                </li>
                <li>
                  <Link href="/reservas" className="text-white/80 hover:text-amarelo-armazem transition-colors">
                    Reservas
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-white/80 hover:text-amarelo-armazem transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="text-white/80 hover:text-amarelo-armazem transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4 text-amarelo-armazem">Contato</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amarelo-armazem mt-0.5 flex-shrink-0" />
                  <div className="text-white/80 text-sm">
                    <p>Rua Almirante Alexandrino, 470</p>
                    <p>Santa Teresa, Rio de Janeiro</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-amarelo-armazem flex-shrink-0" />
                  <span className="text-white/80 text-sm">+55 21 98565-8443</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-amarelo-armazem flex-shrink-0" />
                  <span className="text-white/80 text-sm">armazemjoaquimoficial@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/60 text-sm mb-4 md:mb-0">
                © 2024 Armazém São Joaquim. Todos os direitos reservados.
              </p>
              <div className="flex items-center space-x-1 text-white/60 text-sm">
                <span>Feito com</span>
                <Heart className="w-4 h-4 text-vermelho-portas" />
                <span>em Santa Teresa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer