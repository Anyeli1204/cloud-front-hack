'use client'

import { formatPeruTime, formatWaitingTime, calculateWaitingMinutes } from '@/lib/dateUtils'

// Componente de prueba para verificar conversión de fechas
export default function DateTestPage() {
  const testDates = [
    '2025-11-17T00:14:23', // UTC - Ejemplo del JSON
    '2025-11-17T05:14:23', // UTC - Equivalente a medianoche en Perú
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Prueba de Conversión de Fechas - Horario Perú
        </h1>
        
        <div className="space-y-6">
          {testDates.map((utcDate, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Fecha de Prueba #{index + 1}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">UTC (Original)</h3>
                  <p className="text-sm bg-gray-100 p-2 rounded font-mono">
                    {utcDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    Como Date: {new Date(utcDate).toString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Perú (UTC-5)</h3>
                  <p className="text-sm bg-green-100 p-2 rounded">
                    <strong>Fecha y Hora:</strong><br />
                    {formatPeruTime(utcDate, { includeTime: true, includeSeconds: true })}
                  </p>
                  <p className="text-sm bg-blue-100 p-2 rounded">
                    <strong>Solo Fecha:</strong><br />
                    {formatPeruTime(utcDate, { includeTime: false })}
                  </p>
                  <p className="text-sm bg-orange-100 p-2 rounded">
                    <strong>Tiempo de Espera:</strong><br />
                    {formatWaitingTime(calculateWaitingMinutes(utcDate))} 
                    ({calculateWaitingMinutes(utcDate)} minutos)
                  </p>
                  <p className="text-sm bg-purple-100 p-2 rounded">
                    <strong>Relativo:</strong><br />
                    {formatPeruTime(utcDate, { format: 'relative' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">
            ℹ️ Información sobre la Conversión
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Perú está en UTC-5 (sin horario de verano)</li>
            <li>• Las fechas del backend vienen en UTC</li>
            <li>• Se convierten automáticamente al horario local de Perú</li>
            <li>• El tiempo de espera se calcula desde la fecha de creación hasta ahora</li>
          </ul>
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">
            🕐 Ejemplo Práctico
          </h3>
          <p className="text-sm text-blue-700">
            Si el servidor registra un incidente a las <code>2025-11-17T00:14:23</code> UTC,
            esto corresponde a las <strong>19:14:23 del 16/11/2025</strong> en horario de Perú.
          </p>
        </div>
      </div>
    </div>
  )
}