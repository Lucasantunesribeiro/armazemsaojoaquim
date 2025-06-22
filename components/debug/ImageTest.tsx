'use client'

import Image from 'next/image'
import { useState } from 'react'

const ImageTest = () => {
  const [imageStates, setImageStates] = useState<Record<string, { loaded: boolean, error: boolean }>>({})

  const testImages = [
    '/images/blog/historia-armazem.jpg',
    '/images/blog/drinks.jpg', 
    '/images/blog/segredos-feijoada.jpg',
    '/images/blog/eventos.jpg',
    '/images/santa-teresa-vista-panoramica.jpg',
    '/images/bondinho.jpg'
  ]

  const handleImageLoad = (src: string) => {
    setImageStates(prev => ({
      ...prev,
      [src]: { loaded: true, error: false }
    }))
    console.log('✅ Imagem carregada:', src)
  }

  const handleImageError = (src: string) => {
    setImageStates(prev => ({
      ...prev,
      [src]: { loaded: false, error: true }
    }))
    console.error('❌ Erro ao carregar imagem:', src)
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🧪 Teste de Carregamento de Imagens</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {testImages.map((src, index) => {
          const state = imageStates[src]
          return (
            <div key={src} className="border rounded p-2">
              <div className="relative w-full h-32 mb-2 bg-gray-200 rounded">
                <Image
                  src={src}
                  alt={`Teste ${index + 1}`}
                  fill
                  className="object-cover rounded"
                  onLoad={() => handleImageLoad(src)}
                  onError={() => handleImageError(src)}
                />
              </div>
              <div className="text-xs">
                <div className="font-mono text-gray-600 truncate" title={src}>
                  {src.split('/').pop()}
                </div>
                <div className={`mt-1 ${
                  state?.loaded ? 'text-green-600' : 
                  state?.error ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {state?.loaded ? '✅ Carregada' : 
                   state?.error ? '❌ Erro' : 
                   '⏳ Carregando...'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImageTest 