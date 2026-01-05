<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Extracción de XML</h1>
        <p class="text-sm text-zinc-600">Ingresa el nombre del archivo dentro de <code class="rounded bg-zinc-100 px-1">backend/xml</code></p>
      </div>
      <NuxtLink
        to="/"
        class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
      >
        Volver
      </NuxtLink>
    </div>

    <div class="rounded-lg border border-zinc-200 bg-white p-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        <FormField label="Nombre del XML" class="sm:col-span-2">
          <input
            v-model="filename"
            type="text"
            placeholder="solicitud-credito.xml"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </FormField>

        <div class="flex items-center gap-3 h-full pb-2">
          <label class="flex items-center gap-2 text-sm text-zinc-900 cursor-pointer">
            <input v-model="validate" type="checkbox" class="h-4 w-4" />
            Validar (XSD)
          </label>
        </div>

        <div class="sm:col-span-3">
          <button
            type="button"
            class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="loading"
            @click="extraer"
          >
            {{ loading ? 'Extrayendo...' : 'Extraer' }}
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>

      <div v-if="data" class="mt-4">
        <h2 class="mb-2 text-sm font-semibold text-zinc-900">Resultado</h2>
        <pre class="max-h-[70dvh] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900">{{ pretty }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormField from '~/components/shared/FormField.vue'
import { useXmlExtract } from '~/composables/xml/useXmlExtract'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const {
  filename,
  validate,
  loading,
  errorMsg,
  data,
  pretty,
  extraer,
  resetForm
} = useXmlExtract()
</script>
