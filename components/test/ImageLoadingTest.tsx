'use client'

import { useEffect, useState } from 'react'
import SimpleImage from '../ui/SimpleImage'

export default function ImageLoadingTest() {
  const [images, setImages] = useState<HTMLImageElement[]>([])

  useEffect(() => {
    // Aguardar um pouco para garantir que as imagens carregaram
    setTimeout(() => {
      const allImages = Array.from(document.querySelectorAll('img'))
      setImages(allImages)
    }, 2000)
  }, [])

  const lazyImages = images.filter(img => img.loading === 'lazy')
  const eagerImages = images.filter(img => img.loading === 'eager')

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Teste de Loading de Imagens</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Total de imagens:</span>
          <span className="font-bold">{images.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Loading="eager":</span>
          <span className="font-bold text-green-600">{eagerImages.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Loading="lazy":</span>
          <span className="font-bold text-red-600">{lazyImages.length}</span>
        </div>
      </div>

      {lazyImages.length > 0 && (
        <div className="mt-3 p-2 bg-red-50 rounded text-xs">
          <p className="font-bold text-red-600 mb-1">⚠️ Imagens com lazy loading:</p>
          {lazyImages.slice(0, 3).map((img, index) => (
            <div key={index} className="text-red-700">
              {img.alt || 'Sem alt'} - {img.loading}
            </div>
          ))}
          {lazyImages.length > 3 && (
            <div className="text-red-500">... e mais {lazyImages.length - 3}</div>
          )}
        </div>
      )}

      {lazyImages.length === 0 && images.length > 0 && (
        <div className="mt-3 p-2 bg-green-50 rounded text-xs">
          <p className="font-bold text-green-600">✅ Todas as imagens com eager loading!</p>
        </div>
      )}
    </div>
  )
} 