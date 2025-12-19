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
        setResponseStatus(event, 502)
        return {
            error: e?.data?.error || e?.message || 'Error conectando con backend'
        }
    }
})
