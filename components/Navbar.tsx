'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Notifications from './Notifications'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import { wsClient } from '@/lib/websocket'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleLogout = () => {
    console.log('[Navbar] 🚪 Iniciando logout...')
    
    // 1. Desconectar WebSocket PRIMERO - esto debe activar $disconnect en tu Lambda
    wsClient.disconnect()
    
    // 2. Limpiar estado del usuario y token
    setUser(null)
    clearToken()
    
    // 3. Redirigir al login
    router.push('/login')
    
    console.log('[Navbar] ✅ Logout completado - $disconnect debería haber limpiado DynamoDB')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navegación según el rol del usuario
  const getNavigation = () => {
    if (!user) return []

    switch (user.Role) {
      case 'COMMUNITY':
        return [
          { name: 'Dashboard', href: '/dashboard/community' },
          { name: 'Avisos', href: '/announcements' },
          { name: 'Reportar', href: '/report' },
          { name: 'Mis Reportes', href: '/my-reports' },
        ]
      case 'PERSONAL':
        return [
          { name: 'Dashboard', href: '/dashboard/personal' },
          { name: 'Mis Asignaciones', href: '/my-reports' },
          { name: 'Avisos', href: '/announcements' },
        ]
      case 'COORDINATOR':
        return [
          { name: 'Dashboard', href: '/dashboard/coordinator' },
          { name: 'Gestionar', href: '/admin' },
          { name: 'Avisos', href: '/announcements' },
        ]
      case 'AUTHORITY':
        return [
          { name: 'Dashboard', href: '/dashboard/authority' },
          { name: 'Admin', href: '/admin' },
          { name: 'Avisos', href: '/announcements' },
        ]
      default:
        return [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Avisos', href: '/announcements' },
          { name: 'Reportar', href: '/report' },
          { name: 'Mis Reportes', href: '/my-reports' },
        ]
    }
  }

  const navigation = getNavigation()

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center group">
            <div className="group-hover:opacity-80 transition-opacity duration-300">
              <Image
                src="/logo.png"
                alt="Alerta UTEC"
                width={220}
                height={75}
                className="h-16 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-900 hover:text-utec-primary transition-colors duration-200"
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-utec-primaryDark via-utec-secondary to-utec-primaryDark"></span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Notifications />
            <Link
              href="/profile"
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-utec-primary transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-utec-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-down">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative block px-4 py-3 text-sm font-medium mb-1 transition-colors ${
                    isActive ? 'text-utec-primary font-semibold' : 'text-gray-700 hover:text-utec-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-utec-primaryDark via-utec-secondary to-utec-primaryDark"></span>
                  )}
                </Link>
              )
            })}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="px-4">
                <Notifications />
              </div>
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-utec-primary w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Perfil</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-red-600 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

