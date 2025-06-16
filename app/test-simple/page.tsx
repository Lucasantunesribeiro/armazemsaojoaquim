export default function TestSimplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Teste Simples
        </h1>
        <p className="text-lg text-gray-600">
          Se você está vendo esta página, o Next.js está funcionando!
        </p>
        <div className="mt-8">
          <a 
            href="/" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Voltar para Home
          </a>
        </div>
      </div>
    </div>
  )
} 