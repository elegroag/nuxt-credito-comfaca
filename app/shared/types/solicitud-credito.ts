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

export type TipoVivienda = 'propia' | 'familiar' | 'arrendada'

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
        plazo_meses: number
        moneda: Moneda
        foto_documento?: {
            url: string
        }
    }
    producto_solicitado: {
        tipo: ProductoTipo
        ha_tenido_credito_comfaca: boolean
    }
    solicitante: {
        fecha_vinculacion: string
        tipo_identificacion: TipoIdentificacion
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
    documentoRequeridoId: string;
    filename: string;
    url: string;
    size: number;
    uploadedAt: string;
}

export type EstadoSolicitud = 'formulario' | 'documentos' | 'firmado' | 'completado';

export interface SolicitudCredito {
    id: string;
    lineaCredito: {
        id: string;
        nombre: string;
        documentos: DocumentoRequerido[];
    };
    formData: SolicitudCreditoPayload;
    xmlGenerado?: string;
    xml_filename?: string;
    documentosCargados: DocumentoCargado[];
    firmaDigital?: FirmaData;
    estado: EstadoSolicitud;
}
