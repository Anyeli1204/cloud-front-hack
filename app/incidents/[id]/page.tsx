'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Clock, MapPin, User, Calendar, ArrowLeft, Edit, X, CheckCircle, MessageSquare, Info, Wrench } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Incident, Comment } from '@/types'
import { useUser } from '@/contexts/UserContext'

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos - aquí iría la llamada a la API
    setTimeout(() => {
      setIncident({
        Type: 'Infraestructura y mantenimiento',
        UUID: params.id as string,
        Title: 'Fuga de agua en el baño del segundo piso',
        Description: 'Fuga de agua en el baño del segundo piso. El agua está goteando constantemente desde el techo.',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: 'user1',
        CreatedByName: 'Juan Pérez',
        Status: 'EN_ATENCION',
        Priority: 'ALTA',
        IsGlobal: false,
        CreatedAt: '2024-11-15T10:30:00Z',
        ExecutingAt: '2024-11-15T10:35:00Z',
        LocationTower: 'Torre A',
        LocationFloor: 'Piso 2',
        LocationArea: 'Baño',
        Reference: 'REF-001',
        AssignedToPersonalId: 'Carlos López',
        PendienteReasignacion: false,
        Subtype: 'Servicios higiénicos inoperativos',
        Comment: [
          {
            Date: '2024-11-15T10:35:00Z',
            UserId: 'coord1',
            Role: 'COORDINATOR',
            Message: 'Se ha asignado al área de mantenimiento',
          },
        ],
      })
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleCancelIncident = async () => {
    if (confirm('¿Estás seguro de que deseas cancelar este incidente?')) {
      // Aquí iría la llamada a la API para cancelar
      alert('Incidente cancelado exitosamente')
      router.push('/my-reports')
    }
  }

  const getTimelineEvents = () => {
    if (!incident) return []
    
    const events: Array<{ date: string; title: string; description: string; icon: any }> = []
    
    // Evento de creación
    events.push({
      date: incident.CreatedAt,
      title: 'Incidente creado',
      description: `Creado por ${incident.CreatedByName}`,
      icon: AlertTriangle,
    })

    // Evento de inicio de atención
    if (incident.ExecutingAt) {
      events.push({
        date: incident.ExecutingAt,
        title: 'En atención',
        description: 'El incidente está siendo atendido',
        icon: Clock,
      })
    }

    // Evento de resolución
    if (incident.ResolvedAt) {
      events.push({
        date: incident.ResolvedAt,
        title: 'Resuelto',
        description: 'El incidente ha sido resuelto',
        icon: CheckCircle,
      })
    }

    // Comentarios
    incident.Comment.forEach((comment) => {
      events.push({
        date: comment.Date,
        title: `Comentario de ${comment.Role}`,
        description: comment.Message,
        icon: MessageSquare,
      })
    })

    // Ordenar por fecha
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Incidente no encontrado</p>
            <Link href="/my-reports" className="btn-primary mt-4 inline-block">
              Volver a Mis Reportes
            </Link>
          </div>
        </div>
      </div>
    )
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
    
    // Si no hay subtipo, intentar buscar por título
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
    
    const area = incident.ResponsibleArea?.[0] || ''
    if (areaImageMap[area]) {
      return areaImageMap[area]
    }
    
    return '/infraestructura.jpg'
  }

  const getIncidentImage = (incident: Incident): string => {
    // Si tiene imágenes subidas por el alumno, usar la primera
    if (incident.Images && incident.Images.length > 0) {
      return incident.Images[0]
    }
    
    // Si no, usar imagen predeterminada según el subtipo
    return getDefaultImage(incident)
  }

  const getRoleLabel = (role: string) => {
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

  const timelineEvents = getTimelineEvents()
  const canEdit = incident.Status === 'PENDIENTE'

  return (
    <div className="min-h-screen bg-utec-gray">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/my-reports"
          className="flex items-center text-utec-secondary hover:text-utec-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Mis Reportes
        </Link>

        {/* Header con imagen */}
        <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg">
          <div className="w-full h-64 md:h-80 relative">
            <img
              src={getIncidentImage(incident)}
              alt={incident.Title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{incident.Title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    incident.Status === 'PENDIENTE'
                      ? 'bg-red-500 text-white'
                      : incident.Status === 'EN_ATENCION'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {incident.Status === 'EN_ATENCION' && <Wrench className="h-4 w-4 mr-1.5" />}
                  {incident.Status === 'PENDIENTE'
                    ? 'Pendiente'
                    : incident.Status === 'EN_ATENCION'
                    ? 'En Atención'
                    : 'Resuelto'}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    incident.Priority === 'CRÍTICO' || incident.Priority === 'ALTA'
                      ? 'bg-red-500 text-white'
                      : incident.Priority === 'MEDIA'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {incident.Priority}
                </span>
              </div>
            </div>
            {canEdit && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  href={`/incidents/${incident.UUID}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Link>
                <button
                  onClick={handleCancelIncident}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dos columnas: Izquierda (Detalles) y Derecha (Estado y Timeline) */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna Izquierda - Detalles del Incidente */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-utec-light/20 flex items-center justify-center mr-3">
                  <Info className="h-5 w-5 text-utec-secondary" />
                </div>
                Descripción
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{incident.Description}</p>
            </div>

            {/* Ubicación */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-utec-light/20 flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-utec-secondary" />
                </div>
                Ubicación
              </h2>
              <p className="text-gray-700 text-lg">
                {incident.LocationTower} • {incident.LocationFloor} - {incident.LocationArea}
              </p>
              {incident.Reference && (
                <p className="text-sm text-gray-500 mt-2">
                  Ref: {incident.Reference}
                </p>
              )}
            </div>

            {/* Información */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-utec-light/20 flex items-center justify-center mr-3">
                  <Info className="h-5 w-5 text-utec-secondary" />
                </div>
                Información
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Reportado por:</span> {incident.CreatedByName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Tipo:</span> {incident.Type}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Área:</span> {incident.ResponsibleArea.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Estado y Timeline */}
          <div className="lg:col-span-1 space-y-6">
            {/* Creado */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                Creado
              </h2>
              <p className="text-sm text-gray-700">
                {format(new Date(incident.CreatedAt), "dd/MM/yyyy 'a las' HH:mm")}
              </p>
            </div>

            {/* Asignado a - Solo visible para coordinadores y autoridades */}
            {incident.AssignedToPersonalId && (user?.Role === 'COORDINATOR' || user?.Role === 'AUTHORITY') && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 rounded bg-utec-secondary flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Asignado a
                </h2>
                <p className="text-sm text-gray-700">
                  {incident.AssignedToPersonalId}
                </p>
              </div>
            )}

            {/* Línea de Tiempo */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Línea de Tiempo</h2>
              <div className="relative max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#888 #f1f1f1' }}>
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6 pb-4">
                  {timelineEvents.map((event, index) => {
                    const Icon = event.icon
                    // Determinar el usuario y rol del evento
                    let userName = ''
                    let userRole = ''
                    
                    if (event.title === 'Incidente creado') {
                      userName = incident.CreatedByName
                      userRole = 'COMMUNITY'
                    } else if (event.title.includes('Comentario')) {
                      const comment = incident.Comment.find(c => c.Date === event.date)
                      if (comment) {
                        userName = comment.UserId
                        userRole = comment.Role
                      }
                    }
                    
                    return (
                      <div key={index} className="relative flex items-start">
                        <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-utec-secondary rounded-full text-white shadow-md">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="ml-6 flex-1">
                          <p className="text-xs text-gray-500 mb-1">
                            {format(new Date(event.date), "dd/MM/yyyy 'a las' HH:mm")}
                          </p>
                          {userName && (
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">{userName}</p>
                              {userRole && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                  {getRoleLabel(userRole)}
                                </span>
                              )}
                            </div>
                          )}
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">{event.title}</h3>
                          <p className="text-xs text-gray-600">{event.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
