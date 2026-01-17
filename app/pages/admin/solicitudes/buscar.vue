<template>
  <div class="admin-solicitudes">
    <div class="admin-header">
      <div class="flex items-center gap-4">        
        <Button variant="ghost" size="sm" @click="navigateTo('/admin/solicitudes')" class="text-muted-foreground">
          ← Volver a solicitudes
        </Button>
      </div>
    </div>
    <div class="header-content mb-3">
      <h1>Buscar Solicitudes</h1>
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
      <div class="filtros-header">
        <h2>Filtros Avanzados</h2>
      </div>
      <div class="filtros-content">
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FiltrosSolicitudes } from '~/shared/types/admin-solicitudes'
import { ESTADOS_DISPONIBLES } from '~/shared/types/admin-solicitudes'
import { useSolicitudesBuscar } from '~/composables/admin/useSolicitudesBuscar'
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const { 
  loading, 
  filtrosActivos, 
  tieneFiltrosActivos, 
  aplicarFiltros, 
  limpiarFiltros } = useSolicitudesBuscar()

const filtrosForm = ref({
  numero_documento: '',
  nombre_usuario: '',
  owner_username: '',
  estados: [] as string[],
  numero_solicitud: ''
})

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
  const filtrosLimpios: Partial<FiltrosSolicitudes> = { ...filtrosForm.value }
  if (!filtrosLimpios.estados?.length) {
    const { estados, ...resto } = filtrosLimpios
    aplicarFiltros(resto)
  } else {
    aplicarFiltros(filtrosLimpios)
  }

}

onMounted(() => {
  Object.assign(filtrosForm.value, filtrosActivos.value)
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>

<style scoped>
@import '~/assets/css/admin-solicitudes.css';
</style>