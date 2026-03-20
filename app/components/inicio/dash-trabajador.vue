<template>
    <!-- Header Card -->
    <Card class="mb-8 border-0 shadow-sm bg-white backdrop-blur">
        <CardContent class="p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                    <h1 class="text-2xl font-semibold tracking-tight text-foreground">Bienvenido</h1>
                    <p class="mt-1 text-sm text-muted-foreground">
                        {{ nombreBienvenida || 'Usuario' }}
                    </p>
                </div>

                <div class="flex shrink-0 flex-wrap items-center gap-2">
                    <NuxtLink to="/simulador/lineas-credito">
                        <Button class="bg-gradient-primary text-white shadow-sm hover:opacity-90">
                            <DocumentPlusIcon class="h-5 w-5 mr-2" />
                            Nueva solicitud
                        </Button>
                    </NuxtLink>
                </div>
            </div>
        </CardContent>
    </Card>

    <!-- Listar Solicitudes Activas por el Trabajador -->
    <Card class="mb-8 border-0 shadow-sm bg-white backdrop-blur">
        <CardContent class="p-6">
            <div class="flex items-center justify-between gap-3 mb-6">
                <div class="flex items-start gap-3 flex-1">
                    <div
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-gradient-primary p-2 shadow-lg shadow-blue-500/20">
                        <ClipboardDocumentListIcon class="h-full w-full text-white" />
                    </div>
                    <div class="flex-1">
                        <div class="text-base font-bold text-foreground">Mis solicitudes</div>
                        <div class="mt-1 text-sm text-muted-foreground">
                            Listado de tus solicitudes y estado actual.
                        </div>
                    </div>
                </div>

                <Button variant="outline" size="sm" @click="cargarSolicitudes" :disabled="loadingSolicitudes"
                    class="border-sky-100 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
                    <ArrowPathIcon :class="['h-5 w-5 mr-2', loadingSolicitudes ? 'animate-spin' : '']" />
                    Actualizar
                </Button>
            </div>

            <div class="mt-4">
                <div v-if="loadingSolicitudes" class="flex items-center justify-center py-8">
                    <div class="flex items-center gap-2 text-blue-600">
                        <ArrowPathIcon class="h-5 w-5 animate-spin" />
                        <span class="text-sm font-medium">Cargando solicitudes...</span>
                    </div>
                </div>
                <div v-else-if="solicitudesError"
                    class="rounded-xl border border-red-200/50 bg-gradient-surface p-4 text-sm text-red-700">
                    <div class="flex items-center gap-2">
                        <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
                        {{ solicitudesError }}
                    </div>
                </div>
                <div v-else-if="solicitudes.length === 0"
                    class="rounded-xl border border-gray-200/50 bg-gradient-surface p-8 text-center">
                    <div class="flex flex-col items-center gap-3">
                        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200/50">
                            <DocumentIcon class="h-8 w-8 text-gray-400" />
                        </div>
                        <div class="text-sm font-medium text-gray-600">Aún no tienes solicitudes registradas.</div>
                        <div class="text-xs text-gray-500">Cuando crees una solicitud, aparecerá aquí.</div>
                    </div>
                </div>
                <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Card v-for="s in solicitudes" :key="s.numero_solicitud"
                        class="overflow-hidden border border-blue-200/50 bg-white/90 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                        <CardContent class="p-5">
                            <div class="flex items-start gap-4">
                                <div class="min-w-0 flex-1">
                                    <div class="flex flex-wrap items-start justify-between gap-2">
                                        <div class="min-w-0">
                                            <h3 class="truncate text-base font-semibold text-foreground">
                                                {{ s.detalle_modalidad || 'Solicitud de crédito' }}
                                            </h3>
                                            <p class="mt-1 text-sm text-muted-foreground">
                                                #{{ s.numero_solicitud }}
                                            </p>
                                        </div>
                                        <Badge :class="estadoBadgeClass(String(s.estado || ''))">
                                            {{ getEstadoData(String(s.estado || ''))?.nombre || s.estado || '-' }}
                                        </Badge>
                                    </div>

                                    <p class="mt-3 text-sm text-muted-foreground">
                                        Solicitud registrada el {{ fmtDate(s.created_at) }}.
                                    </p>

                                    <div class="mt-4 space-y-3 rounded-2xl bg-slate-50/80 p-4">
                                        <div class="flex items-start gap-3">
                                            <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                                            <div>
                                                <p class="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Valor solicitado
                                                </p>
                                                <p class="text-sm font-semibold text-foreground">
                                                    {{ fmtMoney(s.valor_solicitud || 0) }}
                                                </p>
                                            </div>
                                        </div>

                                        <div class="flex items-start gap-3">
                                            <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-secondary" />
                                            <div>
                                                <p class="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Estado del proceso
                                                </p>
                                                <p class="text-sm font-semibold text-foreground">
                                                    {{ descripcionEstadoSolicitud(s) }}
                                                </p>
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <div class="flex items-center justify-between gap-3">
                                                <p class="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Progreso del proceso
                                                </p>
                                                <span class="text-xs font-semibold text-foreground">
                                                    {{ estadoProgressPercent(String(s.estado || '')) }}%
                                                </span>
                                            </div>
                                            <Progress :model-value="estadoProgressPercent(String(s.estado || ''))"
                                                class="h-2" />
                                        </div>

                                        <div class="flex items-start gap-3">
                                            <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
                                            <div>
                                                <p class="text-xs uppercase tracking-wide text-muted-foreground">
                                                    Fecha de creación
                                                </p>
                                                <p class="text-sm font-semibold text-foreground">
                                                    {{ fmtDate(s.created_at) }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-4 flex justify-end">
                                        <NuxtLink :to="`/solicitudes/${s.numero_solicitud}`">
                                            <Button size="sm"
                                                class="gap-2 bg-gradient-primary text-white border-0 shadow-md hover:opacity-90">
                                                <EyeIcon class="h-4 w-4" />
                                                Ver detalle
                                            </Button>
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CardContent>
    </Card>

    <div class="mb-8 space-y-6">
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
                        class="border-sky-100 bg-white/80 text-slate-700 shadow-sm hover:bg-sky-50 hover:border-sky-300">
                        <ArrowPathIcon :class="['h-4 w-4 mr-2', loadingConvenio ? 'animate-spin' : '']" />
                        Actualizar
                    </Button>
                </div>

                <div v-if="errorConvenio" class="mt-4 text-sm text-destructive">
                    {{ errorConvenio }}
                </div>

                <div v-else class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        class="rounded-xl border border-blue-200/50 bg-gradient-primary p-4 shadow-lg shadow-blue-500/20">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/90">Empresa</div>
                        <div class="mt-1 text-sm font-medium text-white">
                            {{ convenioActivo?.razon_social || empresaTrabajador?.razon_social || '-' }}
                        </div>
                        <div class="mt-2 text-xs text-white/80">NIT: {{ String(convenioActivo?.nit ||
                            empresaTrabajador?.nit || '-') }}</div>
                    </div>
                    <div class="rounded-xl border bg-gradient-secundary p-4 shadow-lg">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/90">Vigencia</div>
                        <div class="mt-1 text-sm font-medium text-white">
                            Estado: {{ convenioActivo?.estado || '-' }}
                        </div>
                        <div class="mt-2 text-xs text-white/80">
                            Vence: {{ convenioActivo?.fecha_vencimiento ? fmtDate(convenioActivo.fecha_vencimiento) :
                                '-' }}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { useInicioTrabajador } from '@/composables/inicio/useInicioTrabajador';
import { fmtMoney, fmtDate } from '@/utils/generales'
import { useInicio } from '@/composables/inicio/useInicio';
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'

import {
    ArrowPathIcon,
    ClipboardDocumentListIcon,
    DocumentPlusIcon,
    ExclamationTriangleIcon,
    EyeIcon,
} from '@heroicons/vue/24/outline'

const {
    solicitudes,
    loadingSolicitudes,
    solicitudesError,
    estadoProgressPercent,
    estadoBadgeClass,
    getEstadoData,
    cargarSolicitudes
} = useInicio()

const {
    loadingConvenio,
    errorConvenio,
    convenioActivo,
    empresaTrabajador,
    cargarConvenioActivo,
    nombreBienvenida,
} = useInicioTrabajador()

const descripcionEstadoSolicitud = (s: { estado?: string }): string => {
    return getEstadoData(String(s.estado || ''))?.descripcion || 'Consulta el seguimiento de tu solicitud'
}

</script>