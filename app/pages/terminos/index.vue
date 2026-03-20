<template>
  <div class="min-h-[calc(100vh-4rem)]">
    <div class="mx-auto max-w-7xl p-4 sm:p-8 space-y-6">
      <Card class="border-0 shadow-sm bg-white backdrop-blur">
        <CardContent class="p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h1 class="text-2xl font-semibold tracking-tight text-foreground">Términos y motivos de rechazo</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Consulta los parámetros generales relacionados con el crédito.
              </p>
            </div>

            <Button variant="outline" size="sm" @click="cargarTerminos" :disabled="loadingParametros"
              class="border-sky-100 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
              <ArrowPathIcon :class="['h-5 w-5 mr-2', loadingParametros ? 'animate-spin' : '']" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card class="border border-slate-200 shadow-md bg-gradient-surface backdrop-blur">
        <CardContent class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-gradient-primary p-2 shadow-md">
              <ExclamationTriangleIcon class="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 class="text-base font-bold text-foreground">Motivos de rechazo</h2>
              <p class="text-sm text-muted-foreground">Parámetros generales del crédito.</p>
            </div>
          </div>

          <div v-if="loadingParametros" class="flex items-center justify-center py-8">
            <div class="flex items-center gap-2 text-rose-600">
              <ArrowPathIcon class="h-5 w-5 animate-spin" />
              <span class="text-sm font-medium">Cargando...</span>
            </div>
          </div>

          <div v-else-if="errorParametros"
            class="rounded-xl border border-red-200/50 bg-gradient-surface p-4 text-sm text-red-700">
            <div class="flex items-center gap-2">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
              {{ errorParametros }}
            </div>
          </div>

          <div v-else class="mt-4 space-y-3 max-h-[70vh] overflow-auto pr-2">
            <div v-for="(m, index) in motivosRechazo" :key="m.modrec"
              class="group rounded-xl border border-rose-200/50 bg-gradient-surface p-4 shadow-md hover:shadow-lg transition-all duration-200">
              <div class="flex items-start gap-3">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white text-sm font-bold shadow-md">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                    {{ m.detalle }}
                  </div>
                  <div class="mt-1 text-xs text-gray-500">
                    Código: {{ m.modrec }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="motivosRechazo.length === 0"
              class="rounded-xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-muted-foreground">
              No hay motivos de rechazo configurados.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTerminos } from '@/composables/terminos/useTerminos'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const {
  loadingParametros,
  errorParametros,
  motivosRechazo,
  cargarTerminos,
} = useTerminos()
</script>
