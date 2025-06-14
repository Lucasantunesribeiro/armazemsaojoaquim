'use client'

import { useState } from 'react'

const testImages = [
  '/images/logo.jpg',
  '/images/armazem-fachada-historica.jpg',
  '/images/armazem-interior-aconchegante.jpg',
  '/images/santa-teresa-vista-panoramica.jpg',
  '/images/produtos-venda.jpeg',
  '/images/historia.jpg',
  '/images/placeholder.svg'
]

export default function TestImagesPage() {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({})

  const handleImageLoad = (src: string) => {
    setLoadedImages(prev => ({ ...prev, [src]: true }))
  }

  const handleImageError = (src: string) => {
    setErrorImages(prev => ({ ...prev, [src]: true }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Teste de Imagens - Netlify</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Teste de Imagens Simples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testImages.map((src, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">{src}</h3>
                <div className="w-full h-48 bg-gray-100 rounded relative">
                  <img
                    src={src}
                    alt={`Teste ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                    onLoad={() => handleImageLoad(src)}
                    onError={() => handleImageError(src)}
                  />
                  {!loadedImages[src] && !errorImages[src] && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded">
                      <span className="text-gray-500 text-sm">Carregando...</span>
                    </div>
                  )}
                  {errorImages[src] && (
                    <div className="absolute inset-0 bg-red-100 flex items-center justify-center rounded">
                      <span className="text-red-500 text-sm">Erro ao carregar</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs">
                  Status: {loadedImages[src] ? '✅ Carregada' : errorImages[src] ? '❌ Erro' : '⏳ Carregando'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Estatísticas</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Total de imagens:</strong> {testImages.length}</p>
            <p><strong>Carregadas:</strong> {Object.keys(loadedImages).length}</p>
            <p><strong>Com erro:</strong> {Object.keys(errorImages).length}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Debug Info</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Environment:</strong> production</p>
            <p><strong>Static Export:</strong> Ativo</p>
            <p><strong>Teste Page:</strong> Client Component</p>
          </div>
        </section>
      </div>
    </div>
  )
} 