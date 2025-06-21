import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Home, Phone, Mail } from 'lucide-react'

interface AuthHeaderProps {
  showBackButton?: boolean
  title?: string
  subtitle?: string
}

export default function AuthHeader({ 
  showBackButton = true, 
  title = "Armazém São Joaquim",
  subtitle = "Autenticação"
}: AuthHeaderProps) {
  return (
    <header className="relative z-20 w-full">
      {/* Navigation Bar */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-amber-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 relative">
                <Image
                  src="/images/logo.webp"
                  alt="Armazém São Joaquim"
                  fill
                  className="object-contain rounded-full"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-playfair text-xl font-bold text-amber-900 dark:text-amber-200">
                  {title}
                </h1>
                <p className="text-sm text-amber-700/80 dark:text-amber-300/80">{subtitle}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {showBackButton && (
                <Link 
                  href="/" 
                  className="inline-flex items-center text-amber-700 hover:text-amber-800 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline font-medium">Voltar ao site</span>
                  <span className="sm:hidden font-medium">Voltar</span>
                </Link>
              )}
              
              <Link 
                href="/" 
                className="inline-flex items-center text-amber-700 hover:text-amber-800 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline font-medium">Início</span>
              </Link>
              
              <Link 
                href="tel:+5511999999999" 
                className="inline-flex items-center text-amber-700 hover:text-amber-800 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline font-medium">Contato</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 border-b border-amber-100 dark:border-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link 
                href="/" 
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                Início
              </Link>
              <span className="text-amber-400 dark:text-amber-500">/</span>
              <span className="text-amber-800 dark:text-amber-200 font-medium">Autenticação</span>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
} 