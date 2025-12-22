<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Compartir link de firmas</h1>
        <p class="text-sm text-zinc-600">Genera un link temporal (3 días) para que otros puedan firmar la solicitud</p>
      </div>
      <NuxtLink
        to="/"
        class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
      >
        Volver
      </NuxtLink>
    </div>

    <div class="rounded-lg border border-zinc-200 bg-white p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-900">Buscar XML en storage/activos</label>
          <input
            v-model="query"
            type="text"
            placeholder="Ej: solicitud, 202512, .xml"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            @input="buscar"
          />
          <p class="mt-1 text-xs text-zinc-600">Se listan archivos desde <code class="rounded bg-zinc-100 px-1">backend/storage/activos</code>.</p>
        </div>

        <div class="sm:col-span-2">
          <div class="mb-2 text-sm font-semibold text-zinc-900">Resultados</div>
          <div class="max-h-56 overflow-auto rounded-md border border-zinc-200">
            <button
              v-for="f in files"
              :key="f"
              type="button"
              class="block w-full border-b border-zinc-100 px-3 py-2 text-left text-sm hover:bg-zinc-50"
              @click="selectSolicitud(f)"
            >
              {{ f }}
            </button>
            <div v-if="files.length === 0" class="px-3 py-3 text-sm text-zinc-600">Sin resultados</div>
          </div>
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-900">XML de solicitud seleccionado</label>
          <input v-model="solicitudFilename" type="text" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-900">XML de firmas existente (opcional)</label>
          <input
            v-model="firmasFilename"
            type="text"
            placeholder="firmas-...xml"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
          <p class="mt-1 text-xs text-zinc-600">Si ya existe un XML de firmas, lo puedes pasar para que el link continúe firmando sobre ese documento.</p>
        </div>

        <div class="sm:col-span-2 flex items-center gap-3">
          <button
            type="button"
            class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="loading || !solicitudFilename.trim()"
            @click="generarLink"
          >
            {{ loading ? 'Generando...' : 'Generar link + QR (3 días)' }}
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>

      <div v-if="shareUrl" class="mt-4 grid gap-3">
        <div class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div class="font-semibold">Link generado</div>
          <div class="mt-1 break-all">{{ shareUrl }}</div>
          <div class="mt-1 text-xs">Expira: {{ expiresAt }}</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <NuxtLink
              :to="sharePath"
              class="rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
            >
              Abrir vista de firma
            </NuxtLink>
            <button
              type="button"
              class="rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
              @click="copiarLink"
            >
              Copiar link
            </button>
          </div>
        </div>

        <div v-if="qrDataUrl" class="rounded-md border border-zinc-200 bg-white p-3">
          <div class="mb-2 text-sm font-semibold text-zinc-900">QR</div>
          <img :src="qrDataUrl" alt="QR" class="h-64 w-64 rounded border border-zinc-200 bg-white p-2" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFirmaCompartir } from '~/composables/firmas/useFirmaCompartir'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const {
  query,
  files,
  buscar,
  selectSolicitud,
  solicitudFilename,
  firmasFilename,
  loading,
  errorMsg,
  token,
  expiresAt,
  sharePath,
  shareUrl,
  qrDataUrl,
  generarLink,
  copiarLink,
  resetForm
} = useFirmaCompartir()
</script>
