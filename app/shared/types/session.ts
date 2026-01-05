export type SessionUser = {
    username: string
    roles: string[]
    email: string
    tipo_documento: string
    numero_documento: string
    nombres: string
    apellidos: string
}

export type SessionData = {
    accessToken: string
    tokenType: string
    user: SessionUser | null
}
