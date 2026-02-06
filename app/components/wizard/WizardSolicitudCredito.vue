<template>
  <Card class="border-border shadow-sm">
    <WizardHeader :current-step="step" :total-steps="steps.length" :title="steps[step]?.title || ''" :steps="steps"
      :primary-button-text="loadingXml ? 'Enviando...' : loadingPdf ? 'Generando PDF...' : 'Enviar'"
      :primary-button-disabled="loadingXml || loadingPdf" @prev="prev" @next="next" @step-change="step = $event"
      @primary-action="guardarSolicitud()" />

    <CardContent class="p-4 sm:p-6">
      <form class="grid gap-4" @submit.prevent>
        <!-- Componentes destructurados por paso -->
        <SolicitudStep v-if="steps[step]?.key === 'solicitud'" :form="form" :fecha-radicado="fechaRadicado" />

        <SolicitanteStep v-else-if="steps[step]?.key === 'solicitante'" :form="form"
          :ciudades="props.parametros?.ciudades || []" :tipos-documento="props.parametros?.codigos_tipo_documento || []"
          :sexos="props.parametros?.sexos || []" :niveles-educativos="props.parametros?.nivel_educativos || []"
          :tipos-vivienda="props.parametros?.tipo_vivienda || []" :ocupaciones="props.parametros?.ocupaciones || []"
          :estado-civiles="props.parametros?.estado_civiles || []" />

        <ConyugeStep v-else-if="steps[step]?.key === 'conyuge'" :form="form" :toggle-conyuge="toggleConyugeHandler"
          :toggle-empresa-conyuge="toggleEmpresaConyuge" :loading-conyuge="loadingConyuge" />

        <LaboralStep v-else-if="steps[step]?.key === 'laboral'" :form="form"
          :ciudades="props.parametros?.ciudades || []" :tipos-contrato="props.parametros?.tipo_contrato || []"
          :ocupaciones="props.parametros?.ocupaciones || []" />

        <IngresosStep v-else-if="steps[step]?.key === 'ingresos'" :form="form"
          :autocalcular-ingresos="autocalcularIngresos" />

        <EconomicaStep v-else-if="steps[step]?.key === 'economica'" :form="form" />

        <PropiedadesStep v-else-if="steps[step]?.key === 'propiedades'" :form="form" :add-propiedad="addPropiedad"
          :remove-propiedad="removePropiedad" :ciudades="props.parametros?.ciudades || []" />

        <DeudasStep v-else-if="steps[step]?.key === 'deudas'" :form="form" :add-deuda="addDeuda"
          :remove-deuda="removeDeuda" />

        <ReferenciasStep v-else-if="steps[step]?.key === 'referencias'" :form="form" :add-referencia="addReferencia"
          :remove-referencia="removeReferencia" />

        <RevisionStep v-else-if="steps[step]?.key === 'revision'" :pretty-payload="prettyPayload" :xml-text="xmlText"
          :saved-filename="savedFilename" :error-msg="errorMsg" :mensaje-progreso="mensajeProgreso"
          :loading-pdf="loadingPdf" :pdf-generado="pdfGenerado" :pdf-filename="pdfFilename" :download-xml="downloadXml"
          :descargar-pdf="() => createdSolicitudId ? descargarPDF(createdSolicitudId) : null" />
      </form>
    </CardContent>
  </Card>

  <!-- Modal de éxito -->
  <SuccessModal :is-open="successModalOpen" :solicitud-id="createdSolicitudId" :filename="savedFilename"
    @close="closeSuccessModal" @view-solicitudes="goToHome" @go-to-documentos="goToDocumentos" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import SuccessModal from '@/components/shared/SuccessModal.vue'
import WizardHeader from './WizardHeader.vue'
import type { WizardProps } from '~/shared/types/solicitud-credito'

// Importar componentes de pasos
import {
  SolicitudStep,
  SolicitanteStep,
  ConyugeStep,
  LaboralStep,
  IngresosStep,
  EconomicaStep,
  PropiedadesStep,
  DeudasStep,
  ReferenciasStep,
  RevisionStep
} from './steps/index'

