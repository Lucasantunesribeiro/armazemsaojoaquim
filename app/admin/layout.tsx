import { requireAdmin } from '@/lib/auth/middleware'
import ClientRedirect from './client-redirect'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Comentar temporariamente a verificação server-side para debug
  // await requireAdmin()
  
  return (
    <>
      <ClientRedirect />
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
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8z" />
                    </svg>
                    Dashboard
                  </a>
                </li>
                
                {/* Blog Management */}
                <li>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2">
                    Blog
                  </div>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href="/admin/blog"
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ml-4"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Posts
                      </a>
                    </li>
                    <li>
                      <a
                        href="/admin/blog/new"
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ml-4"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Novo Post
                      </a>
                    </li>
                  </ul>
                </li>

                {/* Menu Management */}
                <li>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-2">
                    Menu
                  </div>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href="/admin/menu"
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ml-4"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Itens
                      </a>
                    </li>
                    <li>
                      <a
                        href="/admin/categories"
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ml-4"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Categorias
                      </a>
                    </li>
                  </ul>
                </li>

                {/* User Management */}
                <li>
                  <a
                    href="/admin/users"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Usuários
                  </a>
                </li>

                {/* Reservations Management */}
                <li>
                  <a
                    href="/admin/reservations"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
    </>
  )
}