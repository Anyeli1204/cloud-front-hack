'use client'

import { useEffect } from 'react'
import { wsClient } from '@/lib/websocket'
import { getToken, isTokenValid } from '@/lib/auth'
import { useUser } from '@/contexts/UserContext'

export default function WebSocketConnector() {
  const { user } = useUser()

  useEffect(() => {
    const token = getToken()
    const isValid = isTokenValid()

    console.log('[WebSocketConnector] Usuario cambió:', user?.UUID, user?.Role)

    if (user && token && isValid) {
      console.log('[WebSocketConnector] Conectando WebSocket...')
      wsClient.connect()
      // El servidor ya registra automáticamente el usuario en $connect usando el token
      console.log('[WebSocketConnector] Usuario será registrado automáticamente por $connect')
    } else if (!user) {
      console.log('[WebSocketConnector] Usuario deslogueado, desconectando WebSocket...')
      wsClient.disconnect()
    }

    return () => {
      // Cleanup si el componente se desmonta
    }
  }, [user])

  return null
}
