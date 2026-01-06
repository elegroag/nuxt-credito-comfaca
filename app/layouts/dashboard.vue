<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <DashboardSidebar />

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <DashboardHeader />

      <main class="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
        <slot />
      </main>
      
      <!-- Overlay para cerrar menú de usuario al hacer click fuera -->
       <div v-if="userMenuOpen" class="fixed inset-0 z-40" @click="userMenuOpen = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { useDashboardLayout } from '~/composables/layout/useDashboardLayout'

const {
  userMenuOpen,
} = useDashboardLayout()
</script>
