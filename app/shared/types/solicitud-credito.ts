import type { FirmaData } from './firmas'

export type Moneda = 'COP'

export type RolEnSolicitud = 'solicitante' | 'codeudor'

export type TipoIdentificacion = 'CC' | 'CE'

export type ProductoTipo =
    | 'educacion'
    | 'salud'
    | 'vivienda'
    | 'electrodomesticos'
    | 'productos_hogar'
    | 'vestuario'
    | 'recreacion'
    | 'turismo'

export type Sexo = 'M' | 'F'

export type NivelEducativo =
    | 'primaria'
    | 'bachillerato'
    | 'tecnico'
    | 'universitario'
    | 'posgrado'
    | 'ninguno'

export type TipoVivienda = string | 'N' | 'F' | 'P' | 'A' | 'H'

export type TiempoServicioUnidad = 'meses' | 'anios'

export type TipoBien = 'vivienda' | 'vehiculo'

export interface WizardStep {
    key: string;
    title: string;
    short: string;
}

export interface WizardState {
    step: number;
    successModalOpen: boolean;
}

export interface SolicitudCreditoPayload {
    version: string
    encabezado: {
        fecha_radicado: string
    }
    solicitud: {
        numero_solicitud: string
        numero_comprobante: string
        valor_solicitud: number
        categoria: string
        rol_en_solicitud: RolEnSolicitud
        valor_solicitado: number
        cuota_mensual: number
        plazo_meses: number
        moneda: Moneda
        tipcre?: string
        modxml4?: number
        detalle_modalidad?: string
        foto_documento?: {
            url: string
        }
    }
    linea_credito: {
        auxest: string
        codigo_cap: string
        codigo_cen: string
        codigo_con: string
        codigo_cre: string
        codigo_int: string
        codigo_mor: string
        codigo_ser: string
        detalle_modalidad: string
        estado: string
        estcre: number
        modxml4: number
        numero_cuotas: number
        pagseg: string
        repdcr: string
        tipcre: string
        tipfin: string
    }
    producto_solicitado: {
        tipo: ProductoTipo
        ha_tenido_credito_comfaca: boolean
    }
    solicitante: {
        fecha_vinculacion: string
        tipo_identificacion: string // Cambiado de TipoIdentificacion a string para aceptar '1', '2', etc.
        numero_identificacion: string
        fecha_nacimiento: string
        pais_nacimiento: string
        nombres_apellidos: string
        fecha_expedicion_documento: string
        profesion_ocupacion: string
        sexo: Sexo
        nivel_educativo: NivelEducativo
        barrio_residencia: string
        ciudad_residencia: string
        pais_residencia: string
        telefono_fijo?: string
        telefono_movil: string
        email: string
        tipo_vivienda: TipoVivienda
        vive_con_nucleo_familiar: boolean
        personas_a_cargo: number
        codigo_categoria?: string
        salario?: number
        empresa_nit?: string
        empresa_razon_social?: string,
        estado_civil?: string,
    }
    conyuge?: {
        identificacion: string
        nombres_apellidos: string
        ingresos_laborales: number
        trabaja: boolean
        moneda?: Moneda
        empresa?: {
            nombre: string
            direccion: string
            telefono: string
            email: string
        }
        telefono_movil: string
    }
    informacion_laboral: {
        empresa_razon_social: string
        empresa_nit: string
        empresa_telefono: string
        empresa_direccion: string
        empresa_ciudad: string
        cargo: string
        fecha_ingreso: string
        tipo_contrato: string
        nombramiento_o_pagador: string
        tiempo_servicio: number
        tiempo_servicio_unidad?: TiempoServicioUnidad
    }
    ingresos_descuentos: {
        moneda: Moneda
        salario_basico_mensual: number
        subsidio_transporte: number
        horas_extras: number
        comisiones: number
        otros_ingresos: number
        total_ingresos: number
        salud_pension: number
        libranzas_comfaca: number
        otras_libranzas: number
        judiciales: number
        otras_deducciones: number
        total_descuentos: number
        total_neto_recibido: number
    }
    informacion_economica: {
        moneda: Moneda
        arrendamientos: number
        otros: number
        descripcion: string
        total_gastos: number
        gastos_descripcion: string
        total_activos: number
        total_pasivos: number
    }
    propiedades: Array<{
        tipo_bien: TipoBien
        descripcion: string
        ciudad: string
        matricula_inmobiliaria?: string
        modelo_o_matricula?: string
        valor_comercial: number
    }>
    deudas: Array<{
        acreedor_nombre: string
        concepto: string
        valor_cuota: number
        saldo_obligacion: number
    }>
    referencias: {
        familiares: Array<{
            nombre_apellidos: string
            celular: string
        }>
        personales: Array<{
            nombre_apellidos: string
            celular: string
        }>
    }
}

