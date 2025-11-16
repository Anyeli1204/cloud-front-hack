'use client'

import { useState, useEffect, useCallback } from 'react'
import { Incident } from '@/types'
import { authenticatedFetch } from '@/lib/auth'
import { wsClient } from '@/lib/websocket'
import { useUser } from '@/contexts/UserContext'

// Mapear el formato del backend al formato del frontend
function mapBackendIncidentToFrontend(backendIncident: any): Incident {
  return {
    Type: backendIncident.tenant_id || backendIncident.Type || '',
    UUID: backendIncident.uuid || backendIncident.UUID || '',
    Title: backendIncident.Title || '',
    Description: backendIncident.Description || '',
    ResponsibleArea: Array.isArray(backendIncident.ResponsibleArea) 
      ? backendIncident.ResponsibleArea 
      : [backendIncident.ResponsibleArea].filter(Boolean),
    CreatedById: backendIncident.CreatedById || '',
    CreatedByName: backendIncident.CreatedByName || '',
    Status: mapBackendStatusToFrontend(backendIncident.Status),
    Priority: mapBackendPriorityToFrontend(backendIncident.Priority),
    IsGlobal: backendIncident.IsGlobal || false,
    CreatedAt: backendIncident.CreatedAt || '',
    ExecutingAt: backendIncident.ExecutingAt || undefined,
    ResolvedAt: backendIncident.ResolvedAt || undefined,
    LocationTower: backendIncident.LocationTower || '',
    LocationFloor: backendIncident.LocationFloor || '',
    LocationArea: backendIncident.LocationArea || '',
    Reference: backendIncident.Reference || '',
    AssignedToPersonalId: backendIncident.AssignedToPersonalId || undefined,
    PendienteReasignacion: backendIncident.PendienteReasignacion || false,
    Comment: Array.isArray(backendIncident.Comment) ? backendIncident.Comment : [],
    Subtype: backendIncident.Subtype || backendIncident.subType?.toString() || undefined,
  }
}

function mapBackendStatusToFrontend(status: string): 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTO' {
  const statusMap: Record<string, 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTO'> = {
    'pending': 'PENDIENTE',
    'Pendiente': 'PENDIENTE',
    'PENDIENTE': 'PENDIENTE',
    'en_atencion': 'EN_ATENCION',
    'EnAtencion': 'EN_ATENCION',
    'EN_ATENCION': 'EN_ATENCION',
    'resolved': 'RESUELTO',
    'Resuelto': 'RESUELTO',
    'RESUELTO': 'RESUELTO',
  }
  return statusMap[status] || 'PENDIENTE'
}

function mapBackendPriorityToFrontend(priority: string): 'BAJO' | 'MEDIA' | 'ALTA' | 'CRÍTICO' {
  const priorityMap: Record<string, 'BAJO' | 'MEDIA' | 'ALTA' | 'CRÍTICO'> = {
    'bajo': 'BAJO',
    'BAJO': 'BAJO',
    'media': 'MEDIA',
    'MEDIA': 'MEDIA',
    'alta': 'ALTA',
    'ALTA': 'ALTA',
    'critico': 'CRÍTICO',
    'CRÍTICO': 'CRÍTICO',
    'crítico': 'CRÍTICO',
  }
  return priorityMap[priority?.toLowerCase() || ''] || 'MEDIA'
}

