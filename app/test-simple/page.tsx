'use client'
import SimpleImage from '../../components/ui/SimpleImage'

export default function TestSimplePage() {
  const testImages = [
    {
      url: '/images/placeholder.svg',
      name: 'Placeholder SVG',
      useFill: true,
      loading: 'eager' as const
    },
    {
      url: 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/posta_de_salmao_grelhado.png',
      name: 'Salmão Grelhado',
      useFill: true,
      loading: 'eager' as const
    },
    {
      url: 'https://enolssforaepnrpfrima.supabase.co/storage/v1/object/public/menu-images/picanha_ao_carvao.png',
      name: 'Picanha ao Carvão',
      useFill: false,
      loading: 'lazy' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Teste SimpleImage - Correção de Warnings
        </h1>
        
        <div className="space-y-8">
          {testImages.map((img, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                {img.name} - {img.useFill ? 'Com Fill' : 'Dimensões Fixas'} - Loading: {img.loading}
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 p-4">
                {img.useFill ? (
                  // Contêiner com altura definida para fill
                  <div className="relative h-48 bg-gray-100 rounded">
                    <SimpleImage
                      src={img.url}
                      alt={img.name}
                      fill
                      loading={img.loading}
                      className="rounded object-cover"
                    />
                  </div>
                ) : (
                  // Dimensões fixas
                  <div className="flex justify-center">
                    <SimpleImage
                      src={img.url}
                      alt={img.name}
                      width={400}
                      height={300}
                      loading={img.loading}
                      className="rounded object-cover"
                    />
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                URL: {img.url}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Instruções de Teste:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Abra o console do navegador (F12)</li>
            <li>Verifique se não há warnings sobre "height value of 0"</li>
            <li>Confirme que as imagens estão carregando corretamente</li>
            <li>Observe se os placeholders têm altura adequada</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 