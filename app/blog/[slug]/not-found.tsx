import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import Button from '../../../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen pt-20 bg-cinza-claro">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Search className="w-24 h-24 text-cinza-medio mx-auto mb-8" />
          
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
            Post não encontrado
          </h1>
          
          <p className="text-xl text-cinza-medio mb-8 max-w-2xl mx-auto">
            O post que você está procurando não existe, foi removido ou o link pode estar incorreto.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button variant="primary" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar para o Blog
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" size="lg">
                Ir para Home
              </Button>
            </Link>
          </div>
          
          {/* Sugestões */}
          <div className="mt-12 text-left max-w-2xl mx-auto">
            <h3 className="font-playfair text-2xl font-semibold text-madeira-escura mb-4">
              Que tal explorar:
            </h3>
            <ul className="space-y-2 text-cinza-medio">
              <li>• Nossas histórias mais recentes no blog</li>
              <li>• O cardápio com pratos tradicionais</li>
              <li>• Informações sobre reservas</li>
              <li>• A história completa do Armazém São Joaquim</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 