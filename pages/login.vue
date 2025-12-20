<template>
  <div>
    <h1 class="text-lg font-semibold">Iniciar sesión</h1>
    <p class="mt-1 text-sm text-zinc-600">Ingresa tus credenciales para acceder al dashboard.</p>

    <div class="mt-4 grid gap-3">
      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-900">Usuario</label>
        <input v-model="username" type="text" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-900">Contraseña</label>
        <input v-model="password" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
      </div>

      <button
        type="button"
        class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        :disabled="loading"
        @click="login"
      >
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>

      <div v-if="errorMsg" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>

      <div class="text-sm text-zinc-600">
        ¿No tienes cuenta?
        <NuxtLink to="/registro" class="font-medium underline">Crear cuenta</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useRoute, navigateTo } from '#imports'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const { isAuthenticated, setSession } = useSession()
const { postJson } = useApi()

const username = ref('')
const password = ref('')

const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  if (isAuthenticated.value) {
    await navigateTo('/')
  }
})

const login = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const data = await postJson<any>('/api/auth/login', {
      username: username.value,
      password: password.value
    })

    const accessToken = String(data?.access_token || '')
    const tokenType = String(data?.token_type || 'bearer')
    const user = data?.user

    if (!accessToken) {
      throw new Error('Respuesta inválida de autenticación')
    }

    setSession({
      accessToken,
      tokenType,
      user: {
        username: typeof user?.username === 'string' ? user.username : username.value,
        roles: Array.isArray(user?.roles) ? user.roles : []
      }
    })

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(redirect.startsWith('/') ? redirect : '/')
  } catch (e: any) {
    const status = Number(e?.statusCode || e?.response?.status || 0)
    const code = e?.data?.code
    if (status === 404 && code === 'USER_NOT_FOUND') {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
      const q = new URLSearchParams()
      if (username.value.trim()) q.set('username', username.value.trim())
      if (redirect) q.set('redirect', redirect)
      await navigateTo(`/registro?${q.toString()}`)
      return
    }

    errorMsg.value = e?.data?.error || e?.message || 'No fue posible iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
