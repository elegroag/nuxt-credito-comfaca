<template>
  <div class="document-camera-container">
    <!-- Paso 1: Captura del frente -->
    <div v-if="currentStep === 'front'" class="capture-step">
      <div class="step-header">
        <h3 class="text-lg font-semibold">Paso 1: Frente del documento</h3>
        <p class="text-sm text-zinc-600">Coloca el frente de tu documento de identificación</p>
      </div>

      <!-- Vista de cámara para navegador -->
      <div v-if="!isNative && !frontPhoto" class="browser-camera">
        <video 
          ref="videoRef" 
          key="camera-video"
          autoplay 
          playsinline
          class="camera-video"
        ></video>
        <canvas ref="canvasRef" class="hidden-canvas"></canvas>
        
        <div class="camera-controls">
          <button @click="takePhoto('front')" class="capture-btn" :disabled="loading">
            <div class="capture-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <circle cx="12" cy="12" r="10" fill="white" />
              </svg>
            </div>
            <span>{{ loading ? 'Procesando...' : 'Tomar foto del frente' }}</span>
          </button>
        </div>
      </div>

      <!-- Vista nativa (Capacitor) -->
      <div v-else-if="isNative && !frontPhoto" class="camera-controls">
        <button @click="takePhoto('front')" class="capture-btn" :disabled="loading">
          <div class="capture-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <circle cx="12" cy="12" r="10" fill="white" />
            </svg>
          </div>
          <span>{{ loading ? 'Procesando...' : 'Tomar foto del frente' }}</span>
        </button>
      </div>

      <!-- Vista de preview -->
      <div v-else-if="frontPhoto" class="preview-container">
        <img :src="frontPhoto.webPath" alt="Frente del documento" class="preview-image" />
        <div class="preview-actions">
          <button @click="confirmPhoto('front')" class="btn confirm-btn">Confirmar</button>
          <button @click="retakePhoto('front')" class="btn retry-btn">Tomar otra</button>
        </div>
      </div>
    </div>

    <!-- Paso 2: Captura del reverso -->
    <div v-if="currentStep === 'back'" class="capture-step">
      <div class="step-header">
        <h3 class="text-lg font-semibold">Paso 2: Reverso del documento</h3>
        <p class="text-sm text-zinc-600">Coloca el reverso de tu documento de identificación</p>
      </div>

      <!-- Vista de cámara para navegador -->
      <div v-if="!isNative && !backPhoto" class="browser-camera">
        <video 
          ref="videoRef" 
          key="camera-video"
          autoplay 
          playsinline
          class="camera-video"
        ></video>
        <canvas ref="canvasRef" class="hidden-canvas"></canvas>
        
        <div class="camera-controls">
          <button @click="takePhoto('back')" class="capture-btn" :disabled="loading">
            <div class="capture-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <circle cx="12" cy="12" r="10" fill="white" />
              </svg>
            </div>
            <span>{{ loading ? 'Procesando...' : 'Tomar foto del reverso' }}</span>
          </button>
        </div>
      </div>

      <!-- Vista nativa (Capacitor) -->
      <div v-else-if="isNative && !backPhoto" class="camera-controls">
        <button @click="takePhoto('back')" class="capture-btn" :disabled="loading">
          <div class="capture-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <circle cx="12" cy="12" r="10" fill="white" />
            </svg>
          </div>
          <span>{{ loading ? 'Procesando...' : 'Tomar foto del reverso' }}</span>
        </button>
      </div>

      <!-- Vista de preview -->
      <div v-else-if="backPhoto" class="preview-container">
        <img :src="backPhoto.webPath" alt="Reverso del documento" class="preview-image" />
        <div class="preview-actions">
          <button @click="confirmPhoto('back')" class="btn confirm-btn">Confirmar</button>
          <button @click="retakePhoto('back')" class="btn retry-btn">Tomar otra</button>
        </div>
      </div>
    </div>

    <!-- Paso 3: Completado -->
    <div v-if="currentStep === 'complete'" class="summary-step">
      <div class="step-header">
        <h3 class="text-lg font-semibold">Documentos capturados</h3>
        <p class="text-sm text-zinc-600">Documentos listos para el siguiente paso</p>
      </div>

      <div class="documents-preview">
        <div class="document-preview">
          <h4 class="text-sm font-medium">Frente</h4>
          <img :src="frontPhoto.webPath" alt="Frente" class="thumbnail" />
        </div>
        <div class="document-preview">
          <h4 class="text-sm font-medium">Reverso</h4>
          <img :src="backPhoto.webPath" alt="Reverso" class="thumbnail" />
        </div>
      </div>

      <div class="summary-actions">
        <button @click="restart" class="btn restart-btn">Reiniciar</button>
        <button @click="complete" class="btn complete-btn">Completar</button>
      </div>
    </div>

    <!-- Overlay de carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Procesando imagen...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Capacitor } from '@capacitor/core'
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera'
import { Directory, Filesystem } from '@capacitor/filesystem'

// Estado del componente
const currentStep = ref<'front' | 'back' | 'complete'>('front')
const frontPhoto = ref<any>(null)
const backPhoto = ref<any>(null)
const loading = ref(false)
const tempPhoto = ref<any>(null)
const isNative = ref(Capacitor.isNativePlatform())
const stream = ref<MediaStream | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cameraDeviceId = ref<string | null>(null)

