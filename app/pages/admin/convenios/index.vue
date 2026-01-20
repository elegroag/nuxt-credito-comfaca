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
          <Button variant="outline" @click="abrirModalImportar" :disabled="loading">
            <DocumentArrowUpIcon class="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
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

    <!-- Modal de Importación -->
    <div v-if="mostrarModalImportar" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Importar Empresas desde Excel</h3>
          <Button variant="ghost" size="sm" @click="cerrarModalImportar">
            <XMarkIcon class="w-5 h-5" />
          </Button>
        </div>

        <div v-if="!resultadoImportacion" class="space-y-4">
          <div class="text-sm text-gray-600">
            <p class="mb-2">Selecciona un archivo Excel (.xlsx o .xls) con las siguientes columnas:</p>
            <div class="bg-gray-50 p-3 rounded text-xs">
              <p><strong>Columnas requeridas:</strong></p>
              <ul class="list-disc list-inside mt-1 space-y-1">
                <li>NIT</li>
                <li>Razón Social</li>
                <li>Representante Documento</li>
                <li>Representante Nombre</li>
              </ul>
              <p class="mt-2"><strong>Columnas opcionales:</strong></p>
              <ul class="list-disc list-inside mt-1 space-y-1">
                <li>Teléfono</li>
                <li>Correo</li>
                <li>Fecha Vencimiento</li>
                <li>Estado</li>
              </ul>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Archivo Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              @change="manejarArchivoSeleccionado"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div v-if="archivoImportar" class="text-sm text-gray-600">
            <p>Archivo seleccionado: <strong>{{ archivoImportar.name }}</strong></p>
            <p>Tamaño: {{ Number((archivoImportar.size / 1024).toFixed(2)) }} KB</p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <Button variant="outline" @click="cerrarModalImportar" :disabled="importando">
              Cancelar
            </Button>
            <Button 
              @click="importarExcel" 
              :disabled="!archivoImportar || importando"
            >
              <span v-if="importando" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importando...
              </span>
              <span v-else>Importar</span>
            </Button>
          </div>
        </div>

        <!-- Resultado de la importación -->
        <div v-else class="space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <CheckCircleIcon class="w-5 h-5 text-green-400 mr-2" />
              <h4 class="text-sm font-medium text-green-800">Importación completada</h4>
            </div>
            <div class="mt-2 text-sm text-green-700">
              <p>{{ resultadoImportacion.message }}</p>
              <div class="mt-2 space-y-1">
                <p>• Total filas: {{ resultadoImportacion.data.total_filas }}</p>
                <p>• Procesadas: {{ resultadoImportacion.data.procesadas }}</p>
                <p>• Creadas: {{ resultadoImportacion.data.creadas }}</p>
                <p>• Actualizadas: {{ resultadoImportacion.data.actualizadas }}</p>
                <p v-if="resultadoImportacion.data.errores.length > 0">
                  • Errores: {{ resultadoImportacion.data.errores.length }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="resultadoImportacion.data.errores.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 class="text-sm font-medium text-yellow-800 mb-2">Errores encontrados:</h4>
            <div class="max-h-32 overflow-y-auto">
              <div v-for="error in resultadoImportacion.data.errores.slice(0, 5)" :key="error.fila" class="text-sm text-yellow-700">
                <p>Fila {{ error.fila }}: {{ error.error }}</p>
              </div>
              <p v-if="resultadoImportacion.data.errores.length > 5" class="text-sm text-yellow-600">
                ... y {{ resultadoImportacion.data.errores.length - 5 }} errores más
              </p>
            </div>
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
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Estado para la modal de importación
const mostrarModalImportar = ref(false);
const archivoImportar = ref<File | null>(null);
const importando = ref(false);
const resultadoImportacion = ref<any>(null);

// Funciones para la modal de importación
const abrirModalImportar = () => {
  mostrarModalImportar.value = true;
  archivoImportar.value = null;
  resultadoImportacion.value = null;
};

const cerrarModalImportar = () => {
  mostrarModalImportar.value = false;
  archivoImportar.value = null;
  resultadoImportacion.value = null;
};

const manejarArchivoSeleccionado = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // Validar que sea un archivo Excel
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      alert('Por favor, selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }
    
    archivoImportar.value = file;
  }
};

const importarExcel = async () => {
  if (!archivoImportar.value) {
    alert('Por favor, selecciona un archivo');
    return;
  }

  try {
    importando.value = true;
    
    const formData = new FormData();
    formData.append('file', archivoImportar.value);
    
    const response = await $fetch('/api/admin/empresas-convenios/import', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    resultadoImportacion.value = response;
    
    // Recargar la lista de empresas
    await recargarDatos();
    
    // Cerrar modal después de 2 segundos
    setTimeout(() => {
      cerrarModalImportar();
    }, 2000);
    
  } catch (error: any) {
    console.error('Error al importar:', error);
    alert(`Error al importar: ${error.data?.message || 'Error desconocido'}`);
  } finally {
    importando.value = false;
  }
};

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
