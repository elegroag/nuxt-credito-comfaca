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
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-900">Rol firmante</label>
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
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-900">Aprobado</label>
            <label class="flex items-center gap-2 text-sm text-zinc-900">
              <input v-model="aprobado" type="checkbox" class="h-4 w-4" />
              Sí
            </label>
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-zinc-900">Nombre y apellidos</label>
            <input v-model="nombreApellidos" type="text" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-900">Tipo identificación</label>
            <select v-model="tipoIdentificacion" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" @change="verificarIdentidad">
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="NIT">NIT</option>
              <option value="PAS">PAS</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-900">Número identificación</label>
            <input
              v-model="numeroIdentificacion"
              type="text"
              class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              @blur="verificarIdentidad"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-zinc-900">Clave segura de firma</label>
            <input v-model="claveFirma" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
            <p class="mt-1 text-xs text-zinc-600">Clave para descifrar tu llave privada (creada en identidad digital).</p>
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-zinc-900">Confirmar clave segura</label>
            <input v-model="claveFirmaConfirm" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
          </div>

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
import { computed, onMounted, ref, useRoute } from '#imports'

const route = useRoute()
const token = computed(() => String(route.params.token || ''))

const tokenInfo = ref<any | null>(null)
const tokenError = ref('')

const rolFirmante = ref<'solicitante' | 'codeudor' | 'empleador' | 'analista' | 'aprobador' | 'auditor' | 'notario' | 'sistema'>('solicitante')
const aprobado = ref(true)

const nombreApellidos = ref('')
const tipoIdentificacion = ref<'CC' | 'CE' | 'NIT' | 'PAS'>('CC')
const numeroIdentificacion = ref('')

const claveFirma = ref('')
const claveFirmaConfirm = ref('')

const identityChecked = ref(false)
const identityExists = ref(false)

const loading = ref(false)
const errorMsg = ref('')
const xmlText = ref('')
const savedFilename = ref('')

const crearIdentidadLink = computed(() => {
  const redirect = encodeURIComponent(`/firmas-share/${token.value}`)
  const tipo = encodeURIComponent(tipoIdentificacion.value)
  const num = encodeURIComponent(numeroIdentificacion.value)
  return `/entidad-digital?tipo_identificacion=${tipo}&numero_identificacion=${num}&redirect=${redirect}`
})

const canSign = computed(() => {
  if (!token.value) return false
  if (!numeroIdentificacion.value.trim()) return false
  if (claveFirma.value.length < 10) return false
  if (claveFirma.value !== claveFirmaConfirm.value) return false
  if (identityChecked.value && !identityExists.value) return false
  return true
})

const cargarToken = async () => {
  tokenError.value = ''
  tokenInfo.value = null

  const res = await fetch(`/api/solicitud-credito/firmas/share/${encodeURIComponent(token.value)}`)
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || `Error HTTP ${res.status}`)
  }
  tokenInfo.value = await res.json()
}

const verificarIdentidad = async () => {
  identityChecked.value = false
  identityExists.value = false

  const t = tipoIdentificacion.value
  const n = numeroIdentificacion.value.trim()
  if (!t || !n) {
    return
  }

  try {
    const url = `/api/entidad-digital/exists?tipo_identificacion=${encodeURIComponent(t)}&numero_identificacion=${encodeURIComponent(n)}`
    const res = await fetch(url)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || `Error HTTP ${res.status}`)
    }
    const data = await res.json()
    identityExists.value = Boolean(data?.exists)
    identityChecked.value = true
  } catch {
    identityExists.value = false
    identityChecked.value = true
  }
}

const firmar = async () => {
  loading.value = true
  errorMsg.value = ''
  xmlText.value = ''
  savedFilename.value = ''

  try {
    await verificarIdentidad()
    if (identityChecked.value && !identityExists.value) {
      throw new Error('Debes crear tu identidad digital antes de firmar.')
    }

    const body: any = {
      firma: {
        rol_firmante: rolFirmante.value,
        aprobado: aprobado.value,
        firmante: {
          nombre_apellidos: nombreApellidos.value,
          tipo_identificacion: tipoIdentificacion.value,
          numero_identificacion: numeroIdentificacion.value
        }
      },
      clave_firma: claveFirma.value,
      save_xml: true
    }

    const res = await fetch(`/api/solicitud-credito/firmas/share/${encodeURIComponent(token.value)}/firmar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Error HTTP ${res.status}`)
      }
      const text = await res.text().catch(() => '')
      throw new Error(text || `Error HTTP ${res.status}`)
    }

    const header = res.headers.get('x-saved-filename')
    if (header) {
      savedFilename.value = header
    }

    xmlText.value = await res.text()
  } catch (e: any) {
    errorMsg.value = e?.message || 'Error firmando'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await cargarToken()
  } catch (e: any) {
    tokenError.value = e?.message || 'No fue posible cargar el token'
  }
})
</script>
