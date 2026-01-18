<template>
  <div class="container mx-auto py-8 px-4 max-w-5xl">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <Button variant="outline" @click="router.back()" class="shrink-0">
          <ChevronLeft class="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Detalles de Solicitud - Vista Administrador
          </h1>
          <p class="text-sm text-gray-500">
            Información completa de la solicitud de crédito
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-16 space-y-4"
    >
      <Icon
        name="lucide:loader-2"
        class="w-10 h-10 animate-spin text-primary"
      />
      <p class="text-gray-500">Cargando detalles de la solicitud...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center"
    >
      <Icon
        name="lucide:alert-circle"
        class="w-8 h-8 mx-auto mb-2 text-red-500"
      />
      <h3 class="font-bold mb-1">Error al cargar la solicitud</h3>
      <p>{{ error }}</p>
      <UiButton class="mt-4" variant="outline" @click="cargarSolicitud"
        >Reintentar</UiButton
      >
    </div>

    <!-- Solicitud Details -->
    <div v-else-if="solicitud" class="space-y-6">
      <!-- Información General -->
      <details tabindex="0" class="collapse collapse-open bg-base-100 border-base-300 border">
        <summary class="collapse-title font-semibold flex items-center gap-2">
          <FileText class="h-5 w-5" />
          Información General
        </summary>
        <div class="collapse-content">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Número de Solicitud</label
                >
                <p class="text-lg font-semibold">
                  {{
                    solicitud?.payload?.solicitud?.numero_solicitud ||
                    solicitud?.numero_solicitud ||
                    '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Estado</label>
                <div class="flex items-center gap-2 mt-1">
                  <Badge
                    :class="estadoBadgeClass(String(solicitud.estado || ''))"
                  >
                    {{ solicitud.estado || '-' }}
                  </Badge>
                  <Progress
                    :model-value="
                      estadoProgressPercent(String(solicitud.estado || ''))
                    "
                    class="w-24 h-2"
                  />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Monto Solicitado</label
                >
                <p class="text-lg font-semibold">{{ fmtMoney(solicitud.monto_solicitado || 0) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Plazo</label>
                <p class="text-lg font-semibold">{{ solicitud.plazo_meses || 0 }} meses</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Fecha de Creación</label
                >
                <p class="text-lg">{{ fmtDate(solicitud.created_at) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Línea de Crédito</label
                >
                <p class="text-lg">{{ solicitud?.payload?.linea_credito?.detalle_modalidad || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Usuario Propietario</label
                >
                <p class="text-lg font-semibold">{{ solicitud.owner_username || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Datos del Solicitante -->
      <details class="collapse bg-base-100 border-base-300 border">
        <summary class="collapse-title font-semibold flex items-center gap-2">
          <User class="h-5 w-5" />
          Datos del Solicitante
        </summary>
        <div class="collapse-content">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Nombres Completos</label
                >
                <p class="text-lg">{{ solicitud.solicitante?.nombres_apellidos || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Tipo de Identificación</label
                >
                <p class="text-lg">
                  {{
                    getTipoIdentificacion(
                      solicitud.solicitante?.tipo_identificacion
                    ) || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Número de Identificación</label
                >
                <p class="text-lg">{{ solicitud.solicitante?.numero_identificacion || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Fecha de Nacimiento</label
                >
                <p class="text-lg">
                  {{ solicitud?.payload?.solicitante?.fecha_nacimiento || '-' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Teléfono</label>
                <p class="text-lg">{{ solicitud.solicitante?.telefono_movil || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Email</label>
                <p class="text-lg">{{ solicitud.solicitante?.email || '-' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Dirección de Residencia</label
                >
                <p class="text-lg">
                  {{ solicitud?.payload?.solicitante?.barrio_residencia || '-' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Ciudad de Residencia</label
                >
                <p class="text-lg">
                  {{
                    getCiudadDescripcion(
                      solicitud?.payload?.solicitante?.ciudad_residencia
                    ) || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Tipo de Vivienda</label
                >
                <p class="text-lg">
                  {{
                    getTipoVivienda(
                      solicitud?.payload?.solicitante?.tipo_vivienda
                    ) || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Personas a Cargo</label
                >
                <p class="text-lg">
                  {{ solicitud?.payload?.solicitante?.personas_a_cargo || 0 }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Información Laboral -->
      <details class="collapse bg-base-100 border-base-300 border">
        <summary class="collapse-title font-semibold flex items-center gap-2">
          <Building class="h-5 w-5" />
          Información Laboral
        </summary>
        <div class="collapse-content">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Empresa</label>
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_laboral
                      ?.empresa_razon_social || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">NIT</label>
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_laboral?.empresa_nit || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Dirección Empresa</label
                >
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_laboral?.empresa_direccion ||
                    '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Teléfono Empresa</label
                >
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_laboral?.empresa_telefono ||
                    '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Ciudad Empresa</label
                >
                <p class="text-lg">
                  {{
                    getCiudadDescripcion(
                      solicitud?.payload?.informacion_laboral?.empresa_ciudad
                    ) || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Cargo</label>
                <p class="text-lg">
                  {{
                    getCargoDescripcion(
                      solicitud?.payload?.informacion_laboral?.cargo
                    ) || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Fecha de Ingreso</label
                >
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_laboral?.fecha_ingreso || '-'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Tiempo de Servicio</label
                >
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_laboral?.tiempo_servicio || 0
                  }}
                  {{
                    solicitud?.payload?.informacion_laboral
                      ?.tiempo_servicio_unidad || 'años'
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Tipo de Contrato</label
                >
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_laboral?.tipo_contrato || '-'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Información Financiera -->
      <details class="collapse bg-base-100 border-base-300 border">
        <summary class="collapse-title font-semibold flex items-center gap-2">
          <DollarSign class="h-5 w-5" />
          Información Financiera
        </summary>
        <div class="collapse-content">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Salario Básico</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.ingresos_descuentos
                        ?.salario_basico_mensual || 0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Subsidio de Transporte</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.ingresos_descuentos
                        ?.subsidio_transporte || 0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Salud y Pensión</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.ingresos_descuentos?.salud_pension || 0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Total Ingresos</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.ingresos_descuentos?.total_ingresos ||
                        0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Total Descuentos</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.ingresos_descuentos
                        ?.total_descuentos || 0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Neto Recibido</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.ingresos_descuentos
                        ?.total_neto_recibido || 0
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Información Económica -->
      <details class="collapse bg-base-100 border-base-300 border">
        <summary class="collapse-title font-semibold flex items-center gap-2">
          <TrendingUp class="h-5 w-5" />
          Información Económica
        </summary>
        <div class="collapse-content">
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Total Activos</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.informacion_economica?.total_activos ||
                        0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Total Pasivos</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.informacion_economica?.total_pasivos ||
                        0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Arrendamientos</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.informacion_economica
                        ?.arrendamientos || 0
                    )
                  }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Otros Gastos</label
                >
                <p class="text-lg font-semibold">
                  {{
                    fmtMoney(
                      solicitud?.payload?.informacion_economica?.total_gastos ||
                        0
                    )
                  }}
                </p>
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-gray-500"
                  >Descripción Gastos</label
                >
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_economica
                      ?.gastos_descripcion || '-'
                  }}
                </p>
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-gray-500"
                  >Descripción Actividades</label
                >
                <p class="text-lg">
                  {{
                    solicitud?.payload?.informacion_economica?.descripcion || '-'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Documentos Adjuntos -->
      <details class="collapse bg-base-100 border-base-300 border">
        <summary class="collapse-title font-semibold flex items-center gap-2">
          <Paperclip class="h-5 w-5" />
          Documentos Adjuntos
        </summary>
        <div class="collapse-content">
          <div class="space-y-4">
            <div v-if="solicitud.documentos && solicitud.documentos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="documento in solicitud.documentos"
                :key="documento.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start gap-3">
                  <FileText class="h-8 w-8 text-blue-500 shrink-0 mt-1" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-900 truncate">
                      {{ documento.documento_requerido_id || 'Sin ID' }}
                    </h4>
                    <div class="mt-2 space-y-1">
                      <p class="text-sm text-gray-500">
                        Subido: {{ fmtDate(documento.created_at) }}
                      </p>
                      <p v-if="documento.tamano_bytes" class="text-sm text-gray-500">
                        Tamaño: {{ formatFileSize(documento.tamano_bytes) }}
                      </p>
                      <p v-if="documento.tipo_mime" class="text-sm text-gray-500">
                        Tipo: {{ documento.tipo_mime }}
                      </p>
                    </div>
                    <div class="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="descargarDocumento(documento)"
                        class="gap-1"
                      >
                        <Download class="h-3 w-3" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        @click="vistaPreviaDocumento(documento)"
                        class="gap-1"
                      >
                        <Eye class="h-3 w-3" />
                        Vista Previa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <Paperclip class="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p class="text-lg font-medium">No hay documentos adjuntos</p>
              <p class="text-sm">Esta solicitud no tiene documentos cargados actualmente.</p>
            </div>
          </div>
        </div>
      </details>

      <!-- Acciones Administrativas -->
      <details class="collapse bg-base-100 border-base-300 border">
        <summary class="collapse-title font-semibold">Acciones Administrativas</summary>
        <div class="collapse-content">
          <div class="flex flex-wrap gap-3">
            <NuxtLink :to="`/admin/solicitudes/edit/${solicitud.id}`">
              <Button variant="outline" class="gap-2">
                <Edit class="h-4 w-4" />
                Editar Solicitud
              </Button>
            </NuxtLink>
          </div>
        </div>
      </details>
    </div>
  </div>

  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import type { SolicitudCredito } from '~/shared/types/solicitud-credito';
import {
  FileText,
  User,
  Building,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Edit,
  Paperclip,
  Download,
  Eye,
} from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import Card from '@/components/ui/Card.vue';
import CardHeader from '@/components/ui/CardHeader.vue';
import CardTitle from '@/components/ui/CardTitle.vue';
import CardContent from '@/components/ui/CardContent.vue';
import Badge from '@/components/ui/Badge.vue';
import Progress from '@/components/ui/Progress.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

const route = useRoute();
const router = useRouter();
const { getJson } = useApi();
const { ready } = useSession();

const solicitudId = route.params.id as string;
const solicitud = ref<SolicitudCredito | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

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

const estadoBadgeClass = (estado: string) => {
  const classes: Record<string, string> = {
    'Postulado': 'bg-gray-100 text-gray-700',
    'Documentos cargados': 'bg-yellow-100 text-yellow-700',
    'Firmado': 'bg-green-100 text-green-700',
    'Aprobado': 'bg-emerald-100 text-emerald-700',
    'Rechazado': 'bg-red-100 text-red-700'
  }
  return classes[estado] || 'bg-gray-100 text-gray-700'
};

const estadoProgressPercent = (estado: string) => {
  const estados = [
    'Postulado',
    'Documentos cargados',
    'Firmado',
    'Aprobado',
  ];
  const index = estados.indexOf(estado);
  return index >= 0 ? ((index + 1) / estados.length) * 100 : 0;
};

const getTipoIdentificacion = (tipo: string | undefined) => {
  const tipos: Record<string, string> = {
    '1': 'Cédula de Ciudadanía',
    '2': 'Cédula de Extranjería',
    '3': 'Tarjeta de Identidad',
    '4': 'Pasaporte',
  };
  return tipo ? tipos[tipo] || tipo : '';
};

const getCargoDescripcion = (cargo: string | undefined) => {
  const cargos: Record<string, string> = {
    '2519': 'Profesional',
    '2520': 'Técnico',
    '2521': 'Auxiliar',
    '2522': 'Operativo',
  };
  return cargo ? cargos[cargo] || cargo : '';
};

const getCiudadDescripcion = (ciudad: string | undefined) => {
  const ciudades: Record<string, string> = {
    '18001': 'Florencia - Caquetá',
    '73001': 'Bogotá D.C.',
    '76001': 'Cali - Valle del Cauca',
    '05001': 'Medellín - Antioquia',
    '11001': 'Bucaramanga - Santander',
    '13001': 'Cartagena - Bolívar',
    '20001': 'Valledupar - Cesar',
    '27001': 'Cúcuta - Norte de Santander',
    '41001': 'Neiva - Huila',
    '44001': 'Ibagué - Tolima',
    '47001': 'Villavicencio - Meta',
    '50001': 'Pasto - Nariño',
    '52001': 'Cúcuta - Norte de Santander',
    '54001': 'Armenia - Quindío',
    '66001': 'Pereira - Risaralda',
    '68001': 'Manizales - Caldas',
    '70001': 'Popayán - Cauca',
    '77001': 'Sincelejo - Sucre',
    '78001': 'Montería - Córdoba',
    '80001': 'Barranquilla - Atlántico',
    '85001': 'Santa Marta - Magdalena',
  };
  return ciudad ? ciudades[ciudad] || ciudad : '';
};

const getTipoVivienda = (tipo: string | undefined) => {
  const tipos: Record<string, string> = {
    propia: 'Propia',
    arrendada: 'Arrendada',
    familiar: 'Casa de familiar',
    otra: 'Otra',
  };
  return tipo ? tipos[tipo] || tipo : '';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const descargarDocumento = async (documento: any) => {
  try {
    const response = await getJson<{ url: string }>(`/api/documentos/${documento.id}/download`, { auth: true });
    if (response.url) {
      window.open(response.url, '_blank');
    }
  } catch (error) {
    console.error('Error al descargar documento:', error);
  }
};

const vistaPreviaDocumento = async (documento: any) => {
  try {
    const response = await getJson<{ url: string }>(`/api/documentos/${documento.id}/preview`, { auth: true });
    if (response.url) {
      window.open(response.url, '_blank');
    }
  } catch (error) {
    console.error('Error al vista previa documento:', error);
  }
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

onMounted(() => {
  cargarSolicitud();
});
</script>