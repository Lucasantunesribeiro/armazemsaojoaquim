import { requireAdmin } from '@/lib/auth/middleware'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar se o usuário é admin
  await requireAdmin()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Armazém São Joaquim
            </p>
          </div>
          
          <nav className="px-4 pb-6">
            <ul className="space-y-2">
              <li>
                <a
                  href="/admin"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/admin/users"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Usuários
                </a>
              </li>
              <li>
                <a
                  href="/admin/reservations"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Reservas
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}