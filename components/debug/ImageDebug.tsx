'use client'
import { useState } from 'react'
import Image from 'next/image'
import SafeImage from '../ui/SafeImage'

interface ImageDebugProps {
  testUrls?: string[]
}

const ImageDebug = ({ 
  testUrls = [
    'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/bife_ancho.png',
    'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/caesar_salad_com_frango.png'
  ]
}: ImageDebugProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({})
  const [imageLoads, setImageLoads] = useState<Record<string, boolean>>({})

  const handleError = (url: string, error: any) => {
    console.error(`❌ Erro na imagem ${url}:`, error)
    setImageErrors(prev => ({ ...prev, [url]: error.toString() }))
  }

  const handleLoad = (url: string) => {
    console.log(`✅ Imagem carregada: ${url}`)
    setImageLoads(prev => ({ ...prev, [url]: true }))
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔍 Debug de Imagens</h2>
      
      {testUrls.map((url, index) => (
        <div key={url} className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Teste {index + 1}</h3>
          <p className="text-sm text-gray-600 mb-4 break-all">{url}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Teste 1: HTML img tag */}
            <div className="border border-blue-200 p-3 rounded">
              <h4 className="font-medium mb-2 text-blue-600">HTML img tag</h4>
              <img
                src={url}
                alt={`Teste ${index + 1} - HTML`}
                className="w-full h-32 object-cover rounded"
                onError={(e) => handleError(`${url}-html`, e)}
                onLoad={() => handleLoad(`${url}-html`)}
              />
              <div className="mt-2 text-xs">
                {imageErrors[`${url}-html`] && (
                  <p className="text-red-500">❌ Erro: {imageErrors[`${url}-html`]}</p>
                )}
                {imageLoads[`${url}-html`] && (
                  <p className="text-green-500">✅ Carregado</p>
                )}
              </div>
            </div>
            
            {/* Teste 2: Next.js Image */}
            <div className="border border-green-200 p-3 rounded">
              <h4 className="font-medium mb-2 text-green-600">Next.js Image</h4>
              <div className="relative w-full h-32">
                <Image
                  src={url}
                  alt={`Teste ${index + 1} - Next.js`}
                  fill
                  className="object-cover rounded"
                  onError={(e) => handleError(`${url}-nextjs`, e)}
                  onLoad={() => handleLoad(`${url}-nextjs`)}
                />
              </div>
              <div className="mt-2 text-xs">
                {imageErrors[`${url}-nextjs`] && (
                  <p className="text-red-500">❌ Erro: {imageErrors[`${url}-nextjs`]}</p>
                )}
                {imageLoads[`${url}-nextjs`] && (
                  <p className="text-green-500">✅ Carregado</p>
                )}
              </div>
            </div>
            
            {/* Teste 3: SafeImage */}
            <div className="border border-purple-200 p-3 rounded">
              <h4 className="font-medium mb-2 text-purple-600">SafeImage</h4>
              <SafeImage
                src={url}
                alt={`Teste ${index + 1} - SafeImage`}
                width={200}
                height={128}
                className="w-full h-32 object-cover rounded"
              />
            </div>
          </div>
        </div>
      ))}
      
      {/* Informações do Next.js */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">ℹ️ Informações do Ambiente</h3>
        <ul className="text-sm space-y-1">
          <li><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</li>
          <li><strong>Next.js:</strong> {process.env.NEXT_PUBLIC_VERCEL_ENV || 'local'}</li>
          <li><strong>URL Base:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</li>
        </ul>
      </div>
    </div>
  )
}

export default ImageDebug 