import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { SolicitudCreditoPayload } from '~/shared/types/solicitud-credito'

const FIRMA_DEFAULTS_STORAGE_KEY = 'comfaca_credito_firma_defaults'

export function useSolicitudXmlActions() {
    const { postJson } = useApi()

    const loadingXml = ref(false)
    const xmlText = ref('')
    const savedFilename = ref('')
    const createdSolicitudId = ref('')
    const errorMsg = ref('')

    const generarXml = async (form: SolicitudCreditoPayload, saveXml: boolean): Promise<boolean> => {
        loadingXml.value = true
        errorMsg.value = ''
        savedFilename.value = ''
        createdSolicitudId.value = ''

        try {
            const response = await postJson<string>('/api/solicitud-credito/xml', {
                ...form,
                save_xml: saveXml
            }, { auth: true })

            xmlText.value = response

            if (saveXml && process.client) {
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
        generarXml,
        downloadXml
    }
}
