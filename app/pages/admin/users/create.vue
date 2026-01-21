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
          <h1 class="text-2xl font-bold text-gray-900">
            Crear Nuevo Usuario
          </h1>
          <p class="text-sm text-gray-500">
            Complete el formulario para registrar un nuevo usuario en el sistema
          </p>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
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
                Contraseña <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.password }"
              />
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <KeyIcon class="w-4 h-4 text-gray-400" />
                Confirmar Contraseña <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.confirmPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.confirmPassword }"
              />
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <ShieldCheckIcon class="w-4 h-4 text-gray-400" />
                Roles <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.roles"
                required
                multiple
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.roles }"
              >
                <option value="">Seleccione roles</option>
                <option value="administrator">Administrador</option>
                <option value="adviser">Asesor</option>
                <option value="user_trabajador">Trabajador</option>
              </select>
              <p v-if="errors.roles" class="mt-1 text-sm text-red-600">{{ errors.roles }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <ShieldCheckIcon class="w-4 h-4 text-gray-400" />
                Estado
              </label>
              <select
                v-model="form.disabled"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="false">Activo</option>
                <option :value="true">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Datos Personales -->
        <div class="pb-6">
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
                v-model="form.tipo_documento"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="PA">Pasaporte</option>
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
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <PhoneIcon class="w-4 h-4 text-gray-400" />
                Teléfono
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.phone }"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
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
            {{ loading ? 'Creando Usuario...' : 'Crear Usuario' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCreateUser } from '~/composables/admin/useCreateUser';
import Button from '@/components/ui/Button.vue';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  IdentificationIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
});

// Usar el composable
const {
  loading,
  errors,
  form,
  validateForm,
  handleSubmit,
  resetForm,
  goBack,
} = useCreateUser();
</script>
