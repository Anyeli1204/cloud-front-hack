'use client'

import { wsClient } from './websocket'

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

  if (!wsClient.isConnected()) {
    throw new Error('No hay conexión con el servidor. Por favor, recarga la página e intenta nuevamente.')
  }
  
  wsClient.send(message)
}

export function editIncidentContent(data: {
  tenant_id: string
  uuid: string
  CreatedById?: string
  actionToDo: 'Editar' | 'AjustarUrgencia' | 'Eliminar'
  new_title?: string
  new_description?: string
  new_priority?: 'bajo' | 'media' | 'alta' | 'critico'
}) {
  const message: any = {
    action: 'EditIncidentContent',
    tenant_id: data.tenant_id,
    uuid: data.uuid,
    actionToDo: data.actionToDo,
  }

  if (data.CreatedById) {
    message.CreatedById = data.CreatedById
  }

  if (data.actionToDo === 'Editar') {
    if (data.new_title) message.new_title = data.new_title
    if (data.new_description) message.new_description = data.new_description
  } else if (data.actionToDo === 'AjustarUrgencia') {
    if (data.new_priority) message.new_priority = data.new_priority
  }
  // Para 'Eliminar' no se necesitan parámetros adicionales

  wsClient.send(message)
}

export function staffChooseIncident(data: {
  tenant_id: string
  uuid: string
  Area: string
}) {
  const message = {
    action: 'StaffChooseIncident',
    tenant_id: data.tenant_id,
    uuid: data.uuid,
    Area: data.Area,
  }

  wsClient.send(message)
}

export function coordinatorAssignIncident(data: {
  tenant_id: string
  uuid: string
  actionToDo: 'Asignar' | 'EscribirComentario'
  AssignedToPersonalId?: string
  new_comment?: string
}) {
  if (!wsClient.isConnected()) {
    throw new Error('No hay conexión con el servidor. Por favor, recarga la página e intenta nuevamente.')
  }

  // Construir el mensaje exactamente como lo espera el backend
  const message: {
    action: string
    tenant_id: string
    uuid: string
    actionToDo: string
    AssignedToPersonalId?: string
    new_comment?: string
  } = {
    action: 'CoordinatorAssignIncident',
    tenant_id: data.tenant_id,
    uuid: data.uuid,
    actionToDo: data.actionToDo,
  }

  // Agregar campos adicionales según el actionToDo
  if (data.actionToDo === 'Asignar' && data.AssignedToPersonalId) {
    message.AssignedToPersonalId = data.AssignedToPersonalId
  } else if (data.actionToDo === 'EscribirComentario' && data.new_comment) {
    message.new_comment = data.new_comment
  }

  // Verificar que el mensaje tenga el formato correcto
  console.log('📤 [coordinatorAssignIncident] Mensaje completo a enviar:')
  console.log(JSON.stringify(message, null, 2))
  console.log('📤 [coordinatorAssignIncident] Verificando formato:', {
    tieneAction: !!message.action,
    tieneTenantId: !!message.tenant_id,
    tieneUuid: !!message.uuid,
    tieneActionToDo: !!message.actionToDo,
    tieneAssignedToPersonalId: !!message.AssignedToPersonalId,
  })
  
  wsClient.send(message)
}

export function solvedIncident(data: {
  tenant_id: string
  uuid: string
  new_comment?: string
}) {
  const message: any = {
    action: 'SolvedIncident',
    tenant_id: data.tenant_id,
    uuid: data.uuid,
  }

  if (data.new_comment) {
    message.new_comment = data.new_comment
  }

  wsClient.send(message)
}

export function authorityManageIncidents(data: {
  tenant_id: string
  uuid: string
  actionToDo: 'Cerrar' | 'Reasignar'
}) {
  if (!wsClient.isConnected()) {
    throw new Error('No hay conexión con el servidor. Por favor, recarga la página e intenta nuevamente.')
  }

  const message = {
    action: 'AuthorityManageIncidents',
    tenant_id: data.tenant_id,
    uuid: data.uuid,
    actionToDo: data.actionToDo,
  }

  wsClient.send(message)
}
