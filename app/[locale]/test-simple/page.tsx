export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-md w-full mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">✅</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Página de Teste Funcionando
        </h2>
        <p className="text-gray-600 mb-8">
          Se você está vendo esta página, a rota [locale] está funcionando corretamente.
        </p>
        
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  )
} 