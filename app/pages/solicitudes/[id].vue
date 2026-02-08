<template>
  <div class="min-h-screen  py-8 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
        <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
        <p class="text-gray-600 dark:text-gray-400 font-medium">Cargando detalles de la solicitud...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error"
        class="bg-linear-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-8 rounded-2xl text-center shadow-lg">
        <Icon name="lucide:alert-circle" class="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400" />
        <h3 class="text-xl font-bold mb-2">Error al cargar la solicitud</h3>
        <p class="mb-4">{{ error }}</p>
        <Button class="mt-4" variant="outline" @click="cargarSolicitud">
          Reintentar
        </Button>
      </div>

      <!-- Solicitud Details -->
      <div v-else-if="solicitud" class="space-y-6">
        <!-- Header -->
        <SolicitudHeader :numero-solicitud="numeroSolicitudDisplay"
          :estado-nombre="getEstadoNombre(String(solicitud.estado || ''))"
          :badge-class="getEstadoBadgeClass(String(solicitud.estado || ''))" />

        <!-- Timeline del Proceso -->
        <SolicitudTimeline :estados="estadosTimelineConFechas" :estado-actual-id="solicitud?.estado"
          :fecha-envio="solicitud?.timeline?.find(t => t.estado === solicitud?.estado)?.fecha" />

        <!-- Información General -->
        <InfoGeneral :numero-solicitud="numeroSolicitudDisplay"
          :monto-solicitado="fmtMoney(solicitud?.payload?.solicitud?.valor_solicitud || 0)"
          :plazo-meses="solicitud.plazo_meses || 0" :fecha-creacion="fmtDate(solicitud.created_at)"
          :linea-credito="solicitud?.payload?.linea_credito?.detalle_modalidad || '-'" />

        <!-- Datos del Solicitante -->
        <DatosSolicitante
          :nombres-apellidos="`${solicitud?.payload?.solicitante?.nombres || ''} ${solicitud?.payload?.solicitante?.apellidos || ''}`.trim() || '-'"
          :tipo-identificacion="buscarTipoIdentificacion(solicitud?.payload?.solicitante?.tipo_documento) || '-'"
          :numero-identificacion="solicitud?.payload?.solicitante?.numero_documento || '-'"
          :fecha-nacimiento="solicitud?.payload?.solicitante?.fecha_nacimiento || '-'"
          :telefono="solicitud?.payload?.solicitante?.telefono || solicitud?.payload?.solicitante?.celular || '-'"
          :email="solicitud?.payload?.solicitante?.email || '-'"
          :direccion="solicitud?.payload?.solicitante?.direccion || '-'"
          :ciudad="buscarCiudad(solicitud?.payload?.solicitante?.ciudad) || '-'" :tipo-vivienda="'-'"
          :personas-a-cargo="0" :categoria="solicitud?.payload?.solicitud?.categoria || '-'"
          :salario="fmtMoney(solicitud?.payload?.solicitante?.salario || 0)"
          :empresa-nit="solicitud?.payload?.solicitante?.nit || '-'"
          :empresa-razon-social="solicitud?.payload?.solicitante?.razon_social || '-'" />

        <!-- Información Laboral -->
        <InfoLaboral :empresa-razon-social="solicitud?.payload?.informacion_laboral?.empresa_razon_social || '-'"
          :empresa-nit="solicitud?.payload?.informacion_laboral?.empresa_nit || '-'"
          :empresa-direccion="solicitud?.payload?.informacion_laboral?.empresa_direccion || '-'"
          :empresa-telefono="solicitud?.payload?.informacion_laboral?.empresa_telefono || '-'"
          :empresa-ciudad="buscarCiudad(solicitud?.payload?.informacion_laboral?.empresa_ciudad) || '-'"
          :cargo="buscarCargo(solicitud?.payload?.informacion_laboral?.cargo) || '-'"
          :fecha-ingreso="solicitud?.payload?.informacion_laboral?.fecha_ingreso || '-'"
          :tiempo-servicio="`${solicitud?.payload?.informacion_laboral?.tiempo_servicio || 0} ${solicitud?.payload?.informacion_laboral?.tiempo_servicio_unidad || 'años'}`"
          :tipo-contrato="solicitud?.payload?.informacion_laboral?.tipo_contrato || '-'" />

        <!-- Información Financiera -->
        <InfoFinanciera :salario-basico="fmtMoney(solicitud?.payload?.ingresos_descuentos?.salario_basico_mensual || 0)"
          :subsidio-transporte="fmtMoney(solicitud?.payload?.ingresos_descuentos?.subsidio_transporte || 0)"
          :salud-pension="fmtMoney(solicitud?.payload?.ingresos_descuentos?.salud_pension || 0)"
          :total-ingresos="fmtMoney(solicitud?.payload?.ingresos_descuentos?.total_ingresos || 0)"
          :total-descuentos="fmtMoney(solicitud?.payload?.ingresos_descuentos?.total_descuentos || 0)"
          :neto-recibido="fmtMoney(solicitud?.payload?.ingresos_descuentos?.total_neto_recibido || 0)" />

        <!-- Información Económica -->
        <InfoEconomica :total-activos="fmtMoney(solicitud?.payload?.informacion_economica?.total_activos || 0)"
          :total-pasivos="fmtMoney(solicitud?.payload?.informacion_economica?.total_pasivos || 0)"
          :arrendamientos="fmtMoney(solicitud?.payload?.informacion_economica?.arrendamientos || 0)"
          :otros-gastos="fmtMoney(solicitud?.payload?.informacion_economica?.total_gastos || 0)"
          :gastos-descripcion="solicitud?.payload?.informacion_economica?.gastos_descripcion"
          :descripcion-actividades="solicitud?.payload?.informacion_economica?.descripcion" />

        <!-- Documentos Cargados -->
        <DocumentosCard :documentos="solicitud.documentos || []" />

        <!-- Acciones -->
        <AccionesCard :solicitud-id="solicitud.numero_solicitud"
          :mostrar-enviar="solicitud.estado === 'DOCUMENTOS_CARGADOS' || solicitud.estado === 'POSTULADO'"
          :tiene-pdf="solicitud.estado === 'ENVIADO_VALIDACION'" @descargar-pdf="descargarPdf"
          @eliminar="mostrarModalEliminar = true" />

        <!-- Modal de confirmación de eliminación -->
        <Dialog v-model:open="mostrarModalEliminar">
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle class="flex items-center gap-2">
                <AlertTriangle class="h-5 w-5 text-destructive" />
                Eliminar Solicitud
              </DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea eliminar esta solicitud? Esta acción no se
                puede deshacer y se perderán todos los datos asociados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter class="flex gap-2 sm:gap-0">
              <Button variant="outline" @click="mostrarModalEliminar = false" :disabled="eliminando">
                Cancelar
              </Button>
              <Button variant="destructive" @click="eliminarSolicitud" :disabled="eliminando">
                <Loader2 v-if="eliminando" class="h-4 w-4 mr-2 animate-spin" />
                {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/exports'
import SolicitudHeader from '@/components/solicitudes/SolicitudHeader.vue'
import SolicitudTimeline from '@/components/shared/SolicitudTimeline.vue'
import InfoGeneral from '@/components/solicitudes/InfoGeneral.vue'
import DatosSolicitante from '@/components/solicitudes/DatosSolicitante.vue'
import InfoLaboral from '@/components/solicitudes/InfoLaboral.vue'
import InfoFinanciera from '@/components/solicitudes/InfoFinanciera.vue'
import InfoEconomica from '@/components/solicitudes/InfoEconomica.vue'
import DocumentosCard from '@/components/solicitudes/DocumentosCard.vue'
import AccionesCard from '@/components/solicitudes/AccionesCard.vue'
import { useSolicitudDetailsPage } from '~/composables/solicitud/useSolicitudDetailsPage'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const {
  // Estado principal
  solicitud,
  loading,
  error,
  mostrarModalEliminar,
  eliminando,

  // Datos computados
  numeroSolicitudDisplay,
  estadosTimelineConFechas,

  // Funciones de parámetros
  buscarTipoIdentificacion,
  buscarCiudad,
  buscarCargo,
  buscarTipoVivienda,
  buscarTipoContrato,
  getEstadoNombre,
  getEstadoBadgeClass,

  // Funciones de utilidad
  fmtMoney,
  fmtDate,

  // Funciones principales
  cargarSolicitud,
  descargarPdf,
  eliminarSolicitud
} = useSolicitudDetailsPage()
</script>
