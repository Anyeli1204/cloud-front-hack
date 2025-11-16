# Guía de Configuración - Alerta UTEC

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📋 Checklist de Configuración

- [x] Estructura del proyecto Next.js creada
- [x] Configuración de TypeScript
- [x] Configuración de Tailwind CSS
- [x] Componentes principales creados
- [x] Páginas principales implementadas
- [ ] Instalar dependencias (`npm install`)
- [ ] Configurar variables de entorno (si es necesario)
- [ ] Conectar con API backend
- [ ] Configurar WebSockets para tiempo real

## 🎨 Características Implementadas

### Páginas
- ✅ Landing page con diseño moderno
- ✅ Login y Registro con validación
- ✅ Dashboard con estadísticas y mapa
- ✅ Formulario de reporte de incidentes
- ✅ Vista de mis reportes con filtros
- ✅ Panel administrativo completo
- ✅ Detalle de incidente individual

### Componentes
- ✅ Navbar responsivo con menú móvil
- ✅ Mapa interactivo con Leaflet
- ✅ Cards y badges reutilizables
- ✅ Formularios con validación

### Estilos
- ✅ Diseño responsivo (móvil, tablet, desktop)
- ✅ Paleta de colores UTEC
- ✅ Animaciones y transiciones suaves
- ✅ Componentes accesibles

## 🔧 Configuración Adicional

### Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Personalización

Los colores de UTEC están en `tailwind.config.js`. Puedes modificarlos según necesites.

## 📱 Pruebas

Una vez instaladas las dependencias, puedes probar:

1. **Landing Page**: `/`
2. **Login**: `/login`
3. **Registro**: `/register`
4. **Dashboard**: `/dashboard`
5. **Reportar**: `/report`
6. **Mis Reportes**: `/my-reports`
7. **Admin**: `/admin`

## 🐛 Solución de Problemas

### Error: Cannot find module
**Solución**: Ejecuta `npm install` para instalar todas las dependencias.

### Error: Leaflet map not showing
**Solución**: Asegúrate de que los estilos de Leaflet estén importados correctamente.

### Error: TypeScript errors
**Solución**: Los errores desaparecerán después de instalar las dependencias con `npm install`.

## 📚 Próximos Pasos

1. Instalar dependencias: `npm install`
2. Ejecutar en desarrollo: `npm run dev`
3. Conectar con tu API backend
4. Implementar autenticación real
5. Configurar WebSockets para tiempo real
6. Agregar tests

---

¡Listo para comenzar! 🎉


