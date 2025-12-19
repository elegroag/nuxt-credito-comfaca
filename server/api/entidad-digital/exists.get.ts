import type { H3Event } from 'h3'
import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const tipo_identificacion = typeof query.tipo_identificacion === 'string' ? query.tipo_identificacion : ''
    const numero_identificacion = typeof query.numero_identificacion === 'string' ? query.numero_identificacion : ''

    try {
        const data = await $fetch(`${config.backendBaseUrl}/api/entidad-digital/exists`, {
            method: 'GET',
            query: { tipo_identificacion, numero_identificacion }
        })

        return data
    } catch (e: any) {
        setResponseStatus(event, 502)
        return {
            error: e?.data?.error || e?.message || 'Error conectando con backend'
        }
    }
})
