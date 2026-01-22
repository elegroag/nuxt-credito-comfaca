<!-- frontend/pages/perfil/index.vue -->
<template>
  <div class="mx-auto max-w-4xl p-4 sm:p-8">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-zinc-900">Mi perfil</h1>
        <p class="mt-1 text-sm text-zinc-600">Actualiza tu información personal y seguridad.</p>
      </div>

      <div class="flex items-center gap-3">
        <span
          v-if="loading"
          class="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
        >
          Cargando…
        </span>
        <span
          v-else
          class="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
        >
          Perfil
        </span>
      </div>
    </div>

    <form @submit.prevent="guardarPerfil" class="space-y-6">
      <div v-if="loading" class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div class="animate-pulse space-y-4">
          <div class="h-4 w-44 rounded bg-zinc-200"></div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="h-10 rounded bg-zinc-200"></div>
            <div class="h-10 rounded bg-zinc-200"></div>
            <div class="h-10 rounded bg-zinc-200"></div>
            <div class="h-10 rounded bg-zinc-200"></div>
          </div>
        </div>
      </div>

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
      <div class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm" :class="loading ? 'opacity-60 pointer-events-none' : ''">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-medium text-zinc-900">Información personal</h2>
            <p class="mt-1 text-sm text-zinc-600">Algunos campos se completan automáticamente y no se pueden editar.</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <!-- Username (no modificable) -->
          <div class="sm:col-span-3">
            <FormField label="Usuario">
              <input
                type="text"
                id="username"
                v-model="perfil.username"
                readonly
                class="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-zinc-500">No modificable</p>
            </FormField>
          </div>

          <!-- Tipo de documento (no modificable) -->
          <div class="sm:col-span-3">
            <FormField label="Tipo de documento">
              <input
                type="text"
                id="tipo_documento"
                v-model="perfil.tipo_documento"
                readonly
                class="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-zinc-500">No modificable</p>
            </FormField>
          </div>

          <!-- Nombres -->
          <div class="sm:col-span-3">
            <FormField label="Nombres">
              <input
                type="text"
                id="nombres"
                v-model="perfil.nombres"
                required
                :disabled="guardando"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </FormField>
          </div>

          <!-- Apellidos -->
          <div class="sm:col-span-3">
            <FormField label="Apellidos">
              <input
                type="text"
                id="apellidos"
                v-model="perfil.apellidos"
                required
                :disabled="guardando"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </FormField>
          </div>

          <!-- Nombre completo (no modificable, se completa con nombres/apellidos) -->
          <div class="sm:col-span-6">
            <FormField label="Nombre completo">
              <input
                type="text"
                id="full_name"
                v-model="perfil.full_name"
                readonly
                class="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-zinc-500">Se completa con Nombres y Apellidos</p>
            </FormField>
          </div>

          <!-- Email -->
          <div class="sm:col-span-3">
            <FormField label="Correo electrónico">
              <input
                id="email"
                type="email"
                v-model="perfil.email"
                required
                :disabled="guardando"
                placeholder="soportesistemas.comfaca@gmail.com"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-zinc-500">Usa un correo válido (ej: soportesistemas.comfaca@gmail.com)</p>
            </FormField>
          </div>

          <!-- Teléfono -->
          <div class="sm:col-span-3">
            <FormField label="Teléfono">
              <input
                type="tel"
                id="telefono"
                v-model="perfil.phone"
                :disabled="guardando"
                placeholder="3157145942"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-zinc-500">Ejemplo: 3157145942</p>
            </FormField>
          </div>
        </div>
      </div>

      <!-- Sección de contraseña -->
      <div class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm" :class="loading ? 'opacity-60 pointer-events-none' : ''">
        <div class="mb-6">
          <h2 class="text-lg font-medium text-zinc-900">Seguridad</h2>
          <p class="mt-1 text-sm text-zinc-600">
            Si deseas cambiar tu contraseña, completa los campos. Debe tener mínimo 8 caracteres e incluir mayúsculas, minúsculas y números.
          </p>
        </div>
        
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <FormField label="Contraseña actual">
              <input
                type="password"
                id="password_actual"
                v-model="passwordData.password_actual"
                :disabled="guardando"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </FormField>
          </div>

          <div class="sm:col-span-4">
            <FormField label="Nueva contraseña">
              <input
                type="password"
                id="nueva_password"
                v-model="passwordData.nueva_password"
                :disabled="guardando"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </FormField>
          </div>

          <div class="sm:col-span-4">
            <FormField label="Confirmar nueva contraseña">
              <input
                type="password"
                id="confirmar_password"
                v-model="passwordData.confirmar_password"
                :disabled="guardando"
                class="block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              />
            </FormField>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 pt-5">
        <button
          type="button"
          @click="cancelarCambios"
          :disabled="guardando"
          class="rounded-md border border-zinc-300 bg-white py-2 px-4 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="guardando || loading"
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
import FormField from '~/components/shared/FormField.vue'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { usePerfil } from '~/composables/perfil/usePerfil'

const {
  perfil,
  passwordData,
  loading,
  guardando,
  error,
  success,
  guardarPerfil,
  recargarPerfil,
  resetPasswordForm
} = usePerfil();

const cancelarCambios = async () => {
  resetPasswordForm();
  await recargarPerfil();
};

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>