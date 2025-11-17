'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'
import { Incident } from '@/types'

export default function EditIncidentPage() {
  const params = useParams()
  const router = useRouter()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    LocationTower: '',
    LocationFloor: '',
    LocationArea: '',
    Reference: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Simulación de carga de datos - aquí iría la llamada a la API
    setTimeout(() => {
      const mockIncident: Incident = {
        Type: 'Fuga de agua',
        UUID: params.id as string,
        Title: 'Fuga de agua en el baño del segundo piso',
        Description: 'Fuga de agua en el baño del segundo piso. El agua está goteando constantemente desde el techo.',
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
      }
      setIncident(mockIncident)
      setFormData({
        Title: mockIncident.Title,
        Description: mockIncident.Description,
        LocationTower: mockIncident.LocationTower,
        LocationFloor: mockIncident.LocationFloor,
        LocationArea: mockIncident.LocationArea,
        Reference: mockIncident.Reference,
      })
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Aquí iría la llamada a la API para actualizar
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Incidente actualizado exitosamente')
      router.push(`/incidents/${params.id}`)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!incident || incident.Status !== 'Pendiente') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600">No puedes editar este incidente</p>
            <Link href={`/incidents/${params.id}`} className="btn-primary mt-4 inline-block">
              Volver al Detalle
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/incidents/${params.id}`}
          className="flex items-center text-utec-blue hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Detalle
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Incidente</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo (Read-only) */}
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <p className="text-sm font-semibold text-gray-900">{incident.Type}</p>
            </div>

            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                className="input-field"
                value={formData.Title}
                onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Detallada <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={6}
                className="input-field resize-none"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Torre"
                  className="input-field"
                  required
                  value={formData.LocationTower}
                  onChange={(e) => setFormData({ ...formData, LocationTower: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Piso"
                  className="input-field"
                  required
                  value={formData.LocationFloor}
                  onChange={(e) => setFormData({ ...formData, LocationFloor: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Sala/Aula"
                  className="input-field"
                  required
                  value={formData.LocationArea}
                  onChange={(e) => setFormData({ ...formData, LocationArea: e.target.value })}
                />
              </div>
            </div>

            {/* Referencia */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                Referencia Adicional (opcional)
              </label>
              <input
                id="reference"
                type="text"
                className="input-field"
                placeholder="Ej: Pasillo, Fondo del aula, etc."
                value={formData.Reference}
                onChange={(e) => setFormData({ ...formData, Reference: e.target.value })}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6 border-t">
              <Link
                href={`/incidents/${params.id}`}
                className="btn-secondary flex items-center"
              >
                <X className="h-5 w-5 mr-2" />
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


