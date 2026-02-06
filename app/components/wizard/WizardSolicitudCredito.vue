<template>
  <Card class="border-border shadow-sm">
    <WizardHeader :current-step="step" :total-steps="steps.length" :title="steps[step]?.title || ''" :steps="steps"
      :primary-button-text="'Enviar'" @prev="prev" @next="next" @step-change="step = $event"
      @primary-action="guardarSolicitud(form)" />

    <CardContent class="p-4 sm:p-6">
      <form class="grid gap-4" @submit.prevent>
        <!-- Componentes destructurados por paso -->
        <SolicitudStep v-if="steps[step]?.key === 'solicitud'" :form="form" />

        <SolicitanteStep v-else-if="steps[step]?.key === 'solicitante'" :form="form"
          :ciudades="props.parametros?.ciudades || []" :tipos-documento="props.parametros?.codigos_tipo_documento || []"
          :sexos="props.parametros?.sexos || []" :niveles-educativos="props.parametros?.nivel_educativos || []"
          :tipos-vivienda="props.parametros?.tipo_vivienda || []" :ocupaciones="props.parametros?.ocupaciones || []"
          :estado-civiles="props.parametros?.estado_civiles || []" />

        <ConyugeStep v-else-if="steps[step]?.key === 'conyuge'" :form="form" :toggle-conyuge="toggleConyuge"
          :toggle-empresa-conyuge="toggleEmpresaConyuge" />

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

        <RevisionStep v-else-if="steps[step]?.key === 'revision'" :pretty-payload="prettyPayload"
          :xml-text="responseFormData" :error-msg="errorMsg" :mensaje-progreso="mensajeProgreso" />
      </form>
    </CardContent>
  </Card>

  <!-- Modal de éxito -->
  <SuccessModal :is-open="successModalOpen" :solicitud-id="createdSolicitudId" @close="closeSuccessModal"
    @view-solicitudes="goToHome" @go-to-documentos="goToDocumentos" />
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue';
import CardContent from '@/components/ui/CardContent.vue';
import WizardHeader from './WizardHeader.vue';
import type { WizardProps } from '~/shared/types/solicitud-credito';
import SuccessModal from './SuccessModal.vue';
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
  RevisionStep,
} from './steps/index';

// Importar composable principal
import { useWizardSolicitud } from '~/composables/solicitud/useWizardSolicitud';


const props = defineProps<WizardProps>();

// Usar el composable que contiene toda la lógica
const {
  form,
  step,
  responseFormData,
  createdSolicitudId,
  errorMsg,
  successModalOpen,
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
  closeSuccessModal,
  goToHome,
  goToDocumentos,
  guardarSolicitud,
} = useWizardSolicitud(props);
</script>
