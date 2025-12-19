<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Solicitud de crédito</h1>
        <p class="text-sm text-zinc-600">Captura secuencial por bloques y generación de XML</p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/xml-extract"
          class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Extraer XML
        </NuxtLink>
        <NuxtLink
          to="/firmas"
          class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Firmas
        </NuxtLink>
        <NuxtLink
          to="/firmas-compartir"
          class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Compartir firmas
        </NuxtLink>
        <NuxtLink
          to="/entidad-digital"
          class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Entidad digital
        </NuxtLink>
      </div>
    </div>

    <WizardSolicitudCredito />
  </div>
</template>

<script setup lang="ts">
import WizardSolicitudCredito from '~/components/wizard/WizardSolicitudCredito.vue'
</script>
