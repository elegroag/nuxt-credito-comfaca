<template>
  <div class="min-h-[calc(100vh-4rem)]">
    <div class="mx-auto max-w-7xl p-4 sm:p-8">
      <!-- Vista para Administradores -->
      <div v-if="isAdministrator || isAdviser">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h1 class="text-2xl font-semibold tracking-tight text-foreground">Dashboard Administrativo</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Bienvenido, {{ session.user?.username || 'Administrador' }}
              </p>
              <p class="mt-3 text-sm text-muted-foreground">
                {{ tiempoSinActualizar || 'Cargando...' }}
              </p>
            </div>

            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <Button @click="refrescarEstadisticas" :disabled="loading" variant="outline"
                class="border-sky-200 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
                <ArrowPathIcon :class="['h-5 w-5 mr-2', loading && 'animate-spin']" />
                Actualizar
              </Button>
              <Button @click="router.push('/admin/solicitudes')"
                class="bg-linear-to-r from-violet-500 to-sky-500 text-white shadow-sm hover:from-violet-600 hover:to-sky-600">
                <Cog6ToothIcon class="h-5 w-5 mr-2" />
                Administración
              </Button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <div class="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon class="h-5 w-5" />
            <p class="font-medium">{{ error }}</p>
            <Button variant="outline" size="sm" @click="refrescarEstadisticas"
              class="ml-auto border-red-200 bg-white/80 text-red-800 shadow-sm hover:bg-red-50 hover:border-red-300">
              Reintentar
            </Button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !tieneDatos" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="rounded-lg border border-border bg-card p-6">
              <div class="space-y-3">
                <div class="h-4 bg-muted rounded animate-pulse" />
                <div class="h-8 bg-muted rounded animate-pulse" />
                <div class="h-3 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="space-y-6">
          <AdminStatsGrid :stats="stats" />

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <AdminRecentActivity :activities="stats.actividadReciente" :loading="loading"
                @refresh="refrescarEstadisticas" />
            </div>

            <!-- Usuarios por Rol -->
            <Card class="border-0 shadow-sm bg-white backdrop-blur">
              <CardContent class="p-6">
                <div class="flex items-center gap-2 mb-4">
                  <UsersIcon class="h-5 w-5 text-muted-foreground" />
                  <h3 class="text-lg font-semibold">Usuarios por Rol</h3>
                </div>

                <div v-if="stats.usuariosPorRol.length > 0" class="space-y-3">
                  <div v-for="rol in stats.usuariosPorRol" :key="rol.rol" class="flex items-center justify-between">
                    <span class="text-sm font-medium capitalize">{{ rol.rol }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold">{{ rol.count }}</span>
                      <div class="w-16 bg-secondary rounded-full h-2">
                        <div class="h-2 rounded-full bg-primary"
                          :style="{ width: `${(rol.count / totalUsuarios) * 100}%` }" />
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-muted-foreground">
                  <Users class="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">No hay datos de usuarios</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <!-- Vista para Usuarios No Administradores (vista original) -->
      <div v-else>
        <!-- Header Card -->
        <Card class="mb-6 border-0 shadow-sm bg-white backdrop-blur">
          <CardContent class="p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <h1 class="text-2xl font-semibold tracking-tight text-foreground">Bienvenido</h1>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ nombreBienvenida || 'Usuario' }}
                  <span v-if="(session.user?.roles || []).length" class="text-muted-foreground/60">·</span>
                  <span v-if="(session.user?.roles || []).length" class="text-muted-foreground">
                    {{ (session.user?.roles || []).join(', ') }}
                  </span>
                </p>
                <p class="mt-3 text-sm text-muted-foreground">Selecciona una opción para comenzar.</p>
              </div>

              <div class="flex shrink-0 flex-wrap items-center gap-2">
                <NuxtLink to="/simulador/lineas-credito">
                  <Button
                    class="bg-linear-to-r from-emerald-500 to-sky-500 text-white shadow-sm hover:from-emerald-600 hover:to-sky-600">
                    <DocumentPlusIcon class="h-5 w-5 mr-2" />
                    Nueva solicitud
                  </Button>
                </NuxtLink>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Solicitudes Card -->
        <Card class="mb-6 border-0 shadow-sm bg-white backdrop-blur">
          <CardContent class="p-6">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-start gap-3 flex-1">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-card p-2">
                  <ClipboardDocumentListIcon class="h-full w-full text-foreground" />
                </div>
                <div class="flex-1">
                  <div class="text-base font-semibold text-foreground">Mis solicitudes</div>
                  <div class="mt-1 text-sm text-muted-foreground">
                    Listado de tus solicitudes y estado actual.
                  </div>
                </div>
              </div>

              <Button variant="outline" @click="cargarSolicitudes" :disabled="loadingSolicitudes"
                class="shrink-0 border-sky-200 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
                <ArrowPathIcon :class="['h-5 w-5 mr-2', loadingSolicitudes ? 'animate-spin' : '']" />
                Actualizar
              </Button>
            </div>

            <div class="mt-4">
              <div v-if="loadingSolicitudes" class="text-sm text-muted-foreground">
                Cargando solicitudes...
              </div>
              <div v-else-if="solicitudesError" class="text-sm text-destructive">
                {{ solicitudesError }}
              </div>
              <div v-else-if="solicitudes.length === 0"
                class="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Aún no tienes solicitudes registradas.
              </div>
              <div v-else class="overflow-hidden rounded-xl border border-sky-200/60 bg-white">
                <table class="w-full text-left text-sm">
                  <thead
                    class="bg-linear-to-r from-sky-100 via-violet-100 to-rose-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    <tr>
                      <th class="px-4 py-3">Modalidad</th>
                      <th class="px-4 py-3">Monto</th>
                      <th class="px-4 py-3">Estado</th>
                      <th class="px-4 py-3">Creación</th>
                      <th class="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in solicitudes" :key="s.numero_solicitud"
                      class="border-t border-sky-200/40 hover:bg-sky-50/40">
                      <td class="px-4 py-3 text-foreground">{{ s?.detalle_modalidad || '-' }}</td>
                      <td class="px-4 py-3 text-foreground">{{ fmtMoney(s?.valor_solicitud || 0) }}
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex flex-col gap-2">
                          <Badge :class="`w-fit ${estadoBadgeClass(String(s.estado || ''))}`">
                            {{ getEstadoData(String(s.estado || ''))?.nombre || s.estado || '-' }}
                          </Badge>
                          <Progress :model-value="estadoProgressPercent(String(s.estado || ''))" class="w-32 h-1.5" />
                        </div>
                      </td>
                      <td class="px-4 py-3 text-foreground">{{ fmtDate(s.created_at) }}</td>
                      <td class="px-4 py-3">
                        <NuxtLink :to="`/solicitudes/${s.numero_solicitud}`">
                          <Button variant="outline" size="sm"
                            class="gap-1 border-violet-200 bg-white/80 text-slate-700 shadow-sm hover:bg-violet-50 hover:border-violet-300">
                            <EyeIcon class="h-4 w-4" />
                            Ver
                          </Button>
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Vista específica para Trabajadores -->
        <div v-if="isTrabajador" class="mb-6 space-y-6">
          <!-- Convenio activo -->
          <Card class="border-0 shadow-sm bg-white backdrop-blur">
            <CardContent class="p-6">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="text-lg font-semibold text-foreground">Convenio activo</h2>
                  <p class="mt-1 text-sm text-muted-foreground">
                    Información del convenio de tu empresa.
                  </p>
                </div>
                <Button variant="outline" size="sm" @click="cargarConvenioActivo" :disabled="loadingConvenio"
                  class="border-sky-200 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
                  <ArrowPathIcon :class="['h-4 w-4 mr-2', loadingConvenio ? 'animate-spin' : '']" />
                  Actualizar
                </Button>
              </div>

              <div v-if="errorConvenio" class="mt-4 text-sm text-destructive">
                {{ errorConvenio }}
              </div>

              <div v-else class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-sky-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Empresa</div>
                  <div class="mt-1 text-sm text-foreground">
                    {{ convenioActivo?.razon_social || empresaTrabajador?.razon_social || '-' }}
                  </div>
                  <div class="mt-2 text-xs text-muted-foreground">NIT: {{ String(convenioActivo?.nit ||
                    empresaTrabajador?.nit || '-') }}</div>
                </div>
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-violet-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vigencia</div>
                  <div class="mt-1 text-sm text-foreground">
                    Estado: {{ convenioActivo?.estado || '-' }}
                  </div>
                  <div class="mt-2 text-xs text-muted-foreground">
                    Vence: {{ convenioActivo?.fecha_vencimiento ? fmtDate(convenioActivo.fecha_vencimiento) : '-' }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Parámetros relevantes -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Motivos de rechazo -->
            <Card class="border-0 shadow-sm bg-white backdrop-blur">
              <CardContent class="p-6">
                <h3 class="text-base font-semibold text-foreground">Motivos de rechazo</h3>
                <p class="mt-1 text-sm text-muted-foreground">Parámetros generales del crédito.</p>

                <div v-if="loadingParametros" class="mt-4 text-sm text-muted-foreground">Cargando...</div>
                <div v-else-if="errorParametros" class="mt-4 text-sm text-destructive">{{ errorParametros }}</div>
                <div v-else class="mt-4 space-y-2 max-h-64 overflow-auto">
                  <div v-for="m in motivosRechazo" :key="m.modrec"
                    class="rounded-xl border border-white/60 bg-linear-to-br from-rose-50 to-white p-3">
                    <div class="mt-1 text-sm text-foreground">{{ m.detalle }}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Oficinas de crédito -->
            <Card class="border-0 shadow-sm bg-white backdrop-blur lg:col-span-2">
              <CardContent class="p-6">
                <h3 class="text-base font-semibold text-foreground">Oficinas de crédito</h3>
                <p class="mt-1 text-sm text-muted-foreground">Canales disponibles para atención.</p>

                <div v-if="loadingParametros" class="mt-4 text-sm text-muted-foreground">Cargando...</div>
                <div v-else-if="errorParametros" class="mt-4 text-sm text-destructive">{{ errorParametros }}</div>
                <div v-else class="mt-4 overflow-hidden rounded-xl border border-violet-200/60 bg-white">
                  <table class="w-full text-left text-sm">
                    <thead
                      class="bg-linear-to-r from-violet-100 via-sky-100 to-rose-100 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      <tr>
                        <th class="px-4 py-3">Oficina</th>
                        <th class="px-4 py-3">Dirección</th>
                        <th class="px-4 py-3">Contacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="o in oficinasCredito" :key="o.ofiafi"
                        class="border-t border-violet-200/40 hover:bg-violet-50/40">
                        <td class="px-4 py-3 text-foreground">
                          <div class="font-medium">{{ o.detalle }}</div>
                          <div class="text-xs text-muted-foreground">Código: {{ o.ofiafi }}</div>
                        </td>
                        <td class="px-4 py-3 text-foreground">{{ o.direccion || '-' }}</td>
                        <td class="px-4 py-3 text-foreground">
                          <div class="text-xs text-muted-foreground">Tel: {{ o.telefono || '-' }}</div>
                          <div class="text-xs text-muted-foreground">Email: {{ o.email || '-' }}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Datos generales del crédito -->
          <Card class="border-0 shadow-sm bg-white backdrop-blur">
            <CardContent class="p-6">
              <h3 class="text-base font-semibold text-foreground">Datos generales de la oficina de créditos</h3>
              <p class="mt-1 text-sm text-muted-foreground">Información administrativa.</p>

              <div v-if="loadingParametros" class="mt-4 text-sm text-muted-foreground">Cargando...</div>
              <div v-else-if="errorParametros" class="mt-4 text-sm text-destructive">{{ errorParametros }}</div>
              <div v-else class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-amber-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jefe crédito</div>
                  <div class="mt-1 text-sm text-foreground">{{ datosGeneralesCredito?.jefcre || '-' }}</div>
                </div>
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-emerald-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cargo</div>
                  <div class="mt-1 text-sm text-foreground">{{ datosGeneralesCredito?.carjefcre || '-' }}</div>
                </div>
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-sky-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor máximo</div>
                  <div class="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    {{ fmtMoney(Number(datosGeneralesCredito?.valmax || 7000000)) }}
                  </div>
                </div>
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-violet-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Máximo de cuotas
                  </div>
                  <div class="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    {{ String(datosGeneralesCredito?.cuomax || 36) }}
                  </div>
                </div>
              </div>

              <div v-if="!loadingParametros && !errorParametros" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-rose-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Director</div>
                  <div class="mt-1 text-sm text-foreground">{{ datosGeneralesCredito?.diradm || '-' }}</div>
                </div>
                <div class="rounded-xl border border-white/60 bg-linear-to-br from-amber-50 to-white p-4">
                  <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cargo director</div>
                  <div class="mt-1 text-sm text-foreground">{{ datosGeneralesCredito?.cardiradm || '-' }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Action Cards Grid -->
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/simulador/lineas-credito"
            class="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-card/80">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-card p-2">
                  <CalculatorIcon class="h-full w-full text-foreground" />
                </div>
                <div class="min-w-0">
                  <div class="text-base font-semibold text-foreground group-hover:text-primary">
                    Simulador de crédito
                  </div>
                  <div class="mt-1 text-sm text-muted-foreground">
                    Cuota mensual, tasa efectiva y capacidad de endeudamiento
                  </div>
                </div>
              </div>
              <ChevronRightIcon class="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
            </div>
          </NuxtLink>

          <NuxtLink to="/solicitud"
            class="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-card/80">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-card p-2">
                  <DocumentPlusIcon class="h-full w-full text-foreground" />
                </div>
                <div class="min-w-0">
                  <div class="text-base font-semibold text-foreground group-hover:text-primary">
                    Solicitud de crédito
                  </div>
                  <div class="mt-1 text-sm text-muted-foreground">
                    Captura secuencial por bloques y generación de XML
                  </div>
                </div>
              </div>
              <ChevronRightIcon class="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSession } from '~/composables/useSession'
import { useInicio } from '~/composables/inicio/useInicio'
import { useInicioTrabajador } from '~/composables/inicio/useInicioTrabajador'
import { useAdminDashboard } from '~/composables/admin/useAdminDashboard'
import { usePermissions } from '~/composables/usePermissions'
import {
  ArrowPathIcon,
  CalculatorIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentPlusIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import AdminStatsGrid from '@/components/admin/AdminStatsGrid.vue'
import AdminRecentActivity from '@/components/admin/AdminRecentActivity.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { session } = useSession()
const { isAdministrator, isAdviser, isTrabajador } = usePermissions()
const router = useRouter()

const nombreBienvenida = computed(() => {
  const user = session.value.user
  if (!user) return ''

  if (isTrabajador.value && user.trabajador) {
    const t = user.trabajador
    const nombres = [t.primer_nombre, t.segundo_nombre].filter(Boolean).join(' ').trim()
    const apellidos = [t.primer_apellido, t.segundo_apellido].filter(Boolean).join(' ').trim()
    return `${nombres} ${apellidos}`.trim()
  }

  const full = `${user.nombres || ''} ${user.apellidos || ''}`.trim()
  if (full) return full

  return user.username
})

// Composable para usuarios no administradores (vista original)
const {
  solicitudes,
  loadingSolicitudes,
  solicitudesError,
  fmtMoney,
  fmtDate,
  estadoProgressPercent,
  estadoBadgeClass,
  getEstadoData,
  cargarSolicitudes
} = useInicio()

const {
  loadingParametros,
  errorParametros,
  loadingConvenio,
  errorConvenio,
  convenioActivo,
  empresaTrabajador,
  motivosRechazo,
  oficinasCredito,
  datosGeneralesCredito,
  cargarConvenioActivo
} = useInicioTrabajador()

// Composable para administradores (dashboard de estadísticas)
const {
  loading,
  error,
  stats,
  tieneDatos,
  tiempoSinActualizar,
  refrescarEstadisticas
} = useAdminDashboard()

// Total de usuarios para la gráfica
const totalUsuarios = computed(() => {
  return stats.value.usuariosPorRol.reduce((sum, rol) => sum + rol.count, 0)
})
</script>
