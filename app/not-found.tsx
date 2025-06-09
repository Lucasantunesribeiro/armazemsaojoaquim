import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen pt-20 bg-cinza-claro">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-madeira-escura" />
            </div>
            <h1 className="font-playfair text-6xl font-bold text-madeira-escura mb-4">
              404
            </h1>
          </div>
          
          <h2 className="font-playfair text-3xl font-bold text-madeira-escura mb-6">
            Página não encontrada
          </h2>
          
          <p className="text-xl text-cinza-medio mb-8 max-w-lg mx-auto">
            A página que você está procurando não existe, foi removida ou o link pode estar incorreto.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button variant="primary" size="lg">
                <Home className="w-5 h-5 mr-2" />
                Ir para Home
              </Button>
            </Link>
            
            <Link href="javascript:history.back()">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          
          {/* Sugestões de navegação */}
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-6">
              Que tal explorar:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <Link href="/menu" className="block p-4 border border-cinza-claro rounded-lg hover:border-amarelo-armazem transition-colors">
                <h4 className="font-semibold text-madeira-escura mb-2">🍽️ Nosso Cardápio</h4>
                <p className="text-sm text-cinza-medio">Pratos tradicionais e drinks artesanais</p>
              </Link>
              
              <Link href="/reservas" className="block p-4 border border-cinza-claro rounded-lg hover:border-amarelo-armazem transition-colors">
                <h4 className="font-semibold text-madeira-escura mb-2">📅 Fazer Reserva</h4>
                <p className="text-sm text-cinza-medio">Reserve sua mesa conosco</p>
              </Link>
              
              <Link href="/blog" className="block p-4 border border-cinza-claro rounded-lg hover:border-amarelo-armazem transition-colors">
                <h4 className="font-semibold text-madeira-escura mb-2">📖 Nosso Blog</h4>
                <p className="text-sm text-cinza-medio">Histórias e memórias de Santa Teresa</p>
              </Link>
              
              <div className="block p-4 border border-cinza-claro rounded-lg">
                <h4 className="font-semibold text-madeira-escura mb-2">📍 Nossa História</h4>
                <p className="text-sm text-cinza-medio">170 anos de tradição no Rio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 