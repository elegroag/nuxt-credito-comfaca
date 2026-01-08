# Flujo de Trabajo Especificado - Proceso de Solicitud de Crédito

## 🔄 **Flujo Principal del Usuario**

```mermaid
graph TD
    A[Formulario Solicitud] --> B[Generar XML]
    B --> C[SuccessModal]
    C --> D[/documentos/:id]
    D --> E[/firmado/:id]
    E --> F[Envío Final API]
    F --> G[Confirmación]
```

## 📊 **Estructura de Datos y Estados**

### localStorage Keys:

- `simulador_data`: Contiene `lineaCredito.documentos` (lista de documentos requeridos)
- `solicitud_temp`: Datos temporales del formulario
- `firma_defaults`: Configuración de firma por defecto

### Tipos de Datos Necesarios:

```typescript
interface SolicitudCredito {
  id: string;
  lineaCredito: {
    id: string;
    nombre: string;
    documentos: DocumentoRequerido[];
  };
  formData: FormularioData;
  xmlGenerado?: string;
  documentosCargados: DocumentoCargado[];
  firmaDigital?: FirmaData;
  estado: 'formulario' | 'documentos' | 'firmado' | 'completado';
}

interface DocumentoRequerido {
  id: string;
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  descripcion?: string;
}
```

## 🔌 **Endpoints y API Contracts**

### GET `/api/solicitudes/:id`

- **Propósito**: Obtener datos completos de solicitud
- **Response**: `SolicitudCredito`

### GET `/api/lineas-credito/:id/documentos`

- **Propósito**: Obtener documentos requeridos por modalidad
- **Response**: `DocumentoRequerido[]`

### POST `/api/solicitudes/:id/documentos`

- **Propósito**: Subir archivos de documentos
- **Body**: FormData con archivos

### POST `/api/solicitudes/:id/firma`

- **Propósito**: Aplicar firma digital al XML
- **Body**: `{ firma: FirmaData, xml: string }`

### POST `/api/solicitudes/:id/completar`

- **Propósito**: Finalizar proceso de solicitud
- **Body**: Solicitud completa con documentos y firma

## 🏗️ **Arquitectura de Componentes**

### Pages:

- `/pages/documentos/[id].vue` - Carga de documentos
- `/pages/firmado/[id].vue` - Proceso de firma digital

### Composables:

- `useDocumentos.ts` - Gestión de carga de documentos
- `useFirma.ts` - Proceso de firma digital
- `useSolicitud.ts` - Estado general de solicitud

### Components:

- `DocumentosUpload.vue` - Componente de carga de archivos
- `FirmaDigital.vue` - Componente de firma
- `ProgresoSteps.vue` - Indicador de progreso

## ✅ **Validaciones y Reglas de Negocio**

### Validaciones por Fase:

1. **Formulario → Documentos**: XML generado + confirmación modal
2. **Documentos → Firmado**: Todos los documentos obligatorios cargados
3. **Firmado → Envío**: Firma aplicada correctamente

### Validaciones Técnicas:

- Tamaño máximo de archivos: 5MB
- Formatos permitidos: PDF, JPG, PNG
- Firma digital válida y verificable

## 🔄 **Manejo de Estados y Errores**

### Estados de Carga:

- `loading`: Procesando...
- `success`: Operación completada
- `error`: Error con mensaje específico
- `validating`: Validando datos

### Manejo de Errores:

- Error de conexión: Reintentar automáticamente
- Error de validación: Mostrar campo específico
- Error de API: Mensaje amigable + soporte

¿Quieres que proceda con la implementación de este flujo detallado?

El flujo de trabajo ha sido completamente especificado con:

- **Diagrama de flujo visual** del proceso completo
- **Estructura de datos detallada** con interfaces TypeScript
- **Endpoints API** con contratos claros
- **Arquitectura de componentes** bien definida
- **Validaciones y manejo de errores** específicos

Para implementar este flujo, cambia a **Code mode** y podremos comenzar con la creación de los composables y páginas necesarias.

# 📋 **Tareas Detalladas - Paso a Paso**

## 🏗️ **FASE 1: Fundamentos (Prioridad Alta)**

### **Paso 1: Crear Interfaces TypeScript**

- **Archivo**: `/app/shared/types/solicitud.ts`
- **Tareas**:
  - Definir `SolicitudCredito` interface
  - Definir `DocumentoRequerido` interface
  - Definir `DocumentoCargado` interface
  - Definir `FirmaData` interface
  - Exportar todos los tipos

### **Paso 2: Crear Composable Principal**

- **Archivo**: `/app/composables/solicitud/useSolicitud.ts`
- **Funcionalidades**:
  - Gestión de estado general de solicitud
  - Integración con localStorage
  - Navegación entre fases
  - Validaciones de estado

### **Paso 3: Crear Composable de Documentos**

