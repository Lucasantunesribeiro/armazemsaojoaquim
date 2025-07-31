'use client'

import { useState, useEffect } from 'react'

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      // Obter a altura total do documento
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      // Obter a posição atual do scroll
      const currentProgress = window.pageYOffset
      // Calcular a porcentagem
      const scrolled = (currentProgress / totalHeight) * 100
      setProgress(Math.min(scrolled, 100))
    }

    // Calcular progresso inicial
    calculateProgress()

    // Adicionar listener para scroll
    window.addEventListener('scroll', calculateProgress, { passive: true })
    
    // Recalcular quando a tela redimensionar
    window.addEventListener('resize', calculateProgress, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', calculateProgress)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}