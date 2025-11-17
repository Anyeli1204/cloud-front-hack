'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { wsClient } from '@/lib/websocket'
import { useUser } from '@/contexts/UserContext'

interface Notification {
  id: string
  type: 'new_incident' | 'incident_resolved' | 'incident_updated' | 'other'
  title: string
  message: string
  incidentId: string
  incidentTitle: string
  createdAt: string
  read: boolean
}

const STORAGE_KEY = 'websocket_notifications'

export default function Notifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Cargar notificaciones desde localStorage al inicio
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: Notification[] = JSON.parse(saved)
        setNotifications(parsed)
        setUnreadCount(parsed.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error('[Notifications] Error cargando desde localStorage:', error)
    }
  }, [])

  // Persistir notificaciones en localStorage
  const persistNotifications = useCallback((notifs: Notification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs))
    } catch (error) {
      console.error('[Notifications] Error guardando en localStorage:', error)
    }
  }, [])

  // Agregar nueva notificación
  const addNotification = useCallback((notification: Notification) => {
    console.log('[Notifications] 🔔 Nueva notificación:', notification.title)
    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, 50) // Mantener máximo 50
      persistNotifications(updated)
      setUnreadCount(updated.filter(n => !n.read).length)
      return updated
    })
  }, [persistNotifications])

  // Suscribirse a eventos WebSocket
  useEffect(() => {
    if (!user || user.Role !== 'AUTHORITY') {
      console.log('[Notifications] Usuario no es AUTHORITY, no suscribiendo a notificaciones')
      return
    }

    console.log('[Notifications] 🎧 Suscribiendo a eventos WebSocket para AUTHORITY')

    // Handler para nuevos incidentes
    const handleNewIncident = (data: any) => {
      console.log('[Notifications] 📥 Nuevo incidente recibido:', data)
      const incident = data.incident || data.data || data
      const incidentId = incident?.uuid || incident?.UUID || 'unknown'
      const title = incident?.Title || incident?.title || 'Nuevo incidente'
      
      addNotification({
        id: `new-${incidentId}-${Date.now()}`,
        type: 'new_incident',
        title: 'Nuevo Incidente',
        message: `"${title}"`,
        incidentId,
        incidentTitle: title,
        createdAt: new Date().toISOString(),
        read: false
      })
    }

    // Handler para incidentes resueltos
    const handleResolvedIncident = (data: any) => {
      console.log('[Notifications] ✅ Incidente resuelto recibido:', data)
      const incident = data.incident || data.data || data
      const incidentId = incident?.uuid || incident?.UUID || 'unknown'
      const title = incident?.Title || incident?.title || 'Incidente resuelto'
      
      addNotification({
        id: `resolved-${incidentId}-${Date.now()}`,
        type: 'incident_resolved', 
        title: 'Incidente Resuelto',
        message: `"${title}" ha sido resuelto`,
        incidentId,
        incidentTitle: title,
        createdAt: new Date().toISOString(),
        read: false
      })
    }

    // Handler para incidentes actualizados/editados
    const handleUpdatedIncident = (data: any) => {
      console.log('[Notifications] 🔄 Incidente actualizado recibido:', data)
      const incident = data.incident || data.data || data
      const incidentId = incident?.uuid || incident?.UUID || 'unknown'
      const title = incident?.Title || incident?.title || 'Incidente actualizado'
      
      addNotification({
        id: `updated-${incidentId}-${Date.now()}`,
        type: 'incident_updated',
        title: 'Incidente Actualizado',
        message: `"${title}" ha sido modificado`,
        incidentId,
        incidentTitle: title,
        createdAt: new Date().toISOString(),
        read: false
      })
    }

    // Suscribirse a eventos
    wsClient.on('NewIncident', handleNewIncident)
    wsClient.on('PublishIncident', handleNewIncident)
    wsClient.on('SolvedIncident', handleResolvedIncident)
    wsClient.on('EditIncidentContent', handleUpdatedIncident)
    wsClient.on('StaffChooseIncident', handleUpdatedIncident)
    wsClient.on('CoordinatorAssignIncident', handleUpdatedIncident)

    // Cleanup
    return () => {
      console.log('[Notifications] 🔇 Desuscribiendo de eventos WebSocket')
      wsClient.off('NewIncident', handleNewIncident)
      wsClient.off('PublishIncident', handleNewIncident)
      wsClient.off('SolvedIncident', handleResolvedIncident)
      wsClient.off('EditIncidentContent', handleUpdatedIncident)
      wsClient.off('StaffChooseIncident', handleUpdatedIncident)
      wsClient.off('CoordinatorAssignIncident', handleUpdatedIncident)
    }
  }, [user, addNotification])

  // Marcar una notificación como leída
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      persistNotifications(updated)
      setUnreadCount(updated.filter(n => !n.read).length)
      return updated
    })
  }, [persistNotifications])

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    console.log('[Notifications] 👁️ Marcando todas las notificaciones como leídas')
    setNotifications(prev => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      persistNotifications(updated)
      setUnreadCount(0)
      return updated
    })
  }, [persistNotifications])

  // Al abrir la campana, marcar todas como leídas automáticamente
  const handleToggleOpen = useCallback(() => {
    console.log('[Notifications] 🔔 Abriendo/cerrando campana')
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    
    // Si se abre la campana, marcar todas como leídas
    if (newIsOpen && unreadCount > 0) {
      console.log('[Notifications] 👁️ Marcando automáticamente como leídas al abrir')
      markAllAsRead()
    }
  }, [isOpen, unreadCount, markAllAsRead])

  // Iconos para diferentes tipos de notificaciones
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_incident':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'incident_resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'incident_updated':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-utec-blue transition-colors"
        title={unreadCount > 0 ? `${unreadCount} notificaciones nuevas` : 'Notificaciones'}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
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
                  <p className="text-gray-600 font-medium">No hay notificaciones</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {user?.Role === 'AUTHORITY' 
                      ? 'Te notificaremos sobre nuevos incidentes y resoluciones' 
                      : 'Conéctate como AUTHORITY para recibir notificaciones'}
                  </p>
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

