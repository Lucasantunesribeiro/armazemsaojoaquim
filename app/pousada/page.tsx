'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Wifi, Car, Coffee, Shield, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import SEO from '@/components/SEO'

interface Room {
  id: string
  name: string
  type: 'STANDARD' | 'DELUXE' | 'SUITE'
  priceRefundable: number
  priceNonRefundable: number
  description: string
  amenities: string
  maxGuests: number
  imageUrl: string
}

const rooms: Room[] = [
  {
    id: '1',
    name: 'Quarto Standard',
    type: 'STANDARD',
    priceRefundable: 280,
    priceNonRefundable: 220,
    description: 'Quarto aconchegante com vista para Santa Teresa, ideal para casais que buscam conforto e autenticidade.',
    amenities: 'WiFi gratuita, TV a cabo, Frigobar, Cofre, Ar-condicionado',
    maxGuests: 2,
    imageUrl: '/images/pousada/standard-room.jpg'
  },
  {
    id: '2',
    name: 'Quarto Deluxe',
    type: 'DELUXE',
    priceRefundable: 380,
    priceNonRefundable: 320,
    description: 'Espaço amplo com decoração refinada, oferecendo maior conforto e comodidades premium.',
    amenities: 'WiFi gratuita, TV a cabo, Frigobar, Cofre, Ar-condicionado, Varanda privativa',
    maxGuests: 3,
    imageUrl: '/images/pousada/deluxe-room.jpg'
  },
  {
    id: '3',
    name: 'Suíte Master',
    type: 'SUITE',
    priceRefundable: 580,
    priceNonRefundable: 480,
    description: 'Nossa suíte mais luxuosa com sala de estar separada e vista panorâmica de Santa Teresa.',
    amenities: 'WiFi gratuita, TV a cabo, Frigobar, Cofre, Ar-condicionado, Varanda privativa, Sala de estar, Banheira',
    maxGuests: 4,
    imageUrl: '/images/pousada/suite-room.jpg'
  }
]

const attractions = [
  { name: 'Escadaria Selarón', distance: '1,2km', time: '15 min' },
  { name: 'Arcos da Lapa', distance: '2km', time: '25 min' },
  { name: 'Aeroporto Santos Dumont', distance: '4km', time: '15 min' },
  { name: 'Centro do Rio', distance: '3km', time: '20 min' },
  { name: 'Cristo Redentor', distance: '8km', time: '30 min' },
  { name: 'Pão de Açúcar', distance: '6km', time: '25 min' }
]

