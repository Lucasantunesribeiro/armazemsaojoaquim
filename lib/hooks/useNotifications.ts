import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface PushNotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  })
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    // Verificar suporte a notificações
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator
    setSupported(isSupported)

    if (isSupported) {
      updatePermissionState()
      registerServiceWorker()
    }
  }, [])

  const updatePermissionState = () => {
    const currentPermission = Notification.permission
    setPermission({
      granted: currentPermission === 'granted',
      denied: currentPermission === 'denied',
      default: currentPermission === 'default'
    })
  }

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      setRegistration(reg)
      console.log('Service Worker registrado:', reg)
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) {
      toast.error('Notificações não são suportadas neste navegador')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      updatePermissionState()
      
      if (permission === 'granted') {
        toast.success('Notificações ativadas!')
        return true
      } else {
        toast.error('Permissão para notificações negada')
        return false
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      toast.error('Erro ao ativar notificações')
      return false
    }
  }

  const sendNotification = async (data: PushNotificationData): Promise<boolean> => {
    if (!permission.granted) {
      console.warn('Permissão para notificações não concedida')
      return false
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/images/logo.jpg',
        badge: data.badge || '/images/logo.jpg',
        tag: data.tag,
        data: data.data,
        requireInteraction: true
      })

      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()
        
        if (data.data?.url) {
          window.open(data.data.url, '_blank')
        }
        
        notification.close()
      }

      return true
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      return false
    }
  }

  const sendPushNotification = async (data: PushNotificationData): Promise<boolean> => {
    if (!registration || !permission.granted) {
      return false
    }

    try {
      await registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/images/logo.jpg',
        badge: data.badge || '/images/logo.jpg',
        tag: data.tag,
        data: data.data,
        requireInteraction: true,
        actions: data.actions
      } as any)

      return true
    } catch (error) {
      console.error('Erro ao enviar push notification:', error)
      return false
    }
  }

  const scheduleReservationReminder = async (reservationData: {
    id: string
    date: string
    time: string
    name: string
  }) => {
    const reservationDate = new Date(`${reservationData.date}T${reservationData.time}`)
    const reminderTime = new Date(reservationDate.getTime() - 2 * 60 * 60 * 1000) // 2 horas antes
    const now = new Date()

    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime()
      
      setTimeout(() => {
        sendPushNotification({
          title: 'Lembrete de Reserva',
          body: `Sua reserva no Armazém São Joaquim é às ${reservationData.time} hoje!`,
          tag: `reservation-reminder-${reservationData.id}`,
          data: {
            type: 'reservation_reminder',
            reservationId: reservationData.id,
            url: '/reservas'
          },
          actions: [
            {
              action: 'view',
              title: 'Ver Reserva'
            },
            {
              action: 'dismiss',
              title: 'Dispensar'
            }
          ]
        })
      }, delay)
    }
  }

  const notifyReservationConfirmed = async (reservationData: {
    id: string
    date: string
    time: string
  }) => {
    const formattedDate = new Date(reservationData.date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })

    return sendPushNotification({
      title: 'Reserva Confirmada! ✅',
      body: `Sua reserva para ${formattedDate} às ${reservationData.time} foi confirmada`,
      tag: `reservation-confirmed-${reservationData.id}`,
      data: {
        type: 'reservation_confirmed',
        reservationId: reservationData.id,
        url: '/reservas'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Detalhes'
        }
      ]
    })
  }

  const notifyNewBlogPost = async (postData: {
    title: string
    slug: string
    excerpt: string
  }) => {
    return sendPushNotification({
      title: 'Nova História Publicada',
      body: `${postData.title} - ${postData.excerpt}`,
      tag: `blog-post-${postData.slug}`,
      data: {
        type: 'blog_post',
        slug: postData.slug,
        url: `/blog/${postData.slug}`
      },
      actions: [
        {
          action: 'read',
          title: 'Ler Agora'
        }
      ]
    })
  }

  return {
    permission,
    supported,
    registration,
    requestPermission,
    sendNotification,
    sendPushNotification,
    scheduleReservationReminder,
    notifyReservationConfirmed,
    notifyNewBlogPost
  }
} 