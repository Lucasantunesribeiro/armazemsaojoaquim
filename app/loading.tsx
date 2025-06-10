import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cinza-claro">
      <div className="text-center">
        <div className="relative">
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-amarelo-armazem absolute -top-2 -left-2"></div>
        </div>
        <h2 className="font-playfair text-xl font-semibold text-madeira-escura mb-2">
          Carregando...
        </h2>
        <p className="text-cinza-medio">
          Preparando uma experiência única para você
        </p>
      </div>
    </div>
  )
} 