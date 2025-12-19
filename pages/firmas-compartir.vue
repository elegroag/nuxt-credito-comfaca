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
import { computed, onMounted, ref } from '#imports'
import QRCode from 'qrcode'

const query = ref('')
const files = ref<string[]>([])

const solicitudFilename = ref('')
const firmasFilename = ref('')

const loading = ref(false)
const errorMsg = ref('')

const token = ref('')
const expiresAt = ref('')
const sharePath = computed(() => (token.value ? `/firmas-share/${token.value}` : ''))
const shareUrl = ref('')
const qrDataUrl = ref('')

const fetchFiles = async (q: string) => {
  const url = q ? `/api/activos/xml?q=${encodeURIComponent(q)}` : '/api/activos/xml'
  const res = await fetch(url)
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || `Error HTTP ${res.status}`)
  }
  const data = await res.json()
  const arr = Array.isArray(data?.files) ? data.files : []
  files.value = arr
}

const buscar = async () => {
  try {
    await fetchFiles(query.value)
  } catch (e: any) {
    errorMsg.value = e?.message || 'Error listando XML'
  }
}

const selectSolicitud = (name: string) => {
  solicitudFilename.value = name
}

const generarLink = async () => {
  loading.value = true
  errorMsg.value = ''
  token.value = ''
  shareUrl.value = ''
  qrDataUrl.value = ''
  expiresAt.value = ''

  try {
    const body: any = {
      solicitud_filename: solicitudFilename.value
    }
    if (firmasFilename.value.trim()) {
      body.firmas_filename = firmasFilename.value
    }

    const res = await fetch('/api/solicitud-credito/firmas/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || `Error HTTP ${res.status}`)
    }

    const data = await res.json()
    token.value = String(data?.token || '')
    expiresAt.value = String(data?.expires_at || '')

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    shareUrl.value = origin ? `${origin}${sharePath.value}` : sharePath.value

    if (shareUrl.value) {
      qrDataUrl.value = await QRCode.toDataURL(shareUrl.value, { width: 256, margin: 1 })
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Error generando link'
  } finally {
    loading.value = false
  }
}

const copiarLink = async () => {
  try {
    if (!shareUrl.value) return
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl.value)
    }
  } catch {
    // noop
  }
}

onMounted(async () => {
  try {
    await fetchFiles('')
  } catch {
    // noop
  }
})
</script>
