<template>
  <div class="admin-solicitudes">
    <div class="admin-header">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="sm" @click="navigateTo('/admin/solicitudes')" class="text-muted-foreground">
          ← Volver a solicitudes
        </Button>
      </div>
    </div>
    <div class="header-content mb-3 flex items-center justify-between gap-4">
      <h1>Buscar Solicitudes</h1>
      <div class="flex items-center gap-2">
        <button type="button" @click="aplicarFiltrosForm" class="btn btn-primary" :disabled="loading">
          <MagnifyingGlassIcon class="h-5 w-5 mr-2" />
          Aplicar Filtros
        </button>
        <button type="button" @click="limpiarFiltrosForm" class="btn btn-outline">
          <XMarkIcon class="h-5 w-5 mr-2" />
          Limpiar Filtros
        </button>
      </div>
    </div>

    <!-- Alerta de filtros activos -->
    <div v-if="tieneFiltrosActivos" class="filtros-activos-alert">
      <FunnelIcon class="h-5 w-5 mr-2" />
      Hay filtros activos aplicados
      <button @click="limpiarFiltros" class="btn btn-sm btn-outline ml-2">
        Limpiar todos
      </button>
    </div>

    <section class="filtros-section">
      <div class="filtros-content">
        <form @submit.prevent="aplicarFiltrosForm" class="filtros-form">
          <div class="filtros-grid">
            <!-- Filtros de usuario -->
            <div class="form-group">
              <label>Número de Documento</label>
              <input v-model="filtrosForm.numero_documento" type="text" placeholder="Buscar por documento..."
                class="form-control" />
            </div>
            <div class="form-group">
              <label>Nombre de Usuario</label>
              <input v-model="filtrosForm.nombre_usuario" type="text" placeholder="Buscar por nombre..."
                class="form-control" />
            </div>

            <!-- Filtros de solicitud -->
            <div class="form-group">
              <label>Radicado de Solicitud</label>
              <input v-model="filtrosForm.id" type="text" placeholder="Buscar solicitud..." class="form-control" />
            </div>
            <div class="form-group">
              <label>Fecha desde</label>
              <input v-model="filtrosForm.fecha_desde" type="date" class="form-control" />
            </div>
            <div class="form-group">
              <label>Fecha hasta</label>
              <input v-model="filtrosForm.fecha_hasta" type="date" class="form-control" />
            </div>
            <div class="form-group">
              <label>Límite (máx. 1000)</label>
              <input v-model.number="filtrosForm.limit" type="number" min="1" max="1000" class="form-control" />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="filtrosForm.estado" class="form-control">
                <option value="">Todos</option>
                <option v-for="estado in ESTADOS_DISPONIBLES" :key="estado" :value="estado">
                  {{ estado }}
                </option>
              </select>
            </div>
          </div>

          <div class="filtros-actions"></div>
        </form>
      </div>
    </section>

    <div class="table-section">
      <div class="table-header">
        <h4>Solicitudes ({{ totalItems }})</h4>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando solicitudes...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="solicitudes.length === 0" class="empty-container">
        <p>No se encontraron solicitudes</p>
      </div>

      <div v-else class="table-container p-2">
        <ClientOnly>
          <DataTable class="display solicitudes-table" :data="solicitudes" :columns="columnas"
            :options="datatableOpciones" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo } from '#imports'
import DataTable from 'datatables.net-vue3'
import DataTablesCore from 'datatables.net-dt'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import '~/assets/css/data-table.css';
import type { FiltrosSolicitudes, SolicitudAdmin } from '~/shared/types/admin-solicitudes'
import { ESTADOS_DISPONIBLES } from '~/shared/types/admin-solicitudes'
import { formatCurrency, formatDate } from '~/shared/formatters'
import { useSolicitudesBuscar } from '~/composables/admin/useSolicitudesBuscar'
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

DataTable.use(DataTablesCore)

interface DataTableColumn {
  title: string
  data: string | null
  render?: (data: unknown, type: unknown, row: SolicitudAdmin) => string
}

interface DataTableLanguage {
  info: string
  infoEmpty: string
  lengthMenu: string
  search: string
  paginate: {
    first: string
    last: string
    next: string
    previous: string
  }
  emptyTable: string
}

interface DataTableOptions {
  pageLength: number
  lengthMenu: number[]
  order: [number, 'asc' | 'desc'][]
  language: DataTableLanguage
}

const getDefaultDateFilters = () => {
  const hoy = new Date()
  const fecha_hasta = hoy.toISOString().slice(0, 10)
  const fechaDesdeDate = new Date(hoy)
  fechaDesdeDate.setDate(hoy.getDate() - 5)
  const fecha_desde = fechaDesdeDate.toISOString().slice(0, 10)
  return { fecha_desde, fecha_hasta }
}

