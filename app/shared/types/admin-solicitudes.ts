/**
 * Tipos para la administración de solicitudes
 */

export interface FiltrosSolicitudes {
    // Filtros de fecha
    fecha_desde?: string
    fecha_hasta?: string
    rango_fechas?: {
        inicio: string
        fin: string
    }

    // Filtros de usuario
    numero_documento?: string
    nombre_usuario?: string
    owner_username?: string

    // Filtros de estado
    estados?: string[]

    // Filtros de solicitud
    numero_solicitud?: string
    monto_minimo?: number
    monto_maximo?: number

    // Paginación
    skip?: number
    limit?: number

    // Ordenamiento
    ordenar_por?: string
    orden_direccion?: 'asc' | 'desc'
}

export interface SolicitudAdmin {
    id: string
    created_at: string
    updated_at: string
    estado: string
    payload: {
        solicitante: {
            email: string
            nombres_apellidos: string
            numero_identificacion: string
            telefono_movil: string
            tipo_identificacion: string
        }
        solicitud: {
            valor_solicitado?: number
            valor_solicitud?: number
            plazo_meses?: number
            numero_solicitud?: string
            tipcre?: string
            codigo_cre?: string
            detalle_modalidad?: string
        }
    }
    xml_filename?: string
    owner_username: string
    timeline: Array<{
        estado: string
        fecha: string
        detalle?: string
        descripcion?: string
    }>
    documentos?: Array<{
        id: string
        documento_requerido_id: string
        nombre_original: string
        saved_filename: string
        tipo_mime: string
        tamano_bytes: number
        created_at: string
    }>
    // Campos adicionales que vienen del backend
    monto_solicitado?: number
    plazo_meses?: number
    numero_solicitud?: string
    solicitante?: {
        email: string
        nombres_apellidos: string
        numero_identificacion: string
        telefono_movil: string
        tipo_identificacion: string
    }
}

export interface SolicitudesResponse {
    data: {
        collection: SolicitudAdmin[]
        pagination: {
            page: number
            page_size: number
            total: number
            total_pages: number
            has_next: boolean
            has_prev: boolean
        }
    }
    message: string
    success: boolean
    timestamp: string
}

export interface EstadosCount {
    [estado: string]: number
}

export interface OpcionesFiltro {
    estados: string[]
    usuarios: Array<{
        username: string
        nombre_completo: string
        numero_documento: string
    }>
}

// Opciones de ordenamiento
export const OPCIONES_ORDENAMIENTO = [
    { value: 'created_at', label: 'Fecha de creación' },
    { value: 'updated_at', label: 'Fecha de actualización' },
    { value: 'monto_solicitado', label: 'Monto solicitado' },
    { value: 'numero_solicitud', label: 'Número de solicitud' },
    { value: 'owner_username', label: 'Usuario' },
    { value: 'estado', label: 'Estado' }
] as const

// Estados disponibles
export const ESTADOS_DISPONIBLES = [
    'Postulado',
    'Documentos cargados',
    'Firmado',
    'Aprobado',
    'Rechazado',
    'Enviado (pendiente de aprobación)',
    'Enviado',
    'Desiste'
] as const


export interface UseSolicitudesBuscar {
    loading: Readonly<Ref<boolean>>
    error: Readonly<Ref<string | null>>
    solicitudes: Readonly<ComputedRef<SolicitudAdmin[]>>
    totalItems: Readonly<Ref<number>>
    tieneFiltrosActivos: ComputedRef<boolean>
    aplicarFiltros: (nuevosFiltros: Partial<FiltrosSolicitudes>) => void
    limpiarFiltros: () => void
}