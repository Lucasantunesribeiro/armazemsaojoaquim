'use client'

import React, { useState } from 'react'
import { Send, Mail, CheckCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'
import Button from './Button'

interface NewsletterSignupProps {
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  placeholder?: string
  buttonText?: string
  title?: string
  description?: string
  showTitle?: boolean
  showDescription?: boolean
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  className,
  variant = 'default',
  placeholder = 'Digite seu melhor e-mail',
  buttonText = 'Inscrever-se',
  title = 'Não Perca Nossas Histórias',
  description = 'Receba as últimas novidades, receitas especiais e eventos exclusivos',
  showTitle = true,
  showDescription = true
}) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Digite seu e-mail para se inscrever')
      return
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Por favor, digite um e-mail válido')
      return
    }

    setLoading(true)
    
    try {
      // Integração com o sistema de email existente
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'newsletter_signup',
          email: email,
          subject: 'Nova inscrição no newsletter - Armazém São Joaquim',
          message: `Nova inscrição no newsletter: ${email}`,
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setSubscribed(true)
        toast.success('Inscrição realizada com sucesso! Obrigado! 🎉')
        setEmail('')
        
        // Analytics tracking
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: 'footer_newsletter'
          })
        }
      } else {
        throw new Error('Erro na resposta do servidor')
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
      toast.error('Erro ao inscrever no newsletter. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (subscribed && variant !== 'compact') {
    return (
      <div className={cn("text-center space-y-4", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-600 font-playfair">
          Inscrição Confirmada!
        </h3>
        <p className="text-cinza-medio font-inter">
          Obrigado por se inscrever. Em breve você receberá nossas novidades!
        </p>
      </div>
    )
  }

  const formVariants = {
    default: "flex flex-col sm:flex-row gap-4 max-w-lg mx-auto",
    compact: "flex flex-col gap-3",
    inline: "flex gap-3"
  }

  const inputVariants = {
    default: cn(
      "flex-1 px-6 py-4 rounded-xl border-0 bg-white/10 backdrop-blur-sm",
      "text-white placeholder-white/60 font-inter",
      "focus:ring-2 focus:ring-amarelo-armazem/50 focus:bg-white/15",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-all duration-300"
    ),
    compact: cn(
      "w-full px-4 py-3 rounded-lg border border-gray-300",
      "text-gray-800 placeholder-gray-500 font-inter",
      "focus:ring-2 focus:ring-amarelo-armazem focus:border-amarelo-armazem",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-all duration-300"
    ),
    inline: cn(
      "flex-1 px-4 py-3 rounded-l-lg border border-gray-300",
      "text-gray-800 placeholder-gray-500 font-inter",
      "focus:ring-2 focus:ring-amarelo-armazem focus:border-amarelo-armazem",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "transition-all duration-300"
    )
  }

  const buttonVariants = {
    default: cn(
      "bg-gradient-to-r from-amarelo-armazem to-yellow-500",
      "hover:from-yellow-500 hover:to-amarelo-armazem",
      "text-madeira-escura font-bold px-8 py-4 rounded-xl",
      "shadow-lg hover:shadow-amarelo-armazem/25",
      "transform hover:scale-105 transition-all duration-300",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    ),
    compact: cn(
      "w-full bg-amarelo-armazem hover:bg-yellow-500",
      "text-madeira-escura font-bold px-6 py-3 rounded-lg",
      "transition-all duration-300",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    ),
    inline: cn(
      "bg-amarelo-armazem hover:bg-yellow-500",
      "text-madeira-escura font-bold px-6 py-3 rounded-r-lg",
      "transition-all duration-300",
      "disabled:opacity-50 disabled:cursor-not-allowed"
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showTitle && variant === 'default' && (
        <div className="inline-flex items-center space-x-2 mb-4">
          <Mail className="w-6 h-6 text-amarelo-armazem" />
          <h3 className="text-2xl md:text-3xl font-bold font-playfair text-amarelo-armazem">
            {title}
          </h3>
        </div>
      )}

      {showTitle && variant === 'compact' && (
        <h4 className="text-lg font-semibold text-gray-800 font-playfair">
          {title}
        </h4>
      )}

      {showDescription && (
        <p className={cn(
          "font-inter leading-relaxed",
          variant === 'default' ? "text-lg text-cinza-claro mb-8" : "text-gray-600 text-sm"
        )}>
          {description}
        </p>
      )}

      <form onSubmit={handleSubmit} className={formVariants[variant]}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className={inputVariants[variant]}
          required
        />
        
        <Button
          type="submit"
          disabled={loading}
          className={buttonVariants[variant]}
        >
          <Send className={cn(
            variant === 'default' ? "w-5 h-5 mr-2" : "w-4 h-4 mr-2"
          )} />
          {loading ? 'Inscrevendo...' : buttonText}
        </Button>
      </form>

      {variant === 'default' && (
        <p className="text-sm text-cinza-claro mt-4 font-inter">
          Prometemos não enviar spam. Apenas histórias deliciosas e ofertas especiais! 🍽️
        </p>
      )}

      {(variant === 'compact' || variant === 'inline') && (
        <p className="text-xs text-gray-500 font-inter">
          Sem spam, apenas novidades especiais 🍽️
        </p>
      )}
    </div>
  )
}

export default NewsletterSignup 