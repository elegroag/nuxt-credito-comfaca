<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Solicitud de crédito</h1>
        <p class="text-muted-foreground mt-1">Captura secuencial por bloques y generación de XML</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink to="/xml-extract">
          <Button variant="outline" size="sm">
            <FileCode class="mr-2 h-4 w-4" />
            Extraer XML
          </Button>
        </NuxtLink>
        <NuxtLink to="/firmas">
          <Button variant="outline" size="sm">
            <PenTool class="mr-2 h-4 w-4" />
            Firmas
          </Button>
        </NuxtLink>
        <NuxtLink to="/firmas-compartir">
          <Button variant="outline" size="sm">
            <Share2 class="mr-2 h-4 w-4" />
            Compartir firmas
          </Button>
        </NuxtLink>
        <NuxtLink to="/entidad-digital">
          <Button variant="outline" size="sm">
            <Key class="mr-2 h-4 w-4" />
            Entidad digital
          </Button>
        </NuxtLink>
      </div>
    </div>

    <WizardSolicitudCredito />
  </div>
</template>

<script setup lang="ts">
import { FileCode, PenTool, Share2, Key } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import WizardSolicitudCredito from '~/components/wizard/WizardSolicitudCredito.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
