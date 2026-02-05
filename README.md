# Sistema de Gestión de Créditos - Frontend NUXT 4

Aplicación cliente desacoplada desarrollada en NUXT 4 para la gestión integral de solicitudes de crédito, con interfaz moderna y componentes reutilizables.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación](#instalación)
- [Arquitectura](#arquitectura)
- [Páginas Disponibles](#páginas-disponibles)
- [Composables](#composables)
- [Componentes](#componentes)
- [Configuración](#configuración)
- [Roles y Permisos](#roles-y-permisos)
- [Integración con API](#integración-con-api)
- [Estados de Solicitud](#estados-de-solicitud)
- [Funcionalidades Deprecadas](#funcionalidades-deprecadas)
- [Pendientes](#pendientes)
- [Mejoras y Recomendaciones](#mejoras-y-recomendaciones)

---

## Descripción General

Aplicación frontend desarrollada en NUXT 4 (Vue 3) que permite a trabajadores postular a créditos, a asesores gestionar solicitudes, y a administradores aprobar y procesar las mismas. La aplicación se conecta a una API backend Laravel para todas las operaciones de datos.

### Características Principales

- ✅ Interfaz moderna con TailwindCSS y DaisyUI
- ✅ Gestión de solicitudes de crédito
- ✅ Sistema de autenticación con JWT
- ✅ Simulador de créditos
- ✅ Gestión de firmantes
- ✅ Firma digital integrada
- ✅ Dashboard personalizado por rol
- ✅ Gestión de documentos
- ✅ Timeline de seguimiento
- ✅ Modo responsive

---

## Requisitos del Sistema

- Node.js 18.x o superior
- PNPM 8.x o superior
- Navegador moderno (Chrome, Firefox, Safari, Edge)

---

## Instalación

```bash
# Navegar al directorio del proyecto
cd frontend-nuxt

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env-example .env

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Vista previa de producción
pnpm preview
```

### Configuración de Variables de Entorno

```env
# API Backend Laravel
NUXT_PUBLIC_API_URL=http://localhost:8000/api
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Entorno
NUXT_PUBLIC_ENV=development

# URL del frontend (para redirecciones)
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Arquitectura

```
frontend-nuxt/
├── app/
│   ├── assets/              # Recursos estáticos (CSS, imágenes)
│   ├── components/          # Componentes Vue reutilizables
│   │   ├── admin/          # Componentes específicos de admin
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── common/         # Componentes comunes
│   │   ├── layout/         # Componentes de layout
│   │   ├── simulador/      # Componentes del simulador
│   │   ├── solicitud/      # Componentes de solicitudes
│   │   └── ui/             # Componentes UI base
│   ├── composables/         # Composables (lógica reutilizable)
│   │   ├── admin/          # Composables de admin
│   │   ├── auth/           # Composables de autenticación
│   │   ├── entidad/        # Composables de entidad digital
│   │   ├── firmas/         # Composables de firmas
│   │   ├── simulador/      # Composables de simulador
│   │   └── solicitud/      # Composables de solicitudes
│   ├── layouts/             # Layouts de página
│   │   ├── admin.vue       # Layout para administrador
│   │   ├── auth.vue        # Layout para autenticación
│   │   └── default.vue     # Layout predeterminado
│   ├── middleware/          # Middleware de navegación
│   │   └── auth.ts         # Verificación de autenticación
│   ├── pages/               # Páginas de la aplicación
│   │   ├── (auth)/         # Páginas de autenticación
│   │   ├── admin/          # Páginas de administración
│   │   ├── solicitud/      # Páginas de solicitudes
│   │   ├── simulador/      # Páginas de simulador
│   │   └── ...
│   ├── plugins/             # Plugins de NUXT
│   ├── shared/              # Código compartido
│   │   ├── api/            # Clientes API
│   │   ├── constants/      # Constantes
│   │   ├── interfaces/     # Interfaces TypeScript
│   │   └── types/          # Tipos TypeScript
│   └── utils/               # Utilidades
├── nuxt.config.ts          # Configuración de NUXT
├── tailwind.config.js      # Configuración de TailwindCSS
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias del proyecto
```

---

## Páginas Disponibles

### 🔐 Autenticación (`/pages/(auth)`)

#### `/login` - Inicio de Sesión
- Autenticación con email/usuario y contraseña
- Validación de credenciales
- Almacenamiento de token JWT en localStorage
- Redirección según rol de usuario

#### `/registro` - Registro de Usuario
- Formulario de registro para nuevos usuarios
- Validación de datos
- Creación de cuenta trabajador

#### `/adviser` - Login Asesor
- Login específico para asesores
- Verificación de rol adviser

#### `/verify` - Verificación
- Verificación de email o código
- Validación de cuenta

---

### 👤 Usuario Trabajador

#### `/inicio` - Dashboard Principal
- Resumen de solicitudes del usuario
- Estadísticas personales
- Acciones rápidas
- Notificaciones

#### `/solicitud` - Nueva Solicitud
- Formulario completo de solicitud de crédito
- Validación de datos en tiempo real
- Integración con API externa para datos laborales
- Carga de documentos

#### `/solicitud/edit` - Editar Solicitud
- Modificación de solicitud existente
- Solo para solicitudes en estado POSTULADO

#### `/solicitud/documentos/[id]` - Documentos
- Gestión de documentos de la solicitud
- Carga de documentos adicionales
- Visualización de documentos requeridos

#### `/solicitud/resumen/[id]` - Resumen
- Vista de resumen de solicitud enviada
- Detalles completos de la solicitud
- Estado actual

#### `/solicitud/special_thanks/[id]` - Agradecimiento
- Página de confirmación post-envío
- Instrucciones de próximos pasos

#### `/solicitudes/[id]` - Detalle de Solicitud
- Vista detallada de una solicitud específica
- Timeline de estados
- Documentos adjuntos

#### `/simulador` - Simulador de Créditos
- Cálculo de cuotas y tasas
- Diferentes tipos de crédito
- Simulación sin compromiso

#### `/simulador/[tipcre]` - Simulador por Tipo
- Simulación específica por tipo de crédito
- Parámetros personalizados

#### `/simulador/lineas-credito` - Líneas de Crédito
- Catálogo de líneas de crédito disponibles
- Requisitos por línea

#### `/perfil` - Perfil de Usuario
- Información personal
- Actualización de datos
- Cambio de contraseña

#### `/documentos` - Mis Documentos
- Repositorio de documentos del usuario
- Historial de documentos

#### `/firmas` - Mis Firmas
- Documentos pendientes de firma
- Historial de firmas

#### `/firmado/[id]` - Documento Firmado
- Vista de documento firmado
- Descarga de documento

#### `/firmas-share/[token]` - Firma Compartida
- Acceso a documento para firma mediante token
- Firma sin necesidad de login

---

### 🔧 Administrador/Asesor (`/pages/admin`)

#### `/admin/solicitudes` - Gestión de Solicitudes
- Lista completa de solicitudes
- Filtros por estado, fecha, usuario
- Paginación
- Estadísticas en tiempo real

#### `/admin/solicitudes/show/[id]` - Detalle Solicitud
- Vista completa de solicitud
- Timeline de estados
- Información del solicitante
- Documentos adjuntos
- Firmantes registrados

#### `/admin/solicitudes/edit/[id]` - Editar Solicitud
- Modificación de datos de solicitud
- Actualización de estado
- Gestión de firmantes

#### `/admin/solicitudes/acciones/[id]` - Acciones
- Aprobar/Rechazar solicitud
- Agregar comentarios
- Cambiar estado
- Asignar firmantes
- Enviar a firma digital

#### `/admin/solicitudes/buscar` - Búsqueda Avanzada
- Búsqueda por múltiples criterios
- Filtros avanzados
- Exportación de resultados

#### `/admin/convenios` - Empresas Convenio
- Lista de empresas con convenio
- Gestión de convenios

#### `/admin/convenios/create` - Crear Convenio
- Registro de nueva empresa convenio
- Formulario completo

#### `/admin/convenios/edit/[id]` - Editar Convenio
- Modificación de datos de empresa
- Actualización de estado

#### `/admin/convenios/show/[id]` - Detalle Convenio
- Vista completa de empresa convenio
- Historial de solicitudes asociadas

#### `/admin/users` - Gestión de Usuarios
- Lista de usuarios del sistema
- Filtros por rol
- Activar/desactivar usuarios

#### `/admin/users/create` - Crear Usuario
- Registro de nuevo usuario
- Asignación de rol

#### `/admin/users/edit/[id]` - Editar Usuario
- Modificación de datos de usuario
- Cambio de rol
- Restablecer contraseña

#### `/admin/users/show/[id]` - Detalle Usuario
- Vista completa de usuario
- Historial de actividad
- Solicitudes asociadas

#### `/admin/firmas` - Seguimiento de Firmas
- Dashboard de firmas digitales
- Estado de documentos en proceso
- Firmas completadas/pendientes

#### `/admin/firmas/firmado/[id]` - Detalle Firma
- Vista de documento firmado
- Información de firmantes
- Fechas de firma
- Descarga de documento

---

### 🏛️ Entidad Digital

#### `/entidad-digital` - Verificación Identidad
- Proceso de verificación de identidad digital
- Captura de documentos
- Validación biométrica

#### `/entidad-digital/confirmation` - Confirmación
- Confirmación de verificación completada
- Resultados de validación

---

### 🗑️ Deprecadas

#### `/xml-extract` - Extracción XML
- **DEPRECADO**: Extracción de datos desde XML
- Reemplazado por integración directa con API

---

## Composables

Los composables encapsulan la lógica de negocio reutilizable siguiendo el patrón de Composition API de Vue 3.

### 🔐 Autenticación (`/composables/auth`)

#### `useLogin.ts`
```typescript
const { login, loading, error } = useLogin()
```
- Manejo de inicio de sesión
- Almacenamiento de token
- Redirección post-login

#### `useRegistro.ts`
- Registro de nuevos usuarios
- Validación de formulario
- Creación de cuenta

#### `useAdviser.ts`
- Login específico para asesores
- Validación de permisos adviser

#### `useAuthValidation.ts`
- Validación de sesión activa
- Verificación de token
- Manejo de expiración

#### `useVerify.ts`
- Verificación de email/código
- Activación de cuenta

---

### 📋 Solicitudes (`/composables/solicitud`)

#### `useSolicitud.ts`
```typescript
const { 
  crearSolicitud, 
  obtenerSolicitud, 
  actualizarSolicitud,
  loading, 
  error 
} = useSolicitud()
```
- CRUD de solicitudes
- Validación de datos
- Integración con API

#### `useResumenSolicitud.ts`
- Vista de resumen de solicitud
- Cálculos de cuotas
- Información consolidada

#### `useDocumentosSolicitud.ts`
- Gestión de documentos adjuntos
- Carga de archivos
- Validación de tipos de archivo

#### `useConvenioValidation.ts`
- Validación de empresa en convenio
- Consulta a API externa
- Verificación de NIT

#### `useConyugeComposable.ts`
- Gestión de datos del cónyuge
- Validación de información
- Integración con API externa

#### `useFirmadoDigital.ts`
- Proceso de firma digital
- Integración con FirmaPlus
- Seguimiento de firmas

#### `usePDFGenerator.ts`
- Generación de documentos PDF
- Plantillas dinámicas
- Descarga de archivos

#### `useSolicitudXmlActions.ts`
- **DEPRECADO**: Acciones relacionadas con XML
- Mantener solo para compatibilidad

---

### 🎯 Simulador (`/composables/simulador`)

#### `useSimulador.ts`
```typescript
const { 
  simular, 
  resultado, 
  loading 
} = useSimulador()
```
- Simulación de crédito
- Cálculo de cuotas
- Tasas de interés

#### `useSimuladorCore.ts`
- Lógica central de simulación
- Fórmulas financieras
- Validaciones

#### `useSimuladorConConvenio.ts`
- Simulación con descuento por convenio
- Tasas preferenciales
- Validación de empresa

#### `useSimuladorWithLinea.ts`
- Simulación por línea de crédito específica
- Parámetros predefinidos
- Restricciones por línea

---

### 👨‍💼 Administración (`/composables/admin`)

#### `useAdminSolicitudes.ts`
```typescript
const { 
  solicitudes, 
  obtenerSolicitudes,
  filtrarPorEstado,
  estadisticas,
  loading 
} = useAdminSolicitudes()
```
- Listado de solicitudes
- Filtros y búsqueda
- Estadísticas

#### `useShowSolicitud.ts`
- Detalle completo de solicitud
- Timeline de estados
- Información consolidada

#### `useAccionesSolicitud.ts`
- Aprobar/rechazar solicitud
- Cambiar estado
- Agregar comentarios
- Asignar firmantes

#### `useSolicitudesBuscar.ts`
- Búsqueda avanzada
- Múltiples criterios
- Exportación de resultados

#### `useAdminConvenios.ts`
- Gestión de empresas convenio
- CRUD completo
- Listados y filtros

#### `useAdminUsers.ts`
- Gestión de usuarios
- CRUD completo
- Asignación de roles

#### `useCreateUser.ts`
- Creación de nuevos usuarios
- Validación de formulario
- Asignación de permisos

#### `useEditUser.ts`
- Edición de usuarios existentes
- Actualización de roles
- Cambio de contraseña

#### `useShowUser.ts`
- Detalle de usuario
- Historial de actividad
- Solicitudes asociadas

#### `useSeguimientoFirmas.ts`
- Dashboard de firmas digitales
- Estado de documentos
- Seguimiento en tiempo real

---

### ✍️ Firmas (`/composables/firmas`)

#### `useFirmas.ts`
- Listado de documentos para firma
- Estado de firmas
- Notificaciones

#### `useFirmaCompartir.ts`
- Generar token de firma compartida
- Envío de invitaciones
- Gestión de permisos

#### `useFirmaShareToken.ts`
- Validación de token de firma
- Acceso a documento
- Proceso de firma sin login

---

### 📄 Documentos (`/composables/entidad`)

#### `useDocumentosPostulante.ts`
- Gestión de documentos del postulante
- Validación de documentos requeridos
- Carga y descarga

#### `useEntidadDigital.ts`
- Proceso de verificación de identidad
- Integración con proveedor
- Captura de documentos

#### `useEntidadDigitalConfirmation.ts`
- Confirmación de verificación
- Resultados de validación
- Seguimiento de estado

#### `useEntidadDigitalQr.ts`
- Generación de QR para verificación
- Validación de código
- Redirección

---

### 🎨 Layout (`/composables/layout`)

#### `useDashboardLayout.ts`
- Gestión de sidebar
- Navegación dinámica por rol
- Estado de UI

---

### 📊 Otros

#### `useInicio.ts`
- Dashboard principal
- Estadísticas personalizadas
- Acciones rápidas

#### `usePerfil.ts`
- Gestión de perfil de usuario
- Actualización de datos
- Cambio de contraseña

#### `useFirmado.ts`
- Vista de documento firmado
- Descarga de archivo
- Verificación de firmas

---

## Componentes

### 🎨 UI Base (`/components/ui`)

Componentes reutilizables basados en Radix Vue y TailwindCSS:

- `Button` - Botones con variantes
- `Input` - Campos de entrada
- `Select` - Selectores
- `Dialog` - Modales
- `Card` - Tarjetas
- `Badge` - Etiquetas
- `Alert` - Alertas
- `Table` - Tablas de datos
- `Tabs` - Pestañas
- `Form` - Formularios

### 📋 Solicitud (`/components/solicitud`)

- `SolicitudForm` - Formulario principal de solicitud
- `SolicitudCard` - Tarjeta de solicitud
- `SolicitudTimeline` - Línea de tiempo de estados
- `SolicitudDocumentos` - Gestión de documentos
- `SolicitudFirmantes` - Lista de firmantes
- `SolicitudResumen` - Resumen de solicitud

### 👨‍💼 Admin (`/components/admin`)

- `SolicitudesList` - Lista de solicitudes
- `SolicitudDetail` - Detalle de solicitud
- `EstadoSelector` - Selector de estados
- `FirmantesManager` - Gestor de firmantes
- `ConveniosList` - Lista de convenios
- `UsersList` - Lista de usuarios

### 🔐 Auth (`/components/auth`)

- `LoginForm` - Formulario de login
- `RegisterForm` - Formulario de registro
- `PasswordReset` - Recuperar contraseña

### 📊 Common (`/components/common`)

- `LoadingSpinner` - Indicador de carga
- `ErrorMessage` - Mensaje de error
- `SuccessMessage` - Mensaje de éxito
- `EmptyState` - Estado vacío
- `Pagination` - Paginación

### 🎯 Simulador (`/components/simulador`)

- `SimuladorForm` - Formulario de simulación
- `ResultadoSimulacion` - Resultado de simulación
- `LineaCreditoCard` - Tarjeta de línea de crédito
- `AmortizacionTable` - Tabla de amortización

---

## Configuración

### TailwindCSS + DaisyUI

El proyecto usa TailwindCSS como framework de utilidades y DaisyUI para componentes predefinidos.

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#...',
        secondary: '#...',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light', 'dark'],
  },
}
```

### TypeScript

El proyecto está completamente tipado con TypeScript para mayor seguridad y autocompletado.

```typescript
// Ejemplo de interface
interface Solicitud {
  numero_solicitud: string
  estado: EstadoSolicitud
  monto_solicitado: number
  plazo_meses: number
  solicitante: Solicitante
  firmantes: Firmante[]
}
```

---

## Roles y Permisos

### 👤 user_trabajador (Trabajador)

**Acceso a:**
- ✅ Dashboard personal (`/inicio`)
- ✅ Crear solicitud (`/solicitud`)
- ✅ Ver mis solicitudes (`/solicitudes/[id]`)
- ✅ Simulador de créditos (`/simulador`)
- ✅ Mis documentos (`/documentos`)
- ✅ Mis firmas (`/firmas`)
- ✅ Perfil (`/perfil`)

**Restricciones:**
- ❌ No acceso a `/admin/*`
- ❌ No puede aprobar solicitudes
- ❌ No puede gestionar otros usuarios

### 🎓 user_adviser (Asesor)

**Acceso a:**
- ✅ Todo lo del trabajador
- ✅ Ver todas las solicitudes (`/admin/solicitudes`)
- ✅ Editar solicitudes (`/admin/solicitudes/edit/[id]`)
- ✅ Gestionar firmantes
- ✅ Búsqueda avanzada (`/admin/solicitudes/buscar`)
- ✅ Seguimiento de firmas (`/admin/firmas`)

**Restricciones:**
- ❌ No puede aprobar definitivamente
- ❌ No puede gestionar usuarios
- ❌ No puede gestionar convenios

### 👑 administrator (Administrador)

**Acceso completo:**
- ✅ Todas las funcionalidades de adviser
- ✅ Aprobar/rechazar solicitudes (`/admin/solicitudes/acciones/[id]`)
- ✅ Gestionar usuarios (`/admin/users`)
- ✅ Gestionar convenios (`/admin/convenios`)
- ✅ Configuración del sistema
- ✅ Estadísticas completas

---

## Integración con API

### Cliente HTTP

El proyecto usa `$fetch` de NUXT para realizar peticiones HTTP a la API Laravel.

```typescript
// Ejemplo de uso en composable
const obtenerSolicitudes = async () => {
  try {
    const response = await $fetch('/solicitudes-credito', {
      baseURL: config.public.apiUrl,
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    return response
  } catch (error) {
    console.error('Error al obtener solicitudes:', error)
    throw error
  }
}
```

### Endpoints Principales

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar token

#### Solicitudes
- `GET /solicitudes-credito` - Listar solicitudes
- `POST /solicitudes-credito` - Crear solicitud
- `GET /solicitudes-credito/{id}` - Obtener solicitud
- `PUT /solicitudes-credito/{id}` - Actualizar solicitud
- `PUT /solicitudes-credito/{id}/estado` - Cambiar estado
- `GET /solicitudes-credito/estadisticas/por-estado` - Estadísticas

#### Firmantes
- `GET /solicitudes-credito/{id}/firmantes` - Listar firmantes
- `POST /solicitudes-credito/{id}/firmantes` - Agregar firmante
- `DELETE /solicitudes-credito/{id}/firmantes/{orden}` - Eliminar firmante

#### Documentos
- `POST /solicitudes-credito/{id}/generar-pdf` - Generar PDF
- `GET /solicitudes-credito/{id}/pdf/download` - Descargar PDF

#### Firma Digital
- `POST /solicitudes-credito/{id}/enviar-firma` - Enviar a firma

### Manejo de Errores

```typescript
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Token expirado, redirigir a login
    navigateTo('/login')
  } else if (error.status === 403) {
    // Sin permisos
    showError('No tienes permisos para esta acción')
  } else if (error.status === 422) {
    // Errores de validación
    showValidationErrors(error.data.errors)
  } else {
    // Error genérico
    showError('Ocurrió un error inesperado')
  }
}
```

---

## Estados de Solicitud

### Flujo de Estados

```
POSTULADO
    ↓
ENVIADO_VALIDACION
    ↓
DOCUMENTOS_CARGADOS
    ↓
ENVIADO_PENDIENTE_APROBACION
    ↓
APROBADO / RECHAZADO
    ↓
PENDIENTE_FIRMADO
    ↓
FIRMADO
    ↓
DESEMBOLSADO
    ↓
FINALIZADO
```

### Colores por Estado

```typescript
const estadoColors = {
  POSTULADO: 'blue',
  ENVIADO_VALIDACION: 'yellow',
  DOCUMENTOS_CARGADOS: 'purple',
  ENVIADO_PENDIENTE_APROBACION: 'orange',
  APROBADO: 'green',
  RECHAZADO: 'red',
  PENDIENTE_FIRMADO: 'indigo',
  FIRMADO: 'teal',
  DESEMBOLSADO: 'cyan',
  FINALIZADO: 'gray',
  DESISTE: 'red'
}
```

---

## Funcionalidades Deprecadas

### ⚠️ Generación y Procesamiento de XML

**Estado:** DEPRECADO - No usar en nuevas implementaciones

**Componentes/Composables obsoletos:**
- `useSolicitudXmlActions.ts` - Acciones de XML
- Página `/xml-extract` - Extracción de XML

**Razón de deprecación:**
El proceso de generación y firma XML fue reemplazado por:
- ✅ Integración directa con API Laravel
- ✅ Firma digital PDF mediante FirmaPlus
- ✅ Mejor experiencia de usuario
- ✅ Mayor confiabilidad

**Migración:**
```typescript
// Antiguo (DEPRECADO)
const { generarXml, firmarXml } = useSolicitudXmlActions()
await generarXml(solicitudId)
await firmarXml(xmlData)

// Nuevo (RECOMENDADO)
const { generarPDF, enviarAFirma } = useFirmadoDigital()
await generarPDF(solicitudId)
await enviarAFirma(solicitudId, firmantes)
```

---

## Pendientes

### Alta Prioridad

- [ ] **Sistema de notificaciones en tiempo real**
  - Implementar WebSockets/Socket.io
  - Notificaciones push
  - Badge de notificaciones no leídas
  - Panel de notificaciones
  - Notificaciones de cambio de estado
  - Alertas de documentos pendientes

- [ ] **Mejoras en UX de formularios**
  - Guardado automático de borradores
  - Validación en tiempo real mejorada
  - Indicadores de progreso
  - Ayuda contextual
  - Tooltips informativos

- [ ] **Dashboard mejorado**
  - Gráficos interactivos (Chart.js/ApexCharts)
  - Métricas en tiempo real
  - Widgets personalizables
  - Filtros de fecha
  - Exportación de reportes

- [ ] **Gestión de documentos completa**
  - Visor de PDF integrado
  - Anotaciones en documentos
  - Versionamiento
  - Comparación de versiones
  - Firma de documentos individuales

### Media Prioridad

- [ ] **Optimización de rendimiento**
  - Lazy loading de componentes
  - Virtual scrolling en listas largas
  - Optimización de imágenes
  - Cache de datos
  - Reducción de bundle size

- [ ] **Modo offline**
  - Service Worker
  - Cache de datos críticos
  - Sincronización al reconectar
  - Indicador de estado de conexión

- [ ] **Accesibilidad (A11y)**
  - Navegación por teclado completa
  - Lectores de pantalla
  - Contraste de colores
  - Textos alternativos
  - ARIA labels

- [ ] **Tests automatizados**
  - Unit tests con Vitest
  - Component tests con Vue Test Utils
  - E2E tests con Playwright
  - Coverage mínimo del 80%

### Baja Prioridad

- [ ] **Internacionalización (i18n)**
  - Soporte multi-idioma
  - Español, Inglés
  - Formatos de fecha/moneda por región

- [ ] **Temas personalizables**
  - Modo oscuro/claro
  - Temas por empresa
  - Personalización de colores

- [ ] **PWA (Progressive Web App)**
  - Instalable
  - Trabajar offline
  - Notificaciones push nativas

- [ ] **Documentación de componentes**
  - Storybook
  - Documentación de props
  - Ejemplos de uso
  - Playground interactivo

---

## Mejoras y Recomendaciones

### 🎨 UI/UX

1. **Consistencia en diseño**
   - Usar sistema de diseño consistente
   - Componentes UI reutilizables
   - Espaciado y tipografía estandarizados
   - Paleta de colores definida

2. **Feedback visual**
   - Loading states claros
   - Mensajes de éxito/error consistentes
   - Animaciones sutiles
   - Estados de interacción (hover, active, focus)

3. **Responsive design mejorado**
   - Mobile-first approach
   - Breakpoints bien definidos
   - Touch-friendly en móviles
   - Optimización de formularios móviles

### ⚡ Performance

1. **Code splitting**
   ```typescript
   // Importación dinámica de componentes pesados
   const HeavyComponent = defineAsyncComponent(() =>
     import('~/components/HeavyComponent.vue')
   )
   ```

2. **Optimización de imágenes**
   - Usar NUXT Image
   - Lazy loading
   - WebP format
   - Responsive images

3. **Estado global optimizado**
   - Usar Pinia para estado global
   - Evitar prop drilling
   - Cache de datos frecuentes
   - Computed properties eficientes

### 🔒 Seguridad

1. **Validación de datos**
   - Validación client-side y server-side
   - Sanitización de inputs
   - XSS prevention
   - CSRF protection

2. **Manejo de tokens**
   ```typescript
   // Refrescar token automáticamente
   const refreshToken = async () => {
     try {
       const newToken = await $fetch('/auth/refresh', {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${refreshTokenValue}`
         }
       })
       setToken(newToken.access_token)
     } catch (error) {
       // Logout si falla el refresh
       await logout()
     }
   }
   ```

3. **HTTPS obligatorio en producción**
   - Redirección automática a HTTPS
   - Secure cookies
   - Content Security Policy headers

### 🏗️ Arquitectura

1. **Separación de responsabilidades**
   - Componentes solo UI
   - Lógica en composables
   - Estado en Pinia stores
   - API calls en servicios separados

2. **Tipos TypeScript estrictos**
   ```typescript
   // interfaces/Solicitud.ts
   export interface Solicitud {
     numero_solicitud: string
     estado: EstadoSolicitud
     monto_solicitado: number
     plazo_meses: number
     solicitante: Solicitante
     firmantes: Firmante[]
     created_at: string
     updated_at: string
   }
   
   export type EstadoSolicitud = 
     | 'POSTULADO'
     | 'ENVIADO_VALIDACION'
     | 'APROBADO'
     | 'RECHAZADO'
     // ...
   ```

3. **Composables reutilizables**
   ```typescript
   // composables/useApi.ts
   export const useApi = <T>() => {
     const loading = ref(false)
     const error = ref<Error | null>(null)
     const data = ref<T | null>(null)

     const execute = async (apiCall: () => Promise<T>) => {
       loading.value = true
       error.value = null
       try {
         data.value = await apiCall()
       } catch (e) {
         error.value = e as Error
       } finally {
         loading.value = false
       }
     }

     return { loading, error, data, execute }
   }
   ```

### 📊 Monitoreo

1. **Error tracking**
   - Integración con Sentry
   - Log de errores estructurado
   - Reportes automáticos
   - Alertas en tiempo real

2. **Analytics**
   - Google Analytics / Matomo
   - Eventos personalizados
   - Funnel de conversión
   - Métricas de uso

3. **Performance monitoring**
   - Core Web Vitals
   - Tiempo de carga de páginas
   - Métricas de API
   - Bundle size tracking

### 🧪 Testing

1. **Estrategia de testing**
   ```typescript
   // tests/components/SolicitudCard.spec.ts
   import { mount } from '@vue/test-utils'
   import SolicitudCard from '~/components/solicitud/SolicitudCard.vue'

   describe('SolicitudCard', () => {
     it('muestra el número de solicitud', () => {
       const wrapper = mount(SolicitudCard, {
         props: {
           solicitud: {
             numero_solicitud: 'SOL-2024-001',
             // ...
           }
         }
       })
       expect(wrapper.text()).toContain('SOL-2024-001')
     })
   })
   ```

2. **E2E tests críticos**
   - Flujo completo de creación de solicitud
   - Login y autenticación
   - Firma de documentos
   - Aprobación de solicitudes

### 📝 Documentación

1. **README por módulo**
   - Documentar componentes complejos
   - Ejemplos de uso
   - Props y eventos
   - Casos de uso

2. **Guía de estilo de código**
   - Naming conventions
   - Estructura de archivos
   - Best practices
   - Code review checklist

3. **Diagramas de flujo**
   - Flujo de autenticación
   - Proceso de solicitud
   - Integración con API
   - Estados de solicitud

---

## Scripts Disponibles

```json
{
  "dev": "nuxt dev",
  "build": "nuxt build",
  "preview": "nuxt preview",
  "generate": "nuxt generate",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "type-check": "nuxt typecheck"
}
```

---

## Tecnologías Utilizadas

- **NUXT 4** - Framework Vue.js
- **Vue 3** - Framework progresivo de JavaScript
- **TypeScript** - Superset de JavaScript con tipado estático
- **TailwindCSS** - Framework de utilidades CSS
- **DaisyUI** - Componentes para TailwindCSS
- **Heroicons** - Iconos SVG
- **Radix Vue** - Componentes UI accesibles
- **PNPM** - Gestor de paquetes rápido
- **Vite** - Build tool ultra-rápido

---

## Soporte y Contacto

Para reportar bugs, solicitar features o contribuir al proyecto, contactar al equipo de desarrollo.

## Licencia

[Especificar licencia del proyecto]

---

**Última actualización:** Febrero 2024  
**Versión:** 1.0.0
