import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, getQuery, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')

    const query = getQuery(event)
    const estado = typeof query.estado === 'string' ? query.estado : undefined
    const all = typeof query.all === 'string' ? query.all : undefined

    try {
        const data = await $fetch(`${config.backendBaseUrl}/api/solicitudes-credito`, {
            method: 'GET',
            query: {
                ...(estado ? { estado } : {}),
                ...(all ? { all } : {})
            },
            headers: authorization ? { Authorization: authorization } : undefined
        })

        return data
    } catch (e: any) {
        setResponseStatus(event, 502)
        return {
            error: e?.data?.error || e?.message || 'Error conectando con backend'
        }
    }
})
