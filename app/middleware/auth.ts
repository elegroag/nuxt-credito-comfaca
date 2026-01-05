import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
    if (process.server) return

    const { isAuthenticated, ready } = useSession()

    // Esperar a que la sesión se cargue desde el storage
    await ready

    if (isAuthenticated.value) return

    const redirect = encodeURIComponent(to.fullPath || '/')
    return navigateTo(`/login?redirect=${redirect}`)
})
