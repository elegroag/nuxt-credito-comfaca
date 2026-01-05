import { computed, useState } from '#imports'
import { storage } from '~/composables/useStorage'
import type { SessionData, SessionUser } from '~/shared/types/session'

const STORAGE_KEY_V1 = 'comfaca_credito_session'
const STORAGE_TOKEN_KEY = 'comfaca_credito_access_token'
const STORAGE_TOKEN_TYPE_KEY = 'comfaca_credito_token_type'
const STORAGE_USER_KEY = 'comfaca_credito_user'

const emptySession = (): SessionData => ({
    accessToken: '',
    tokenType: 'bearer',
    user: null
})

export const useSession = () => {
    const session = useState<SessionData>('session', () => emptySession())
    const hydrated = useState<boolean>('session_hydrated', () => false)

    const hydrate = async () => {
        if (!process.client) return
        if (hydrated.value) return
        hydrated.value = true

        try {
            const token = await storage.getItem(STORAGE_TOKEN_KEY)
            const tokenType = await storage.getItem(STORAGE_TOKEN_TYPE_KEY)
            const userRaw = await storage.getItem(STORAGE_USER_KEY)

            if (typeof token === 'string' && token) {
                session.value.accessToken = token
                if (typeof tokenType === 'string' && tokenType) {
                    session.value.tokenType = tokenType
                }

                if (typeof userRaw === 'string' && userRaw) {
                    const u = JSON.parse(userRaw)
                    if (u && typeof u === 'object') {
                        const username = typeof u.username === 'string' ? u.username : ''
                        const roles = Array.isArray(u.roles) ? u.roles.filter((r: any) => typeof r === 'string') : []
                        const email = typeof u.email === 'string' ? u.email : ''
                        const tipo_documento = typeof u.tipo_documento === 'string' ? u.tipo_documento : ''
                        const numero_documento = typeof u.numero_documento === 'string' ? u.numero_documento : ''
                        const nombres = typeof u.nombres === 'string' ? u.nombres : ''
                        const apellidos = typeof u.apellidos === 'string' ? u.apellidos : ''
                        session.value.user = { username, roles, email, tipo_documento, numero_documento, nombres, apellidos }
                    }
                }
                return
            }

            const raw = await storage.getItem(STORAGE_KEY_V1)
            if (!raw) return
            const parsed = JSON.parse(raw)
            if (!parsed || typeof parsed !== 'object') return

            const accessToken = typeof parsed.accessToken === 'string' ? parsed.accessToken : ''
            const ttype = typeof parsed.tokenType === 'string' ? parsed.tokenType : 'bearer'
            let user: SessionUser | null = null
            if (parsed.user && typeof parsed.user === 'object') {
                const username = typeof parsed.user.username === 'string' ? parsed.user.username : ''
                const roles = Array.isArray(parsed.user.roles) ? parsed.user.roles.filter((r: any) => typeof r === 'string') : []
                const email = typeof parsed.user.email === 'string' ? parsed.user.email : ''
                const tipo_documento = typeof parsed.user.tipo_documento === 'string' ? parsed.user.tipo_documento : ''
                const numero_documento = typeof parsed.user.numero_documento === 'string' ? parsed.user.numero_documento : ''
                const nombres = typeof parsed.user.nombres === 'string' ? parsed.user.nombres : ''
                const apellidos = typeof parsed.user.apellidos === 'string' ? parsed.user.apellidos : ''
                user = { username, roles, email, tipo_documento, numero_documento, nombres, apellidos }
            }

            session.value.accessToken = accessToken
            session.value.tokenType = ttype
            session.value.user = user

            if (accessToken) {
                await storage.setItem(STORAGE_TOKEN_KEY, accessToken)
                await storage.setItem(STORAGE_TOKEN_TYPE_KEY, ttype)
                if (user) {
                    await storage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
                } else {
                    await storage.removeItem(STORAGE_USER_KEY)
                }
                await storage.removeItem(STORAGE_KEY_V1)
            }
        } catch {
            // noop
        }
    }

    hydrate()

    const isAuthenticated = computed(() => Boolean(session.value.accessToken))

    const setSession = async (data: SessionData) => {
        session.value = data
        if (!process.client) return

        if (data.accessToken) {
            await storage.setItem(STORAGE_TOKEN_KEY, data.accessToken)
            await storage.setItem(STORAGE_TOKEN_TYPE_KEY, data.tokenType || 'bearer')
        } else {
            await storage.removeItem(STORAGE_TOKEN_KEY)
            await storage.removeItem(STORAGE_TOKEN_TYPE_KEY)
        }

        if (data.user) {
            await storage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user))
        } else {
            await storage.removeItem(STORAGE_USER_KEY)
        }
    }

    const clearSession = async () => {
        session.value = emptySession()
        if (!process.client) return
        await storage.removeItem(STORAGE_TOKEN_KEY)
        await storage.removeItem(STORAGE_TOKEN_TYPE_KEY)
        await storage.removeItem(STORAGE_USER_KEY)
        await storage.removeItem(STORAGE_KEY_V1)
    }

    const authHeader = computed(() => {
        if (!session.value.accessToken) return {}
        const scheme = (session.value.tokenType || 'bearer').trim()
        const normalized = scheme.toLowerCase() === 'bearer' ? 'Bearer' : scheme
        return { Authorization: `${normalized} ${session.value.accessToken}` }
    })

    return {
        session,
        isAuthenticated,
        setSession,
        clearSession,
        authHeader
    }
}
