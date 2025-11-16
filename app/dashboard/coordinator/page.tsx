'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Map from '@/components/Map'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, MapPin, Users, Settings, BarChart3, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Incident } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { format } from 'date-fns'

export default function CoordinatorDashboard() {
  const { user } = useUser()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [pendingReassignment, setPendingReassignment] = useState<Incident[]>([])

  useEffect(() => {
    // Simulación de datos - aquí iría la llamada a la API filtrando por área del coordinador
    setIncidents([
      {
        Type: 'Fuga de agua',
        UUID: '1',
        Title: 'Fuga de agua en el baño del segundo piso',
        Description: 'Fuga de agua en el baño del segundo piso',
        ResponsibleArea: [user?.Area || 'Infraestructura y mantenimiento'],
        CreatedById: 'user1',
        CreatedByName: 'Juan Pérez',
        Status: 'PENDIENTE',
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
        ResponsibleArea: [user?.Area || 'Infraestructura y mantenimiento'],
        CreatedById: 'user2',
        CreatedByName: 'María García',
        Status: 'EN_ATENCION',
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
    ])

    setPendingReassignment([
      {
        Type: 'Ascensor fuera de servicio',
        UUID: '3',
        Title: 'Ascensor principal no funciona',
        Description: 'Ascensor principal no funciona',
        ResponsibleArea: [user?.Area || 'Infraestructura y mantenimiento'],
        CreatedById: 'user3',
        CreatedByName: 'Carlos López',
        Status: 'PENDIENTE',
        Priority: 'CRÍTICO',
        IsGlobal: true,
        CreatedAt: '2024-11-14T14:20:00Z',
        LocationTower: 'Torre C',
        LocationFloor: 'Todos',
        LocationArea: 'Ascensor',
        Reference: 'REF-003',
        PendienteReasignacion: true,
        Comment: [],
      },
    ])
  }, [user])

  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.Status === 'PENDIENTE').length,
    inProgress: incidents.filter((i) => i.Status === 'EN_ATENCION').length,
    resolved: incidents.filter((i) => i.Status === 'RESUELTO').length,
    pendingReassignment: pendingReassignment.length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Dashboard <span className="gradient-text">Coordinador</span>
          </h1>
          <p className="text-xl text-gray-600">Gestiona y coordina incidentes del área: {user?.Area}</p>
        </div>

        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-utec-secondary via-utec-light to-utec-secondary text-white mb-8 animate-slide-up shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative p-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Coordinador de {user?.Area}</h2>
              <p className="text-white/95 text-lg">Gestiona asignaciones y coordina el trabajo del personal</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-xl shadow-lg">
              <Settings className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="card group cursor-pointer animate-slide-up bg-gradient-to-br from-purple-500 to-purple-600 text-white" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100 mb-2 font-medium">Total Incidentes</p>
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
                <p className="text-sm text-orange-100 mb-2 font-medium">Pendientes Reasignación</p>
                <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{stats.pendingReassignment}</p>
              </div>
              <UserPlus className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Pending Reassignment */}
        {pendingReassignment.length > 0 && (
          <div className="card mb-8 animate-slide-up border-l-4 border-orange-500" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <UserPlus className="h-6 w-6 mr-3 text-orange-600" />
              Incidentes Pendientes de Reasignación
            </h2>
            <div className="space-y-4">
              {pendingReassignment.map((incident) => (
                <div key={incident.UUID} className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{incident.Title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {incident.LocationTower} - {incident.LocationFloor} - {incident.LocationArea}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">{incident.Description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Reportado por: {incident.CreatedByName}</span>
                        <span>
                          {format(new Date(incident.CreatedAt), "dd/MM/yyyy 'a las' HH:mm")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="badge badge-urgent">{incident.Priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-orange-200">
                    <Link
                      href={`/incidents/${incident.UUID}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      Ver Detalles
                    </Link>
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                      Asignar a Personal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Area Incidents */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-purple-600" />
            Incidentes del Área ({user?.Area})
          </h2>
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay incidentes en tu área</p>
              </div>
            ) : (
              incidents.map((incident) => (
                <Link
                  key={incident.UUID}
                  href={`/incidents/${incident.UUID}`}
                  className="block p-4 border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                        {incident.Title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 font-medium">
                        {incident.LocationTower} - {incident.LocationFloor} - {incident.LocationArea}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">{incident.Description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span
                        className={`badge ${
                          incident.Status === 'PENDIENTE'
                            ? 'badge-pending'
                            : incident.Status === 'EN_ATENCION'
                            ? 'badge-in-progress'
                            : 'badge-resolved'
                        }`}
                      >
                        {incident.Status === 'PENDIENTE'
                          ? 'Pendiente'
                          : incident.Status === 'EN_ATENCION'
                          ? 'En Atención'
                          : 'Resuelto'}
                      </span>
                      <span
                        className={`badge ${
                          incident.Priority === 'CRÍTICO' || incident.Priority === 'ALTA'
                            ? 'badge-urgent'
                            : 'badge-pending'
                        }`}
                      >
                        {incident.Priority}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

