<template>
  <div class="container mx-auto py-8 px-4 max-w-7xl">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon class="w-8 h-8 text-blue-500" />
            Administración de Convenios
          </h1>
          <p class="text-sm text-gray-500">
            Gestión de empresas con convenios
          </p>
        </div>
        <div class="flex items-center gap-3">
          <Button variant="outline" @click="recargarDatos" :disabled="loading">
            <ArrowPathIcon class="w-4 h-4 mr-2" />
            Recargar
          </Button>
          <NuxtLink to="/admin/convenios/create">
            <Button>
              <PlusIcon class="w-4 h-4 mr-2" />
              Nuevo Convenio
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <FunnelIcon class="w-4 h-4 text-gray-400" />
            Filtrar por Estado
          </label>
          <select 
            v-model="filtros.estado" 
            @change="aplicarFiltros"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
            Buscar por razón social, NIT o representante
          </label>
          <input
            v-model="filtros.busqueda"
            @input="debounceSearch"
            type="text"
            placeholder="Buscar empresa..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <IdentificationIcon class="w-4 h-4 text-gray-400" />
            Filtrar por NIT
          </label>
          <input
            v-model="filtros.nit"
            @input="debounceSearch"
            type="text"
            placeholder="NIT de la empresa..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Total Convenios</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalEmpresas }}</p>
          </div>
          <BuildingOfficeIcon class="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Convenios Activos</p>
            <p class="text-2xl font-bold text-gray-900">{{ conteoEstados.Activo || 0 }}</p>
          </div>
          <CheckIcon class="w-8 h-8 text-green-500" />
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Convenios Inactivos</p>
            <p class="text-2xl font-bold text-gray-900">{{ conteoEstados.Inactivo || 0 }}</p>
          </div>
          <NoSymbolIcon class="w-8 h-8 text-red-500" />
        </div>
      </div>
    </div>

    <!-- Tabla de convenios -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">
            Empresas con Convenios ({{ empresas.length }})
          </h2>
          <div class="flex items-center gap-3">
            <select 
              v-model.number="paginacion.limit" 
              @change="cambiarLimite"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="10">10 por página</option>
              <option :value="20">20 por página</option>
              <option :value="50">50 por página</option>
              <option :value="100">100 por página</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <ArrowPathIcon class="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p class="text-gray-500">Cargando convenios...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
        <NoSymbolIcon class="w-10 h-10 text-red-500 mb-4" />
        <p class="text-red-600 mb-4">{{ error }}</p>
        <Button variant="outline" @click="cargarEmpresas">Reintentar</Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="empresas.length === 0" class="flex flex-col items-center justify-center py-16">
        <BuildingOfficeIcon class="w-10 h-10 text-gray-400 mb-4" />
        <p class="text-gray-500">No se encontraron empresas con convenios</p>
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <IdentificationIcon class="w-4 h-4" />
                  NIT
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <BuildingOfficeIcon class="w-4 h-4" />
                  Razón Social
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <UserCircleIcon class="w-4 h-4" />
                  Representante
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <CheckIcon class="w-4 h-4" />
                  Estado
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4" />
                  Fecha Convenio
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4" />
                  Vencimiento
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="empresa in empresas" :key="empresa.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ empresa.nit }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ empresa.razon_social }}
                </div>
                <div class="text-sm text-gray-500 flex items-center gap-1">
                  <EnvelopeIcon class="w-3 h-3" />
                  {{ empresa.correo }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ empresa.representante_nombre }}
                </div>
                <div class="text-sm text-gray-500 flex items-center gap-1">
                  <IdentificationIcon class="w-3 h-3" />
                  {{ empresa.representante_documento }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="getEstadoVariant(empresa.estado)">
                  {{ getEstadoLabel(empresa.estado) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  {{ formatDate(empresa.fecha_convenio) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  {{ formatDate(empresa.fecha_vencimiento) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink :to="`/admin/convenios/show/${empresa.id}`">
                    <Button variant="ghost" size="sm">
                      <EyeIcon class="w-4 h-4" />
                    </Button>
                  </NuxtLink>
                  <NuxtLink :to="`/admin/convenios/edit/${empresa.id}`">
                    <Button variant="ghost" size="sm">
                      <PencilIcon class="w-4 h-4" />
                    </Button>
                  </NuxtLink>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="toggleEstadoEmpresa(empresa)"
                    :class="empresa.estado === 'Activo' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'"
                  >
                    <NoSymbolIcon v-if="empresa.estado === 'Activo'" class="w-4 h-4" />
                    <CheckIcon v-else class="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="eliminarEmpresa(empresa)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando {{ (paginacion.offset + 1) }} a {{ Math.min(paginacion.offset + empresas.length, totalEmpresas) }} 
            de {{ totalEmpresas }} empresas
          </div>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="paginaAnterior"
              :disabled="paginacion.offset === 0"
            >
              <ChevronLeftIcon class="w-4 h-4" />
              Anterior
            </Button>
            <div class="flex items-center gap-1">
              <Button
                v-for="page in paginasVisibles"
                :key="page"
                :variant="page === paginaActual ? 'default' : 'outline'"
                size="sm"
                @click="irAPagina(page)"
              >
                {{ page }}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="paginaSiguiente"
              :disabled="paginacion.offset + empresas.length >= totalEmpresas"
            >
              Siguiente
              <ChevronRightIcon class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminConvenios } from '~/composables/admin/useAdminConvenios';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlusIcon,
  NoSymbolIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  IdentificationIcon,
  EnvelopeIcon,
  UserCircleIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Usar el composable
const {
  empresas,
  loading,
  error,
  totalEmpresas,
  conteoEstados,
  filtros,
  paginacion,
  paginaActual,
  paginasVisibles,
  debounceSearch,
  cargarEmpresas,
  recargarDatos,
  paginaAnterior,
  paginaSiguiente,
  irAPagina,
  toggleEstadoEmpresa,
  eliminarEmpresa,
  cambiarLimite,
  aplicarFiltros,
  getEstadoLabel,
  getEstadoVariant,
  formatDate,
} = useAdminConvenios();

// Lifecycle
onMounted(() => {
  cargarEmpresas();
});
</script>
