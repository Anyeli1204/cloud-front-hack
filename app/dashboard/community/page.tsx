'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Map from '@/components/Map'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, MapPin, Bell, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Incident } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { useIncidents } from '@/hooks/useIncidents'

export default function CommunityDashboard() {
  const { user } = useUser()
  const { incidents: allIncidents, loading } = useIncidents()
  
  // Filtrar solo los incidentes del usuario actual
  const incidents = useMemo(() => {
    if (!user?.UUID) return []
    return allIncidents.filter((incident) => incident.CreatedById === user.UUID)
  }, [allIncidents, user?.UUID])
  
  const [carouselIndex, setCarouselIndex] = useState(0)
  
  const carouselItems = [
    {
      image: '/report-incident.jpg',
      title: 'Reportar Nuevo Incidente',
      href: '/report',
      icon: AlertTriangle,
    },
    {
      image: '/my-reports.jpg',
      title: 'Ver Mis Reportes',
      href: '/my-reports',
      icon: FileText,
    },
    {
      image: '/announcements.jpg',
      title: 'Ver Avisos Generales',
      href: '/announcements',
      icon: Bell,
    },
  ]

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }


  return (
    <div className="min-h-screen bg-utec-gray">
      <Navbar />
      
      {/* Welcome Banner - Full Width */}
      <div className="relative overflow-hidden mb-8 animate-slide-up" style={{ height: '400px', width: '100%' }}>
        <Image
          src="/welcome-banner.jpg"
          alt="Banner de bienvenida"
          fill
          className="object-cover"
          priority
          quality={100}
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" style={{ zIndex: 1 }}></div>
        <div className="relative h-full flex items-center px-4 sm:px-6 lg:px-8" style={{ zIndex: 2 }}>
          <div className="max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white" style={{ 
                textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' 
              }}>
                ¡Bienvenido, {user?.FullName}!
              </h2>
              <p className="text-lg md:text-xl text-white/95" style={{ 
                textShadow: '1px 1px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.4)' 
              }}>
                Gestiona tus incidentes reportados y mantente informado
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Introduction Text */}
        <div className="card mb-10 animate-slide-up relative overflow-hidden">
          <div className="prose max-w-none pb-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              Aquí puedes reportar tus incidentes de manera rápida y sencilla. 
              Mantente informado sobre los avisos generales del campus y sigue el estado 
              de todos tus reportes. Tu participación es importante para mantener un ambiente 
              seguro y funcional en UTEC.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-utec-secondary via-utec-primary to-utec-secondary"></div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-slide-up" style={{ animationDelay: '0.5s', height: '256px' }}>
            {/* Carrusel */}
            <div className="relative w-full h-full">
              {carouselItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`absolute inset-0 transition-all duration-500 ease-in-out cursor-pointer group ${
                      index === carouselIndex
                        ? 'opacity-100 translate-x-0 z-10'
                        : index < carouselIndex
                        ? 'opacity-0 -translate-x-full z-0'
                        : 'opacity-0 translate-x-full z-0'
                    }`}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index === carouselIndex}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-white">
                          <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-2.5 rounded-lg group-hover:bg-white/30 transition-all">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-base sm:text-lg block">{item.title}</span>
                            <span className="text-xs sm:text-sm text-white/80 mt-1 block">Haz clic para {item.title.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
              
              {/* Controles del carrusel */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  prevSlide()
                }}
                className="absolute top-1/2 left-2 sm:left-3 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all active:scale-95"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  nextSlide()
                }}
                className="absolute top-1/2 right-2 sm:right-3 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all active:scale-95"
                aria-label="Slide siguiente"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" />
              </button>
              
              {/* Indicadores */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                {carouselItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCarouselIndex(index)
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === carouselIndex
                        ? 'bg-white w-6 sm:w-8'
                        : 'bg-white/50 w-2 hover:bg-white/75'
                    }`}
                    aria-label={`Ir a ${item.title}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up flex flex-col border-0" style={{ animationDelay: '0.6s', height: '256px' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center flex-shrink-0">
              <Bell className="h-6 w-6 mr-3 text-utec-secondary" />
              Notificaciones Recientes
            </h2>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2" style={{ minHeight: 0 }}>
              <div className="relative bg-gray-100 rounded-md overflow-hidden hover:bg-gray-50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-utec-secondary"></div>
                <div className="pl-4 pr-3 py-3.5">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">Estado actualizado</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Tu incidente cambió a "En Atención"</p>
                </div>
              </div>
              <div className="relative bg-gray-100 rounded-md overflow-hidden hover:bg-gray-50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-utec-secondary"></div>
                <div className="pl-4 pr-3 py-3.5">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">Nuevo aviso general</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Ascensor fuera de servicio</p>
                </div>
              </div>
              <div className="relative bg-gray-100 rounded-md overflow-hidden hover:bg-gray-50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-utec-secondary"></div>
                <div className="pl-4 pr-3 py-3.5">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">Incidente resuelto</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Fuga de agua en el baño del segundo piso</p>
                </div>
              </div>
              <div className="relative bg-gray-100 rounded-md overflow-hidden hover:bg-gray-50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-utec-secondary"></div>
                <div className="pl-4 pr-3 py-3.5">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">Nueva asignación</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Se te ha asignado un nuevo incidente</p>
                </div>
              </div>
              <div className="relative bg-gray-100 rounded-md overflow-hidden hover:bg-gray-50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-utec-secondary"></div>
                <div className="pl-4 pr-3 py-3.5">
                  <p className="text-sm font-bold text-gray-900 mb-0.5">Recordatorio</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Tienes incidentes pendientes de revisar</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

