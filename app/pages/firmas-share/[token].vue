<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Firmar solicitud (link compartido)</h1>
        <p class="text-sm text-zinc-600">Este link es temporal. Expira en 3 días.</p>
      </div>
      <NuxtLink
        to="/"
        class="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
      >
        Volver
      </NuxtLink>
    </div>

    <div class="rounded-lg border border-zinc-200 bg-white p-4">
      <div v-if="tokenError" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ tokenError }}
      </div>

      <div v-else class="grid gap-4">
        <div class="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900">
          <div><span class="font-semibold">Solicitud:</span> {{ tokenInfo?.solicitud_filename || '-' }}</div>
          <div><span class="font-semibold">Firmas actual:</span> {{ tokenInfo?.firmas_filename || '(se creará al firmar)' }}</div>
          <div><span class="font-semibold">Expira:</span> {{ tokenInfo?.expires_at || '-' }}</div>
        </div>

        <div v-if="!identityExists && identityChecked" class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div class="font-semibold">No tienes identidad digital</div>
          <div class="mt-1">
            Debes crear tu entidad digital (llaves) para poder firmar.
          </div>
          <div class="mt-2">
            <NuxtLink
              :to="crearIdentidadLink"
              class="inline-flex rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              Crear identidad digital
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <select v-model="tipoIdentificacion" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" @change="verificarIdentidad">
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="NIT">NIT</option>
              <option value="PAS">PAS</option>
            </select>
          </FormField>

          <FormField label="Número identificación">
            <input
              v-model="numeroIdentificacion"
              type="text"
              class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              @blur="verificarIdentidad"
            />
          </FormField>

          <FormField label="Clave segura de firma" class="sm:col-span-2">
            <input v-model="claveFirma" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
            <p class="mt-1 text-xs text-zinc-600">Clave para descifrar tu llave privada (creada en identidad digital).</p>
          </FormField>

          <FormField label="Confirmar clave segura" class="sm:col-span-2">
            <input v-model="claveFirmaConfirm" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
          </FormField>

          <div class="sm:col-span-2">
            <button
              type="button"
              class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              :disabled="loading || !canSign"
              @click="firmar"
            >
              {{ loading ? 'Firmando...' : 'Firmar' }}
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {{ errorMsg }}
        </div>

        <div v-if="savedFilename" class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Guardado en: {{ savedFilename }}
        </div>

        <div v-if="xmlText" class="mt-2">
          <h2 class="mb-2 text-sm font-semibold text-zinc-900">XML de firmas</h2>
          <pre class="max-h-[70dvh] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900">{{ xmlText }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormField from '~/components/shared/FormField.vue'
import { useFirmaShareToken } from '~/composables/firmas/useFirmaShareToken'

const {
  token,
  tokenInfo,
  tokenError,
  cargarToken,
  rolFirmante,
  aprobado,
  nombreApellidos,
  tipoIdentificacion,
  numeroIdentificacion,
  claveFirma,
  claveFirmaConfirm,
  identityChecked,
  identityExists,
  verificarIdentidad,
  crearIdentidadLink,
  loading,
  errorMsg,
  xmlText,
  savedFilename,
  canSign,
  firmar,
  resetForm
} = useFirmaShareToken()
</script>
