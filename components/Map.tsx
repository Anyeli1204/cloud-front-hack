'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Incident } from '@/types'

// Fix para los iconos de Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface MapProps {
  incidents?: Incident[]
}

// Helper para obtener coordenadas desde la ubicación del incidente
// En producción, esto vendría de una base de datos de ubicaciones
const getLocationCoordinates = (incident: Incident): { lat: number; lng: number } => {
  // Por ahora, coordenadas por defecto del campus UTEC
  // En producción, esto debería buscar en una tabla de ubicaciones
  return { lat: -12.0464, lng: -77.0428 }
}

export default function Map({ incidents = [] }: MapProps) {
  // Coordenadas del campus UTEC (ejemplo)
  const defaultCenter: [number, number] = [-12.0464, -77.0428]

  const getMarkerColor = (priority: string) => {
    switch (priority) {
      case 'CRÍTICO':
      case 'ALTA':
        return 'red'
      case 'MEDIA':
        return 'orange'
      default:
        return 'green'
    }
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((incident) => {
          const coords = getLocationCoordinates(incident)
          return (
            <Marker
              key={incident.UUID}
              position={[coords.lat, coords.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-1">{incident.Title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{incident.Description}</p>
                  <p className="text-xs text-gray-500 mb-2">{incident.LocationTower} - {incident.LocationFloor} - {incident.LocationArea}</p>
                  <div className="flex items-center gap-2">
                    <span className={`badge badge-${incident.Status === 'PENDIENTE' ? 'pending' : incident.Status === 'EN_ATENCION' ? 'in-progress' : 'resolved'}`}>
                      {incident.Status === 'PENDIENTE' ? 'Pendiente' : incident.Status === 'EN_ATENCION' ? 'En Atención' : 'Resuelto'}
                    </span>
                    <span className={`badge badge-${incident.Priority === 'CRÍTICO' || incident.Priority === 'ALTA' ? 'urgent' : 'pending'}`}>
                      {incident.Priority}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

