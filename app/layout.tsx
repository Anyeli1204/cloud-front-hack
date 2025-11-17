'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import WebSocketConnector from '@/components/WebSocketConnector'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Set page title and description in client component
  useEffect(() => {
    document.title = 'Alerta UTEC - Sistema de Reportes de Incidentes'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Plataforma para reportar y gestionar incidentes en el campus UTEC')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Plataforma para reportar y gestionar incidentes en el campus UTEC'
      document.getElementsByTagName('head')[0].appendChild(meta)
    }
  }, [])

  return (
    <html lang="es">
      <body className={inter.className}>
        <UserProvider>
          <WebSocketConnector />
          {children}
        </UserProvider>
      </body>
    </html>
  )
}

