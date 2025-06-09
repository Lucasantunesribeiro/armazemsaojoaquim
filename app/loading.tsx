export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cinza-claro">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 bg-amarelo-armazem rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-madeira-escura font-bold text-2xl">A</span>
          </div>
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-amarelo-armazem absolute -top-2 -left-2"></div>
        </div>
        <h2 className="font-playfair text-xl font-semibold text-madeira-escura mb-2">
          Carregando...
        </h2>
        <p className="text-cinza-medio">
          Preparando uma experiência única para você
        </p>
      </div>
    </div>
  )
} 