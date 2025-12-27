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
import { storage } from '~/composables/useStorage'
import { useApi } from '~/composables/useApi'

const router = useRouter()

// Composable para documentos
const { guardarSelfie, loading: savingSelfie, errorMsg: saveError } = useDocumentosPostulante()
const { getJson, postJson } = useApi()

const currentStepIndex = ref(1)
const processing = ref(false)
const documentsData = ref<{ front: string; back: string } | null>(null)
const basicData = ref<any>(null)

// Cargar documentos y datos básicos al montar
onMounted(async () => {
  const savedDocuments = await storage.getItem('capturedDocuments')
  const savedBasicData = await storage.getItem('basicFormData')
  
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
    const documents = JSON.parse((await storage.getItem('capturedDocuments')) || '{}')
    
    // Enviar selfie al servidor
    if (basicData.value) {
      console.log('basicData.value:', basicData.value)
      console.log('basicData.value.numeroIdentificacion:', basicData.value.numeroIdentificacion)
      
      if (!basicData.value.numeroIdentificacion) {
        alert('Error: No se encontró el número de identificación. Por favor regresa y completa el formulario.')
        router.push('/entidad-digital')
        return
      }
      
      await guardarSelfie(args.selfie, basicData.value)
      
      if (saveError.value) {
        alert('Error al guardar selfie en el servidor: ' + saveError.value)
        return
      }
      
      // Obtener documentos completos del servidor
      try {
        const tipo = encodeURIComponent(basicData.value.tipoIdentificacion)
        const numero = encodeURIComponent(basicData.value.numeroIdentificacion)
        const response = await getJson(`/api/entidad-digital/documentos/${tipo}/${numero}`) as any;
        console.log('Response from server:', response);
        if (response.success) {
          const completeData = {
            ...basicData.value,
            documents: {
              front: response.documentos.front || documents.front,
              back: response.documentos.back || documents.back
            },
            selfie: response.documentos.selfie || args.selfie
          }
          await storage.setItem('completeVerificationData', JSON.stringify(completeData))
        } else {
          // Fallback: usar datos locales si falla el servidor
          const completeData = {
            ...basicData.value,
            documents: documents,
            selfie: args.selfie
          }
          await storage.setItem('completeVerificationData', JSON.stringify(completeData))
        }
      } catch (error) {
        console.error('Error obteniendo documentos del servidor:', error)
        // Fallback: usar datos locales
        const completeData = {
          ...basicData.value,
          documents: documents,
          selfie: args.selfie
        }
        await storage.setItem('completeVerificationData', JSON.stringify(completeData))
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

const handleCancel = async () => {
  if (confirm('¿Estás seguro de que deseas cancelar el proceso?')) {
    await storage.removeItem('capturedDocuments')
    await storage.removeItem('completeVerificationData')
    router.push('/entidad-digital')
  }
}

const goBack = async () => {
  if (confirm('¿Estás seguro de que deseas regresar?')) {
    await storage.removeItem('completeVerificationData')
    router.push('/entidad-digital/document-camera')
  }
}
</script>

<style scoped src="@/assets/css/selfie-camera.css"></style>