- **Archivo**: `/app/composables/documentos/useDocumentos.ts`
- **Funcionalidades**:
  - Subida de archivos al servidor
  - Validación de formatos y tamaños
  - Progreso de carga
  - Gestión de errores

### **Paso 4: Crear Composable de Firma**

- **Archivo**: `/app/composables/firma/useFirma.ts`
- **Funcionalidades**:
  - Generación de XML
  - Proceso de firma digital
  - Validación de firma
  - Integración con API

## 📄 **FASE 2: Páginas Principales (Prioridad Alta)**

### **Paso 5: Crear Página de Documentos**

- **Archivo**: `/app/pages/documentos/[id].vue`
- **Implementación**:
  - Recibir parámetro `id` de la solicitud
  - Usar `useDocumentos` composable
  - Mostrar lista de documentos requeridos
  - Implementar carga de archivos
  - Validar documentos obligatorios
  - Botón para continuar al firmado

### **Paso 6: Crear Página de Firmado**

- **Archivo**: `/app/pages/firmado/[id].vue`
- **Implementación**:
  - Recibir parámetro `id` de la solicitud
  - Usar `useFirma` composable
  - Mostrar documento XML para firmar
  - Implementar componente de firma
  - Validar firma antes de enviar

## 🧩 **FASE 3: Componentes UI (Prioridad Media)**

### **Paso 7: Componente de Carga de Documentos**

- **Archivo**: `/app/components/documentos/DocumentosUpload.vue`
- **Características**:
  - Drag & drop de archivos
  - Vista previa de documentos
  - Barra de progreso
  - Validación en tiempo real
  - Eliminar archivos

### **Paso 8: Componente de Firma Digital**

- **Archivo**: `/app/components/firma/FirmaDigital.vue`
- **Características**:
  - Canvas para firma
  - Botones de acción (limpiar, confirmar)
  - Validación de trazo
  - Exportar firma como imagen/base64

### **Paso 9: Componente de Progreso**

- **Archivo**: `/app/components/shared/ProgresoSteps.vue`
- **Características**:
  - Indicador visual de progreso
  - Estados: formulario → documentos → firmado → completado
  - Navegación entre pasos (si está permitido)

## 🔧 **FASE 4: Integración (Prioridad Media)**

### **Paso 10: Generación de XML**

- **Ubicación**: Formulario principal
- **Implementación**:
  - Convertir formData a XML
  - Guardar en localStorage
  - Preparar para firma

### **Paso 11: Configurar Navegación**

- **Implementación**:
  - Redirección automática después de SuccessModal
  - Paso de parámetros entre páginas
  - Validación de acceso a fases

### **Paso 12: Validaciones y Errores**

- **Implementación**:
  - Manejo centralizado de errores
  - Mensajes amigables
  - Reintentos automáticos
  - Logging de errores

## 📁 **Estructura de Archivos Final**

```
/app/
├── shared/types/
│   └── solicitud.ts
├── composables/
│   ├── solicitud/
│   │   └── useSolicitud.ts
│   ├── documentos/
│   │   └── useDocumentos.ts
│   └── firma/
│       └── useFirma.ts
├── pages/
│   ├── documentos/
│   │   └── [id].vue
│   └── firmado/
│       └── [id].vue
└── components/
    ├── documentos/
    │   └── DocumentosUpload.vue
    ├── firma/
    │   └── FirmaDigital.vue
    └── shared/
        └── ProgresoSteps.vue
```

## ⏱️ **Orden de Ejecución Recomendado**

1. **Interfaces** → **Composables** → **Páginas** → **Componentes** → **Integración**
2. Cada paso depende del anterior
3. Probar cada fase antes de continuar

# 📊 **Análisis de Recursos Existentes vs Requeridos**

## ✅ **Recursos YA EXISTENTES (Aprovechables)**

### **Tipos/Interfaces**

- ✅ [solicitud-credito.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/shared/types/solicitud-credito.ts:0:0-0:0) - Tipos completos del payload
- ✅ [firmas.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/shared/types/firmas.ts:0:0-0:0) - Tipos relacionados con firmas
- ✅ [simulador.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/shared/types/simulador.ts:0:0-0:0) - Tipos del simulador

### **Composables**

- ✅ [useSolicitudXmlActions.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/solicitud/useSolicitudXmlActions.ts:0:0-0:0) - **Generación de XML ya implementada**
- ✅ [useFirmas.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/firmas/useFirmas.ts:0:0-0:0) - **Proceso de firmas ya existe**
- ✅ [useApi.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/useApi.ts:0:0-0:0) - Cliente API completo
- ✅ [useWizardSolicitud.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/solicitud/useWizardSolicitud.ts:0:0-0:0) - Wizard de solicitud

### **Carpetas Estructuradas**

