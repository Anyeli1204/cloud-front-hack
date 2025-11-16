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
      
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
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
        this.isConnecting = false
        this.ws = null
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          setTimeout(() => this.connect(), this.reconnectDelay)
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
      this.ws.send(JSON.stringify(message))
    }
  }

  disconnect() {
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
