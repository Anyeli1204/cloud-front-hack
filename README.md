# Alerta UTEC - Sistema de Reportes de Incidentes

Frontend moderno para el sistema de reportes de incidentes del campus UTEC, desarrollado para el Hackathon Cloud 2024.

## 🚀 Características

- **Dashboard Interactivo**: Vista general con estadísticas y mapa en tiempo real
- **Mapa Interactivo**: Visualización de incidentes usando Leaflet
- **Sistema de Reportes**: Formulario completo para reportar incidentes
- **Seguimiento en Tiempo Real**: Actualizaciones instantáneas del estado de los reportes
- **Panel Administrativo**: Gestión completa de incidentes para personal autorizado
- **Autenticación**: Sistema de login y registro con roles (Estudiante, Personal, Autoridad)
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop
- **UI Moderna**: Diseño limpio y profesional con Tailwind CSS

## 🛠️ Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Estilos modernos y responsivos
- **Leaflet**: Mapas interactivos
- **Lucide React**: Iconos modernos
- **Socket.io Client**: Comunicación en tiempo real (preparado)

## 📦 Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📁 Estructura del Proyecto

```
├── app/
│   ├── dashboard/      # Dashboard principal
│   ├── login/         # Página de inicio de sesión
│   ├── register/      # Página de registro
│   ├── report/        # Formulario de reporte
│   ├── my-reports/    # Mis reportes
│   ├── admin/         # Panel administrativo
│   ├── layout.tsx     # Layout principal
│   ├── page.tsx       # Página de inicio
│   └── globals.css    # Estilos globales
├── components/
│   ├── Map.tsx        # Componente de mapa
│   └── Navbar.tsx     # Barra de navegación
└── public/            # Archivos estáticos
```

## 🎨 Páginas Principales

### Página de Inicio (`/`)
- Landing page con información del sistema
- Características principales
- Enlaces a login y registro

### Login (`/login`)
- Formulario de autenticación
- Validación de campos
- Opción de recordar sesión

### Registro (`/register`)
- Formulario de registro
- Selección de rol (Estudiante, Personal, Autoridad)
- Validación de código para roles especiales

### Dashboard (`/dashboard`)
- Estadísticas generales
- Mapa interactivo con incidentes
- Lista de incidentes recientes
- Acciones rápidas

### Reportar Incidente (`/report`)
- Formulario completo de reporte
- Selección de tipo y ubicación
- Niveles de urgencia
- Subida de archivos adjuntos

### Mis Reportes (`/my-reports`)
- Lista de reportes del usuario
- Filtros y búsqueda
- Estadísticas personales

### Panel Administrativo (`/admin`)
- Gestión de todos los incidentes
- Filtros avanzados
- Actualización de estados
- Exportación de reportes

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Personalización de Colores

Los colores de UTEC están definidos en `tailwind.config.js`:

```js
utec: {
  blue: '#003366',
  light: '#0066cc',
  accent: '#00a8e8',
}
```

## 📱 Responsive Design

El diseño es completamente responsivo y se adapta a:
- 📱 Móviles (< 640px)
- 📱 Tablets (640px - 1024px)
- 💻 Desktop (> 1024px)

## 🚀 Build para Producción

```bash
npm run build
npm start
```

## 📝 Próximos Pasos

- [ ] Integración con API backend
- [ ] Implementación de WebSockets para tiempo real
- [ ] Sistema de notificaciones push
- [ ] Autenticación con JWT
- [ ] Subida de imágenes a S3
- [ ] Tests unitarios y de integración
- [ ] PWA (Progressive Web App)

## 🤝 Contribución

Este proyecto fue desarrollado para el Hackathon Cloud 2024. Las contribuciones son bienvenidas.

## 📄 Licencia

Este proyecto es parte del Hackathon Cloud 2024.

---

Desarrollado con ❤️ para UTEC


