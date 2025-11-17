'use client'

import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Clock, CheckCircle, Search, Filter, Eye, Edit, X } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Incident } from '@/types'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { formatPeruTime, formatWaitingTime, calculateWaitingMinutes } from '@/lib/dateUtils'

export default function MyReportsPage() {
  const router = useRouter()
  const { user } = useUser()
  
  // Estados para manejar los incidentes (asignados para PERSONAL, creados para COMMUNITY)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Función para obtener información del usuario incluyendo ToList
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return null
      }

      const whoamiUrl = process.env.NEXT_PUBLIC_LAMBDA_WHOAMI_URL
      if (!whoamiUrl) {
        console.error('Variable de entorno NEXT_PUBLIC_LAMBDA_WHOAMI_URL no configurada')
        return null
      }
      
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
      console.log('👤 MY-REPORTS - Información del usuario obtenida:', userInfo)
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
              ExecutingAt: incident.ExecutingAt || undefined,
              ResolvedAt: incident.ResolvedAt || undefined,
              AssignedToPersonalId: incident.AssignedToPersonalId || undefined,
              Subtype: incident.Subtype || incident.subType?.toString() || undefined,
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

  // Función para obtener incidentes creados por el usuario COMMUNITY
  const fetchCreatedIncidents = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No hay token de autenticación')
        return []
      }

      const incidentsUrl = process.env.NEXT_PUBLIC_LAMBDA_INCIDENTS_URL
      if (!incidentsUrl) {
        console.error('Variable de entorno NEXT_PUBLIC_LAMBDA_INCIDENTS_URL no configurada')
        return []
      }

      // Obtener todos los incidentes y filtrar por CreatedById
      const response = await fetch(incidentsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al obtener incidentes: ${response.status}`)
      }

      const allIncidents = await response.json()
      console.log('📋 MY-REPORTS (COMMUNITY) - Total incidentes obtenidos:', allIncidents.length)

      // Filtrar solo los incidentes creados por este usuario
      const userIncidents = allIncidents.filter((incident: any) => 
        incident.CreatedById === user?.UUID
      )

      console.log('🎯 MY-REPORTS (COMMUNITY) - Incidentes creados por usuario:', userIncidents.length)

      // Mapear al formato frontend
      const mappedIncidents: Incident[] = userIncidents.map((incident: any) => ({
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
        ExecutingAt: incident.ExecutingAt || undefined,
        ResolvedAt: incident.ResolvedAt || undefined,
        AssignedToPersonalId: incident.AssignedToPersonalId || undefined,
        Subtype: incident.Subtype || incident.subType?.toString() || undefined,
      }))

      return mappedIncidents
    } catch (error) {
      console.error('❌ Error al obtener incidentes creados:', error)
      return []
    }
  }

  // Efecto para cargar incidentes según el rol del usuario
  useEffect(() => {
    const fetchUserIncidents = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        let userIncidents: Incident[] = []

        if (user.Role === 'COMMUNITY') {
          // Para COMMUNITY: obtener incidentes creados por el usuario
          console.log('👤 MY-REPORTS (COMMUNITY) - Obteniendo incidentes creados por el usuario...')
          userIncidents = await fetchCreatedIncidents()
        } else if (user.Role === 'PERSONAL') {
          // Para PERSONAL: obtener incidentes asignados desde ToList
          console.log('👤 MY-REPORTS (PERSONAL) - Obteniendo información del usuario...')
          const userInfo = await fetchUserInfo()
          if (!userInfo) {
            throw new Error('No se pudo obtener información del usuario')
          }

          console.log('📋 MY-REPORTS (PERSONAL) - ToList del usuario:', userInfo.ToList)

          if (userInfo.ToList && userInfo.ToList.length > 0) {
            console.log('📥 MY-REPORTS (PERSONAL) - Obteniendo detalles de incidentes asignados...')
            userIncidents = await fetchAssignedIncidentsFromToList(userInfo.ToList)
            console.log('✅ MY-REPORTS (PERSONAL) - Incidentes asignados obtenidos:', userIncidents.length)
          }
        } else {
          // Para otros roles, no mostrar incidentes por ahora
          console.log('👤 MY-REPORTS - Rol no soportado:', user.Role)
          userIncidents = []
        }

        setIncidents(userIncidents)
      } catch (error) {
        console.error('❌ Error al cargar incidentes:', error)
        setError('Error al cargar los incidentes. Por favor, intenta nuevamente.')
        setIncidents([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserIncidents()
  }, [user])

  // Filtrar incidentes según búsqueda y estado
  const filteredIncidents = useMemo(() => {
    let filtered = incidents

    if (searchTerm) {
      filtered = filtered.filter(
        (incident) =>
          incident.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.LocationTower.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.LocationFloor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.LocationArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.Description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      // Mapear filtro a valores correctos
      const statusMap: { [key: string]: string } = {
        'pendiente': 'Pendiente',
        'en_atencion': 'EnAtencion',
        'resuelto': 'Resuelto'
      }
      const mappedStatus = statusMap[statusFilter] || statusFilter
      filtered = filtered.filter((incident) => incident.Status === mappedStatus)
    }

    return filtered
  }, [searchTerm, statusFilter, incidents])

  const handleCancelIncident = async (uuid: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar este incidente?')) {
      // TODO: Implementar cancelación de incidente vía WebSocket o API
      // Por ahora solo muestra un mensaje
      alert('Funcionalidad de cancelación pendiente de implementar')
    }
  }

  const getStatusBadge = (status: Incident['Status']) => {
    switch (status) {
      case 'Pendiente':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><Clock className="h-3 w-3 mr-1" />Pendiente</span>
      case 'EnAtencion':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><AlertTriangle className="h-3 w-3 mr-1" />En Atención</span>
      case 'Resuelto':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resuelto</span>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: Incident['Priority']) => {
    switch (priority) {
      case 'CRÍTICO':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">CRÍTICO</span>
      case 'ALTA':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">ALTA</span>
      case 'MEDIA':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-white">MEDIA</span>
      case 'BAJO':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">BAJO</span>
      default:
        return null
    }
  }


  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Seguridad': 'bg-red-100 text-red-800',
      'Limpieza': 'bg-blue-100 text-blue-800',
      'Infraestructura y mantenimiento': 'bg-green-100 text-green-800',
      'Laboratorios y talleres': 'bg-purple-100 text-purple-800',
      'TI': 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getDefaultImage = (incident: Incident): string => {
    // Mapeo completo de subtipos a sus imágenes predeterminadas
    const subtypeImageMap: { [key: string]: string } = {
      // Seguridad
      'Convivencia': '/convivencia.jpg',
      'Robos': '/robos.jpeg',
      'Pérdidas': '/perdidas.jpg',
      'Intento de atentar contra la integridad personal': '/intento-integridad.webp',
      'Accidentes': '/accidentes.webp',
      
      // Limpieza
      'Área sucia o desordenada': '/area-sucia.jpeg',
      'Falta de suministros de limpieza': '/falta-insumos.jpg',
      
      // Infraestructura y mantenimiento
      'Servicios higiénicos inoperativos': '/servicios-inoperativos.jpg',
      'Salidas de emergencia': '/salida-emergencia.webp',
      'Mobiliario en mal estado': '/mobiliario-mal-estado.webp',
      'Estructura dañada': '/estructura-danada.png',
      
      // Laboratorios y talleres
      'Máquinas malogradas o fuera de servicio': '/maquinas-malogradas.jpg',
      'Falta de EPP': '/falta-epp.webp',
      'Derrames de sustancias peligrosas': '/derrame-quimico.jpg',
      'Incumplimiento de normas de seguridad': '/incumplimiento-normas.jpg',
      'Incidentes eléctricos': '/incidente-electrico.webp',
      'Acceso no autorizado': '/acceso-no-autorizado.jpg',
      
      // TI
      'Internet caído': '/internet-caido.jpg',
      'Fallas en sistemas institucionales': '/sistemas-fallando.jpg',
      'Equipos en aulas': '/equipos-aulas.jpg',
    }
    
    // Primero intentar buscar por subtipo si existe
    if (incident.Subtype && subtypeImageMap[incident.Subtype]) {
      return subtypeImageMap[incident.Subtype]
    }
    
    // Si no hay subtipo, intentar buscar por título (puede contener el nombre del subtipo)
    if (incident.Title) {
      for (const [subtype, image] of Object.entries(subtypeImageMap)) {
        if (incident.Title.includes(subtype)) {
          return image
        }
      }
    }
    
    // Mapeo de áreas responsables a imágenes predeterminadas (fallback)
    const areaImageMap: { [key: string]: string } = {
      'Seguridad': '/seguridad.png',
      'Limpieza': '/limpieza.jpg',
      'Infraestructura y mantenimiento': '/infraestructura.jpg',
      'Laboratorios y talleres': '/laboratorios.png',
      'Tecnologías de la Información (TI)': '/ti.jpg',
      'TI': '/ti.jpg',
    }
    
    // Buscar imagen por área responsable
    const area = incident.ResponsibleArea?.[0] || ''
    if (areaImageMap[area]) {
      return areaImageMap[area]
    }
    
    // Si no encuentra por área, buscar por tipo
    const typeImageMap: { [key: string]: string } = {
      'Seguridad': '/seguridad.png',
      'Limpieza': '/limpieza.jpg',
      'Infraestructura': '/infraestructura.jpg',
      'Infraestructura y mantenimiento': '/infraestructura.jpg',
      'Laboratorios': '/laboratorios.png',
      'Laboratorios y talleres': '/laboratorios.png',
      'TI': '/ti.jpg',
    }
    
    if (typeImageMap[incident.Type]) {
      return typeImageMap[incident.Type]
    }
    
    // Imagen por defecto si no se encuentra ninguna
    return '/infraestructura.jpg'
  }

  const getIncidentImage = (incident: Incident): string => {
    // Si tiene imágenes subidas por el alumno, usar la primera
    if (incident.Images && incident.Images.length > 0) {
      return incident.Images[0]
    }
    
    // Si no, usar imagen predeterminada según el tipo
    return getDefaultImage(incident)
  }

  return (
    <div className="min-h-screen bg-utec-gray">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.Role === 'COMMUNITY' ? 'Mis Reportes' : 'Mis Asignaciones'}
          </h1>
          <p className="text-gray-600">
            {user?.Role === 'COMMUNITY' 
              ? 'Gestiona y sigue el estado de los incidentes que has reportado'
              : 'Gestiona y sigue el estado de los incidentes asignados a ti'
            }
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {user?.Role === 'COMMUNITY' ? 'Total Reportes' : 'Total Asignados'}
              </p>
              <p className="text-3xl font-bold text-gray-900">{incidents.length}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-utec-secondary" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">
                {incidents.filter((i) => i.Status === 'Pendiente').length}
              </p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">En Atención</p>
              <p className="text-3xl font-bold text-blue-600">
                {incidents.filter((i) => i.Status === 'EnAtencion').length}
              </p>
            </div>
            <AlertTriangle className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Resueltos</p>
              <p className="text-3xl font-bold text-green-600">
                {incidents.filter((i) => i.Status === 'Resuelto').length}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={1.5} />
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary" />
              <input
                type="text"
                placeholder="Buscar por tipo, ubicación o descripción..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary" />
              <select
                className="input-field pl-10"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_atencion">En Atención</option>
                <option value="resuelto">Resuelto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 card text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-utec-secondary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando incidentes...</p>
            </div>
          ) : error ? (
            <div className="col-span-2 card text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Error al cargar los incidentes</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="col-span-2 card text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron reportes</p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <Link 
                key={incident.UUID} 
                href={`/incidents/${encodeURIComponent(incident.UUID)}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer block"
              >
                {/* Imagen: primera del alumno o predeterminada */}
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={getIncidentImage(incident)}
                    alt={incident.Title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                        {incident.Title}
                      </h3>
                    </div>
                    <div className="ml-2">
                      {getPriorityBadge(incident.Priority)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.Description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(incident.ResponsibleArea[0] || '')}`}>
                      {incident.ResponsibleArea[0] || 'Sin categoría'}
                    </span>
                    {getStatusBadge(incident.Status)}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {formatPeruTime(incident.CreatedAt, { includeTime: false })}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                      {formatWaitingTime(calculateWaitingMinutes(incident.CreatedAt))}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

