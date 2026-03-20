<template>
  <div class="min-h-[calc(100vh-4rem)]">
    <div class="mx-auto max-w-7xl p-4 sm:p-8 space-y-6">
      <Card class="border-0 shadow-sm bg-white backdrop-blur">
        <CardContent class="p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h1 class="text-2xl font-semibold tracking-tight text-foreground">Oficinas de crédito</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Información y canales de atención disponibles.
              </p>
            </div>

            <Button variant="outline" size="sm" @click="cargarOficinas" :disabled="loadingConvenio || loadingParametros"
              class="border-sky-100 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
              <ArrowPathIcon :class="['h-5 w-5 mr-2', loadingConvenio ? 'animate-spin' : '']" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card class="border-0 shadow-sm bg-white backdrop-blur">
        <CardContent class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-200 bg-gradient-primary p-2 shadow-lg shadow-violet-500/20">
              <BuildingOfficeIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-foreground">Oficinas de crédito</h2>
              <p class="text-sm text-muted-foreground">Canales disponibles para atención.</p>
            </div>
          </div>

          <div v-if="loadingParametros" class="flex items-center justify-center py-10">
            <div class="flex items-center gap-2 text-violet-600">
              <ArrowPathIcon class="h-5 w-5 animate-spin" />
              <span class="text-sm font-medium">Cargando oficinas...</span>
            </div>
          </div>

          <div v-else-if="errorParametros"
            class="rounded-xl border border-red-200/50 bg-gradient-surface p-4 text-sm text-red-700">
            <div class="flex items-center gap-2">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
              {{ errorParametros }}
            </div>
          </div>

          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card v-for="oficina in oficinasCredito" :key="oficina.ofiafi"
              class="overflow-hidden border border-violet-200/50 bg-white/90 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <CardContent class="p-5">
                <div class="flex items-start gap-4">


                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate text-base font-semibold text-foreground">
                          {{ oficina.detalle || 'Oficina de crédito' }}
                        </h3>
                        <p class="mt-1 text-sm text-muted-foreground">
                          Código: {{ oficina.ofiafi || '-' }}
                        </p>
                      </div>
                    </div>

                    <p class="mt-3 text-sm text-muted-foreground">
                      Canal oficial de atención para gestión de créditos.
                    </p>

                    <div class="mt-4 space-y-3 rounded-2xl bg-slate-50/80 p-4">
                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                        <div>
                          <p class="text-xs uppercase tracking-wide text-muted-foreground">Dirección</p>
                          <p class="text-sm font-semibold text-foreground">{{ oficina.direccion || '-' }}</p>
                        </div>
                      </div>

                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-secondary" />
                        <div>
                          <p class="text-xs uppercase tracking-wide text-muted-foreground">Teléfono</p>
                          <p class="text-sm font-semibold text-foreground">{{ oficina.telefono || '-' }}</p>
                        </div>
                      </div>

                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
                        <div>
                          <p class="text-xs uppercase tracking-wide text-muted-foreground">Correo</p>
                          <p class="text-sm font-semibold text-foreground break-all">{{ oficina.email || '-' }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 flex justify-end">
                      <Button size="sm" variant="outline" class="gap-2 border-violet-200 bg-white/80">
                        <EnvelopeIcon class="h-4 w-4" />
                        Contactar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card class="border-0 shadow-sm bg-white backdrop-blur">
        <CardContent class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-gradient-primary p-2 shadow-lg shadow-amber-500/20">
              <BuildingOfficeIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-foreground">Datos generales de la oficina de créditos</h2>
              <p class="text-sm text-muted-foreground">Información administrativa del área de crédito.</p>
            </div>
          </div>

          <div v-if="loadingParametros" class="flex items-center justify-center py-10">
            <div class="flex items-center gap-2 text-amber-600">
              <ArrowPathIcon class="h-5 w-5 animate-spin" />
              <span class="text-sm font-medium">Cargando datos...</span>
            </div>
          </div>

          <div v-else-if="errorParametros"
            class="rounded-xl border border-red-200/50 bg-gradient-surface p-4 text-sm text-red-700">
            <div class="flex items-center gap-2">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
              {{ errorParametros }}
            </div>
          </div>

          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div
              class="group rounded-xl border border-amber-200/50 bg-gradient-surface p-4 shadow-md hover:shadow-lg transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <UserIcon class="h-4 w-4 text-amber-600" />
                <div class="text-xs font-bold uppercase tracking-wide text-amber-700">Jefe crédito</div>
              </div>
              <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                {{ datosGeneralesCredito?.jefcre || '-' }}
              </div>
            </div>

            <div
              class="group rounded-xl border border-emerald-200/50 bg-gradient-surface p-4 shadow-md hover:shadow-lg transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <BriefcaseIcon class="h-4 w-4 text-emerald-600" />
                <div class="text-xs font-bold uppercase tracking-wide text-emerald-700">Cargo</div>
              </div>
              <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                {{ datosGeneralesCredito?.carjefcre || '-' }}
              </div>
            </div>

            <div
              class="group rounded-xl border border-sky-200/50 bg-gradient-surface p-4 shadow-md hover:shadow-lg transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon class="h-4 w-4 text-sky-600" />
                <div class="text-xs font-bold uppercase tracking-wide text-sky-700">Valor máximo</div>
              </div>
              <div class="mt-1 text-2xl font-bold text-green-600 group-hover:text-green-700">
                {{ fmtMoney(Number(datosGeneralesCredito?.valmax || 7000000)) }}
              </div>
            </div>

            <div
              class="group rounded-xl border border-violet-200/50 bg-gradient-surface p-4 shadow-md hover:shadow-lg transition-all duration-200">
              <div class="flex items-center gap-2 mb-2">
                <CalendarIcon class="h-4 w-4 text-violet-600" />
                <div class="text-xs font-bold uppercase tracking-wide text-violet-700">Máximo de cuotas</div>
              </div>
              <div class="mt-1 text-2xl font-bold text-violet-600 group-hover:text-violet-700">
                {{ String(datosGeneralesCredito?.cuomax || 36) }}
              </div>
            </div>

            <div
              class="group rounded-xl border border-rose-200/50 bg-gradient-surface p-4 shadow-md hover:shadow-lg transition-all duration-200 md:col-span-2">
              <div class="flex items-center gap-2 mb-2">
                <AcademicCapIcon class="h-4 w-4 text-rose-600" />
                <div class="text-xs font-bold uppercase tracking-wide text-rose-700">Director</div>
              </div>
              <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                {{ datosGeneralesCredito?.diradm || '-' }}
              </div>
            </div>

            <div
              class="group rounded-xl border border-amber-200/50 bg-gradient-surface p-4 shadow-md hover:shadow-lg transition-all duration-200 md:col-span-2">
              <div class="flex items-center gap-2 mb-2">
                <UserGroupIcon class="h-4 w-4 text-amber-600" />
                <div class="text-xs font-bold uppercase tracking-wide text-amber-700">Cargo director</div>
              </div>
              <div class="mt-1 text-sm font-medium text-gray-800 group-hover:text-gray-900">
                {{ datosGeneralesCredito?.cardiradm || '-' }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOficinas } from '@/composables/oficinas/useOficinas'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import {
  ArrowPathIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const {
  loadingParametros,
  errorParametros,
  loadingConvenio,
  oficinasCredito,
  datosGeneralesCredito,
  cargarOficinas,
} = useOficinas()
</script>
