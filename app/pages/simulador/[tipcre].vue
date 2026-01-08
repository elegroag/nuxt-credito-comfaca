<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" @click="navigateToLineas" class="text-muted-foreground">
          ← Volver a líneas de crédito
        </Button>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-foreground mb-2">Simulador de crédito</h1>
          <p class="text-muted-foreground">Estima la cuota mensual, intereses y capacidad de pago.</p>
        </div>
        <div class="flex items-center gap-3 ml-auto">
          <div v-if="lineaSeleccionada" class="text-right">
            <Badge 
              :variant="lineaSeleccionada.estado === 'A' ? 'default' : 'destructive'" 
              class="text-sm mb-1"
            >
              {{ lineaSeleccionada.detalle }}
            </Badge>
            <div class="text-sm">
              <Badge 
                :variant="lineaSeleccionada.estado === 'A' ? 'secondary' : 'outline'"
                class="text-xs"
              >
                {{ lineaSeleccionada.estado === 'A' ? 'Activo' : 'Inactivo' }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Cargando línea de crédito...</p>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="flex justify-center items-center min-h-[400px]">
      <Card class="border-destructive/50 bg-destructive/5 max-w-md">
        <CardContent class="p-6 text-center">
          <AlertCircle class="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">Error al cargar</h3>
          <p class="text-muted-foreground">{{ error }}</p>
          <div class="flex gap-3 mt-4">
            <Button @click="cargarLineaCredito">
              Reintentar
            </Button>
            <Button variant="outline" @click="navigateToLineas">
              Volver a líneas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Mensaje de línea inactiva -->
    <div v-else-if="lineaSeleccionada && lineaSeleccionada.estado !== 'A'" class="mb-6">
      <Card class="border-orange-200 bg-orange-50">
        <CardContent class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <p class="text-sm text-orange-800">
              <strong>{{ lineaSeleccionada.detalle }}</strong> se encuentra temporalmente inactiva. 
              No es posible solicitar este crédito en este momento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Contenido principal -->
    <div v-else class="grid gap-6 lg:grid-cols-2">
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
              :disabled="lineaSeleccionada?.estado !== 'A'"
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
              :max="lineaSeleccionada?.numcuo || 999"
              :disabled="lineaSeleccionada?.estado !== 'A'"
            />
            <p class="text-xs text-muted-foreground">
              Plazo máximo: {{ lineaSeleccionada?.numcuo || 'N/A' }} meses
            </p>
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
              :readonly="trabajador?.codigo_categoria && lineaSeleccionada?.categorias ? true : false"
              :placeholder="trabajador?.codigo_categoria ? `Tasa según categoría ${String(trabajador.codigo_categoria)}` : ''"
            />
            <p v-if="trabajador?.codigo_categoria && lineaSeleccionada?.categorias" class="text-xs text-muted-foreground">
              💡 Tasa aplicada automáticamente según categoría del trabajador
            </p>
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
                :readonly="trabajador?.salario ? true : false"
                :placeholder="trabajador?.salario ? `Salario: ${fmt(trabajador.salario)}` : ''"
              />
              <p v-if="trabajador?.salario" class="text-xs text-muted-foreground">
                💡 Salario del trabajador cargado automáticamente
              </p>
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
          <Card class="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
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

          <Card class="border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10">
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
          <NuxtLink 
            v-if="lineaSeleccionada?.estado === 'A'" 
            to="/solicitud" 
            class="flex-1"
          >
            <Button variant="primary" class="w-full" size="lg">
              Continuar con solicitud
            </Button>
          </NuxtLink>
          <Button 
            v-else 
            variant="secondary" 
            class="w-full" 
            size="lg" 
            disabled
          >
            No disponible para solicitud
          </Button>
          <Button variant="outline" size="lg" @click="navigateToLineas">
            Volver
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
import { useRoute } from 'vue-router'
import { useSimuladorCore } from '~/composables/simulador/useSimuladorCore'
import { useSimuladorWithLinea } from '~/composables/simulador/useSimuladorWithLinea'
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
import Badge from '@/components/ui/Badge.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const route = useRoute()
const { getJson } = useApi()
const { trabajador, salario } = useTrabajador()
const { saveSimuladorDataSilent, updateSimuladorData } = useSimuladorStorage()

const tipcre = computed(() => route.params.tipcre as string)
const loading = ref(true)
const error = ref<string | null>(null)
const lineaSeleccionada = ref<any>(null)

// Cache para líneas de crédito
const lineasCache = ref<Map<string, any>>(new Map())

// Usar el hook especializado para líneas de crédito
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
} = useSimuladorWithLinea(lineaSeleccionada)

const navigateToLineas = () => {
  navigateTo('/simulador/lineas-credito')
}

// Cargar datos de la línea de crédito
const cargarLineaCredito = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Verificar cache primero
    if (lineasCache.value.has(tipcre.value)) {
      lineaSeleccionada.value = lineasCache.value.get(tipcre.value)
      console.log('Usando cache para línea:', tipcre.value)
    } else {
      // Consultar API si no está en cache
      const response = await getJson<{
        status: boolean
        message: string
        data: any[]
      }>('/api/lineas_credito/tipo_creditos', { auth: true })
      
      if (response.status) {
        // Guardar todas las líneas en cache
        response.data.forEach(linea => {
          lineasCache.value.set(linea.tipcre, linea)
        })
        
        // Obtener la línea específica
        lineaSeleccionada.value = response.data.find(linea => linea.tipcre === tipcre.value)
        
        if (!lineaSeleccionada.value) {
          error.value = 'Línea de crédito no encontrada'
        }
      } else {
        error.value = response.message || 'Error al cargar la línea de crédito'
      }
    }
    
    // Establecer ingresos mensuales del trabajador si está disponible
    if (trabajador.value && trabajador.value.salario) {
      ingresosMensuales.value = trabajador.value.salario
    }
    
    // Establecer descuentos mensuales por defecto en 0
    descuentosMensuales.value = 0
    
    // Establecer tasa según categoría del trabajador
    if (trabajador.value?.codigo_categoria && lineaSeleccionada.value?.categorias) {
      const categoriaTrabajador = String(trabajador.value.codigo_categoria).toLowerCase()
      const categoriaLinea = lineaSeleccionada.value.categorias.find(
        (cat: any) => cat && cat.codcat && String(cat.codcat).toLowerCase() === categoriaTrabajador
      )
      
      if (categoriaLinea && categoriaLinea.facfin) {
        tasaEfectivaAnual.value = parseFloat(categoriaLinea.facfin)
      }
    }
  } catch (err) {
    console.error('Error cargando línea crédito:', err)
    error.value = 'No se pudo cargar la línea de crédito. Por favor, intenta nuevamente.'
  } finally {
    loading.value = false
  }
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

// Watch para guardar datos cuando cambien los valores del simulador (con debounce para evitar recursión)
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
    lineaSeleccionada
  ],
  () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    saveTimeout = setTimeout(() => {
      if (lineaSeleccionada.value && monto.value > 0) {
        saveSimuladorDataSilent({
          lineaCredito: lineaSeleccionada.value,
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
          fechaSimulacion: new Date().toISOString()
        })
      }
    }, 500) // 500ms de debounce
  },
  { deep: true }
)

// Cargar datos al montar el componente
onMounted(() => {
  cargarLineaCredito()
})
</script>