// Emits
const emit = defineEmits<{
  complete: [{ front: string; back: string }]
  cancel: []
  stepChange: [{ step: string; stepIndex: number }]
}>()

// Métodos
const takePhotoNative = async (side: 'front' | 'back') => {
  try {
    loading.value = true

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      direction: CameraDirection.Rear,
      source: CameraSource.Camera,
      saveToGallery: false,
      width: 1920,
      height: 1080,
      correctOrientation: true,
    })

    tempPhoto.value = photo

    if (side === 'front') {
      frontPhoto.value = photo
    } else {
      backPhoto.value = photo
    }
  } catch (error: any) {
    console.error('Error tomando foto con Capacitor:', error)
    alert('Error al tomar la foto: ' + (error?.message ?? String(error)))
  } finally {
    loading.value = false
  }
}

const startCamera = async () => {
  try {
    // Primero obtener los dispositivos disponibles
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    
    // Buscar cámara trasera preferida
    let constraints: MediaStreamConstraints
    
    if (cameraDeviceId.value) {
      // Usar el mismo dispositivo que se usó anteriormente
      constraints = {
        video: {
          deviceId: { exact: cameraDeviceId.value },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }
    } else {
      // Primera vez, buscar cámara trasera
      const rearCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      
      if (rearCamera) {
        cameraDeviceId.value = rearCamera.deviceId
        constraints = {
          video: {
            deviceId: { exact: rearCamera.deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        }
      } else {
        // Si no se encuentra cámara trasera, usar la primera disponible
        constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        }
      }
    }
    
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    
    // Guardar el ID del dispositivo realmente utilizado
    if (stream.value) {
      const videoTrack = stream.value.getVideoTracks()[0]
      if (videoTrack) {
        const settings = videoTrack.getSettings()
        if (settings.deviceId) {
          cameraDeviceId.value = settings.deviceId
        }
      }
    }
    
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

const capturePhoto = (side: 'front' | 'back') => {
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
        
        tempPhoto.value = photo
        
        if (side === 'front') {
          frontPhoto.value = photo
        } else {
          backPhoto.value = photo
        }
      }
      loading.value = false
    }, 'image/jpeg', 0.9)
    
  } catch (error: any) {
    console.error('Error capturando foto:', error)
    alert('Error al capturar la foto: ' + (error?.message ?? String(error)))
    loading.value = false
  }
}

const takePhoto = async (side: 'front' | 'back') => {
  if (isNative.value) {
    await takePhotoNative(side)
  } else {
    await capturePhoto(side)
  }
}

const confirmPhoto = (side: 'front' | 'back') => {
  if (side === 'front') {
    currentStep.value = 'back'
    emit('stepChange', { step: 'back', stepIndex: 1 })
    // No detener la cámara al pasar al reverso
    // El watch se encargará de reconectar el video
  } else {
    currentStep.value = 'complete'
    emit('stepChange', { step: 'complete', stepIndex: 2 })
    // Detener la cámara solo al finalizar
    if (!isNative.value) {
      stopCamera()
    }
  }
  tempPhoto.value = null
}

const retakePhoto = (side: 'front' | 'back') => {
  if (side === 'front') {
    frontPhoto.value = null
  } else {
    backPhoto.value = null
  }
  tempPhoto.value = null
  
  // No reiniciar la cámara para navegador, ya que debería seguir activa
  // Solo reiniciar si el stream se detuvo por alguna razón
  if (!isNative.value && !stream.value) {
    setTimeout(() => {
      startCamera()
    }, 100)
  }
}

const restart = () => {
  currentStep.value = 'front'
  frontPhoto.value = null
  backPhoto.value = null
  tempPhoto.value = null
  
  // Para navegador, reiniciar la cámara
  if (!isNative.value) {
    setTimeout(() => {
      startCamera()
    }, 100)
  }
}

const complete = () => {
  if (frontPhoto.value && backPhoto.value) {
    // La cámara ya se detuvo en confirmPhoto para el lado 'back'
    // Solo asegurarse de detenerla si no se ha hecho
    if (!isNative.value && stream.value) {
      stopCamera()
    }
    
    emit('complete', {
      front: frontPhoto.value.webPath,
      back: backPhoto.value.webPath
    })
  }
}

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Error leyendo el archivo'))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })

const savePhotoToStorage = async (photo: any, filename: string) => {
  try {
    const response = await fetch(photo.webPath)
    const blob = await response.blob()
    const dataUrl = await readAsDataUrl(blob)
    const base64Data = String(dataUrl).split(',')[1]

    const savedFile = await Filesystem.writeFile({
      path: filename,
      data: base64Data as string,
      directory: Directory.Data,
    })

    return {
      savedPath: savedFile.uri,
      webPath: Capacitor.convertFileSrc(savedFile.uri),
      fileSize: blob.size,
      date: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error guardando foto:', error)
    throw error
  }
}

// Watch para asegurar que el video se mantenga conectado al stream
watch(currentStep, async () => {
  if (!isNative.value && stream.value) {
    await nextTick()
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      videoRef.value.play().catch(console.error)
    }
  }
})

// Ciclo de vida
onMounted(async () => {
  currentStep.value = 'front'
  emit('stepChange', { step: 'front', stepIndex: 0 })
  
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

<style scoped src="@/assets/css/document-component.css"></style>