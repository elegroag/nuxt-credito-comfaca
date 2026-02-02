import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useSession } from '~/composables/useSession'
import { useSimuladorStorage } from '~/composables/useSimuladorStorage'
import type { SolicitudCreditoPayload } from '~/shared/types/solicitud-credito'

const FIRMA_DEFAULTS_STORAGE_KEY = 'comfaca_credito_firma_defaults'

export function useSolicitudXmlActions() {
    const { urlFor } = useApi()
    const { authHeader } = useSession()
    const simuladorStorage = useSimuladorStorage()

    const loadingXml = ref(false)
    const xmlText = ref('')
    const savedFilename = ref('')
    const createdSolicitudId = ref('')
    const errorMsg = ref('')

    const guardarSolicitud = async (form: SolicitudCreditoPayload, saveXml: boolean): Promise<boolean> => {
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
                save_xml: saveXml,
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

            //console.log('Payload enviado al backend:', payload)

            const response = await $fetch.raw<string>(urlFor('/api/solicitud-credito/guardar'), {
                method: 'POST',
                body: payload,
                headers: {
                    ...authHeader.value as any
                }
            })

            xmlText.value = response._data || ''

            if (saveXml) {
                const filename = response.headers.get('X-Saved-Filename')
                const solicitudId = response.headers.get('X-Solicitud-Id')

                if (filename) savedFilename.value = filename
                if (solicitudId) createdSolicitudId.value = solicitudId

                if (process.client) {
                    try {
                        localStorage.setItem(
                            FIRMA_DEFAULTS_STORAGE_KEY,
                            JSON.stringify({
                                nombre_apellidos: String(form.solicitante?.nombres_apellidos || ''),
                                tipo_identificacion: String(form.solicitante?.tipo_identificacion || ''),
                                numero_identificacion: String(form.solicitante?.numero_identificacion || '')
                            })
                        )
                    } catch (e: any) {
                        console.log("Error guardando firma defaults", e);
                    }
                }
            }
            return true
        } catch (e: any) {
            xmlText.value = ''
            errorMsg.value = e?.data?.error || e?.message || 'Error generando XML'
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
