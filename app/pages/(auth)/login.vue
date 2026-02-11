<template>
  <div class="w-full min-w-[220px] max-w-lg mx-auto">
    <div class="bg-white shadow-xl rounded-2xl ">
      <div class="pb-4">
        <div class="p-6 lg:p-8 xl:p-10 space-y-6">
          <div class="text-center p-3">
            <h1 class="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form @submit.prevent="login" class="space-y-4">
            <div class="space-y-2">
              <Label for="username">Usuario</Label>
              <Input id="username" v-model="username" type="text" placeholder="Tu nombre de usuario" required />
            </div>

            <div class="space-y-2">
              <Label for="password">Contraseña</Label>
              <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
            </div>

            <Button type="submit" class="w-full" :disabled="loading || !isConnected">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </Button>

            <div v-if="errorMsg"
              class="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
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
      </div>

      <!-- Estado de conexión -->
      <div :class="cn('border-t px-4 py-1 text-xs transition-colors', connectionStatusClass)">
        <div class="flex items-center justify-center gap-1">
          <ArrowPathIcon v-if="checkingConnection" class="h-3 w-3 animate-spin" />
          <CheckCircleIcon v-else-if="isConnected" class="h-3 w-3" />
          <ExclamationTriangleIcon v-else class="h-3 w-3" />
          <span class="text-xs">{{ connectionMessage }}</span>
        </div>
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