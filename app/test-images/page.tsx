'use client'

import SafeImage from '../../components/ui/SafeImage'

export default function TestImagesPage() {
  const testImages = [
    {
      name: 'Supabase Working Image',
      src: 'https://tgzgqtxrjvlgfgxhgwzw.supabase.co/storage/v1/object/public/menu-images/caprese_mineira.png',
      description: 'Esta deveria carregar normalmente'
    },
    {
      name: 'Supabase Broken Image (400 error)',
      src: 'https://tgzgqtxrjvlgfgxhgwzw.supabase.co/storage/v1/object/public/menu-images/ceviche_carioca.png',
      description: 'Esta deveria falhar e usar o SVG placeholder'
    },
    {
      name: 'Local SVG Direct',
      src: '/images/menu_images/ceviche_carioca.svg',
      description: 'SVG placeholder direto'
    },
    {
      name: 'Generic Placeholder',
      src: '/images/placeholder.svg',
      description: 'Placeholder genérico'
    },
    {
      name: 'Null Source',
      src: null,
      description: 'Source nulo'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12">
          Teste do Sistema de Imagens
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testImages.map((test, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <SafeImage
                  src={test.src}
                  alt={test.name}
                  fill
                  showPlaceholderIcon={true}
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{test.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                <p className="text-xs text-gray-500 break-all">
                  <strong>SRC:</strong> {test.src || 'null'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Console Debug</h2>
          <p className="text-sm text-gray-600">
            Abra o console do navegador (F12) para ver os logs de debug do SafeImage.
            Cada imagem mostra seu nível de fallback no canto superior direito.
          </p>
        </div>
      </div>
    </div>
  )
} 