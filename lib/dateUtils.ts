'use client'

// Utilidades para manejo de fechas y zona horaria de Perú

/**
 * Convierte una fecha UTC a horario de Perú (UTC-5)
 * @param utcDateString - Fecha en formato ISO UTC (ej: "2025-11-17T00:14:23")
 * @returns Date object ajustado a horario de Perú
 */
export function convertUTCToPeruTime(utcDateString: string): Date {
  if (!utcDateString) return new Date()
  
  const utcDate = new Date(utcDateString)
  
  // Perú está en UTC-5 (sin cambio por horario de verano)
  const peruOffset = -5 * 60 // -5 horas en minutos
  const peruTime = new Date(utcDate.getTime() + (peruOffset * 60 * 1000))
  
  return peruTime
}

/**
 * Formatea una fecha UTC para mostrar en horario de Perú
 * @param utcDateString - Fecha en formato ISO UTC
 * @param options - Opciones de formateo
 * @returns String formateado en horario de Perú
 */
export function formatPeruTime(
  utcDateString: string, 
  options: {
    includeTime?: boolean
    includeSeconds?: boolean
    format?: 'short' | 'long' | 'relative'
  } = {}
): string {
  const { includeTime = true, includeSeconds = false, format = 'short' } = options
  
  if (!utcDateString) return 'Fecha no disponible'
  
  try {
    const peruDate = convertUTCToPeruTime(utcDateString)
    
    if (format === 'relative') {
      return getRelativeTimeString(peruDate)
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: format === 'long' ? 'long' : '2-digit',
      day: '2-digit',
    }
    
    if (includeTime) {
      dateOptions.hour = '2-digit'
      dateOptions.minute = '2-digit'
      if (includeSeconds) {
        dateOptions.second = '2-digit'
      }
    }
    
    return peruDate.toLocaleString('es-PE', dateOptions)
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return 'Fecha inválida'
  }
}

/**
 * Obtiene una representación relativa del tiempo (ej: "hace 2 horas")
 * @param date - Fecha a comparar
 * @returns String con tiempo relativo
 */
function getRelativeTimeString(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Hace unos segundos'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`
}

/**
 * Calcula el tiempo de espera en minutos desde la creación hasta ahora
 * @param createdAtUTC - Fecha de creación en UTC
 * @returns Minutos de espera
 */
export function calculateWaitingMinutes(createdAtUTC: string): number {
  if (!createdAtUTC) return 0
  
  try {
    const createdDate = new Date(createdAtUTC)
    const now = new Date()
    const diffInMilliseconds = now.getTime() - createdDate.getTime()
    const diffInMinutes = diffInMilliseconds / (1000 * 60)
    
    return Math.max(0, Math.floor(diffInMinutes))
  } catch (error) {
    console.error('Error al calcular tiempo de espera:', error)
    return 0
  }
}

/**
 * Formatea el tiempo de espera en un string legible
 * @param waitingMinutes - Minutos de espera
 * @returns String formateado (ej: "2h 30m", "45m", "3d 2h")
 */
export function formatWaitingTime(waitingMinutes: number): string {
  if (waitingMinutes < 1) return 'Recién creado'
  
  if (waitingMinutes < 60) {
    return `${waitingMinutes}m`
  }
  
  const hours = Math.floor(waitingMinutes / 60)
  const remainingMinutes = waitingMinutes % 60
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  
  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`
  }
  
  return `${days}d`
}