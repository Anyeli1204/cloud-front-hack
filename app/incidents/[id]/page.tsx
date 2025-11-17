'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ConfirmModal from '@/components/ConfirmModal'
import { AlertTriangle, Clock, MapPin, User, Calendar, ArrowLeft, Edit, X, CheckCircle, MessageSquare, Info, Wrench } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Incident, Comment } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { useIncidents } from '@/hooks/useIncidents'
import { formatPeruTime, formatWaitingTime, calculateWaitingMinutes } from '@/lib/dateUtils'
import { editIncidentContent, authorityManageIncidents, coordinatorAssignIncident } from '@/lib/websocket-events'
import { wsClient } from '@/lib/websocket'
import { authenticatedFetch } from '@/lib/auth'
import { User as UserType } from '@/types'

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
  // Cargar incidentes sin filtros - el backend ya filtra por rol automáticamente
  // Solo los necesitamos como fallback si el endpoint de detalles falla
  const { incidents: allIncidents } = useIncidents()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const incidentRef = useRef<Incident | null>(null)
  
  // Mantener la referencia del incidente actualizada
  useEffect(() => {
    incidentRef.current = incident
  }, [incident])
  
  // Verificar estado de conexión WebSocket periódicamente
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = wsClient.isConnected()
      if (isConnected !== wsConnected) {
        console.log('🔄 [WebSocket] Estado de conexión cambió:', isConnected)
        setWsConnected(isConnected)
      }
    }
    
    // Verificar inmediatamente
    checkConnection()
    
    // Verificar cada 500ms hasta que esté conectado (más rápido)
    const interval = setInterval(() => {
      checkConnection()
      if (wsClient.isConnected()) {
        clearInterval(interval)
      }
    }, 500)
    
    return () => clearInterval(interval)
  }, [wsConnected])
  
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para modales de confirmación
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Estados para asignación de personal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [personalList, setPersonalList] = useState<UserType[]>([])
  const [selectedPersonalId, setSelectedPersonalId] = useState<string>('')
  const [loadingPersonal, setLoadingPersonal] = useState(false)
  
  // Estados para comentarios
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchIncidentDetails = async () => {
      // Declarar variables fuera del try-catch para que estén disponibles en el catch
      let existingIncident: Incident | undefined
      const incidentId = params.id as string
      
      try {
        setLoading(true)
        
        if (!user) {
          console.error('Usuario no autenticado')
          setLoading(false)
          return
        }
        
        // Extraer el UUID de la URL (decodificar si viene encodado)
        const uuid = decodeURIComponent(incidentId)
        console.log('🔍 [fetchIncidentDetails] UUID extraído de la URL:', uuid)
        
        // Buscar el incidente en la lista local para obtener el tenant_id
        existingIncident = allIncidents.find(inc => inc.UUID === uuid) ||
                          allIncidents.find(inc => inc.UUID === incidentId) ||
                          allIncidents.find(inc => inc.UUID.includes(uuid) || uuid.includes(inc.UUID))
        
        // Obtener tenant_id del incidente encontrado o usar el área del usuario como fallback
        const tenantId = existingIncident?.Type || user.Area || 'Limpieza'
        console.log('🔍 [fetchIncidentDetails] tenant_id:', tenantId, existingIncident ? '(del incidente encontrado)' : '(fallback)')
        
        const incidentDetailUrl = process.env.NEXT_PUBLIC_LAMBDA_INCIDENT_ESPECIFIC_URL
        
        if (!incidentDetailUrl) {
          console.error('❌ Variable de entorno NEXT_PUBLIC_LAMBDA_INCIDENT_ESPECIFIC_URL no configurada')
          // Si no hay URL configurada pero tenemos el incidente local, usarlo
          if (existingIncident) {
            setIncident(existingIncident)
            setEditTitle(existingIncident.Title)
            setEditDescription(existingIncident.Description)
            setLoading(false)
            return
          }
          throw new Error('Configuración de endpoint no encontrada')
        }
        
        // Construir URL con query parameters según el Lambda
        const url = `${incidentDetailUrl}?tenant_id=${encodeURIComponent(tenantId)}&uuid=${encodeURIComponent(uuid)}`
        console.log('🔍 [fetchIncidentDetails] Llamando al endpoint:', url)
        
        // Llamar al endpoint para obtener el incidente específico
        const response = await authenticatedFetch(url, {
          method: 'GET',
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
          Comment: Array.isArray(backendIncident.Comment) 
            ? backendIncident.Comment.map((c: any) => ({
                Date: c.Date,
                UserId: c.UserId,
                Role: c.Role,
                Message: c.Message || c.Comment || '' // El backend puede usar 'Comment' o 'Message'
              }))
            : [],
          Subtype: backendIncident.Subtype || backendIncident.subType?.toString() || undefined,
        }

        setIncident(mappedIncident)
        // Inicializar campos de edición
        setEditTitle(mappedIncident.Title)
        setEditDescription(mappedIncident.Description)
      } catch (error) {
        // Fallback: usar datos del incidente local si está disponible
        if (existingIncident) {
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

  // Suscribirse a eventos WebSocket para actualizar el incidente en tiempo real
  useEffect(() => {
    if (!wsClient.isConnected() || !incident) {
      return
    }

    const handleAuthorityManageIncidents = (data: any) => {
      const incidentData = data.incident || data.data || data
      const uuid = incidentData.uuid || incidentData.UUID || data.uuid
      
      // Solo actualizar si es el mismo incidente
      if (uuid === incident.UUID) {
        if (data.actionToDo === 'ClosedIncident') {
          // Mapear el incidente actualizado del backend
          const mappedIncident: Incident = {
            ...incident,
            Status: 'Resuelto',
            ResolvedAt: incidentData.ResolvedAt || new Date().toISOString()
          }
          setIncident(mappedIncident)
          setIsSubmitting(false)
        } else if (data.actionToDo === 'ReassignmentPending') {
          // Mapear el incidente actualizado del backend
          const mappedIncident: Incident = {
            ...incident,
            PendienteReasignacion: true
          }
          setIncident(mappedIncident)
          setIsSubmitting(false)
        }
      }
    }

    wsClient.on('AuthorityManageIncidents', handleAuthorityManageIncidents)

    return () => {
      wsClient.off('AuthorityManageIncidents', handleAuthorityManageIncidents)
    }
  }, [incident, wsClient])

  // Cerrar automáticamente el modal de éxito después de 3 segundos
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessAlert])

  // Obtener lista de personal cuando el usuario es coordinador
  useEffect(() => {
    const fetchPersonalList = async () => {
      if (user?.Role !== 'COORDINATOR' || !user?.Area) return

      try {
        setLoadingPersonal(true)
        const personalUrl = 'https://687qtzms2l.execute-api.us-east-1.amazonaws.com/personal'
        
        // Construir URL con query parameters: role=PERSONAL y area del coordinador
        const areaParam = encodeURIComponent(user.Area)
        const url = `${personalUrl}?role=PERSONAL&area=${areaParam}`
        
        console.log('🔍 [fetchPersonalList] Obteniendo personal desde:', url)
        
        const response = await authenticatedFetch(url, {
          method: 'GET',
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ [fetchPersonalList] Error del servidor:', response.status, errorText)
          throw new Error(`Error al cargar lista de personal: ${response.status}`)
        }

        const data = await response.json()
        
        console.log('🔍 [fetchPersonalList] Respuesta completa del API:', data)
        console.log('🔍 [fetchPersonalList] Tipo de dato:', Array.isArray(data) ? 'Array' : typeof data)
        console.log('🔍 [fetchPersonalList] Área del coordinador:', user.Area)
        
        // El endpoint puede devolver un objeto único o un array
        let allUsers: any[] = []
        
        if (Array.isArray(data)) {
          allUsers = data
        } else if (data && typeof data === 'object') {
          // Si es un objeto, puede ser un solo usuario o un objeto con una propiedad que contiene el array
          if (data.users && Array.isArray(data.users)) {
            allUsers = data.users
          } else if (data.Items && Array.isArray(data.Items)) {
            allUsers = data.Items
          } else {
            // Es un solo usuario
            allUsers = [data]
          }
        }
        
        console.log('🔍 [fetchPersonalList] Total usuarios obtenidos:', allUsers.length)
        console.log('🔍 [fetchPersonalList] Todos los usuarios:', allUsers)
        
        // Filtrar solo por status ACTIVE (el área ya viene filtrada del backend)
        const personal = allUsers.filter((u: any) => {
          const matchesRole = u.Role === 'PERSONAL'
          const matchesStatus = u.Status === 'ACTIVE' || !u.Status // Si no tiene Status, asumir activo
          
          console.log(`🔍 Usuario ${u.FullName || u.UserId}: Role=${u.Role} (${matchesRole}), Area="${u.Area}", Status=${u.Status} (${matchesStatus})`)
          
          return matchesRole && matchesStatus
        })
        
        console.log('🔍 [fetchPersonalList] Personal filtrado:', personal.length, personal)
        
        setPersonalList(personal.map((u: any) => ({
          Role: u.Role,
          UUID: u.UUID,
          UserId: u.UserId,
          FullName: u.FullName,
          Email: u.Email,
          Area: u.Area,
          Status: u.Status || 'ACTIVE',
          CreatedAt: u.CreatedAt,
        })))
      } catch (error) {
        console.error('❌ Error al cargar lista de personal:', error)
        setSuccessMessage('Error al cargar la lista de personal')
        setShowSuccessAlert(true)
      } finally {
        setLoadingPersonal(false)
      }
    }

    fetchPersonalList()
  }, [user?.Role, user?.Area])

  // Listener para eventos de asignación de coordinador
  useEffect(() => {
    // Esperar a que tanto el WebSocket esté conectado como el incidente esté cargado
    const isConnected = wsClient.isConnected()
    
    if (!isConnected) {
      console.log('⚠️ [Listener] WebSocket no conectado aún, esperando conexión...', {
        wsConnected,
        isConnected
      })
      return
    }
    
    if (!incident) {
      console.log('⚠️ [Listener] No hay incidente cargado aún, esperando...')
      return
    }

    console.log('📡 [Listener] ✅ Condiciones cumplidas - Registrando listener para CoordinatorAssignIncident')
    console.log('📡 [Listener] Incident UUID:', incident.UUID)
    console.log('📡 [Listener] WebSocket conectado:', isConnected)
    console.log('📡 [Listener] Incident cargado:', !!incident)

    const handleCoordinatorAssignIncident = (data: any) => {
      console.log('📨 [WebSocket] Evento CoordinatorAssignIncident recibido:', data)
      
      // Usar la referencia para obtener el incidente actual sin depender del closure
      const currentIncident = incidentRef.current
      if (!currentIncident) {
        console.warn('⚠️ [WebSocket] No hay incidente actual, ignorando evento')
        return
      }
      
      // El backend envía: { action: 'CoordinatorAssignIncident', uuid: ..., actionToDo: 'assignedIncident', incident: {...}, user: {...} }
      const uuid = data.uuid || data.UUID
      const actionToDo = data.actionToDo
      
      console.log('📨 [WebSocket] UUID del evento:', uuid, 'UUID del incidente actual:', currentIncident.UUID)
      console.log('📨 [WebSocket] actionToDo:', actionToDo)
      
      // Comparar UUIDs de forma más flexible (puede venir con diferentes formatos)
      const normalizedEventUuid = uuid?.toString().trim()
      const normalizedIncidentUuid = currentIncident.UUID?.toString().trim()
      const uuidMatches = normalizedEventUuid === normalizedIncidentUuid || 
                          uuid === currentIncident.UUID ||
                          currentIncident.UUID?.includes(uuid) ||
                          uuid?.includes(currentIncident.UUID)
      
      if (!uuidMatches) {
        console.warn('⚠️ [WebSocket] UUID no coincide. Evento ignorado.')
        console.warn('⚠️ [WebSocket] Event UUID:', uuid, 'Current Incident UUID:', currentIncident.UUID)
        return
      }
      
      console.log('✅ [WebSocket] UUID coincide, procesando evento...')
      
      if (actionToDo === 'assignedIncident') {
        console.log('✅ [Assign] Evento de asignación recibido')
        console.log('✅ [Assign] data.incident (Attributes del backend):', data.incident)
        console.log('✅ [Assign] data.user:', data.user)
        
        // El backend envía response.get('Attributes') que contiene solo los campos actualizados
        // Según el código: AssignedToPersonalId, Status='EnAtencion', ExecutingAt
        const incidentAttributes = data.incident || {}
        
        const assignedToId = incidentAttributes.AssignedToPersonalId
        const newStatus = incidentAttributes.Status // 'EnAtencion' del backend
        const executingAt = incidentAttributes.ExecutingAt
        
        console.log('✅ [Assign] Datos extraídos:', {
          assignedToId,
          newStatus,
          executingAt
        })
        
        // Mapear el status del backend al frontend
        const mappedStatus = newStatus === 'EnAtencion' ? 'EnAtencion' : 
                            newStatus === 'Pendiente' ? 'Pendiente' :
                            newStatus === 'Resuelto' ? 'Resuelto' :
                            'EnAtencion'
        
        const mappedIncident: Incident = {
          ...currentIncident,
          AssignedToPersonalId: assignedToId,
          Status: mappedStatus,
          ExecutingAt: executingAt || new Date().toISOString()
        }
        
        console.log('✅ [Assign] Incidente actualizado:', mappedIncident)
        
        setIncident(mappedIncident)
        setShowAssignModal(false)
        setSelectedPersonalId('')
        setIsSubmitting(false) // Esto debe ir al final para limpiar el timeout
        setSuccessMessage('Incidente asignado exitosamente')
        setShowSuccessAlert(true)
        
        console.log('✅ [Assign] Estado actualizado correctamente - respuesta del servidor recibida')
      } else if (data.status === 'comment_added' || data.actionToDo === 'EscribirComentario') {
        console.log('💬 [Comment] Procesando comentario agregado...')
        console.log('💬 [Comment] data completo:', data)
        console.log('💬 [Comment] data.incident:', data.incident)
        console.log('💬 [Comment] Comentarios actuales del incidente:', currentIncident.Comment)
        
        // El backend envía response.get('Attributes') en data.incident que contiene Comment actualizado
        const incidentAttributes = data.incident || {}
        
        // El backend puede enviar los comentarios en incidentAttributes.Comment
        const backendComments = incidentAttributes.Comment || 
                                currentIncident.Comment || 
                                []
        
        console.log('💬 [Comment] Comentarios extraídos del backend:', backendComments)
        
        // Si hay comentarios nuevos en el backend, reemplazar todos
        let allComments: Comment[] = []
        if (Array.isArray(backendComments) && backendComments.length > 0) {
          allComments = backendComments.map((c: any) => ({
            Date: c.Date,
            UserId: c.UserId,
            Role: c.Role,
            Message: c.Message || c.Comment || '' // El backend guarda en 'Comment', frontend espera 'Message'
          }))
        } else {
          allComments = currentIncident.Comment
        }
        
        console.log('💬 [Comment] Todos los comentarios después del mapeo:', allComments)
        
        const mappedIncident: Incident = {
          ...currentIncident,
          Comment: allComments
        }
        
        console.log('💬 [Comment] Incidente actualizado:', mappedIncident)
        
        setIncident(mappedIncident)
        setIsSubmittingComment(false)
        setSuccessMessage('Comentario agregado exitosamente')
        setShowSuccessAlert(true)
        
        console.log('✅ [Comment] Estado actualizado exitosamente')
      } else {
        console.warn('⚠️ [WebSocket] Evento desconocido:', data)
      }
    }

    // Verificar si ya hay listeners registrados para evitar duplicados
    console.log('📡 [Listener] Registrando listener para CoordinatorAssignIncident')
    
    // Registrar listener para el evento específico
    wsClient.on('CoordinatorAssignIncident', handleCoordinatorAssignIncident)
    
    // También escuchar TODOS los mensajes genéricos para debugging
    // Este listener captura TODOS los mensajes que lleguen, incluso antes de que se procesen
    const handleGenericMessage = (data: any) => {
      console.log('📨 [Generic Message] ⚠️⚠️⚠️ MENSAJE GENÉRICO RECIBIDO ⚠️⚠️⚠️')
      console.log('📨 [Generic Message] Datos completos:', JSON.stringify(data, null, 2))
      console.log('📨 [Generic Message] Tipo:', typeof data)
      console.log('📨 [Generic Message] Action:', data.action || data.type || 'NO HAY')
      console.log('📨 [Generic Message] actionToDo:', data.actionToDo || 'NO HAY')
      console.log('📨 [Generic Message] UUID:', data.uuid || data.UUID || 'NO HAY')
      
      // Si es un evento CoordinatorAssignIncident, procesarlo
      if (data.action === 'CoordinatorAssignIncident' || data.type === 'CoordinatorAssignIncident') {
        console.log('📨 [Generic Message] ✅✅✅ ES CoordinatorAssignIncident - PROCESANDO...')
        handleCoordinatorAssignIncident(data)
      } else {
        console.log('📨 [Generic Message] ⚠️ No es CoordinatorAssignIncident')
        console.log('📨 [Generic Message] Action recibida:', data.action)
        console.log('📨 [Generic Message] Type recibido:', data.type)
      }
    }
    wsClient.on('message', handleGenericMessage)
    
    console.log('✅ [Listener] Listeners registrados correctamente')
    console.log('✅ [Listener] Esperando respuesta del servidor...')

    return () => {
      console.log('📡 [Listener] Desregistrando listeners')
      wsClient.off('CoordinatorAssignIncident', handleCoordinatorAssignIncident)
      wsClient.off('message', handleGenericMessage)
    }
  }, [incident?.UUID, incident, wsConnected]) // Depender también del estado de conexión WebSocket

  // Verificar si el usuario puede editar este incidente
  const canEdit = incident && user && 
    user.Role === 'COMMUNITY' && 
    incident.CreatedById === user.UUID && 
    incident.Status === 'Pendiente'

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
    setShowDeleteModal(true)
  }

  const confirmDeleteIncident = async () => {
    if (!incident || !user) return

    try {
      setIsSubmitting(true)
      setShowDeleteModal(false)
      
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

      setSuccessMessage('Incidente eliminado exitosamente')
      setShowSuccessAlert(true)
      setTimeout(() => {
        router.push('/my-reports')
      }, 1500)
    } catch (error) {
      console.error('Error al eliminar incidente:', error)
      setSuccessMessage('Error al eliminar el incidente')
      setShowSuccessAlert(true)
      setIsSubmitting(false)
    }
  }

  const handleCloseIncident = async () => {
    if (!incident || !user) return
    setShowCloseModal(true)
  }

  const confirmCloseIncident = async () => {
    if (!incident || !user) return

    try {
      setIsSubmitting(true)
      setShowCloseModal(false)
      
      authorityManageIncidents({
        tenant_id: incident.Type,
        uuid: incident.UUID,
        actionToDo: 'Cerrar'
      })

      setSuccessMessage('Incidente cerrado exitosamente')
      setShowSuccessAlert(true)
    } catch (error) {
      setSuccessMessage('Error al cerrar el incidente. Verifica tu conexión.')
      setShowSuccessAlert(true)
      setIsSubmitting(false)
    }
  }

  const handleReassignIncident = async () => {
    if (!incident || !user) return
    setShowReassignModal(true)
  }

  const confirmReassignIncident = async () => {
    if (!incident || !user) return

    try {
      setIsSubmitting(true)
      setShowReassignModal(false)
      
      authorityManageIncidents({
        tenant_id: incident.Type,
        uuid: incident.UUID,
        actionToDo: 'Reasignar'
      })

      setSuccessMessage('Incidente marcado como pendiente de reasignación')
      setShowSuccessAlert(true)
    } catch (error) {
      setSuccessMessage('Error al reasignar el incidente. Verifica tu conexión.')
      setShowSuccessAlert(true)
      setIsSubmitting(false)
    }
  }

  const handleAssignIncident = () => {
    if (!incident || !user) return
    setSelectedPersonalId('')
    setShowAssignModal(true)
  }

  const confirmAssignIncident = async () => {
    if (!incident || !user || !selectedPersonalId) return

    try {
      setIsSubmitting(true)
      
      console.log('👤 [Assign] Iniciando asignación...')
      console.log('👤 [Assign] Incidente:', { Type: incident.Type, UUID: incident.UUID })
      console.log('👤 [Assign] Personal seleccionado:', selectedPersonalId)
      console.log('👤 [Assign] WebSocket conectado:', wsClient.isConnected())
      
      coordinatorAssignIncident({
        tenant_id: incident.Type,
        uuid: incident.UUID,
        actionToDo: 'Asignar',
        AssignedToPersonalId: selectedPersonalId
      })

      console.log('👤 [Assign] Mensaje enviado, esperando respuesta del servidor...')
      
      // Timeout de seguridad: si no llega respuesta en 10 segundos, mostrar advertencia
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ [Assign] No se recibió respuesta del servidor después de 10 segundos')
        setSuccessMessage('El servidor no respondió. Verifica tu conexión o intenta nuevamente.')
        setShowSuccessAlert(true)
        setIsSubmitting(false)
      }, 10000)
      
      // Limpiar timeout si el componente se desmonta o si llega la respuesta
      // (el timeout se limpiará cuando setIsSubmitting(false) se ejecute en el listener)
      
      // El estado se actualizará automáticamente cuando llegue el evento WebSocket
    } catch (error) {
      console.error('❌ [Assign] Error al asignar:', error)
      setSuccessMessage('Error al asignar el incidente. Verifica tu conexión.')
      setShowSuccessAlert(true)
      setIsSubmitting(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!incident || !user || !newComment.trim()) return

    try {
      setIsSubmittingComment(true)
      
      coordinatorAssignIncident({
        tenant_id: incident.Type,
        uuid: incident.UUID,
        actionToDo: 'EscribirComentario',
        new_comment: newComment.trim()
      })

      // Limpiar el campo de comentario
      setNewComment('')
      
      // El estado se actualizará automáticamente cuando llegue el evento WebSocket
      setSuccessMessage('Comentario agregado exitosamente')
      setShowSuccessAlert(true)
    } catch (error) {
      setSuccessMessage('Error al agregar el comentario. Verifica tu conexión.')
      setShowSuccessAlert(true)
    } finally {
      setIsSubmittingComment(false)
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
            <Link 
              href={
                user?.Role === 'COORDINATOR' 
                  ? '/dashboard/coordinator'
                  : user?.Role === 'PERSONAL'
                  ? '/dashboard/personal'
                  : user?.Role === 'AUTHORITY'
                  ? '/dashboard/authority'
                  : '/my-reports'
              } 
              className="btn-primary mt-4 inline-block"
            >
              {user?.Role === 'COORDINATOR' 
                ? 'Volver al Dashboard'
                : user?.Role === 'PERSONAL'
                ? 'Volver al Dashboard'
                : user?.Role === 'AUTHORITY'
                ? 'Volver al Dashboard'
                : 'Volver a Mis Reportes'}
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
          href={
            user?.Role === 'COORDINATOR' 
              ? '/dashboard/coordinator'
              : user?.Role === 'PERSONAL'
              ? '/dashboard/personal'
              : user?.Role === 'AUTHORITY'
              ? '/dashboard/authority'
              : '/my-reports'
          }
          className="flex items-center text-utec-secondary hover:text-utec-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {user?.Role === 'COORDINATOR' 
            ? 'Volver al Dashboard'
            : user?.Role === 'PERSONAL'
            ? 'Volver al Dashboard'
            : user?.Role === 'AUTHORITY'
            ? 'Volver al Dashboard'
            : 'Volver a Mis Reportes'}
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
                  title={canEdit ? 'Editar incidente' : 'Solo puedes editar tus propios incidentes en estado Pendiente'}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar {!canEdit && '(Bloqueado)'}</span>
                </button>
                <button
                  onClick={canEdit ? handleCancelIncident : () => {
                    setSuccessMessage('No tienes permisos para eliminar este incidente')
                    setShowSuccessAlert(true)
                  }}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    canEdit 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  title={canEdit ? 'Eliminar incidente' : 'Solo puedes eliminar tus propios incidentes en estado Pendiente'}
                >
                  <X className="h-4 w-4" />
                  <span>Eliminar {!canEdit && '(Bloqueado)'}</span>
                </button>
              </div>
            )}
            
          </div>
        </div>

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

            {/* Comentarios - Solo para COORDINATOR */}
            {user?.Role === 'COORDINATOR' && !isEditing && (
              <div className="card border-2 border-blue-200 bg-blue-50/30">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                  Agregar Comentario
                </h2>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario sobre este incidente..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isSubmittingComment}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors shadow-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmittingComment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5" />
                        <span>Enviar Comentario</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
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
                  {personalList.find(p => p.UUID === incident.AssignedToPersonalId)?.FullName || incident.AssignedToPersonalId}
                </p>
              </div>
            )}

            {/* Asignar Personal - Solo para COORDINATOR */}
            {user?.Role === 'COORDINATOR' && !isEditing && incident.Status === 'Pendiente' && (
              <div className="card border-2 border-blue-200 bg-blue-50/30">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Asignar Personal
                </h2>
                <div className="space-y-3">
                  {incident.AssignedToPersonalId ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        Ya asignado a: {personalList.find(p => p.UUID === incident.AssignedToPersonalId)?.FullName || incident.AssignedToPersonalId}
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleAssignIncident}
                        disabled={isSubmitting || loadingPersonal || personalList.length === 0}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors shadow-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        title="Asignar personal para atender este incidente"
                      >
                        <User className="h-5 w-5" />
                        <span>
                          {loadingPersonal 
                            ? 'Cargando personal...' 
                            : personalList.length === 0 
                            ? 'No hay personal disponible' 
                            : 'Asignar Personal'}
                        </span>
                      </button>
                      {personalList.length === 0 && !loadingPersonal && (
                        <p className="text-xs text-gray-600 text-center">
                          No hay personal disponible en tu área
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Acciones de Gestión - Para AUTHORITY y COORDINATOR */}
            {(user?.Role === 'AUTHORITY' || user?.Role === 'COORDINATOR') && !isEditing && incident.Status !== 'Resuelto' && (
              <div className="card border-2 border-orange-200 bg-orange-50/30">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center mr-3">
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                  Acciones de Gestión
                </h2>
                <div className="space-y-3">
                  {user?.Role === 'AUTHORITY' && (
                    <button
                      onClick={handleReassignIncident}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors shadow-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      title="Marcar como pendiente de reasignación"
                    >
                      <Wrench className="h-5 w-5" />
                      <span>Marcar para Reasignación</span>
                    </button>
                  )}
                  <button
                    onClick={handleCloseIncident}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors shadow-md bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    title="Cerrar incidente (marcar como resuelto)"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Cerrar Incidente</span>
                  </button>
                  <p className="text-xs text-gray-600 mt-2">
                    {user?.Role === 'COORDINATOR' 
                      ? 'Cierra incidentes duplicados o que ya no se apliquen'
                      : 'Gestiona el estado del incidente'}
                  </p>
                </div>
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

      {/* Modal de Asignación de Personal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmitting) {
            setShowAssignModal(false)
            setSelectedPersonalId('')
          }
        }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Asignar Personal</h3>
              </div>
              {!isSubmitting && (
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedPersonalId('')
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Selecciona el personal que atenderá este incidente:
              </p>
              {loadingPersonal ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : personalList.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No hay personal disponible en tu área
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {personalList.map((person) => (
                    <button
                      key={person.UUID}
                      onClick={() => setSelectedPersonalId(person.UUID)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedPersonalId === person.UUID
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{person.FullName}</p>
                          <p className="text-xs text-gray-500">{person.UserId}</p>
                        </div>
                        {selectedPersonalId === person.UUID && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              {!isSubmitting && (
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedPersonalId('')
                  }}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={confirmAssignIncident}
                disabled={isSubmitting || !selectedPersonalId || personalList.length === 0}
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Asignando...</span>
                  </>
                ) : (
                  <span>Asignar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales de Confirmación */}
      <ConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={confirmCloseIncident}
        title="Cerrar Incidente"
        message="¿Estás seguro de que deseas CERRAR este incidente? El incidente será marcado como resuelto y no podrá ser reabierto."
        confirmText="Cerrar Incidente"
        cancelText="Cancelar"
        type="warning"
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onConfirm={confirmReassignIncident}
        title="Marcar para Reasignación"
        message="¿Estás seguro de que deseas marcar este incidente como PENDIENTE DE REASIGNACIÓN?\n\nEl coordinador deberá reasignarlo a otro personal."
        confirmText="Marcar para Reasignación"
        cancelText="Cancelar"
        type="info"
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteIncident}
        title="Eliminar Incidente"
        message="¿Estás seguro de que deseas ELIMINAR este incidente?\n\n⚠️ Esta acción no se puede deshacer y el incidente será borrado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isSubmitting}
      />

      {/* Alerta de éxito/error */}
      {showSuccessAlert && (
        <ConfirmModal
          isOpen={showSuccessAlert}
          onClose={() => setShowSuccessAlert(false)}
          onConfirm={() => setShowSuccessAlert(false)}
          title={successMessage.includes('Error') ? 'Error' : 'Éxito'}
          message={successMessage}
          confirmText="Aceptar"
          cancelText=""
          type={successMessage.includes('Error') ? 'danger' : 'success'}
          isLoading={false}
        />
      )}
    </div>
  )
}
