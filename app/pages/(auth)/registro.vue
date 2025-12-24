<template>
  <div class="flex min-h-full flex-col justify-center py-3 sm:px-6 lg:px-2">
    <div class="sm:mx-auto sm:w-full sm:max-w-4xl">
      <h4 class="mt-0 text-center text-2xl font-bold tracking-tight text-gray-900">
        Crear una cuenta
      </h4>
      
      <!-- Indicadores de paso -->
      <div class="mt-6 flex justify-center">
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', 
              pasoActual >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600']">
              1
            </div>
            <span class="ml-2 text-sm text-gray-600">Identificación</span>
          </div>
          <div class="w-8 h-0.5 bg-gray-300"></div>
          <div class="flex items-center">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', 
              pasoActual >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600']">
              2
            </div>
            <span class="ml-2 text-sm text-gray-600">Contacto</span>
          </div>
          <div class="w-8 h-0.5 bg-gray-300"></div>
          <div class="flex items-center">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', 
              pasoActual >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600']">
              3
            </div>
            <span class="ml-2 text-sm text-gray-600">Seguridad</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Mensaje de error -->
          <div v-if="error" class="rounded-md bg-red-50 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Paso 1: Identificación -->
          <div v-if="pasoActual === 1" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Tipo de documento -->
              <div>
                <label for="tipo_documento" class="block text-sm font-medium text-gray-700">
                  Tipo de documento
                </label>
                <select
                  id="tipo_documento"
                  v-model="formData.tipo_documento"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="" disabled selected>Seleccione su tipo de documento</option>
                  <option v-for="tipo in tiposDocumento" :key="tipo.value" :value="tipo.value">
                    {{ tipo.label }}
                  </option>
                </select>
              </div>

              <!-- Número de documento -->
              <div>
                <label for="numero_documento" class="block text-sm font-medium text-gray-700">
                  Número de documento
                </label>
                <input
                  id="numero_documento"
                  v-model="formData.numero_documento"
                  type="text"
                  required
                  placeholder="Ej: 1234567890"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <!-- Nombres -->
              <div>
                <label for="nombres" class="block text-sm font-medium text-gray-700">
                  Nombres
                </label>
                <input
                  id="nombres"
                  v-model="formData.nombres"
                  type="text"
                  required
                  placeholder="Ej: Juan Carlos"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <!-- Apellidos -->
              <div>
                <label for="apellidos" class="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  v-model="formData.apellidos"
                  type="text"
                  required
                  placeholder="Ej: Pérez Gómez"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Paso 2: Contacto -->
          <div v-if="pasoActual === 2" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  placeholder="Ej: usuario@ejemplo.com"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <!-- Teléfono -->
              <div>
                <label for="telefono" class="block text-sm font-medium text-gray-700">
                  Teléfono celular
                </label>
                <input
                  id="telefono"
                  v-model="formData.telefono"
                  type="tel"
                  required
                  placeholder="Ej: 3001234567"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Paso 3: Seguridad -->
          <div v-if="pasoActual === 3" class="space-y-6">
            <!-- Username -->
            <div class="space-y-2">
              <label for="username" class="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <div class="flex items-center space-x-4">
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  required
                  placeholder="Ej: pepe123"
                  class="block w-1/3 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                <p class="text-sm text-gray-500">
                  Este será tu nombre de usuario para iniciar sesión
                </p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Contraseña -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Mínimo 8 caracteres"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <!-- Confirmar contraseña -->
              <div>
                <label for="confirmar_password" class="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmar_password"
                  v-model="formData.confirmar_password"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Repita su contraseña"
                  class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="pt-4 flex justify-between">
            <button
              v-if="pasoActual > 1"
              type="button"
              @click="pasoAnterior"
              class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Anterior
            </button>
            
            <div v-if="pasoActual === 1" class="ml-auto">
              <button
                type="button"
                @click="pasoSiguiente"
                :disabled="!validarPaso1"
                class="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            
            <div v-if="pasoActual === 2" class="ml-auto">
              <button
                type="button"
                @click="pasoSiguiente"
                :disabled="!validarPaso2"
                class="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            
            <div v-if="pasoActual === 3" class="ml-auto">
              <button
                type="submit"
                :disabled="loading || !validarPaso3"
                class="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <span v-if="loading">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
                <span v-else>Crear cuenta</span>
              </button>
            </div>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-2 text-gray-500">
                ¿Ya tienes una cuenta?
              </span>
            </div>
          </div>

          <div class="mt-6 flex justify-center">
            <div class="mt-4 text-center text-xs text-zinc-500">
              <NuxtLink to="/" class="underline">Ir al inicio</NuxtLink>
            </div>
          </div>
        </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import { useRegistro } from '~/composables/auth/useRegistro';

const { formData, loading, error, registrar, tiposDocumento } = useRegistro();

// Estado para el paso actual del formulario
const pasoActual = ref(1);

// Validaciones para cada paso
const validarPaso1 = computed(() => {
  return formData.value.tipo_documento && 
         formData.value.numero_documento && 
         formData.value.nombres && 
         formData.value.apellidos;
});

const validarPaso2 = computed(() => {
  return formData.value.email && 
         formData.value.telefono;
});

const validarPaso3 = computed(() => {
  return formData.value.username &&
         formData.value.password && 
         formData.value.confirmar_password &&
         formData.value.password.length >= 8 &&
         formData.value.password === formData.value.confirmar_password;
});

// Generar username por defecto cuando se tienen nombres y apellidos
watch([() => formData.value.nombres, () => formData.value.apellidos], ([nombres, apellidos]) => {
  if (nombres && apellidos && !formData.value.username) {
    // Tomar primeros 3 caracteres de nombres y apellidos, convertir a minúsculas y quitar espacios
    const nombrePart = nombres.trim().replace(/\s/g, '').substring(0, 4).toLowerCase();
    const apellidoPart = apellidos.trim().replace(/\s/g, '').substring(0, 3).toLowerCase();
    formData.value.username = `${nombrePart}${apellidoPart}`;
  }
});

// Navegación entre pasos
const pasoSiguiente = () => {
  if (pasoActual.value < 3) {
    pasoActual.value++;
  }
};

const pasoAnterior = () => {
  if (pasoActual.value > 1) {
    pasoActual.value--;
  }
};

const handleSubmit = async () => {
  if (pasoActual.value === 3) {
    const success = await registrar();
    if (success) {
      navigateTo('/');
    }
  }
};

definePageMeta({
  layout: 'auth'
});

</script>