// frontend/server/api/auth/perfil.get.ts
export default defineEventHandler(async (event) => {
    try {
        // Obtener el header de autorización
        const authorization = getHeader(event, 'authorization')

        if (!authorization) {
            throw createError({
                statusCode: 401,
                statusMessage: 'No autorizado'
            })
        }

        // Reenviar la solicitud al backend de Python
        const config = useRuntimeConfig()

        const response = await $fetch(`${config.backendBaseUrl}/api/auth/perfil`, {
            method: 'GET',
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/json'
            }
        })

        return response
    } catch (error: any) {
        console.error('Error en endpoint /api/auth/perfil:', error)

        // Si el error ya tiene un statusCode, lo mantenemos
        if (error.statusCode) {
            throw error
        }

        // Para otros errores, devolvemos un error genérico
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al obtener el perfil del usuario'
        })
    }
})
