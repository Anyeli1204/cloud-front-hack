'use client'

import { useEffect } from 'react'
import { wsClient } from '@/lib/websocket'
import { getToken, isTokenValid } from '@/lib/auth'

export default function WebSocketConnector() {
  useEffect(() => {
    console.log('🔍 [WebSocketConnector] Componente montado, verificando token...')
    const token = getToken()
    const isValid = isTokenValid()

    if (token && isValid) {
      console.log('🔑 [WebSocketConnector] Token existe: true')
      console.log('✅ [WebSocketConnector] Token válido: true')
      console.log('🔌 [WebSocketConnector] Conectando al WebSocket desde el componente...')
      wsClient.connect()
    } else {
      console.log('🔑 [WebSocketConnector] Token existe:', !!token)
      console.log('✅ [WebSocketConnector] Token válido:', isValid)
      console.log('⚠️ [WebSocketConnector] No hay token válido, no se conectará automáticamente al WebSocket.')
    }

    return () => {
      console.log('🔌 [WebSocketConnector] Componente desmontado')
    }
  }, [])

  return null
}

