<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground mb-2">Simulador de crédito</h1>
      <p class="text-muted-foreground">Estima la cuota mensual, intereses y capacidad de pago.</p>
    </div>

    <!-- Alerta de convenio -->
    <div v-if="mensajeBeneficios" class="mb-6">
      <ConvenioAlert
        :titulo="mensajeBeneficios.titulo"
        :descripcion="`Su empresa ${mensajeBeneficios.empresa} tiene convenio con COMFACA. Beneficios: ${mensajeBeneficios.items.join(', ')}`"
        tipo="success"
        :dismissible="false"
      />
    </div>

    <!-- Alerta de error de convenio -->
    <div v-else-if="convenioVerificado && !isElegible && getMensajeError" class="mb-6">
      <ConvenioAlert
        :titulo="getMensajeError.titulo"
        :descripcion="getMensajeError.descripcion"
        :tipo="getMensajeError.tipo"
      />
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Formulario de entrada -->
      <Card class="border-primary/20">
        <CardHeader>
          <CardTitle>Datos del crédito</CardTitle>
          <CardDescription>Ingresa la información para calcular tu crédito</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-2">
            <Label for="monto">Monto (COP)</Label>
            <Input
              id="monto"
              type="number"
              v-model.number="monto"
              class="text-base"
              step="10000"
              min="0"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="plazo">Plazo (meses)</Label>
              <Input
                id="plazo"
                type="number"
                v-model.number="plazoMeses"
                class="text-base"
                step="1"
                min="1"
              />
            </div>

            <div class="space-y-2">
              <Label>Tipo de tasa</Label>
              <div class="flex gap-4">
                <div class="flex items-center space-x-2">
                  <input
                    id="tasaAnual"
                    type="radio"
                    :checked="tipoTasa === 'anual'"
                    @change="cambiarTipoTasa('anual')"
                    class="text-primary"
                  />
                  <Label for="tasaAnual" class="text-sm font-normal cursor-pointer">
                    Anual (EA)
                  </Label>
                </div>
                <div class="flex items-center space-x-2">
                  <input
                    id="tasaMensual"
                    type="radio"
                    :checked="tipoTasa === 'mensual'"
                    @change="cambiarTipoTasa('mensual')"
                    class="text-primary"
                  />
                  <Label for="tasaMensual" class="text-sm font-normal cursor-pointer">
                    Mensual
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="tasa">
              {{ tipoTasa === 'anual' ? 'Tasa efectiva anual (EA %)' : 'Tasa mensual (%)' }}
            </Label>
            <Input
              id="tasa"
              type="number"
              step="0.1"
              v-model.number="tasaInput"
              class="text-base"
              min="0"
            />
          </div>

            <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="ingresos">Ingresos mensuales <br><small>Salario bruto.</small></Label>
              <Input
                id="ingresos"
                type="number"
                v-model.number="ingresosMensuales"
                class="text-base"
                step="10000"
                min="0"
              />
              <p class="text-xs text-muted-foreground">
                Ingreso neto (92%): {{ fmt(ingresosSan) }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="descuentos">Descuentos mensuales <small>Obligaciones adquiridas.</small></Label>
              <Input
                id="descuentos"
                type="number"
                v-model.number="descuentosMensuales"
                class="text-base"
                step="10000"
                min="0"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="maxEndeudamiento">Máximo endeudamiento por ley (50%)</Label>
            <Input
              id="maxEndeudamiento"
              type="number"
              v-model.number="maxEndeudamientoPct"
              class="text-base"
              min="0"
              max="100"
            />
            <p class="text-xs text-muted-foreground">
              Porcentaje de la capacidad disponible que se permite destinar a la cuota.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Resultados -->
      <div class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <Card class="border-primary/30 bg-linear-to-br from-primary/5 to-primary/10">
            <CardHeader class="pb-3">
              <CardDescription class="text-xs font-medium uppercase tracking-wider">
                Cuota estimada
              </CardDescription>
              <CardTitle class="text-3xl font-bold text-primary">{{ fmt(cuotaMensual) }}</CardTitle>
              <p class="text-xs text-muted-foreground">
                Tasa mensual: {{ fmtPct(tasaMensual * 100) }}
              </p>
            </CardHeader>
          </Card>

          <Card class="border-secondary/30 bg-linear-to-br from-secondary/5 to-secondary/10">
            <CardHeader class="pb-3">
              <CardDescription class="text-xs font-medium uppercase tracking-wider">
                Capacidad disponible <small>(Descuento en Nomina)</small>
              </CardDescription>
              <CardTitle class="text-3xl font-bold text-secondary">
                {{ fmt(capacidadDisponible) }}
              </CardTitle>
              <p class="text-xs text-muted-foreground">Máximo cuota: {{ fmt(maxCuotaPermitida) }}</p>
            </CardHeader>
          </Card>
        </div>

        <Card class="border-primary/20">
          <CardHeader class="pb-3">
            <CardDescription class="text-xs font-medium uppercase tracking-wider">
              Total a pagar
            </CardDescription>
            <CardTitle class="text-2xl font-bold">{{ fmt(totalPagar) }}</CardTitle>
            <p class="text-sm text-muted-foreground">
              Intereses estimados: {{ fmt(intereses) }}
            </p>
          </CardHeader>
        </Card>

        <Card
          :class="`border-2 ${apto ? 'border-secondary/50 bg-secondary/5' : 'border-destructive/50 bg-destructive/5'}`"
        >
          <CardHeader>
            <div class="flex items-start gap-3">
              <CheckCircle2 v-if="apto" class="h-5 w-5 text-secondary mt-0.5" />
              <AlertCircle v-else class="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <CardTitle class="text-base mb-1">Evaluación rápida</CardTitle>
                <CardDescription :class="apto ? 'text-secondary' : 'text-destructive'">
                  {{ apto ? "La cuota está dentro del límite" : "La cuota excede tu capacidad de pago" }}
                </CardDescription>
                <p class="text-sm text-muted-foreground mt-2">
                  {{ apto
                    ? `Margen: ${fmt(margen)}`
                    : `Exceso: ${fmt(Math.abs(margen))}` }}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card class="border-accent/30 bg-accent/5 bg-red-50">
          <CardHeader class="pb-3">
            <CardTitle class="text-base mb-3">Resumen</CardTitle>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Monto</span>
                <span class="font-semibold">{{ fmt(montoSan) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Plazo</span>
                <span class="font-semibold">{{ plazoMesesSan }} meses</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">
                  {{ tipoTasa === 'anual' ? 'Tasa EA' : 'Tasa Mensual' }}
                </span>
                <span class="font-semibold">
                  {{ fmtPct(tipoTasa === 'anual' ? tasaEASan : tasaMensualSan) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Ingresos (Brutos)</span>
                <span class="font-semibold">{{ fmt(ingresosBrutosSan) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Ingresos (Netos 92%)</span>
                <span class="font-semibold text-primary">{{ fmt(ingresosSan) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Descuentos</span>
                <span class="font-semibold">{{ fmt(descuentosSan) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Máximo endeudamiento</span>
                <span class="font-semibold">{{ fmtPct(maxEndeudamientoPct) }}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div class="flex gap-3">
          <NuxtLink to="/solicitud" class="flex-1">
            <Button variant="primary" class="w-full" size="lg">
              Continuar con solicitud
            </Button>
          </NuxtLink>
          <Button variant="outline" size="lg" @click="navigateToLineas">
            Ver líneas de crédito
          </Button>
          <Button variant="default" size="lg" @click="reset">
            Restablecer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useSimulador } from '~/composables/simulador/useSimulador'
import { useSimuladorConConvenio } from '~/composables/simulador/useSimuladorConConvenio'
import { useTrabajador } from '~/composables/useTrabajador'
import { useSimuladorStorage } from '~/composables/useSimuladorStorage'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import ConvenioAlert from '@/components/solicitud/ConvenioAlert.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { trabajador } = useTrabajador()
const { saveSimuladorDataSilent } = useSimuladorStorage()

// Composable de convenio
const {
  nitEmpresa,
  cedulaTrabajador,
  loadingConvenio,
  convenioVerificado,
  isElegible,
  mensajeBeneficios,
  getMensajeError,
  validarConvenioAntesDSimular
} = useSimuladorConConvenio()

const {
  monto,
  plazoMeses,
  tasaEfectivaAnual,
  tasaMensualInput,
  tipoTasa,
  ingresosMensuales,
  descuentosMensuales,
  maxEndeudamientoPct,
  montoSan,
  plazoMesesSan,
  tasaEASan,
  tasaMensualSan,
  ingresosSan,
  ingresosBrutosSan,
  descuentosSan,
  tasaMensual,
  cuotaMensual,
  totalPagar,
  intereses,
  capacidadDisponible,
  maxCuotaPermitida,
  margen,
  apto,
  fmt,
  fmtPct,
  reset,
  cambiarTipoTasa
} = useSimulador()

const navigateToLineas = () => {
  navigateTo('/simulador/lineas-credito')
}

// Computed para manejar el v-model del input de tasa
const tasaInput = computed({
  get: () => tipoTasa.value === 'anual' ? tasaEfectivaAnual.value : tasaMensualInput.value,
  set: (value) => {
    if (tipoTasa.value === 'anual') {
      tasaEfectivaAnual.value = value
    } else {
      tasaMensualInput.value = value
    }
  }
})

// Cargar datos del trabajador y validar convenio al montar
onMounted(async () => {
  // Cargar salario del trabajador
  if (trabajador.value?.salario) {
    ingresosMensuales.value = trabajador.value.salario
  }

  // Validar convenio si tiene empresa
  if (trabajador.value?.empresa?.nit && trabajador.value?.cedula) {
    nitEmpresa.value = trabajador.value.empresa.nit
    cedulaTrabajador.value = trabajador.value.cedula
    await validarConvenioAntesDSimular()
  }
})

// Watch para guardar datos cuando cambien (con debounce)
let saveTimeout: NodeJS.Timeout | null = null

watch(
  [
    monto,
    plazoMeses,
    tasaEfectivaAnual,
    ingresosMensuales,
    descuentosMensuales,
    cuotaMensual,
    totalPagar,
    intereses,
    isElegible,
    convenioVerificado
  ],
  () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
      if (monto.value > 0) {
        saveSimuladorDataSilent({
          monto: monto.value,
          montoCredito: monto.value,
          plazoMeses: plazoMeses.value,
          tasaEfectivaAnual: tasaEfectivaAnual.value,
          ingresosMensuales: ingresosMensuales.value,
          descuentosMensuales: descuentosMensuales.value,
          maxEndeudamientoPct: maxEndeudamientoPct.value,
          tasaInteresAnual: tasaEfectivaAnual.value,
          cuotaMensual: cuotaMensual.value,
          totalIntereses: intereses.value,
          totalPagar: totalPagar.value,
          fechaSimulacion: new Date().toISOString(),
          // Datos del convenio
          tieneConvenio: isElegible.value,
          convenioVerificado: convenioVerificado.value,
          nitEmpresa: nitEmpresa.value,
          cedulaTrabajador: cedulaTrabajador.value,
          // Sin línea de crédito específica
          lineaCredito: null
        })
      }
    }, 500)
  },
  { deep: true }
)
</script>
