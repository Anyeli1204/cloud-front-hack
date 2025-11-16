'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

export default function Dashboard() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirigir según el rol del usuario
        switch (user.Role) {
          case 'COMMUNITY':
            router.replace('/dashboard/community')
            break
          case 'PERSONAL':
            router.replace('/dashboard/personal')
            break
          case 'COORDINATOR':
            router.replace('/dashboard/coordinator')
            break
          case 'AUTHORITY':
            router.replace('/dashboard/authority')
            break
          default:
            router.replace('/dashboard/community')
        }
      } else {
        // Si no hay usuario pero hay token, redirigir a COMMUNITY por defecto
        // O redirigir al login si no hay token
        router.replace('/dashboard/community')
      }
    }
  }, [user, loading, router])

  // Mostrar loading mientras se determina el rol
  return (
    <div className="min-h-screen bg-utec-gray flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-utec-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    </div>
  )
}
