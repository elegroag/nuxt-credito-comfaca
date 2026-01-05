<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
      <p class="text-sm text-muted-foreground mt-1">
        Ingresa tus credenciales para acceder al sistema.
      </p>
    </div>

    <!-- Estado de conexión -->
    <div 
      :class="cn('rounded-lg p-3 text-xs border transition-colors', connectionStatusClass)"
    >
      <div class="flex items-center gap-2">
        <Loader2 v-if="checkingConnection" class="h-4 w-4 animate-spin" />
        <CheckCircle2 v-else-if="isConnected" class="h-4 w-4" />
        <AlertCircle v-else class="h-4 w-4" />
        <span class="font-medium">{{ connectionMessage }}</span>
      </div>
    </div>

    <form @submit.prevent="login" class="space-y-4">
      <div class="space-y-2">
        <Label for="username">Usuario</Label>
        <Input 
          id="username"
          v-model="username" 
          type="text" 
          placeholder="Tu nombre de usuario"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="password">Contraseña</Label>
        <Input 
          id="password"
          v-model="password" 
          type="password" 
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        type="submit"
        class="w-full"
        :disabled="loading || !isConnected"
      >
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </Button>

      <div v-if="errorMsg" class="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
        <AlertCircle class="h-4 w-4" />
        {{ errorMsg }}
      </div>
    </form>

    <div class="text-center text-sm">
      <p class="text-muted-foreground">
        ¿No tienes cuenta?
        <NuxtLink to="/registro" class="font-medium text-primary underline underline-offset-4">
          Crear cuenta
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
import { onMounted } from '#imports'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { useLogin } from '~/composables/auth/useLogin'
import { useHealthCheck } from '~/composables/useHealthCheck'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

definePageMeta({
  layout: 'auth'
})

const { username, password, loading, errorMsg, login, checkAuthAndRedirect } = useLogin()
const { 
  isConnected, 
  checkingConnection, 
  connectionMessage, 
  connectionStatusClass, 
  checkConnection 
} = useHealthCheck()

onMounted(async () => {
  await checkConnection()
  await checkAuthAndRedirect()
})
</script>