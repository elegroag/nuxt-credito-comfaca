import { ref } from 'vue'
import { useApi } from '../useApi'
import { useSession } from '../useSession'
import type { DocumentoRequerido, DocumentoCargado } from '../../shared/types/solicitud-credito'

export const useDocumentos = (solicitudId: string) => {
    const { urlFor } = useApi()
    const { authHeader } = useSession()

    const cargando = ref(false)
    const error = ref<string | null>(null)
    const progreso = ref(0)
    const documentosCargados = ref<DocumentoCargado[]>([])

    const validarArchivo = (file: File): string | null => {
        const MAX_SIZE = 5 * 1024 * 1024 // 5MB
        const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

        if (file.size > MAX_SIZE) {
            return `El archivo excede el tamaño máximo permitido de 5MB`
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Formato de archivo no válido. Se permiten: PDF, JPG, PNG`
        }

        return null
    }

    const subirDocumento = async (file: File, documentoRequeridoId: string) => {
        cargando.value = true
        error.value = null
        progreso.value = 0

        try {
            const errorValidacion = validarArchivo(file)
            if (errorValidacion) {
                throw new Error(errorValidacion)
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('documento_requerido_id', documentoRequeridoId)

            const response = await $fetch<DocumentoCargado>(urlFor(`/api/solicitudes-credito/${solicitudId}/documentos`), {
                method: 'POST',
                body: formData,
                headers: {
                    ...authHeader.value as any
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        progreso.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    }
                }
            })

            // Actualizar la lista local o reemplazar si ya existe
            const index = documentosCargados.value.findIndex(d => d.documentoRequeridoId === documentoRequeridoId)
            if (index !== -1) {
                documentosCargados.value[index] = response
            } else {
                documentosCargados.value.push(response)
            }

            return response
        } catch (e: any) {
            error.value = e.message || 'Error al subir el documento'
            throw e
        } finally {
            cargando.value = false
            progreso.value = 0
        }
    }

    const eliminarDocumento = async (documentoCargadoId: string) => {
        cargando.value = true
        error.value = null

        try {
            await $fetch(urlFor(`/api/solicitudes-credito/${solicitudId}/documentos/${documentoCargadoId}`), {
                method: 'DELETE',
                headers: {
                    ...authHeader.value as any
                }
            })

            documentosCargados.value = documentosCargados.value.filter(d => d.id !== documentoCargadoId)
        } catch (e: any) {
            error.value = e.message || 'Error al eliminar el documento'
            throw e
        } finally {
            cargando.value = false
        }
    }

    const cargarDocumentosExistentes = async () => {
        cargando.value = true
        try {
            const response = await $fetch<DocumentoCargado[]>(urlFor(`/api/solicitudes-credito/${solicitudId}/documentos`), {
                method: 'GET',
                headers: {
                    ...authHeader.value as any
                }
            })
            documentosCargados.value = response
        } catch (e: any) {
            console.error('Error cargando documentos existentes', e)
            // No bloqueamos si falla la carga inicial, pero logueamos
        } finally {
            cargando.value = false
        }
    }

    return {
        cargando,
        error,
        progreso,
        documentosCargados,
        subirDocumento,
        eliminarDocumento,
        cargarDocumentosExistentes,
        validarArchivo
    }
}
