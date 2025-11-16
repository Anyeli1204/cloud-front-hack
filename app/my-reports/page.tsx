'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Clock, CheckCircle, Search, Filter, Eye, Edit, X } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Incident } from '@/types'
import { useRouter } from 'next/navigation'

export default function MyReportsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Simulación de datos - aquí iría la llamada a la API
    const mockIncidents: Incident[] = [
      {
        Type: 'Infraestructura y mantenimiento',
        UUID: '1',
        Title: 'Fuga de agua en el baño del segundo piso',
        Description: 'Fuga de agua en el baño del segundo piso',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
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
        Subtype: 'Servicios higiénicos inoperativos',
      },
      {
        Type: 'Luz dañada',
        UUID: '2',
        Title: 'Lámpara fundida en el pasillo principal',
        Description: 'Lámpara fundida en el pasillo principal',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
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
      {
        Type: 'Ascensor fuera de servicio',
        UUID: '3',
        Title: 'Ascensor principal no funciona',
        Description: 'Ascensor principal no funciona',
        ResponsibleArea: ['Infraestructura y mantenimiento'],
        CreatedById: 'user3',
        CreatedByName: 'Carlos López',
        Status: 'RESUELTO',
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
    ]
    setIncidents(mockIncidents)
    setFilteredIncidents(mockIncidents)
  }, [])

  useEffect(() => {
    let filtered = incidents

    if (searchTerm) {
      filtered = filtered.filter(
        (incident) =>
          incident.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.LocationTower.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.LocationFloor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.LocationArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.Description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((incident) => incident.Status === statusFilter.toUpperCase())
    }

    setFilteredIncidents(filtered)
  }, [searchTerm, statusFilter, incidents])

  const handleCancelIncident = async (uuid: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar este incidente?')) {
      // Aquí iría la llamada a la API para cancelar
      setIncidents(incidents.filter((inc) => inc.UUID !== uuid))
      alert('Incidente cancelado exitosamente')
    }
  }

  const getStatusBadge = (status: Incident['Status']) => {
    switch (status) {
      case 'PENDIENTE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><Clock className="h-3 w-3 mr-1" />Pendiente</span>
      case 'EN_ATENCION':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><AlertTriangle className="h-3 w-3 mr-1" />En Atención</span>
      case 'RESUELTO':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resuelto</span>
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: Incident['Priority']) => {
    switch (priority) {
      case 'CRÍTICO':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">CRÍTICO</span>
      case 'ALTA':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">ALTA</span>
      case 'MEDIA':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-white">MEDIA</span>
      case 'BAJO':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">BAJO</span>
      default:
        return null
    }
  }


  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Seguridad': 'bg-red-100 text-red-800',
      'Limpieza': 'bg-blue-100 text-blue-800',
      'Infraestructura y mantenimiento': 'bg-green-100 text-green-800',
      'Laboratorios y talleres': 'bg-purple-100 text-purple-800',
      'TI': 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getDefaultImage = (incident: Incident): string => {
    // Mapeo completo de subtipos a sus imágenes predeterminadas
    const subtypeImageMap: { [key: string]: string } = {
      // Seguridad
      'Convivencia': '/convivencia.jpg',
      'Robos': '/robos.jpeg',
      'Pérdidas': '/perdidas.jpg',
      'Intento de atentar contra la integridad personal': '/intento-integridad.webp',
      'Accidentes': '/accidentes.webp',
      
      // Limpieza
      'Área sucia o desordenada': '/area-sucia.jpeg',
      'Falta de suministros de limpieza': '/falta-insumos.jpg',
      
      // Infraestructura y mantenimiento
      'Servicios higiénicos inoperativos': '/servicios-inoperativos.jpg',
      'Salidas de emergencia': '/salida-emergencia.webp',
      'Mobiliario en mal estado': '/mobiliario-mal-estado.webp',
      'Estructura dañada': '/estructura-danada.png',
      
      // Laboratorios y talleres
      'Máquinas malogradas o fuera de servicio': '/maquinas-malogradas.jpg',
      'Falta de EPP': '/falta-epp.webp',
      'Derrames de sustancias peligrosas': '/derrame-quimico.jpg',
      'Incumplimiento de normas de seguridad': '/incumplimiento-normas.jpg',
      'Incidentes eléctricos': '/incidente-electrico.webp',
      'Acceso no autorizado': '/acceso-no-autorizado.jpg',
      
      // TI
      'Internet caído': '/internet-caido.jpg',
      'Fallas en sistemas institucionales': '/sistemas-fallando.jpg',
      'Equipos en aulas': '/equipos-aulas.jpg',
    }
    
    // Primero intentar buscar por subtipo si existe
    if (incident.Subtype && subtypeImageMap[incident.Subtype]) {
      return subtypeImageMap[incident.Subtype]
    }
    
    // Si no hay subtipo, intentar buscar por título (puede contener el nombre del subtipo)
    if (incident.Title) {
      for (const [subtype, image] of Object.entries(subtypeImageMap)) {
        if (incident.Title.includes(subtype)) {
          return image
        }
      }
    }
    
    // Mapeo de áreas responsables a imágenes predeterminadas (fallback)
    const areaImageMap: { [key: string]: string } = {
      'Seguridad': '/seguridad.png',
      'Limpieza': '/limpieza.jpg',
      'Infraestructura y mantenimiento': '/infraestructura.jpg',
      'Laboratorios y talleres': '/laboratorios.png',
      'Tecnologías de la Información (TI)': '/ti.jpg',
      'TI': '/ti.jpg',
    }
    
    // Buscar imagen por área responsable
    const area = incident.ResponsibleArea?.[0] || ''
    if (areaImageMap[area]) {
      return areaImageMap[area]
    }
    
    // Si no encuentra por área, buscar por tipo
    const typeImageMap: { [key: string]: string } = {
      'Seguridad': '/seguridad.png',
      'Limpieza': '/limpieza.jpg',
      'Infraestructura': '/infraestructura.jpg',
      'Infraestructura y mantenimiento': '/infraestructura.jpg',
      'Laboratorios': '/laboratorios.png',
      'Laboratorios y talleres': '/laboratorios.png',
      'TI': '/ti.jpg',
    }
    
    if (typeImageMap[incident.Type]) {
      return typeImageMap[incident.Type]
    }
    
    // Imagen por defecto si no se encuentra ninguna
    return '/infraestructura.jpg'
  }

  const getIncidentImage = (incident: Incident): string => {
    // Si tiene imágenes subidas por el alumno, usar la primera
    if (incident.Images && incident.Images.length > 0) {
      return incident.Images[0]
    }
    
    // Si no, usar imagen predeterminada según el tipo
    return getDefaultImage(incident)
  }

  return (
    <div className="min-h-screen bg-utec-gray">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reportes</h1>
          <p className="text-gray-600">Gestiona y sigue el estado de tus incidentes reportados</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Reportes</p>
              <p className="text-3xl font-bold text-gray-900">{incidents.length}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-utec-secondary" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">
                {incidents.filter((i) => i.Status === 'PENDIENTE').length}
              </p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">En Atención</p>
              <p className="text-3xl font-bold text-blue-600">
                {incidents.filter((i) => i.Status === 'EN_ATENCION').length}
              </p>
            </div>
            <AlertTriangle className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Resueltos</p>
              <p className="text-3xl font-bold text-green-600">
                {incidents.filter((i) => i.Status === 'RESUELTO').length}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={1.5} />
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary" />
              <input
                type="text"
                placeholder="Buscar por tipo, ubicación o descripción..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-utec-secondary" />
              <select
                className="input-field pl-10"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_ATENCION">En Atención</option>
                <option value="RESUELTO">Resuelto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.length === 0 ? (
            <div className="col-span-2 card text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron reportes</p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <Link 
                key={incident.UUID} 
                href={`/incidents/${incident.UUID}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer block"
              >
                {/* Imagen: primera del alumno o predeterminada */}
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={getIncidentImage(incident)}
                    alt={incident.Title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                        {incident.Title}
                      </h3>
                    </div>
                    <div className="ml-2">
                      {getPriorityBadge(incident.Priority)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.Description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(incident.ResponsibleArea[0] || '')}`}>
                      {incident.ResponsibleArea[0] || 'Sin categoría'}
                    </span>
                    {getStatusBadge(incident.Status)}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {format(new Date(incident.CreatedAt), 'yyyy-MM-dd')}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

