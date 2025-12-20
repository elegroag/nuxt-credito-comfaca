import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, readBody, setHeader, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const payload = await readBody(event)

    const authorization = getHeader(event, 'authorization')

    try {
        const resp = await $fetch.raw<string>(`${config.backendBaseUrl}/api/solicitud-credito/xml`, {
            method: 'POST',
            body: payload,
            responseType: 'text' as any,
            headers: authorization ? { Authorization: authorization } : undefined
        })

        const savedFilename = resp.headers.get('x-saved-filename') || resp.headers.get('X-Saved-Filename')
        if (savedFilename) {
            setHeader(event, 'x-saved-filename', savedFilename)
        }

        const solicitudId = resp.headers.get('x-solicitud-id') || resp.headers.get('X-Solicitud-Id')
        if (solicitudId) {
            setHeader(event, 'x-solicitud-id', solicitudId)
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
