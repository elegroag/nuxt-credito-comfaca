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
            Escanea el código QR con la aplicación móvil para autorizar la generación de tu entidad digital.
            El enlace expirará en 20 minutos por seguridad.
          </p>
        </div>

        <div class="sm:col-span-2 flex items-center justify-end">
          <button
            type="button"
            class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="!isBasicFormValid"
            @click="nextToQR"
          >
            Generar QR de autorización
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>
    </div>

    <!-- Paso 2: Autorización con QR -->
    <div v-if="currentStep === 'qr'" class="rounded-lg border border-zinc-200 bg-white p-4">
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Paso 2: Autorización con QR</h2>
        <p class="text-sm text-zinc-600">Escanea este código QR con la aplicación móvil</p>
      </div>

      <div class="flex flex-col items-center space-y-4">
        <!-- Contenedor del QR -->
        <div v-if="qrCodeUrl" class="relative">
          <div class="qr-container">
            <canvas ref="qrCanvas" class="qr-canvas"></canvas>
          </div>
          
          <!-- Indicador de expiración -->
          <div class="mt-4 text-center">
            <div class="text-sm text-zinc-600">
              Tiempo restante: 
              <span class="font-mono font-semibold" :class="timeRemainingClass">
                {{ formatTimeRemaining(timeRemaining) }}
              </span>
            </div>
            <div class="mt-1">
              <div class="w-48 h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-zinc-900 transition-all duration-1000"
                  :style="{ width: `${(timeRemaining / 1200) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loadingQR" class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto mb-2"></div>
          <p class="text-sm text-zinc-600">Generando código QR...</p>
        </div>

        <!-- Mensaje de expiración -->
        <div v-if="tokenExpired" class="text-center">
          <div class="rounded-md border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-800 font-medium mb-2">El código QR ha expirado</p>
            <p class="text-sm text-red-600 mb-3">Por seguridad, el enlace expiró después de 20 minutos</p>
            <button
              @click="regenerateQR"
              class="rounded-md bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            >
              Generar nuevo QR
            </button>
          </div>
        </div>

        <!-- Botones de acción -->
        <div v-if="qrCodeUrl && !tokenExpired" class="flex space-x-3">
          <button
            @click="regenerateQR"
            class="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Generar nuevo QR
          </button>
          <button
            @click="goBack"
            class="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Atrás
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
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntidadDigital } from '~/composables/entidad/useEntidadDigital'
import { storage } from '~/composables/useStorage'
import QRCode from 'qrcode'

const config = useRuntimeConfig()

// Composable de entidad digital
const {
  tipoIdentificacion,
  numeroIdentificacion,
  errorMsg,
} = useEntidadDigital()

// Estado del flujo secuencial
const currentStep = ref<'basic' | 'qr'>('basic')

// Estado del QR
const qrCodeUrl = ref<string>('')
const loadingQR = ref(false)
const tokenExpired = ref(false)
const timeRemaining = ref(1200) // 20 minutos en segundos
const qrCanvas = ref<HTMLCanvasElement | null>(null)
let countdownInterval: NodeJS.Timeout | null = null

// Computed para validar formulario básico
const isBasicFormValid = computed(() => {
  return tipoIdentificacion.value && 
         numeroIdentificacion.value
})

// Computed para clase de tiempo restante
const timeRemainingClass = computed(() => {
  if (timeRemaining.value <= 60) return 'text-red-600'
  if (timeRemaining.value <= 300) return 'text-yellow-600'
  return 'text-green-600'
})

// Formatear tiempo restante
const formatTimeRemaining = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Generar QR de autorización
const generateQR = async () => {
  try {
    loadingQR.value = true
    tokenExpired.value = false
    errorMsg.value = ''

    // Crear token temporal con datos básicos
    const tokenData = {
      tipoIdentificacion: tipoIdentificacion.value,
      numeroIdentificacion: numeroIdentificacion.value,
      timestamp: Date.now(),
      expiresAt: Date.now() + (20 * 60 * 1000) // 20 minutos
    }

    // Generar URL de autorización del backend
    const backendUrl = config.public.backendBaseUrl || 'http://localhost:5001'
    const authUrl = `${backendUrl}/auth/qr-token?data=${btoa(JSON.stringify(tokenData))}`
    
    // Generar QR
    await nextTick()
    if (qrCanvas.value) {
      await QRCode.toCanvas(qrCanvas.value, authUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    }

    qrCodeUrl.value = authUrl
    startCountdown()
    
  } catch (error) {
    console.error('Error generando QR:', error)
    errorMsg.value = 'Error al generar el código QR. Por favor intenta nuevamente.'
  } finally {
    loadingQR.value = false
  }
}

// Iniciar cuenta regresiva
const startCountdown = () => {
  timeRemaining.value = 1200 // 20 minutos
  
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  countdownInterval = setInterval(() => {
    timeRemaining.value--
    
    if (timeRemaining.value <= 0) {
      tokenExpired.value = true
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
    }
  }, 1000)
}

// Métodos del flujo
const nextToQR = async () => {
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
  currentStep.value = 'qr'
  await generateQR()
}

const regenerateQR = async () => {
  await generateQR()
}

const goBack = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  currentStep.value = 'basic'
  qrCodeUrl.value = ''
  tokenExpired.value = false
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

// Limpiar intervalo al salir del componente
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>

<style scoped>
.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.qr-canvas {
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