export default function PousadaPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isRefundable, setIsRefundable] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const handleBooking = () => {
    if (!selectedRoom) return
    
    const bookingData = {
      room: selectedRoom,
      checkIn,
      checkOut,
      guests,
      guestName,
      email,
      phone,
      refundable: isRefundable,
      totalPrice: isRefundable ? selectedRoom.priceRefundable : selectedRoom.priceNonRefundable
    }
    
    console.log('Reserva:', bookingData)
    alert('Reserva enviada! Entraremos em contato em breve.')
  }

  return (
    <>
      <SEO 
        title="Lobie Armazém São Joaquim - Pousada Histórica em Santa Teresa"
        description="Hospede-se no casarão histórico de 1854, tombado pela União. 7 suítes modernas com 3 categorias no coração de Santa Teresa, Rio de Janeiro."
        keywords={["pousada", "hotel", "Santa Teresa", "Rio de Janeiro", "histórico", "hospedagem", "casarão", "1854"]}
        ogImage="/images/pousada/fachada-historica.jpg"
      />

      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/pousada/casarao-1854.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <div className="mb-6">
              <Badge className="bg-amber-600 text-white px-4 py-2 text-lg font-semibold">
                Desde 1854
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6">
              Lobie Armazém São Joaquim
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">
              Hospede-se no coração histórico de Santa Teresa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                <span>Rua Almirante Alexandrino, 470</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                <span>Check-in: 15:00 | Check-out: 11:00</span>
              </div>
            </div>
          </div>
        </section>

        {/* História Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-6 text-slate-800 dark:text-white">
                  História de 170 Anos
                </h2>
                <div className="space-y-4 text-lg text-slate-600 dark:text-slate-300">
                  <p>
                    Nosso casarão histórico de <strong>1854</strong> é um patrimônio tombado pela União, 
                    que funcionou como armazém por mais de 150 anos no coração de Santa Teresa.
                  </p>
                  <p>
                    Após uma completa e cuidadosa reforma, o prédio amarelo com janelas e portas vermelhas 
                    foi transformado em uma pousada moderna, preservando toda sua autenticidade histórica.
                  </p>
                  <p>
                    Hoje oferecemos <strong>7 suítes modernas</strong> distribuídas em 3 categorias, 
                    mantendo o charme colonial em um dos bairros mais charmosos do Rio de Janeiro.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/images/pousada/fachada-historica.jpg"
                  alt="Fachada histórica do casarão amarelo com portas vermelhas"
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-amber-600 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">1854</div>
                  <div className="text-sm">Tombado pela União</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rooms Section */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4 text-slate-800 dark:text-white">
                Nossas Suítes
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                7 suítes modernas com 3 categorias para sua estadia perfeita
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <Card 
                  key={room.id} 
                  className={`p-6 cursor-pointer transition-all hover:shadow-xl ${
                    selectedRoom?.id === room.id ? 'ring-2 ring-amber-500 shadow-xl' : ''
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="relative mb-4">
                    <img 
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-amber-600 text-white">
                      {room.type}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{room.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-500">Reembolsável:</span>
                      <span className="text-lg font-bold text-green-600">R$ {room.priceRefundable}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Não-reembolsável:</span>
                      <span className="text-lg font-bold text-orange-600">R$ {room.priceNonRefundable}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {room.amenities.split(', ').map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Até {room.maxGuests} pessoas</span>
                    <Button 
                      variant={selectedRoom?.id === room.id ? "default" : "outline"}
                      size="sm"
                    >
                      {selectedRoom?.id === room.id ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form */}
        {selectedRoom && (
          <section className="py-20 px-4 bg-amber-50 dark:bg-slate-800">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  Reservar {selectedRoom.name}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="refundable">Tipo de Reserva</Label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={isRefundable ? 'refundable' : 'non-refundable'}
                      onChange={(e) => setIsRefundable(e.target.value === 'refundable')}
                    >
                      <option value="refundable">Reembolsável - R$ {selectedRoom.priceRefundable}</option>
                      <option value="non-refundable">Não-reembolsável - R$ {selectedRoom.priceNonRefundable}</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="guests">Número de Hóspedes</Label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                    >
                      {Array.from({ length: selectedRoom.maxGuests }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'pessoa' : 'pessoas'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="checkin">Check-in</Label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="checkout">Check-out</Label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleBooking}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  size="lg"
                  disabled={!checkIn || !checkOut || !guestName || !email || !phone}
                >
                  Confirmar Reserva - R$ {isRefundable ? selectedRoom.priceRefundable : selectedRoom.priceNonRefundable}
                </Button>
              </Card>
            </div>
          </section>
        )}

        {/* Amenities Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4 text-slate-800 dark:text-white">
                Comodidades
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Tudo que você precisa para uma estadia confortável
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">WiFi Gratuito</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Internet rápida em todos os ambientes</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Estacionamento</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Vaga para seu veículo</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Café & Restaurante</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gastronomia no mesmo local</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Segurança 24h</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monitoramento completo</p>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4 text-slate-800 dark:text-white">
                Localização Privilegiada
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                No coração de Santa Teresa, próximo às principais atrações do Rio
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-8">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Rua Almirante Alexandrino, 470 - Largo dos Guimarães</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction) => (
                <div key={attraction.name} className="bg-amber-50 dark:bg-slate-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">{attraction.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{attraction.distance}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-600 font-bold">{attraction.time}</div>
                      <div className="text-xs text-slate-500">caminhada</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}