'use client'

import { useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Map from '@/components/Map'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, MapPin, Users, Settings, BarChart3, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Incident } from '@/types'
import { useUser } from '@/contexts/UserContext'
import { format } from 'date-fns'
import { useIncidents } from '@/hooks/useIncidents'

export default function CoordinatorDashboard() {
  const { user } = useUser()
  // Obtener incidentes filtrados por área del coordinador
  const { incidents: allIncidents, loading } = useIncidents(
    user?.Area ? { area: user.Area } : undefined
  )
  
  // Filtrar incidentes pendientes de reasignación
  const pendingReassignment = useMemo(() => {
    return allIncidents.filter((inc) => inc.PendienteReasignacion === true)
  }, [allIncidents])

  // Filtrar incidentes del área (todos los demás)
  const incidents = useMemo(() => {
    return allIncidents.filter((inc) => inc.PendienteReasignacion !== true)
  }, [allIncidents])

  // Calcular estadísticas
  const stats = useMemo(() => {
    return {
      total: allIncidents.length,
      pending: allIncidents.filter((i) => i.Status === 'PENDIENTE').length,
      inProgress: allIncidents.filter((i) => i.Status === 'EN_ATENCION').length,
      resolved: allIncidents.filter((i) => i.Status === 'RESUELTO').length,
      pendingReassignment: pendingReassignment.length,
    }
  }, [allIncidents, pendingReassignment.length])


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
        {loading ? (
          <div className="card mb-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando incidentes...</p>
            </div>
          </div>
        ) : pendingReassignment.length > 0 ? (
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
        ) : null}

        {/* Area Incidents */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-purple-600" />
            Incidentes del Área ({user?.Area})
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando incidentes...</p>
              </div>
            ) : incidents.length === 0 ? (
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

