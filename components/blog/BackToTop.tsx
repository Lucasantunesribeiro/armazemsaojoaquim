'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar o botão quando rolar mais de 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-40 lg:bottom-8 lg:left-8"
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}