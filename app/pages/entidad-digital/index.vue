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
          <label class="mb-1 block text-sm font-medium text-zinc-900">Clave segura</label>
          <input
            v-model="clave"
            type="password"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            placeholder="Mínimo 10 caracteres"
          />
          <p class="mt-1 text-xs text-zinc-600">
            Esta clave se usa para cifrar la llave privada (PEM). No se almacena en el servidor.
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-900">Confirmar clave</label>
          <input v-model="claveConfirm" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </div>

        <div class="sm:col-span-2 flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-zinc-900">
            <input v-model="overwrite" type="checkbox" class="h-4 w-4" />
            Reemplazar si ya existe
          </label>

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

    <!-- Paso 2: Captura de documentos -->
    <div v-if="currentStep === 'camera'" class="rounded-lg border border-zinc-200 bg-white p-4">
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Paso 2: Captura de documentos</h2>
        <p class="text-sm text-zinc-600">Toma fotos del frente y reverso de tu documento de identificación</p>
      </div>

      <DocumentCamera 
        @complete="handleCameraComplete" 
        @cancel="handleCameraCancel" 
      />
    </div>

    <!-- Paso 3: Resumen y creación -->
    <div v-if="currentStep === 'summary'" class="rounded-lg border border-zinc-200 bg-white p-4">
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Paso 3: Resumen y creación</h2>
        <p class="text-sm text-zinc-600">Verifica tu información antes de crear la entidad digital</p>
      </div>

      <!-- Resumen de datos básicos -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-3">Datos de identificación</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div class="bg-zinc-50 p-3 rounded">
            <span class="font-medium">Tipo:</span> {{ tipoIdentificacion }}
          </div>
          <div class="bg-zinc-50 p-3 rounded">
            <span class="font-medium">Número:</span> {{ numeroIdentificacion }}
          </div>
        </div>
      </div>

      <!-- Resumen de documentos -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-3">Documentos capturados</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="text-center">
            <h4 class="text-sm font-medium mb-2">Frente del documento</h4>
            <img :src="documentPhotos?.front" alt="Frente" class="w-full h-32 object-cover rounded border" />
          </div>
          <div class="text-center">
            <h4 class="text-sm font-medium mb-2">Reverso del documento</h4>
            <img :src="documentPhotos?.back" alt="Reverso" class="w-full h-32 object-cover rounded border" />
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          @click="backToCamera"
        >
          Volver a capturar
        </button>

        <button
          type="button"
          class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          :disabled="loading"
          @click="crearEntidad"
        >
          {{ loading ? 'Creando entidad...' : 'Crear entidad digital' }}
        </button>
      </div>

      <div v-if="errorMsg" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>

      <div v-if="result" class="mt-4 grid gap-3">
        <div class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div class="font-semibold">Entidad creada</div>
          <div class="mt-1">Directorio: {{ result.directory }}</div>
          <div>Fingerprint SHA-256: {{ result.fingerprint_sha256 }}</div>
        </div>

        <div class="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div class="mb-2 text-sm font-semibold text-zinc-900">Llave pública (PEM)</div>
          <pre class="max-h-[60dvh] overflow-auto text-xs text-zinc-900">{{ result.public_key_pem }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntidadDigital } from '~/composables/entidad/useEntidadDigital'

// Composable de entidad digital
const {
  tipoIdentificacion,
  numeroIdentificacion,
  clave,
  claveConfirm,
  overwrite,
  loading,
  errorMsg,
  result,
  redirectTo,
  crear,
  resetForm,
  validateForm
} = useEntidadDigital()

// Estado del flujo secuencial
const currentStep = ref<'basic' | 'camera' | 'summary'>('basic')
const documentPhotos = ref<{ front: string; back: string } | null>(null)

// Computed para validar formulario básico
const isBasicFormValid = computed(() => {
  return tipoIdentificacion.value && 
         numeroIdentificacion.value && 
         clave.value && 
         claveConfirm.value && 
         clave.value.length >= 10 && 
         clave.value === claveConfirm.value
})

// Métodos del flujo
const nextToCamera = () => {
  if (!isBasicFormValid.value) {
    errorMsg.value = 'Por favor completa todos los campos correctamente'
    return
  }
  
  errorMsg.value = ''
  currentStep.value = 'camera'
}

const handleCameraComplete = (photos: { front: string; back: string }) => {
  documentPhotos.value = photos
  currentStep.value = 'summary'
}

const handleCameraCancel = () => {
  currentStep.value = 'basic'
}

const backToCamera = () => {
  documentPhotos.value = null
  currentStep.value = 'camera'
}

const crearEntidad = async () => {
  if (!documentPhotos.value) {
    errorMsg.value = 'No se han capturado los documentos'
    return
  }

  try {
    // Aquí podrías agregar las fotos al payload si el backend lo requiere
    await crear()
    
    if (result.value) {
      // Éxito - podrías redirigir o mostrar mensaje
      console.log('Entidad creada exitosamente con documentos')
    }
  } catch (error) {
    console.error('Error creando entidad:', error)
  }
}

// Reset del flujo completo
const resetFlow = () => {
  currentStep.value = 'basic'
  documentPhotos.value = null
  resetForm()
}

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
