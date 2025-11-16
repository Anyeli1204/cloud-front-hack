'use client'

import { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Notification {
  id: string
  type: 'status_change' | 'comment' | 'assignment'
  title: string
  message: string
  incidentId: string
  incidentTitle: string
  createdAt: string
  read: boolean
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Simulación de notificaciones - aquí iría la llamada a la API o WebSocket
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'status_change',
        title: 'Estado actualizado',
        message: 'Tu incidente "Fuga de agua en el baño" cambió a "En Atención"',
        incidentId: '1',
        incidentTitle: 'Fuga de agua en el baño',
        createdAt: '2024-11-15T11:00:00Z',
        read: false,
      },
      {
        id: '2',
        type: 'comment',
        title: 'Nuevo comentario',
        message: 'Se ha agregado un comentario a tu incidente "Lámpara fundida"',
        incidentId: '2',
        incidentTitle: 'Lámpara fundida',
        createdAt: '2024-11-15T10:30:00Z',
        read: false,
      },
      {
        id: '3',
        type: 'status_change',
        title: 'Incidente resuelto',
        message: 'Tu incidente "Ascensor fuera de servicio" ha sido resuelto',
        incidentId: '3',
        incidentTitle: 'Ascensor fuera de servicio',
        createdAt: '2024-11-15T08:00:00Z',
        read: true,
      },
    ]
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'comment':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'assignment':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-utec-blue transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-utec-blue hover:underline"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={`/incidents/${notification.incidentId}`}
                      onClick={() => {
                        markAsRead(notification.id)
                        setIsOpen(false)
                      }}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p
                              className={`text-sm font-semibold ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(notification.createdAt), "dd/MM/yyyy 'a las' HH:mm")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <Link
                  href="/my-reports"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-utec-blue hover:underline font-medium"
                >
                  Ver todos los incidentes
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

