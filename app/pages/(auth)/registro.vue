<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight">Crear una cuenta</h1>
      <p class="text-sm text-muted-foreground mt-1">
        Completa los pasos para registrarte en el sistema.
      </p>
    </div>

    <!-- Indicadores de paso -->
    <div class="relative flex justify-between items-center px-4 py-2">
      <div class="absolute left-0 top-1/2 -z-10 h-0.5 w-full bg-border" />
      <div
        v-for="i in 3"
        :key="i"
        :class="cn(
          'relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
          pasoActual >= i ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'
        )"
      >
        {{ i }}
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Mensaje de error -->
      <div v-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
        <AlertCircle class="h-4 w-4" />
        {{ error }}
      </div>

      <!-- Paso 1: Identificación -->
      <div v-if="pasoActual === 1" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="tipo_documento">Tipo de documento</Label>
            <select
              id="tipo_documento"
              v-model="formData.tipo_documento"
              required
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Seleccione...</option>
              <option v-for="tipo in tiposDocumento" :key="tipo.value" :value="tipo.value">
                {{ tipo.label }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="numero_documento">Número de documento</Label>
            <Input
              id="numero_documento"
              v-model="formData.numero_documento"
              required
              placeholder="1234567890"
            />
          </div>

          <div class="space-y-2">
            <Label for="nombres">Nombres</Label>
            <Input
              id="nombres"
              v-model="formData.nombres"
              required
              placeholder="Juan Carlos"
            />
          </div>

          <div class="space-y-2">
            <Label for="apellidos">Apellidos</Label>
            <Input
              id="apellidos"
              v-model="formData.apellidos"
              required
              placeholder="Pérez Gómez"
            />
          </div>
        </div>
      </div>

      <!-- Paso 2: Contacto -->
      <div v-if="pasoActual === 2" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="email">Correo electrónico</Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              required
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div class="space-y-2">
            <Label for="telefono">Teléfono celular</Label>
            <Input
              id="telefono"
              v-model="formData.telefono"
              type="tel"
              required
              placeholder="3001234567"
            />
          </div>
        </div>
      </div>

      <!-- Paso 3: Seguridad -->
      <div v-if="pasoActual === 3" class="space-y-4">
        <div class="space-y-2">
          <Label for="username">Nombre de usuario</Label>
          <Input
            id="username"
            v-model="formData.username"
            required
            placeholder="pepe123"
          />
          <p class="text-[10px] text-muted-foreground">
            Este será tu nombre de usuario para iniciar sesión
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="password">Contraseña</Label>
            <Input
              id="password"
              v-model="formData.password"
              type="password"
              required
              minlength="8"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div class="space-y-2">
            <Label for="confirmar_password">Confirmar contraseña</Label>
            <Input
              id="confirmar_password"
              v-model="formData.confirmar_password"
              type="password"
              required
              minlength="8"
              placeholder="Repita su contraseña"
            />
          </div>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div class="pt-4 flex gap-3">
        <Button
          v-if="pasoActual > 1"
          type="button"
          variant="outline"
          class="flex-1"
          @click="pasoAnterior"
        >
          Anterior
        </Button>
        
        <Button
          v-if="pasoActual < 3"
          type="button"
          class="flex-1"
          :disabled="(pasoActual === 1 && !validarPaso1) || (pasoActual === 2 && !validarPaso2)"
          @click="pasoSiguiente"
        >
          Siguiente
        </Button>
        
        <Button
          v-else
          type="submit"
          class="flex-1"
          :disabled="loading || !validarPaso3"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </Button>
      </div>
    </form>

    <div class="text-center text-sm">
      <p class="text-muted-foreground">
        ¿Ya tienes una cuenta?
        <NuxtLink to="/login" class="font-medium text-primary underline underline-offset-4">
          Inicia sesión
        </NuxtLink>
      </p>
      <div class="mt-4">
        <NuxtLink to="/" class="text-xs text-muted-foreground hover:text-primary transition-colors">
          Volver al inicio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import { useRegistro } from '~/composables/auth/useRegistro'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

definePageMeta({
  layout: 'auth'
})

const {
  formData,
  loading,
  error,
  pasoActual,
  tiposDocumento,
  validarPaso1,
  validarPaso2,
  validarPaso3,
  pasoSiguiente,
  pasoAnterior,
  registrar
} = useRegistro()

const handleSubmit = async () => {
  if (pasoActual.value === 3) {
    const success = await registrar()
    if (success) {
      await navigateTo('/')
    }
  }
}
</script>