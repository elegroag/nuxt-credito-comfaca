<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Confirmación de entidad digital</h1>
        <p class="text-sm text-zinc-600">Revisa y confirma tu información antes de crear la entidad digital</p>
      </div>
      <NuxtLink
        to="/"
        class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
      >
        Volver
      </NuxtLink>
    </div>

    <!-- Barra de progreso -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
          <div class="w-16 h-1 bg-emerald-500"></div>
          <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
          <div class="w-16 h-1 bg-emerald-500"></div>
          <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
          <div class="w-16 h-1 bg-emerald-500"></div>
          <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
        </div>
      </div>
      <div class="flex justify-between text-xs text-zinc-600">
        <span>Datos básicos</span>
        <span>Documentos</span>
        <span>Selfie</span>
        <span class="font-medium text-emerald-600">Confirmación</span>
      </div>
    </div>

    <!-- Resumen completo -->
    <div class="space-y-6">
      <!-- Datos de identificación -->
      <div class="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Datos de identificación
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-zinc-50 p-4 rounded-lg">
            <div class="text-sm text-zinc-600 mb-1">Tipo de identificación</div>
            <div class="font-medium">{{ verificationData?.tipoIdentificacion || 'CC' }}</div>
          </div>
          <div class="bg-zinc-50 p-4 rounded-lg">
            <div class="text-sm text-zinc-600 mb-1">Número de identificación</div>
            <div class="font-medium">{{ verificationData?.numeroIdentificacion || 'No disponible' }}</div>
          </div>
        </div>
      </div>

      <!-- Documentos capturados -->
      <div class="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Documentos de identificación
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="text-center">
            <h3 class="text-sm font-medium mb-3 text-zinc-700">Frente del documento</h3>
            <div class="relative group">
              <img 
                :src="verificationData?.documents?.front" 
                alt="Frente del documento" 
                class="w-full h-48 object-cover rounded-lg border-2 border-zinc-200 group-hover:border-emerald-400 transition-colors cursor-pointer"
                @click="openImageModal(verificationData?.documents?.front, 'Frente del documento')"
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="text-center">
            <h3 class="text-sm font-medium mb-3 text-zinc-700">Reverso del documento</h3>
            <div class="relative group">
              <img 
                :src="verificationData?.documents?.back" 
                alt="Reverso del documento" 
                class="w-full h-48 object-cover rounded-lg border-2 border-zinc-200 group-hover:border-emerald-400 transition-colors cursor-pointer"
                @click="openImageModal(verificationData?.documents?.back, 'Reverso del documento')"
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selfie -->
      <div class="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Verificación facial
        </h2>
        <div class="text-center">
          <div class="relative inline-block group">
            <img 
              :src="verificationData?.selfie" 
              alt="Selfie de verificación" 
              class="w-48 h-48 object-cover rounded-full border-4 border-zinc-200 group-hover:border-emerald-400 transition-colors cursor-pointer"
              @click="openImageModal(verificationData?.selfie, 'Selfie de verificación')"
            />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all flex items-center justify-center">
              <svg class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
              </svg>
            </div>
          </div>
          <p class="mt-3 text-sm text-zinc-600">Foto facial para verificación de identidad</p>
        </div>
      </div>

      <!-- Términos y condiciones -->
      <div class="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 class="text-lg font-semibold mb-4">Términos y condiciones</h2>
        <div class="space-y-3">
          <label class="flex items-start space-x-3 cursor-pointer">
            <input 
              v-model="termsAccepted" 
              type="checkbox" 
              class="mt-1 h-4 w-4 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500"
            />
            <span class="text-sm text-zinc-700">
              Acepto los <a href="#" class="text-emerald-600 hover:text-emerald-700 underline">términos y condiciones</a> para la creación de mi entidad digital
            </span>
          </label>
          <label class="flex items-start space-x-3 cursor-pointer">
            <input 
              v-model="privacyAccepted" 
              type="checkbox" 
              class="mt-1 h-4 w-4 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500"
            />
            <span class="text-sm text-zinc-700">
              Autorizo el tratamiento de mis datos personales según la <a href="#" class="text-emerald-600 hover:text-emerald-700 underline">política de privacidad</a>
            </span>
          </label>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
          @click="goBack"
          :disabled="loading"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Atrás
        </button>

        <div class="flex items-center space-x-4">
          <button
            type="button"
            class="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
            @click="cancelProcess"
            :disabled="loading"
          >
            Cancelar proceso
          </button>

          <button
            type="button"
            class="rounded-md bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            :disabled="!canConfirm || loading"
            @click="confirmAndCreate"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Creando entidad...' : 'Confirmar y crear entidad digital' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mensajes de error y éxito -->
    <div v-if="errorMsg" class="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div class="flex">
        <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <span>{{ errorMsg }}</span>
      </div>
    </div>

    <div v-if="successMsg" class="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
      <div class="flex">
        <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>{{ successMsg }}</span>
      </div>
    </div>

    <!-- Modal para ver imágenes -->
    <div v-if="imageModal.show" class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" @click="closeImageModal">
      <div class="max-w-4xl max-h-full relative">
        <button 
          @click="closeImageModal" 
          class="absolute -top-12 right-0 text-white hover:text-zinc-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <img 
          :src="imageModal.src" 
          :alt="imageModal.title" 
          class="max-w-full max-h-full rounded-lg shadow-2xl"
        />
        <div class="text-center mt-4 text-white">{{ imageModal.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEntidadDigital } from '~/composables/entidad/useEntidadDigital'

const router = useRouter()

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
  crear,
  resetForm,
  validateForm
} = useEntidadDigital()

