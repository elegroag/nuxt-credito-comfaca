// frontend/composables/entidad/useEntidadDigital.ts
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { navigateTo } from '#app';
import { useApi } from '~/composables/useApi';

export function useEntidadDigital() {
    const route = useRoute();
    const { postJson } = useApi();

    // Form state
    const tipoIdentificacion = ref<'CC' | 'CE' | 'NIT' | 'PAS'>('CC');
    const numeroIdentificacion = ref('');
    const clave = ref('');
    const claveConfirm = ref('');
    const overwrite = ref(false);

    // UI state
    const loading = ref(false);
    const errorMsg = ref('');
    const result = ref<any | null>(null);

    // Navigation state
    const redirectTo = ref('');

    // Initialize from query params
    onMounted(() => {
        const t = route.query.tipo_identificacion;
        const n = route.query.numero_identificacion;
        const r = route.query.redirect;

        if (typeof t === 'string' && (t === 'CC' || t === 'CE' || t === 'NIT' || t === 'PAS')) {
            tipoIdentificacion.value = t;
        }
        if (typeof n === 'string' && n.trim()) {
            numeroIdentificacion.value = n;
        }
        if (typeof r === 'string' && r.startsWith('/')) {
            redirectTo.value = r;
        }
    });

    // Form validation
    const validateForm = () => {
        if (!numeroIdentificacion.value.trim()) {
            errorMsg.value = 'El número de identificación es requerido.';
            return false;
        }

        if (clave.value.length < 10) {
            errorMsg.value = 'La clave debe tener al menos 10 caracteres.';
            return false;
        }

        if (clave.value !== claveConfirm.value) {
            errorMsg.value = 'La confirmación de clave no coincide.';
            return false;
        }

        return true;
    };

    // Reset form
    const resetForm = () => {
        tipoIdentificacion.value = 'CC';
        numeroIdentificacion.value = '';
        clave.value = '';
        claveConfirm.value = '';
        overwrite.value = false;
        errorMsg.value = '';
        result.value = null;
    };

    // Create digital entity
    const crear = async () => {
        errorMsg.value = '';
        result.value = null;

        if (!validateForm()) {
            return;
        }

        loading.value = true;
        try {
            result.value = await postJson<any>('/api/entidad-digital', {
                tipo_identificacion: tipoIdentificacion.value,
                numero_identificacion: numeroIdentificacion.value,
                clave: clave.value,
                overwrite: overwrite.value
            });

            if (redirectTo.value) {
                await navigateTo(redirectTo.value);
            }
        } catch (e: any) {
            errorMsg.value = e?.data?.error || e?.message || 'Error creando entidad digital';
        } finally {
            loading.value = false;
        }
    };

    return {
        // Form state
        tipoIdentificacion,
        numeroIdentificacion,
        clave,
        claveConfirm,
        overwrite,

        // UI state
        loading,
        errorMsg,
        result,

        // Navigation
        redirectTo,

        // Actions
        crear,
        resetForm,
        validateForm
    };
}
