'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import RoleGuard from '@/components/RoleGuard'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, MapPin, Shield, BarChart3, Users, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Incident } from '@/types'
import { useUser } from '@/contexts/UserContext'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

function AuthorityDashboardContent() {
  const { user } = useUser()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [globalIncidents, setGlobalIncidents] = useState<Incident[]>([])

  useEffect(() => {
    // Simulación de datos - aquí iría la llamada a la API para obtener TODOS los incidentes
    setIncidents([
      {
        Type: 'Fuga de agua',
        UUID: '1',
        Title: 'Fuga de agua en el baño del segundo piso',
        Description: 'Fuga de agua en el baño del segundo piso',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: 'user1',
        CreatedByName: 'Juan Pérez',
        Status: 'Pendiente',
        Priority: 'ALTA',
        IsGlobal: false,
        CreatedAt: '2024-11-15T10:30:00Z',
        LocationTower: 'Torre A',
        LocationFloor: 'Piso 2',
        LocationArea: 'Baño',
        Reference: 'REF-001',
        PendienteReasignacion: false,
        Comment: [],
      },
      {
        Type: 'Luz dañada',
        UUID: '2',
        Title: 'Lámpara fundida en el pasillo principal',
        Description: 'Lámpara fundida en el pasillo principal',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: 'user2',
        CreatedByName: 'María García',
        Status: 'EnAtencion',
        Priority: 'MEDIA',
        IsGlobal: false,
        CreatedAt: '2024-11-15T09:15:00Z',
        ExecutingAt: '2024-11-15T10:00:00Z',
        LocationTower: 'Torre B',
        LocationFloor: 'Piso 1',
        LocationArea: 'Pasillo',
        Reference: 'REF-002',
        AssignedToPersonalId: 'personal1',
        PendienteReasignacion: false,
        Comment: [],
      },
      {
        Type: 'Ascensor fuera de servicio',
        UUID: '3',
        Title: 'Ascensor principal no funciona',
        Description: 'Ascensor principal no funciona',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: 'user3',
        CreatedByName: 'Carlos López',
        Status: 'Resuelto',
        Priority: 'ALTA',
        IsGlobal: true,
        CreatedAt: '2024-11-14T14:20:00Z',
        ExecutingAt: '2024-11-14T15:00:00Z',
        ResolvedAt: '2024-11-15T08:00:00Z',
        LocationTower: 'Torre C',
        LocationFloor: 'Todos',
        LocationArea: 'Ascensor',
        Reference: 'REF-003',
        AssignedToPersonalId: 'personal2',
        PendienteReasignacion: false,
        Comment: [],
      },
    ])

    setGlobalIncidents(incidents.filter((i) => i.IsGlobal))
  }, [])

  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.Status === 'Pendiente').length,
    inProgress: incidents.filter((i) => i.Status === 'EnAtencion').length,
    resolved: incidents.filter((i) => i.Status === 'Resuelto').length,
    critical: incidents.filter((i) => i.Priority === 'CRÍTICO').length,
    global: globalIncidents.length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Dashboard <span className="gradient-text">Autoridad</span>
          </h1>
          <p className="text-xl text-gray-600">Vista completa del sistema de gestión de incidentes</p>
        </div>

        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-utec-secondary via-utec-light to-utec-secondary text-white mb-8 animate-slide-up shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative p-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Panel de Autoridad</h2>
              <p className="text-white/95 text-lg">Acceso completo a todas las funcionalidades del sistema</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-xl shadow-lg">
              <Shield className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-10">
          <div className="card group cursor-pointer animate-slide-up bg-gradient-to-br from-red-500 to-red-600 text-white" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100 mb-2 font-medium">Total</p>
                <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">En Atención</p>
                <p className="text-3xl font-bold text-utec-secondary group-hover:scale-110 transition-transform">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-utec-secondary" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Resueltos</p>
                <p className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up bg-gradient-to-br from-orange-500 to-orange-600 text-white" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100 mb-2 font-medium">Críticos</p>
                <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up bg-gradient-to-br from-indigo-500 to-indigo-600 text-white" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-100 mb-2 font-medium">Globales</p>
                <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{stats.global}</p>
              </div>
              <FileText className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Map and Recent Incidents */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Map */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <div className="card h-[500px] overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="bg-gradient-to-br from-red-500 to-rose-600 p-2 rounded-lg mr-3">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  Mapa de Incidentes
                </h2>
              </div>
              <Map incidents={incidents} />
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Incidentes Recientes</h2>
            <div className="space-y-4">
              {incidents.slice(0, 5).map((incident) => (
                <Link
                  key={incident.UUID}
                  href={`/incidents/${incident.UUID}`}
                  className="block p-4 border-2 border-gray-100 rounded-xl hover:border-red-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors">
                      {incident.Title}
                    </h3>
                    <span
                      className={`badge ${
                        incident.Status === 'Pendiente'
                          ? 'badge-pending'
                          : incident.Status === 'EnAtencion'
                          ? 'badge-in-progress'
                          : 'badge-resolved'
                      }`}
                    >
                      {incident.Status === 'Pendiente'
                        ? 'Pendiente'
                        : incident.Status === 'EnAtencion'
                        ? 'En Atención'
                        : 'Resuelto'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    {incident.LocationTower} - {incident.LocationFloor} - {incident.LocationArea}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">{incident.Description}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/admin"
              className="mt-6 block text-center text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
            >
              Ver todos los incidentes →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.9s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones Administrativas</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/admin" className="btn-primary flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Panel Administrativo</span>
            </Link>
            <Link href="/announcements" className="btn-secondary flex items-center justify-center">
              Ver Avisos Generales
            </Link>
            <button className="btn-secondary flex items-center justify-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gestionar Usuarios</span>
            </button>
            <button className="btn-secondary flex items-center justify-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Exportar Reportes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthorityDashboard() {
  return (
    <RoleGuard allowedRoles={['AUTHORITY']}>
      <AuthorityDashboardContent />
    </RoleGuard>
  )
}

