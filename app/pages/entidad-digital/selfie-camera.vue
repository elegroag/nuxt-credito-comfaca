<template>
  <div class="selfie-camera-page">
    <div class="progress-header">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>
    <main class="main-content">
      <div class="selfie-wrapper">
        <SelfieCamera @complete="handleSelfieComplete" @cancel="handleCancel"></SelfieCamera>
      </div>
    </main>
    <footer class="page-footer">
      <button @click="goBack" class="nav-btn secondary-btn" :disabled="processing">Atrás</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SelfieCamera from '@/components/SelfieCamera.vue'
import { useDocumentosPostulante } from '~/composables/entidad/useDocumentosPostulante'

const router = useRouter()

// Composable para documentos
const { guardarSelfie, loading: savingSelfie, errorMsg: saveError } = useDocumentosPostulante()
const { getJson } = useApi()

const currentStepIndex = ref(1)
const processing = ref(false)
const documentsData = ref<{ front: string; back: string } | null>(null)
const basicData = ref<any>(null)

// Cargar documentos y datos básicos al montar
onMounted(() => {
  const savedDocuments = localStorage.getItem('capturedDocuments')
  const savedBasicData = localStorage.getItem('basicFormData')
  
  if (savedDocuments) {
    documentsData.value = JSON.parse(savedDocuments)
  } else {
    // Si no hay documentos, redirigir a document-camera
    router.push('/entidad-digital/document-camera')
  }
  
  if (savedBasicData) {
    basicData.value = JSON.parse(savedBasicData)
  }
})

const steps = [
  { label: 'Documentos', key: 'documents' },
  { label: 'Selfie', key: 'selfie' },
  { label: 'Confirmación', key: 'summary' }
]

const progressPercentage = computed(() => {
  return ((currentStepIndex.value + 1) / steps.length) * 100
})

const handleSelfieComplete = async (args: { selfie: string }) => {
  try {
    processing.value = true
    const documents = JSON.parse(localStorage.getItem('capturedDocuments') || '{}')
    
    // Enviar selfie al servidor
    if (basicData.value) {
      await guardarSelfie(args.selfie, basicData.value)
      
      if (saveError.value) {
        alert('Error al guardar selfie en el servidor: ' + saveError.value)
        return
      }
      
      // Obtener documentos completos del servidor
      try {
        const response = await getJson('/api/entidad-digital/documentos') as any
        
        if (response.success) {
          const completeData = {
            ...basicData.value,
            documents: {
              front: response.documentos.front || documents.front,
              back: response.documentos.back || documents.back
            },
            selfie: response.documentos.selfie || args.selfie
          }
          localStorage.setItem('completeVerificationData', JSON.stringify(completeData))
        } else {
          // Fallback: usar datos locales si falla el servidor
          const completeData = {
            ...basicData.value,
            documents: documents,
            selfie: args.selfie
          }
          localStorage.setItem('completeVerificationData', JSON.stringify(completeData))
        }
      } catch (error) {
        console.error('Error obteniendo documentos del servidor:', error)
        // Fallback: usar datos locales
        const completeData = {
          ...basicData.value,
          documents: documents,
          selfie: args.selfie
        }
        localStorage.setItem('completeVerificationData', JSON.stringify(completeData))
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
    router.push('/entidad-digital/confirmation')
  } catch (error) {
    console.error('Error procesando selfie:', error)
    alert('Error al procesar la selfie. Por favor intenta nuevamente.')
  } finally {
    processing.value = false
  }
}

const handleCancel = () => {
  if (confirm('¿Estás seguro de que deseas cancelar el proceso?')) {
    localStorage.removeItem('capturedDocuments')
    localStorage.removeItem('completeVerificationData')
    router.push('/entidad-digital')
  }
}

const goBack = () => {
  if (confirm('¿Estás seguro de que deseas regresar?')) {
    localStorage.removeItem('completeVerificationData')
    router.push('/entidad-digital/document-camera')
  }
}
</script>

<style scoped src="@/assets/css/selfie-camera.css"></style>
