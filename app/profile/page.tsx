'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { User, Mail, CheckCircle, AlertCircle, Clock, FileText, TrendingUp, AlertTriangle, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { User as UserType, UserRole, Incident } from '@/types'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'
import { authenticatedFetch } from '@/lib/auth'

export default function ProfilePage() {
  const { user: contextUser, setUser: setContextUser } = useUser()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolvedIncidents, setResolvedIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Obtener datos del usuario desde el lambda
        const usersUrl = process.env.NEXT_PUBLIC_LAMBDA_USERS_URL!
        const response = await authenticatedFetch(usersUrl, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error('Error al cargar el perfil')
        }

        const data = await response.json()
        
        // Mapear la respuesta al formato User
        const userData: UserType = {
          Role: data.Role,
          UUID: data.UUID,
          UserId: data.UserId,
          FullName: data.FullName,
          Email: data.Email,
          Area: data.Area || undefined,
          CommunityCode: data.CommunityCode || undefined,
          Status: data.Status,
          CreatedAt: data.CreatedAt,
          ToList: data.ToList || undefined,
        }

        setUser(userData)
        // Actualizar también el contexto global
        setContextUser(userData)
      } catch (error) {
        console.error('Error al cargar perfil:', error)
        // Si falla, usar el usuario del contexto como fallback
        if (contextUser) {
          setUser(contextUser)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [contextUser])

  useEffect(() => {
    // Simulación de datos - aquí iría la llamada a la API filtrando por CreatedById y Status = RESUELTO
    const mockIncidents: Incident[] = [
      {
        Type: 'Seguridad',
        UUID: 'INC-001',
        Title: 'Robo de mochila',
        Description: 'Se reportó el robo de una mochila en el área de estudio',
        ResponsibleArea: ['Seguridad'],
        CreatedById: user?.UUID || 'user1',
        CreatedByName: user?.FullName || 'Juan Pérez',
        Status: 'RESUELTO',
        Priority: 'ALTA',
        IsGlobal: false,
        CreatedAt: '2024-11-14T14:30:00Z',
        ExecutingAt: '2024-11-14T15:00:00Z',
        ResolvedAt: '2024-11-14T18:00:00Z',
        LocationTower: 'Torre A',
        LocationFloor: 'Piso 2',
        LocationArea: 'Área de estudio',
        Reference: 'REF-001',
        PendienteReasignacion: false,
        Comment: [],
      },
      {
        Type: 'Infraestructura',
        UUID: 'INC-002',
        Title: 'Servicios higiénicos dañados',
        Description: 'Problemas con los servicios higiénicos del segundo piso',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: user?.UUID || 'user1',
        CreatedByName: user?.FullName || 'Juan Pérez',
        Status: 'RESUELTO',
        Priority: 'MEDIA',
        IsGlobal: false,
        CreatedAt: '2024-11-13T10:15:00Z',
        ExecutingAt: '2024-11-13T11:00:00Z',
        ResolvedAt: '2024-11-13T16:30:00Z',
        LocationTower: 'Torre B',
        LocationFloor: 'Piso 2',
        LocationArea: 'Baños',
        Reference: 'REF-002',
        PendienteReasignacion: false,
        Comment: [],
      },
      {
        Type: 'TI',
        UUID: 'INC-003',
        Title: 'Internet caído en piso 3',
        Description: 'Problemas de conectividad en el tercer piso',
        ResponsibleArea: ['Tecnologías de la Información (TI)'],
        CreatedById: user?.UUID || 'user1',
        CreatedByName: user?.FullName || 'Juan Pérez',
        Status: 'RESUELTO',
        Priority: 'BAJO',
        IsGlobal: false,
        CreatedAt: '2024-11-12T09:00:00Z',
        ExecutingAt: '2024-11-12T10:00:00Z',
        ResolvedAt: '2024-11-12T14:00:00Z',
        LocationTower: 'Torre C',
        LocationFloor: 'Piso 3',
        LocationArea: 'Aulas',
        Reference: 'REF-003',
        PendienteReasignacion: false,
        Comment: [],
      },
      {
        Type: 'Limpieza',
        UUID: 'INC-004',
        Title: 'Piso sucio en pasillo',
        Description: 'El pasillo principal necesita limpieza urgente',
        ResponsibleArea: ['Limpieza'],
        CreatedById: user?.UUID || 'user1',
        CreatedByName: user?.FullName || 'Juan Pérez',
        Status: 'RESUELTO',
        Priority: 'BAJO',
        IsGlobal: false,
        CreatedAt: '2024-11-10T16:45:00Z',
        ExecutingAt: '2024-11-10T17:00:00Z',
        ResolvedAt: '2024-11-10T18:00:00Z',
        LocationTower: 'Torre A',
        LocationFloor: 'Piso 1',
        LocationArea: 'Pasillo principal',
        Reference: 'REF-004',
        PendienteReasignacion: false,
        Comment: [],
      },
      {
        Type: 'Infraestructura',
        UUID: 'INC-005',
        Title: 'Aire acondicionado no funciona',
        Description: 'El aire acondicionado del aula 301 no funciona',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: user?.UUID || 'user1',
        CreatedByName: user?.FullName || 'Juan Pérez',
        Status: 'EN_ATENCION',
        Priority: 'MEDIA',
        IsGlobal: false,
        CreatedAt: '2024-11-15T08:00:00Z',
        ExecutingAt: '2024-11-15T09:00:00Z',
        LocationTower: 'Torre B',
        LocationFloor: 'Piso 3',
        LocationArea: 'Aula 301',
        Reference: 'REF-005',
        AssignedToPersonalId: 'personal1',
        PendienteReasignacion: false,
        Comment: [],
      },
    ]

    // Filtrar solo incidentes resueltos
    const resolved = mockIncidents.filter((inc) => inc.Status === 'RESUELTO')
    setResolvedIncidents(resolved)

    // Calcular estadísticas
    const total = mockIncidents.length
    const pending = mockIncidents.filter((inc) => inc.Status === 'PENDIENTE').length
    const inProgress = mockIncidents.filter((inc) => inc.Status === 'EN_ATENCION').length
    const resolvedCount = resolved.length

    setStats({
      total,
      pending,
      inProgress,
      resolved: resolvedCount,
    })
  }, [user])


  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'COMMUNITY':
        return 'Community'
      case 'PERSONAL':
        return 'Personal'
      case 'COORDINATOR':
        return 'Coordinador'
      case 'AUTHORITY':
        return 'Autoridad'
      default:
        return role
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'COMMUNITY':
        return 'bg-utec-light/20 text-utec-primary border-utec-secondary/30'
      case 'PERSONAL':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'COORDINATOR':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'AUTHORITY':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-utec-gray">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-utec-gray">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se pudo cargar el perfil</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: Incident['Status']) => {
    switch (status) {
      case 'PENDIENTE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><Clock className="h-3 w-3 mr-1" />Pendiente</span>
      case 'EN_ATENCION':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><AlertTriangle className="h-3 w-3 mr-1" />En Atención</span>
      case 'RESUELTO':
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

  const getCategoryColor = (type: string) => {
    const categoryColors: { [key: string]: string } = {
      'Seguridad': 'bg-red-100 text-red-800',
      'Limpieza': 'bg-blue-100 text-blue-800',
      'Infraestructura': 'bg-green-100 text-green-800',
      'Infraestructura y mantenimiento': 'bg-green-100 text-green-800',
      'TI': 'bg-orange-100 text-orange-800',
      'Tecnologías de la Información (TI)': 'bg-orange-100 text-orange-800',
      'Laboratorios y talleres': 'bg-purple-100 text-purple-800',
    }
    return categoryColors[type] || 'bg-gray-100 text-gray-800'
  }

  const getDefaultImage = (incident: Incident): string => {
    const subtypeImageMap: { [key: string]: string } = {
      'Convivencia': '/convivencia.jpg',
      'Robos': '/robos.jpeg',
      'Pérdidas': '/perdidas.jpg',
      'Intento de atentar contra la integridad personal': '/intento-integridad.webp',
      'Accidentes': '/accidentes.webp',
      'Área sucia o desordenada': '/area-sucia.jpeg',
      'Falta de suministros de limpieza': '/falta-insumos.jpg',
      'Servicios higiénicos inoperativos': '/servicios-inoperativos.jpg',
      'Salidas de emergencia': '/salida-emergencia.webp',
      'Mobiliario en mal estado': '/mobiliario-mal-estado.webp',
      'Estructura dañada': '/estructura-danada.png',
      'Máquinas malogradas o fuera de servicio': '/maquinas-malogradas.jpg',
      'Falta de EPP': '/falta-epp.webp',
      'Derrames de sustancias peligrosas': '/derrame-quimico.jpg',
      'Incumplimiento de normas de seguridad': '/incumplimiento-normas.jpg',
      'Incidentes eléctricos': '/incidente-electrico.webp',
      'Acceso no autorizado': '/acceso-no-autorizado.jpg',
      'Internet caído': '/internet-caido.jpg',
      'Fallas en sistemas institucionales': '/sistemas-fallando.jpg',
      'Equipos en aulas': '/equipos-aulas.jpg',
    }
    
    if (incident.Subtype && subtypeImageMap[incident.Subtype]) {
      return subtypeImageMap[incident.Subtype]
    }
    
    if (incident.Title) {
      for (const [subtype, image] of Object.entries(subtypeImageMap)) {
        if (incident.Title.includes(subtype)) {
          return image
        }
      }
    }
    
    const areaImageMap: { [key: string]: string } = {
      'Seguridad': '/seguridad.png',
      'Limpieza': '/limpieza.jpg',
      'Infraestructura y mantenimiento': '/infraestructura.jpg',
      'Laboratorios y talleres': '/laboratorios.png',
      'Tecnologías de la Información (TI)': '/ti.jpg',
      'TI': '/ti.jpg',
    }
    
    const area = incident.ResponsibleArea?.[0] || ''
    if (areaImageMap[area]) {
      return areaImageMap[area]
    }
    
    return '/infraestructura.jpg'
  }

  const getIncidentImage = (incident: Incident): string => {
    if (incident.Images && incident.Images.length > 0) {
      return incident.Images[0]
    }
    return getDefaultImage(incident)
  }

  return (
    <div className="bg-utec-gray pb-8">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* Columna Izquierda - Perfil y Resumen */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            {/* Profile Card */}
            <div className="card animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-utec-secondary to-utec-light rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                  {user.FullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.FullName}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${getRoleColor(user.Role)}`}>
                      {getRoleLabel(user.Role)}
                    </span>
                    <span
                      className={`badge ${
                        user.Status === 'ACTIVE'
                          ? 'badge-resolved'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {user.Status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información de Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium text-gray-900">{user.Email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">ID Comunidad:</span>
                  <span className="ml-2 font-medium text-gray-900">{user.UserId}</span>
                </div>
                {user.CommunityCode && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Tipo de ID:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {user.CommunityCode === 'DNI' ? 'DNI' : 'Credenciales UTEC'}
                    </span>
                  </div>
                )}
                {(user.Role === 'COORDINATOR' || user.Role === 'PERSONAL') && user.Area && (
                  <div className="flex items-center text-sm">
                    <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">
                      {user.Role === 'PERSONAL' ? 'Área:' : 'Área a cargo:'}
                    </span>
                    <span className="ml-2 font-medium text-gray-900">{user.Area}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen de Reportes */}
            <div className="relative overflow-hidden bg-gradient-to-br from-utec-light/40 via-utec-secondary/25 to-utec-light/40 rounded-2xl shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {/* Patrón geométrico de hexágonos */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2319BCDE' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
              
              <div className="relative p-6">
                {/* Reportes Totales - Card grande */}
                <div className="mb-4 p-5 bg-white rounded-xl shadow-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-utec-secondary" />
                      <div className="text-sm text-gray-600">Reportes Totales</div>
                    </div>
                    <div className="text-4xl font-bold text-gray-900">{stats.total}</div>
                  </div>
                </div>
                
                {/* Fila con tres cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Pendientes */}
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-orange-200/50">
                    <Clock className="h-6 w-6 text-orange-600 mb-3 mx-auto" />
                    <div className="text-xs text-gray-600 mb-1 text-center">Pendientes</div>
                    <div className="text-2xl font-bold text-orange-600 text-center">{stats.pending}</div>
                  </div>
                  
                  {/* En Atención */}
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-200/50">
                    <AlertTriangle className="h-6 w-6 text-blue-600 mb-3 mx-auto" />
                    <div className="text-xs text-gray-600 mb-1 text-center">En Atención</div>
                    <div className="text-2xl font-bold text-blue-600 text-center">{stats.inProgress}</div>
                  </div>
                  
                  {/* Resueltos */}
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-green-200/50">
                    <CheckCircle className="h-6 w-6 text-green-600 mb-3 mx-auto" />
                    <div className="text-xs text-gray-600 mb-1 text-center">Resueltos</div>
                    <div className="text-2xl font-bold text-green-600 text-center">{stats.resolved}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Historial de Incidentes Resueltos */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="card animate-slide-up flex flex-col h-full" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex-shrink-0">Historial de Incidentes Resueltos</h2>
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 pr-2 ${resolvedIncidents.length > 4 ? 'overflow-y-auto' : 'overflow-hidden'}`} style={{ height: '276px', maxHeight: '276px', alignContent: 'start' }}>
                {resolvedIncidents.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tienes incidentes resueltos aún</p>
                  </div>
                ) : (
                  resolvedIncidents.map((incident, index) => (
                    <Link
                      key={incident.UUID}
                      href={`/incidents/${incident.UUID}`}
                      className="relative overflow-hidden rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer block"
                      style={{ height: '130px' }}
                    >
                      {/* Imagen de fondo */}
                      <div className="relative w-full h-full">
                        <img
                          src={getIncidentImage(incident)}
                          alt={incident.Title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
                        
                        {/* Contenido sobre la imagen */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(incident.ResponsibleArea[0] || '')}`}>
                              {incident.ResponsibleArea[0] || 'Sin categoría'}
                            </span>
                            {getPriorityBadge(incident.Priority)}
                          </div>
                          <h3 className="text-sm md:text-base font-bold text-white leading-tight drop-shadow-lg mb-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)' }}>
                            {incident.Title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-white/90">
                            <span>{format(new Date(incident.CreatedAt), 'dd MMM yyyy')}</span>
                            <span>{format(new Date(incident.CreatedAt), 'HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              {resolvedIncidents.length > 0 && (
                <div className="mt-6 text-center pt-4 border-t border-gray-200">
                  <Link
                    href="/my-reports"
                    className="inline-flex items-center text-gray-600 hover:text-utec-primary font-semibold text-sm transition-colors"
                  >
Ver más reportes →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

