<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">Simulador de crédito</h1>
      <p class="mt-1 text-sm text-zinc-600">
        Estima la cuota mensual, intereses y capacidad de pago.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-900">Monto (COP)</label>
            <input
              v-model.number="monto"
              type="number"
              min="0"
              step="10000"
              class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-900">Plazo (meses)</label>
              <input
                v-model.number="plazoMeses"
                type="number"
                min="1"
                step="1"
                class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-900">Tasa efectiva anual (EA %)</label>
              <input
                v-model.number="tasaEfectivaAnual"
                type="number"
                min="0"
                step="0.1"
                class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-900">Ingresos mensuales (COP)</label>
              <input
                v-model.number="ingresosMensuales"
                type="number"
                min="0"
                step="10000"
                class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-zinc-900">Descuentos mensuales (COP)</label>
              <input
                v-model.number="descuentosMensuales"
                type="number"
                min="0"
                step="10000"
                class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-900">Máximo endeudamiento (%)</label>
            <input
              v-model.number="maxEndeudamientoPct"
              type="number"
              min="0"
              max="100"
              step="1"
              class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
            <p class="mt-1 text-xs text-zinc-500">
              Porcentaje de la capacidad disponible que se permite destinar a la cuota.
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div class="grid gap-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Cuota estimada</div>
              <div class="mt-1 text-xl font-semibold text-zinc-900">{{ fmt(cuotaMensual) }}</div>
              <div class="mt-1 text-xs text-zinc-600">
                Tasa mensual: {{ fmtPct(tasaMensual * 100) }}
              </div>
            </div>

            <div class="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Capacidad disponible</div>
              <div class="mt-1 text-xl font-semibold text-zinc-900">{{ fmt(capacidadDisponible) }}</div>
              <div class="mt-1 text-xs text-zinc-600">Máximo cuota: {{ fmt(maxCuotaPermitida) }}</div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-zinc-200 p-4">
              <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total a pagar</div>
              <div class="mt-1 text-lg font-semibold text-zinc-900">{{ fmt(totalPagar) }}</div>
              <div class="mt-1 text-xs text-zinc-600">Intereses estimados: {{ fmt(intereses) }}</div>
            </div>

            <div class="rounded-lg border border-zinc-200 p-4">
              <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Evaluación rápida</div>
              <div class="mt-1 text-sm font-medium" :class="apto ? 'text-emerald-700' : 'text-red-700'">
                {{ apto ? 'La cuota está dentro del límite' : 'La cuota supera el límite' }}
              </div>
              <div class="mt-1 text-xs text-zinc-600">
                Margen: {{ fmt(margen) }}
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-zinc-200 p-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Resumen</div>
            <div class="mt-2 grid gap-2 text-sm text-zinc-700">
              <div class="flex items-center justify-between gap-3">
                <span>Monto</span>
                <span class="font-medium text-zinc-900">{{ fmt(montoSan) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Plazo</span>
                <span class="font-medium text-zinc-900">{{ plazoMesesSan }} meses</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Tasa EA</span>
                <span class="font-medium text-zinc-900">{{ fmtPct(tasaEASan) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Ingresos</span>
                <span class="font-medium text-zinc-900">{{ fmt(ingresosSan) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span>Descuentos</span>
                <span class="font-medium text-zinc-900">{{ fmt(descuentosSan) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <NuxtLink
              to="/solicitud"
              class="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Continuar con solicitud
            </NuxtLink>
            <button
              type="button"
              class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              @click="reset"
            >
              Restablecer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimulador } from '~/composables/simulador/useSimulador'

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
