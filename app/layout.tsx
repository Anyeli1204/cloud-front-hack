import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import WebSocketConnector from '@/components/WebSocketConnector'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alerta UTEC - Sistema de Reportes de Incidentes',
  description: 'Plataforma para reportar y gestionar incidentes en el campus UTEC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

