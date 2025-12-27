<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Entidad digital</h1>
        <p class="text-sm text-zinc-600">Generación de llave pública y privada con documentos de identificación</p>
      </div>
      <NuxtLink
        to="/"
        class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
      >
        Volver
      </NuxtLink>
    </div>

    <!-- Paso 1: Datos básicos -->
    <div v-if="currentStep === 'basic'" class="rounded-lg border border-zinc-200 bg-white p-4">
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Paso 1: Datos básicos</h2>
        <p class="text-sm text-zinc-600">Ingresa tu información de identificación</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-900">Tipo identificación</label>
          <select v-model="tipoIdentificacion" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="NIT">NIT</option>
            <option value="PAS">PAS</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-900">Número identificación</label>
          <input v-model="numeroIdentificacion" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-900">Notas</label>
          <p class="text-sm text-zinc-600">
            La clave para tu entidad digital se generará en el paso de confirmación.
            Esta clave se usará para cifrar tu llave privada y no se almacenará en el servidor.
          </p>
        </div>

        <div class="sm:col-span-2 flex items-center justify-end">
          <button
            type="button"
            class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="!isBasicFormValid"
            @click="nextToCamera"
          >
            Siguiente: Capturar documentos
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntidadDigital } from '~/composables/entidad/useEntidadDigital'
import { storage } from '~/composables/useStorage'

// Composable de entidad digital
const {
  tipoIdentificacion,
  numeroIdentificacion,
  errorMsg,
} = useEntidadDigital()

// Estado del flujo secuencial
const currentStep = ref<'basic'>('basic')

// Computed para validar formulario básico
const isBasicFormValid = computed(() => {
  return tipoIdentificacion.value && 
         numeroIdentificacion.value
})

// Métodos del flujo
const nextToCamera = async () => {
  if (!isBasicFormValid.value) {
    errorMsg.value = 'Por favor completa todos los campos correctamente'
    return
  }
  
  // Guardar datos básicos usando StorageAdapter
  const basicData = {
    tipoIdentificacion: tipoIdentificacion.value,
    numeroIdentificacion: numeroIdentificacion.value
  }
  await storage.setItem('basicFormData', JSON.stringify(basicData))
  
  errorMsg.value = ''
  // Redirigir a página de captura de documentos
  navigateTo('/entidad-digital/document-camera')
}

// Cargar datos básicos si existen
onMounted(async () => {
  const savedData = await storage.getItem('basicFormData')
  if (savedData) {
    const data = JSON.parse(savedData)
    tipoIdentificacion.value = data.tipoIdentificacion || 'CC'
    numeroIdentificacion.value = data.numeroIdentificacion || ''
  }
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