export function useIncidents(filters?: {
  status?: string
  priority?: string
  area?: string
  global?: boolean
  tenant_id?: string
  type?: string
}) {
  const { user } = useUser()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener incidentes desde el endpoint REST
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setError('Usuario no autenticado')
        setLoading(false)
        return
      }

      const incidentsUrl = process.env.NEXT_PUBLIC_LAMBDA_INCIDENTS_URL!
      
      // Construir query params según los filtros
      const queryParams = new URLSearchParams()
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.priority) queryParams.append('priority', filters.priority)
      if (filters?.area) queryParams.append('area', filters.area)
      if (filters?.global !== undefined) queryParams.append('global', filters.global.toString())
      if (filters?.tenant_id) queryParams.append('tenant_id', filters.tenant_id)
      if (filters?.type) queryParams.append('type', filters.type)

      const url = queryParams.toString() 
        ? `${incidentsUrl}?${queryParams.toString()}`
        : incidentsUrl

      console.log('📡 [useIncidents] Obteniendo incidentes desde REST API:', url)

      const response = await authenticatedFetch(url, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Error al obtener incidentes: ${response.statusText}`)
      }

      const data = await response.json()
      const backendIncidents = Array.isArray(data) ? data : []

      console.log(`✅ [useIncidents] ${backendIncidents.length} incidentes obtenidos desde REST API`)

      const mappedIncidents = backendIncidents.map(mapBackendIncidentToFrontend)
      setIncidents(mappedIncidents)
    } catch (err) {
      console.error('❌ [useIncidents] Error al obtener incidentes:', err)
      setError(err instanceof Error ? err.message : 'Error al obtener incidentes')
    } finally {
      setLoading(false)
    }
  }, [filters, user])

  // Cargar incidentes iniciales al montar el componente
  useEffect(() => {
    if (user) {
      fetchIncidents()
    }
  }, [user, fetchIncidents])

  // Suscribirse a actualizaciones del WebSocket
  useEffect(() => {
    if (!wsClient.isConnected() || !user) {
      console.log('⚠️ [useIncidents] WebSocket no está conectado o no hay usuario')
      return
    }

    console.log('👂 [useIncidents] Suscribiéndose a eventos del WebSocket...')

    // Handler para nuevo incidente
    const handleNewIncident = (data: any) => {
      console.log('📨 [useIncidents] Nuevo incidente recibido:', data)
      
      // El backend puede enviar el incidente de diferentes formas:
      // 1. Directamente: { action: 'NewIncident', Title: '...', ... }
      // 2. Dentro de data: { action: 'NewIncident', data: { Title: '...', ... } }
      // 3. Como incident: { action: 'NewIncident', incident: { Title: '...', ... } }
      const incident = data.incident || data.data || data
      
      // Verificar que tenga los campos mínimos necesarios
      if (!incident || (!incident.UUID && !incident.uuid && !incident.Title)) {
        console.log('⚠️ [useIncidents] Datos de incidente inválidos, ignorando')
        return
      }
      
      const mappedIncident = mapBackendIncidentToFrontend(incident)
      
      // Verificar si el incidente ya existe (evitar duplicados)
      setIncidents((prev) => {
        const exists = prev.some((inc) => inc.UUID === mappedIncident.UUID)
        if (exists) {
          console.log('⚠️ [useIncidents] Incidente ya existe, actualizando en lugar de agregar')
          return prev.map((inc) => (inc.UUID === mappedIncident.UUID ? mappedIncident : inc))
        }
        
        // Filtrar según el rol del usuario antes de agregar
        if (user?.Role === 'COORDINATOR' && user?.Area) {
          const belongsToArea = mappedIncident.ResponsibleArea.includes(user.Area)
          if (!belongsToArea) {
            console.log('⚠️ [useIncidents] Incidente no pertenece al área del coordinador')
            return prev
          }
        } else if (user?.Role === 'COMMUNITY') {
          const isOwnIncident = mappedIncident.CreatedById === user.UUID
          const isGlobal = mappedIncident.IsGlobal
          if (!isOwnIncident && !isGlobal) {
            console.log('⚠️ [useIncidents] Incidente no pertenece al usuario')
            return prev
          }
        } else if (user?.Role === 'PERSONAL') {
          const belongsToArea = mappedIncident.ResponsibleArea.includes(user.Area || '')
          const isAssigned = mappedIncident.AssignedToPersonalId === user.UUID
          if (!belongsToArea && !isAssigned) {
            console.log('⚠️ [useIncidents] Incidente no pertenece al área ni está asignado')
            return prev
          }
        }
        
        // Agregar el nuevo incidente al inicio de la lista
        console.log('✅ [useIncidents] Agregando nuevo incidente a la lista')
        return [mappedIncident, ...prev]
      })
    }

    // Handler para incidente editado
    const handleEditIncident = (data: any) => {
      console.log('📝 [useIncidents] Incidente editado recibido:', data)
      const incident = data.incident || data
      const mappedIncident = mapBackendIncidentToFrontend(incident)
      setIncidents((prev) =>
        prev.map((inc) => (inc.UUID === mappedIncident.UUID ? mappedIncident : inc))
      )
    }

    // Handler para incidente eliminado
    const handleDeleteIncident = (data: any) => {
      console.log('🗑️ [useIncidents] Incidente eliminado recibido:', data)
      const uuid = data.uuid || data.UUID
      if (uuid) {
        setIncidents((prev) => prev.filter((inc) => inc.UUID !== uuid))
      }
    }

    // Suscribirse a los eventos
    // Escuchar tanto 'NewIncident' como 'PublishIncident' por si el backend envía diferentes nombres
    wsClient.on('NewIncident', handleNewIncident)
    wsClient.on('PublishIncident', handleNewIncident) // También escuchar cuando se publica un incidente
    wsClient.on('EditIncidentContent', handleEditIncident)
    wsClient.on('IncidentDeleted', handleDeleteIncident)
    wsClient.on('StaffChooseIncident', handleEditIncident)
    wsClient.on('CoordinatorAssignIncident', handleEditIncident)
    wsClient.on('SolvedIncident', handleEditIncident)

    // Cleanup
    return () => {
      wsClient.off('NewIncident', handleNewIncident)
      wsClient.off('PublishIncident', handleNewIncident)
      wsClient.off('EditIncidentContent', handleEditIncident)
      wsClient.off('IncidentDeleted', handleDeleteIncident)
      wsClient.off('StaffChooseIncident', handleEditIncident)
      wsClient.off('CoordinatorAssignIncident', handleEditIncident)
      wsClient.off('SolvedIncident', handleEditIncident)
    }
  }, [user])

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    fetchIncidents()
  }, [fetchIncidents])

  return {
    incidents,
    loading,
    error,
    refresh,
  }
}

