<template>
  <div class="document-camera-page">
    <!-- Barra de progreso -->
    <div class="progress-header">
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="progress-step"
            :class="{ 
              active: currentStepIndex === index, 
              completed: currentStepIndex > index 
            }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="main-content">
      <div class="camera-wrapper">
        <DocumentCamera 
          @complete="handleDocumentComplete"
          @cancel="handleCancel"
          @stepChange="handleStepChange"
        />
      </div>
    </main>

    <!-- Botones de navegación -->
    <footer class="page-footer">
      <button 
        @click="goBack" 
        class="nav-btn secondary-btn"
        :disabled="processing"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Atrás
      </button>
      
      <div class="footer-info">
        <p>{{ currentStepDescription }}</p>
      </div>
    </footer>

    <!-- Overlay de procesamiento -->
    <div v-if="processing" class="processing-overlay">
      <div class="processing-content">
        <div class="spinner"></div>
        <p>Procesando documentos...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DocumentCamera from '@/components/DocumentCamera.vue'

const router = useRouter()

// Estado del proceso
const currentStepIndex = ref(0)
const processing = ref(false)
const documents = ref({ front: null, back: null })

// Definición de pasos del proceso
const steps = [
  { label: 'Frente', key: 'front' },
  { label: 'Reverso', key: 'back' },
  { label: 'Confirmación', key: 'summary' }
]

// Computed properties
const progressPercentage = computed(() => {
  return ((currentStepIndex.value + 1) / steps.length) * 100
})

const currentStepDescription = computed(() => {
  const descriptions = [
    'Captura el frente de tu documento de identificación',
    'Captura el reverso de tu documento de identificación',
    'Revisa y confirma las imágenes capturadas'
  ]
  return descriptions[currentStepIndex.value] || ''
})

// Métodos
const handleStepChange = ({ stepIndex }) => {
  currentStepIndex.value = stepIndex
}

const handleDocumentComplete = async (documentData) => {
  try {
    processing.value = true
    documents.value = documentData
    
    // Guardar documentos en localStorage
    localStorage.setItem('capturedDocuments', JSON.stringify(documentData))
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Navegar al siguiente paso del proceso
    router.push('/entidad-digital/selfie-camera')
  } catch (error) {
    console.error('Error procesando documentos:', error)
    alert('Error al procesar los documentos. Por favor intenta nuevamente.')
  } finally {
    processing.value = false
  }
}

const handleCancel = () => {
  if (confirm('¿Estás seguro de que deseas cancelar el proceso? Se perderán las imágenes capturadas.')) {
    localStorage.removeItem('capturedDocuments')
    router.push('/entidad-digital')
  }
}

const goBack = () => {
  if (confirm('¿Estás seguro de que deseas regresar? Se perderán las imágenes capturadas.')) {
    localStorage.removeItem('capturedDocuments')
    router.push('/entidad-digital')
  }
}
</script>

<style scoped src="../assets/css/document-camera.css"></style>