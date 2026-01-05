export type RolFirmante =
    | 'solicitante'
    | 'codeudor'
    | 'empleador'
    | 'analista'
    | 'aprobador'
    | 'auditor'
    | 'notario'
    | 'sistema';

export type TipoIdentificacionFirma = 'CC' | 'CE' | 'NIT' | 'PAS';

export interface FirmanteData {
    nombre_apellidos: string;
    tipo_identificacion: TipoIdentificacionFirma;
    numero_identificacion: string;
}

export interface FirmaData {
    rol_firmante: RolFirmante;
    aprobado: boolean;
    firmante: FirmanteData;
    fecha_firma?: string;
}

export interface FirmaRequestPayload {
    firma: FirmaData;
    clave_firma: string;
    save_xml?: boolean;
}

export interface FirmaShareRequest {
    solicitud_filename: string;
    firmas_filename?: string;
}

export interface FirmaShareResponse {
    token: string;
    expires_at: string;
    success: boolean;
    error?: string;
}

export interface FirmaShareTokenInfo {
    solicitud_filename: string;
    firmas_filename?: string;
    created_at: string;
    expires_at: string;
}
