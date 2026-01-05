<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar Desktop -->
    <aside :class="sidebarDesktopClasses">
      <div class="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
          CC
        </div>
        <span v-if="!sidebarCollapsed" class="text-lg font-semibold text-sidebar-foreground">Comfaca Crédito</span>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <div v-show="!sidebarCollapsed" class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
          MENÚ
        </div>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="getMenuItemClasses(item.to)"
            :title="sidebarCollapsed ? item.label : undefined"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span v-show="!sidebarCollapsed">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <div class="border-t border-sidebar-border p-4">
        <div class="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-semibold text-sm">
            {{ _abbr(session.user?.username || 'Usuario') }}
          </div>
          <div v-show="!sidebarCollapsed" class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium text-sidebar-foreground">{{ session.user?.username || 'Usuario' }}</div>
            <div class="truncate text-xs text-sidebar-foreground/60">{{ (session.user?.roles || []).join(', ') || 'sin roles' }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Mobile Sidebar -->
    <aside :class="sidebarMobileClasses">
      <div class="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            CC
          </div>
          <span class="text-lg font-semibold text-sidebar-foreground">Comfaca Crédito</span>
        </div>
        <Button variant="ghost" size="icon" @click="sidebarOpen = false" class="text-sidebar-foreground">
          <X class="h-5 w-5" />
        </Button>
      </div>

      <nav class="overflow-y-auto px-3 py-4">
        <div class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
          MENÚ
        </div>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            @click="sidebarOpen = false"
            :class="getMobileMenuItemClasses(item.to)"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </NuxtLink>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <header class="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div class="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden text-foreground hover:bg-accent"
          >
            <Menu class="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="sidebarCollapsed = !sidebarCollapsed"
            class="hidden lg:flex text-foreground hover:bg-accent"
          >
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

          <div class="relative">
             <Button variant="ghost" class="relative h-8 w-8 rounded-full" @click="userMenuOpen = !userMenuOpen">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm cursor-pointer">
                    {{ _abbr(session.user?.username || 'Usuario') }}
                </div>
             </Button>
             
             <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-56 rounded-md border border-border bg-popover text-popover-foreground shadow-md z-50">
                <div class="p-2">
                    <div class="px-2 py-1.5 text-sm font-semibold">{{ session.user?.username || 'Usuario' }}</div>
                    <div class="h-px bg-border my-1"></div>
                    <button class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" @click="logout">
                        <LogOut class="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
        <slot />
      </main>
      
      <!-- Overlay para cerrar menú de usuario al hacer click fuera -->
       <div v-if="userMenuOpen" class="fixed inset-0 z-40" @click="userMenuOpen = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  LogOut
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button.vue'
import { useDashboardLayout } from '~/composables/layout/useDashboardLayout'

const {
  session,
  sidebarOpen,
  sidebarCollapsed,
  userMenuOpen,
  navItems,
  sectionTitle,
  isActive,
  logout,
  _abbr
} = useDashboardLayout()

const sidebarDesktopClasses = computed(() => {
  const baseClasses = 'hidden flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex'
  const widthClass = sidebarCollapsed.value ? 'w-16' : 'w-64'
  return cn(baseClasses, widthClass)
})

const sidebarMobileClasses = computed(() => {
  const baseClasses = 'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:hidden'
  const transformClass = sidebarOpen.value ? 'translate-x-0' : '-translate-x-full'
  return cn(baseClasses, transformClass)
})

const getMenuItemClasses = (href: string) => {
  const baseClasses = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors'
  const activeClasses = isActive(href)
    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  const collapsedClass = sidebarCollapsed.value ? 'justify-center' : ''
  
  return cn(baseClasses, activeClasses, collapsedClass)
}

const getMobileMenuItemClasses = (href: string) => {
  const baseClasses = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors'
  const activeClasses = isActive(href)
    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
  
  return cn(baseClasses, activeClasses)
}
</script>
