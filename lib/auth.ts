'use client'

// Utilidades para manejar el token de autenticación

export interface TokenData {
  token: string
  expiresAt: string
}

export const saveToken = (tokenData: TokenData) => {
  localStorage.setItem('auth_token', tokenData.token)
  localStorage.setItem('auth_token_expires', tokenData.expiresAt)
}

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const getTokenExpiresAt = (): string | null => {
  return localStorage.getItem('auth_token_expires')
}

export const isTokenValid = (): boolean => {
  const token = getToken()
  const expiresAt = getTokenExpiresAt()
  
  if (!token || !expiresAt) {
    return false
  }
  
  // Verificar si el token ha expirado localmente primero
  const expirationDate = new Date(expiresAt)
  const now = new Date()
  
  if (expirationDate <= now) {
    return false
  }
  
  // Si aún no ha expirado localmente, retornar true
  // La validación completa se hace con validateToken()
  return true
}

// Función para validar el token con el backend
export const validateToken = async (): Promise<boolean> => {
  const token = getToken()
  
  if (!token) {
    return false
  }

  // Verificar primero localmente
  if (!isTokenValid()) {
    return false
  }

  try {
    const validateUrl = process.env.NEXT_PUBLIC_LAMBDA_TOKEN_VALIDATE_URL || 'https://x5muvrglac.execute-api.us-east-1.amazonaws.com/token/validate'
    
    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error al validar token:', error)
    // En caso de error, confiar en la validación local
    return isTokenValid()
  }
}

export const clearToken = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_token_expires')
}

export const getAuthHeaders = (): HeadersInit => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

// Función helper para hacer peticiones autenticadas
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

