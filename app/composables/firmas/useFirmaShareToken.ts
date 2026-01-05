// frontend/composables/firmas/useFirmaShareToken.ts
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import type { RolFirmante, TipoIdentificacionFirma, FirmaShareTokenInfo, FirmaRequestPayload } from '~/shared/types/firmas';

export function useFirmaShareToken() {
    const route = useRoute();
    const { getJson, postJson } = useApi();
    const token = computed(() => String(route.params.token || ''));

    // Token state
    const tokenInfo = ref<FirmaShareTokenInfo | null>(null);
    const tokenError = ref('');

    // Form state
    const rolFirmante = ref<RolFirmante>('solicitante');
    const aprobado = ref(true);
    const nombreApellidos = ref('');
    const tipoIdentificacion = ref<TipoIdentificacionFirma>('CC');
    const numeroIdentificacion = ref('');
    const claveFirma = ref('');
    const claveFirmaConfirm = ref('');

    // Identity verification state
    const identityChecked = ref(false);
    const identityExists = ref(false);

    // UI state
    const loading = ref(false);
    const errorMsg = ref('');
    const xmlText = ref('');
    const savedFilename = ref('');

    // Computed properties
    const crearIdentidadLink = computed(() => {
        const redirect = encodeURIComponent(`/firmas-share/${token.value}`);
        const tipo = encodeURIComponent(tipoIdentificacion.value);
        const num = encodeURIComponent(numeroIdentificacion.value);
        return `/entidad-digital?tipo_identificacion=${tipo}&numero_identificacion=${num}&redirect=${redirect}`;
    });

    const canSign = computed(() => {
        if (!token.value) return false;
        if (!numeroIdentificacion.value.trim()) return false;
        if (claveFirma.value.length < 10) return false;
        if (claveFirma.value !== claveFirmaConfirm.value) return false;
        if (identityChecked.value && !identityExists.value) return false;
        return true;
    });

    // Load token information
    const cargarToken = async () => {
        tokenError.value = '';
        tokenInfo.value = null;

        tokenInfo.value = await getJson<FirmaShareTokenInfo>(`/api/solicitud-credito/firmas/share/${encodeURIComponent(token.value)}`);
    };

    // Verify digital identity
    const verificarIdentidad = async () => {
        identityChecked.value = false;
        identityExists.value = false;

        const t = tipoIdentificacion.value;
        const n = numeroIdentificacion.value.trim();
        if (!t || !n) {
            return;
        }

        try {
            const url = `/api/entidad-digital/exists?tipo_identificacion=${encodeURIComponent(t)}&numero_identificacion=${encodeURIComponent(n)}`;
            const data = await getJson<any>(url);
            identityExists.value = Boolean(data?.exists);
            identityChecked.value = true;
        } catch {
            identityExists.value = false;
            identityChecked.value = true;
        }
    };

    // Sign document
    const firmar = async () => {
        loading.value = true;
        errorMsg.value = '';
        xmlText.value = '';
        savedFilename.value = '';

        try {
            await verificarIdentidad();
            if (identityChecked.value && !identityExists.value) {
                throw new Error('Debes crear tu identidad digital antes de firmar.');
            }

            const body: FirmaRequestPayload = {
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
            };

            xmlText.value = await postJson<string>(`/api/solicitud-credito/firmas/share/${encodeURIComponent(token.value)}/firmar`, body as any);
        } catch (e: any) {
            errorMsg.value = e?.message || 'Error firmando';
        } finally {
            loading.value = false;
        }
    };

    // Reset form
    const resetForm = () => {
        rolFirmante.value = 'solicitante';
        aprobado.value = true;
        nombreApellidos.value = '';
        tipoIdentificacion.value = 'CC';
        numeroIdentificacion.value = '';
        claveFirma.value = '';
        claveFirmaConfirm.value = '';
        identityChecked.value = false;
        identityExists.value = false;
        errorMsg.value = '';
        xmlText.value = '';
        savedFilename.value = '';
    };

    // Initialize on mount
    onMounted(async () => {
        try {
            await cargarToken();
        } catch (e: any) {
            tokenError.value = e?.message || 'No fue posible cargar el token';
        }
    });

    return {
        // Token
        token,
        tokenInfo,
        tokenError,
        cargarToken,

        // Form state
        rolFirmante,
        aprobado,
        nombreApellidos,
        tipoIdentificacion,
        numeroIdentificacion,
        claveFirma,
        claveFirmaConfirm,

        // Identity verification
        identityChecked,
        identityExists,
        verificarIdentidad,
        crearIdentidadLink,

        // UI state
        loading,
        errorMsg,
        xmlText,
        savedFilename,

        // Computed
        canSign,

        // Actions
        firmar,
        resetForm
    };
}
