'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, MapPin, Clock, Shield, Users, Zap, ArrowRight, CheckCircle, TrendingUp, Bell } from 'lucide-react'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navClassName = isScrolled 
    ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-lg'
    : 'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md'

  const patternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={navClassName}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-utec-blue to-utec-light p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Alerta UTEC</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#caracteristicas" className="text-gray-700 hover:text-utec-blue font-medium transition-colors">
                Características
              </Link>
              <Link href="#como-funciona" className="text-gray-700 hover:text-utec-blue font-medium transition-colors">
                Cómo Funciona
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-utec-blue font-medium transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn-primary">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-utec-blue via-utec-light to-utec-accent opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${patternUrl}")` }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              Alerta <span className="text-utec-accent">UTEC</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
              Sistema inteligente de reportes de incidentes en tiempo real. 
              Mantén la seguridad del campus con tecnología de vanguardia.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/register" className="group bg-white text-utec-blue hover:bg-utec-gray font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-2xl transform hover:-translate-y-1 text-lg flex items-center space-x-2">
                <span>Comenzar Ahora</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-10 rounded-xl transition-all duration-300 text-lg">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          
          {/* Floating Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: '100%', label: 'Tiempo Real', icon: Zap },
              { number: '24/7', label: 'Disponible', icon: Clock },
              { number: '1000+', label: 'Reportes', icon: TrendingUp },
            ].map((stat, index) => (
              <div key={index} className="glass-effect rounded-2xl p-6 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <stat.icon className="h-8 w-8 text-white mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Características <span className="gradient-text">Principales</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnología avanzada para una gestión eficiente de incidentes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Mapa Interactivo',
                description: 'Visualiza incidentes en tiempo real en un mapa interactivo del campus con geolocalización precisa',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: Zap,
                title: 'Reportes Instantáneos',
                description: 'Reporta incidentes de forma rápida y sencilla desde cualquier dispositivo en segundos',
                color: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Clock,
                title: 'Tiempo Real',
                description: 'Recibe actualizaciones instantáneas sobre el estado de tus reportes sin necesidad de recargar',
                color: 'from-green-500 to-emerald-600',
              },
              {
                icon: Shield,
                title: 'Seguridad Avanzada',
                description: 'Sistema seguro con autenticación robusta y roles de usuario para proteger la información',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: Users,
                title: 'Múltiples Roles',
                description: 'Soporte completo para estudiantes, personal administrativo y autoridades del campus',
                color: 'from-pink-500 to-rose-500',
              },
              {
                icon: Bell,
                title: 'Notificaciones',
                description: 'Sistema de prioridades inteligente para atender incidentes urgentes primero',
                color: 'from-red-500 to-red-600',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ¿Cómo <span className="gradient-text">Funciona?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Proceso simple y eficiente en solo 3 pasos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-1/3 w-1/3 h-1 bg-gradient-to-r from-utec-blue via-utec-light to-utec-accent"></div>
            
            {[
              {
                step: '01',
                title: 'Regístrate',
                description: 'Crea tu cuenta con tu correo institucional UTEC y selecciona tu rol',
                icon: Users,
              },
              {
                step: '02',
                title: 'Reporta',
                description: 'Describe el incidente, selecciona la ubicación y el nivel de urgencia',
                icon: AlertTriangle,
              },
              {
                step: '03',
                title: 'Sigue',
                description: 'Monitorea el estado de tu reporte en tiempo real y recibe notificaciones',
                icon: CheckCircle,
              },
            ].map((step, index) => (
              <div key={index} className="relative text-center animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-24 h-24 bg-gradient-to-br from-utec-blue to-utec-light rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-12 w-12 text-white" />
                </div>
                <div className="text-6xl font-bold text-gray-200 mb-4">{step.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-utec-blue via-utec-light to-utec-accent relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url("${patternUrl}")` }}></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a la comunidad UTEC y ayuda a mantener el campus seguro
          </p>
          <Link href="/register" className="inline-flex items-center space-x-2 bg-white text-utec-blue hover:bg-utec-gray font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-2xl transform hover:-translate-y-1 text-lg">
            <span>Crear Cuenta Gratis</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-utec-blue to-utec-light p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Alerta UTEC</span>
              </div>
              <p className="text-gray-400">
                Sistema de reportes de incidentes para mantener la seguridad del campus UTEC.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Jr. Medrano Silva 165, Barranco</li>
                <li>Lima, Perú</li>
                <li>informes@utec.edu.pe</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Alerta UTEC. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
