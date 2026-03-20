<template>
  <div class="min-h-[calc(100vh-4rem)]">
    <div class="mx-auto max-w-7xl p-4 sm:p-8">
      <!-- Vista para Administradores y Asesores -->
      <div v-if="isAdministrator || isAdviser">
        <DashAdminAdviser />
      </div>

      <!-- Vista para Usuarios Trabajadores-->
      <div v-else>
        <DashTrabajador />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissions } from '~/composables/usePermissions'
import DashTrabajador from '@/components/inicio/dash-trabajador.vue'
import DashAdminAdviser from '@/components/inicio/dash-admin-adviser.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { isAdministrator, isAdviser } = usePermissions()
</script>