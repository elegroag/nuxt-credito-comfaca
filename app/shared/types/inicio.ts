export type EstadoSolicitud =
    | 'Postulado'
    | 'En validación'
    | 'Aprobado'
    | 'Desembolsado'
    | 'Activo'
    | 'Finalizado'
    | 'Desiste';

export interface SolicitudResumen {
    id: string;
    estado: string;
    numero_solicitud?: string;
    monto_solicitado?: number;
    plazo_meses?: number;
    created_at?: string;
    [key: string]: any;
}

export interface InicioState {
    solicitudes: SolicitudResumen[];
    loadingSolicitudes: boolean;
    solicitudesError: string;
}
