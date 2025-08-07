import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            {/* Icon */}
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="w-12 h-12 text-amber-600" />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-800 mb-4 font-playfair">
              História Não Encontrada
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A história que você está procurando não existe ou foi removida. 
              Que tal explorar outras histórias fascinantes do Armazém São Joaquim?
            </p>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pt/blog"
                className="inline-flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Ver Todas as Histórias</span>
              </Link>
              
              <Link
                href="/pt"
                className="inline-flex items-center justify-center space-x-2 border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-xl font-semibold transition-colors"
              >
                <span>Voltar ao Início</span>
              </Link>
            </div>
            
            {/* Suggestion */}
            <div className="mt-12 p-6 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-700 leading-relaxed">
                <strong>Dica:</strong> Visite nosso restaurante em Santa Teresa para vivenciar nossas histórias pessoalmente! 
                Cada prato conta uma história, cada ambiente guarda memórias especiais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}