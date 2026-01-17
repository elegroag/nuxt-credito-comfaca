<template>
  <div class="admin-solicitudes">
    <!-- Header -->
    <div class="admin-header">
      <div class="header-content">
        <h1>Administración de Solicitudes</h1>
        <div class="header-actions">
          <button @click="abrirFiltrosModal" class="btn btn-secondary" :disabled="loading">
            <FunnelIcon class="h-5 w-5 mr-2" />
            Filtros Avanzados
          </button>
          <button @click="exportarCSV" class="btn btn-secondary" :disabled="loading">
            <ArrowDownTrayIcon class="h-5 w-5 mr-2" />
            Exportar CSV
          </button>
          <button @click="recargarDatos" class="btn btn-primary" :disabled="loading">
            <ArrowPathIcon class="h-5 w-5 mr-2" />
            Recargar
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen por estados -->
    <div class="estados-summary">
      <div class="estados-header">
        <h2>Resumen por Estados</h2>
        <div class="total-general">
          <span class="total-label">Total:</span>
          <span class="total-count">{{ getTotalSolicitudes }}</span>
        </div>
      </div>
      <div v-if="Object.keys(estadosCount).length > 0" class="estados-grid">
        <div 
          v-for="(count, estado) in estadosCount" 
          :key="estado" 
          class="estado-card"
          @click="filtrarPorEstado(estado)"
          :class="{ 'clickable': true }"
          :title="`Hacer clic para filtrar solicitudes en estado: ${estado}`"
        >
          <div class="estado-count">{{ count }}</div>
          <div class="estado-name">{{ estado }}</div>
          <div class="estado-percentage">
            {{ getEstadoPercentage(count) }}%
          </div>
        </div>
      </div>
      <div v-else class="estados-empty">
        <ChartBarIcon class="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p>No hay datos de estados disponibles</p>
      </div>
    </div>

    <!-- Modal de Filtros Avanzados -->
    <div v-if="showFiltrosModal" class="modal-overlay" @click="cerrarFiltrosModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Filtros Avanzados</h2>
          <button @click="cerrarFiltrosModal" class="btn btn-outline">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="aplicarFiltrosForm" class="filtros-form">
            <div class="filtros-grid">
              <!-- Filtros de usuario -->
              <div class="form-group">
                <label>Número de Documento</label>
                <input
                  v-model="filtrosForm.numero_documento"
                  type="text"
                  placeholder="Buscar por documento..."
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label>Nombre de Usuario</label>
                <input
                  v-model="filtrosForm.nombre_usuario"
                  type="text"
                  placeholder="Buscar por nombre..."
                  class="form-control"
                />
              </div>

              <!-- Filtros de solicitud -->
              <div class="form-group">
                <label>Número de Solicitud</label>
                <input
                  v-model="filtrosForm.numero_solicitud"
                  type="text"
                  placeholder="Buscar solicitud..."
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label>Estados</label>
                <select v-model="filtrosForm.estados" multiple class="form-control">
                  <option v-for="estado in ESTADOS_DISPONIBLES" :key="estado" :value="estado">
                    {{ estado }}
                  </option>
                </select>
              </div>
            </div>

            <div class="filtros-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <MagnifyingGlassIcon class="h-5 w-5 mr-2" />
                Aplicar Filtros
              </button>
              <button type="button" @click="limpiarFiltrosForm" class="btn btn-outline">
                <XMarkIcon class="h-5 w-5 mr-2" />
                Limpiar Filtros
              </button>
            </div>
          </form>
        </div>
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

    <!-- Tabla de solicitudes -->
    <div class="table-section">
      <div class="table-header">
        <h2>Solicitudes ({{ totalItems }})</h2>
        <div class="table-actions">
          <select v-model.number="filtrosActivos.limit" @change="cambiarLimite(filtrosActivos.limit || 20)" class="form-select">
            <option :value="10">10 por página</option>
            <option :value="20">20 por página</option>
            <option :value="50">50 por página</option>
            <option :value="100">100 por página</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando solicitudes...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <ExclamationTriangleIcon class="h-8 w-8 text-red-500 mx-auto mb-2" />
        {{ error }}
      </div>

      <div v-else-if="solicitudes.length === 0" class="empty-container">
        <InboxIcon class="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p>No se encontraron solicitudes</p>
      </div>

      <div v-else class="table-container">
        <table class="solicitudes-table">
          <thead>
            <tr>
              <th>Número Solicitud</th>
              <th>Usuario</th>
              <th>Solicitante</th>
              <th>Documento</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Plazo</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="solicitud in solicitudes" :key="solicitud.id">
              <td>
                <span class="solicitud-number">{{ solicitud.numero_solicitud || solicitud.payload?.solicitud?.numero_solicitud || 'N/A' }}</span>
              </td>
              <td>
                <span class="username">{{ solicitud.owner_username }}</span>
              </td>
              <td>
                <div class="solicitante-info">
                  <div class="nombre">{{ solicitud.solicitante?.nombres_apellidos || solicitud.payload?.solicitante?.nombres_apellidos || 'N/A' }}</div>
                  <div class="email">{{ solicitud.solicitante?.email || solicitud.payload?.solicitante?.email || 'N/A' }}</div>
                </div>
              </td>
              <td>
                <span class="documento">{{ solicitud.solicitante?.numero_identificacion || solicitud.payload?.solicitante?.numero_identificacion || 'N/A' }}</span>
              </td>
              <td>
                <span :class="`estado-badge estado-${(solicitud.estado || 'desconocido').toLowerCase().replace(/\s+/g, '-')}`">
                  {{ solicitud.estado || 'Desconocido' }}
                </span>
              </td>
              <td>
                <span class="monto">${{ formatCurrency((solicitud as any).monto_solicitado || (solicitud as any).payload?.solicitud?.valor_solicitado || (solicitud as any).payload?.solicitud?.monto_solicitado || 0) }}</span>
              </td>
              <td>
                <span class="plazo">{{ (solicitud as any).plazo_meses || solicitud.payload?.solicitud?.plazo_meses || 0 }} meses</span>
              </td>
              <td>
                <span class="fecha">{{ formatDate(solicitud.created_at || new Date().toISOString()) }}</span>
              </td>
              <td>
                <div class="acciones">
                  <button @click="verDetalles(solicitud.id)" class="btn btn-sm btn-outline" title="Ver detalles">
                    <EyeIcon class="h-4 w-4" />
                  </button>
                  <button @click="cambiarEstado(solicitud)" class="btn btn-sm btn-outline" title="Cambiar estado">
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button @click="eliminarSolicitudConfirm(solicitud)" class="btn btn-sm btn-outline text-red-500" title="Eliminar">
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="pagination">
          <button
            @click="cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual === 1"
            class="btn btn-outline"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          
          <span class="pagination-info">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>
          
          <button
            @click="cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual === totalPaginas"
            class="btn btn-outline"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de cambio de estado -->
    <div v-if="showEstadoModal" class="modal-overlay" @click="cerrarEstadoModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Cambiar Estado de Solicitud</h3>
          <button @click="cerrarEstadoModal" class="btn btn-outline">
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Solicitud</label>
            <input
                :value="solicitudSeleccionada?.numero_solicitud || solicitudSeleccionada?.payload?.solicitud?.numero_solicitud || 'N/A'"
                type="text"
                readonly
                class="form-control"
              />
          </div>
          <div class="form-group">
            <label>Nuevo Estado</label>
            <select v-model="nuevoEstado" class="form-control">
              <option v-for="estado in ESTADOS_DISPONIBLES" :key="estado" :value="estado">
                {{ estado }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Descripción (opcional)</label>
            <textarea
              v-model="estadoDescripcion"
              rows="3"
              placeholder="Describe el motivo del cambio..."
              class="form-control"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarEstadoModal" class="btn btn-outline">
            Cancelar
          </button>
          <button @click="confirmarCambioEstado" class="btn btn-primary" :disabled="!nuevoEstado || loadingEstado">
            {{ loadingEstado ? 'Actualizando...' : 'Actualizar Estado' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FiltrosSolicitudes, SolicitudAdmin } from '~/shared/types/admin-solicitudes'
import { ESTADOS_DISPONIBLES, OPCIONES_ORDENAMIENTO } from '~/shared/types/admin-solicitudes'
import { useAdminSolicitudes } from '~/composables/admin/useAdminSolicitudes'
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

// Composable de administración
const {
  solicitudes,
  loading,
  error,
  totalItems,
  filtrosActivos,
  estadosCount,
  tieneFiltrosActivos,
  totalPaginas,
  paginaActual,
  cargarSolicitudes,
  cargarEstadosCount,
  aplicarFiltros,
  limpiarFiltros,
  cambiarPagina,
  cambiarLimite,
  actualizarEstado,
  obtenerSolicitud,
  eliminarSolicitud,
  exportarCSV
} = useAdminSolicitudes()

// Estado local
const showFiltrosModal = ref(false)
const showEstadoModal = ref(false)
const solicitudSeleccionada = ref<SolicitudAdmin | null>(null)
const nuevoEstado = ref('')
const estadoDescripcion = ref('')
const loadingEstado = ref(false)

// Formulario de filtros
const filtrosForm = ref({
  numero_documento: '',
  nombre_usuario: '',
  owner_username: '',
  estados: [] as string[],
  numero_solicitud: ''
})

// Métodos
const abrirFiltrosModal = () => {
  showFiltrosModal.value = true
}

const cerrarFiltrosModal = () => {
  showFiltrosModal.value = false
}

const limpiarFiltrosForm = () => {
  filtrosForm.value = {
    numero_documento: '',
    nombre_usuario: '',
    owner_username: '',
    estados: [] as string[],
    numero_solicitud: ''
  }
}

const aplicarFiltrosForm = () => {
  // Limpiar arrays vacíos
  const filtrosLimpios: Partial<FiltrosSolicitudes> = { ...filtrosForm.value }
  if (!filtrosLimpios.estados?.length) {
    const { estados, ...resto } = filtrosLimpios
    aplicarFiltros(resto)
  } else {
    aplicarFiltros(filtrosLimpios)
  }
  
  cerrarFiltrosModal() // Cerrar modal después de aplicar filtros
}

const recargarDatos = () => {
  cargarSolicitudes()
  cargarEstadosCount()
}

const verDetalles = async (solicitudId: string) => {
  try {
    const solicitud = await obtenerSolicitud(solicitudId)
    // Aquí podrías abrir un modal con los detalles completos
    console.log('Ver detalles:', solicitud)
  } catch (err) {
    console.error('Error obteniendo detalles:', err)
  }
}

const cambiarEstado = (solicitud: SolicitudAdmin | any) => {
  solicitudSeleccionada.value = solicitud
  nuevoEstado.value = solicitud.estado
  estadoDescripcion.value = ''
  showEstadoModal.value = true
}

const cerrarEstadoModal = () => {
  showEstadoModal.value = false
  solicitudSeleccionada.value = null
  nuevoEstado.value = ''
  estadoDescripcion.value = ''
}

const confirmarCambioEstado = async () => {
  if (!solicitudSeleccionada.value || !nuevoEstado.value) return
  
  loadingEstado.value = true
  
  try {
    await actualizarEstado(
      solicitudSeleccionada.value.id,
      nuevoEstado.value,
      estadoDescripcion.value || undefined
    )
    
    cerrarEstadoModal()
  } catch (err) {
    console.error('Error cambiando estado:', err)
  } finally {
    loadingEstado.value = false
  }
}

const eliminarSolicitudConfirm = (solicitud: SolicitudAdmin | any) => {
  if (confirm(`¿Estás seguro de eliminar la solicitud ${solicitud.numero_solicitud || solicitud.payload?.solicitud?.numero_solicitud || solicitud.id}?`)) {
    eliminarSolicitud(solicitud.id)
  }
}

// Utilidades
const formatCurrency = (value: number): string => {
  return value.toLocaleString('es-CO')
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO')
}

// Funciones para el resumen por estados
const getTotalSolicitudes = computed(() => {
  return Object.values(estadosCount.value).reduce((total, count) => total + count, 0)
})

const getEstadoPercentage = (count: number): string => {
  const total = getTotalSolicitudes.value
  if (total === 0) return '0'
  return ((count / total) * 100).toFixed(1)
}

const filtrarPorEstado = (estado: string) => {
  // Aplicar filtro por estado específico
  aplicarFiltros({
    estados: [estado],
    skip: 0 // Reiniciar paginación
  })
  
  // Opcional: mostrar notificación o scroll a la tabla
  // Los filtros ahora están en modal, no se necesita mostrar
}

// Cargar datos iniciales
onMounted(() => {
  // Sincronizar filtros form con filtros activos
  Object.assign(filtrosForm.value, filtrosActivos.value)
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>

<style scoped>
/* Los estilos ahora están en assets/css/admin-solicitudes.css */
@import '~/assets/css/admin-solicitudes.css';
</style>
