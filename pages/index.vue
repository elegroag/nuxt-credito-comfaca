<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <h1 class="truncate text-2xl font-semibold tracking-tight">Bienvenido</h1>
          <p class="mt-1 text-sm text-zinc-600">
            {{ session.user?.username || 'Usuario' }}
            <span v-if="(session.user?.roles || []).length" class="text-zinc-400">·</span>
            <span v-if="(session.user?.roles || []).length" class="text-zinc-500">
              {{ (session.user?.roles || []).join(', ') }}
            </span>
          </p>
          <p class="mt-3 text-sm text-zinc-600">
            Selecciona una opción para comenzar.
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <NuxtLink
            to="/solicitud"
            class="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nueva solicitud
          </NuxtLink>
          <NuxtLink
            to="/xml-extract"
            class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Extraer XML
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <NuxtLink
        to="/solicitud"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Solicitud de crédito</div>
            <div class="mt-1 text-sm text-zinc-600">Captura secuencial por bloques y generación de XML</div>
          </div>
          <div class="shrink-0 text-zinc-400">→</div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/firmas"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Firmas</div>
            <div class="mt-1 text-sm text-zinc-600">Firmar y visualizar solicitudes</div>
          </div>
          <div class="shrink-0 text-zinc-400">→</div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/firmas-compartir"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Compartir firmas</div>
            <div class="mt-1 text-sm text-zinc-600">Generar enlaces y QR para firma digital</div>
          </div>
          <div class="shrink-0 text-zinc-400">→</div>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/entidad-digital"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Entidad digital</div>
            <div class="mt-1 text-sm text-zinc-600">Gestión y consulta de datos</div>
          </div>
          <div class="shrink-0 text-zinc-400">→</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { session } = useSession()

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
