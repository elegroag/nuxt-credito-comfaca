<template>
  <WizardSolicitudPage />
</template>

<script setup lang="ts">
import WizardSolicitudPage from '~/components/wizard/WizardSolicitudPage.vue'
import { DEFAULT_WIZARD_STEP_KEY, isWizardStepKey } from '~/composables/solicitud/useWizardSolicitud'
import '~/assets/css/vue-select-custom.css'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const step = typeof route.params.step === 'string' ? route.params.step : DEFAULT_WIZARD_STEP_KEY

  if (!isWizardStepKey(step)) {
    await router.replace(`/solicitud/${DEFAULT_WIZARD_STEP_KEY}`)
  }
})
</script>
