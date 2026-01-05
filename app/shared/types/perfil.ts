export interface Perfil {
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
}

export interface PasswordData {
    password_actual: string;
    nueva_password: string;
    confirmar_password: string;
}
