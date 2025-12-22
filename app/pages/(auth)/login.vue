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
import { onMounted } from '#imports'
import { useLogin } from '~/composables/auth/useLogin'

definePageMeta({
  layout: 'auth'
})

const { username, password, loading, errorMsg, login, checkAuthAndRedirect } = useLogin()

onMounted(async () => {
  await checkAuthAndRedirect()
})
</script>
