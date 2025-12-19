<template>
  <div class="mx-auto max-w-5xl p-4 sm:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Entidad digital</h1>
        <p class="text-sm text-zinc-600">Generación de llave pública y privada (privada cifrada con clave)</p>
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
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-900">Tipo identificación</label>
          <select v-model="tipoIdentificacion" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="NIT">NIT</option>
            <option value="PAS">PAS</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-900">Número identificación</label>
          <input v-model="numeroIdentificacion" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-900">Clave segura</label>
          <input
            v-model="clave"
            type="password"
            class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            placeholder="Mínimo 10 caracteres"
          />
          <p class="mt-1 text-xs text-zinc-600">
            Esta clave se usa para cifrar la llave privada (PEM). No se almacena en el servidor.
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-zinc-900">Confirmar clave</label>
          <input v-model="claveConfirm" type="password" class="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </div>

        <div class="sm:col-span-2 flex items-center gap-4">
          <label class="flex items-center gap-2 text-sm text-zinc-900">
            <input v-model="overwrite" type="checkbox" class="h-4 w-4" />
            Reemplazar si ya existe
          </label>

          <button
            type="button"
            class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            :disabled="loading"
            @click="crear"
          >
            {{ loading ? 'Creando...' : 'Crear entidad' }}
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        {{ errorMsg }}
      </div>

      <div v-if="result" class="mt-4 grid gap-3">
        <div class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div class="font-semibold">Entidad creada</div>
          <div class="mt-1">Directorio: {{ result.directory }}</div>
          <div>Fingerprint SHA-256: {{ result.fingerprint_sha256 }}</div>
        </div>

        <div class="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div class="mb-2 text-sm font-semibold text-zinc-900">Llave pública (PEM)</div>
          <pre class="max-h-[60dvh] overflow-auto text-xs text-zinc-900">{{ result.public_key_pem }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useRoute, navigateTo } from '#imports'

const tipoIdentificacion = ref<'CC' | 'CE' | 'NIT' | 'PAS'>('CC')
const numeroIdentificacion = ref('')

const clave = ref('')
const claveConfirm = ref('')
const overwrite = ref(false)

const loading = ref(false)
const errorMsg = ref('')
const result = ref<any | null>(null)

const route = useRoute()
const redirectTo = ref('')

onMounted(() => {
  const t = route.query.tipo_identificacion
  const n = route.query.numero_identificacion
  const r = route.query.redirect

  if (typeof t === 'string' && (t === 'CC' || t === 'CE' || t === 'NIT' || t === 'PAS')) {
    tipoIdentificacion.value = t
  }
  if (typeof n === 'string' && n.trim()) {
    numeroIdentificacion.value = n
  }
  if (typeof r === 'string' && r.startsWith('/')) {
    redirectTo.value = r
  }
})

const crear = async () => {
  errorMsg.value = ''
  result.value = null

  if (!numeroIdentificacion.value.trim()) {
    errorMsg.value = 'El número de identificación es requerido.'
    return
  }

  if (clave.value.length < 10) {
    errorMsg.value = 'La clave debe tener al menos 10 caracteres.'
    return
  }

  if (clave.value !== claveConfirm.value) {
    errorMsg.value = 'La confirmación de clave no coincide.'
    return
  }

  loading.value = true
  try {
    const res = await fetch('/api/entidad-digital', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        tipo_identificacion: tipoIdentificacion.value,
        numero_identificacion: numeroIdentificacion.value,
        clave: clave.value,
        overwrite: overwrite.value
      })
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

    result.value = await res.json()

    if (redirectTo.value) {
      await navigateTo(redirectTo.value)
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.error || e?.message || 'Error creando entidad digital'
  } finally {
    loading.value = false
  }
}
</script>
