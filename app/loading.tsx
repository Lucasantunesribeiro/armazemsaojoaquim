import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image 
              src="/images/logo.jpg" 
              alt="Armazém São Joaquim Logo" 
              fill
              className="object-cover rounded-full shadow-lg"
              priority
            />
          </div>
          
          <div className="loading-heritage absolute inset-0 w-28 h-28 rounded-full border-4 border-transparent border-t-amber-500 -top-2 -left-2 mx-auto"></div>
        </div>
        
        <h2 className="font-playfair text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Carregando...
        </h2>
        <p className="text-slate-600 dark:text-slate-300 font-inter">
          Preparando uma experiência única para você
        </p>
        
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
} 