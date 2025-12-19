import { computed, useState } from '#imports'

export type SessionUser = {
    username: string
    roles: string[]
}

export type SessionData = {
    accessToken: string
    tokenType: string
    user: SessionUser | null
}

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

    const hydrate = () => {
        if (!process.client) return
        if (hydrated.value) return
        hydrated.value = true

        try {
            const token = localStorage.getItem(STORAGE_TOKEN_KEY)
            const tokenType = localStorage.getItem(STORAGE_TOKEN_TYPE_KEY)
            const userRaw = localStorage.getItem(STORAGE_USER_KEY)

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
                        session.value.user = { username, roles }
                    }
                }
                return
            }

            const raw = localStorage.getItem(STORAGE_KEY_V1)
            if (!raw) return
            const parsed = JSON.parse(raw)
            if (!parsed || typeof parsed !== 'object') return

            const accessToken = typeof parsed.accessToken === 'string' ? parsed.accessToken : ''
            const ttype = typeof parsed.tokenType === 'string' ? parsed.tokenType : 'bearer'
            let user: SessionUser | null = null
            if (parsed.user && typeof parsed.user === 'object') {
                const username = typeof parsed.user.username === 'string' ? parsed.user.username : ''
                const roles = Array.isArray(parsed.user.roles) ? parsed.user.roles.filter((r: any) => typeof r === 'string') : []
                user = { username, roles }
            }

            session.value.accessToken = accessToken
            session.value.tokenType = ttype
            session.value.user = user

            if (accessToken) {
                localStorage.setItem(STORAGE_TOKEN_KEY, accessToken)
                localStorage.setItem(STORAGE_TOKEN_TYPE_KEY, ttype)
                if (user) {
                    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
                } else {
                    localStorage.removeItem(STORAGE_USER_KEY)
                }
                localStorage.removeItem(STORAGE_KEY_V1)
            }
        } catch {
            // noop
        }
    }

    hydrate()

    const isAuthenticated = computed(() => Boolean(session.value.accessToken))

    const setSession = (data: SessionData) => {
        session.value = data
        if (!process.client) return

        if (data.accessToken) {
            localStorage.setItem(STORAGE_TOKEN_KEY, data.accessToken)
            localStorage.setItem(STORAGE_TOKEN_TYPE_KEY, data.tokenType || 'bearer')
        } else {
            localStorage.removeItem(STORAGE_TOKEN_KEY)
            localStorage.removeItem(STORAGE_TOKEN_TYPE_KEY)
        }

        if (data.user) {
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user))
        } else {
            localStorage.removeItem(STORAGE_USER_KEY)
        }
    }

    const clearSession = () => {
        session.value = emptySession()
        if (!process.client) return
        localStorage.removeItem(STORAGE_TOKEN_KEY)
        localStorage.removeItem(STORAGE_TOKEN_TYPE_KEY)
        localStorage.removeItem(STORAGE_USER_KEY)
        localStorage.removeItem(STORAGE_KEY_V1)
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
