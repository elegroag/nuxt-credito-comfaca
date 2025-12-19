import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, readBody, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const payload = await readBody(event)

    const authorization = getHeader(event, 'authorization')

    try {
        const data = await $fetch(`${config.backendBaseUrl}/api/solicitud-credito/firmas/share`, {
            method: 'POST',
            body: payload,
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
