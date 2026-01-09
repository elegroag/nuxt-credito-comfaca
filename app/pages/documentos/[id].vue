<template>
  <div class="container mx-auto py-8 px-4 max-w-5xl">
    <h1 class="text-2xl font-bold mb-8 text-center text-gray-800">Carga de Documentos</h1>
    
    <SharedProgresoSteps 
      current-step="documentos" 
      class="mb-12"
      @navigate="handleNavigation" 
    />

    <div v-if="loadingSolicitud" class="flex flex-col items-center justify-center py-16 space-y-4">
      <Icon name="lucide:loader-2" class="w-10 h-10 animate-spin text-primary" />
      <p class="text-gray-500">Cargando información de la solicitud...</p>
    </div>

    <div v-else-if="errorSolicitud" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
      <Icon name="lucide:alert-circle" class="w-8 h-8 mx-auto mb-2 text-red-500" />
      <h3 class="font-bold mb-1">Error al cargar la solicitud</h3>
      <p>{{ errorSolicitud }}</p>
      <UiButton class="mt-4" variant="outline" @click="cargarSolicitud">Reintentar</UiButton>
    </div>

    <div v-else-if="solicitud" class="space-y-8 animate-in fade-in duration-500">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-5 flex items-start gap-4">
        <Icon name="lucide:info" class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-medium text-blue-900 mb-1">Documentos Requeridos</h3>
          <p class="text-sm text-blue-800">
            Para continuar con su solicitud de crédito<strong>{{ solicitud?.lineaCredito?.nombre || '' }}</strong>, 
            por favor cargue los documentos listados a continuación. 
            Asegúrese de que sean legibles y estén en formato PDF, JPG o PNG.
          </p>
        </div>
      </div>

      <div class="grid gap-6">
        <div 
          v-for="docReq in documentosRequeridos" 
          :key="docReq.id"
          class="border rounded-xl p-6 bg-white shadow-sm transition-all hover:shadow-md"
          :class="{ 'border-primary ring-1 ring-primary/20': getDocumentoCargado(docReq.id) }"
        >
          <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="font-semibold text-lg text-gray-900">
                  {{ docReq.nombre }}
                </h3>
                <UiBadge v-if="docReq.obligatorio" variant="destructive" class="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                  Obligatorio
                </UiBadge>
                <UiBadge v-else variant="secondary" class="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200">
                  Opcional
                </UiBadge>
              </div>
              <p class="text-sm text-gray-500 mb-4">
                {{ docReq.descripcion || 'Sin descripción disponible.' }}
              </p>
              
              <DocumentosUpload
                :model-value="getDocumentoCargado(docReq.id)"
                :loading="cargandoId === docReq.id"
                :progress="progreso"
                :error="cargandoId === docReq.id ? errorUpload : null"
                @upload="(file) => handleUpload(file, docReq.id)"
                @delete="(id) => handleDelete(id)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-12 pt-6 border-t">
        <UiButton variant="outline" @click="handleBack" class="gap-2">
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          Volver a la Solicitud
        </UiButton>
        
        <div class="flex flex-col items-end gap-2">
          <UiButton 
            size="lg"
            :disabled="!puedeContinuar" 
            @click="handleContinue"
            class="gap-2 min-w-[200px]"
          >
            Continuar a Firma
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </UiButton>
          <p v-if="!puedeContinuar" class="text-xs text-red-500 font-medium">
            Faltan documentos obligatorios por cargar
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useSession } from '~/composables/useSession'
import { useDocumentos } from '~/composables/documentos/useDocumentos'
import type { SolicitudCredito, DocumentoCargado } from '~/shared/types/solicitud-credito'
import DocumentosUpload from '~/components/documentos/DocumentosUpload.vue'

const route = useRoute()
const router = useRouter()
const { getJson } = useApi()
const { ready } = useSession()

const solicitudId = route.params.id as string
const { 
  subirDocumento, 
  eliminarDocumento, 
  cargarDocumentosExistentes, 
  documentosCargados,
  progreso, 
  error: errorUpload 
} = useDocumentos(solicitudId)

const solicitud = ref<SolicitudCredito | null>(null)
const loadingSolicitud = ref(true)
const errorSolicitud = ref<string | null>(null)
const cargandoId = ref<string | null>(null)

const documentosRequeridos = computed(() => {
  return solicitud.value?.lineaCredito?.documentos || []
})

const getDocumentoCargado = (reqId: string) => {
  return documentosCargados.value.find(d => d.documentoRequeridoId === reqId)
}

const puedeContinuar = computed(() => {
  if (!solicitud.value) return false
  const obligatorios = documentosRequeridos.value.filter(d => d.obligatorio)
  return obligatorios.every(req => getDocumentoCargado(req.id))
})

const cargarSolicitud = async () => {
  loadingSolicitud.value = true
  errorSolicitud.value = null
  try {
    await ready
    // Cargar datos de la solicitud
    solicitud.value = await getJson<SolicitudCredito>(`/api/solicitudes-credito/${solicitudId}`, { auth: true })
    
    // Cargar documentos ya subidos
    await cargarDocumentosExistentes()
  } catch (e: any) {
    console.error(e)
    errorSolicitud.value = e.message || 'No se pudo cargar la información de la solicitud.'
  } finally {
    loadingSolicitud.value = false
  }
}

const handleUpload = async (file: File, docReqId: string) => {
  cargandoId.value = docReqId
  try {
    await subirDocumento(file, docReqId)
  } catch (e) {
    // El error ya se maneja en el composable y se pasa via prop
  } finally {
    cargandoId.value = null
  }
}

const handleDelete = async (docCargadoId: string) => {
  // Encontrar a qué requerimiento pertenece para mostrar loading si es necesario
  // Aunque eliminar es rápido, podemos mostrar loading global o local
  const doc = documentosCargados.value.find(d => d.id === docCargadoId)
  if (doc) {
    cargandoId.value = doc.documentoRequeridoId
  }
  
  try {
    await eliminarDocumento(docCargadoId)
  } catch (e) {
    console.error(e)
  } finally {
    cargandoId.value = null
  }
}

const handleNavigation = (step: string) => {
  // Navegación simple por ahora
  if (step === 'formulario') {
    // Ir atrás? Depende de si se puede editar
  }
}

const handleBack = () => {
  // Volver a la lista de solicitudes o al paso anterior si fuera wizard
  router.push('/solicitudes') // O window.history.back()
}

const handleContinue = () => {
  if (puedeContinuar.value) {
    router.push(`/firmado/${solicitudId}`)
  }
}

onMounted(() => {
  if (solicitudId) {
    cargarSolicitud()
  } else {
    errorSolicitud.value = 'ID de solicitud no válido'
    loadingSolicitud.value = false
  }
})
</script>
