'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import RoleGuard from '@/components/RoleGuard'
import Map from '@/components/Map'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, MapPin, Users, CheckCircle2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Incident } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { format } from 'date-fns'
import { wsClient } from '@/lib/websocket'

function PersonalDashboardContent() {
  const { user } = useUser()
  const [assignedIncidents, setAssignedIncidents] = useState<Incident[]>([])
  const [areaIncidents, setAreaIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Función para obtener información del usuario incluyendo ToList
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return null
      }

      const whoamiUrl = process.env.NEXT_PUBLIC_LAMBDA_WHOAMI_URL || 'https://687qtzms2l.execute-api.us-east-1.amazonaws.com/whoami'
      
      const response = await fetch(whoamiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al obtener información del usuario: ${response.status}`)
      }

      const userInfo = await response.json()
      console.log('👤 PERSONAL - Información del usuario obtenida:', userInfo)
      return userInfo
    } catch (error) {
      console.error('❌ Error al obtener información del usuario:', error)
      return null
    }
  }

  // Función para obtener detalles de incidentes desde ToList
  const fetchAssignedIncidentsFromToList = async (toList: Array<{tenant_id: string, uuid: string}>) => {
    if (!toList || toList.length === 0) {
      return []
    }

    const incidentDetails: Incident[] = []
    const incidentsUrl = process.env.NEXT_PUBLIC_LAMBDA_INCIDENTS_URL

    for (const item of toList) {
      try {
        // Obtener detalles del incidente específico
        const url = `${incidentsUrl}?tenant_id=${encodeURIComponent(item.tenant_id)}&uuid=${encodeURIComponent(item.uuid)}`
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        })

        if (response.ok) {
          const incidents = await response.json()
          if (incidents && incidents.length > 0) {
            const incident = incidents[0]
            // Mapear al formato frontend
            const mappedIncident: Incident = {
              Type: incident.tenant_id || incident.Type || '',
              UUID: incident.uuid || incident.UUID || '',
              Title: incident.Title || '',
              Description: incident.Description || '',
              ResponsibleArea: Array.isArray(incident.ResponsibleArea) 
                ? incident.ResponsibleArea 
                : [incident.ResponsibleArea].filter(Boolean),
              CreatedById: incident.CreatedById || '',
              CreatedByName: incident.CreatedByName || '',
              Status: incident.Status || 'Pendiente',
              Priority: incident.Priority || 'MEDIA',
              CreatedAt: incident.CreatedAt || '',
              LocationTower: incident.LocationTower || '',
              LocationFloor: incident.LocationFloor || '',
              LocationArea: incident.LocationArea || '',
              IsGlobal: incident.IsGlobal || false,
              Reference: incident.Reference || '',
              Comment: incident.Comment || null,
              PendienteReasignacion: incident.PendienteReasignacion || false,
            }
            incidentDetails.push(mappedIncident)
          }
        }
      } catch (error) {
        console.error(`❌ Error al obtener detalles del incidente ${item.uuid}:`, error)
      }
    }

    return incidentDetails
  }

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user || !user.Area) {
        setLoading(false)
        setError('Usuario sin área definida')
        return
      }

      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('auth_token')
        if (!token) {
          console.error('No hay token de autenticación')
          return
        }

        // Obtener incidentes por área
        const incidentsUrl = process.env.NEXT_PUBLIC_LAMBDA_INCIDENTS_URL
        if (!incidentsUrl) {
          console.error('Variable de entorno NEXT_PUBLIC_LAMBDA_INCIDENTS_URL no configurada')
          return
        }

        // Llamar al endpoint con filtro por status=Pendiente para mostrar solo incidentes pendientes
        const url = `${incidentsUrl}?status=Pendiente`
        
        // 1. Primero obtener información del usuario (incluye ToList con incidentes asignados)
        console.log('👤 PERSONAL - Obteniendo información del usuario...')
        const userInfo = await fetchUserInfo()
        if (!userInfo) {
          throw new Error('No se pudo obtener información del usuario')
        }

        console.log('📋 PERSONAL - ToList del usuario:', userInfo.ToList)

        // 2. Obtener incidentes asignados desde ToList
        let assignedFromToList: Incident[] = []
        if (userInfo.ToList && userInfo.ToList.length > 0) {
          console.log('📥 PERSONAL - Obteniendo detalles de incidentes asignados...')
          assignedFromToList = await fetchAssignedIncidentsFromToList(userInfo.ToList)
          console.log('✅ PERSONAL - Incidentes asignados obtenidos:', assignedFromToList.length)
        }

        // 3. Obtener incidentes disponibles del área
        console.log('📡 PERSONAL - Llamada a API para incidentes del área:', {
          userArea: user.Area,
          url,
          token: token ? 'presente' : 'ausente'
        })
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        console.log('📄 PERSONAL - Respuesta API:', {
          status: response.status,
          ok: response.ok
        })

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const incidents = await response.json()
        
        console.log('🔍 PERSONAL - Incidentes del área obtenidos:', incidents.length)
        
        // Mapear los datos del backend al formato frontend
        const mappedIncidents: Incident[] = incidents.map((incident: any) => ({
          Type: incident.tenant_id || incident.Type || '',
          UUID: incident.uuid || incident.UUID || '',
          Title: incident.Title || '',
          Description: incident.Description || '',
          ResponsibleArea: Array.isArray(incident.ResponsibleArea) 
            ? incident.ResponsibleArea 
            : [incident.ResponsibleArea].filter(Boolean),
          CreatedById: incident.CreatedById || '',
          CreatedByName: incident.CreatedByName || '',
          Status: incident.Status || 'Pendiente', // El backend ya envía el estado en español
          Priority: incident.Priority || 'MEDIA',
          IsGlobal: incident.IsGlobal || false,
          CreatedAt: incident.CreatedAt || '',
          ExecutingAt: incident.ExecutingAt || undefined,
          ResolvedAt: incident.ResolvedAt || undefined,
          LocationTower: incident.LocationTower || '',
          LocationFloor: incident.LocationFloor || '',
          LocationArea: incident.LocationArea || '',
          Reference: incident.Reference || '',
          AssignedToPersonalId: incident.AssignedToPersonalId || undefined,
          PendienteReasignacion: incident.PendienteReasignacion || false,
          Subtype: incident.Subtype || incident.subType?.toString() || undefined,
          Comment: Array.isArray(incident.Comment) ? incident.Comment : [],
        }))

        console.log('📋 PERSONAL - Incidentes mapeados:', mappedIncidents.map(inc => ({
          UUID: inc.UUID,
          Title: inc.Title,
          ResponsibleArea: inc.ResponsibleArea,
          AssignedToPersonalId: inc.AssignedToPersonalId
        })))
        
        // Separar incidentes asignados específicamente al usuario vs incidentes del área
        const assigned = mappedIncidents.filter(inc => inc.AssignedToPersonalId === user.UUID)
        console.log('🎯 PERSONAL - Incidentes asignados a mí:', assigned.length)
        
        // Mapear posibles variaciones de nombres de área
        const areaMap: { [key: string]: string } = {
          'TI': 'Tecnologías de la Información (TI)',
          'Tecnologías de la Información': 'Tecnologías de la Información (TI)',
          'Infraestructura': 'Infraestructura y mantenimiento',
          'Mantenimiento': 'Infraestructura y mantenimiento',
          'Laboratorios': 'Laboratorios y talleres',
          'Talleres': 'Laboratorios y talleres',
          'Servicio médico': 'Servicio médico/Tópico',
          'Tópico': 'Servicio médico/Tópico',
        }
        
        const userAreaNormalized = areaMap[user.Area!] || user.Area!
        console.log('🏷️ PERSONAL - Área del usuario:', {
          original: user.Area,
          normalizada: userAreaNormalized
        })
        
        const areaOnly = mappedIncidents.filter(inc => {
          const isAreaMatch = inc.ResponsibleArea.some(area => {
            const matches = area === userAreaNormalized || 
                           areaMap[area] === userAreaNormalized ||
                           area === user.Area ||
                           area.toLowerCase().includes(user.Area!.toLowerCase()) ||
                           user.Area!.toLowerCase().includes(area.toLowerCase())
            
            if (matches) {
              console.log('✅ PERSONAL - Match encontrado:', {
                incidentArea: area,
                userArea: user.Area,
                incidentTitle: inc.Title
              })
            }
            return matches
          })
          
          return !inc.AssignedToPersonalId && isAreaMatch
        })
        
        console.log('🏢 PERSONAL - Incidentes del área:', areaOnly.length)
        
        // 4. Actualizar estados con los nuevos datos
        console.log('📊 PERSONAL - Resumen final:', {
          totalIncidentsFromAPI: incidents.length,
          assignedFromToList: assignedFromToList.length,
          availableInArea: areaOnly.length
        })
        
        setAssignedIncidents(assignedFromToList) // Usar incidentes de ToList
        setAreaIncidents(areaOnly)
        
      } catch (error) {
        console.error('Error al cargar incidentes del área:', error)
        setError('Error al cargar los incidentes. Por favor, intenta nuevamente.')
        setAssignedIncidents([])
        setAreaIncidents([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [user])

  const stats = {
    assigned: assignedIncidents.length,
    assignedPending: assignedIncidents.filter((i) => i.Status === 'Pendiente').length,
    assignedInProgress: assignedIncidents.filter((i) => i.Status === 'EnAtencion').length,
    assignedResolved: assignedIncidents.filter((i) => i.Status === 'Resuelto').length,
    areaTotal: areaIncidents.length,
  }

  const handleUpdateStatus = async (uuid: string, newStatus: Incident['Status']) => {
    if (!user) return

    // Para marcar como resuelto, usar WebSocket con SolvedIncident
    if (newStatus === 'Resuelto') {
      try {
        // Encontrar el incidente para obtener el tenant_id
        const incident = assignedIncidents.find(inc => inc.UUID === uuid)
        if (!incident) {
          console.error('Incidente no encontrado:', uuid)
          alert('Error: Incidente no encontrado')
          return
        }

        const payload = {
          action: 'SolvedIncident',
          tenant_id: incident.Type, // El Type contiene el tenant_id
          uuid: uuid
        }

        console.log('📤 Enviando SolvedIncident:', payload)

        // Enviar mediante WebSocket
        if (wsClient.isConnected()) {
          wsClient.send(payload)
          
          // Actualizar el estado local inmediatamente para mejor UX
          setAssignedIncidents(
            assignedIncidents.map((inc) =>
              inc.UUID === uuid ? { ...inc, Status: 'Resuelto' } : inc
            )
          )
          
          console.log('✅ Incidente marcado como resuelto exitosamente')
        } else {
          console.error('❌ WebSocket no conectado')
          alert('Error: No hay conexión WebSocket. Por favor recarga la página.')
        }
      } catch (error) {
        console.error('❌ Error al marcar incidente como resuelto:', error)
        alert('Error al marcar el incidente como resuelto. Por favor intenta de nuevo.')
      }
    } else {
      // Para otros estados, solo actualizar localmente (por ahora)
      setAssignedIncidents(
        assignedIncidents.map((inc) =>
          inc.UUID === uuid ? { ...inc, Status: newStatus } : inc
        )
      )
    }
  }

  const handleChooseIncident = async (incident: Incident) => {
    if (!user) return

    try {
      // Preparar el payload para el WebSocket
      const payload = {
        action: 'StaffChooseIncident',
        tenant_id: incident.Type, // El Type contiene el tenant_id
        uuid: incident.UUID,
        Area: user.Area // Área del usuario PERSONAL
      }

      console.log('📤 Enviando StaffChooseIncident:', payload)

      // Enviar mediante WebSocket
      if (wsClient.isConnected()) {
        wsClient.send(payload)
        
        // Actualizar el estado local inmediatamente para mejor UX
        setAreaIncidents(areaIncidents.filter(inc => inc.UUID !== incident.UUID))
        setAssignedIncidents([...assignedIncidents, { ...incident, Status: 'EnAtencion' }])
        
        console.log('✅ Incidente elegido y asignado exitosamente')
      } else {
        console.error('❌ WebSocket no conectado')
        alert('Error: No hay conexión WebSocket. Por favor recarga la página.')
      }
    } catch (error) {
      console.error('❌ Error al elegir incidente:', error)
      alert('Error al elegir el incidente. Por favor intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Dashboard <span className="gradient-text">Personal</span>
          </h1>
          <p className="text-xl text-gray-600">Gestiona los incidentes asignados a tu área: {user?.Area}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-utec-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando incidentes de tu área...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Content - only show when not loading */}
        {!loading && !error && (
          <>
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-utec-secondary via-utec-light to-utec-secondary text-white mb-8 animate-slide-up shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative p-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Área: {user?.Area}</h2>
              <p className="text-white/95 text-lg">Personal Administrativo - Gestiona incidentes asignados</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-xl shadow-lg">
              <Users className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="card group cursor-pointer animate-slide-up bg-gradient-to-br from-green-500 to-green-600 text-white" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 mb-2 font-medium">Asignados a Mí</p>
                <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{stats.assigned}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.assignedPending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">En Atención</p>
                <p className="text-3xl font-bold text-utec-secondary group-hover:scale-110 transition-transform">{stats.assignedInProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-utec-secondary" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Resueltos</p>
                <p className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform">{stats.assignedResolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">En Mi Área</p>
                <p className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform">{stats.areaTotal}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Assigned Incidents */}
        <div className="card mb-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle2 className="h-6 w-6 mr-3 text-green-600" />
            Incidentes Asignados a Mí
          </h2>
          <div className="space-y-4">
            {assignedIncidents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tienes incidentes asignados</p>
              </div>
            ) : (
              assignedIncidents.map((incident) => (
                <div key={incident.UUID} className="p-4 border-2 border-gray-100 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{incident.Title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {incident.LocationTower} - {incident.LocationFloor} - {incident.LocationArea}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">{incident.Description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Reportado por: {incident.CreatedByName}</span>
                        <span>
                          {format(new Date(incident.CreatedAt), "dd/MM/yyyy 'a las' HH:mm")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span
                        className={`badge ${
                        incident.Status === 'Pendiente'
                          ? 'badge-pending'
                          : incident.Status === 'EnAtencion'
                          ? 'badge-in-progress'
                          : 'badge-resolved'
                        }`}
                      >
                        {incident.Status === 'Pendiente'
                          ? 'Pendiente'
                          : incident.Status === 'EnAtencion'
                          ? 'En Atención'
                          : 'Resuelto'}
                      </span>
                      <span
                        className={`badge ${
                          incident.Priority === 'CRÍTICO' || incident.Priority === 'ALTA'
                            ? 'badge-urgent'
                            : 'badge-pending'
                        }`}
                      >
                        {incident.Priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Link
                      href={`/incidents/${encodeURIComponent(incident.UUID)}`}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Ver Detalles</span>
                    </Link>
                    <div className="flex space-x-2">
                      {incident.Status !== 'EnAtencion' && (
                        <button
                          onClick={() => handleUpdateStatus(incident.UUID, 'EnAtencion')}
                          className="px-4 py-2 bg-utec-secondary text-white rounded-lg hover:bg-utec-primary transition-colors text-sm"
                        >
                          Tomar en Atención
                        </button>
                      )}
                      {incident.Status !== 'Resuelto' && (
                        <button
                          onClick={() => handleUpdateStatus(incident.UUID, 'Resuelto')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Marcar como Resuelto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Area Incidents */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-purple-600" />
            Incidentes en Mi Área ({user?.Area})
          </h2>
          <div className="space-y-4">
            {areaIncidents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay incidentes pendientes en tu área</p>
              </div>
            ) : (
              areaIncidents.map((incident) => (
                <div
                  key={incident.UUID}
                  className="p-4 border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Link 
                      href={`/incidents/${encodeURIComponent(incident.UUID)}`}
                      className="flex-1 group"
                    >
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                        {incident.Title}
                      </h3>
                    </Link>
                    <span
                      className={`badge ${
                        incident.Status === 'Pendiente'
                          ? 'badge-pending'
                          : incident.Status === 'EnAtencion'
                          ? 'badge-in-progress'
                          : 'badge-resolved'
                      }`}
                    >
                      {incident.Status === 'Pendiente'
                        ? 'Pendiente'
                        : incident.Status === 'EnAtencion'
                        ? 'En Atención'
                        : 'Resuelto'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    {incident.LocationTower} - {incident.LocationFloor} - {incident.LocationArea}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{incident.Description}</p>
                  
                  {/* Botones de acción */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Link
                      href={`/incidents/${encodeURIComponent(incident.UUID)}`}
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium text-xs"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Ver Detalles</span>
                    </Link>
                    
                    {/* Solo mostrar botón de elegir para incidentes pendientes */}
                    {incident.Status === 'Pendiente' && (
                      <button
                        onClick={() => handleChooseIncident(incident)}
                        className="px-3 py-1 bg-utec-secondary text-white rounded-lg hover:bg-utec-primary transition-colors text-xs font-medium"
                      >
                        Elegir Incidente
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PersonalDashboard() {
  return (
    <RoleGuard allowedRoles={['PERSONAL']}>
      <PersonalDashboardContent />
    </RoleGuard>
  )
}

