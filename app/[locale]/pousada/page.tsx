'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MapPin, Clock, Wifi, Tv, Coffee, Shield, Car, Star, Users, Bath, Bed, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import LocationButton from '@/components/ui/LocationButton'
import { useTranslations } from '@/hooks/useTranslations'

interface Room {
  id: string
  name: string
  type: 'STANDARD' | 'DELUXE' | 'SUITE'
  description: string
  amenities: string[]
  max_guests: number
  image_url: string
  available: boolean
  price_refundable: number
  price_non_refundable: number
}

export default function PousadaPage() {
  const { t } = useTranslations()
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
        const result = await response.json()
        if (result.success && result.data) {
          setRooms(result.data)
        } else {
          console.error('Invalid API response format:', result)
        }
      }
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = selectedRoomType === 'ALL' 
    ? rooms 
    : rooms.filter(room => room.type === selectedRoomType)

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'STANDARD': return t('pousada.rooms.filters.standard')
      case 'DELUXE': return t('pousada.rooms.filters.deluxe')
      case 'SUITE': return t('pousada.rooms.filters.suite')
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
            {t('pousada.hero.title')}
          </h1>
          <p className="text-lg md:text-xl mb-6 font-light">
            {t('pousada.hero.subtitle')}
          </p>
          <div className="flex justify-center">
            <LocationButton 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3"
              address="R. Alm. Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ"
              coordinates={{ lat: -22.9150, lng: -43.1886 }}
            >
              {t('pousada.hero.viewLocation')}
            </LocationButton>
          </div>
        </div>
      </section>

      {/* História Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 dark:text-white font-serif">
              {t('pousada.history.title')}
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t('pousada.history.description1') }} />
              <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t('pousada.history.description2') }} />
              <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t('pousada.history.description3') }} />
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
              <div className="text-2xl font-bold">{t('pousada.history.yearBadge')}</div>
              <div className="text-sm">{t('pousada.history.heritageBadge')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Localização Section */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white font-serif">
              {t('pousada.location.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {t('pousada.location.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{t('pousada.location.address.title')}</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {t('pousada.location.address.street')}<br />
                      {t('pousada.location.address.neighborhood')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-white">{t('pousada.location.nearby.title')}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">{t('pousada.location.nearby.selaron')}</span>
                      <Badge variant="secondary">1,2km</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">{t('pousada.location.nearby.lapa')}</span>
                      <Badge variant="secondary">2km</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">{t('pousada.location.nearby.airport')}</span>
                      <Badge variant="secondary">4km</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-amber-600" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        Mapa Interativo
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Explore nossa localização em Santa Teresa
                      </p>
                    </div>
                  </div>
                  <LocationButton 
                    variant="outline"
                    size="sm"
                    className="border-amber-600 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950"
                    address="R. Alm. Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ"
                    coordinates={{ lat: -22.9150, lng: -43.1886 }}
                  >
                    Abrir no Maps
                  </LocationButton>
                </div>
              </div>
              <div className="relative group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.3!2d-43.1886!3d-22.9150!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997e58a85c8b85%3A0x8b8b8b8b8b8b8b8b!2sR.%20Alm.%20Alexandrino%2C%20470%20-%20Santa%20Teresa%2C%20Rio%20de%20Janeiro%20-%20RJ%2C%2020241-260!5e0!3m2!1spt-BR!2sbr!4v1735840000000!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da Pousada Armazém São Joaquim - Santa Teresa, Rio de Janeiro"
                  className="w-full transition-all duration-300 group-hover:brightness-110"
                />
                
                {/* Location Badge */}
                <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Pousada Armazém São Joaquim
                    </span>
                  </div>
                </div>

                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Fullscreen Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
                    onClick={() => {
                      const mapUrl = "https://www.google.com/maps/search/?api=1&query=-22.9150,-43.1886"
                      window.open(mapUrl, '_blank', 'noopener,noreferrer')
                    }}
                    title="Abrir mapa em tela cheia"
                  >
                    <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Map Info Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Zoom e navegação interativa</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Localização precisa</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span>Rotas e direções</span>
                  </div>
                </div>
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
              {t('pousada.rooms.title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {t('pousada.rooms.subtitle')}
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={selectedRoomType === 'ALL' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('ALL')}
              className="px-6"
            >
              {t('pousada.rooms.filters.all')}
            </Button>
            <Button
              variant={selectedRoomType === 'STANDARD' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('STANDARD')}
              className="px-6"
            >
              {t('pousada.rooms.filters.standard')}
            </Button>
            <Button
              variant={selectedRoomType === 'DELUXE' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('DELUXE')}
              className="px-6"
            >
              {t('pousada.rooms.filters.deluxe')}
            </Button>
            <Button
              variant={selectedRoomType === 'SUITE' ? 'default' : 'outline'}
              onClick={() => setSelectedRoomType('SUITE')}
              className="px-6"
            >
              {t('pousada.rooms.filters.suite')}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">{t('pousada.rooms.loading')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative h-64">
                    <Image
                      src={room.image_url}
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
                          {t('pousada.rooms.availability.available')}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          {t('pousada.rooms.availability.occupied')}
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
                          <span className="text-sm">{room.max_guests} {t('pousada.rooms.details.guests')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{t('pousada.rooms.details.amenities')}</h4>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 4).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{room.amenities.length - 4} {t('pousada.rooms.details.moreAmenities')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Preços */}
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Preços por noite</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Reembolsável</span>
                          <span className="text-lg font-bold text-green-600">
                            R$ {room.price_refundable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Não reembolsável</span>
                          <span className="text-lg font-bold text-amber-600">
                            R$ {room.price_non_refundable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button 
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                          disabled={!room.available}
                          onClick={() => {
                            if (room.available) {
                              const message = `Olá! Gostaria de fazer uma reserva para o quarto ${room.name} (${room.type}) da Pousada Armazém São Joaquim.`
                              const whatsappUrl = `https://wa.me/5521985658443?text=${encodeURIComponent(message)}`
                              window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                            }
                          }}
                        >
                          {room.available ? 'Reservar Agora' : 'Indisponível'}
                        </Button>
                      </div>
                    </div>

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
              {t('pousada.amenities.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">{t('pousada.amenities.wifi.title')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('pousada.amenities.wifi.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">{t('pousada.amenities.tv.title')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('pousada.amenities.tv.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">{t('pousada.amenities.safe.title')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('pousada.amenities.safe.description')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">{t('pousada.amenities.minibar.title')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t('pousada.amenities.minibar.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Check-in/Check-out */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-800 dark:text-white font-serif">
            {t('pousada.checkin.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Clock className="w-6 h-6 text-green-600" />
                  <span>{t('pousada.checkin.checkinTitle')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">{t('pousada.checkin.checkinTime')}</div>
                <p className="text-slate-600 dark:text-slate-300">{t('pousada.checkin.checkinNote')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <span>{t('pousada.checkin.checkoutTitle')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">{t('pousada.checkin.checkoutTime')}</div>
                <p className="text-slate-600 dark:text-slate-300">{t('pousada.checkin.checkoutNote')}</p>
              </CardContent>
            </Card>
          </div>


        </div>
      </section>


    </div>
  )
}