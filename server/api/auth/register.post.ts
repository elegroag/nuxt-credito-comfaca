import type { H3Event } from 'h3'
import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const payload = await readBody(event)

    try {
        const data = await $fetch(`${config.backendBaseUrl}/api/auth/register`, {
            method: 'POST',
            body: payload
        })

        return data
    } catch (e: any) {
        const status = Number(e?.statusCode || e?.response?.status || 502)
        setResponseStatus(event, Number.isFinite(status) ? status : 502)

        if (e?.data && typeof e.data === 'object') {
            return e.data
        }

        return {
            error: e?.data?.error || e?.message || 'Error conectando con backend'
        }
    }
})
