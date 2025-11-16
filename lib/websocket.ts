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
    console.log('🔧 [WebSocket] Cliente inicializado')
    console.log('🌐 [WebSocket] URL configurada:', this.url)
  }

  async connect(): Promise<void> {
    console.log('')
    console.log('🔌 ========== INICIANDO CONEXIÓN WEBSOCKET ==========')
    console.log('🔌 [WebSocket] Iniciando proceso de conexión...')
    
    if (this.isConnecting) {
      console.log('⚠️ [WebSocket] Ya hay una conexión en proceso, esperando...')
      return
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ [WebSocket] Ya está conectado (readyState: OPEN)')
      return
    }
    
    if (this.ws && (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log(`⚠️ [WebSocket] Estado actual: ${this.ws.readyState === WebSocket.CONNECTING ? 'CONNECTING' : 'CLOSING'}, esperando...`)
      return
    }

    this.isConnecting = true
    const token = getToken()

    if (!token) {
      console.error('❌ [WebSocket] No hay token disponible para conectar')
      this.isConnecting = false
      return
    }

    const tokenPreview = token.length > 20 ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : token
    console.log(`🔑 [WebSocket] Token obtenido: ${tokenPreview} (longitud: ${token.length})`)

    if (!this.url) {
      console.error('❌ [WebSocket] URL no configurada. Verifica NEXT_PUBLIC_WEBSOCKET_URL en .env.local')
      this.isConnecting = false
      return
    }

    try {
      const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`
      
      console.log('🌐 [WebSocket] URL base:', this.url)
      console.log('🔗 [WebSocket] URL completa (con token):', wsUrl.replace(token, tokenPreview))
      console.log('📤 [WebSocket] Creando nueva conexión WebSocket...')
      console.log('⏳ [WebSocket] Esperando respuesta del servidor...')
      
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('')
        console.log('✅ ========== WEBSOCKET CONECTADO EXITOSAMENTE ==========')
        console.log('✅ [WebSocket] ¡CONECTADO EXITOSAMENTE!')
        console.log('📊 [WebSocket] Estado: OPEN')
        console.log('🔗 [WebSocket] URL:', wsUrl.replace(token, tokenPreview))
        console.log('⏰ [WebSocket] Hora de conexión:', new Date().toLocaleTimeString())
        console.log('🎉 [WebSocket] El servidor ha aceptado la conexión')
        console.log('👂 [WebSocket] Escuchando mensajes del servidor...')
        console.log('')
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        console.log('')
        console.log('📨 ========== MENSAJE RECIBIDO ==========')
        console.log('📨 [WebSocket] Mensaje recibido:', event.data)
        console.log('⏰ [WebSocket] Hora:', new Date().toLocaleTimeString())
        try {
          const data = JSON.parse(event.data)
          console.log('📦 [WebSocket] Datos parseados:', JSON.stringify(data, null, 2))
          this.handleMessage(data)
        } catch (error) {
          console.error('❌ [WebSocket] Error al parsear mensaje:', error)
          console.log('📄 [WebSocket] Mensaje raw (texto):', event.data)
        }
        console.log('')
      }

      this.ws.onerror = (error) => {
        console.error('')
        console.error('❌ ========== ERROR EN WEBSOCKET ==========')
        console.error('❌ [WebSocket] Error en la conexión:', error)
        console.error('🔍 [WebSocket] Detalles del error:', {
          type: error.type,
          target: error.target,
          readyState: this.ws?.readyState,
          url: wsUrl.replace(token, tokenPreview)
        })
        console.error('')
        this.isConnecting = false
      }

      this.ws.onclose = (event) => {
        console.log('')
        console.log('🔌 ========== CONEXIÓN CERRADA ==========')
        console.log('🔌 [WebSocket] Conexión cerrada')
        console.log('📊 [WebSocket] Código de cierre:', event.code)
        console.log('📝 [WebSocket] Razón:', event.reason || 'Sin razón especificada')
        console.log('🔄 [WebSocket] Fue limpio:', event.wasClean)
        console.log('⏰ [WebSocket] Hora:', new Date().toLocaleTimeString())
        this.isConnecting = false
        this.ws = null
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`🔄 [WebSocket] Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts}) en ${this.reconnectDelay}ms...`)
          setTimeout(() => this.connect(), this.reconnectDelay)
        } else {
          console.error('❌ [WebSocket] Máximo de intentos de reconexión alcanzado')
        }
        console.log('')
      }
    } catch (error) {
      console.error('❌ [WebSocket] Error al crear conexión:', error)
      this.isConnecting = false
    }
  }

  private handleMessage(data: any) {
    console.log('🔀 [WebSocket] Procesando mensaje...')
    const action = data.action || data.type
    
    if (action) {
      console.log(`📡 [WebSocket] Emitiendo evento: ${action}`)
      this.emit(action, data.data || data)
    } else {
      console.log('📡 [WebSocket] Emitiendo mensaje genérico')
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
      console.log(`📢 [WebSocket] Emitiendo evento "${event}" a ${callbacks.size} listener(s)`)
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`❌ [WebSocket] Error en callback del evento "${event}":`, error)
        }
      })
    } else {
      console.log(`⚠️ [WebSocket] No hay listeners para el evento: ${event}`)
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('')
      console.log('📤 ========== ENVIANDO MENSAJE WEBSOCKET ==========')
      console.log('📨 [WebSocket] Mensaje completo:', JSON.stringify(message, null, 2))
      this.ws.send(JSON.stringify(message))
      console.log('✅ [WebSocket] Mensaje enviado exitosamente')
      console.log('')
    } else {
      console.warn('⚠️ [WebSocket] No está conectado. Estado:', this.ws?.readyState)
      console.warn('⚠️ [WebSocket] No se puede enviar mensaje.')
    }
  }

  disconnect() {
    console.log('🔌 [WebSocket] Desconectando manualmente...')
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
    this.reconnectAttempts = this.maxReconnectAttempts
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

export const wsClient = new WebSocketClient()

