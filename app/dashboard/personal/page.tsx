'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import RoleGuard from '@/components/RoleGuard'
import Map from '@/components/Map'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, MapPin, Users, CheckCircle2, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Incident } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { format } from 'date-fns'

function PersonalDashboardContent() {
  const { user } = useUser()
  const [assignedIncidents, setAssignedIncidents] = useState<Incident[]>([])
  const [areaIncidents, setAreaIncidents] = useState<Incident[]>([])

  useEffect(() => {
    // Simulación de datos - aquí iría la llamada a la API filtrando por AssignedToPersonalId y Area
    setAssignedIncidents([
      {
        Type: 'Fuga de agua',
        UUID: '1',
        Title: 'Fuga de agua en el baño del segundo piso',
        Description: 'Fuga de agua en el baño del segundo piso',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: 'user1',
        CreatedByName: 'Juan Pérez',
        Status: 'EN_ATENCION',
        Priority: 'ALTA',
        IsGlobal: false,
        CreatedAt: '2024-11-15T10:30:00Z',
        ExecutingAt: '2024-11-15T11:00:00Z',
        LocationTower: 'Torre A',
        LocationFloor: 'Piso 2',
        LocationArea: 'Baño',
        Reference: 'REF-001',
        AssignedToPersonalId: user?.UUID || 'personal1',
        PendienteReasignacion: false,
        Comment: [],
      },
    ])

    setAreaIncidents([
      {
        Type: 'Luz dañada',
        UUID: '2',
        Title: 'Lámpara fundida en el pasillo principal',
        Description: 'Lámpara fundida en el pasillo principal',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: 'user2',
        CreatedByName: 'María García',
        Status: 'PENDIENTE',
        Priority: 'MEDIA',
        IsGlobal: false,
        CreatedAt: '2024-11-15T09:15:00Z',
        LocationTower: 'Torre B',
        LocationFloor: 'Piso 1',
        LocationArea: 'Pasillo',
        Reference: 'REF-002',
        PendienteReasignacion: false,
        Comment: [],
      },
    ])
  }, [user])

  const stats = {
    assigned: assignedIncidents.length,
    assignedPending: assignedIncidents.filter((i) => i.Status === 'PENDIENTE').length,
    assignedInProgress: assignedIncidents.filter((i) => i.Status === 'EN_ATENCION').length,
    assignedResolved: assignedIncidents.filter((i) => i.Status === 'RESUELTO').length,
    areaTotal: areaIncidents.length,
  }

  const handleUpdateStatus = (uuid: string, newStatus: Incident['Status']) => {
    setAssignedIncidents(
      assignedIncidents.map((inc) =>
        inc.UUID === uuid ? { ...inc, Status: newStatus } : inc
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Dashboard <span className="gradient-text">Personal</span>
          </h1>
          <p className="text-xl text-gray-600">Gestiona los incidentes asignados a tu área: {user?.Area}</p>
        </div>

        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-utec-secondary via-utec-light to-utec-secondary text-white mb-8 animate-slide-up shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative p-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Área: {user?.Area}</h2>
              <p className="text-white/95 text-lg">Personal Administrativo - Gestiona incidentes asignados</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-xl shadow-lg">
              <Users className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="card group cursor-pointer animate-slide-up bg-gradient-to-br from-green-500 to-green-600 text-white" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 mb-2 font-medium">Asignados a Mí</p>
                <p className="text-3xl font-bold group-hover:scale-110 transition-transform">{stats.assigned}</p>
              </div>
              <Users className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.assignedPending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">En Atención</p>
                <p className="text-3xl font-bold text-utec-secondary group-hover:scale-110 transition-transform">{stats.assignedInProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-utec-secondary" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Resueltos</p>
                <p className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform">{stats.assignedResolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="card group cursor-pointer animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">En Mi Área</p>
                <p className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform">{stats.areaTotal}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Assigned Incidents */}
        <div className="card mb-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <CheckCircle2 className="h-6 w-6 mr-3 text-green-600" />
            Incidentes Asignados a Mí
          </h2>
          <div className="space-y-4">
            {assignedIncidents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tienes incidentes asignados</p>
              </div>
            ) : (
              assignedIncidents.map((incident) => (
                <div key={incident.UUID} className="p-4 border-2 border-gray-100 rounded-xl hover:shadow-lg transition-all">
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
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Link
                      href={`/incidents/${incident.UUID}`}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Ver Detalles</span>
                    </Link>
                    <div className="flex space-x-2">
                      {incident.Status !== 'EN_ATENCION' && (
                        <button
                          onClick={() => handleUpdateStatus(incident.UUID, 'EN_ATENCION')}
                          className="px-4 py-2 bg-utec-secondary text-white rounded-lg hover:bg-utec-primary transition-colors text-sm"
                        >
                          Tomar en Atención
                        </button>
                      )}
                      {incident.Status !== 'RESUELTO' && (
                        <button
                          onClick={() => handleUpdateStatus(incident.UUID, 'RESUELTO')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Marcar como Resuelto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Area Incidents */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-purple-600" />
            Incidentes en Mi Área ({user?.Area})
          </h2>
          <div className="space-y-4">
            {areaIncidents.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay incidentes pendientes en tu área</p>
              </div>
            ) : (
              areaIncidents.map((incident) => (
                <Link
                  key={incident.UUID}
                  href={`/incidents/${incident.UUID}`}
                  className="block p-4 border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                      {incident.Title}
                    </h3>
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
                  </div>
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    {incident.LocationTower} - {incident.LocationFloor} - {incident.LocationArea}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">{incident.Description}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PersonalDashboard() {
  return (
    <RoleGuard allowedRoles={['PERSONAL']}>
      <PersonalDashboardContent />
    </RoleGuard>
  )
}

