// frontend/composables/xml/useXmlExtract.ts
import { ref, computed } from 'vue';
import { useSession } from '~/composables/useSession';
import { useApi } from '~/composables/useApi';

export function useXmlExtract() {
    const { authHeader } = useSession();
    const { postJson } = useApi();

    // Form state
    const filename = ref('solicitud-credito.xml');
    const validate = ref(true);

    // UI state
    const loading = ref(false);
    const errorMsg = ref('');
    const data = ref<any | null>(null);

    // Computed property for pretty JSON
    const pretty = computed(() => {
        if (!data.value) return '';
        return JSON.stringify(data.value, null, 2);
    });

    // Reset form
    const resetForm = () => {
        filename.value = 'solicitud-credito.xml';
        validate.value = true;
        errorMsg.value = '';
        data.value = null;
    };

    // Main extraction function
    const extraer = async () => {
        loading.value = true;
        errorMsg.value = '';
        data.value = null;

        try {
            data.value = await postJson<any>('/api/solicitud-credito/xml-extract', {
                filename: filename.value,
                validate: validate.value
            }, { auth: true });
        } catch (e: any) {
            errorMsg.value = e?.data?.error || e?.message || 'Error extrayendo XML';
        } finally {
            loading.value = false;
        }
    };

    return {
        // Form state
        filename,
        validate,

        // UI state
        loading,
        errorMsg,
        data,

        // Computed
        pretty,

        // Actions
        extraer,
        resetForm
    };
}
