<template>
  <div class="container mx-auto py-8 px-4 max-w-5xl">
    <h1 class="text-2xl font-bold mb-8 text-center text-gray-800">Firma Digital</h1>
    
    <SharedProgresoSteps 
      current-step="firmado" 
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
      
      <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div class="p-6 border-b bg-gray-50">
          <h2 class="text-lg font-semibold text-gray-900">Firmar Solicitud #{{ solicitud.payload.solicitud.numero_solicitud }}</h2>
          <p class="text-sm text-gray-500 mt-1">
            Por favor revise el documento y proceda con la firma digital.
          </p>
        </div>

        <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Columna Izquierda: Formulario de Firma -->
          <div class="space-y-6">
            <div v-if="!hasXmlFilename" class="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              <p class="font-medium flex items-center gap-2">
                <Icon name="lucide:alert-triangle" class="w-4 h-4" />
                Atención
              </p>
              <p class="mt-1">
                No se ha encontrado el archivo XML asociado a esta solicitud. 
                Por favor contacte a soporte o intente regenerarlo.
              </p>
            </div>

            <template v-else>
              <div class="space-y-4">
                <div>
                  <UiLabel>Firmante</UiLabel>
                  <UiInput :model-value="nombreApellidos" readonly class="bg-gray-50" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <UiLabel>Tipo Identificación</UiLabel>
                    <UiInput :model-value="tipoIdentificacion" readonly class="bg-gray-50" />
                  </div>
                  <div>
                    <UiLabel>Número</UiLabel>
                    <UiInput :model-value="numeroIdentificacion" readonly class="bg-gray-50" />
                  </div>
                </div>

                <div>
                   <UiLabel>Rol</UiLabel>
                   <select 
                      v-model="rolFirmante" 
                      class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="solicitante">Solicitante</option>
                      <option value="codeudor">Codeudor</option>
                   </select>
                </div>

                <div class="border-t pt-4 mt-4">
                  <UiLabel class="mb-2 block">Clave de Firma Segura</UiLabel>
                  <UiInput 
                    v-model="claveFirma" 
                    type="password" 
                    placeholder="Ingrese su clave de firma"
                  />
                  <p class="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
                </div>

                 <div>
                  <UiLabel class="mb-2 block">Confirmar Clave</UiLabel>
                  <UiInput 
                    v-model="claveFirmaConfirm" 
                    type="password" 
                    placeholder="Confirme su clave"
                  />
                </div>

                <div class="flex items-center gap-2 mt-2">
                   <input type="checkbox" id="confirm-terms" v-model="aprobado" class="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                   <label for="confirm-terms" class="text-sm text-gray-700">Declaro que la información es correcta y acepto los términos.</label>
                </div>

                <div v-if="errorMsg" class="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                  {{ errorMsg }}
                </div>

                <UiButton 
                  class="w-full mt-4" 
                  size="lg" 
                  :disabled="loading || !canSign" 
                  @click="handleFirmar"
                >
                  <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                  {{ loading ? 'Firmando...' : 'Firmar Documento' }}
                </UiButton>
              </div>
            </template>
          </div>

          <!-- Columna Derecha: Previsualización o Estado -->
          <div class="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] border border-gray-200">
             <div v-if="savedFilename" class="text-center space-y-4 animate-in zoom-in duration-300">
                <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="lucide:check-circle-2" class="w-8 h-8" />
                </div>
                <h3 class="text-xl font-bold text-gray-900">¡Firma Exitosa!</h3>
                <p class="text-gray-600">El documento ha sido firmado y guardado correctamente.</p>
                <div class="p-3 bg-white rounded border text-xs text-gray-500 break-all">
                  {{ savedFilename }}
                </div>
                <UiButton @click="finalizarProceso" class="mt-4">
                  Finalizar Proceso
                </UiButton>
             </div>
             
             <div v-else class="text-center text-gray-500 space-y-4">
                <Icon name="lucide:file-signature" class="w-16 h-16 mx-auto opacity-20" />
                <p>El documento XML asociado será firmado digitalmente con sus credenciales.</p>
                <div v-if="solicitud.xml_filename" class="text-xs bg-gray-200 px-2 py-1 rounded inline-block">
                  {{ solicitud.xml_filename }}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-start">
         <UiButton variant="ghost" @click="handleBack">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Volver a Documentos
        </UiButton>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useSession } from '~/composables/useSession'