// Importar composables
import { useWizardSolicitud } from '~/composables/solicitud/useWizardSolicitud'
import { useSimuladorStorage } from '~/composables/useSimuladorStorage'
import { useSession } from '~/composables/useSession'
import { useConyugeTrabajador } from '~/composables/solicitud/useConyugeComposable'

const props = defineProps<WizardProps>()

// Obtener datos del simulador
const { hasSimuladorData, getDatosParaSolicitud } = useSimuladorStorage()

// Obtener datos del trabajador desde la sesión
const { session } = useSession()

// Obtener composable de cónyuge
const { buscarConyuge, loading: loadingConyuge } = useConyugeTrabajador()

// Función para buscar datos del cónyuge usando el composable
const buscarDatosConyuge = async (cedulaTrabajador: string) => {
  try {
    const conyuges = await buscarConyuge(cedulaTrabajador, 'A')

    if (conyuges.length > 0) {
      const conyugeData = conyuges[0]

      // Validar que conyugeData exista
      if (!conyugeData) {
        console.warn('No se encontraron datos válidos del cónyuge')
        return
      }

      // Mapear datos del cónyuge al formulario
      if (form.value.conyuge) {
        form.value.conyuge.identificacion = conyugeData.cedcon || ''
        form.value.conyuge.nombres_apellidos = conyugeData.nombre || ''
        form.value.conyuge.ingresos_laborales = conyugeData.salario || 0
        form.value.conyuge.trabaja = (conyugeData.salario || 0) > 0
        form.value.conyuge.telefono_movil = conyugeData.telefono || ''

        // Cargar datos de la empresa si tiene
        if ((conyugeData.salario || 0) > 0) {
          form.value.conyuge.empresa = {
            nombre: 'Empresa del cónyuge', // Valor por defecto ya que no viene en la API
            direccion: conyugeData.direccion || '',
            telefono: conyugeData.telefono || '',
            email: conyugeData.email || ''
          }
        }
      }
    }
  } catch (error) {
    console.error('Error buscando datos del cónyuge:', error)
  }
}

// Función modificada para toggleConyuge que busca datos del backend
const toggleConyugeHandler = async (checked: boolean) => {
  // Llamar a la función original del composable
  toggleConyuge(checked)

  // Si se está activando el cónyuge y tenemos la cédula del trabajador, buscar datos
  if (checked && session.value?.user?.trabajador?.cedula) {
    await buscarDatosConyuge(session.value.user.trabajador.cedula)
  }
}

const {
  form,
  step,
  loadingXml,
  loadingPdf,
  xmlText,
  savedFilename,
  createdSolicitudId,
  errorMsg,
  errorPdf,
  pdfGenerado,
  pdfFilename,
  mensajeProgreso,
  steps,
  prettyPayload,
  next,
  prev,
  toggleConyuge,
  toggleEmpresaConyuge,
  autocalcularIngresos,
  addPropiedad,
  removePropiedad,
  addDeuda,
  removeDeuda,
  addReferencia,
  removeReferencia,
  successModalOpen,
  closeSuccessModal,
  goToHome,
  goToDocumentos,
  guardarSolicitud,
  downloadXml,
  descargarPDF
} = useWizardSolicitud()

