'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Incident } from '@/types'
import { authenticatedFetch } from '@/lib/auth'
import { wsClient } from '@/lib/websocket'
import { useUser } from '@/contexts/UserContext'
import { calculateWaitingMinutes } from '@/lib/dateUtils'

function mapBackendIncidentToFrontend(backendIncident: any): Incident {
  console.log('🔄 Mapeando incidente:', {
    originalUuid: backendIncident.uuid,
    fallbackUuid: backendIncident.UUID,
    tenantId: backendIncident.tenant_id
  })
  
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
    WaitingMinutes: calculateWaitingMinutes(backendIncident.CreatedAt || ''),
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
  minWaitMinutes?: number
  maxWaitMinutes?: number
}) {
  const { user } = useUser()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoizar los filtros para evitar recreaciones innecesarias
  const memoizedFilters = useMemo(() => filters, [
    filters?.status,
    filters?.priority,
    filters?.area,
    filters?.global,
    filters?.tenant_id,
    filters?.type,
    filters?.minWaitMinutes,
    filters?.maxWaitMinutes
  ])

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
      
      console.log('🔍 [useIncidents] URL del Lambda:', incidentsUrl)
      console.log('🔍 [useIncidents] Usuario:', { Role: user.Role, Area: user.Area, UUID: user.UUID })
      
      const queryParams = new URLSearchParams()
      if (memoizedFilters?.status) queryParams.append('status', memoizedFilters.status)
      if (memoizedFilters?.priority) queryParams.append('priority', memoizedFilters.priority)
      
      // Solo agregar área si se pasa explícitamente como filtro
      // El backend ya filtra automáticamente por área del coordinador basándose en el token
      if (memoizedFilters?.area) {
        queryParams.append('area', memoizedFilters.area)
        console.log('🔍 [useIncidents] Usando filtro área explícito:', memoizedFilters.area)
      }
      
      if (memoizedFilters?.global !== undefined) queryParams.append('global', memoizedFilters.global.toString())
      if (memoizedFilters?.tenant_id) queryParams.append('tenant_id', memoizedFilters.tenant_id)
      if (memoizedFilters?.type) queryParams.append('type', memoizedFilters.type)
      if (memoizedFilters?.minWaitMinutes !== undefined) queryParams.append('minWaitMinutes', memoizedFilters.minWaitMinutes.toString())
      if (memoizedFilters?.maxWaitMinutes !== undefined) queryParams.append('maxWaitMinutes', memoizedFilters.maxWaitMinutes.toString())

      const url = queryParams.toString() 
        ? `${incidentsUrl}?${queryParams.toString()}`
        : incidentsUrl

      console.log('🔍 [useIncidents] URL completa:', url)
      console.log('🔍 [useIncidents] Query params:', queryParams.toString())

      const response = await authenticatedFetch(url, {
        method: 'GET',
      })

      console.log('🔍 [useIncidents] Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers)
      })

      if (!response.ok) {
        let errorText = ''
        try {
          errorText = await response.text()
          console.error('❌ [useIncidents] Error en respuesta:', errorText)
        } catch (e) {
          console.error('❌ [useIncidents] No se pudo leer el error:', e)
        }
        throw new Error(`Error al obtener incidentes: ${response.status} ${response.statusText}`)
      }

      // Leer la respuesta como texto primero para ver qué está devolviendo exactamente
      const responseText = await response.text()
      console.log('🔍 [useIncidents] Respuesta raw (texto):', responseText)
      console.log('🔍 [useIncidents] Longitud de respuesta:', responseText.length)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('❌ [useIncidents] Error al parsear JSON:', e)
        console.error('❌ [useIncidents] Respuesta que falló:', responseText)
        throw new Error('Respuesta inválida del servidor')
      }
      
      console.log('🔍 [useIncidents] Datos recibidos:', {
        tipo: Array.isArray(data) ? 'array' : typeof data,
        cantidad: Array.isArray(data) ? data.length : 'N/A',
        muestra: Array.isArray(data) && data.length > 0 ? data[0] : data,
        datosCompletos: data
      })
      
      const backendIncidents = Array.isArray(data) ? data : []

      const mappedIncidents = backendIncidents.map(mapBackendIncidentToFrontend)
      setIncidents(mappedIncidents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener incidentes')
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters, user])

  useEffect(() => {
    if (user) {
      fetchIncidents()
    }
    // Solo ejecutar cuando cambien los filtros o el usuario, no cuando cambie fetchIncidents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.UUID, user?.Role, user?.Area, memoizedFilters])

  useEffect(() => {
    if (!wsClient.isConnected() || !user) {
      return
    }

    const handleNewIncident = (data: any) => {
      const incident = data.incident || data.data || data
      
      if (!incident || (!incident.UUID && !incident.uuid && !incident.Title)) {
        return
      }
      
      const mappedIncident = mapBackendIncidentToFrontend(incident)
      
      setIncidents((prev) => {
        const exists = prev.some((inc) => inc.UUID === mappedIncident.UUID)
        if (exists) {
          return prev.map((inc) => (inc.UUID === mappedIncident.UUID ? mappedIncident : inc))
        }
        
        if (user?.Role === 'COORDINATOR' && user?.Area) {
          const belongsToArea = mappedIncident.ResponsibleArea.includes(user.Area)
          if (!belongsToArea) {
            return prev
          }
        } else if (user?.Role === 'COMMUNITY') {
          const isOwnIncident = mappedIncident.CreatedById === user.UUID
          const isGlobal = mappedIncident.IsGlobal
          if (!isOwnIncident && !isGlobal) {
            return prev
          }
        } else if (user?.Role === 'PERSONAL') {
          const belongsToArea = mappedIncident.ResponsibleArea.includes(user.Area || '')
          const isAssigned = mappedIncident.AssignedToPersonalId === user.UUID
          if (!belongsToArea && !isAssigned) {
            return prev
          }
        }
        
        return [mappedIncident, ...prev]
      })
    }

    const handleEditIncident = (data: any) => {
      const incident = data.incident || data.data || data
      const mappedIncident = mapBackendIncidentToFrontend(incident)
      setIncidents((prev) =>
        prev.map((inc) => (inc.UUID === mappedIncident.UUID ? mappedIncident : inc))
      )
    }

    const handleDeleteIncident = (data: any) => {
      const uuid = data.uuid || data.UUID
      if (uuid) {
        setIncidents((prev) => prev.filter((inc) => inc.UUID !== uuid))
      }
    }

    const handleAuthorityManageIncidents = (data: any) => {
      const incident = data.incident || data.data || data
      const mappedIncident = mapBackendIncidentToFrontend(incident)
      
      setIncidents((prev) =>
        prev.map((inc) => (inc.UUID === mappedIncident.UUID ? mappedIncident : inc))
      )
    }

    wsClient.on('NewIncident', handleNewIncident)
    wsClient.on('PublishIncident', handleNewIncident)
    wsClient.on('EditIncidentContent', handleEditIncident)
    wsClient.on('IncidentDeleted', handleDeleteIncident)
    wsClient.on('StaffChooseIncident', handleEditIncident)
    wsClient.on('CoordinatorAssignIncident', handleEditIncident)
    wsClient.on('SolvedIncident', handleEditIncident)
    wsClient.on('AuthorityManageIncidents', handleAuthorityManageIncidents)

    return () => {
      wsClient.off('NewIncident', handleNewIncident)
      wsClient.off('PublishIncident', handleNewIncident)
      wsClient.off('EditIncidentContent', handleEditIncident)
      wsClient.off('IncidentDeleted', handleDeleteIncident)
      wsClient.off('StaffChooseIncident', handleEditIncident)
      wsClient.off('CoordinatorAssignIncident', handleEditIncident)
      wsClient.off('SolvedIncident', handleEditIncident)
      wsClient.off('AuthorityManageIncidents', handleAuthorityManageIncidents)
    }
  }, [user])

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
