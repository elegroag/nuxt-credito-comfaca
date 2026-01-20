<template>
  <Card class="border-border shadow-sm">
    <CardHeader class="border-b border-border p-4 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Paso {{ step + 1 }} de {{ steps.length }}
          </div>
          <CardTitle class="text-xl font-bold text-foreground">
            {{ steps[step]?.title }}
          </CardTitle>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="step === 0"
            @click="prev"
            type="button"
          >
            <ChevronLeft class="mr-2 h-4 w-4" />
            Atrás
          </Button>
          
          <Button
            v-if="step < steps.length - 1"
            size="sm"
            @click="next"
            type="button"
          >
            Siguiente
            <ChevronRight class="ml-2 h-4 w-4" />
          </Button>
          
          <template v-else>
            <Button
              variant="secondary"
              size="sm"
              :disabled="loadingXml"
              @click="generarXml(false)"
              type="button"
            >
              <FileCode class="mr-2 h-4 w-4" />
              Solicitud electrónica <small>(Generar XML)</small>
            </Button>
            <Button
              size="sm"
              :disabled="loadingXml"
              @click="generarXml(true)"
              type="button"
            >
              <Send class="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </template>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="(s, i) in steps"
          :key="s.key"
          class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
          :class="i === step 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
          @click="step = i"
          type="button"
        >
          {{ s.short }}
        </button>
      </div>
    </CardHeader>

    <CardContent class="p-4 sm:p-6">
      <form class="grid gap-4" @submit.prevent>
        <!-- Componentes destructurados por paso -->
        <SolicitudStep 
          v-if="steps[step]?.key === 'solicitud'"
          :form="form"
          :fecha-radicado="fechaRadicado"
        />
        
        <SolicitanteStep 
          v-else-if="steps[step]?.key === 'solicitante'"
          :form="form"
          :ciudades="props.parametros?.ciudades || []"
          :tipos-documento="props.parametros?.codigos_tipo_documento || []"
          :sexos="props.parametros?.sexos || []"
          :niveles-educativos="props.parametros?.nivel_educativos || []"
          :tipos-vivienda="props.parametros?.tipo_vivienda || []"
          :ocupaciones="props.parametros?.ocupaciones || []"
          :estado-civiles="props.parametros?.estado_civiles || []"
        />
        
        <ConyugeStep 
          v-else-if="steps[step]?.key === 'conyuge'"
          :form="form"
          :toggle-conyuge="toggleConyugeHandler"
          :toggle-empresa-conyuge="toggleEmpresaConyuge"
          :loading-conyuge="loadingConyuge"
        />
        
        <LaboralStep 
          v-else-if="steps[step]?.key === 'laboral'"
          :form="form"
          :ciudades="props.parametros?.ciudades || []"
          :tipos-contrato="props.parametros?.tipo_contrato || []"
        />
        
        <IngresosStep 
          v-else-if="steps[step]?.key === 'ingresos'"
          :form="form"
          :autocalcular-ingresos="autocalcularIngresos"
        />
        
        <EconomicaStep 
          v-else-if="steps[step]?.key === 'economica'"
          :form="form"
        />
        
        <PropiedadesStep 
          v-else-if="steps[step]?.key === 'propiedades'"
          :form="form"
          :add-propiedad="addPropiedad"
          :remove-propiedad="removePropiedad"
          :ciudades="props.parametros?.ciudades || []"
        />
        
        <DeudasStep 
          v-else-if="steps[step]?.key === 'deudas'"
          :form="form"
          :add-deuda="addDeuda"
          :remove-deuda="removeDeuda"
        />
        
        <ReferenciasStep 
          v-else-if="steps[step]?.key === 'referencias'"
          :form="form"
          :add-referencia="addReferencia"
          :remove-referencia="removeReferencia"
        />
        
        <RevisionStep 
          v-else-if="steps[step]?.key === 'revision'"
          :pretty-payload="prettyPayload"
          :xml-text="xmlText"
          :saved-filename="savedFilename"
          :error-msg="errorMsg"
          :download-xml="downloadXml"
        />

        </form>
    </CardContent>
  </Card>

  <!-- Modal de éxito -->
  <SuccessModal
    :is-open="successModalOpen"
    :solicitud-id="createdSolicitudId"
    :filename="savedFilename"
    @close="closeSuccessModal"
    @view-solicitudes="goToHome"
    @go-to-documentos="goToDocumentos"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { 
  ChevronLeft, 
  ChevronRight, 
  FileCode, 
  Send
} from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import SuccessModal from '@/components/shared/SuccessModal.vue'

