'use client'

import { getToken } from './auth'

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private isConnecting = false

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || ''
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      return
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }
    
    if (this.ws && (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isConnecting = true
    const token = getToken()

    if (!token) {
      this.isConnecting = false
      return
    }

    if (!this.url) {
      this.isConnecting = false
      return
    }

    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`
      console.log('[WebSocket] 🔗 Conectando a:', this.url)
      console.log('[WebSocket] 🔑 Token (primeros 10 chars):', token.substring(0, 10) + '...')
      
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[WebSocket] ✅ Conexión establecida - servidor ejecutó $connect')
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
        }
      }

      this.ws.onerror = (error) => {
        this.isConnecting = false
      }

      this.ws.onclose = (event) => {
        console.log('[WebSocket] 🔌 Conexión cerrada:', {
          code: event.code,
          reason: event.reason, 
          wasClean: event.wasClean,
          timestamp: new Date().toISOString()
        })
        
        // Interpretar códigos de cierre
        if (event.code === 1000) {
          console.log('[WebSocket] ✅ Cierre normal (1000) - $disconnect DEBERÍA haberse ejecutado en el servidor')
        } else if (event.code === 1001) {
          console.log('[WebSocket] 📱 Cierre por "going away" (1001)')
        } else if (event.code === 1006) {
          console.warn('[WebSocket] ⚠️ Cierre abrupto (1006) - conexión perdida sin close frame')
        } else {
          console.warn('[WebSocket] ❓ Código de cierre inusual:', event.code)
        }
        
        this.isConnecting = false
        this.ws = null
        
        // Solo reintentar si NO es un logout explícito del usuario
        const isUserLogout = event.code === 1000 && event.reason === 'User logout'
        
        if (!isUserLogout && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`[WebSocket] 🔄 Reintentando conexión ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${this.reconnectDelay}ms`)
          setTimeout(() => this.connect(), this.reconnectDelay)
        } else if (isUserLogout) {
          console.log('[WebSocket] 🚪 Logout del usuario - no reintentando conexión')
        } else {
          console.log('[WebSocket] 🛑 Máximo de reintentos alcanzado')
        }
      }
    } catch (error) {
      this.isConnecting = false
    }
  }

  private handleMessage(data: any) {
    const action = data.action || data.type
    
    if (action) {
      this.emit(action, data.data || data)
    } else {
      this.emit('message', data)
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
        }
      })
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] 📤 Enviando mensaje:', message)
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] ⚠️ Intento de envío con conexión cerrada')
    }
  }

  disconnect() {
    console.log('[WebSocket] 🔌 Iniciando disconnect explícito')
    
    if (this.ws) {
      const currentState = this.ws.readyState
      console.log('[WebSocket] 📊 Estado actual del WebSocket:', {
        'CONNECTING': WebSocket.CONNECTING,
        'OPEN': WebSocket.OPEN, 
        'CLOSING': WebSocket.CLOSING,
        'CLOSED': WebSocket.CLOSED,
        'current': currentState
      })
      
      if (currentState === WebSocket.OPEN) {
        console.log('[WebSocket] 🎯 Cerrando conexión OPEN - esto DEBE activar $disconnect en el servidor')
        // Usar código 1000 (cierre normal) para asegurar que API Gateway ejecute $disconnect
        this.ws.close(1000, 'User logout')
      } else if (currentState === WebSocket.CONNECTING) {
        console.log('[WebSocket] ⏳ Cerrando conexión en estado CONNECTING')
        this.ws.close(1000, 'User logout')
      } else {
        console.log('[WebSocket] ℹ️ Conexión ya cerrada o cerrándose, estado:', currentState)
      }
      
      this.ws = null
    } else {
      console.log('[WebSocket] ⚠️ No hay conexión WebSocket para cerrar')
    }
    
    this.listeners.clear()
    this.reconnectAttempts = this.maxReconnectAttempts
    
    console.log('[WebSocket] ✅ Disconnect completado')
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

export const wsClient = new WebSocketClient()
