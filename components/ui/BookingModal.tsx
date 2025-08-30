'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, MapPin, Clock, X, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Separator } from '@/components/ui/Separator'
import { useTranslations } from '@/hooks/useTranslations'

interface Room {
  id: string
  name: string
  type: 'STANDARD' | 'DELUXE' | 'SUITE'
  price_non_refundable: number
  description: string
  amenities: string[]
  max_guests: number
  image_url: string
  available: boolean
}

interface BookingModalProps {
  room: Room | null
  isOpen: boolean
  onClose: () => void
  onBookingComplete?: (bookingData: any) => void
}

interface BookingForm {
  checkIn: string
  checkOut: string
  guests: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
}

export default function BookingModal({ room, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const { t } = useTranslations()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'confirmation' | 'success'>('form')
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    checkIn: '',
    checkOut: '',
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('form')
      setBookingForm({
        checkIn: '',
        checkOut: '',
        guests: 1,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: ''
      })
    }
  }, [isOpen])

  // Set min date to today
  const today = new Date().toISOString().split('T')[0]

  const calculateStayDuration = () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return 0
    const checkIn = new Date(bookingForm.checkIn)
    const checkOut = new Date(bookingForm.checkOut)
    const diffTime = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotalPrice = () => {
    const nights = calculateStayDuration()
    if (!room || nights <= 0) return 0
    return nights * room.price_non_refundable
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room) return

    setLoading(true)

    try {
      const bookingData = {
        room_id: room.id,
        guest_name: bookingForm.guestName,
        guest_email: bookingForm.guestEmail,
        guest_phone: bookingForm.guestPhone,
        check_in: bookingForm.checkIn,
        check_out: bookingForm.checkOut,
        guests: bookingForm.guests,
        special_requests: bookingForm.specialRequests,

        total_price: calculateTotalPrice(),
        nights: calculateStayDuration()
      }

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep('success')
      onBookingComplete?.(bookingData)
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BookingForm, value: string | number) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isFormValid = () => {
    return bookingForm.checkIn && 
           bookingForm.checkOut && 
           bookingForm.guestName && 
           bookingForm.guestEmail && 
           bookingForm.guestPhone &&
           calculateStayDuration() > 0 &&
           bookingForm.guests <= (room?.max_guests || 1)
  }

  if (!isOpen || !room) return null

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'DELUXE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'SUITE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === 'form' && t('pousada.booking.modal.title')}
              {step === 'confirmation' && t('pousada.booking.modal.confirmTitle')}
              {step === 'success' && t('pousada.booking.modal.successTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">{room.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Room Summary */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-start space-x-4">
            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <div className="text-slate-500 dark:text-slate-400 text-center">
                <div className="text-xs">{t('pousada.booking.modal.roomPreview')}</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-bold text-lg">{room.name}</h3>
                <Badge className={getRoomTypeColor(room.type)}>{room.type}</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{room.description}</p>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Até {room.max_guests} hóspedes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('pousada.booking.form.checkIn')}
                  </label>
                  <Input
                    type="date"
                    value={bookingForm.checkIn}
                    min={today}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('pousada.booking.form.checkOut')}
                  </label>
                  <Input
                    type="date"
                    value={bookingForm.checkOut}
                    min={bookingForm.checkIn || today}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('pousada.booking.form.guests')}
                </label>
                <Input
                  type="number"
                  min="1"
                  max={room.max_guests}
                  value={bookingForm.guests}
                  onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                  required
                />
              </div>

              {/* Guest Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {t('pousada.booking.form.guestInfo')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('pousada.booking.form.name')}
                    </label>
                    <Input
                      type="text"
                      value={bookingForm.guestName}
                      onChange={(e) => handleInputChange('guestName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('pousada.booking.form.email')}
                    </label>
                    <Input
                      type="email"
                      value={bookingForm.guestEmail}
                      onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('pousada.booking.form.phone')}
                  </label>
                  <Input
                    type="tel"
                    value={bookingForm.guestPhone}
                    onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                    required
                  />
                </div>
              </div>



              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('pousada.booking.form.specialRequests')}
                </label>
                <textarea
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  rows={3}
                  value={bookingForm.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder={t('pousada.booking.form.specialRequestsPlaceholder')}
                />
              </div>

              {/* Summary */}
              {calculateStayDuration() > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    {t('pousada.booking.form.summary')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{calculateStayDuration()} {t('pousada.booking.form.nights')}</span>
                      <span>R$ {room.price_non_refundable}/noite</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t('pousada.booking.form.total')}</span>
                      <span>R$ {calculateTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {t('pousada.booking.form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? t('pousada.booking.form.processing') : t('pousada.booking.form.confirm')}
                </Button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t('pousada.booking.success.title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t('pousada.booking.success.message')}
              </p>
              <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700">
                {t('pousada.booking.success.close')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}