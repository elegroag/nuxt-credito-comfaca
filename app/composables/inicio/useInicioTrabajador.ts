import { computed, onMounted, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useParametros } from '~/composables/useParametros'
import { useSession } from '~/composables/useSession'
import type { Trabajador } from '~/shared/types/trabajador'

export type ConvenioActivo = {
  id: string | number
  nit: string | number
  razon_social: string
  fecha_convenio?: string | null
  fecha_vencimiento?: string | null
  estado?: string | null
  representante_nombre?: string | null
  representante_documento?: string | null
  correo?: string | null
  telefono?: string | null
  direccion?: string | null
  ciudad?: string | null
  departamento?: string | null
  sector_economico?: string | null
  tipo_empresa?: string | null
}

export function useInicioTrabajador() {
  const { session } = useSession()
  const { getJson } = useApi()

  const {
    cargarParametros,
    loading: loadingParametros,
    error: errorParametros,
    getMotivosRechazo,
    getOficinasCredito,
    getDatosGeneralesCredito
  } = useParametros()

  const loadingConvenio = ref(false)
  const errorConvenio = ref<string | null>(null)
  const convenioActivo = ref<ConvenioActivo | null>(null)

  const trabajadorEnSesion = computed<Trabajador | null>(() => session.value.user?.trabajador ?? null)
  const empresaTrabajador = computed(() => trabajadorEnSesion.value?.empresa ?? null)

  const cargarConvenioActivo = async () => {
    if (!process.client) return

    loadingConvenio.value = true
    errorConvenio.value = null

    try {
      const response = await getJson<{
        success: boolean
        message: string
        data: { convenio: ConvenioActivo; trabajador?: Trabajador | null }
      }>('/api/convenios/activo', { auth: true })

      convenioActivo.value = response.data?.convenio ?? null

      if (response.data?.trabajador && session.value.user) {
        session.value.user.trabajador = response.data.trabajador
      }
    } catch (e: unknown) {
      errorConvenio.value = e instanceof Error ? e.message : 'No fue posible cargar el convenio activo'
      convenioActivo.value = null
    } finally {
      loadingConvenio.value = false
    }
  }

  const cargarInicioTrabajador = async () => {
    await Promise.all([cargarParametros(), cargarConvenioActivo()])
  }

  onMounted(async () => {
    await cargarInicioTrabajador()
  })

  return {
    loadingParametros,
    errorParametros,

    loadingConvenio,
    errorConvenio,

    convenioActivo,
    trabajadorEnSesion,
    empresaTrabajador,

    motivosRechazo: getMotivosRechazo,
    oficinasCredito: getOficinasCredito,
    datosGeneralesCredito: getDatosGeneralesCredito,

    cargarInicioTrabajador,
    cargarConvenioActivo
  }
}
