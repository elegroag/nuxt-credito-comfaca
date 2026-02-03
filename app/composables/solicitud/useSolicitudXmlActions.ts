import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useSession } from '~/composables/useSession'
import { useSimuladorStorage } from '~/composables/useSimuladorStorage'
import type { SolicitudCreditoPayload, GuardarSolicitudResponse } from '~/shared/types/solicitud-credito'

export function useSolicitudXmlActions() {
    const { urlFor } = useApi()
    const { authHeader } = useSession()
    const simuladorStorage = useSimuladorStorage()

    const loadingXml = ref(false)
    const xmlText = ref('')
    const savedFilename = ref('')
    const createdSolicitudId = ref('')
    const errorMsg = ref('')

    const guardarSolicitud = async (form: SolicitudCreditoPayload): Promise<boolean> => {
        loadingXml.value = true
        errorMsg.value = ''
        savedFilename.value = ''
        createdSolicitudId.value = ''

        try {
            // Obtener datos del simulador desde localStorage
            const simuladorData = simuladorStorage.loadSimuladorData()

            // Preparar el payload con los datos del simulador
            const payload = {
                ...form,
                // Agregar datos del simulador si están disponibles
                ...(simuladorData?.lineaCredito && {
                    linea_credito: {
                        tipcre: simuladorData.lineaCredito.tipcre,
                        modxml4: simuladorData.lineaCredito.modxml4,
                        detalle_modalidad: simuladorData.lineaCredito.detalle,
                        codigo_cre: simuladorData.lineaCredito.codcre,
                        codigo_cap: simuladorData.lineaCredito.codcap,
                        codigo_ser: simuladorData.lineaCredito.codser,
                        codigo_int: simuladorData.lineaCredito.codint,
                        codigo_mor: simuladorData.lineaCredito.codmor,
                        codigo_con: simuladorData.lineaCredito.codcon,
                        codigo_cen: simuladorData.lineaCredito.codcen,
                        numero_cuotas: simuladorData.lineaCredito.numcuo,
                        estado: simuladorData.lineaCredito.estado,
                        auxest: simuladorData.lineaCredito.auxest,
                        estcre: simuladorData.lineaCredito.estcre,
                        pagseg: simuladorData.lineaCredito.pagseg,
                        repdcr: simuladorData.lineaCredito.repdcr,
                        tipfin: simuladorData.lineaCredito.tipfin
                    }
                })
            }

            const response = await $fetch.raw<GuardarSolicitudResponse>(urlFor('/api/solicitud-credito/guardar'), {
                method: 'POST',
                body: payload,
                headers: {
                    ...authHeader.value
                } as Record<string, string>
            })

            if (response._data) {
                createdSolicitudId.value = response._data.data.numero_solicitud;
                xmlText.value = response._data._data || '';
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
            return true
        } catch (e: unknown) {
            xmlText.value = ''
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
            const apiError = (e as any)?.data?.error;
            errorMsg.value = apiError || errorMessage || 'Error generando XML'
            return false
        } finally {
            loadingXml.value = false
        }
    }

    const downloadXml = (filename?: string): void => {
        if (!xmlText.value) return
        const blob = new Blob([xmlText.value], { type: 'application/xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename || savedFilename.value || 'solicitud-credito.xml'
        a.click()
        URL.revokeObjectURL(url)
    }

    return {
        loadingXml,
        xmlText,
        savedFilename,
        createdSolicitudId,
        errorMsg,
        guardarSolicitud,
        downloadXml
    }
}
