import { computed, useRuntimeConfig, useSession } from '#imports'
import { $fetch } from 'ofetch'

export const useApi = () => {
    const config = useRuntimeConfig()
    const { authHeader } = useSession()

    const baseUrl = computed(() => {
        const raw =
            String((config.public as any)?.backendBaseUrl || '') ||
            String((config as any)?.backendBaseUrl || '') ||
            ''
        return raw.replace(/\/+$/, '')
    })

    const urlFor = (path: string) => {
        const p = path.startsWith('/') ? path : `/${path}`
        return `${baseUrl.value}${p}`
    }

    const postJson = async <T>(
        path: string,
        body: Record<string, any>,
        opts?: {
            auth?: boolean
            headers?: Record<string, string>
        }
    ) => {
        const headers: Record<string, string> = {
            'content-type': 'application/json',
            ...(opts?.headers || {})
        }

        if (opts?.auth) {
            Object.assign(headers, authHeader.value as any)
        }

        return await $fetch<T>(urlFor(path), {
            method: 'POST',
            body: body as any,
            headers
        })
    }

    return {
        baseUrl,
        postJson
    }
}
