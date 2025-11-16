'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '@/types'
import { clearToken } from '@/lib/auth'

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Función para actualizar el usuario y guardarlo en localStorage
  const updateUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
      clearToken() // Limpiar el token cuando se cierra sesión
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

