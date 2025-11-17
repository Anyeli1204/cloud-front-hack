'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Clock, MapPin, User, Calendar, ArrowLeft, Edit, X, CheckCircle, MessageSquare, Info, Wrench } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Incident, Comment } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { useIncidents } from '@/hooks/useIncidents'
import { formatPeruTime, formatWaitingTime, calculateWaitingMinutes } from '@/lib/dateUtils'
import { editIncidentContent } from '@/lib/websocket-events'
import { wsClient } from '@/lib/websocket'

// Funciones de mapeo del backend al frontend
function mapBackendStatusToFrontend(status: string): 'Pendiente' | 'EnAtencion' | 'Resuelto' {
  const statusMap: Record<string, 'Pendiente' | 'EnAtencion' | 'Resuelto'> = {
    'active': 'EnAtencion',
    'pending': 'Pendiente',
    'Pendiente': 'Pendiente',
    'PENDIENTE': 'Pendiente',
    'en_atencion': 'EnAtencion',
    'EnAtencion': 'EnAtencion',
    'EN_ATENCION': 'EnAtencion',
    'resolved': 'Resuelto',
    'Resuelto': 'Resuelto',
    'RESUELTO': 'Resuelto',
  }
  return statusMap[status] || 'Pendiente'
}

function mapBackendPriorityToFrontend(priority: string): 'BAJO' | 'MEDIA' | 'ALTA' | 'CRÍTICO' {
  const priorityMap: Record<string, 'BAJO' | 'MEDIA' | 'ALTA' | 'CRÍTICO'> = {
    'baja': 'BAJO',
    'low': 'BAJO',
    'BAJO': 'BAJO',
    'BAJA': 'BAJO',
    'media': 'MEDIA',
    'medium': 'MEDIA',
    'MEDIA': 'MEDIA',
    'alta': 'ALTA',
    'high': 'ALTA',
    'ALTA': 'ALTA',
    'critico': 'CRÍTICO',
    'critical': 'CRÍTICO',
    'CRÍTICO': 'CRÍTICO',
    'crítico': 'CRÍTICO',
  }
  return priorityMap[priority?.toLowerCase() || ''] || 'MEDIA'
}

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { incidents: allIncidents } = useIncidents()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchIncidentDetails = async () => {
      // Declarar existingIncident fuera del try-catch para que esté disponible en el catch
      let existingIncident: Incident | undefined
      
      try {
        setLoading(true)
        
        if (!user) {
          console.error('Usuario no autenticado')
          setLoading(false)
          return
        }

        const incidentId = params.id as string
        
        // Decodificar el UUID que viene encodado desde la URL
        const uuid = decodeURIComponent(incidentId)
        
        console.log('🔍 UUID recibido y decodificado:', {
          incidentIdOriginal: incidentId,
          uuidDecodificado: uuid,
          longitud: uuid.length,
          incluyeHash: uuid.includes('#')
        })
        
        // Intentar obtener el tenant_id del incidente existente en la lista
        existingIncident = allIncidents.find(inc => inc.UUID === uuid)
        let tenantId = existingIncident?.Type || 'Limpieza' // El Type contiene el tenant_id original
        
        console.log('🔍 Búsqueda en lista local:', {
          uuid,
          tenantId,
          existingIncident: !!existingIncident,
          totalIncidents: allIncidents.length,
          primerosUUIDs: allIncidents.slice(0, 3).map(inc => ({ uuid: inc.UUID, type: inc.Type }))
        })
        
        // Si no encontramos el incidente en la lista, intentamos diferentes estrategias
        if (!existingIncident) {
          console.warn('⚠️ Incidente no encontrado en la lista local, usando tenant_id por defecto')
          // Podrías implementar lógica adicional aquí, como extraer del UUID si tiene un patrón
        }
        
        const incidentDetailUrl = process.env.NEXT_PUBLIC_LAMBDA_INCIDENT_ESPECIFIC_URL
        
        if (!incidentDetailUrl) {
          console.error('❌ Variable de entorno NEXT_PUBLIC_LAMBDA_INCIDENT_ESPECIFIC_URL no configurada')
          throw new Error('Configuración de endpoint no encontrada')
        }
        
        // Construir URL con query parameters según el Lambda
        const url = `${incidentDetailUrl}?tenant_id=${encodeURIComponent(tenantId)}&uuid=${encodeURIComponent(uuid)}`
        
        console.log('📡 Llamando endpoint:', {
          url,
          tenantId,
          uuid,
          token: localStorage.getItem('auth_token') ? 'presente' : 'ausente'
        })
        
        // Llamar al endpoint para obtener el incidente específico
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        })

        console.log('📊 Respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers)
        })

        if (!response.ok) {
          let errorText = 'Error desconocido'
          try {
            errorText = await response.text()
            console.error('❌ Respuesta de error:', errorText)
          } catch (e) {
            console.error('❌ No se pudo leer la respuesta de error:', e)
          }
          
          // Si es un 404, mostrar mensaje más específico
          if (response.status === 404) {
            throw new Error('Incidente no encontrado')
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('No tienes permisos para ver este incidente')
          } else {
            throw new Error(`Error del servidor (${response.status}): ${errorText}`)
          }
        }

        const backendIncident = await response.json()
        console.log('✅ Datos recibidos:', backendIncident)
        
        // Debug del mapeo de estados
        console.log('📊 Debug del mapeo de estados:', {
          statusOriginalBackend: backendIncident.Status,
          tipoDelStatus: typeof backendIncident.Status,
          statusMapeado: mapBackendStatusToFrontend(backendIncident.Status),
          todosLosCamposDelBackend: Object.keys(backendIncident)
        })
        
        // Mapear datos del backend al formato frontend
        const mappedIncident: Incident = {
          Type: backendIncident.tenant_id || '',
          UUID: backendIncident.uuid || incidentId,
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

        setIncident(mappedIncident)
        // Inicializar campos de edición
        setEditTitle(mappedIncident.Title)
        setEditDescription(mappedIncident.Description)
      } catch (error) {
        console.error('Error al cargar detalles del incidente:', error)
        
        // Fallback: usar datos del incidente local si está disponible
        if (existingIncident) {
          console.log('🔄 Usando datos del incidente local como fallback')
          setIncident(existingIncident)
          setEditTitle(existingIncident.Title)
          setEditDescription(existingIncident.Description)
        } else {
          setIncident(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchIncidentDetails()
  }, [params.id, user, allIncidents])

  // Verificar si el usuario puede editar este incidente
  const canEdit = incident && user && 
    user.Role === 'COMMUNITY' && 
    incident.CreatedById === user.UUID && 
    incident.Status === 'Pendiente'

  // Debug: Log detallado para verificar permisos de edición
  console.log('🔐 Verificación DETALLADA de permisos de edición:', {
    // Condiciones individuales
    '1_hasIncident': !!incident,
    '2_hasUser': !!user,
    '3_userRole': user?.Role,
    '3_isRoleCommunity': user?.Role === 'COMMUNITY',
    '4_incidentCreatedBy': incident?.CreatedById,
    '4_userUUID': user?.UUID,
    '4_isCreatedByUser': incident?.CreatedById === user?.UUID,
    '5_incidentStatus': incident?.Status,
    '5_isStatusPendiente': incident?.Status === 'Pendiente',
    // Resultado final
    'RESULTADO_canEdit': canEdit,
    // Razón de fallo si no puede editar
    'RAZON_FALLO': !canEdit ? (
      !incident ? 'No hay incidente' :
      !user ? 'No hay usuario' :
      user.Role !== 'COMMUNITY' ? `Rol incorrecto: ${user.Role}` :
      incident.CreatedById !== user.UUID ? `No es creador: ${incident.CreatedById} vs ${user.UUID}` :
      incident.Status !== 'Pendiente' ? `Estado incorrecto: ${incident.Status} (esperado: Pendiente)` :
      'Razón desconocida'
    ) : 'Puede editar ✅'
  })

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditTitle(incident?.Title || '')
    setEditDescription(incident?.Description || '')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(incident?.Title || '')
    setEditDescription(incident?.Description || '')
  }

  const handleSaveEdit = async () => {
    if (!incident || !user) return

    if (!editTitle.trim() || !editDescription.trim()) {
      alert('El título y la descripción son obligatorios')
      return
    }

    try {
      setIsSubmitting(true)
      
      await editIncidentContent({
        tenant_id: incident.Type,
        uuid: incident.UUID,
        actionToDo: 'Editar',
        CreatedById: user.UUID,
        new_title: editTitle.trim(),
        new_description: editDescription.trim()
      })

      // Actualizar el incidente local
      setIncident(prev => prev ? {
        ...prev,
        Title: editTitle.trim(),
        Description: editDescription.trim()
      } : null)
      
      setIsEditing(false)
      alert('Incidente editado exitosamente')
    } catch (error) {
      console.error('Error al editar incidente:', error)
      alert('Error al editar el incidente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelIncident = async () => {
    if (!incident || !user) return

    if (!confirm('¿Estás seguro de que deseas ELIMINAR este incidente?\n\n⚠️ Esta acción no se puede deshacer y el incidente será borrado permanentemente.')) {
      return
    }

    try {
      setIsSubmitting(true)
      
      // Por ahora usamos la función de autoridad para cerrar/eliminar
      // TODO: Implementar función específica para eliminar por usuario COMMUNITY
      const message = {
        action: 'AuthorityManageIncidents',
        tenant_id: incident.Type,
        uuid: incident.UUID,
        actionToDo: 'Eliminar'
      }
      
      // Enviar directamente via WebSocket
      if (typeof window !== 'undefined') {
        wsClient.send(message)
      }

      alert('Incidente eliminado exitosamente')
      router.push('/my-reports')
    } catch (error) {
      console.error('Error al eliminar incidente:', error)
      alert('Error al eliminar el incidente')
      setIsSubmitting(false)
    }
  }

  const getTimelineEvents = () => {
    if (!incident) return []
    
    const events: Array<{ 
      date: string; 
      dateFormatted: string;
      title: string; 
      description: string; 
      icon: any 
    }> = []
    
    // Evento de creación
    events.push({
      date: incident.CreatedAt,
      dateFormatted: formatPeruTime(incident.CreatedAt, { includeTime: true, includeSeconds: true }),
      title: 'Incidente creado',
      description: `Creado por ${incident.CreatedByName}`,
      icon: AlertTriangle,
    })

    // Evento de inicio de atención
    if (incident.ExecutingAt) {
      events.push({
        date: incident.ExecutingAt,
        dateFormatted: formatPeruTime(incident.ExecutingAt, { includeTime: true, includeSeconds: true }),
        title: 'En atención',
        description: 'El incidente está siendo atendido',
        icon: Clock,
      })
    }

    // Evento de resolución
    if (incident.ResolvedAt) {
      events.push({
        date: incident.ResolvedAt,
        dateFormatted: formatPeruTime(incident.ResolvedAt, { includeTime: true, includeSeconds: true }),
        title: 'Resuelto',
        description: 'El incidente ha sido resuelto',
        icon: CheckCircle,
      })
    }

    // Comentarios
    incident.Comment.forEach((comment) => {
      events.push({
        date: comment.Date,
        dateFormatted: formatPeruTime(comment.Date, { includeTime: true, includeSeconds: true }),
        title: `Comentario de ${getRoleLabel(comment.Role)}`,
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {isEditing ? (
                  <span className="inline-flex items-center">
                    <Edit className="h-8 w-8 mr-3 text-yellow-300" />
                    {editTitle || incident.Title}
                  </span>
                ) : (
                  incident.Title
                )}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    incident.Status === 'Pendiente'
                      ? 'bg-red-500 text-white'
                      : incident.Status === 'EnAtencion'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {incident.Status === 'EnAtencion' && <Wrench className="h-4 w-4 mr-1.5" />}
                  {incident.Status === 'Pendiente'
                    ? 'Pendiente'
                    : incident.Status === 'EnAtencion'
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
            {(canEdit || process.env.NODE_ENV === 'development') && !isEditing && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={canEdit ? handleStartEdit : () => alert('No tienes permisos para editar este incidente')}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    canEdit 
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  title={canEdit ? 'Editar incidente' : 'Solo puedes editar tus propios incidentes en estado PENDIENTE'}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar {!canEdit && '(Bloqueado)'}</span>
                </button>
                <button
                  onClick={canEdit ? handleCancelIncident : () => alert('No tienes permisos para eliminar este incidente')}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    canEdit 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  title={canEdit ? 'Eliminar incidente' : 'Solo puedes eliminar tus propios incidentes en estado PENDIENTE'}
                >
                  <X className="h-4 w-4" />
                  <span>Eliminar {!canEdit && '(Bloqueado)'}</span>
                </button>
              </div>
            )}
            
            {/* Debug: Botones forzados para testing - remover en producción */}
            {process.env.NODE_ENV === 'development' && !canEdit && (
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-3 py-1 bg-gray-700 text-white text-xs rounded">
                  Botones ocultos (canEdit: {canEdit ? 'true' : 'false'})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Debug info - remover en producción */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
            <strong>🔧 Debug Info:</strong>
            <br />• Usuario rol: {user?.Role || 'No definido'}
            <br />• Usuario UUID: {user?.UUID || 'No definido'}
            <br />• Incidente creado por: {incident?.CreatedById || 'No definido'}
            <br />• Estado incidente: {incident?.Status || 'No definido'}
            <br />• Puede editar: {canEdit ? '✅ SÍ' : '❌ NO'}
          </div>
        )}

        {/* Formulario de edición inline */}
        {isEditing && (canEdit || process.env.NODE_ENV === 'development') && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Edit className="h-5 w-5 text-yellow-600 mr-2" />
              Editando Incidente
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Título del incidente"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Descripción detallada del incidente"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting || !editTitle.trim() || !editDescription.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
                {isEditing && (
                  <span className="ml-2 text-sm text-yellow-600 font-normal">(editando...)</span>
                )}
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {isEditing ? editDescription : incident.Description}
              </p>
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
                {formatPeruTime(incident.CreatedAt, { includeTime: true })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tiempo de espera: {formatWaitingTime(calculateWaitingMinutes(incident.CreatedAt))}
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
                            {event.dateFormatted}
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
