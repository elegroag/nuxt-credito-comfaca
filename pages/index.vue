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
            class="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <DocumentPlusIcon class="h-5 w-5" />
            Nueva solicitud
          </NuxtLink>
          <NuxtLink
            to="/simulador"
            class="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            <CalculatorIcon class="h-5 w-5" />
            Simular
          </NuxtLink>
          <NuxtLink
            to="/xml-extract"
            class="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            <CodeBracketSquareIcon class="h-5 w-5" />
            Extraer XML
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
            <ClipboardDocumentListIcon class="h-full w-full text-zinc-700" />
          </div>
          <div>
            <div class="text-base font-semibold text-zinc-900">Mis solicitudes</div>
            <div class="mt-1 text-sm text-zinc-600">Listado de tus solicitudes y estado actual.</div>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          :disabled="loadingSolicitudes"
          @click="cargarSolicitudes"
        >
          <ArrowPathIcon class="h-5 w-5" />
          Actualizar
        </button>
      </div>

      <div v-if="solicitudesError" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ solicitudesError }}
      </div>

      <div v-if="loadingSolicitudes" class="mt-4 text-sm text-zinc-600">Cargando solicitudes...</div>

      <div v-else class="mt-4">
        <div v-if="solicitudes.length === 0" class="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          Aún no tienes solicitudes registradas.
        </div>

        <div v-else class="overflow-hidden rounded-md border border-zinc-200">
          <table class="w-full text-left text-sm">
            <thead class="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              <tr>
                <th class="px-4 py-3">Número</th>
                <th class="px-4 py-3">Monto</th>
                <th class="px-4 py-3">Plazo</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Creación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in solicitudes" :key="s.id" class="border-t border-zinc-200">
                <td class="px-4 py-3 font-medium text-zinc-900">
                  {{ s.numero_solicitud || '-' }}
                </td>
                <td class="px-4 py-3 text-zinc-700">{{ fmtMoney(s.monto_solicitado) }}</td>
                <td class="px-4 py-3 text-zinc-700">{{ (s.plazo_meses || 0) }} meses</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    :class="estadoBadgeClass(String(s.estado || ''))"
                  >
                    {{ s.estado || '-' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-zinc-700">{{ fmtDate(s.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <NuxtLink
        to="/simulador"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
              <CalculatorIcon class="h-full w-full text-zinc-700" />
            </div>
            <div class="min-w-0">
              <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Simulador de crédito</div>
              <div class="mt-1 text-sm text-zinc-600">Cuota mensual, tasa efectiva y capacidad de endeudamiento</div>
            </div>
          </div>
          <ChevronRightIcon class="h-5 w-5 shrink-0 text-zinc-400" />
        </div>
      </NuxtLink>

      <NuxtLink
        to="/solicitud"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
              <DocumentPlusIcon class="h-full w-full text-zinc-700" />
            </div>
            <div class="min-w-0">
              <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Solicitud de crédito</div>
              <div class="mt-1 text-sm text-zinc-600">Captura secuencial por bloques y generación de XML</div>
            </div>
          </div>
          <ChevronRightIcon class="h-5 w-5 shrink-0 text-zinc-400" />
        </div>
      </NuxtLink>

      <NuxtLink
        to="/firmas"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
              <PencilSquareIcon class="h-full w-full text-zinc-700" />
            </div>
            <div class="min-w-0">
              <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Firmas</div>
              <div class="mt-1 text-sm text-zinc-600">Firmar y visualizar solicitudes</div>
            </div>
          </div>
          <ChevronRightIcon class="h-5 w-5 shrink-0 text-zinc-400" />
        </div>
      </NuxtLink>

      <NuxtLink
        to="/firmas-compartir"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
              <ShareIcon class="h-full w-full text-zinc-700" />
            </div>
            <div class="min-w-0">
              <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Compartir firmas</div>
              <div class="mt-1 text-sm text-zinc-600">Generar enlaces y QR para firma digital</div>
            </div>
          </div>
          <ChevronRightIcon class="h-5 w-5 shrink-0 text-zinc-400" />
        </div>
      </NuxtLink>

      <NuxtLink
        to="/entidad-digital"
        class="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
              <KeyIcon class="h-full w-full text-zinc-700" />
            </div>
            <div class="min-w-0">
              <div class="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">Entidad digital</div>
              <div class="mt-1 text-sm text-zinc-600">Gestión y consulta de datos</div>
            </div>
          </div>
          <ChevronRightIcon class="h-5 w-5 shrink-0 text-zinc-400" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from '#imports'

import {
  ArrowPathIcon,
  CalculatorIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CodeBracketSquareIcon,
  DocumentPlusIcon,
  KeyIcon,
  PencilSquareIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'

const { session, authHeader } = useSession()

const solicitudes = ref<any[]>([])
const loadingSolicitudes = ref(false)
const solicitudesError = ref('')

const fmtMoney = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value)
  const v = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

const fmtDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

const estadoBadgeClass = (estado: string) => {
  const s = (estado || '').toLowerCase()
  if (s === 'aprobado' || s === 'activo' || s === 'desembolsado') return 'bg-emerald-50 text-emerald-800'
  if (s === 'en validación' || s === 'postulado') return 'bg-amber-50 text-amber-800'
  if (s === 'finalizado') return 'bg-zinc-100 text-zinc-800'
  if (s === 'desiste') return 'bg-red-50 text-red-800'
  return 'bg-zinc-100 text-zinc-800'
}

const cargarSolicitudes = async () => {
  if (!process.client) return
  loadingSolicitudes.value = true
  solicitudesError.value = ''
  try {
    const res = await fetch('/api/solicitudes-credito', {
      method: 'GET',
      headers: {
        ...(authHeader.value as any)
      }
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || `Error HTTP ${res.status}`)
    }

    const data = await res.json().catch(() => null)
    solicitudes.value = Array.isArray(data?.items) ? data.items : []
  } catch (e: any) {
    solicitudes.value = []
    solicitudesError.value = e?.message || 'No fue posible cargar las solicitudes'
  } finally {
    loadingSolicitudes.value = false
  }
}

onMounted(async () => {
  await cargarSolicitudes()
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>
