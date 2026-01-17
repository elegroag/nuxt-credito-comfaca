import { ref, computed, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useSession } from '~/composables/useSession'
import { useFirmas } from '../firmas/useFirmas'
import type { SolicitudCredito } from '~/shared/types/solicitud-credito'

export const useFirmado = (solicitudId: string) => {
    const router = useRouter()
    const { getJson, urlFor } = useApi()
    const { authHeader } = useSession()

    // Estado de la solicitud
    const solicitud = ref<SolicitudCredito | null>(null)
    const loadingSolicitud = ref(true)
    const errorSolicitud = ref<string | null>(null)

    // Composable de firmas existente
    const {
        solicitudFilename,
        rolFirmante,
        aprobado,
        nombreApellidos,
        tipoIdentificacion,
        numeroIdentificacion,
        claveFirma,
        claveFirmaConfirm,
        loading,
        errorMsg,
        savedFilename,
        firmar
    } = useFirmas()

    // Computed properties
    const hasXmlFilename = computed(() => {
        return !!solicitud.value?.xml_filename
    })

    const canSign = computed(() => {
        return claveFirma.value.length >= 10 &&
            claveFirma.value === claveFirmaConfirm.value &&
            aprobado.value &&
            !loading.value
    })

    // Métodos
    const cargarSolicitud = async () => {
        loadingSolicitud.value = true
        errorSolicitud.value = null
        try {
            const response = await getJson<{ success: boolean, data: SolicitudCredito }>(`/api/solicitudes-credito/${solicitudId}`, { auth: true })
            solicitud.value = response.data

            if (solicitud.value) {
                // Pre-llenar datos del firmante desde la solicitud
                const solicitante = solicitud.value.payload.solicitante

                // Asignar valores al composable de firmas
                nombreApellidos.value = solicitante.nombres_apellidos
                tipoIdentificacion.value = solicitante.tipo_identificacion as any
                numeroIdentificacion.value = solicitante.numero_identificacion

                // Si hay nombre de archivo XML, lo asignamos
                if (solicitud.value.xml_filename) {
                    solicitudFilename.value = solicitud.value.xml_filename
                }

                // Resetear otros campos
                claveFirma.value = ''
                claveFirmaConfirm.value = ''
                aprobado.value = true
                errorMsg.value = ''
                savedFilename.value = ''
            }

        } catch (e: any) {
            console.error(e)
            errorSolicitud.value = e.message || 'No se pudo cargar la información de la solicitud.'
        } finally {
            loadingSolicitud.value = false
        }
    }

    const handleFirmar = async () => {
        if (!canSign.value) return

        await firmar()
    }

    const finalizarProceso = async () => {
        try {
            // Llamar al endpoint para finalizar el proceso
            await $fetch(urlFor(`/api/solicitudes-credito/${solicitudId}/finalizar`), {
                method: 'POST',
                headers: {
                    ...authHeader.value as any
                }
            })

            // Redirigir a la página de inicio del sistema
            await router.push('/')

        } catch (error) {
            console.error('Error finalizando proceso:', error)
            // Si hay error, igual redirigir al inicio
            await router.push('/')
        }
    }

    const handleBack = () => {
        router.push(`/documentos/${solicitudId}`)
    }

    const handleNavigation = (step: string) => {
        // Lógica de navegación del wizard
    }

    const initialize = () => {
        if (solicitudId) {
            cargarSolicitud()
        } else {
            errorSolicitud.value = 'ID de solicitud no válido'
            loadingSolicitud.value = false
        }
    }

    return {
        // Estado
        solicitud,
        loadingSolicitud,
        errorSolicitud,

        // Computed
        hasXmlFilename,
        canSign,

        // Del composable de firmas
        solicitudFilename,
        rolFirmante,
        aprobado,
        nombreApellidos,
        tipoIdentificacion,
        numeroIdentificacion,
        claveFirma,
        claveFirmaConfirm,
        loading,
        errorMsg,
        savedFilename,

        // Métodos
        cargarSolicitud,
        handleFirmar,
        finalizarProceso,
        handleBack,
        handleNavigation,
        initialize,
        firmar
    }
}
