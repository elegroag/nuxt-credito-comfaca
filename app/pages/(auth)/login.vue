<template>
  <div>
    <h1 class="text-lg font-semibold">Iniciar sesión</h1>
    <p class="mt-1 text-sm text-zinc-600">Ingresa tus credenciales para acceder al dashboard.</p>

    <!-- Estado de conexión -->
    <div class="mt-3 rounded-md p-3 text-sm" :class="connectionStatusClass">
      <div class="flex items-center gap-2">
        <div v-if="checkingConnection" class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <svg v-else-if="isConnected" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <svg v-else class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>{{ connectionMessage }}</span>
      </div>
    </div>

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
        :disabled="loading || !isConnected"
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
import { onMounted, ref, computed } from '#imports'
import { useLogin } from '~/composables/auth/useLogin'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'auth'
})

const { username, password, loading, errorMsg, login, checkAuthAndRedirect } = useLogin()
const { getJson, baseUrl } = useApi()

// Estado de conexión
const isConnected = ref(false)
const connectionError = ref('')
const checkingConnection = ref(true)

const connectionMessage = computed(() => {
  if (checkingConnection.value) return 'Verificando conexión con el servidor...'
  if (connectionError.value) return `Error de conexión: ${connectionError.value}`
  if (isConnected.value) return `Conectado`
  return 'Sin conexión'
})

const connectionStatusClass = computed(() => {
  if (checkingConnection.value) return 'bg-blue-50 text-blue-800 border border-blue-200'
  if (connectionError.value) return 'bg-red-50 text-red-800 border border-red-200'
  if (isConnected.value) return 'bg-green-50 text-green-800 border border-green-200'
  return 'bg-gray-50 text-gray-800 border border-gray-200'
})

const checkConnection = async () => {
  try {
    checkingConnection.value = true
    connectionError.value = ''
    
    const response = await fetch(`${baseUrl.value}/api/health`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    isConnected.value = true
  } catch (error: any) {
    isConnected.value = false
    connectionError.value = error?.message || 'No se puede conectar al servidor'
  } finally {
    checkingConnection.value = false
  }
}

onMounted(async () => {
  await checkConnection()
  await checkAuthAndRedirect()
})
</script>