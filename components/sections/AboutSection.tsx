import Image from 'next/image'
import { History, Award, Heart } from 'lucide-react'

const AboutSection = () => {
  return (
    <section className="py-20 bg-cinza-claro">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
              Nossa História
            </h2>
            <p className="text-xl text-cinza-medio max-w-3xl mx-auto">
              Desde 1854, preservando a autenticidade e o charme de Santa Teresa
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="font-playfair text-3xl font-semibold text-madeira-escura">
                "En esta casa tenemos memoria"
              </h3>
              <p className="text-lg text-cinza-medio leading-relaxed">
                O Armazém São Joaquim iniciou a sua jornada somando história, autenticidade e 
                diversidade no bairro mais charmoso do Rio de Janeiro, Santa Teresa.
              </p>
              <p className="text-lg text-cinza-medio leading-relaxed">
                Construído em 1854, com fachada de pedra feita à mão, foi armazém com 150 anos 
                de funcionamento ininterrupto, até a morte de sua última herdeira, Stella Cruz em 2000.
              </p>
              <p className="text-lg text-cinza-medio leading-relaxed">
                Santa Teresa parece ter parado no tempo, preservando aspectos do Rio Antigo e 
                guardando uma história em cada esquina.
              </p>
            </div>
            
            <div className="relative">
              <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/armazem-fachada-historica.jpg"
                  alt="Armazém São Joaquim histórico construído em 1854"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-amarelo-armazem text-madeira-escura p-4 rounded-lg shadow-lg">
                <p className="font-bold text-2xl">170</p>
                <p className="text-sm">Anos de História</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-amarelo-armazem rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-madeira-escura" />
              </div>
              <h4 className="font-playfair text-xl font-semibold text-madeira-escura mb-3">
                Patrimônio Histórico
              </h4>
              <p className="text-cinza-medio">
                Construção de 1854 preservada com autenticidade e cuidado histórico
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-vermelho-portas rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-playfair text-xl font-semibold text-madeira-escura mb-3">
                Drinks Premiados
              </h4>
              <p className="text-cinza-medio">
                Coquetéis artesanais que celebram a tradição e inovação da mixologia
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-pedra-natural rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-playfair text-xl font-semibold text-madeira-escura mb-3">
                Alma de Santa Teresa
              </h4>
              <p className="text-cinza-medio">
                O verdadeiro espírito boêmio e cultural do bairro mais charmoso do Rio
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection