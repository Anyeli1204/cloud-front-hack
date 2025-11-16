'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { AlertTriangle, ArrowLeft, ArrowRight, Camera, Shield, Sparkles, Wrench, FlaskConical, Monitor, CheckCircle2, X, FileText, Bell } from 'lucide-react'

interface IncidentSubtype {
  name: string
  priority: 'BAJO' | 'MEDIA' | 'ALTA' | 'CRÍTICO'
  image?: string // Imagen opcional para el subtipo
  notifyAreas?: string[] // Solo para referencia interna, no se muestra
}

interface IncidentCategory {
  name: string
  icon: any
  color: string
  image: string
  description: string
  subtypes: IncidentSubtype[]
}

export default function ReportPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubtype, setSelectedSubtype] = useState<IncidentSubtype | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reference: '',
    tower: '',
    floor: '',
    room: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReported, setIsReported] = useState(false)

  const categories: IncidentCategory[] = [
    {
      name: 'Seguridad',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      image: '/seguridad.png',
      description: 'Robos, pérdidas, accidentes y problemas de convivencia.',
      subtypes: [
        {
          name: 'Convivencia',
          priority: 'CRÍTICO',
          image: '/convivencia.jpg',
          notifyAreas: ['Bienestar', 'Servicio médico/Tópico'],
        },
        {
          name: 'Robos',
          priority: 'ALTA',
          image: '/robos.jpeg',
        },
        {
          name: 'Pérdidas',
          priority: 'MEDIA',
          image: '/perdidas.jpg',
        },
        {
          name: 'Intento de atentar contra la integridad personal',
          priority: 'CRÍTICO',
          image: '/intento-integridad.webp',
          notifyAreas: ['Bienestar', 'Servicio médico/Tópico'],
        },
        {
          name: 'Accidentes',
          priority: 'CRÍTICO',
          image: '/accidentes.webp',
          notifyAreas: ['Bienestar', 'Servicio médico/Tópico', 'Infraestructura y mantenimiento'],
        },
      ],
    },
    {
      name: 'Limpieza',
      icon: Sparkles,
      color: 'from-blue-500 to-blue-600',
      image: '/limpieza.jpg',
      description: 'Espacios sucios o falta de insumos de limpieza.',
      subtypes: [
        {
          name: 'Área sucia o desordenada',
          priority: 'MEDIA',
          image: '/area-sucia.jpeg',
        },
        {
          name: 'Falta de suministros de limpieza',
          priority: 'BAJO',
          image: '/falta-insumos.jpg',
        },
      ],
    },
    {
      name: 'Infraestructura y mantenimiento',
      icon: Wrench,
      color: 'from-green-500 to-green-600',
      image: '/infraestructura.jpg',
      description: 'Servicios higiénicos, salidas de emergencia, mobiliario o estructura dañada.',
      subtypes: [
        {
          name: 'Servicios higiénicos inoperativos',
          priority: 'MEDIA',
          image: '/servicios-inoperativos.jpg',
        },
        {
          name: 'Salidas de emergencia',
          priority: 'MEDIA',
          image: '/salida-emergencia.webp',
        },
        {
          name: 'Mobiliario en mal estado',
          priority: 'MEDIA',
          image: '/mobiliario-mal-estado.webp',
        },
        {
          name: 'Estructura dañada',
          priority: 'MEDIA',
          image: '/estructura-danada.png',
        },
      ],
    },
    {
      name: 'Laboratorios y talleres',
      icon: FlaskConical,
      color: 'from-purple-500 to-purple-600',
      image: '/laboratorios.png',
      description: 'Máquinas malogradas, falta de EPP, derrames o incidentes eléctricos.',
      subtypes: [
        {
          name: 'Máquinas malogradas o fuera de servicio',
          priority: 'ALTA',
          image: '/maquinas-malogradas.jpg',
        },
        {
          name: 'Falta de EPP',
          priority: 'BAJO',
          image: '/falta-epp.webp',
        },
        {
          name: 'Derrames de sustancias peligrosas',
          priority: 'CRÍTICO',
          image: '/derrame-quimico.jpg',
        },
        {
          name: 'Incumplimiento de normas de seguridad',
          priority: 'BAJO',
          image: '/incumplimiento-normas.jpg',
        },
        {
          name: 'Incidentes eléctricos',
          priority: 'ALTA',
          image: '/incidente-electrico.webp',
        },
        {
          name: 'Acceso no autorizado',
          priority: 'MEDIA',
          image: '/acceso-no-autorizado.jpg',
        },
      ],
    },
    {
      name: 'TI',
      icon: Monitor,
      color: 'from-orange-500 to-orange-600',
      image: '/ti.jpg',
      description: 'Internet caído, fallas en sistemas o equipos en aulas.',
      subtypes: [
        {
          name: 'Internet caído',
          priority: 'BAJO',
          image: '/internet-caido.jpg',
        },
        {
          name: 'Fallas en sistemas institucionales',
          priority: 'BAJO',
          image: '/sistemas-fallando.jpg',
        },
        {
          name: 'Equipos en aulas',
          priority: 'MEDIA',
          image: '/equipos-aulas.jpg',
        },
      ],
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRÍTICO':
        return 'bg-red-500 text-white'
      case 'ALTA':
        return 'bg-orange-500 text-white'
      case 'MEDIA':
        return 'bg-yellow-500 text-white'
      case 'BAJO':
        return 'bg-green-500 text-white'
      default:
        return 'bg-utec-gray0 text-white'
    }
  }

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setStep(2)
  }

  const handleSubtypeSelect = (subtype: IncidentSubtype) => {
    setSelectedSubtype(subtype)
    setFormData({ ...formData, title: subtype.name })
    setStep(3)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío - aquí iría la llamada a la API
    setTimeout(() => {
      setIsSubmitting(false)
      setIsReported(true)
    }, 1500)
  }

  const currentCategory = categories.find((cat) => cat.name === selectedCategory)

  // Success Screen
  if (isReported) {
    return (
      <div className="min-h-screen bg-utec-gray">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card animate-fade-in text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ¡Incidente Reportado Exitosamente!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Tu incidente ha sido registrado correctamente.
              </p>
              <div className="flex items-center justify-center space-x-2 text-utec-secondary mt-6 mb-8">
                <Bell className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Te notificaremos cuando tu incidente cambie de estado o sea resuelto.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <button
                onClick={() => router.push('/my-reports')}
                className="w-full px-6 py-3 bg-gradient-to-r from-utec-secondary to-utec-primary hover:from-utec-primary hover:to-utec-secondary text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Ver todos los incidentes reportados</span>
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Regresar al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-utec-gray">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-gradient-to-br from-utec-blue to-utec-light text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? <CheckCircle2 className="h-6 w-6" /> : '1'}
              </div>
              <div className={`h-1 w-24 ${step >= 2 ? 'bg-gradient-to-r from-utec-blue to-utec-light' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-gradient-to-br from-utec-blue to-utec-light text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 2 ? <CheckCircle2 className="h-6 w-6" /> : '2'}
              </div>
              <div className={`h-1 w-24 ${step >= 3 ? 'bg-gradient-to-r from-utec-blue to-utec-light' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 3 ? 'bg-gradient-to-br from-utec-blue to-utec-light text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            {step === 1 && (
              <span className="text-sm font-semibold text-utec-secondary">Selecciona el tipo</span>
            )}
            {step === 2 && (
              <span className="text-sm font-semibold text-utec-secondary">
                {selectedCategory || 'Selecciona subtipo'}
              </span>
            )}
            {step === 3 && (
              <span className="text-sm font-semibold text-utec-secondary">Completa información</span>
            )}
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="card animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Reportar Nuevo Incidente</h1>
              <p className="text-sm text-gray-600">Paso 1 de 3: Selecciona el tipo de incidente</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategorySelect(category.name)}
                    className="group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-left flex flex-col"
                    style={{ minHeight: '320px', boxShadow: 'none' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(25, 188, 222, 0.15), 0 10px 10px -5px rgba(25, 188, 222, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Imagen de fondo */}
                    <div className="relative flex-1 min-h-[240px] md:min-h-[280px] lg:min-h-[320px]">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
                      
                      {/* Contenido superior */}
                      <div className="absolute top-4 left-4 right-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg mb-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-white leading-tight drop-shadow-lg" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)' }}>{category.name}</h3>
                      </div>
                      
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    
                    {/* Pie de página con descripción */}
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 h-20 flex items-center justify-center">
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed text-center font-medium">
                        {category.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Subtype Selection */}
        {step === 2 && currentCategory && (
          <div className="card animate-fade-in p-0">
            <div className="mb-6 px-6 pt-6">
              <button
                onClick={() => {
                  setStep(1)
                  setSelectedCategory(null)
                  setSelectedSubtype(null)
                }}
                className="flex items-center text-gray-600 hover:text-utec-blue mb-4 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tipo de Incidente</h1>
              <p className="text-gray-600">Paso 2 de 3: {currentCategory.name}</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 px-6 justify-start" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch', scrollbarColor: '#888 #f1f1f1' }}>
              {currentCategory.subtypes.map((subtype, index) => (
                <button
                  key={index}
                  onClick={() => handleSubtypeSelect(subtype)}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex-shrink-0"
                  style={{ width: '240px', height: '320px' }}
                >
                  {/* Imagen de fondo */}
                  {subtype.image && (
                    <div className="relative w-full h-full">
                      <Image
                        src={subtype.image}
                        alt={subtype.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
                      
                      {/* Título y estado sobre la imagen */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-sm md:text-base font-bold text-white leading-tight drop-shadow-lg mb-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)' }}>
                          {subtype.name}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(subtype.priority)}`}>
                          {subtype.priority}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Details Form */}
        {step === 3 && selectedSubtype && currentCategory && (
          <div className="card animate-fade-in p-0">
            <div className="mb-6 px-6 pt-6">
              <button
                onClick={() => {
                  setStep(2)
                  setSelectedSubtype(null)
                  setFormData({ ...formData, title: '' })
                }}
                className="flex items-center text-gray-600 hover:text-utec-blue mb-4 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalles del Incidente</h1>
              <p className="text-gray-600">Paso 3 de 3: Completa la información</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6">
                {/* Main Form - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Type and Priority Display */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">TIPO</label>
                      <div className="flex items-center space-x-2">
                        {currentCategory.icon && (
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentCategory.color} flex items-center justify-center`}>
                            {(() => {
                              const Icon = currentCategory.icon
                              return <Icon className="h-5 w-5 text-white" />
                            })()}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-900">{currentCategory.name}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">PRIORIDAD</label>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getPriorityColor(selectedSubtype.priority)}`}>
                        {selectedSubtype.priority}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      TÍTULO <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      className="input-field"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título del incidente"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      DESCRIPCIÓN <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={6}
                      className="input-field resize-none"
                      placeholder="Describe qué pasó, dónde y cuándo..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Location Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UBICACIÓN <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        id="tower"
                        type="text"
                        required
                        className="input-field"
                        placeholder="Torre"
                        value={formData.tower}
                        onChange={(e) => setFormData({ ...formData, tower: e.target.value })}
                      />
                      <input
                        id="floor"
                        type="text"
                        required
                        className="input-field"
                        placeholder="Piso"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      />
                      <input
                        id="room"
                        type="text"
                        required
                        className="input-field"
                        placeholder="Sala/Aula"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Reference */}
                  <div>
                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                      REFERENCIA
                    </label>
                    <input
                      id="reference"
                      type="text"
                      className="input-field"
                      placeholder="Ej: #EQ-001, #ROOM-302"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjuntar Foto
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-utec-blue transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="photo-upload"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-utec-blue transition-colors" />
                        <p className="text-xs text-gray-600">Agregar foto</p>
                      </label>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {files.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info Summary */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Resumen del Reporte</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <span className="ml-2 font-semibold text-gray-900">{currentCategory.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Subtipo:</span>
                        <span className="ml-2 font-semibold text-gray-900">{selectedSubtype.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Título:</span>
                        <span className="ml-2 font-semibold text-gray-900">{formData.title || '(sin título)'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {formData.tower && formData.floor && formData.room 
                            ? `${formData.tower} - ${formData.floor} - ${formData.room}`
                            : '(incompleta)'}
                        </span>
                      </div>
                      {formData.reference && (
                        <div>
                          <span className="text-gray-600">Referencia:</span>
                          <span className="ml-2 font-semibold text-gray-900">{formData.reference}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(2)
                        setSelectedSubtype(null)
                        setFormData({ ...formData, title: '' })
                      }}
                      className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
                    >
                      Volver
                    </button>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-utec-secondary to-utec-primary hover:from-utec-primary hover:to-utec-secondary text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm shadow-lg hover:shadow-xl"
                      >
                        <span>{isSubmitting ? 'Enviando...' : 'Reportar Incidente'}</span>
                        {!isSubmitting && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