// Estado local
const verificationData = ref<any>(null)
const termsAccepted = ref(false)
const privacyAccepted = ref(false)
const successMsg = ref('')
const imageModal = ref({
  show: false,
  src: '',
  title: ''
})

// Computed para validar si se puede confirmar
const canConfirm = computed(() => {
  return verificationData.value && 
         termsAccepted.value && 
         privacyAccepted.value &&
         !loading.value
})

// Cargar datos de verificación al montar
onMounted(() => {
  const savedData = localStorage.getItem('completeVerificationData')
  if (savedData) {
    verificationData.value = JSON.parse(savedData)
  } else {
    // Si no hay datos, redirigir al inicio
    router.push('/entidad-digital')
  }
})

// Métodos
const openImageModal = (src: string, title: string) => {
  imageModal.value = { show: true, src, title }
}

const closeImageModal = () => {
  imageModal.value = { show: false, src: '', title: '' }
}

const goBack = () => {
  if (confirm('¿Estás seguro de que deseas regresar?')) {
    localStorage.removeItem('completeVerificationData')
    router.push('/entidad-digital/selfie-camera')
  }
}

const cancelProcess = () => {
  if (confirm('¿Estás seguro de que deseas cancelar el proceso? Se perderán todos los datos capturados.')) {
    localStorage.removeItem('capturedDocuments')
    localStorage.removeItem('completeVerificationData')
    router.push('/entidad-digital')
  }
}

const confirmAndCreate = async () => {
  if (!canConfirm.value) return

  errorMsg.value = ''
  successMsg.value = ''

  try {
    // Establecer los datos del formulario desde los datos de verificación
    if (verificationData.value?.tipoIdentificacion) {
      tipoIdentificacion.value = verificationData.value.tipoIdentificacion
    }
    if (verificationData.value?.numeroIdentificacion) {
      numeroIdentificacion.value = verificationData.value.numeroIdentificacion
    }

    // Validar y crear entidad
    const isValid = validateForm()
    if (!isValid) return

    // Crear entidad digital
    await crear()

    if (result.value) {
      successMsg.value = '¡Entidad digital creada exitosamente!'
      
      // Limpiar localStorage
      localStorage.removeItem('capturedDocuments')
      localStorage.removeItem('completeVerificationData')

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  } catch (error: any) {
    console.error('Error creando entidad digital:', error)
    errorMsg.value = error?.data?.error || error?.message || 'Error creating digital entity'
  }
}

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>