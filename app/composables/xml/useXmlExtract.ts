// frontend/composables/xml/useXmlExtract.ts
import { ref, computed } from 'vue';
import { useSession } from '~/composables/useSession';

export function useXmlExtract() {
    const { authHeader } = useSession();

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
            const res = await fetch('/api/solicitud-credito/xml-extract', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    ...(authHeader.value as any)
                },
                body: JSON.stringify({
                    filename: filename.value,
                    validate: validate.value
                })
            });

            if (!res.ok) {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const body = await res.json().catch(() => null);
                    throw new Error(body?.error || `Error HTTP ${res.status}`);
                }
                const text = await res.text().catch(() => '');
                throw new Error(text || `Error HTTP ${res.status}`);
            }

            data.value = await res.json();
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
