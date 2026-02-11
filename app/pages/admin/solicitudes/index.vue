<template>
  <div class="admin-solicitudes">
    <!-- Header -->
    <div class="admin-header">
      <div class="header-content">
        <h1>Administración de Solicitudes</h1>
        <div class="header-actions">
          <NuxtLink to="/admin/solicitudes/buscar" class="btn btn-secondary">
            <FunnelIcon class="h-5 w-5 mr-2" />
            Buscar
          </NuxtLink>
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
      <div v-if="loadingEstados" class="estados-loading">
        <div class="loading-spinner"></div>
        <p>Cargando estados...</p>
      </div>
      <div v-else-if="Object.keys(estadosCount).length > 0" class="estados-grid">
        <div v-for="(count, estado) in estadosCount" :key="estado" class="estado-card clickable"
          @click="filtrarPorEstado(estado)" :title="`Hacer clic para filtrar solicitudes en estado: ${estado}`">
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

    <!-- Tabla de solicitudes -->
    <div class="table-section">
      <div class="table-header">
        <h2>Solicitudes ({{ totalItems }})</h2>
        <div class="table-actions">
          <button v-if="filtrosActivos.estados?.length" @click="limpiarFiltroEstado" class="btn btn-outline"
            :disabled="loading" title="Quitar filtro por estado">
            Quitar filtro de estado
          </button>
          <select :value="filtrosActivos.limit"
            @change="cambiarLimite(Number(($event.target as HTMLSelectElement).value))" class="form-select">
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
            <tr v-for="solicitud in solicitudes" :key="solicitud.numero_solicitud">
              <td>
                <div class="solicitante-info">
                  <div class="nombre">{{ solicitud.solicitante?.nombres + ' ' + solicitud.solicitante?.apellidos ||
                    'N/A' }}</div>
                  <div class="email">{{ solicitud.solicitante?.email || solicitud.solicitante?.email || 'N/A' }}</div>
                </div>
              </td>
              <td>
                <span class="documento">{{ solicitud.solicitante?.numero_documento || 'N/A' }}</span>
              </td>
              <td>
                <span
                  :class="`estado-badge estado-${(solicitud.estado || 'desconocido').toLowerCase().replace(/\s+/g, '-')}`">
                  {{ solicitud.estado || 'Desconocido' }}
                </span>
              </td>
              <td>
                <span class="monto">${{ formatCurrency(solicitud?.valor_solicitud || 0) }}</span>
              </td>
              <td>
                <span class="plazo">{{ solicitud?.plazo_meses || 0 }} meses</span>
              </td>
              <td>
                <span class="fecha">{{ formatDate(solicitud.created_at || new Date().toISOString()) }}</span>
              </td>
              <td>
                <div class="acciones">
                  <NuxtLink :to="`/admin/solicitudes/show/${solicitud.numero_solicitud}`" class="btn btn-sm btn-outline"
                    title="Ver detalles">
                    <EyeIcon class="h-4 w-4" />
                  </NuxtLink>
                  <button @click="cambiarEstado(solicitud)" class="btn btn-sm btn-outline" title="Cambiar estado">
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button @click="eliminarSolicitudConfirm(solicitud)" class="btn btn-sm btn-outline text-red-500"
                    title="Eliminar">
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="pagination">
          <button @click="cambiarPagina(paginaActual - 1)" :disabled="!tienePaginaAnterior" class="btn btn-outline">
            <ChevronLeftIcon class="h-5 w-5" />
          </button>

          <span class="pagination-info">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>

          <button @click="cambiarPagina(paginaActual + 1)" :disabled="!tieneSiguientePagina" class="btn btn-outline">
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
            <input :value="solicitudSeleccionada?.numero_solicitud || 'N/A'" type="text" readonly
              class="form-control" />
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
            <textarea v-model="estadoDescripcion" rows="3" placeholder="Describe el motivo del cambio..."
              class="form-control"></textarea>
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
import type { SolicitudAdmin } from '~/shared/types/admin-solicitudes'
import { ESTADOS_DISPONIBLES } from '~/shared/types/admin-solicitudes'
import { formatCurrency, formatDate } from '~/shared/formatters'
import { useAdminSolicitudes } from '~/composables/admin/useAdminSolicitudes'
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  XMarkIcon,
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
  loadingEstados,
  totalPaginas,
  paginaActual,
  tieneSiguientePagina,
  tienePaginaAnterior,
  showEstadoModal,
  solicitudSeleccionada,
  nuevoEstado,
  estadoDescripcion,
  loadingEstado,
  getTotalSolicitudes,
  getEstadoPercentage,
  cambiarPagina,
  cambiarLimite,
  exportarCSV,
  recargarDatos,
  cambiarEstado,
  cerrarEstadoModal,
  confirmarCambioEstado,
  eliminarSolicitudConfirm,
  filtrarPorEstado,
  limpiarFiltroEstado
} = useAdminSolicitudes()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>

<style scoped>
@import '~/assets/css/admin-solicitudes.css';
</style>