// Importar componentes de pasos
import SolicitudStep from './steps/SolicitudStep.vue'
import SolicitanteStep from './steps/SolicitanteStep.vue'
import ConyugeStep from './steps/ConyugeStep.vue'
import LaboralStep from './steps/LaboralStep.vue'
import IngresosStep from './steps/IngresosStep.vue'
import EconomicaStep from './steps/EconomicaStep.vue'
import PropiedadesStep from './steps/PropiedadesStep.vue'
import DeudasStep from './steps/DeudasStep.vue'
import ReferenciasStep from './steps/ReferenciasStep.vue'
import RevisionStep from './steps/RevisionStep.vue'

// Importar composables
import { useWizardSolicitud } from '~/composables/solicitud/useWizardSolicitud'
import { useSimuladorStorage } from '~/composables/useSimuladorStorage'
import { useSession } from '~/composables/useSession'
import { useConyugeTrabajador } from '~/composables/solicitud/useConyugeComposable'

// Props
interface Props {
  parametros?: any
  fechaRadicado: string
}

const props = defineProps<Props>()

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
  xmlText,
  savedFilename,
  createdSolicitudId,
  errorMsg,
  successModalOpen,
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
  closeSuccessModal,
  goToHome,
  goToDocumentos,
  generarXml,
  downloadXml
} = useWizardSolicitud()

// Cargar datos del simulador si existen
onMounted(() => {
  // Cargar datos del simulador
  if (hasSimuladorData()) {
    const datosSimulador = getDatosParaSolicitud()
    if (datosSimulador && form.value.solicitud) {
      // Prellenar campos del formulario con datos del simulador
      form.value.solicitud.valor_solicitud = datosSimulador.valorSolicitud
      form.value.solicitud.valor_solicitado = datosSimulador.valorSolicitud
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
    form.value.solicitante.fecha_vinculacion = trabajador.fecha_afiliacion || ''
    form.value.solicitante.tipo_identificacion = (trabajador.tipo_documento || '') as any
    form.value.solicitante.numero_identificacion = trabajador.cedula || ''
    form.value.solicitante.fecha_nacimiento = trabajador.fecha_nacimiento || ''
    form.value.solicitante.pais_nacimiento = trabajador.ciudad_nacimiento || ''
    form.value.solicitante.nombres_apellidos = `${trabajador.primer_nombre || ''} ${trabajador.segundo_nombre || ''} ${trabajador.primer_apellido || ''} ${trabajador.segundo_apellido || ''}`.trim()
    form.value.solicitante.fecha_expedicion_documento = trabajador.fecha_afiliacion || ''
    form.value.solicitante.profesion_ocupacion = trabajador.cargo || ''
    form.value.solicitante.sexo = (trabajador.sexo || '') as any
    form.value.solicitante.nivel_educativo = (trabajador.nivel_educativo || '') as any
    form.value.solicitante.barrio_residencia = trabajador.direccion || ''
    form.value.solicitante.ciudad_residencia = trabajador.ciudad_codigo || ''
    form.value.solicitante.pais_residencia = trabajador.ciudad_codigo || ''
    form.value.solicitante.telefono_fijo = trabajador.telefono || ''
    form.value.solicitante.telefono_movil = trabajador.telefono || ''
    form.value.solicitante.email = trabajador.email || ''
    form.value.solicitante.estado_civil = trabajador.estado_civil || ''
    form.value.solicitante.tipo_vivienda = trabajador.tipo_vivienda || 'A'
    
    // Agregar campos adicionales del solicitante
    form.value.solicitante.codigo_categoria = trabajador.codigo_categoria || ''
    form.value.solicitante.salario = trabajador.salario || 0
    form.value.solicitante.empresa_nit = trabajador.empresa?.nit || ''
    form.value.solicitante.empresa_razon_social = trabajador.empresa?.razon_social || ''
    
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