// Filtros activos
const { fecha_desde, fecha_hasta } = getDefaultDateFilters()
const filtrosActivos = ref<FiltrosSolicitudes>({
  skip: 0,
  limit: 1000,
  fecha_desde,
  fecha_hasta
})

const {
  loading,
  error,
  solicitudes,
  totalItems,
  tieneFiltrosActivos,
  aplicarFiltros,
  limpiarFiltros
} = useSolicitudesBuscar({
  filtrosActivos
})

const columnas = computed<DataTableColumn[]>(() => [
  {
    title: 'Solicitante',
    data: null,
    render: (_data, _type, row) => {
      const nombre = row.solicitante?.nombres_apellidos || row.payload?.solicitante?.nombres_apellidos || 'N/A'
      const email = row.solicitante?.email || row.payload?.solicitante?.email || 'N/A'
      return `<div class="solicitante-info"><div class="nombre">${nombre}</div><div class="email">${email}</div></div>`
    }
  },
  {
    title: 'Documento',
    data: null,
    render: (_data, _type, row) => {
      return row.solicitante?.numero_identificacion || row.payload?.solicitante?.numero_identificacion || 'N/A'
    }
  },
  {
    title: 'Estado',
    data: null,
    render: (_data, _type, row) => {
      const estado = row.estado || 'Desconocido'
      const estadoClase = estado.toLowerCase().replace(/\s+/g, '-')
      return `<span class="estado-badge estado-${estadoClase}">${estado}</span>`
    }
  },
  {
    title: 'Monto',
    data: null,
    render: (_data, _type, row) => {
      const valor = row.monto_solicitado || row.payload?.solicitud?.valor_solicitado || 0
      return `<span class="monto">$${formatCurrency(valor)}</span>`
    }
  },
  {
    title: 'Plazo',
    data: null,
    render: (_data, _type, row) => {
      const plazo = row.plazo_meses || row.payload?.solicitud?.plazo_meses || 0
      return `<span class="plazo">${plazo} meses</span>`
    }
  },
  {
    title: 'Fecha Creación',
    data: 'created_at',
    render: (data) => {
      const fecha = typeof data === 'string' ? data : new Date().toISOString()
      return `<span class="fecha">${formatDate(fecha)}</span>`
    }
  },
  {
    title: 'Acciones',
    data: null,
    render: (_data, _type, row) => {
      return `<a class="btn btn-sm btn-outline" title="Ver detalles" href="/admin/solicitudes/edit/${row.id}">Ver</a>`
    }
  }
])

const datatableOpciones = computed<DataTableOptions>(() => ({
  pageLength: 20,
  lengthMenu: [10, 20, 50, 100],
  order: [[5, 'desc']],
  language: {
    info: 'Mostrando _START_ a _END_ de _TOTAL_ solicitudes',
    infoEmpty: 'No hay solicitudes para mostrar',
    lengthMenu: 'Mostrar _MENU_ solicitudes',
    search: 'Buscar',
    paginate: {
      first: 'Primero',
      last: 'Último',
      next: 'Siguiente',
      previous: 'Anterior'
    },
    emptyTable: 'No hay datos disponibles'
  }
}))

const filtrosForm = ref({
  numero_documento: '',
  nombre_usuario: '',
  owner_username: '',
  estado: '',
  id: '',
  limit: 1000,
  fecha_desde,
  fecha_hasta
})

const limpiarFiltrosForm = () => {
  const defaults = getDefaultDateFilters()
  filtrosForm.value = {
    numero_documento: '',
    nombre_usuario: '',
    owner_username: '',
    estado: '',
    id: '',
    limit: 1000,
    fecha_desde: defaults.fecha_desde,
    fecha_hasta: defaults.fecha_hasta
  }
}

const aplicarFiltrosForm = () => {
  const limiteSeguro = Math.min(Math.max(filtrosForm.value.limit || 1, 1), 1000)
  const filtrosLimpios: Partial<FiltrosSolicitudes> = {
    ...filtrosForm.value,
    limit: limiteSeguro,
    estados: filtrosForm.value.estado ? [filtrosForm.value.estado] : undefined
  }
  const { estado, ...resto } = filtrosLimpios as Partial<FiltrosSolicitudes> & { estado?: string }
  aplicarFiltros(resto)

}

onMounted(() => {
  const defaults = getDefaultDateFilters()
  Object.assign(filtrosForm.value, {
    ...defaults,
    ...filtrosActivos.value
  })
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>

<style scoped>
/* Los estilos ahora están en assets/css/admin-solicitudes.css */
@import '~/assets/css/admin-solicitudes.css';

.filtros-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.filtros-header h2 {
  font-size: 1.25rem;
  color: #374151;
}

.filtros-content {
  padding: 1rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filtros-actions {
  display: flex;
  gap: 1rem;
}

.filtros-activos-alert {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}
</style>