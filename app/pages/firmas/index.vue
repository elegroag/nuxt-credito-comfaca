<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Firmas de solicitud</h1>
        <p class="text-sm text-zinc-600">Adicionar firma a partir de un XML de solicitud existente</p>
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
        <FormField label="XML de solicitud (existente)" class="sm:col-span-2">
          <input
            v-model="solicitudFilename"
            type="text"
            placeholder="solicitud-credito.xml"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
          <p class="mt-1 text-xs text-zinc-600">
            Busca primero en <code class="rounded bg-zinc-100 px-1">backend/storage/activos</code> y luego en
            <code class="rounded bg-zinc-100 px-1">backend/xml</code>.
          </p>
        </FormField>

        <FormField label="XML de firmas existente (opcional)" class="sm:col-span-2">
          <input
            v-model="firmasFilename"
            type="text"
            placeholder="firmas-solicitud-credito.xml"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
          <p class="mt-1 text-xs text-zinc-600">Si lo envías, se adiciona la firma al archivo indicado; si no, se crea uno nuevo.</p>
        </FormField>

        <FormField label="Rol firmante">
          <select v-model="rolFirmante" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
            <option value="solicitante">solicitante</option>
            <option value="codeudor">codeudor</option>
            <option value="empleador">empleador</option>
            <option value="analista">analista</option>
            <option value="aprobador">aprobador</option>
            <option value="auditor">auditor</option>
            <option value="notario">notario</option>
            <option value="sistema">sistema</option>
          </select>
        </FormField>

        <FormField label="Aprobado">
          <label class="flex items-center gap-2 text-sm text-zinc-900">
            <input v-model="aprobado" type="checkbox" class="h-4 w-4" />
            Sí
          </label>
        </FormField>

        <FormField label="Nombre y apellidos" class="sm:col-span-2">
          <input v-model="nombreApellidos" type="text" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Tipo identificación">
          <select v-model="tipoIdentificacion" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="NIT">NIT</option>
            <option value="PAS">PAS</option>
          </select>
        </FormField>

        <FormField label="Número identificación">
          <input v-model="numeroIdentificacion" type="text" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Fecha firma (opcional, ISO 8601)" class="sm:col-span-2">
          <input
            v-model="fechaFirma"
            type="text"
            placeholder="2025-01-15T10:35:00Z"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </FormField>

        <FormField label="Clave segura de firma" class="sm:col-span-2">
          <input v-model="claveFirma" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Confirmar clave de firma" class="sm:col-span-2">
          <input v-model="claveFirmaConfirm" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </FormField>

        <div class="sm:col-span-2 flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-zinc-900">
            <input v-model="saveXml" type="checkbox" class="h-4 w-4" />
            Guardar en storage/activos
          </label>

          <button
            type="button"
            class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="loading"
            @click="firmar"
          >
            {{ loading ? 'Procesando...' : 'Adicionar firma' }}
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>

      <div v-if="savedFilename" class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        Guardado en: {{ savedFilename }}
      </div>

      <div v-if="xmlText" class="mt-4">
        <h2 class="mb-2 text-sm font-semibold text-zinc-900">XML de firmas</h2>
        <pre class="max-h-[70dvh] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900">{{ xmlText }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormField from '~/components/shared/FormField.vue'
import { useFirmas } from '~/composables/firmas/useFirmas'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const {
  solicitudFilename,
  firmasFilename,
  rolFirmante,
  aprobado,
  nombreApellidos,
  tipoIdentificacion,
  numeroIdentificacion,
  fechaFirma,
  saveXml,
  claveFirma,
  claveFirmaConfirm,
  loading,
  errorMsg,
  xmlText,
  savedFilename,
  firmar,
  resetForm,
  validateForm
} = useFirmas()
</script>
