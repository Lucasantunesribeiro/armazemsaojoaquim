import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-amber-900 text-amber-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Informações do Restaurante */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-playfair">Armazém São Joaquim</h3>
            <p className="text-amber-200 text-sm leading-relaxed">
              Desde 1854 preservando a história e os sabores de Santa Teresa. 
              Uma experiência gastronômica única no coração do Rio de Janeiro.
            </p>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-amber-300 flex-shrink-0" />
                <span className="text-sm text-amber-200">
                  Santa Teresa, Rio de Janeiro - RJ
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-amber-300 flex-shrink-0" />
                <span className="text-sm text-amber-200">
                  (21) 9999-9999
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-amber-300 flex-shrink-0" />
                <span className="text-sm text-amber-200">
                  contato@armazemsaojoaquim.com.br
                </span>
              </div>
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Funcionamento</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-amber-300 flex-shrink-0" />
                <div className="text-sm text-amber-200">
                  <div>Terça a Domingo</div>
                  <div>18h às 23h</div>
                </div>
              </div>
              <div className="text-sm text-amber-300 font-medium">
                Fechado às segundas-feiras
              </div>
            </div>
          </div>

          {/* Links e Redes Sociais */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Navegação</h4>
            <div className="space-y-2">
              <Link 
                href="/menu" 
                className="block text-sm text-amber-200 hover:text-amber-100 transition-colors"
              >
                Cardápio
              </Link>
              <Link 
                href="/reservas" 
                className="block text-sm text-amber-200 hover:text-amber-100 transition-colors"
              >
                Reservas
              </Link>
              <Link 
                href="/blog" 
                className="block text-sm text-amber-200 hover:text-amber-100 transition-colors"
              >
                Blog
              </Link>
            </div>
            
            <div className="pt-4">
              <h5 className="text-sm font-semibold mb-3">Redes Sociais</h5>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/armazemsaojoaquim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-100 transition-colors"
                  aria-label="Instagram do Armazém São Joaquim"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com/armazemsaojoaquim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-100 transition-colors"
                  aria-label="Facebook do Armazém São Joaquim"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="border-t border-amber-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-amber-300">
              © {new Date().getFullYear()} Armazém São Joaquim. Todos os direitos reservados.
            </p>
            <p className="text-xs text-amber-400">
              Patrimônio histórico preservado desde 1854
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 