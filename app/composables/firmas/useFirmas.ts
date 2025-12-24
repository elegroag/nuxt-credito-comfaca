// frontend/composables/firmas/useFirmas.ts
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSession } from '~/composables/useSession';
import { useApi } from '~/composables/useApi';

const FIRMA_DEFAULTS_STORAGE_KEY = 'comfaca_credito_firma_defaults';

export function useFirmas() {
    const { authHeader } = useSession();
    const route = useRoute();
    const { postJson } = useApi();

    // Form state
    const solicitudFilename = ref('solicitud-credito.xml');
    const firmasFilename = ref('');
    const rolFirmante = ref<'solicitante' | 'codeudor' | 'empleador' | 'analista' | 'aprobador' | 'auditor' | 'notario' | 'sistema'>('solicitante');
    const aprobado = ref(true);
    const nombreApellidos = ref('');
    const tipoIdentificacion = ref<'CC' | 'CE' | 'NIT' | 'PAS'>('CC');
    const numeroIdentificacion = ref('');
    const fechaFirma = ref('');
    const saveXml = ref(true);
    const claveFirma = ref('');
    const claveFirmaConfirm = ref('');

    // UI state
    const loading = ref(false);
    const errorMsg = ref('');
    const xmlText = ref('');
    const savedFilename = ref('');

    // Initialize form data from query params and localStorage
    onMounted(() => {
        // 1) Prefill el nombre del XML a firmar desde querystring.
        // Ejemplo: /firmas?solicitud_filename=SC-2025-000123-20251220-212641.xml
        const q = route.query || {};
        const qFilename = (q.solicitud_filename || q.filename || q.xml) as any;
        if (typeof qFilename === 'string' && qFilename.trim()) {
            solicitudFilename.value = qFilename.trim();
        }

        // 2) Prefill datos de firmante desde localStorage (si existen) y solo si los campos están vacíos.
        if (!process.client) return;
        try {
            const raw = localStorage.getItem(FIRMA_DEFAULTS_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return;

            if (!nombreApellidos.value.trim() && typeof parsed.nombre_apellidos === 'string') {
                nombreApellidos.value = parsed.nombre_apellidos;
            }
            if (!numeroIdentificacion.value.trim() && typeof parsed.numero_identificacion === 'string') {
                numeroIdentificacion.value = parsed.numero_identificacion;
            }
            if (typeof parsed.tipo_identificacion === 'string') {
                const t = parsed.tipo_identificacion.trim().toUpperCase();
                if (t === 'CC' || t === 'CE' || t === 'NIT' || t === 'PAS') {
                    tipoIdentificacion.value = t as any;
                }
            }
        } catch {
            // noop
        }
    });

    // Form validation
    const validateForm = () => {
        if (claveFirma.value.length < 10) {
            errorMsg.value = 'La clave de firma debe tener al menos 10 caracteres.';
            return false;
        }
        if (claveFirma.value !== claveFirmaConfirm.value) {
            errorMsg.value = 'La confirmación de la clave de firma no coincide.';
            return false;
        }
        return true;
    };

    // Reset form
    const resetForm = () => {
        solicitudFilename.value = 'solicitud-credito.xml';
        firmasFilename.value = '';
        rolFirmante.value = 'solicitante';
        aprobado.value = true;
        nombreApellidos.value = '';
        tipoIdentificacion.value = 'CC';
        numeroIdentificacion.value = '';
        fechaFirma.value = '';
        saveXml.value = true;
        claveFirma.value = '';
        claveFirmaConfirm.value = '';
        errorMsg.value = '';
        xmlText.value = '';
        savedFilename.value = '';
    };

    // Main signing function
    const firmar = async () => {
        loading.value = true;
        errorMsg.value = '';
        xmlText.value = '';
        savedFilename.value = '';

        if (!validateForm()) {
            loading.value = false;
            return;
        }

        try {
            const body: any = {
                solicitud_filename: solicitudFilename.value,
                firma: {
                    rol_firmante: rolFirmante.value,
                    aprobado: aprobado.value,
                    fecha_firma: fechaFirma.value || undefined,
                    firmante: {
                        nombre_apellidos: nombreApellidos.value,
                        tipo_identificacion: tipoIdentificacion.value,
                        numero_identificacion: numeroIdentificacion.value
                    }
                },
                clave_firma: claveFirma.value,
                save_xml: saveXml.value
            };

            if (firmasFilename.value.trim()) {
                body.firmas_filename = firmasFilename.value;
            }

            xmlText.value = await postJson<string>('/api/solicitud-credito/firmas', body, { auth: true });
        } catch (e: any) {
            errorMsg.value = e?.data?.error || e?.message || 'Error firmando';
        } finally {
            loading.value = false;
        }
    };

    return {
        // Form state
        solicitudFilename,
        firmasFilename,
        rolFirmante,
        aprobado,
        nombreApellidos,
        tipoIdentificacion,
        numeroIdentificacion,
        fechaFirma,
        saveXml,
        claveFirma,
        claveFirmaConfirm,

        // UI state
        loading,
        errorMsg,
        xmlText,
        savedFilename,

        // Actions
        firmar,
        resetForm,
        validateForm
    };
}
