import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

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

        const query = getQuery(event)

        const tipo_identificacion = typeof query.tipo_identificacion === 'string' ? query.tipo_identificacion : ''
        const numero_identificacion = typeof query.numero_identificacion === 'string' ? query.numero_identificacion : ''

        const response = await $fetch(`${config.backendBaseUrl}/api/auth/perfil/${tipo_identificacion}/${numero_identificacion}`, {
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
