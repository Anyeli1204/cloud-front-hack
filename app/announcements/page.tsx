'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Globe, Clock, CheckCircle, Eye, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Incident } from '@/types'
import { formatPeruTime } from '@/lib/dateUtils'

export default function AnnouncementsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchGlobalIncidents = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Verificar si hay token
        const token = localStorage.getItem('auth_token')

        
        if (!token) {
          throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.')
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
        
        // Construir URL usando la variable de entorno
        const incidentsUrl = process.env.NEXT_PUBLIC_LAMBDA_INCIDENTS_URL
        if (!incidentsUrl) {
          throw new Error('Variable de entorno NEXT_PUBLIC_LAMBDA_INCIDENTS_URL no configurada')
        }
        
        const url = `${incidentsUrl}?global=true`
        

        
        const response = await fetch(url, {
          method: 'GET',
          headers,
        })



        if (!response.ok) {
          // Si es 401 o 403, el token probablemente está expirado
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('auth_token')
            throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const globalIncidents = await response.json()

        
        // Mapear los datos del backend al formato frontend si es necesario
        const mappedIncidents: Incident[] = globalIncidents.map((incident: any) => ({
          Type: incident.tenant_id || incident.Type || '',
          UUID: incident.uuid || incident.UUID || '',
          Title: incident.Title || '',
          Description: incident.Description || '',
          ResponsibleArea: Array.isArray(incident.ResponsibleArea) 
            ? incident.ResponsibleArea 
            : [incident.ResponsibleArea].filter(Boolean),
          CreatedById: incident.CreatedById || '',
          CreatedByName: incident.CreatedByName || '',
          Status: incident.Status === 'active' ? 'EnAtencion' : 
                  incident.Status === 'pending' ? 'Pendiente' : 
                  incident.Status === 'resolved' ? 'Resuelto' : 
                  incident.Status || 'Pendiente',
          Priority: incident.Priority || 'MEDIA',
          IsGlobal: incident.IsGlobal !== undefined ? incident.IsGlobal : true,
          CreatedAt: incident.CreatedAt || '',
          ExecutingAt: incident.ExecutingAt || undefined,
          ResolvedAt: incident.ResolvedAt || undefined,
          LocationTower: incident.LocationTower || '',
          LocationFloor: incident.LocationFloor || '',
          LocationArea: incident.LocationArea || '',
          Reference: incident.Reference || '',
          AssignedToPersonalId: incident.AssignedToPersonalId || undefined,
          PendienteReasignacion: incident.PendienteReasignacion || false,
          Subtype: incident.Subtype || incident.subType?.toString() || undefined,
          Comment: Array.isArray(incident.Comment) ? incident.Comment : [],
        }))
        
        setIncidents(mappedIncidents)
        setFilteredIncidents(mappedIncidents)
      } catch (error) {
        console.error('Error al cargar incidentes globales:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        
        // Si es un error de autenticación, redirigir al login
        if (errorMessage.includes('sesión ha expirado') || errorMessage.includes('token de autenticación')) {
          setError(`${errorMessage} Serás redirigido al login en 3 segundos...`)
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          setError('Error al cargar los incidentes globales. Por favor, intenta nuevamente.')
        }
        
        setIncidents([])
        setFilteredIncidents([])
      } finally {
        setLoading(false)
      }
    }

    fetchGlobalIncidents()
  }, [])

  // Efecto para filtrar incidentes
  useEffect(() => {
    let filtered = incidents

    if (searchTerm) {
      filtered = filtered.filter(
        (incident) =>
          incident.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.LocationTower.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((incident) => {
        if (statusFilter === 'Pendiente') return incident.Status === 'Pendiente'
        if (statusFilter === 'EnAtencion') return incident.Status === 'EnAtencion'
        if (statusFilter === 'Resuelto') return incident.Status === 'Resuelto'
        return true
      })
    }

    setFilteredIncidents(filtered)
  }, [incidents, searchTerm, statusFilter])

  const getStatusBadge = (status: Incident['Status']) => {
    switch (status) {
      case 'Pendiente':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><Clock className="h-3 w-3 mr-1" />Pendiente</span>
      case 'EnAtencion':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><AlertTriangle className="h-3 w-3 mr-1" />En Atención</span>
      case 'Resuelto':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resuelto</span>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: Incident['Priority']) => {
    switch (priority) {
      case 'CRÍTICO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Crítico</span>
      case 'ALTA':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">Alta</span>
      case 'MEDIA':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Media</span>
      case 'BAJO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Baja</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">No definida</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-utec-gray">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-utec-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando incidentes globales...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-utec-gray">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Globe className="h-8 w-8 text-utec-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Incidentes Globales</h1>
              <p className="text-gray-600">Incidentes que afectan a toda la comunidad universitaria</p>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar incidentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-utec-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-utec-primary focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="EnAtencion">En Atención</option>
                  <option value="Resuelto">Resuelto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Lista de incidentes */}
        {filteredIncidents.length === 0 && !loading && !error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay incidentes globales</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No se encontraron incidentes que coincidan con los filtros aplicados.'
                : 'Actualmente no hay incidentes globales reportados.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <div key={incident.UUID} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.Title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{incident.Description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatPeruTime(incident.CreatedAt, { includeTime: true })}
                        </span>
                        <span>{incident.LocationTower}</span>
                        {incident.LocationArea && <span>{incident.LocationArea}</span>}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(incident.Status)}
                        {getPriorityBadge(incident.Priority)}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Globe className="h-3 w-3 mr-1" />
                          Global
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/incidents/${encodeURIComponent(incident.UUID)}`}
                      className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalles
                    </Link>
                  </div>
                  
                  {incident.ResponsibleArea && incident.ResponsibleArea.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500 mb-2">Área responsable:</p>
                      <div className="flex flex-wrap gap-2">
                        {incident.ResponsibleArea.map((area, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

