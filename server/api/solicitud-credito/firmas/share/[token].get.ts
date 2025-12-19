import type { H3Event } from 'h3'
import { defineEventHandler, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const token = String(event.context.params?.token || '')

    try {
        const data = await $fetch(`${config.backendBaseUrl}/api/solicitud-credito/firmas/share/${encodeURIComponent(token)}`, {
            method: 'GET'
        })

        return data
    } catch (e: any) {
        setResponseStatus(event, 502)
        return {
            error: e?.data?.error || e?.message || 'Error conectando con backend'
        }
    }
})
