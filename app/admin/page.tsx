import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get statistics with fallback for errors
  let totalUsers = 0
  let totalReservations = 0
  let activeReservations = 0
  let totalMenuItems = 0
  let totalBlogPosts = 0
  let totalCategories = 0
  
  try {
    const { count: users } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    totalUsers = users || 0
  } catch (error) {
    console.error('Erro ao contar usuários:', error)
  }
  
  try {
    const { count: reservations } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
    totalReservations = reservations || 0
  } catch (error) {
    console.error('Erro ao contar reservas:', error)
  }
  
  try {
    const { count: active } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmada')
      .gte('data', new Date().toISOString().split('T')[0])
    activeReservations = active || 0
  } catch (error) {
    console.error('Erro ao contar reservas ativas:', error)
  }
  
  try {
    const { count: menuItems } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
    totalMenuItems = menuItems || 0
  } catch (error) {
    console.error('Erro ao contar itens do menu:', error)
  }
  
  try {
    const { count: blogPosts } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
    totalBlogPosts = blogPosts || 0
  } catch (error) {
    console.error('Erro ao contar posts do blog:', error)
  }
  
  try {
    const { count: categories } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true })
    totalCategories = categories || 0
  } catch (error) {
    console.error('Erro ao contar categorias:', error)
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard Administrativo
      </h1>
      
      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-400">
          Bem-vindo ao painel administrativo do Armazém São Joaquim!
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Usuários
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {totalUsers}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Reservas
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {totalReservations}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Reservas Ativas
          </h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
            {activeReservations}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Itens do Menu
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {totalMenuItems}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Posts do Blog
          </h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {totalBlogPosts}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Categorias
          </h3>
          <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-2">
            {totalCategories}
          </p>
        </div>
      </div>
      
      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Menu Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Gerenciar Menu
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/menu"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Itens do Menu</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciar pratos, preços e disponibilidade</p>
              </div>
            </Link>
            
            <Link
              href="/admin/categories"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Categorias</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Organizar categorias do menu</p>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Blog Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Gerenciar Blog
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/blog"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Posts do Blog</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Criar, editar e gerenciar artigos</p>
              </div>
            </Link>
            
            <Link
              href="/admin/blog/new"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Novo Post</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Criar novo artigo para o blog</p>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Reservation Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gerenciar Reservas
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/reservations"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Todas as Reservas</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visualizar e gerenciar todas as reservas</p>
              </div>
            </Link>
            
            <Link
              href="/admin/availability"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Disponibilidade</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configurar horários e capacidade</p>
              </div>
            </Link>
          </div>
        </div>
        
        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Gerenciar Usuários
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Todos os Usuários</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visualizar e gerenciar contas de usuários</p>
              </div>
            </Link>
            
            <Link
              href="/admin/messages"
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Mensagens</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visualizar mensagens de contato</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}