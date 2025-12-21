import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, readBody, setHeader, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event: H3Event) => {
    const config = useRuntimeConfig()
    const payload = await readBody(event)

    const authorization = getHeader(event, 'authorization')

    try {
        const resp = await $fetch.raw<string>(`${config.backendBaseUrl}/api/solicitud-credito/firmas`, {
            method: 'POST',
            body: payload,
            responseType: 'text' as any,
            headers: authorization ? { Authorization: authorization } : undefined
        })

        const savedFilename = resp.headers.get('x-saved-filename') || resp.headers.get('X-Saved-Filename')
        if (savedFilename) {
            setHeader(event, 'x-saved-filename', savedFilename)
        }

        setHeader(event, 'content-type', 'application/xml; charset=utf-8')
        return resp._data
    } catch (e: any) {
        // Propagar el status code del backend cuando exista.
        const status = Number(e?.response?.status || e?.statusCode || 502)
        setResponseStatus(event, Number.isFinite(status) ? status : 502)

        // ofetch puede exponer el body como e.data (ya parseado) o e.message.
        // Aquí normalizamos para que el frontend reciba el detalle real.
        if (e?.data && typeof e.data === 'object') {
            return e.data
        }
        return {
            error: (e?.data?.error as any) || e?.message || 'Error conectando con backend'
        }
    }
})
