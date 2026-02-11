<template>
  <div class="mx-auto max-w-7xl p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground mb-2">Líneas de Crédito</h1>
      <p class="text-muted-foreground">Explora nuestras líneas de crédito organizadas por modalidad.</p>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Cargando líneas de crédito...</p>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="flex justify-center items-center min-h-[400px]">
      <Card class="border-destructive/50 bg-destructive/5 max-w-md">
        <CardContent class="p-6 text-center">
          <AlertCircle class="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">Error al cargar</h3>
          <p class="text-muted-foreground">{{ error }}</p>
          <Button @click="fetchLineasCredito" class="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Galería de modalidades -->
    <div v-else class="space-y-8">
      <div v-for="modalidad in modalidadesAgrupadas" :key="modalidad.modxml4" class="space-y-4">
        <!-- Header de modalidad -->
        <div
          class="flex items-center gap-4 p-4 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-primary/20 rounded-full">
              <Icon :name="modalidad.icono" class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">{{ modalidad.nombre }}</h2>
              <p class="text-sm text-muted-foreground">{{ modalidad.descripcion }}</p>
            </div>
          </div>
          <Badge variant="secondary" class="ml-auto">
            {{ modalidad.lineas.length }} líneas disponibles
          </Badge>
        </div>

        <!-- Grid de líneas de crédito -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="linea in modalidad.lineas" :key="linea.tipcre"
            class="hover:shadow-lg transition-shadow border-primary/20" @click="seleccionarLinea(linea)">
            <CardHeader class="pb-3">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <CardTitle class="text-base mb-1">{{ linea.detalle }}</CardTitle>
                  <CardDescription class="text-xs">
                    Código: {{ linea.tipcre }}
                  </CardDescription>
                </div>
                <Badge :variant="linea.estado === 'A' ? 'default' : 'secondary'" class="text-xs">
                  {{ linea.estado === 'A' ? 'Activo' : 'Inactivo' }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Máximo cuotas:</span>
                  <span class="font-medium">{{ linea.numcuo }} meses</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Estudio crédito:</span>
                  <span class="font-medium">{{ fmt(linea.estcre) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Pago seguro requerido:</span>
                  <span class="font-medium">{{ linea.pagseg === 'S' ? 'Sí' : 'No' }}</span>
                </div>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <div class="text-xs font-medium text-muted-foreground mb-2">Tasas por categoría</div>
                  <div class="flex flex-wrap gap-2">
                    <Badge v-for="cat in (linea.categorias || [])" :key="cat.codcat" variant="secondary"
                      class="text-[11px]">
                      {{ cat.codcat }}: {{ Number(cat.facfin).toFixed(2) }}%
                    </Badge>
                    <span v-if="!linea.categorias || linea.categorias.length === 0"
                      class="text-xs text-muted-foreground">
                      No disponible
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between text-xs">
                  <span class="text-muted-foreground">Documentos requeridos:</span>
                  <span class="font-medium">
                    {{(linea.documentos || []).filter((d: any) => d?.obliga === 'S').length}} obligatorios
                    <span class="text-muted-foreground">/</span>
                    {{ (linea.documentos || []).length }} total
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" class="w-full mt-4 cursor-pointer hover:bg-primary/50"
                @click.stop="simularLinea(linea)">
                Simular esta línea
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import { useLineasCredito } from '~/composables/simulador/useLineasCredito'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const {
  loading,
  error,
  modalidadesAgrupadas,
  fetchLineasCredito,
  seleccionarLinea,
  simularLinea,
  fmt
} = useLineasCredito()
</script>
