<template>
  <div class="mx-auto max-w-4xl p-4 sm:p-8">
    <!-- Tarjeta principal de agradecimiento -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <CheckCircle class="h-8 w-8 text-green-600" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-4">¡Gracias por completar tu solicitud!</h1>
      <p class="text-lg text-gray-600 mb-8">
        Tu solicitud de crédito ha sido enviada exitosamente para validación por nuestros asesores.
      </p>
    </div>

    <!-- Información de seguimiento -->
    <Card class="mb-8">
      <CardContent class="p-6">
        <h2 class="text-xl font-semibold mb-4 text-center">Información de seguimiento</h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Número de solicitud</label>
              <div class="mt-1">
                <span class="text-lg font-semibold text-gray-900">{{ solicitudId }}</span>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Estado actual</label>
              <div class="mt-1">
                <Badge variant="secondary" class="text-sm">
                  Enviado para validación
                </Badge>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Fecha de envío</label>
              <div class="mt-1">
                <span class="text-gray-900">{{ fechaEnvio }}</span>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Próximos pasos</label>
              <div class="mt-1 text-sm text-gray-600">
                <ul class="space-y-2">
                  <li class="flex items-start">
                    <CheckCircle class="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Revisión por equipo de asesores</span>
                  </li>
                  <li class="flex items-start">
                    <Clock class="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Validación de documentos</span>
                  </li>
                  <li class="flex items-start">
                    <Mail class="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Notificación por correo electrónico</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Timeline del proceso -->
    <SolicitudTimeline
      :estados="estadosTimeline"
      :estado-actual-id="'ENVIADO_VALIDACION'"
      :fecha-envio="fechaEnvio"
    />

    <!-- Acciones disponibles -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mt-6">
      <Button @click="descargarComprobante" variant="outline" class="flex items-center gap-2 bg-white text-gray-900">
        <Download class="h-4 w-4" />
        Descargar comprobante
      </Button>
      
      <Button @click="irAlDashboard" class="flex items-center gap-2 w-full sm:w-auto">
        <Home class="h-4 w-4" />
        Ir al dashboard
      </Button>
    </div>

    <!-- Información de contacto -->
    <Card class="mt-8 bg-blue-50 border-blue-200">
      <CardContent class="p-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
          <p class="text-blue-700 mb-4">
            Puedes contactarnos para cualquier pregunta sobre tu solicitud
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <div class="flex items-center gap-2 text-blue-700">
              <Mail class="h-4 w-4" />
              <span>creditos@comfaca.com</span>
            </div>
            <div class="flex items-center gap-2 text-blue-700">
              <Phone class="h-4 w-4" />
              <span>+(57) 1 234 5678</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle, Clock, Mail, Phone, Download, Home, FileText } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import SolicitudTimeline from '~/components/shared/SolicitudTimeline.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()

// Obtener ID de la solicitud desde la ruta
const solicitudId = computed(() => route.params.id as string)

// Fecha actual formateada
const fechaEnvio = computed(() => {
  return new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Estados para el timeline
const estadosTimeline = computed(() => [
  {
    id: 'POSTULADO',
    nombre: 'Postulado',
    descripcion: 'Solicitud recién creada y postulada'
  },
  {
    id: 'DOCUMENTOS_CARGADOS',
    nombre: 'Documentos cargados',
    descripcion: 'Todos los documentos han sido cargados y validados'
  },
  {
    id: 'ENVIADO_VALIDACION',
    nombre: 'Enviado para validación',
    descripcion: 'Enviado para validación de asesores'
  },
  {
    id: 'PENDIENTE_FIRMADO',
    nombre: 'Pendiente de firmado',
    descripcion: 'Solicitud en proceso de firmado'
  },
  {
    id: 'ENVIADO_PENDIENTE_APROBACION',
    nombre: 'Enviado para aprobación',
    descripcion: 'Solicitud enviada y pendiente de aprobación'
  },
  {
    id: 'APROBADO',
    nombre: 'Aprobado',
    descripcion: 'Solicitud aprobada y lista para desembolso'
  }
])

// Métodos
const descargarComprobante = () => {
  // Lógica para descargar el comprobante PDF
  window.open(`/api/solicitudes/${solicitudId.value}/generar-pdf`, '_blank')
}

const irAlDashboard = () => {
  router.push('/dashboard')
}

// Cargar datos de la solicitud si es necesario
onMounted(async () => {
  // Aquí podrías cargar información adicional de la solicitud
  console.log('Solicitud ID:', solicitudId.value)
})
</script>