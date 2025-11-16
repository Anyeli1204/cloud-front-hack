'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { User } from '@/types'
import { saveToken, authenticatedFetch } from '@/lib/auth'
import Image from 'next/image'

// URL del lambda
const LAMBDA_LOGIN_URL = process.env.NEXT_PUBLIC_LAMBDA_LOGIN_URL!
const LAMBDA_USERS_URL = process.env.NEXT_PUBLIC_LAMBDA_USERS_URL!

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Llamada al lambda
      const response = await fetch(LAMBDA_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al iniciar sesión')
      }

      const data = await response.json()
      
      // Guardar el token
      if (data.token && data.expiresAt) {
        saveToken({
          token: data.token,
          expiresAt: data.expiresAt,
        })

            // Obtener datos del usuario usando el token
            try {
              const userResponse = await authenticatedFetch(LAMBDA_USERS_URL, {
                method: 'GET',
              })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            
            // Mapear la respuesta al formato User
            const user: User = {
              Role: userData.Role,
              UUID: userData.UUID,
              UserId: userData.UserId,
              FullName: userData.FullName,
              Email: userData.Email,
              Area: userData.Area || undefined,
              CommunityCode: userData.CommunityCode || undefined,
              Status: userData.Status,
              CreatedAt: userData.CreatedAt,
              ToList: userData.ToList || undefined,
            }
            setUser(user)
          } else {
            // Si falla obtener el usuario, crear uno básico
            const defaultUser: User = {
              Role: 'COMMUNITY',
              UUID: '',
              UserId: '',
              FullName: '',
              Email: formData.email,
              Status: 'ACTIVE',
              CreatedAt: new Date().toISOString(),
            }
            setUser(defaultUser)
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error)
          // Si falla obtener el usuario, crear uno básico
          const defaultUser: User = {
            Role: 'COMMUNITY',
            UUID: '',
            UserId: '',
            FullName: '',
            Email: formData.email,
            Status: 'ACTIVE',
            CreatedAt: new Date().toISOString(),
          }
          setUser(defaultUser)
        }
      }

      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Por favor verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-background.jpg"
          alt="UTEC Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/50"></div>
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-utec-secondary/10 via-transparent to-transparent"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Lado Izquierdo - Logo y Bienvenida */}
        <div className="hidden md:flex flex-col items-center justify-center text-white">
          <div className="mb-0 transform hover:scale-105 transition-transform duration-300 relative">
            {/* Múltiples capas de brillo para efecto de resplandor */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Brillo exterior más difuso */}
              <div 
                className="absolute w-[800px] h-[280px] animate-glow-pulse"
                style={{
                  backgroundImage: 'url(/logo-transparent.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  filter: 'blur(40px) brightness(2)',
                  WebkitFilter: 'blur(40px) brightness(2)',
                  animationDelay: '0s',
                }}
              ></div>
              {/* Brillo medio */}
              <div 
                className="absolute w-[760px] h-[260px] animate-glow-pulse"
                style={{
                  backgroundImage: 'url(/logo-transparent.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  filter: 'blur(30px) brightness(2.5)',
                  WebkitFilter: 'blur(30px) brightness(2.5)',
                  animationDelay: '0.3s',
                }}
              ></div>
              {/* Brillo interior más intenso */}
              <div 
                className="absolute w-[720px] h-[250px] animate-glow-pulse"
                style={{
                  backgroundImage: 'url(/logo-transparent.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  filter: 'blur(20px) brightness(3)',
                  WebkitFilter: 'blur(20px) brightness(3)',
                  animationDelay: '0.6s',
                }}
              ></div>
            </div>
            {/* Logo principal con brillo */}
            <div className="relative z-10">
              <Image
                src="/logo-transparent.png"
                alt="UTEC ALERTA"
                width={3000}
                height={2000}
                className="h-auto w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-logo-float"
                style={{
                  filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.9)) drop-shadow(0 0 40px rgba(255,255,255,0.6))',
                }}
              />
            </div>
          </div>
          <p className="text-xl font-semibold text-white text-center max-w-full leading-tight mt-2 whitespace-nowrap" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}>
            Sistema de Reportes de Incidentes del Campus
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-transparent via-utec-secondary to-transparent"></div>
        </div>

        {/* Lado Derecho - Formulario de Login */}
        <div className="w-full">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/40 relative overflow-hidden">
            {/* Efecto de brillo sutil en la esquina superior */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-utec-secondary/15 via-utec-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
            {/* Efecto de brillo en la esquina inferior izquierda */}
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-utec-light/10 to-transparent rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
            {/* Logo en móvil */}
            <div className="md:hidden flex justify-center mb-6 relative z-10">
              <div className="relative">
                {/* Múltiples capas de brillo para efecto de resplandor */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Brillo exterior más difuso */}
                  <div 
                    className="absolute w-[480px] h-[163px] animate-glow-pulse"
                    style={{
                      backgroundImage: 'url(/logo-transparent.png)',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      filter: 'blur(28px) brightness(2)',
                      WebkitFilter: 'blur(28px) brightness(2)',
                      animationDelay: '0s',
                    }}
                  ></div>
                  {/* Brillo medio */}
                  <div 
                    className="absolute w-[450px] h-[153px] animate-glow-pulse"
                    style={{
                      backgroundImage: 'url(/logo-transparent.png)',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      filter: 'blur(22px) brightness(2.5)',
                      WebkitFilter: 'blur(22px) brightness(2.5)',
                      animationDelay: '0.3s',
                    }}
                  ></div>
                  {/* Brillo interior más intenso */}
                  <div 
                    className="absolute w-[432px] h-[147px] animate-glow-pulse"
                    style={{
                      backgroundImage: 'url(/logo-transparent.png)',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      filter: 'blur(16px) brightness(3)',
                      WebkitFilter: 'blur(16px) brightness(3)',
                      animationDelay: '0.6s',
                    }}
                  ></div>
                </div>
                {/* Logo principal con brillo */}
                <div className="relative z-10">
                  <Image
                    src="/logo-transparent.png"
                    alt="UTEC ALERTA"
                    width={1000}
                    height={1000}
                    className="h-auto w-auto object-contain animate-logo-float"
                    style={{
                      filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.9)) drop-shadow(0 0 30px rgba(255,255,255,0.6))',
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8 relative z-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Iniciar Sesión</h1>
              <p className="text-gray-700 text-lg font-medium">Accede a tu cuenta de UTEC ALERTA</p>
              <div className="mt-5 w-20 h-1 bg-gradient-to-r from-transparent via-utec-secondary to-transparent mx-auto rounded-full"></div>
            </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary transition-colors duration-200" />
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 pl-12 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-utec-secondary focus:border-utec-secondary transition-all duration-200 shadow-sm hover:border-gray-300"
                  placeholder="tu.email@utec.edu.pe"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary transition-colors duration-200" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 pl-12 pr-12 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-utec-secondary focus:border-utec-secondary transition-all duration-200 shadow-sm hover:border-gray-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-utec-secondary transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-2 border-gray-300 text-utec-secondary focus:ring-utec-secondary focus:ring-2 cursor-pointer transition-colors" 
                />
                <span className="ml-2.5 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Recordarme</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-utec-secondary hover:text-utec-primary transition-colors duration-200 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 px-6 bg-gradient-to-r from-utec-secondary to-utec-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group mt-2"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-utec-primary to-utec-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

            <div className="mt-8 text-center relative z-10 pt-6 border-t border-gray-200">
              <p className="text-gray-700 font-medium">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="text-utec-secondary hover:text-utec-primary font-semibold transition-colors duration-200 hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

