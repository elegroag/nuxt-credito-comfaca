<template>
  <div class="container mx-auto py-8 px-4 max-w-4xl">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <Button variant="outline" @click="goBack()">
          <Icon name="lucide:chevron-left" class="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PencilIcon class="w-8 h-8 text-blue-500" />
            Editar Usuario
          </h1>
          <p class="text-sm text-gray-500">
            Modificar información del usuario {{ usuario?.nombre }} {{ usuario?.apellido }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16">
      <ArrowPathIcon class="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p class="text-gray-500">Cargando información del usuario...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
      <NoSymbolIcon class="w-10 h-10 text-red-500 mb-4" />
      <p class="text-red-600 mb-4">{{ error }}</p>
      <Button variant="outline" @click="cargarUsuario">Reintentar</Button>
    </div>

    <!-- Formulario -->
    <div v-else-if="usuario" class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Información Básica -->
        <div class="border-b border-gray-200 pb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon class="w-5 h-5 text-blue-500" />
            Información Básica
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <UserCircleIcon class="w-4 h-4 text-gray-400" />
                Nombre de Usuario <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.username }"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <EnvelopeIcon class="w-4 h-4 text-gray-400" />
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <KeyIcon class="w-4 h-4 text-gray-400" />
                Nueva Contraseña
              </label>
              <input
                v-model="form.password"
                type="password"
                placeholder="Dejar vacío para no cambiar"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.password }"
              />
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <KeyIcon class="w-4 h-4 text-gray-400" />
                Confirmar Contraseña
              </label>
              <input
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirmar nueva contraseña"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.confirmPassword }"
              />
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <ShieldCheckIcon class="w-4 h-4 text-gray-400" />
                Rol <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.rol"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.rol }"
              >
                <option value="">Seleccione un rol</option>
                <option value="user">Usuario</option>
                <option value="trabajador">Trabajador</option>
                <option value="empresa">Empresa</option>
                <option value="admin">Administrador</option>
              </select>
              <p v-if="errors.rol" class="mt-1 text-sm text-red-600">{{ errors.rol }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <ShieldCheckIcon class="w-4 h-4 text-gray-400" />
                Estado <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.estado"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.estado }"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
              <p v-if="errors.estado" class="mt-1 text-sm text-red-600">{{ errors.estado }}</p>
            </div>
          </div>
        </div>

        <!-- Datos Personales -->
        <div class="border-b border-gray-200 pb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCircleIcon class="w-5 h-5 text-green-500" />
            Datos Personales
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <UserIcon class="w-4 h-4 text-gray-400" />
                Nombres <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.nombre"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.nombre }"
              />
              <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <UserIcon class="w-4 h-4 text-gray-400" />
                Apellidos <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.apellido"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.apellido }"
              />
              <p v-if="errors.apellido" class="mt-1 text-sm text-red-600">{{ errors.apellido }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <IdentificationIcon class="w-4 h-4 text-gray-400" />
                Tipo de Documento
              </label>
              <select
                v-model="form.tipo_identificacion"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione tipo</option>
                <option value="1">Cédula de Ciudadanía</option>
                <option value="2">Cédula de Extranjería</option>
                <option value="3">Tarjeta de Identidad</option>
                <option value="4">Pasaporte</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <IdentificationIcon class="w-4 h-4 text-gray-400" />
                Número de Documento
              </label>
              <input
                v-model="form.numero_documento"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.numero_documento }"
              />
              <p v-if="errors.numero_documento" class="mt-1 text-sm text-red-600">{{ errors.numero_documento }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <PhoneIcon class="w-4 h-4 text-gray-400" />
                Teléfono
              </label>
              <input
                v-model="form.telefono"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.telefono }"
              />
              <p v-if="errors.telefono" class="mt-1 text-sm text-red-600">{{ errors.telefono }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <ShieldCheckIcon class="w-4 h-4 text-gray-400" />
                Código Categoría
              </label>
              <input
                v-model="form.codigo_categoria"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Datos Empresa -->
        <div class="border-b border-gray-200 pb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BuildingOfficeIcon class="w-5 h-5 text-purple-500" />
            Datos Empresa
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <BuildingOffice2Icon class="w-4 h-4 text-gray-400" />
                NIT Empresa
              </label>
              <input
                v-model="form.empresa_nit"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <BuildingOffice2Icon class="w-4 h-4 text-gray-400" />
                Razón Social Empresa
              </label>
              <input
                v-model="form.empresa_razon_social"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Dirección -->
        <div class="pb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HomeIcon class="w-5 h-5 text-orange-500" />
            Dirección de Residencia
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <MapPinIcon class="w-4 h-4 text-gray-400" />
                Dirección
              </label>
              <input
                v-model="form.direccion"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <MapPinIcon class="w-4 h-4 text-gray-400" />
                Ciudad
              </label>
              <input
                v-model="form.ciudad"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <MapPinIcon class="w-4 h-4 text-gray-400" />
                Barrio
              </label>
              <input
                v-model="form.barrio"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <HomeIcon class="w-4 h-4 text-gray-400" />
                Tipo de Vivienda
              </label>
              <select
                v-model="form.tipo_vivienda"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione tipo</option>
                <option value="propia">Propia</option>
                <option value="arrendada">Arrendada</option>
                <option value="familiar">Casa de familiar</option>
                <option value="otra">Otra</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <UserGroupIcon class="w-4 h-4 text-gray-400" />
                Personas a Cargo
              </label>
              <input
                v-model.number="form.personas_a_cargo"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            @click="goBack()"
            :disabled="loading"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :disabled="loading"
          >
            <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            {{ loading ? 'Guardando Cambios...' : 'Guardar Cambios' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditUser } from '~/composables/admin/useEditUser';
import Button from '@/components/ui/Button.vue';
import {
  PencilIcon,
  UserIcon,
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  HomeIcon,
  MapPinIcon,
  UserGroupIcon,
  ArrowPathIcon,
  NoSymbolIcon,
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Usar el composable
const {
  loading,
  error,
  usuario,
  errors,
  form,
  cargarUsuario,
  validateForm,
  handleSubmit,
  resetForm,
  goBack,
} = useEditUser();
</script>
