'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

// URL del lambda para registro
const LAMBDA_REGISTER_URL = process.env.NEXT_PUBLIC_LAMBDA_REGISTER_URL!

export default function RegisterPage(): JSX.Element {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Validaciones
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos')
      setLoading(false)
      return
    }

    // Validar que el correo tenga el dominio de UTEC
    if (!formData.email.endsWith('@utec.edu.pe')) {
      setError('Solo se aceptan correos electrónicos con el dominio @utec.edu.pe')
      setLoading(false)
      return
    }

    // Validar que haya código de comunidad
    if (!formData.code) {
      setError('Por favor ingresa tu código de comunidad (DNI o Credenciales)')
      setLoading(false)
      return
    }
    
    try {
      // Usar el código de comunidad como userId
      const userId = formData.code
      
      // Preparar el body según el formato del lambda
      // Todos se registran como COMMUNITY
      const requestBody = {
        role: 'COMMUNITY',
        userId: userId,
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        communityCode: formData.code,
        status: 'ACTIVE',
      }

      // Llamada al lambda
      const response = await fetch(LAMBDA_REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al registrar usuario')
      }

      const data = await response.json()
      
      // Registro exitoso, redirigir al login
      router.push('/login?registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/register-background.jpg"
          alt="UTEC Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/60 to-black/50"></div>
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-utec-secondary/10 via-transparent to-transparent"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Lado Izquierdo - Logo y Bienvenida */}
        <div className="hidden md:flex flex-col items-center justify-center text-white order-2">
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

        {/* Lado Derecho - Formulario de Registro */}
        <div className="w-full order-1">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Crear Cuenta</h1>
              <p className="text-gray-700 text-lg font-medium">Únete a UTEC ALERTA</p>
              <div className="mt-5 w-20 h-1 bg-gradient-to-r from-transparent via-utec-secondary to-transparent mx-auto rounded-full"></div>
            </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Primera fila: Nombre Completo y Código de Comunidad */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary transition-colors duration-200" />
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-4 pl-12 py-3 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-utec-secondary focus:border-utec-secondary transition-all duration-200 shadow-sm hover:border-gray-300"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-gray-800 mb-2.5">
                  Código de Comunidad
                </label>
                <input
                  id="code"
                  type="text"
                  className="w-full px-4 py-3 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-utec-secondary focus:border-utec-secondary transition-all duration-200 shadow-sm hover:border-gray-300"
                  placeholder="12345678"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>

            {/* Segunda fila: Correo Electrónico (ancho completo) */}
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
                  className="w-full px-4 pl-12 py-3 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-utec-secondary focus:border-utec-secondary transition-all duration-200 shadow-sm hover:border-gray-300"
                  placeholder="tu.email@utec.edu.pe"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Tercera fila: Contraseña y Confirmar Contraseña */}
            <div className="grid md:grid-cols-2 gap-4">
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
                    className="w-full px-4 pl-12 pr-12 py-3 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-utec-secondary focus:border-utec-secondary transition-all duration-200 shadow-sm hover:border-gray-300"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary transition-colors duration-200" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 pl-12 py-3 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-utec-secondary focus:border-utec-secondary transition-all duration-200 shadow-sm hover:border-gray-300"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
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
                    Registrando...
                  </>
                ) : (
                  'Registrarse'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-utec-primary to-utec-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          <div className="mt-8 text-center relative z-10 pt-6 border-t border-gray-200">
            <p className="text-gray-700 font-medium">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-utec-secondary hover:text-utec-primary font-semibold transition-colors duration-200 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

