import type { Trabajador } from './trabajador'

export type SessionUser = {
    username: string
    roles: string[]
    email: string
    tipo_documento: string
    numero_documento: string
    nombres: string
    apellidos: string
    adviser_number?: string
    trabajador?: Trabajador
}

export type SessionData = {
    accessToken: string
    tokenType: string
    user: SessionUser | null
}
