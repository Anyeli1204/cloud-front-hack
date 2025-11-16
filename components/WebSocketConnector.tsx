'use client'

import { useEffect } from 'react'
import { wsClient } from '@/lib/websocket'
import { getToken, isTokenValid } from '@/lib/auth'

export default function WebSocketConnector() {
  useEffect(() => {
    const token = getToken()
    const isValid = isTokenValid()

    if (token && isValid) {
      wsClient.connect()
    }

    return () => {
    }
  }, [])

  return null
}
