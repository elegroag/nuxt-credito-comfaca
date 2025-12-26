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

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SelfieCamera from '@/components/SelfieCamera.vue'

const router = useRouter()

const currentStepIndex = ref(1)
const processing = ref(false)

const steps = [
  { label: 'Documentos', key: 'documents' },
  { label: 'Selfie', key: 'selfie' },
  { label: 'Confirmación', key: 'summary' }
]

const progressPercentage = computed(() => {
  return ((currentStepIndex.value + 1) / steps.length) * 100
})

const handleSelfieComplete = async (selfieImage) => {
  try {
    processing.value = true
    const documents = JSON.parse(localStorage.getItem('capturedDocuments') || '{}')
    const completeData = {
      documents: documents,
      selfie: selfieImage
    }
    localStorage.setItem('completeVerificationData', JSON.stringify(completeData))
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
