<template>
  <div class="bg-white flex flex-col shadow-xl rounded-2xl">
    <!-- Contenedor principal con altura controlada -->
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-sm space-y-6">
        <!-- Logo simple -->
        <div class="text-center mb-2 p-4">
          <h1 class="text-2xl font-bold tracking-tight">Portal de Asesores</h1>
          <p class="text-sm text-muted-foreground mt-1">Ingresa tus credenciales</p>
        </div>

        <!-- Formulario compacto -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Número de Asesor -->
          <div  class="space-y-2">
            <Label for="adviser-number" class="text-sm font-medium text-gray-700">
              Número de Asesor
            </Label>
            <Input 
              id="adviser-number"
              v-model="adviserNumber" 
              type="number" 
              placeholder="Ej: 001, A123..."
              :class="cn('h-9 text-sm', errorMsg && !adviserNumber.trim() && 'border-red-500')"
              :disabled="loading"
            />
          </div>

          <!-- Usuario -->
          <div class="space-y-2">
            <Label for="username" class="text-sm font-medium text-gray-700">
              Número de Usuario SISU
            </Label>
            <Input 
              id="username"
              v-model="username" 
              type="number" 
              placeholder="Tu nombre de usuario"
              :class="cn('h-9 text-sm', errorMsg && !username.trim() && 'border-red-500')"
              :disabled="loading"
            />
          </div>

          <!-- Contraseña -->
          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium text-gray-700">
              Contraseña
            </Label>
            <Input 
              id="password"
              v-model="password" 
              type="password" 
              placeholder="•••••••••"
              :class="cn('h-9 text-sm', errorMsg && !password && 'border-red-500')"
              :disabled="loading"
            />
          </div>

          <!-- Mensaje de error simple -->
          <div v-if="errorMsg" class="text-xs text-red-600 text-center">
            {{ errorMsg }}
          </div>

          <!-- Botón -->
          <Button
            type="submit"
            class="w-full h-9 text-sm"
            :disabled="loading || !isConnected"
            variant="default"
          >
            <ArrowPathIcon v-if="loading" class="mr-2 h-3 w-3 animate-spin" />
            {{ loading ? 'Iniciando...' : 'Iniciar sesión' }}
          </Button>
        </form>

        <!-- Enlace de ayuda -->
        <div class="text-center mt-4">
          <a 
            href="https://www.comfaca.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-xs text-blue-600 hover:text-blue-500 transition-colors"
          >
            ¿Necesitas ayuda?
          </a>
        </div>
      </div>
    </div>

    <!-- Estado de conexión minimalista -->
    <div 
      :class="cn('border-t px-4 py-1 text-xs transition-colors', connectionStatusClass)"
    >
      <div class="flex items-center justify-center gap-1">
        <ArrowPathIcon v-if="checkingConnection" class="h-3 w-3 animate-spin" />
        <CheckCircleIcon v-else-if="isConnected" class="h-3 w-3" />
        <ExclamationTriangleIcon v-else class="h-3 w-3" />
        <span class="text-xs">{{ connectionMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from '#imports'
import { BriefcaseIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useAdviser } from '~/composables/auth/useAdviser'
import { useHealthCheck } from '~/composables/useHealthCheck'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

definePageMeta({
  layout: 'auth'
})

const { 
  adviserNumber, 
  username, 
  password, 
  loading, 
  errorMsg, 
  login, 
  checkAuthAndRedirect,
  validateForm 
} = useAdviser()

const { 
  isConnected, 
  checkingConnection, 
  connectionMessage, 
  connectionStatusClass, 
  checkConnection 
} = useHealthCheck()

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  await login()
}

onMounted(async () => {
  await checkConnection()
  await checkAuthAndRedirect()
})
</script>