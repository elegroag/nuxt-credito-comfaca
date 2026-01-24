<template>
    <div class="min-h-screen  py-8 px-4">
        <div class="container mx-auto max-w-6xl">
            <!-- Loading State -->
            <div
                v-if="loading"
                class="flex flex-col items-center justify-center py-24 space-y-4"
            >
                <Icon
                    name="lucide:loader-2"
                    class="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400"
                />
                <p class="text-gray-600 dark:text-gray-400 font-medium">Cargando detalles de la solicitud...</p>
            </div>

            <!-- Error State -->
            <div
                v-else-if="error"
                class="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-8 rounded-2xl text-center shadow-lg"
            >
                <Icon
                    name="lucide:alert-circle"
                    class="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400"
                />
                <h3 class="text-xl font-bold mb-2">Error al cargar la solicitud</h3>
                <p class="mb-4">{{ error }}</p>
                <Button class="mt-4" variant="outline" @click="cargarSolicitud">
                    Reintentar
                </Button>
            </div>

            <!-- Solicitud Details -->
            <div v-else-if="solicitud" class="space-y-6">
                <!-- Header -->
                <SolicitudHeader
                    :numero-solicitud="numeroSolicitudDisplay"
                    :estado-nombre="getEstadoNombre(String(solicitud.estado || ''))"
                    :badge-class="getEstadoBadgeClass(String(solicitud.estado || ''))"
                    :progress="getEstadoProgress(String(solicitud.estado || ''))"
                />

                <!-- Timeline del Proceso -->
                <SolicitudTimeline
                    :estados="estadosTimelineConFechas"
                    :estado-actual-id="solicitud?.estado"
                    :fecha-envio="solicitud?.timeline?.find(t => t.estado === solicitud?.estado)?.fecha"
                />

                <!-- Información General -->
                <InfoGeneral
                    :numero-solicitud="numeroSolicitudDisplay"
                    :monto-solicitado="fmtMoney(solicitud?.payload?.solicitud?.valor_solicitud || 0)"
                    :plazo-meses="solicitud.plazo_meses || 0"
                    :fecha-creacion="fmtDate(solicitud.created_at)"
                    :linea-credito="solicitud?.payload?.linea_credito?.detalle_modalidad || '-'"
                />

                <!-- Datos del Solicitante -->
                <DatosSolicitante
                    :nombres-apellidos="solicitud.solicitante?.nombres_apellidos || '-'"
                    :tipo-identificacion="buscarTipoIdentificacion(solicitud.solicitante?.tipo_identificacion) || '-'"
                    :numero-identificacion="solicitud.solicitante?.numero_identificacion || '-'"
                    :fecha-nacimiento="solicitud?.payload?.solicitante?.fecha_nacimiento || '-'"
                    :telefono="solicitud.solicitante?.telefono_movil || '-'"
                    :email="solicitud.solicitante?.email || '-'"
                    :direccion="solicitud?.payload?.solicitante?.barrio_residencia || '-'"
                    :ciudad="buscarCiudad(solicitud?.payload?.solicitante?.ciudad_residencia) || '-'"
                    :tipo-vivienda="buscarTipoVivienda(solicitud?.payload?.solicitante?.tipo_vivienda) || '-'"
                    :personas-a-cargo="solicitud?.payload?.solicitante?.personas_a_cargo || 0"
                    :categoria="solicitud?.payload?.solicitante?.codigo_categoria || '-'"
                    :salario="fmtMoney(solicitud?.payload?.solicitante?.salario || 0)"
                    :empresa-nit="solicitud?.payload?.solicitante?.empresa_nit || '-'"
                    :empresa-razon-social="solicitud?.payload?.solicitante?.empresa_razon_social || '-'"
                />

                <!-- Información Laboral -->
                <InfoLaboral
                    :empresa-razon-social="solicitud?.payload?.informacion_laboral?.empresa_razon_social || '-'"
                    :empresa-nit="solicitud?.payload?.informacion_laboral?.empresa_nit || '-'"
                    :empresa-direccion="solicitud?.payload?.informacion_laboral?.empresa_direccion || '-'"
                    :empresa-telefono="solicitud?.payload?.informacion_laboral?.empresa_telefono || '-'"
                    :empresa-ciudad="buscarCiudad(solicitud?.payload?.informacion_laboral?.empresa_ciudad) || '-'"
                    :cargo="buscarCargo(solicitud?.payload?.informacion_laboral?.cargo) || '-'"
                    :fecha-ingreso="solicitud?.payload?.informacion_laboral?.fecha_ingreso || '-'"
                    :tiempo-servicio="`${solicitud?.payload?.informacion_laboral?.tiempo_servicio || 0} ${solicitud?.payload?.informacion_laboral?.tiempo_servicio_unidad || 'años'}`"
                    :tipo-contrato="solicitud?.payload?.informacion_laboral?.tipo_contrato || '-'"
                />

                <!-- Información Financiera -->
                <InfoFinanciera
                    :salario-basico="fmtMoney(solicitud?.payload?.ingresos_descuentos?.salario_basico_mensual || 0)"
                    :subsidio-transporte="fmtMoney(solicitud?.payload?.ingresos_descuentos?.subsidio_transporte || 0)"
                    :salud-pension="fmtMoney(solicitud?.payload?.ingresos_descuentos?.salud_pension || 0)"
                    :total-ingresos="fmtMoney(solicitud?.payload?.ingresos_descuentos?.total_ingresos || 0)"
                    :total-descuentos="fmtMoney(solicitud?.payload?.ingresos_descuentos?.total_descuentos || 0)"
                    :neto-recibido="fmtMoney(solicitud?.payload?.ingresos_descuentos?.total_neto_recibido || 0)"
                />

                <!-- Información Económica -->
                <InfoEconomica
                    :total-activos="fmtMoney(solicitud?.payload?.informacion_economica?.total_activos || 0)"
                    :total-pasivos="fmtMoney(solicitud?.payload?.informacion_economica?.total_pasivos || 0)"
                    :arrendamientos="fmtMoney(solicitud?.payload?.informacion_economica?.arrendamientos || 0)"
                    :otros-gastos="fmtMoney(solicitud?.payload?.informacion_economica?.total_gastos || 0)"
                    :gastos-descripcion="solicitud?.payload?.informacion_economica?.gastos_descripcion"
                    :descripcion-actividades="solicitud?.payload?.informacion_economica?.descripcion"
                />

                <!-- Documentos Cargados -->
                <DocumentosCard :documentos="solicitud.documentos || []" />

                <!-- Acciones -->
                <AccionesCard
                    :solicitud-id="solicitud.id"
                    :mostrar-enviar="solicitud.estado === 'DOCUMENTOS_CARGADOS' || solicitud.estado === 'POSTULADO'"
                    :tiene-pdf="!!solicitud.pdf_filename"
                    @descargar-pdf="descargarPdf"
                    @eliminar="mostrarModalEliminar = true"
                />

                <!-- Modal de confirmación de eliminación -->
                <Dialog v-model:open="mostrarModalEliminar">
                    <DialogContent class="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle class="flex items-center gap-2">
                                <AlertTriangle class="h-5 w-5 text-destructive" />
                                Eliminar Solicitud
                            </DialogTitle>
                            <DialogDescription>
                                ¿Está seguro que desea eliminar esta solicitud? Esta acción no se
                                puede deshacer y se perderán todos los datos asociados.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter class="flex gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                @click="mostrarModalEliminar = false"
                                :disabled="eliminando"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                @click="eliminarSolicitud"
                                :disabled="eliminando"
                            >
                                <Loader2 v-if="eliminando" class="h-4 w-4 mr-2 animate-spin" />
                                {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import { useParametrosDetalles } from '~/composables/useParametrosDetalles';
import type { SolicitudCredito } from '~/shared/types/solicitud-credito';
import { AlertTriangle, Loader2 } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog/exports';
import SolicitudHeader from '@/components/solicitudes/SolicitudHeader.vue';
import SolicitudTimeline from '@/components/shared/SolicitudTimeline.vue';
import InfoGeneral from '@/components/solicitudes/InfoGeneral.vue';
import DatosSolicitante from '@/components/solicitudes/DatosSolicitante.vue';
import InfoLaboral from '@/components/solicitudes/InfoLaboral.vue';
import InfoFinanciera from '@/components/solicitudes/InfoFinanciera.vue';
import InfoEconomica from '@/components/solicitudes/InfoEconomica.vue';
import DocumentosCard from '@/components/solicitudes/DocumentosCard.vue';
import AccionesCard from '@/components/solicitudes/AccionesCard.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

const route = useRoute();
const router = useRouter();
const { getJson, deleteJson } = useApi();
const { ready } = useSession();

const {
    loading: loadingParametros,
    error: errorParametros,
    cargarParametros,
    buscarTipoIdentificacion,
    buscarCiudad,
    buscarCargo,
    buscarTipoVivienda,
    buscarTipoContrato,
    getEstadoNombre,
    getEstadoBadgeClass,
    estadoProgressPercent: getEstadoProgress
} = useParametrosDetalles();

const solicitudId = route.params.id as string;
const solicitud = ref<SolicitudCredito | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const mostrarModalEliminar = ref(false);
const eliminando = ref(false);

const numeroSolicitudDisplay = computed(() => {
    return solicitud.value?.payload?.solicitud?.numero_solicitud ||
        solicitud.value?.numero_solicitud ||
        '-';
});

// Estados base para el timeline
const estadosTimelineBase = [
    {
        id: 'POSTULADO',
        nombre: 'Postulación Inicial',
        descripcion: 'Solicitud de crédito iniciada y datos básicos registrados'
    },
    {
        id: 'DOCUMENTOS_CARGADOS',
        nombre: 'Documentación Completada',
        descripcion: 'Todos los documentos requeridos han sido cargados exitosamente'
    },
    {
        id: 'ENVIADO_VALIDACION',
        nombre: 'Enviado para Validación',
        descripcion: 'Solicitud enviada para validación por asesores'
    },
    {
        id: 'PENDIENTE_FIRMADO',
        nombre: 'Pendiente de Firma',
        descripcion: 'La solicitud está lista para ser firmada electrónicamente'
    },
    {
        id: 'FIRMADO',
        nombre: 'Solicitud Firmada',
        descripcion: 'La solicitud ha sido firmada y está lista para ser enviada'
    },
    {
        id: 'ENVIADO_PENDIENTE_APROBACION',
        nombre: 'En Proceso de Aprobación',
        descripcion: 'La solicitud está siendo evaluada por el comité de crédito'
    }
];

// Estados con fechas reales del timeline
const estadosTimelineConFechas = computed(() => {
    if (!solicitud.value?.timeline) return estadosTimelineBase;
    
    return estadosTimelineBase.map(estado => {
        const timelineEntry = solicitud.value?.timeline?.find(t => t.estado === estado.id);
        return {
            ...estado,
            fecha: timelineEntry ? fmtDate(timelineEntry.fecha) : undefined
        };
    });
});

// Funciones de utilidad
const fmtMoney = (value: number | undefined) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

const fmtDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const cargarSolicitud = async () => {
  loading.value = true;
  error.value = null;
  try {
    await ready;
    const response = await getJson<{
      success: boolean;
      data: SolicitudCredito;
    }>(`/api/solicitudes-credito/${solicitudId}`, { auth: true });
    solicitud.value = response.data;
  } catch (e: any) {
    console.error(e);
    error.value =
      e.message || 'No se pudo cargar la información de la solicitud.';
  } finally {
    loading.value = false;
  }
};

const descargarPdf = async () => {
  if (!solicitud.value?.pdf_filename) return;

  try {
    const response = await fetch(
      `${
        useRuntimeConfig().public.backendBaseUrl
      }/api/solicitudes-credito/${solicitudId}/pdf/file`,
      {
        headers: {
          Authorization: `Bearer ${useSession().session.value.accessToken}`,
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = solicitud.value.pdf_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.error('Error descargando PDF:', e);
  }
};

const eliminarSolicitud = async () => {
  eliminando.value = true;
  try {
    await ready;
    await deleteJson(`/api/solicitudes-credito/${solicitudId}`, { auth: true });

    // Redirigir a la página de solicitudes después de eliminar
    router.push('/inicio');
  } catch (e: any) {
    console.error('Error eliminando solicitud:', e);
    error.value = e.message || 'No se pudo eliminar la solicitud.';
    mostrarModalEliminar.value = false;
  } finally {
    eliminando.value = false;
  }
};

onMounted(() => {
  cargarSolicitud();
});
</script>
