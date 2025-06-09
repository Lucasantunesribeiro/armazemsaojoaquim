import Link from 'next/link'
import { ArrowRight, Wine, Coffee, Utensils } from 'lucide-react'
import Button from '../ui/Button'
import { Card, CardContent } from '../ui/Card'

const MenuPreview = () => {
  const menuCategories = [
    {
      icon: Coffee,
      title: 'Aperitivos',
      description: 'Deliciosas opções para começar a refeição',
      items: ['Patatas Bravas', 'Croqueta de Costela', 'Ceviche Carioca'],
      color: 'bg-vermelho-portas'
    },
    {
      icon: Utensils,
      title: 'Pratos Individuais',
      description: 'Gastronomia brasileira com toque contemporâneo',
      items: ['Bife Ancho', 'Atum em Crosta', 'Polvo Grelhado'],
      color: 'bg-amarelo-armazem'
    },
    {
      icon: Wine,
      title: 'Feijoada',
      description: 'A tradicional feijoada brasileira',
      items: ['Feijoada Individual', 'Feijoada para Dois', 'Buffet Livre'],
      color: 'bg-madeira-escura'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-madeira-escura mb-6">
              Nosso Cardápio
            </h2>
            <p className="text-xl text-cinza-medio max-w-3xl mx-auto mb-8">
              Uma experiência gastronômica que combina tradição e inovação, 
              celebrando os sabores autênticos do Brasil
            </p>
            <Link href="/menu">
              <Button variant="outline" size="lg">
                Ver Cardápio Completo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Menu Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {menuCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="font-playfair text-2xl font-semibold text-madeira-escura text-center mb-4">
                      {category.title}
                    </h3>
                    
                    <p className="text-cinza-medio text-center mb-6">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between py-2 border-b border-cinza-claro last:border-b-0">
                          <span className="text-madeira-escura font-medium">{item}</span>
                          <div className="w-2 h-2 bg-amarelo-armazem rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16 p-8 bg-gradient-to-r from-amarelo-armazem to-vermelho-portas rounded-lg">
            <h3 className="font-playfair text-3xl font-bold text-white mb-4">
              Pronto para uma experiência única?
            </h3>
            <p className="text-white/90 mb-6 text-lg">
              Reserve sua mesa e desfrute da autenticidade de Santa Teresa
            </p>
            <Link href="/reservas">
              <Button variant="secondary" size="lg" className="bg-white text-madeira-escura hover:bg-cinza-claro">
                Fazer Reserva Agora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MenuPreview