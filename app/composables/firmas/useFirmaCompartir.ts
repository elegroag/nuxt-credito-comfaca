// frontend/composables/firmas/useFirmaShare.ts
import { ref, computed, onMounted } from 'vue';
import { useSession } from '~/composables/useSession';
import QRCode from 'qrcode';

export function useFirmaCompartir() {
    const { authHeader } = useSession();

    // File search state
    const query = ref('');
    const files = ref<string[]>([]);

    // Form state
    const solicitudFilename = ref('');
    const firmasFilename = ref('');

    // UI state
    const loading = ref(false);
    const errorMsg = ref('');

    // Share state
    const token = ref('');
    const expiresAt = ref('');
    const shareUrl = ref('');
    const qrDataUrl = ref('');

    // Computed properties
    const sharePath = computed(() => (token.value ? `/firmas-share/${token.value}` : ''));

    // File operations
    const fetchFiles = async (q: string) => {
        const url = q ? `/api/activos/xml?q=${encodeURIComponent(q)}` : '/api/activos/xml';
        const res = await fetch(url, {
            headers: {
                ...(authHeader.value as any)
            }
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.error || `Error HTTP ${res.status}`);
        }
        const data = await res.json();
        const arr = Array.isArray(data?.files) ? data.files : [];
        files.value = arr;
    };

    const buscar = async () => {
        try {
            await fetchFiles(query.value);
        } catch (e: any) {
            errorMsg.value = e?.message || 'Error listando XML';
        }
    };

    const selectSolicitud = (name: string) => {
        solicitudFilename.value = name;
    };

    // Generate share link
    const generarLink = async () => {
        loading.value = true;
        errorMsg.value = '';
        token.value = '';
        shareUrl.value = '';
        qrDataUrl.value = '';
        expiresAt.value = '';

        try {
            const body: any = {
                solicitud_filename: solicitudFilename.value
            };
            if (firmasFilename.value.trim()) {
                body.firmas_filename = firmasFilename.value;
            }

            const res = await fetch('/api/solicitud-credito/firmas/share', {
                method: 'POST',
                headers: { 'content-type': 'application/json', ...(authHeader.value as any) },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || `Error HTTP ${res.status}`);
            }

            const data = await res.json();
            token.value = String(data?.token || '');
            expiresAt.value = String(data?.expires_at || '');

            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            shareUrl.value = origin ? `${origin}${sharePath.value}` : sharePath.value;

            if (shareUrl.value) {
                qrDataUrl.value = await QRCode.toDataURL(shareUrl.value, { width: 256, margin: 1 });
            }
        } catch (e: any) {
            errorMsg.value = e?.message || 'Error generando link';
        } finally {
            loading.value = false;
        }
    };

    // Copy link to clipboard
    const copiarLink = async () => {
        try {
            if (!shareUrl.value) return;
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl.value);
            }
        } catch {
            // noop
        }
    };

    // Reset form
    const resetForm = () => {
        query.value = '';
        files.value = [];
        solicitudFilename.value = '';
        firmasFilename.value = '';
        errorMsg.value = '';
        token.value = '';
        expiresAt.value = '';
        shareUrl.value = '';
        qrDataUrl.value = '';
    };

    // Initialize on mount
    onMounted(async () => {
        try {
            await fetchFiles('');
        } catch {
            // noop
        }
    });

    return {
        // File search
        query,
        files,
        buscar,
        selectSolicitud,

        // Form state
        solicitudFilename,
        firmasFilename,

        // UI state
        loading,
        errorMsg,

        // Share state
        token,
        expiresAt,
        sharePath,
        shareUrl,
        qrDataUrl,

        // Actions
        generarLink,
        copiarLink,
        resetForm
    };
}
