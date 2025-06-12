import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, Coffee, BookOpen, Home } from 'lucide-react'

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave flex items-center justify-center pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Illustration */}
        <div className="relative w-80 h-80 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-amarelo-armazem/20 to-vermelho-portas/20 rounded-full blur-3xl" />
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-48 h-48 bg-white rounded-full shadow-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <BookOpen className="w-16 h-16 text-amarelo-armazem mx-auto" />
                <div className="text-6xl font-bold text-madeira-escura font-playfair">404</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amarelo-armazem/20 backdrop-blur-sm px-4 py-2 rounded-full border border-amarelo-armazem/30">
            <Coffee className="w-5 h-5 text-amarelo-armazem" />
            <span className="text-sm font-medium text-amarelo-armazem font-inter">
              Post não encontrado
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-madeira-escura font-playfair leading-tight">
            Ops! Esta História
            <span className="block text-amarelo-armazem">Ainda Não Foi Contada</span>
          </h1>

          <p className="text-xl text-cinza-medio max-w-2xl mx-auto leading-relaxed font-inter">
            O post que você está procurando pode ter sido movido, removido ou nunca existiu. 
            Mas não se preocupe, temos muitas outras histórias deliciosas para compartilhar!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center space-x-2 bg-amarelo-armazem hover:bg-vermelho-portas text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl font-inter"
            >
              <Search className="w-5 h-5" />
              <span>Explorar Blog</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center space-x-2 border-2 border-madeira-escura text-madeira-escura hover:bg-madeira-escura hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 font-inter"
            >
              <Home className="w-5 h-5" />
              <span>Voltar ao Início</span>
            </Link>
          </div>

          {/* Suggestions */}
          <div className="pt-12">
            <h2 className="text-2xl font-bold text-madeira-escura font-playfair mb-6">
              Que tal conhecer estas histórias?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Suggestion 1 */}
              <Link
                href="/blog/historia-do-armazem-sao-joaquim"
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105"
              >
                <div className="relative h-32 bg-gradient-to-br from-amarelo-armazem/20 to-vermelho-portas/20">
                  <Image
                    src="/images/historia.jpg"
                    alt="História do Armazém"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-madeira-escura font-playfair mb-2 group-hover:text-amarelo-armazem transition-colors">
                    História Centenária
                  </h3>
                  <p className="text-sm text-cinza-medio font-inter">
                    Conheça 170 anos de tradição
                  </p>
                </div>
              </Link>

              {/* Suggestion 2 */}
              <Link
                href="/blog/segredos-da-feijoada"
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105"
              >
                <div className="relative h-32 bg-gradient-to-br from-amarelo-armazem/20 to-vermelho-portas/20">
                  <Image
                    src="/images/produtos-venda.jpeg"
                    alt="Feijoada Tradicional"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-madeira-escura font-playfair mb-2 group-hover:text-amarelo-armazem transition-colors">
                    Segredos da Feijoada
                  </h3>
                  <p className="text-sm text-cinza-medio font-inter">
                    Receita tradicional da casa
                  </p>
                </div>
              </Link>

              {/* Suggestion 3 */}
              <Link
                href="/blog/santa-teresa-bairro-historico"
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105"
              >
                <div className="relative h-32 bg-gradient-to-br from-amarelo-armazem/20 to-vermelho-portas/20">
                  <Image
                    src="/images/santa-teresa-vista-panoramica.jpg"
                    alt="Santa Teresa"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-madeira-escura font-playfair mb-2 group-hover:text-amarelo-armazem transition-colors">
                    Santa Teresa
                  </h3>
                  <p className="text-sm text-cinza-medio font-inter">
                    O coração boêmio do Rio
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Back Link */}
          <div className="pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 text-amarelo-armazem hover:text-vermelho-portas font-medium font-inter transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o Blog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 