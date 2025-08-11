import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Armazém São Joaquim - Restaurante, Café e Pousada',
  description: 'Armazém São Joaquim - Experimente nossa culinária tradicional brasileira, café artesanal e hospedagem aconchegante.',
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params
  return (
    <html lang={locale} className={inter.className}>
      <body>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
