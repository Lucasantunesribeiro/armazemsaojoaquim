'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, Calendar, Phone, MapPin } from 'lucide-react'
import { useSupabase } from '../providers/SupabaseProvider'
import Button from '../ui/Button'
import ThemeToggle from '../ui/ThemeToggle'
import { cn } from '../../lib/utils'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, supabase } = useSupabase()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Nossa História', href: '/historia' },
    { name: 'Cardápio', href: '/menu' },
    { name: 'Reservas', href: '/reservas' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contato', href: '/contato' },
  ]

  return (
    <>
      {/* Top Bar - Informações de Contato */}
      <div className="bg-heritage text-creme-antigo py-2 text-sm hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+55 21 98565-8443</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Rua Almirante Alexandrino, 470 - Santa Teresa</span>
              </div>
            </div>
            <div className="text-xs italic">
              "En esta casa tenemos memoria" - 170 anos de história
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500 border-b-2',
          isScrolled
            ? 'bg-surface/95 backdrop-blur-md shadow-elevated border-border-accent'
            : 'bg-surface/90 backdrop-blur-sm border-border'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <Image 
                    src="/images/logo.jpg" 
                    alt="Armazém São Joaquim" 
                    width={100} 
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-colonial rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-cinza-carvao">170</span>
                </div>
              </div>
              <div className="hidden sm:block group-hover:transform group-hover:scale-105 transition-transform duration-300">
                <h1 className="font-playfair font-bold text-2xl text-gradient-heritage leading-tight">
                  Armazém São Joaquim
                </h1>
                <p className="text-sm text-text-secondary font-medium">
                  Patrimônio Cultural de Santa Teresa
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 relative overflow-hidden group',
                    pathname === item.href
                      ? 'text-colonial bg-colonial/10 shadow-sm'
                      : 'text-text-primary hover:text-colonial hover:bg-warmth/5'
                  )}
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/reservas?view=list">
                    <Button variant="outline" size="sm" className="btn-heritage text-xs">
                      <Calendar className="w-4 h-4 mr-2" />
                      Minhas Reservas
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-text-secondary hover:text-heritage"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button className="btn-colonial shadow-md hover:shadow-lg">
                    <User className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-3">
              <ThemeToggle />
              <button
                className="p-2 rounded-lg text-heritage hover:bg-heritage/10 transition-all duration-300 hover:scale-105"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden pb-6 border-t border-border bg-surface-elevated/95 backdrop-blur-md animate-fade-in">
              <nav className="flex flex-col mt-4">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'px-4 py-3 text-base font-semibold transition-all duration-300 border-l-4 hover:bg-heritage/5',
                      pathname === item.href
                        ? 'text-colonial border-colonial bg-colonial/5'
                        : 'text-text-primary border-transparent hover:border-warmth hover:text-heritage'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="px-4 pt-6 mt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-3">
                      <Link href="/reservas?view=list" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full btn-nature">
                          <Calendar className="w-4 h-4 mr-2" />
                          Minhas Reservas
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full text-text-secondary hover:text-heritage"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full btn-colonial">
                        <User className="w-4 h-4 mr-2" />
                        Entrar / Registrar
                      </Button>
                    </Link>
                  )}
                  
                  {/* Contact Info Mobile */}
                  <div className="mt-6 pt-4 border-t border-border text-sm">
                    <div className="space-y-2 text-text-secondary">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-heritage" />
                        <span>+55 21 98565-8443</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-heritage mt-0.5" />
                        <span>Rua Almirante Alexandrino, 470<br />Santa Teresa, Rio de Janeiro</span>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

export default Header