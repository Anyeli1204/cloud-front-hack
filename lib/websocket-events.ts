/**
 * Utilidades para enviar eventos WebSocket al backend
 */

import { wsClient } from './websocket'

/**
 * Publicar un nuevo incidente (Rol: COMMUNITY)
 */
export function publishIncident(data: {
  tenant_id: string
  CreatedById: string
  CreatedByName: string
  subType: number
  Title: string
  Description: string
  LocationTower: string
  LocationFloor: string
  LocationArea: string
  Reference?: string
}) {
  const message = {
    action: 'PublishIncident',
    tenant_id: data.tenant_id,
    CreatedById: data.CreatedById,
    CreatedByName: data.CreatedByName,
    subType: data.subType,
    Title: data.Title,
    Description: data.Description,
    LocationTower: data.LocationTower,
    LocationFloor: data.LocationFloor,
    LocationArea: data.LocationArea,
    Reference: data.Reference || '',
  }

  console.log('📤 [WebSocket] Enviando PublishIncident:', message)
  
  // Verificar si está conectado antes de enviar
  if (!wsClient.isConnected()) {
    console.error('❌ [WebSocket] No está conectado. Estado:', wsClient.isConnected())
    throw new Error('No hay conexión con el servidor. Por favor, recarga la página e intenta nuevamente.')
  }
  
  // Enviar el mensaje
  wsClient.send(message)
}

