export interface EstadoSolicitudData {
    _id: string;
    activo: boolean;
    color: string;
    descripcion: string;
    id: string;
    nombre: string;
    orden: number;
}

export type EstadoSolicitud = string;

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