export interface DocumentoRequerido {
    id: string;
    nombre: string;
    tipo: string;
    obligatorio: boolean;
    descripcion?: string;
}

export interface DocumentoCargado {
    id: string;
    nombre_original: string;
    created_at: string;
    documento_requerido_id?: string; // Para relacionar con el documento requerido (snake_case como en el backend)
    saved_filename?: string;
    tamano_bytes?: number;
    tipo_mime?: string;
}

export type EstadoSolicitud =
    | 'POSTULADO'
    | 'DOCUMENTOS_CARGADOS'
    | 'ENVIADO_VALIDACION'
    | 'PENDIENTE_FIRMADO'
    | 'FIRMADO'
    | 'ENVIADO_PENDIENTE_APROBACION'
    | 'APROBADO'
    | 'DESEMBOLSADO'
    | 'FINALIZADO'
    | 'RECHAZADO'
    | 'DESISTE';

export interface Firmante {
    nombre_completo: string;
    email: string;
    numero_documento: string;
    tipo_documento?: string;
    rol?: string;
    telefono?: string;
}

export interface SolicitanteBasic {
    email: string;
    nombres_apellidos: string;
    numero_identificacion: string;
    telefono_movil: string;
    tipo_identificacion: string;
}

export interface SolicitudCredito {
    id: string;
    created_at: string;
    updated_at: string;
    estado: EstadoSolicitud;
    monto_solicitado: number;
    plazo_meses: number;
    numero_solicitud: string;
    fecha_postulacion: string;
    tasa_interes?: number;
    descripcion_solicitud?: string;
    solicitante: SolicitanteBasic;
    documentos: DocumentoCargado[];
    firmantes?: Firmante[];
    payload: SolicitudCreditoPayload;
    timeline: Array<{
        estado: EstadoSolicitud;
        fecha: string;
        detalle: string;
    }>;
}

export interface SelectOption {
    label: string
    value: string | number
    description?: string
}


export interface CiudadOption {
    codciu: string;
    detciu: string;
}

export interface SolocitanteProps {
    form: any;
    ciudades?: CiudadOption[];
    tiposDocumento?: any[];
    sexos?: any[];
    nivelesEducativos?: any[];
    tiposVivienda?: any[];
    ocupaciones?: any[];
    estadoCiviles?: any[];
}

export interface SolicitudProps {
    form: any
    fechaRadicado: string
}

export interface RevisionProps {
    prettyPayload: string
    xmlText?: string
    savedFilename?: string
    errorMsg?: string
    mensajeProgreso?: string
    loadingPdf?: boolean
    pdfGenerado?: boolean
    pdfFilename?: string | null
    downloadXml: () => void
    descargarPdf?: () => void
}

export interface PropiedadesProps {
    form: any
    addPropiedad: () => void
    removePropiedad: (index: number) => void
    ciudades?: any[]
}

export interface LaboralProps {
    form: any
    ciudades?: any[]
    tiposContrato?: any[]
    ocupaciones?: any[]
}

export interface IngrresosProps {
    form: any
    autocalcularIngresos: () => void
}


export interface DeudasProps {
    form: any
    addDeuda: () => void
    removeDeuda: (index: number) => void
}


export interface ConyugeProps {
    form: any
    toggleConyuge: (checked: boolean) => void
    toggleEmpresaConyuge: (checked: boolean) => void
    loadingConyuge?: boolean
}


export interface WizardProps {
    parametros?: any
    fechaRadicado: string
}

export interface InEstadoSolicitud {
    id: string;
    nombre: string;
    descripcion: string;
    orden: number;
    color: string;
    activo: boolean;
}

export interface AccionData {
    estado: string;
    descripcion?: string;
}