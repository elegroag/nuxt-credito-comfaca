<template>
  <header class="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="sidebarOpen = !sidebarOpen"
        class="lg:hidden text-foreground hover:bg-accent">
        <Menu class="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" @click="sidebarCollapsed = !sidebarCollapsed"
        class="hidden lg:flex text-foreground hover:bg-accent">
        <PanelLeft v-if="sidebarCollapsed" class="h-5 w-5" />
        <PanelLeftClose v-else class="h-5 w-5" />
      </Button>
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="text-sm font-medium text-muted-foreground hover:text-foreground">
          Comfaca Crédito
        </NuxtLink>
        <span class="text-muted-foreground">/</span>
        <span class="text-sm font-semibold text-foreground">{{ sectionTitle }}</span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <span class="hidden text-sm text-muted-foreground sm:block">
        {{ session.user?.username || 'Usuario' }} <span class="text-muted-foreground/60">·</span>
        <span class="text-foreground">{{ (session.user?.roles || []).join(', ') || 'sin roles' }}</span>
      </span>

      <!-- Campana de notificaciones -->
      <NotificationBell />

      <div class="relative">
        <Button variant="ghost"
          class="relative h-9 w-9 rounded-full border border-border/50 p-0 hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring"
          @click="userMenuOpen = !userMenuOpen">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-offset-background transition-colors hover:bg-primary/20">
            {{ _abbr(session.user?.username || 'Usuario') }}
          </div>
        </Button>

        <div v-if="userMenuOpen"
          class="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200">
          <NuxtLink to="/perfil"
            class="relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground group"
            @click="userMenuOpen = false">
            <UserIcon class="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
            <span class="font-medium">Mi Perfil</span>
          </NuxtLink>

          <div class="h-px bg-border/60 mx-1 my-1"></div>

          <button
            class="relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground group"
            @click="logout">
            <LogOut class="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
            <span class="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  User as UserIcon
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import { useDashboardLayout } from '~/composables/layout/useDashboardLayout'

const {
  session,
  sidebarOpen,
  sidebarCollapsed,
  userMenuOpen,
  sectionTitle,
  logout,
  _abbr
} = useDashboardLayout()
</script>
