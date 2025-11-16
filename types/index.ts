// Tipos para la tabla de Incidentes
export interface Comment {
  Date: string
  UserId: string
  Role: string
  Message: string
}

export interface Incident {
  Type: string // PK
  UUID: string // SK (UUID#subType)
  Title: string
  Description: string
  ResponsibleArea: string[]
  CreatedById: string
  CreatedByName: string
  Status: 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTO'
  Priority: 'BAJO' | 'MEDIA' | 'ALTA' | 'CRÍTICO'
  IsGlobal: boolean
  CreatedAt: string // timestamp
  ExecutingAt?: string // timestamp
  ResolvedAt?: string // timestamp
  LocationTower: string
  LocationFloor: string
  LocationArea: string
  Reference: string
  AssignedToPersonalId?: string
  Comment: Comment[]
  PendienteReasignacion: boolean
  Images?: string[] // URLs de las imágenes del incidente
  Subtype?: string // Subtipo del incidente (ej: "Convivencia", "Robos", etc.)
}

// Tipos para la tabla de Users
export type UserRole = 'COMMUNITY' | 'PERSONAL' | 'COORDINATOR' | 'AUTHORITY'
export type UserArea = 
  | 'Seguridad' 
  | 'Bienestar' 
  | 'Limpieza' 
  | 'Infraestructura y mantenimiento' 
  | 'Laboratorios y talleres' 
  | 'Tecnologías de la Información (TI)' 
  | 'Servicio médico/Tópico'

export type CommunityCode = 'DNI' | 'CREDENTIALS'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface User {
  Role: UserRole // PK
  UUID: string // SK
  UserId: string
  FullName: string
  Email: string
  Area?: UserArea // Opcional - solo para PERSONAL, COORDINATOR, AUTHORITY
  CommunityCode?: CommunityCode
  Status: UserStatus
  CreatedAt: string // timestamp
  ToList?: string[] // list (Personal)
}
