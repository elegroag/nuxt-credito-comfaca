import type { H3Event } from 'h3'
import { defineEventHandler, readBody, setHeader, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const token = String(event.context.params?.token || '')
    const payload = await readBody(event)

    try {
        const resp = await $fetch.raw<string>(`${config.backendBaseUrl}/api/solicitud-credito/firmas/share/${encodeURIComponent(token)}/firmar`, {
            method: 'POST',
            body: payload,
            responseType: 'text' as any
        })

        const savedFilename = resp.headers.get('x-saved-filename') || resp.headers.get('X-Saved-Filename')
        if (savedFilename) {
            setHeader(event, 'x-saved-filename', savedFilename)
        }

        setHeader(event, 'content-type', 'application/xml; charset=utf-8')
        return resp._data
    } catch (e: any) {
        setResponseStatus(event, 502)
        return {
            error: e?.data?.error || e?.message || 'Error conectando con backend'
        }
    }
})
