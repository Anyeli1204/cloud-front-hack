'use client'

'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Globe, Clock, CheckCircle, Eye, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Incident } from '@/types'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Incident[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Simulación de datos - aquí iría la llamada a la API para obtener incidentes globales
    setTimeout(() => {
      const mockAnnouncements: Incident[] = [
        {
          Type: 'Infraestructura y mantenimiento',
          UUID: '3',
          Title: 'Ascensor principal no funciona',
          Description: 'El ascensor principal del edificio está fuera de servicio por mantenimiento. Se espera que esté operativo en las próximas horas.',
          ResponsibleArea: ['Infraestructura y mantenimiento'],
          CreatedById: 'admin1',
          CreatedByName: 'Administración',
          Status: 'EN_ATENCION',
          Priority: 'ALTA',
          IsGlobal: true,
          CreatedAt: '2024-11-15T08:00:00Z',
          ExecutingAt: '2024-11-15T08:30:00Z',
          LocationTower: 'Torre Principal',
          LocationFloor: 'Todos',
          LocationArea: 'Ascensor',
          Reference: 'MANT-2024-001',
          AssignedToPersonalId: 'personal1',
          PendienteReasignacion: false,
          Subtype: 'Mobiliario en mal estado',
          Comment: [
            {
              Date: '2024-11-15T09:00:00Z',
              UserId: 'coord1',
              Role: 'COORDINATOR',
              Message: 'Técnicos en camino',
            },
          ],
        },
        {
          Type: 'Infraestructura y mantenimiento',
          UUID: '4',
          Title: 'Mantenimiento de tuberías - Corte de agua',
          Description: 'Se realizará un corte de agua programado el día de mañana de 8:00 AM a 12:00 PM para mantenimiento de tuberías principales.',
          ResponsibleArea: ['Infraestructura y mantenimiento'],
          CreatedById: 'admin1',
          CreatedByName: 'Administración',
          Status: 'PENDIENTE',
          Priority: 'MEDIA',
          IsGlobal: true,
          CreatedAt: '2024-11-14T16:00:00Z',
          LocationTower: 'Todo el campus',
          LocationFloor: 'Todos',
          LocationArea: 'Sistema de agua',
          Reference: 'MANT-2024-002',
          PendienteReasignacion: false,
          Subtype: 'Servicios higiénicos inoperativos',
          Comment: [],
        },
        {
          Type: 'TI',
          UUID: '5',
          Title: 'Mantenimiento de red WiFi',
          Description: 'El sistema de red WiFi será actualizado esta noche de 11:00 PM a 2:00 AM. Durante este tiempo habrá interrupciones en el servicio.',
          ResponsibleArea: ['Tecnologías de la Información (TI)'],
          CreatedById: 'admin2',
          CreatedByName: 'Departamento de TI',
          Status: 'RESUELTO',
          Priority: 'MEDIA',
          IsGlobal: true,
          CreatedAt: '2024-11-13T10:00:00Z',
          ExecutingAt: '2024-11-13T23:00:00Z',
          ResolvedAt: '2024-11-14T02:00:00Z',
          LocationTower: 'Todo el campus',
          LocationFloor: 'Todos',
          LocationArea: 'Red WiFi',
          Reference: 'TI-2024-015',
          AssignedToPersonalId: 'ti1',
          PendienteReasignacion: false,
          Subtype: 'Internet caído',
          Comment: [],
        },
      ]
      setAnnouncements(mockAnnouncements)
      setFilteredAnnouncements(mockAnnouncements)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = announcements

    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.LocationTower.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((announcement) => announcement.Status === statusFilter.toUpperCase())
    }

    setFilteredAnnouncements(filtered)
  }, [searchTerm, statusFilter, announcements])

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
      'Tecnologías de la Información (TI)': 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getDefaultImage = (incident: Incident): string => {
    const subtypeImageMap: { [key: string]: string } = {
      'Convivencia': '/convivencia.jpg',
      'Robos': '/robos.jpeg',
      'Pérdidas': '/perdidas.jpg',
      'Intento de atentar contra la integridad personal': '/intento-integridad.webp',
      'Accidentes': '/accidentes.webp',
      'Área sucia o desordenada': '/area-sucia.jpeg',
      'Falta de suministros de limpieza': '/falta-insumos.jpg',
      'Servicios higiénicos inoperativos': '/servicios-inoperativos.jpg',
      'Salidas de emergencia': '/salida-emergencia.webp',
      'Mobiliario en mal estado': '/mobiliario-mal-estado.webp',
      'Estructura dañada': '/estructura-danada.png',
      'Máquinas malogradas o fuera de servicio': '/maquinas-malogradas.jpg',
      'Falta de EPP': '/falta-epp.webp',
      'Derrames de sustancias peligrosas': '/derrame-quimico.jpg',
      'Incumplimiento de normas de seguridad': '/incumplimiento-normas.jpg',
      'Incidentes eléctricos': '/incidente-electrico.webp',
      'Acceso no autorizado': '/acceso-no-autorizado.jpg',
      'Internet caído': '/internet-caido.jpg',
      'Fallas en sistemas institucionales': '/sistemas-fallando.jpg',
      'Equipos en aulas': '/equipos-aulas.jpg',
    }
    
    if (incident.Subtype && subtypeImageMap[incident.Subtype]) {
      return subtypeImageMap[incident.Subtype]
    }
    
    if (incident.Title) {
      for (const [subtype, image] of Object.entries(subtypeImageMap)) {
        if (incident.Title.includes(subtype)) {
          return image
        }
      }
    }
    
    const areaImageMap: { [key: string]: string } = {
      'Seguridad': '/seguridad.png',
      'Limpieza': '/limpieza.jpg',
      'Infraestructura y mantenimiento': '/infraestructura.jpg',
      'Laboratorios y talleres': '/laboratorios.png',
      'Tecnologías de la Información (TI)': '/ti.jpg',
      'TI': '/ti.jpg',
    }
    
    const area = incident.ResponsibleArea?.[0] || ''
    if (areaImageMap[area]) {
      return areaImageMap[area]
    }
    
    return '/infraestructura.jpg'
  }

  const getAnnouncementImage = (announcement: Incident): string => {
    if (announcement.Images && announcement.Images.length > 0) {
      return announcement.Images[0]
    }
    return getDefaultImage(announcement)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-utec-gray">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Cargando avisos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-utec-gray">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Avisos Generales</h1>
          <p className="text-gray-600">Información importante sobre incidentes que afectan a todo el campus</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Avisos</p>
              <p className="text-3xl font-bold text-gray-900">{announcements.length}</p>
            </div>
            <Globe className="h-10 w-10 text-utec-secondary" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Activos</p>
              <p className="text-3xl font-bold text-orange-600">
                {announcements.filter((a) => a.Status !== 'RESUELTO').length}
              </p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" strokeWidth={1.5} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Resueltos</p>
              <p className="text-3xl font-bold text-green-600">
                {announcements.filter((a) => a.Status === 'RESUELTO').length}
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
                placeholder="Buscar por título o descripción..."
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

        {/* Two Column Layout */}
        {filteredAnnouncements.length === 0 ? (
          <div className="card text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron avisos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAnnouncements.map((announcement) => (
              <Link
                key={announcement.UUID}
                href={`/incidents/${announcement.UUID}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer block"
              >
                {/* Imagen */}
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={getAnnouncementImage(announcement)}
                    alt={announcement.Title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                        {announcement.Title}
                      </h3>
                    </div>
                    <div className="ml-2">
                      {getPriorityBadge(announcement.Priority)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{announcement.Description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(announcement.ResponsibleArea[0] || '')}`}>
                      {announcement.ResponsibleArea[0] || 'Sin categoría'}
                    </span>
                    {getStatusBadge(announcement.Status)}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      {announcement.LocationTower} • {announcement.LocationFloor}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(announcement.CreatedAt), 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

