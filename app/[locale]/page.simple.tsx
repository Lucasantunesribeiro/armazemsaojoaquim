export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Armazém São Joaquim
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Restaurante e Pousada em Santa Teresa, RJ
          </p>
          <div className="bg-amber-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-amber-800 mb-4">
              Bem-vindos!
            </h2>
            <p className="text-amber-700">
              Nossa página está sendo carregada. Em breve você poderá conhecer nosso menu, 
              fazer reservas e descobrir tudo sobre nossa história.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
