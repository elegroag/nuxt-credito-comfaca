<template>
  <div class="min-h-dvh bg-zinc-50 text-zinc-900">
    <aside
      class="fixed left-0 top-0 z-50 hidden h-dvh shrink-0 border-r border-zinc-200 bg-white transition-[width] duration-200 lg:block"
      :class="sidebarCollapsed ? 'w-20' : 'w-64'"
    >
      <div class="flex h-full flex-col px-3 py-4">
        <div class="flex items-center px-2 pb-4">
          <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white">CC</span>
            <span v-if="!sidebarCollapsed" class="truncate">Comfaca Crédito</span>
          </NuxtLink>
        </div>

        <div v-if="!sidebarCollapsed" class="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Menú</div>
        <nav class="grid gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :title="item.label"
            class="flex items-center rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            :class="[
              isActive(item.to) ? 'bg-zinc-900 text-white hover:bg-zinc-900' : '',
              sidebarCollapsed ? 'justify-center' : 'justify-between'
            ]"
          >
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            <span v-else class="text-xs font-semibold tracking-wide">{{ item.abbr }}</span>
          </NuxtLink>
        </nav>

        <div class="mt-auto border-t border-zinc-200 pt-4">
          <div v-if="!sidebarCollapsed" class="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Sesión</div>

          <div
            class="mt-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
            :class="sidebarCollapsed ? 'px-2' : ''"
          >
            <div v-if="!sidebarCollapsed" class="font-medium text-zinc-900">{{ session.user?.username || 'Usuario' }}</div>
            <div v-if="!sidebarCollapsed" class="mt-1 text-xs text-zinc-500">{{ (session.user?.roles || []).join(', ') || 'sin roles' }}</div>

            <div v-else class="flex items-center justify-center">
              <div class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                {{ _abbr(session.user?.username || 'Usuario') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <header
      class="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur shadow-sm"
      :class="sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'"
    >
      <div class="w-full px-4">
        <div class="flex h-14 items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2">
            <button
              type="button"
              class="hidden h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 lg:inline-flex"
              :aria-label="sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'"
              @click="sidebarCollapsed = !sidebarCollapsed"
            >
              <span class="text-lg leading-none">{{ sidebarCollapsed ? '»' : '«' }}</span>
            </button>

            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 lg:hidden"
              aria-label="Abrir menú"
              @click="sidebarOpen = true"
            >
              <span class="text-lg leading-none">≡</span>
            </button>

            <NuxtLink to="/" class="flex items-center gap-2 font-semibold lg:hidden">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-sm font-semibold text-white">CC</span>
            </NuxtLink>

            <div class="min-w-0 flex items-center gap-2">
              <div class="hidden text-sm font-medium text-zinc-500 sm:block">Comfaca Crédito</div>
              <div class="hidden text-sm text-zinc-300 sm:block">/</div>
              <div class="truncate text-base font-semibold text-zinc-900">{{ sectionTitle }}</div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2">
            <div class="relative">
              <button
                type="button"
                class="flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 text-sm text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                aria-label="Menú de usuario"
                :aria-expanded="userMenuOpen ? 'true' : 'false'"
                @click="userMenuOpen = !userMenuOpen"
              >
                <div class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-900">
                  {{ _abbr(session.user?.username || 'Usuario') }}
                </div>
                <div class="hidden min-w-0 flex-col items-start md:flex">
                  <div class="max-w-[12rem] truncate text-sm font-medium text-zinc-800">
                    {{ session.user?.username || 'Usuario' }}
                  </div>
                  <div class="max-w-[12rem] truncate text-xs text-zinc-500">
                    {{ (session.user?.roles || []).join(', ') || 'sin roles' }}
                  </div>
                </div>
                <div class="hidden text-xs text-zinc-500 md:block">▾</div>
              </button>

              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg z-50"
              >
                <div class="border-b border-zinc-200 px-4 py-3">
                  <div class="text-sm font-semibold text-zinc-900">{{ session.user?.username || 'Usuario' }}</div>
                  <div class="mt-1 text-xs text-zinc-600">{{ (session.user?.roles || []).join(', ') || 'sin roles' }}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              @click="logout"
            >
              <span class="hidden sm:inline">Cerrar sesión</span>
              <span class="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div :class="sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'">
      <main class="mx-auto w-full max-w-7xl">
        <slot />
      </main>
    </div>

    <Teleport to="body">
      <button
        v-if="userMenuOpen"
        type="button"
        class="fixed inset-0 z-40"
        aria-label="Cerrar menú de usuario"
        @click="userMenuOpen = false"
      />

      <div v-if="sidebarOpen" class="fixed inset-0 z-50 lg:hidden">
        <button
          type="button"
          class="absolute inset-0 bg-black/40"
          aria-label="Cerrar menú"
          @click="sidebarOpen = false"
        />

        <div class="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
          <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div class="text-sm font-semibold">Menú</div>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
              aria-label="Cerrar menú"
              @click="sidebarOpen = false"
            >
              <span class="text-lg leading-none">×</span>
            </button>
          </div>

          <div class="px-3 py-4">
            <nav class="grid gap-1">
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                :class="isActive(item.to) ? 'bg-zinc-900 text-white hover:bg-zinc-900' : ''"
                @click="sidebarOpen = false"
              >
                <span>{{ item.label }}</span>
              </NuxtLink>
            </nav>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, navigateTo, ref, useRoute, useSession } from '#imports'

const { session, clearSession } = useSession()
const route = useRoute()

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)

const _abbr = (label: string) => {
  const parts = label
    .split(' ')
    .map((s) => s.trim())
    .filter(Boolean)

  const abbr = parts
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase()

  return abbr || (label.trim()[0] || '').toUpperCase() || '·'
}

const navItems = [
  { label: 'Inicio', to: '/', abbr: _abbr('Inicio') },
  { label: 'Solicitud', to: '/solicitud', abbr: _abbr('Solicitud') },
  { label: 'Extraer XML', to: '/xml-extract', abbr: _abbr('Extraer XML') },
  { label: 'Firmas', to: '/firmas', abbr: _abbr('Firmas') },
  { label: 'Compartir firmas', to: '/firmas-compartir', abbr: _abbr('Compartir firmas') },
  { label: 'Entidad digital', to: '/entidad-digital', abbr: _abbr('Entidad digital') }
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const sectionTitle = computed(() => {
  const hit = navItems.find((x) => isActive(x.to))
  return hit?.label || 'Dashboard'
})

const logout = async () => {
  userMenuOpen.value = false
  clearSession()
  await navigateTo('/login')
}
</script>
