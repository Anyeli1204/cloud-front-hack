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
          console.log('[WebSocket] 📥 ===== MENSAJE RECIBIDO DEL SERVIDOR =====')
          console.log('[WebSocket] 📥 Tipo de dato:', typeof event.data)
          console.log('[WebSocket] 📥 Mensaje RAW recibido del servidor:', event.data)
          console.log('[WebSocket] 📥 Longitud del mensaje:', event.data?.length || 0, 'bytes')
          
          const data = JSON.parse(event.data)
          console.log('[WebSocket] 📥 Mensaje parseado (objeto):', data)
          console.log('[WebSocket] 📥 Action en el mensaje:', data.action || data.type || 'NO HAY ACTION')
          console.log('[WebSocket] 📥 ===========================================')
          
          this.handleMessage(data)
        } catch (error) {
          console.error('[WebSocket] ❌ Error al parsear mensaje:', error)
          console.error('[WebSocket] ❌ Data que causó el error:', event.data)
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
    console.log('[WebSocket] 📥 Mensaje recibido en handleMessage:', data)
    const action = data.action || data.type
    console.log('[WebSocket] 📥 Action extraída:', action)
    
    // SIEMPRE emitir el evento genérico 'message' primero para capturar todo
    console.log('[WebSocket] 📤 Emitiendo evento genérico "message" con datos completos')
    this.emit('message', data)
    
    // Luego emitir el evento específico si tiene action
    if (action) {
      const payload = data.data || data
      console.log('[WebSocket] 📤 Emitiendo evento específico:', action, 'con payload:', payload)
      this.emit(action, payload)
    } else {
      console.log('[WebSocket] ⚠️ Mensaje sin action, solo se emitió como "message"')
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
    console.log(`[WebSocket] 🔊 Emitiendo evento "${event}" a ${callbacks?.size || 0} listeners`)
    console.log(`[WebSocket] 🔊 Datos del evento:`, data)
    
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach((callback, index) => {
        try {
          console.log(`[WebSocket] 🔊 Ejecutando callback ${index + 1}/${callbacks.size} para evento "${event}"`)
          callback(data)
        } catch (error) {
          console.error(`[WebSocket] ❌ Error en callback ${index + 1} para evento "${event}":`, error)
        }
      })
    } else {
      console.warn(`[WebSocket] ⚠️ No hay listeners registrados para el evento "${event}"`)
      console.warn(`[WebSocket] ⚠️ Listeners disponibles:`, Array.from(this.listeners.keys()))
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const jsonMessage = JSON.stringify(message)
      console.log('[WebSocket] 📤 Enviando mensaje (objeto):', message)
      console.log('[WebSocket] 📤 Enviando mensaje (JSON string):', jsonMessage)
      console.log('[WebSocket] 📤 Longitud del mensaje:', jsonMessage.length, 'bytes')
      this.ws.send(jsonMessage)
    } else {
      console.warn('[WebSocket] ⚠️ Intento de envío con conexión cerrada')
      console.warn('[WebSocket] ⚠️ Estado del WebSocket:', this.ws?.readyState)
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
