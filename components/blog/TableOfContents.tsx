'use client'

import { useState, useEffect } from 'react'
import { List, ChevronRight, ChevronDown } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Extrair todos os cabeçalhos da página
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const headingList: Heading[] = []

    headingElements.forEach((heading, index) => {
      // Criar ID se não existir
      if (!heading.id) {
        const id = heading.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `heading-${index}`
        heading.id = id
      }

      headingList.push({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      })
    })

    setHeadings(headingList)
  }, [])

  useEffect(() => {
    // Observer para detectar qual seção está sendo visualizada
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <>
      {/* Desktop TOC - Fixed Sidebar */}
      <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 w-64 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 z-40">
        <h4 className="font-playfair font-semibold text-gray-800 mb-3 flex items-center">
          <List className="w-4 h-4 mr-2" />
          Índice
        </h4>
        <nav>
          <ul className="space-y-1">
            {headings.map((heading, index) => (
              <li key={`desktop-heading-${index}-${heading.id}`}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`w-full text-left px-2 py-1 rounded text-sm transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 ${
                    activeId === heading.id
                      ? 'bg-amber-100 text-amber-800 font-medium border-l-2 border-amber-500'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile TOC - Collapsible */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
          aria-label="Toggle table of contents"
        >
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </button>
        
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
            <div className="p-4">
              <h4 className="font-playfair font-semibold text-gray-800 mb-3 flex items-center">
                <List className="w-4 h-4 mr-2" />
                Índice
              </h4>
              <nav>
                <ul className="space-y-1">
                  {headings.map((heading, index) => (
                    <li key={`mobile-heading-${index}-${heading.id}`}>
                      <button
                        onClick={() => {
                          scrollToHeading(heading.id)
                          setIsOpen(false)
                        }}
                        className={`w-full text-left px-2 py-2 rounded text-sm transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 ${
                          activeId === heading.id
                            ? 'bg-amber-100 text-amber-800 font-medium border-l-2 border-amber-500'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        style={{ paddingLeft: `${(heading.level - 1) * 8 + 8}px` }}
                      >
                        {heading.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  )
}