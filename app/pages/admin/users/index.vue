<template>
  <div class="container mx-auto py-8 px-4 max-w-7xl">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon class="w-8 h-8 text-blue-500" />
            Administración de Usuarios
          </h1>
          <p class="text-sm text-gray-500">
            Gestión de usuarios del sistema
          </p>
        </div>
        <div class="flex items-center gap-3">
          <Button variant="outline" @click="recargarDatos" :disabled="loading">
            <ArrowPathIcon class="w-4 h-4 mr-2" />
            Recargar
          </Button>
          <NuxtLink to="/admin/users/create">
            <Button>
              <PlusIcon class="w-4 h-4 mr-2" />
              Nuevo Usuario
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
            Filtrar por Rol
          </label>
          <select 
            v-model="filtros.rol" 
            @change="aplicarFiltros"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
            <option value="trabajador">Trabajador</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
            Buscar por nombre o email
          </label>
          <input
            v-model="filtros.busqueda"
            @input="debounceSearch"
            type="text"
            placeholder="Buscar usuario..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <ShieldCheckIcon class="w-4 h-4 text-gray-400" />
            Estado
          </label>
          <select 
            v-model="filtros.estado" 
            @change="aplicarFiltros"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Total Usuarios</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalUsuarios }}</p>
          </div>
          <UsersIcon class="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Administradores</p>
            <p class="text-2xl font-bold text-gray-900">{{ conteoRoles.admin || 0 }}</p>
          </div>
          <ShieldCheckIcon class="w-8 h-8 text-purple-500" />
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Usuarios Activos</p>
            <p class="text-2xl font-bold text-gray-900">{{ conteoEstados.active || 0 }}</p>
          </div>
          <CheckIcon class="w-8 h-8 text-green-500" />
        </div>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Usuarios Inactivos</p>
            <p class="text-2xl font-bold text-gray-900">{{ conteoEstados.inactive || 0 }}</p>
          </div>
          <NoSymbolIcon class="w-8 h-8 text-red-500" />
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">
            Usuarios ({{ usuarios.length }})
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
        <p class="text-gray-500">Cargando usuarios...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
        <NoSymbolIcon class="w-10 h-10 text-red-500 mb-4" />
        <p class="text-red-600 mb-4">{{ error }}</p>
        <Button variant="outline" @click="cargarUsuarios">Reintentar</Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="usuarios.length === 0" class="flex flex-col items-center justify-center py-16">
        <UsersIcon class="w-10 h-10 text-gray-400 mb-4" />
        <p class="text-gray-500">No se encontraron usuarios</p>
      </div>

      <!-- Tabla -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <UserCircleIcon class="w-4 h-4" />
                  Usuario
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <EnvelopeIcon class="w-4 h-4" />
                  Email
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <ShieldCheckIcon class="w-4 h-4" />
                  Rol
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
                  <ClockIcon class="w-4 h-4" />
                  Último Acceso
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4" />
                  Fecha Creación
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserCircleIcon class="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ usuario.nombre }} {{ usuario.apellido }}
                    </div>
                    <div class="text-sm text-gray-500 flex items-center gap-1">
                      <IdentificationIcon class="w-3 h-3" />
                      {{ usuario.tipo_identificacion }} {{ usuario.numero_identificacion }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 flex items-center gap-1">
                  <EnvelopeIcon class="w-4 h-4 text-gray-400" />
                  {{ usuario.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="getRolVariant(usuario.rol)">
                  {{ getRolLabel(usuario.rol) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="getEstadoVariant(usuario.estado)">
                  {{ getEstadoLabel(usuario.estado) }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center gap-1">
                  <ClockIcon class="w-4 h-4 text-gray-400" />
                  {{ formatDate(usuario.ultimo_acceso) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center gap-1">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  {{ formatDate(usuario.fecha_creacion) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink :to="`/admin/users/show/${usuario.id}`">
                    <Button variant="ghost" size="sm">
                      <EyeIcon class="w-4 h-4" />
                    </Button>
                  </NuxtLink>
                  <NuxtLink :to="`/admin/users/edit/${usuario.id}`">
                    <Button variant="ghost" size="sm">
                      <PencilIcon class="w-4 h-4" />
                    </Button>
                  </NuxtLink>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="toggleEstadoUsuario(usuario)"
                    :class="usuario.estado === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'"
                  >
                    <NoSymbolIcon v-if="usuario.estado === 'active'" class="w-4 h-4" />
                    <CheckIcon v-else class="w-4 h-4" />
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
            Mostrando {{ (paginacion.offset + 1) }} a {{ Math.min(paginacion.offset + usuarios.length, totalUsuarios) }} 
            de {{ totalUsuarios }} usuarios
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
              :disabled="paginacion.offset + usuarios.length >= totalUsuarios"
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
import { useAdminUsers } from '~/composables/admin/useAdminUsers';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlusIcon,
  NoSymbolIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  EnvelopeIcon,
  IdentificationIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Usar el composable
const {
  usuarios,
  loading,
  error,
  totalUsuarios,
  conteoRoles,
  conteoEstados,
  filtros,
  paginacion,
  paginaActual,
  totalPaginas,
  paginasVisibles,
  debounceSearch,
  cargarUsuarios,
  recargarDatos,
  paginaAnterior,
  paginaSiguiente,
  irAPagina,
  toggleEstadoUsuario,
  cambiarLimite,
  aplicarFiltros,
  limpiarFiltros,
  buscarConDebounce,
  getRolLabel,
  getRolVariant,
  getEstadoLabel,
  getEstadoVariant,
  formatDate,
} = useAdminUsers();

// Lifecycle
onMounted(() => {
  cargarUsuarios();
});
</script>
