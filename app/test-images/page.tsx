import SimpleImage from '@/components/ui/SimpleImage'
import NetlifyImage from '@/components/ui/NetlifyImage'

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
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Teste de Imagens - Netlify</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Imagens com SimpleImage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testImages.map((src, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">{src}</h3>
                <div className="w-full h-48 bg-gray-100 rounded">
                  <SimpleImage
                    src={src}
                    alt={`Teste ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Imagens com NetlifyImage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testImages.map((src, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">{src}</h3>
                <div className="w-full h-48 bg-gray-100 rounded relative">
                  <NetlifyImage
                    src={src}
                    alt={`Teste ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Imagens Básicas (img tag)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testImages.map((src, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">{src}</h3>
                <div className="w-full h-48 bg-gray-100 rounded">
                  <img
                    src={src}
                    alt={`Teste ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/placeholder.svg'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Debug Info</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Base URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
            <p><strong>Current Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</p>
          </div>
        </section>
      </div>
    </div>
  )
} 