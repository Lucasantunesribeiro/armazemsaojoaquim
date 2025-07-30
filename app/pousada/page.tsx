'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Wifi, Tv, Coffee, Shield, Car, Star, Users, Bath, Bed, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/separator'

interface Room {
  id: string
  name: string
  type: 'STANDARD' | 'DELUXE' | 'SUITE'
  price_refundable: number
  price_non_refundable: number
  description: string
  amenities: string[]
  max_guests: number
  image_url: string
  available: boolean
}

export default function PousadaPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL')

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/pousada/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Erro ao carregar quartos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = selectedRoomType === 'ALL' 
    ? rooms 
    : rooms.filter(room => room.type === selectedRoomType)

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'Standard'
      case 'DELUXE': return 'Deluxe'
      case 'SUITE': return 'Suíte'
      default: return type
    }
  }

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'DELUXE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'SUITE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{
            backgroundImage: `url('/images/pousada/lobie-fachada.jpg')`,
          }}
        />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif">
            Lobie Armazém São Joaquim
          </h1>
          <p className="text-lg md:text-xl mb-6 font-light">
            Casarão histórico de 1854 • Tombado pela União • Santa Teresa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
              <Calendar className="w-5 h-5 mr-2" />
              Reservar Agora
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3">
              <MapPin className="w-5 h-5 mr-2" />
              Ver Localização
            </Button>
          </div>
        </div>
      </section>

      {/* História Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 dark:text-white font-serif">
              História & Patrimônio
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p className="text-lg leading-relaxed">
                O <strong>Lobie Armazém São Joaquim</strong> é um casarão histórico construído em <strong>1854</strong>, 
                tombado pela União e totalmente reformado preservando sua arquitetura original.
              </p>
              <p className="text-lg leading-relaxed">
                Por mais de <strong>150 anos</strong> funcionou como armazém, sendo um marco comercial 
                no coração de Santa Teresa. Hoje, oferece hospitalidade com o charme do passado 
                e o conforto moderno.
              </p>
              <p className="text-lg leading-relaxed">
                O prédio amarelo com janelas e portas vermelhas é um ícone do <strong>Largo dos Guimarães</strong>, 
                preservando a memória arquitetônica do Rio de Janeiro.
              </p>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/images/pousada/casarao-historico.jpg"
              alt="Casarão histórico de 1854"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
              style={{ objectFit: 'cover' }}
            />
            <div className="absolute -bottom-4 -right-4 bg-amber-600 text-white p-4 rounded-2xl shadow-lg">
              <div className="text-2xl font-bold">1854</div>
              <div className="text-sm">Patrimônio Histórico</div>
            </div>
          </div>
        </div>
      </section>

      {/* Localização Section */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white font-serif">
              Localização Privilegiada
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              No coração de Santa Teresa, próximo aos principais pontos turísticos do Rio de Janeiro
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Endereço</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Rua Almirante Alexandrino, 470<br />
                      Largo dos Guimarães, Santa Teresa
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-white">Proximidades:</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">Escadaria Selarón</span>
                      <Badge variant="secondary">1,2km</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">Arcos da Lapa</span>
                      <Badge variant="secondary">2km</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">Aeroporto Santos Dumont</span>
                      <Badge variant="secondary">4km</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Mapa Interativo</p>
                <p className="text-sm">Em breve</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quartos Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white font-serif">
              Nossas Acomodações
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              7 suítes modernas divididas em 3 categorias, todas com comodidades completas
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedRoomType === 'ALL' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('ALL')}
              className="px-6"
            >
              Todos os Quartos
            </Button>
            <Button
              variant={selectedRoomType === 'STANDARD' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('STANDARD')}
              className="px-6"
            >
              Standard
            </Button>
            <Button
              variant={selectedRoomType === 'DELUXE' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('DELUXE')}
              className="px-6"
            >
              Deluxe
            </Button>
            <Button
              variant={selectedRoomType === 'SUITE' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('SUITE')}
              className="px-6"
            >
              Suítes
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Carregando quartos...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative h-64">
                    <Image
                      src={room.image_url || '/images/pousada/room-placeholder.jpg'}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getRoomTypeColor(room.type)}>
                        {getRoomTypeLabel(room.type)}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      {room.available ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Ocupado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                    <CardDescription>{room.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">{room.max_guests} pessoas</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Comodidades:</h4>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 4).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{room.amenities.length - 4} mais
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Tarifa Flexível:</span>
                        <span className="font-bold text-lg">R$ {room.price_refundable}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Tarifa Não-Reembolsável:</span>
                        <span className="font-bold text-lg text-green-600">R$ {room.price_non_refundable}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled={!room.available}>
                      {room.available ? 'Reservar Quarto' : 'Indisponível'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comodidades Gerais */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white font-serif">
              Comodidades & Serviços
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">WiFi Gratuita</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Internet de alta velocidade em todos os quartos</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">TV a Cabo</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Canais nacionais e internacionais</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">Cofre Digital</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Segurança para seus pertences</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">Frigobar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Bebidas e snacks disponíveis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Check-in/Check-out */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-800 dark:text-white font-serif">
            Informações Importantes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Clock className="w-6 h-6 text-green-600" />
                  <span>Check-in</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">15:00h</div>
                <p className="text-slate-600 dark:text-slate-300">Recepção disponível até 22:00h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <span>Check-out</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">11:00h</div>
                <p className="text-slate-600 dark:text-slate-300">Extensão disponível mediante consulta</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">
              Pronto para sua estadia?
            </h3>
            <p className="text-lg mb-6 text-slate-600 dark:text-slate-300">
              Reserve agora e viva a experiência única de se hospedar em um patrimônio histórico no coração de Santa Teresa.
            </p>
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-4">
              <Calendar className="w-5 h-5 mr-2" />
              Fazer Reserva
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}