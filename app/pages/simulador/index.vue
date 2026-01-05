<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground mb-2">Simulador de crédito</h1>
      <p class="text-muted-foreground">Estima la cuota mensual, intereses y capacidad de pago.</p>
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
              <Label for="tasaEA">Tasa efectiva anual (EA %)</Label>
              <Input
                id="tasaEA"
                type="number"
                step="0.1"
                v-model.number="tasaEfectivaAnual"
                class="text-base"
                min="0"
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="ingresos">Ingresos mensuales (COP)</Label>
              <Input
                id="ingresos"
                type="number"
                v-model.number="ingresosMensuales"
                class="text-base"
                step="10000"
                min="0"
              />
            </div>

            <div class="space-y-2">
              <Label for="descuentos">Descuentos mensuales (COP)</Label>
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
            <Label for="maxEndeudamiento">Máximo endeudamiento (%)</Label>
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
                Capacidad disponible
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

        <Card class="border-accent/30 bg-accent/5">
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
                <span class="text-muted-foreground">Tasa EA</span>
                <span class="font-semibold">{{ fmtPct(tasaEASan) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Ingresos</span>
                <span class="font-semibold">{{ fmt(ingresosSan) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Descuentos</span>
                <span class="font-semibold">{{ fmt(descuentosSan) }}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div class="flex gap-3">
          <NuxtLink to="/solicitud" class="flex-1">
            <Button class="w-full" size="lg">
              Continuar con solicitud
            </Button>
          </NuxtLink>
          <Button variant="outline" size="lg" @click="reset">
            Restablecer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useSimulador } from '~/composables/simulador/useSimulador'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const {
  monto,
  plazoMeses,
  tasaEfectivaAnual,
  ingresosMensuales,
  descuentosMensuales,
  maxEndeudamientoPct,
  montoSan,
  plazoMesesSan,
  tasaEASan,
  ingresosSan,
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
  reset
} = useSimulador()
</script>
