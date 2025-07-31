'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, MessageCircle, Link, Check } from 'lucide-react'

interface SocialShareButtonsProps {
  title: string
  excerpt?: string
  url?: string
}

export default function SocialShareButtons({ title, excerpt, url }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  
  // Usar URL atual se não for fornecida
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedExcerpt = encodeURIComponent(excerpt || '')

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const openShareWindow = (url: string) => {
    window.open(
      url,
      'share-dialog',
      'width=600,height=400,resizable=yes,scrollbars=yes'
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="font-playfair font-semibold text-gray-800 mb-4 flex items-center">
        <Share2 className="w-5 h-5 mr-2" />
        Compartilhar este artigo
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {shareLinks.map((platform) => (
          <button
            key={platform.name}
            onClick={() => openShareWindow(platform.url)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${platform.color} ${platform.textColor}`}
            aria-label={`Compartilhar no ${platform.name}`}
          >
            <platform.icon className="w-4 h-4 mr-2" />
            <span className="font-medium">{platform.name}</span>
          </button>
        ))}
        
        <button
          onClick={copyToClipboard}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            copied 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label="Copiar link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              <span className="font-medium">Copiado!</span>
            </>
          ) : (
            <>
              <Link className="w-4 h-4 mr-2" />
              <span className="font-medium">Copiar Link</span>
            </>
          )}
        </button>
      </div>
      
      {excerpt && (
        <p className="text-sm text-gray-600 mt-4">
          "{excerpt}"
        </p>
      )}
    </div>
  )
}