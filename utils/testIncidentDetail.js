// Script de prueba para verificar el endpoint de detalles de incidente
// Ejecutar con: node utils/testIncidentDetail.js

const testIncidentDetail = async () => {
  const baseUrl = 'https://687qtzms2l.execute-api.us-east-1.amazonaws.com/incident'
  const incidentUuid = '5eb4cc85-c34a-11f0-ad6d-8fdfbf723bf1#22' // UUID completo del ejemplo
  
  // En los datos del ejemplo, tenant_id es "Limpieza" y uuid es la cadena completa
  const tenantId = 'Limpieza' // Según los datos del ejemplo
  const uuid = incidentUuid // UUID completo con #22  const url = `${baseUrl}?tenant_id=${encodeURIComponent(tenantId)}&uuid=${encodeURIComponent(uuid)}`
  
  try {
    console.log(`🔍 Probando endpoint: ${url}`)
    console.log(`📋 Parámetros:`)
    console.log(`   - tenant_id: ${tenantId}`)
    console.log(`   - uuid: ${uuid}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Nota: En producción necesitarás un token válido
        // 'Authorization': 'Bearer tu-token-aqui',
      },
    })
    
    console.log(`📊 Status: ${response.status}`)
    console.log(`📊 StatusText: ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Respuesta exitosa:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.log('❌ Error en la respuesta')
      const errorText = await response.text()
      console.log('Error details:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
  }
}

// Ejecutar la prueba si este archivo se ejecuta directamente
if (require.main === module) {
  testIncidentDetail()
}

module.exports = { testIncidentDetail }