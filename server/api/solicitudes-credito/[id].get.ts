import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')
    const id = String(event.context.params?.id || '')

    try {
        const data = await $fetch(`${config.backendBaseUrl}/api/solicitudes-credito/${encodeURIComponent(id)}`, {
            method: 'GET',
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
