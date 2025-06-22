'use client'

import { useState } from 'react'
import Image from 'next/image'

export const ImageTester = () => {
  const [testResults, setTestResults] = useState<{[key: string]: string}>({})
  
  const testImages = [
    '/images/logo.jpg',
    '/images/logo.avif',
    '/images/placeholder.svg',
    '/images/aperitivos.jpg'
  ]
  
  const testImage = (src: string) => {
    const img = new window.Image()
    img.onload = () => {
      setTestResults(prev => ({ ...prev, [src]: '✅ OK' }))
    }
    img.onerror = () => {
      setTestResults(prev => ({ ...prev, [src]: '❌ ERRO' }))
    }
    img.src = src
  }
  
  const testAllImages = () => {
    testImages.forEach(testImage)
  }
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-4">🔧 Teste de Carregamento de Imagens</h3>
      
      <button 
        onClick={testAllImages}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Testar Imagens
      </button>
      
      <div className="space-y-2">
        {testImages.map(src => (
          <div key={src} className="flex items-center justify-between">
            <span className="text-sm font-mono">{src}</span>
            <span>{testResults[src] || '⏳ Aguardando...'}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        {testImages.map(src => (
          <div key={src} className="text-center">
            <p className="text-xs mb-2">{src.split('/').pop()}</p>
            <Image
              src={src}
              alt="Teste"
              width={50}
              height={50}
              className="mx-auto rounded"
              onError={() => console.log(`Erro ao carregar: ${src}`)}
              onLoad={() => console.log(`Sucesso ao carregar: ${src}`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}