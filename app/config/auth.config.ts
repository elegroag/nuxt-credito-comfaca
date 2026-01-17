/**
 * Configuración de autenticación
 * Define las páginas y rutas que requieren o excluyen autenticación
 */

// Páginas que no requieren autenticación
export const AUTH_EXCLUDED_PAGES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
] as const

// Páginas que siempre requieren autenticación
export const AUTH_REQUIRED_PAGES = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
    '/verify-email'
] as const

// Patrones de rutas que requieren autenticación
export const AUTH_REQUIRED_PATTERNS = [
    '/dashboard/',
    '/profile/',
    '/settings/',
    '/admin/',
    '/solicitudes/',
    '/creditos/',
    '/documentos/'
] as const

// Función para verificar si una ruta debe excluirse de autenticación
export const isAuthExcludedRoute = (path: string): boolean => {
    return AUTH_EXCLUDED_PAGES.some(page => path.startsWith(page))
}

// Función para verificar si una ruta requiere autenticación
export const isAuthRequiredRoute = (path: string): boolean => {
    return AUTH_REQUIRED_PAGES.some(page => path.startsWith(page)) ||
        AUTH_REQUIRED_PATTERNS.some(pattern => path.startsWith(pattern))
}

// Función principal para determinar si se debe aplicar middleware de auth
export const shouldApplyAuthMiddleware = (path: string): boolean => {
    // Si está en página excluida, no aplicar
    if (isAuthExcludedRoute(path)) {
        return false
    }

    // Si está en página requerida o coincide con patrón, aplicar
    if (isAuthRequiredRoute(path)) {
        return true
    }

    // Por defecto, aplicar middleware a todas las páginas excepto las excluidas
    return true
}
