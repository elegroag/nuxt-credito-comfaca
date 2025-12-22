<!-- frontend/pages/perfil/index.vue -->
<template>
  <div class="mx-auto max-w-3xl p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-zinc-900">Mi perfil</h1>
      <p class="mt-1 text-sm text-zinc-600">Actualiza tu información personal.</p>
    </div>

    <form @submit.prevent="guardarPerfil" class="space-y-6">
      <!-- Mensaje de éxito -->
      <div 
        v-if="success" 
        class="rounded-md bg-green-50 p-4 mb-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-5 w-5 text-green-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              Perfil actualizado correctamente
            </p>
          </div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div 
        v-if="error" 
        class="rounded-md bg-red-50 p-4 mb-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Sección de información personal -->
      <div class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-medium text-zinc-900 mb-6">Información personal</h2>
        
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <!-- Nombre -->
          <div class="sm:col-span-3">
            <label for="nombre" class="block text-sm font-medium text-zinc-700">
              Nombre completo
            </label>
            <div class="mt-1">
              <input
                type="text"
                id="nombre"
                v-model="perfil.nombre"
                required
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="sm:col-span-4">
            <label for="email" class="block text-sm font-medium text-zinc-700">
              Correo electrónico
            </label>
            <div class="mt-1">
              <input
                id="email"
                type="email"
                v-model="perfil.email"
                required
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Teléfono -->
          <div class="sm:col-span-3">
            <label for="telefono" class="block text-sm font-medium text-zinc-700">
              Teléfono
            </label>
            <div class="mt-1">
              <input
                type="tel"
                id="telefono"
                v-model="perfil.telefono"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Dirección -->
          <div class="sm:col-span-6">
            <label for="direccion" class="block text-sm font-medium text-zinc-700">
              Dirección
            </label>
            <div class="mt-1">
              <textarea
                id="direccion"
                v-model="perfil.direccion"
                rows="3"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de contraseña -->
      <div class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-medium text-zinc-900 mb-6">Cambiar contraseña</h2>
        
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <label for="password_actual" class="block text-sm font-medium text-zinc-700">
              Contraseña actual
            </label>
            <div class="mt-1">
              <input
                type="password"
                id="password_actual"
                v-model="passwordData.password_actual"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="sm:col-span-4">
            <label for="nueva_password" class="block text-sm font-medium text-zinc-700">
              Nueva contraseña
            </label>
            <div class="mt-1">
              <input
                type="password"
                id="nueva_password"
                v-model="passwordData.nueva_password"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="sm:col-span-4">
            <label for="confirmar_password" class="block text-sm font-medium text-zinc-700">
              Confirmar nueva contraseña
            </label>
            <div class="mt-1">
              <input
                type="password"
                id="confirmar_password"
                v-model="passwordData.confirmar_password"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          class="rounded-md border border-zinc-300 bg-white py-2 px-4 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="guardando"
          class="inline-flex justify-center rounded-md border border-transparent bg-zinc-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <span v-if="guardando">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
          <span v-else>Guardar cambios</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import { usePerfil } from './usePerfil';

const {
  perfil,
  loading,
  guardando,
  error,
  success,
  guardarPerfil
} = usePerfil();

// Datos para el cambio de contraseña
const passwordData = ref({
  password_actual: '',
  nueva_password: '',
  confirmar_password: ''
});

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>