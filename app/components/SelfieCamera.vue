<template>
  <div class="selfie-camera-container">
    <!-- Paso 1: Captura de selfie -->
    <div v-if="currentStep === 'capture'" class="capture-step">
      <div class="step-header">
        <h3 class="text-lg font-semibold">Selfie de verificación</h3>
        <p class="text-sm text-zinc-600">Coloca tu rostro en el óvalo y toma una selfie</p>
      </div>

      <!-- Vista de cámara para navegador -->
      <div v-if="!isNative && !selfiePhoto" class="browser-camera">
        <video 
          ref="videoRef" 
          autoplay 
          playsinline
          class="camera-video selfie-video"
        ></video>
        <canvas ref="canvasRef" class="hidden-canvas"></canvas>
        
        <!-- Guía de rostro -->
        <div class="face-guide">
          <div class="face-oval"></div>
        </div>
        
        <div class="camera-controls">
          <button @click="takeSelfie" class="capture-btn selfie-btn" :disabled="loading">
            <div class="capture-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <circle cx="12" cy="12" r="10" fill="white" />
              </svg>
            </div>
            <span>{{ loading ? 'Procesando...' : 'Tomar selfie' }}</span>
          </button>
        </div>
      </div>

      <!-- Vista nativa (Capacitor) -->
      <div v-else-if="isNative && !selfiePhoto" class="camera-controls">
        <button @click="takeSelfieNative" class="capture-btn selfie-btn" :disabled="loading">
          <div class="capture-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <circle cx="12" cy="12" r="10" fill="white" />
            </svg>
          </div>
          <span>{{ loading ? 'Procesando...' : 'Tomar selfie' }}</span>
        </button>
      </div>

      <!-- Vista de preview -->
      <div v-else-if="selfiePhoto" class="preview-container">
        <img :src="selfiePhoto.webPath" alt="Selfie capturada" class="preview-image selfie-preview" />
        <div class="preview-actions">
          <button @click="confirmSelfie" class="btn confirm-btn">Confirmar</button>
          <button @click="retakeSelfie" class="btn retry-btn">Tomar otra</button>
        </div>
      </div>
    </div>

    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Procesando selfie...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera'

// Estado del componente
const currentStep = ref<'capture'>('capture')
const selfiePhoto = ref<any>(null)
const loading = ref(false)
const isNative = ref(Capacitor.isNativePlatform())
const stream = ref<MediaStream | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Emits
const emit = defineEmits<{
  complete: [{ selfie: string }]
  cancel: []
}>()

// Métodos
const takeSelfieNative = async () => {
  try {
    loading.value = true

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      direction: CameraDirection.Front,
      source: CameraSource.Camera,
      saveToGallery: false,
      width: 800,
      height: 600,
      correctOrientation: true,
    })

    selfiePhoto.value = photo
  } catch (error: any) {
    console.error('Error tomando selfie con Capacitor:', error)
    alert('Error al tomar la selfie: ' + (error?.message ?? String(error)))
  } finally {
    loading.value = false
  }
}

const startCamera = async () => {
  try {
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 800 },
        height: { ideal: 600 }
      }
    }
    
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (error: any) {
    console.error('Error accediendo a la cámara del navegador:', error)
    alert('No se pudo acceder a la cámara: ' + (error?.message ?? String(error)))
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}

const takeSelfie = () => {
  if (!videoRef.value || !canvasRef.value) return
  
  try {
    loading.value = true
    
    const video = videoRef.value
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')
    
    if (!context) throw new Error('No se pudo obtener el contexto del canvas')
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const photo = {
          webPath: url,
          blob: blob,
          dataUrl: canvas.toDataURL('image/jpeg', 0.9)
        }
        
        selfiePhoto.value = photo
      }
      loading.value = false
    }, 'image/jpeg', 0.9)
    
  } catch (error: any) {
    console.error('Error capturando selfie:', error)
    alert('Error al capturar la selfie: ' + (error?.message ?? String(error)))
    loading.value = false
  }
}

const confirmSelfie = () => {
  if (selfiePhoto.value) {
    // Para navegador, detener la cámara antes de completar
    if (!isNative.value) {
      stopCamera()
    }
    
    emit('complete', {
      selfie: selfiePhoto.value.webPath
    })
  }
}

const retakeSelfie = () => {
  selfiePhoto.value = null
  
  // Para navegador, reiniciar la cámara
  if (!isNative.value) {
    setTimeout(() => {
      startCamera()
    }, 100)
  } else {
    takeSelfieNative()
  }
}

// Ciclo de vida
onMounted(async () => {
  // Iniciar cámara del navegador si no es nativo
  if (!isNative.value) {
    await startCamera()
  }
})

onUnmounted(() => {
  // Detener cámara del navegador al salir del componente
  if (!isNative.value) {
    stopCamera()
  }
})
</script>

<style scoped src="@/assets/css/selfie-component.css"></style>