// Cargar datos del simulador si existen
onMounted(() => {
  // Cargar datos del simulador
  if (hasSimuladorData()) {
    const datosSimulador = getDatosParaSolicitud()
    if (datosSimulador && form.value.solicitud) {
      // Prellenar campos del formulario con datos del simulador
      form.value.solicitud.valor_solicitud = datosSimulador.valorSolicitud
      form.value.solicitud.cuota_mensual = Math.round(datosSimulador.cuotaMensual)
      form.value.solicitud.plazo_meses = datosSimulador.plazoMeses

      // Guardar datos importantes de la línea de crédito
      if (datosSimulador.lineaCredito) {
        form.value.solicitud.tipcre = datosSimulador.lineaCredito.tipcre || ''
        form.value.solicitud.modxml4 = datosSimulador.lineaCredito.modxml4 || ''
        form.value.solicitud.detalle_modalidad = datosSimulador.lineaCredito.detalle || ''
      }
    }
  }

  // Cargar datos del trabajador desde la sesión
  if (session.value?.user?.trabajador && form.value.solicitante) {
    const trabajador = session.value.user.trabajador

    // Asignar la categoría del trabajador
    if (trabajador.codigo_categoria) {
      form.value.solicitud.categoria = trabajador.codigo_categoria
    }

    // Mapear campos del trabajador al formulario del solicitante
    form.value.solicitante.tipo_persona = 'natural' // Por defecto persona natural
    form.value.solicitante.tipo_documento = (trabajador.tipo_documento || '') as any
    form.value.solicitante.numero_documento = trabajador.cedula || ''
    form.value.solicitante.nombres = trabajador.primer_nombre + ' ' + trabajador.segundo_nombre
    form.value.solicitante.apellidos = trabajador.primer_apellido + ' ' + trabajador.segundo_apellido
    form.value.solicitante.fecha_nacimiento = trabajador.fecha_nacimiento || ''
    form.value.solicitante.genero = (trabajador.sexo || '') as any
    form.value.solicitante.estado_civil = trabajador.estado_civil || ''
    form.value.solicitante.nivel_educativo = (trabajador.nivel_educativo || '') as any
    form.value.solicitante.profesion = trabajador.cargo || ''
    form.value.solicitante.email = trabajador.email || ''
    form.value.solicitante.telefono = trabajador.telefono || ''
    form.value.solicitante.celular = trabajador.telefono || ''
    form.value.solicitante.direccion = trabajador.direccion || ''
    form.value.solicitante.barrio = trabajador.direccion || ''
    form.value.solicitante.ciudad = trabajador.ciudad_codigo || ''
    form.value.solicitante.departamento = '' // Necesario agregar
    form.value.solicitante.cargo = trabajador.cargo || ''
    form.value.solicitante.salario = trabajador.salario || 0

    // Cargar datos de la empresa en información laboral
    if (trabajador.empresa && form.value.informacion_laboral) {
      form.value.informacion_laboral.empresa_razon_social = trabajador.empresa.razon_social || ''
      form.value.informacion_laboral.empresa_nit = trabajador.empresa.nit || ''
      form.value.informacion_laboral.empresa_telefono = trabajador.empresa.telefono || ''
      form.value.informacion_laboral.empresa_direccion = trabajador.empresa.direccion || ''
      form.value.informacion_laboral.empresa_ciudad = trabajador.empresa.ciudad_codigo || ''
      form.value.informacion_laboral.cargo = trabajador.cargo || ''
      form.value.informacion_laboral.fecha_ingreso = trabajador.fecha_afiliacion || ''
      form.value.informacion_laboral.tiempo_servicio = 1 // Valor por defecto
      form.value.informacion_laboral.tiempo_servicio_unidad = 'anios' // Valor por defecto
    }

    // Cargar datos de ingresos y descuentos
    if (form.value.ingresos_descuentos && trabajador.salario) {
      form.value.ingresos_descuentos.salario_basico_mensual = trabajador.salario
      form.value.ingresos_descuentos.subsidio_transporte = 0 // Valor por defecto
      form.value.ingresos_descuentos.horas_extras = 0
      form.value.ingresos_descuentos.comisiones = 0
      form.value.ingresos_descuentos.otros_ingresos = 0
      form.value.ingresos_descuentos.salud_pension = Math.round(trabajador.salario * 0.08) // 8% salud + 8% pensión
      form.value.ingresos_descuentos.libranzas_comfaca = 0
      form.value.ingresos_descuentos.otras_libranzas = 0
      form.value.ingresos_descuentos.judiciales = 0
      form.value.ingresos_descuentos.otras_deducciones = 0
    }
  }
})

// Asignar fecha de radicado al formulario
if (form.value.encabezado && props.fechaRadicado) {
  form.value.encabezado.fecha_radicado = props.fechaRadicado
}
</script>
