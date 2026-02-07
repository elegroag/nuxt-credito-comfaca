<template>
  <div class="mx-auto max-w-7xl p-4 sm:p-8">
    <!-- Vista para Administradores -->
    <div v-if="isAdministrator">
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
            <Button @click="refrescarEstadisticas" :disabled="loading" variant="outline">
              <RefreshCw :class="['h-5 w-5 mr-2', loading && 'animate-spin']" />
              Actualizar
            </Button>
            <Button @click="navigateTo('/admin/solicitudes')"
              class="bg-primary text-primary-foreground hover:bg-primary/90">
              <Settings class="h-5 w-5 mr-2" />
              Administración
            </Button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
        <div class="flex items-center gap-2 text-red-800">
          <AlertCircle class="h-5 w-5" />
          <p class="font-medium">{{ error }}</p>
          <Button variant="outline" size="sm" @click="refrescarEstadisticas" class="ml-auto">
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
          <Card class="border-0 shadow-sm">
            <CardContent class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Users class="h-5 w-5 text-muted-foreground" />
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
      <Card class="mb-6 border-border shadow-sm">
        <CardContent class="p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h1 class="text-2xl font-semibold tracking-tight text-foreground">Bienvenido</h1>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ session.user?.username || 'Usuario' }}
                <span v-if="(session.user?.roles || []).length" class="text-muted-foreground/60">·</span>
                <span v-if="(session.user?.roles || []).length" class="text-muted-foreground">
                  {{ (session.user?.roles || []).join(', ') }}
                </span>
              </p>
              <p class="mt-3 text-sm text-muted-foreground">Selecciona una opción para comenzar.</p>
            </div>

            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <NuxtLink to="/simulador/lineas-credito">
                <Button class="bg-primary text-primary-foreground hover:bg-primary/90">
                  <FilePlus class="h-5 w-5 mr-2" />
                  Nueva solicitud
                </Button>
              </NuxtLink>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Solicitudes Card -->
      <Card class="mb-6 border-border shadow-sm">
        <CardContent class="p-6">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-start gap-3 flex-1">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-card p-2">
                <ClipboardList class="h-full w-full text-foreground" />
              </div>
              <div class="flex-1">
                <div class="text-base font-semibold text-foreground">Mis solicitudes</div>
                <div class="mt-1 text-sm text-muted-foreground">Listado de tus solicitudes y estado actual.</div>

                <div class="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span class="font-semibold text-foreground">Flujo:</span>
                  <div v-if="loadingEstados" class="text-muted-foreground">Cargando estados...</div>
                  <template v-else-if="estadosError" class="text-destructive">
                    <span>{{ estadosError }}</span>
                    <Button variant="ghost" size="sm" @click="cargarEstados" class="ml-1 p-0 h-auto text-xs">
                      Reintentar
                    </Button>
                  </template>
                  <template v-else>
                    <template v-for="(estado, i) in estadosConColores" :key="estado.nombre">
                      <div class="flex items-center gap-1.5">
                        <div class="flex items-center gap-1 px-2 py-1 rounded-md border" :style="{
                          borderColor: estado.color + '40',
                          backgroundColor: estado.color + '20',
                          color: estado.color
                        }">
                          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: estado.color }"></div>
                          <span class="font-medium">{{ estado.nombre }}</span>
                        </div>
                        <ChevronRight v-if="i < estadosConColores.length - 1"
                          class="h-3.5 w-3.5 text-muted-foreground/40" />
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>

            <Button variant="outline" @click="cargarSolicitudes" :disabled="loadingSolicitudes"
              class="shrink-0 bg-transparent">
              <RefreshCw :class="['h-5 w-5 mr-2', loadingSolicitudes ? 'animate-spin' : '']" />
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
            <div v-else class="overflow-hidden rounded-md border border-border">
              <table class="w-full text-left text-sm">
                <thead class="bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th class="px-4 py-3">Modalidad</th>
                    <th class="px-4 py-3">Monto</th>
                    <th class="px-4 py-3">Estado</th>
                    <th class="px-4 py-3">Creación</th>
                    <th class="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in solicitudes" :key="s.numero_solicitud" class="border-t border-border">
                    <td class="px-4 py-3 text-foreground">{{ s.payload?.linea_credito?.detalle_modalidad || '-' }}</td>
                    <td class="px-4 py-3 text-foreground">{{ fmtMoney(s?.payload?.solicitud?.valor_solicitud || 0) }}
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
                        <Button variant="outline" size="sm" class="gap-1">
                          <Eye class="h-4 w-4" />
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

      <!-- Action Cards Grid -->
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink to="/simulador/lineas-credito"
          class="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-card/80">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-card p-2">
                <Calculator class="h-full w-full text-foreground" />
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
            <ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
          </div>
        </NuxtLink>

        <NuxtLink to="/solicitud"
          class="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-card/80">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-card p-2">
                <FilePlus class="h-full w-full text-foreground" />
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
            <ChevronRight class="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
          </div>
        </NuxtLink>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSession } from '~/composables/useSession'
import { useInicio } from '~/composables/inicio/useInicio'
import { useAdminDashboard } from '~/composables/admin/useAdminDashboard'
import { usePermissions } from '~/composables/usePermissions'
import {
  Calculator,
  FileText,
  Key,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  FilePlus,
  Eye,
  Clock,
  Users,
  Settings,
  AlertCircle,
  Building
} from 'lucide-vue-next'
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
const { isAdministrator } = usePermissions()
const { navigateTo } = useRouter()

// Composable para usuarios no administradores (vista original)
const {
  solicitudes,
  loadingSolicitudes,
  solicitudesError,
  flujoAprobacion,
  estadosData,
  loadingEstados,
  estadosError,
  fmtMoney,
  fmtDate,
  estadoProgressPercent,
  estadoProgressClass,
  estadoBadgeClass,
  getEstadoData,
  getEstadoColor,
  ultimaSolicitud,
  estadoIndexUltima,
  cargarEstados,
  cargarSolicitudes
} = useInicio()

// Composable para administradores (dashboard de estadísticas)
const {
  loading,
  error,
  stats,
  tieneDatos,
  tiempoSinActualizar,
  refrescarEstadisticas
} = useAdminDashboard()

// Verificar si el usuario es trabajador para ocultar opciones de firmas
const esTrabajador = computed(() => {
  return session.value?.user?.roles?.includes('user_trabajador') || false
})

// Estados con colores para mostrar en la UI
const estadosConColores = computed(() => {
  return flujoAprobacion.value.map(estado => ({
    nombre: estado,
    color: getEstadoColor(estado),
    data: getEstadoData(estado)
  }))
})

// Total de usuarios para la gráfica
const totalUsuarios = computed(() => {
  return stats.value.usuariosPorRol.reduce((sum, rol) => sum + rol.count, 0)
})
</script>
