'use client'

import { useEffect } from 'react'

// Component to load non-critical CSS asynchronously
export default function AsyncCSS() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Load non-critical CSS after the page has loaded
    const loadAsyncCSS = () => {
      // Create link elements for non-critical stylesheets
      const stylesheets: string[] = [
        // Add any non-critical CSS files here
        // '/css/non-critical.css'
      ]
      
      stylesheets.forEach(href => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        link.media = 'print'
        link.onload = () => {
          link.media = 'all'
        }
        document.head.appendChild(link)
      })
    }
    
    // Load after initial render
    if (document.readyState === 'complete') {
      loadAsyncCSS()
    } else {
      window.addEventListener('load', loadAsyncCSS)
      return () => window.removeEventListener('load', loadAsyncCSS)
    }
  }, [])
  
  return null
}

// Utility function to preload CSS
export const preloadCSS = (href: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.onload = () => {
      link.rel = 'stylesheet'
    }
    document.head.appendChild(link)
  }
}

// Component for font optimization
export const FontOptimizer = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Preload critical font weights
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap'
    ]
    
    criticalFonts.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      link.onload = () => {
        link.rel = 'stylesheet'
      }
      document.head.appendChild(link)
    })
  }, [])
  
  return null
}