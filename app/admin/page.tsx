'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import RoleGuard from '@/components/RoleGuard'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, Users, Filter, Download } from 'lucide-react'

interface Incident {
  id: string
  type: string
  location: string
  description: string
  status: 'pending' | 'in-progress' | 'resolved'
  urgency: 'low' | 'medium' | 'high'
  reportedBy: string
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')

  useEffect(() => {
    // Simulación de datos - aquí iría la llamada a la API
    const mockIncidents: Incident[] = [
      {
        id: '1',
        type: 'Fuga de agua',
        location: 'Edificio A - Piso 2',
        description: 'Fuga de agua en el baño del segundo piso',
        status: 'pending',
        urgency: 'high',
        reportedBy: 'Juan Pérez',
        createdAt: '2024-11-15T10:30:00Z',
        updatedAt: '2024-11-15T10:30:00Z',
      },
      {
        id: '2',
        type: 'Luz dañada',
        location: 'Edificio B - Pasillo',
        description: 'Lámpara fundida en el pasillo principal',
        status: 'in-progress',
        urgency: 'medium',
        reportedBy: 'María García',
        createdAt: '2024-11-15T09:15:00Z',
        updatedAt: '2024-11-15T11:20:00Z',
      },
      {
        id: '3',
        type: 'Ascensor fuera de servicio',
        location: 'Edificio C',
        description: 'Ascensor principal no funciona',
        status: 'resolved',
        urgency: 'high',
        reportedBy: 'Carlos López',
        createdAt: '2024-11-14T14:20:00Z',
        updatedAt: '2024-11-15T08:00:00Z',
      },
    ]
    setIncidents(mockIncidents)
    setFilteredIncidents(mockIncidents)
  }, [])

  useEffect(() => {
    let filtered = incidents

    if (statusFilter !== 'all') {
      filtered = filtered.filter((incident) => incident.status === statusFilter)
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((incident) => incident.urgency === urgencyFilter)
    }

    setFilteredIncidents(filtered)
  }, [statusFilter, urgencyFilter, incidents])

  const updateStatus = (id: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    setIncidents(
      incidents.map((incident) =>
        incident.id === id ? { ...incident, status: newStatus, updatedAt: new Date().toISOString() } : incident
      )
    )
  }

  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.status === 'pending').length,
    inProgress: incidents.filter((i) => i.status === 'in-progress').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
    urgent: incidents.filter((i) => i.urgency === 'high').length,
  }

  return (
    <RoleGuard allowedRoles={['COORDINATOR', 'AUTHORITY']}>
      <div className="min-h-screen bg-utec-gray">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Administrativo</h1>
            <p className="text-gray-600">Gestiona todos los incidentes reportados en el campus</p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-utec-blue" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En Atención</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resueltos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="input-field pl-10"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Atención</option>
                <option value="resolved">Resuelto</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="input-field pl-10"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="all">Todas las urgencias</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <button className="btn-secondary flex items-center justify-center">
              <Download className="h-5 w-5 mr-2" />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-utec-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incidente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reportado Por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-utec-gray">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{incident.type}</div>
                      <div className="text-sm text-gray-500">{incident.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{incident.reportedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        incident.status === 'pending'
                          ? 'badge-pending'
                          : incident.status === 'in-progress'
                          ? 'badge-in-progress'
                          : 'badge-resolved'
                      }`}
                    >
                      {incident.status === 'pending'
                        ? 'Pendiente'
                        : incident.status === 'in-progress'
                        ? 'En Atención'
                        : 'Resuelto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        incident.urgency === 'high' ? 'badge-urgent' : 'badge-pending'
                      }`}
                    >
                      {incident.urgency === 'high' ? 'Urgente' : incident.urgency === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(incident.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {incident.status !== 'pending' && (
                        <button
                          onClick={() => updateStatus(incident.id, 'pending')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Pendiente
                        </button>
                      )}
                      {incident.status !== 'in-progress' && (
                        <button
                          onClick={() => updateStatus(incident.id, 'in-progress')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          En Atención
                        </button>
                      )}
                      {incident.status !== 'resolved' && (
                        <button
                          onClick={() => updateStatus(incident.id, 'resolved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </RoleGuard>
  )
}