import { useFirmas } from '~/composables/firmas/useFirmas'
import type { SolicitudCredito } from '~/shared/types/solicitud-credito'

const route = useRoute()
const router = useRouter()
const { getJson, postJson, urlFor } = useApi() // Asegurar que tenemos acceso a fetch si es necesario, aunque useApi devuelve wrappers
const { ready } = useSession()
const solicitudId = route.params.id as string

const solicitud = ref<SolicitudCredito | null>(null)
const loadingSolicitud = ref(true)
const errorSolicitud = ref<string | null>(null)

// Usamos el composable existente de firmas
const {
  solicitudFilename,
  firmasFilename,
  rolFirmante,
  aprobado,
  nombreApellidos,
  tipoIdentificacion,
  numeroIdentificacion,
  claveFirma,
  claveFirmaConfirm,
  loading,
  errorMsg,
  savedFilename,
  firmar,
  resetForm,
  validateForm
} = useFirmas()

const hasXmlFilename = computed(() => {
  return !!solicitud.value?.xml_filename
})

const canSign = computed(() => {
  return claveFirma.value.length >= 10 && 
         claveFirma.value === claveFirmaConfirm.value && 
         aprobado.value &&
         !loading.value
})

const cargarSolicitud = async () => {
  loadingSolicitud.value = true
  errorSolicitud.value = null
  try {
    const response = await getJson<{success: boolean, data: SolicitudCredito}>(`/api/solicitudes-credito/${solicitudId}`, { auth: true })
    solicitud.value = response.data
    
    if (solicitud.value) {
        // Pre-llenar datos del firmante desde la solicitud
        const solicitante = solicitud.value.payload.solicitante
        
        // Asignar valores al composable de firmas
        nombreApellidos.value = solicitante.nombres_apellidos
        tipoIdentificacion.value = solicitante.tipo_identificacion as any
        numeroIdentificacion.value = solicitante.numero_identificacion
        
        // Si hay nombre de archivo XML, lo asignamos
        if (solicitud.value.xml_filename) {
            solicitudFilename.value = solicitud.value.xml_filename
        }
        
        // Resetear otros campos
        claveFirma.value = ''
        claveFirmaConfirm.value = ''
        aprobado.value = true
        errorMsg.value = ''
        savedFilename.value = ''
    }

  } catch (e: any) {
    console.error(e)
    errorSolicitud.value = e.message || 'No se pudo cargar la información de la solicitud.'
  } finally {
    loadingSolicitud.value = false
  }
}

const handleFirmar = async () => {
    if (!canSign.value) return
    
    await firmar()
    
    if (savedFilename.value) {
        // Si la firma fue exitosa, actualizamos el estado de la solicitud y el archivo XML asociado
        try {
             const { authHeader } = useSession()
             
             // 1. Actualizar el nombre del archivo XML en la solicitud
             await $fetch(urlFor(`/api/solicitudes-credito/${solicitudId}`), {
                method: 'PATCH',
                body: {
                    xml_filename: savedFilename.value
                },
                headers: {
                    ...authHeader.value as any
                }
             })

             // 2. Actualizar el estado a "Firmado"
             await $fetch(urlFor(`/api/solicitudes-credito/${solicitudId}/estado`), {
                method: 'PATCH',
                body: {
                    estado: 'Firmado',
                    detalle: 'Firma digital aplicada exitosamente'
                },
                headers: {
                    ...authHeader.value as any
                }
             })
             
        } catch (e) {
            console.error('Error actualizando solicitud tras firma', e)
            // No bloqueamos el éxito visual de la firma, pero logueamos
        }
    }
}

const finalizarProceso = () => {
    router.push('/solicitudes') // O a una página de éxito final
}

const handleBack = () => {
    router.push(`/documentos/${solicitudId}`)
}

const handleNavigation = (step: string) => {
    // Lógica de navegación del wizard
}

onMounted(() => {
    if (solicitudId) {
        cargarSolicitud()
    } else {
        errorSolicitud.value = 'ID de solicitud no válido'
        loadingSolicitud.value = false
    }
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
