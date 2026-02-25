import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useSession } from '~/composables/useSession'
import { useDocumentos } from '~/composables/solicitud/useDocumentos'
import type { SolicitudCredito } from '~/shared/types/solicitud-credito'

export const useDocumentosSolicitud = () => {
  const route = useRoute()
  const router = useRouter()
  const { getJson } = useApi()
  const { ready, authHeader } = useSession()

  const solicitudId = route.params.id as string

  // Composable de documentos existente
  const {
    subirDocumento,
    eliminarDocumento,
    cargarDocumentos,
    documentosCargados,
    documentosRequeridos,
    progreso,
    error: errorUpload
  } = useDocumentos(solicitudId)

  // Estado local
  const solicitud = ref<SolicitudCredito | null>(null)
  const loadingSolicitud = ref(true)
  const errorSolicitud = ref<string | null>(null)
  const cargandoId = ref<string | null | undefined>(null)

  // Métodos helper
  const getDocumentoCargado = (reqId: string) => {
    if (!documentosCargados.value || !Array.isArray(documentosCargados.value)) {
      return undefined
    }
    return documentosCargados.value.find(d => d.documento_requerido_id === reqId)
  }

  // Computed properties
  const puedeContinuar = computed(() => {
    if (!solicitud.value || !documentosRequeridos.value || !Array.isArray(documentosRequeridos.value)) return false
    const obligatorios = documentosRequeridos.value.filter(d => d.obligatorio)
    return obligatorios.every(req => getDocumentoCargado(req.id))
  })

  const progresoDocumentos = computed(() => {
    if (!documentosRequeridos.value || !Array.isArray(documentosRequeridos.value)) return 0

    // Contar cuántos documentos requeridos están cargados
    const cargados = documentosRequeridos.value.filter(req => getDocumentoCargado(req.id)).length
    const total = documentosRequeridos.value.length

    return total > 0 ? Math.round((cargados / total) * 100) : 0
  })

  const documentosCargadosCount = computed(() => {
    if (!documentosRequeridos.value || !Array.isArray(documentosRequeridos.value)) return 0

    // Contar cuántos documentos requeridos están cargados
    return documentosRequeridos.value.filter(req => getDocumentoCargado(req.id)).length
  })

  // Métodos de acción
  const cargarSolicitud = async () => {
    loadingSolicitud.value = true
    errorSolicitud.value = null

    try {
      await ready
      // Cargar datos de la solicitud
      const response = await getJson<{ success: boolean, data: SolicitudCredito }>(`/api/solicitudes-credito/${solicitudId}`, { auth: true })
      solicitud.value = response.data

      // Cargar documentos requeridos y existentes con una sola llamada
      await cargarDocumentos()
    } catch (e: any) {
      console.error(e)
      errorSolicitud.value = e.message || 'No se pudo cargar la información de la solicitud.'
    } finally {
      loadingSolicitud.value = false
    }
  }

  const handleUpload = async (file: File, docReqId: string) => {
    cargandoId.value = docReqId
    try {
      await subirDocumento(file, docReqId)
    } catch (e) {
      // El error ya se maneja en el composable y se pasa via prop
    } finally {
      cargandoId.value = null
    }
  }

  const handleDelete = async (docCargadoId: string) => {
    // Encontrar a qué requerimiento pertenece para mostrar loading si es necesario
    const doc = documentosCargados.value?.find(d => d.documento_uuid === docCargadoId)
    if (doc) {
      cargandoId.value = doc.documento_requerido_id
    }

    try {
      await eliminarDocumento(docCargadoId)
    } catch (e) {
      console.error(e)
    } finally {
      cargandoId.value = null
    }
  }

  const handleDownload = async (documentoUuid: string) => {
    try {
      // Crear una petición fetch para descargar el archivo directamente
      const response = await fetch(`/api/solicitudes-credito/${solicitudId}/documentos/${documentoUuid}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
          // Los headers de autenticación se manejan vía cookies
        }
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      // Obtener el blob del archivo
      const blob = await response.blob()

      // Obtener el nombre del archivo desde los headers o usar un default
      const contentDisposition = response.headers.get('content-disposition')
      let fileName = 'documento'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1]
        }
      }

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar URL temporal
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error al descargar documento:', error)
      // Fallback a window.open si hay error
      const fallbackUrl = `/api/solicitudes-credito/${solicitudId}/documentos/${documentoUuid}/download`
      window.open(fallbackUrl, '_blank')
    }
  }

  const handleNavigation = (step: string) => {
    // Navegación simple por ahora
    if (step === 'formulario') {
      // Ir atrás? Depende de si se puede editar
    }
  }

  const handleBack = () => {
    // Volver a la lista de solicitudes o al paso anterior si fuera wizard
    router.push('/solicitudes')
  }

  const handleContinue = () => {
    if (puedeContinuar.value) {
      router.push(`/solicitud/resumen/${solicitudId}`)
    }
  }

  return {
    // Estado
    solicitud,
    loadingSolicitud,
    errorSolicitud,
    cargandoId,

    // Computed
    puedeContinuar,
    progresoDocumentos,
    documentosCargadosCount,

    // Métodos
    getDocumentoCargado,
    cargarSolicitud,
    handleUpload,
    handleDelete,
    handleDownload,
    handleNavigation,
    handleBack,
    handleContinue,

    // Del composable useDocumentos
    documentosCargados,
    documentosRequeridos,
    progreso,
    errorUpload
  }
}
