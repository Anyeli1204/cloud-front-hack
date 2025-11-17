'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { UserRole } from '@/types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  redirectTo = '/dashboard',
  fallback 
}: RoleGuardProps) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Esperar a que cargue el usuario

    if (!user) {
      console.log('[RoleGuard] Usuario no autenticado, redirigiendo a login')
      router.push('/login')
      return
    }

    if (!allowedRoles.includes(user.Role)) {
      console.log(`[RoleGuard] Acceso denegado. Rol actual: ${user.Role}, Roles permitidos:`, allowedRoles)
      router.push(redirectTo)
      return
    }

    console.log(`[RoleGuard] Acceso permitido para rol: ${user.Role}`)
  }, [user, loading, allowedRoles, router, redirectTo])

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-utec-secondary"></div>
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null
  }

  // Si el rol no está permitido, mostrar fallback o no mostrar nada
  if (!allowedRoles.includes(user.Role)) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta página.</p>
          <p className="text-sm text-gray-500">Tu rol: <span className="font-semibold">{user.Role}</span></p>
          <p className="text-sm text-gray-500">Roles requeridos: <span className="font-semibold">{allowedRoles.join(', ')}</span></p>
        </div>
      </div>
    )
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>
}

// Hook para verificar permisos
export function useRoleAccess(allowedRoles: UserRole[]) {
  const { user } = useUser()
  
  const hasAccess = user ? allowedRoles.includes(user.Role) : false
  const canCreate = user?.Role === 'COMMUNITY' // Solo community puede crear incidentes
  const canAssign = user?.Role === 'COORDINATOR' // Solo coordinadores pueden asignar
  const canViewAll = user?.Role === 'AUTHORITY' // Solo autoridades ven todos los incidentes
  const canManage = user?.Role === 'PERSONAL' // Personal puede marcar como resuelto
  
  return {
    hasAccess,
    canCreate,
    canAssign, 
    canViewAll,
    canManage,
    userRole: user?.Role,
    userArea: user?.Area
  }
}