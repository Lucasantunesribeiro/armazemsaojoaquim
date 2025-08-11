export default function TestMinimal() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Teste Mínimo</h1>
        <p className="text-gray-600 mt-4">Se você vê esta página, o Next.js está funcionando!</p>
        <div className="mt-8 space-y-2">
          <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}
