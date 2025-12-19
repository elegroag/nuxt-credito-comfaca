import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, getQuery, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const q = typeof query.q === 'string' ? query.q : ''

    const authorization = getHeader(event, 'authorization')

    try {
        const data = await $fetch(`${config.backendBaseUrl}/api/activos/xml`, {
            method: 'GET',
            query: { q },
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