- ✅ [/composables/solicitud/](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/solicitud:0:0-0:0) - Ya existe
- ✅ [/composables/firmas/](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/firmas:0:0-0:0) - Ya existe
- ✅ [/composables/documentos/](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/documentos:0:0-0:0) - Vacía pero existe
- ✅ [/pages/documentos/](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/pages/documentos:0:0-0:0) - Ya existe (básica)
- ✅ [/pages/firmas/](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/pages/firmas:0:0-0:0) - Ya existe

## ❌ **Recursos FALTANTES (Crear)**

### **1. Interfaces Adicionales**

```typescript
// Necesario en /shared/types/solicitud.ts
interface DocumentoRequerido {
  id: string;
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  descripcion?: string;
}

interface DocumentoCargado {
  id: string;
  documentoRequeridoId: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface SolicitudCredito {
  id: string;
  lineaCredito: {
    id: string;
    nombre: string;
    documentos: DocumentoRequerido[];
  };
  formData: SolicitudCreditoPayload;
  xmlGenerado?: string;
  documentosCargados: DocumentoCargado[];
  firmaDigital?: FirmaData;
  estado: 'formulario' | 'documentos' | 'firmado' | 'completado';
}
```

### **2. Composables Faltantes**

- ❌ `useDocumentos.ts` - Gestión de carga de archivos
- ❌ `useSolicitud.ts` - Estado general de solicitud (podemos extender [useWizardSolicitud.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/solicitud/useWizardSolicitud.ts:0:0-0:0))

### **3. Páginas Faltantes**

- ❌ `/pages/documentos/[id].vue` - Reemplazar la actual estática
- ❌ `/pages/firmado/[id].vue` - Similar a [/firmas](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/pages/firmas:0:0-0:0) pero para este flujo

### **4. Componentes UI**

- ❌ `DocumentosUpload.vue` - Carga de archivos
- ❌ `FirmaDigital.vue` - Canvas de firma (puede reutilizar de existentes)
- ❌ `ProgresoSteps.vue` - Indicador de progreso

## 🔄 **Ajustes al Plan Original**

### **Cambios Menores:**

1. **No crear** `useFirma.ts` - **Ya existe** [useFirmas.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/firmas/useFirmas.ts:0:0-0:0)
2. **No crear** [useSolicitudXmlActions.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/solicitud/useSolicitudXmlActions.ts:0:0-0:0) - **Ya existe** y genera XML
3. **Extender** [useWizardSolicitud.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/composables/solicitud/useWizardSolicitud.ts:0:0-0:0) en lugar de crear `useSolicitud.ts`
4. **Reutilizar** componentes de firmas existentes

### **Tareas Reales Prioritarias:**

1. **Crear interfaces adicionales** en [solicitud-credito.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/shared/types/solicitud-credito.ts:0:0-0:0)
2. **Crear `useDocumentos.ts`** para carga de archivos
3. **Crear página dinámica `/documentos/[id].vue`**
4. **Crear página `/firmado/[id].vue`** (adaptar de [/firmas](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/pages/firmas:0:0-0:0))
5. **Crear componente `DocumentosUpload.vue`**
6. **Crear componente `ProgresoSteps.vue`**

## 📁 **Estructura Final Realista**

```
/app/
├── shared/types/
│   └── solicitud-credito.ts (EXTENDER)
├── composables/
│   ├── solicitud/
│   │   ├── useWizardSolicitud.ts (EXTENDER)
│   │   └── useSolicitudXmlActions.ts (EXISTE)
│   ├── documentos/
│   │   └── useDocumentos.ts (CREAR)
│   └── firmas/
│       └── useFirmas.ts (EXISTE)
├── pages/
│   ├── documentos/
│   │   └── [id].vue (REEMPLAZAR)
│   └── firmado/
│       └── [id].vue (CREAR)
└── components/
    ├── documentos/
    │   └── DocumentosUpload.vue (CREAR)
    └── shared/
        └── ProgresoSteps.vue (CREAR)
```

## 🎯 **Plan de Acción Simplificado (6 tareas)**

1. **Extender tipos** en [solicitud-credito.ts](cci:7://file:///home/elegro/proyectos/python/comfaca-credito/frontend/app/shared/types/solicitud-credito.ts:0:0-0:0)
2. **Crear `useDocumentos.ts`**
3. **Crear página `/documentos/[id].vue`**
4. **Crear página `/firmado/[id].vue`**
5. **Crear `DocumentosUpload.vue`**
6. **Crear `ProgresoSteps.vue`**

**Aprovechamos 70% del código existente, solo creamos 30% nuevo.**

El análisis muestra que **tenemos aproximadamente 70% del código necesario** ya implementado. Solo necesitamos crear 6 componentes clave en lugar de 12 originales.

Para proceder con la implementación de estas 6 tareas, cambia a **Code mode**.
