import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body
    
    console.log('[API] 🧹 Solicitud de limpieza WebSocket:', { userId, action })
    
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    }

    // Aquí deberías llamar a tu Lambda/API de backend para limpiar la conexión
    // Por ejemplo, podrías tener un endpoint que elimine por userId en lugar de connectionId
    
    const cleanupUrl = process.env.WEBSOCKET_CLEANUP_URL || process.env.NEXT_PUBLIC_LAMBDA_WEBSOCKET_CLEANUP_URL
    
    if (!cleanupUrl) {
      console.warn('[API] ⚠️ URL de limpieza no configurada')
      return NextResponse.json({ error: 'Servicio de limpieza no disponible' }, { status: 503 })
    }

    // Llamar al servicio de backend para limpiar
    const response = await fetch(cleanupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || ''
      },
      body: JSON.stringify({
        userId,
        action: 'force_cleanup'
      })
    })

    if (response.ok) {
      console.log('[API] ✅ Limpieza exitosa para usuario:', userId)
      return NextResponse.json({ success: true, message: 'Limpieza exitosa' })
    } else {
      console.warn('[API] ⚠️ Error en limpieza del backend:', response.status)
      return NextResponse.json({ error: 'Error en limpieza del backend' }, { status: response.status })
    }

  } catch (error) {
    console.error('[API] ❌ Error en limpieza WebSocket:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}