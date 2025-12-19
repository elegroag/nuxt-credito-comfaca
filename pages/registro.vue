<template>
  <div>
    <h1 class="text-lg font-semibold">Registro</h1>
    <p class="mt-1 text-sm text-zinc-600">Crea tu cuenta para acceder al sistema.</p>

    <div class="mt-4 grid gap-3">
      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-900">Usuario</label>
        <input v-model="username" type="text" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-900">Contraseña</label>
        <input v-model="password" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-900">Confirmar contraseña</label>
        <input v-model="password2" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
      </div>

      <button
        type="button"
        class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        :disabled="loading"
        @click="registrar"
      >
        {{ loading ? 'Procesando...' : 'Crear cuenta' }}
      </button>

      <div v-if="errorMsg" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>

      <div class="text-sm text-zinc-600">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="font-medium underline">Iniciar sesión</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, navigateTo } from '#imports'

definePageMeta({
  layout: 'auth'
})

const { isAuthenticated, setSession } = useSession()

const username = ref('')
const password = ref('')
const password2 = ref('')

const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  if (isAuthenticated.value) {
    await navigateTo('/')
  }
})

const registrar = async () => {
  errorMsg.value = ''

  if (!username.value.trim()) {
    errorMsg.value = 'El usuario es requerido.'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (password.value !== password2.value) {
    errorMsg.value = 'La confirmación de contraseña no coincide.'
    return
  }

  loading.value = true
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || `Error HTTP ${res.status}`)
    }

    const data = await res.json()
    const accessToken = String(data?.access_token || '')
    const tokenType = String(data?.token_type || 'bearer')
    const user = data?.user

    if (!accessToken) {
      throw new Error('Respuesta inválida de registro')
    }

    setSession({
      accessToken,
      tokenType,
      user: {
        username: typeof user?.username === 'string' ? user.username : username.value,
        roles: Array.isArray(user?.roles) ? user.roles : []
      }
    })

    await navigateTo('/')
  } catch (e: any) {
    errorMsg.value = e?.message || 'No fue posible registrar'
  } finally {
    loading.value = false
  }
}
</script>
