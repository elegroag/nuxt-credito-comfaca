// frontend/composables/inicio/useInicio.ts
import { ref, computed, onMounted } from 'vue';
import { useSession } from '~/composables/useSession';
import { useApi } from '~/composables/useApi';

export function useInicio() {
    const { session, authHeader } = useSession();
    const { getJson } = useApi();

    // Estado de solicitudes
    const solicitudes = ref<any[]>([]);
    const loadingSolicitudes = ref(false);
    const solicitudesError = ref('');

    // Flujo de aprobación
    const flujoAprobacion = ['Postulado', 'En validación', 'Aprobado', 'Desembolsado', 'Activo', 'Finalizado'] as const;

    // Utilidades de formateo
    const fmtMoney = (value: unknown) => {
        const n = typeof value === 'number' ? value : Number(value);
        const v = Number.isFinite(n) ? n : 0;
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
    };

    const fmtDate = (value: unknown) => {
        if (typeof value !== 'string' || !value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
    };

    // Funciones de utilidad para estados
    const _normalizeEstado = (estado: string) => {
        return (estado || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    const _estadoIndex = (estado: string) => {
        const s = _normalizeEstado(estado);
        return flujoAprobacion.findIndex((e) => _normalizeEstado(e) === s);
    };

    // Funciones de estado
    const estadoProgressPercent = (estado: string) => {
        const idx = _estadoIndex(estado);
        if (idx < 0) return 0;
        if (flujoAprobacion.length <= 1) return 0;
        return Math.round((idx / (flujoAprobacion.length - 1)) * 100);
    };

    const estadoProgressClass = (estado: string) => {
        const idx = _estadoIndex(estado);
        if (idx < 0) return 'bg-zinc-300';
        if (idx <= 1) return 'bg-amber-500';
        if (idx === flujoAprobacion.length - 1) return 'bg-zinc-500';
        return 'bg-emerald-500';
    };

    const estadoBadgeClass = (estado: string) => {
        const s = _normalizeEstado(estado);
        if (s === 'aprobado' || s === 'activo' || s === 'desembolsado') return 'bg-emerald-50 text-emerald-800';
        if (s === 'en validacion' || s === 'postulado') return 'bg-amber-50 text-amber-800';
        if (s === 'finalizado') return 'bg-zinc-100 text-zinc-800';
        if (s === 'desiste') return 'bg-red-50 text-red-800';
        return 'bg-zinc-100 text-zinc-800';
    };

    // Computed properties
    const ultimaSolicitud = computed(() => (solicitudes.value.length ? solicitudes.value[0] : null));

    const estadoIndexUltima = computed(() => {
        const s = ultimaSolicitud.value;
        if (!s) return -1;
        return _estadoIndex(String(s.estado || ''));
    });

    // Cargar solicitudes
    const cargarSolicitudes = async () => {
        if (!process.client) return;
        loadingSolicitudes.value = true;
        solicitudesError.value = '';
        try {
            const data = await getJson<any>('/api/solicitudes-credito', { auth: true });
            solicitudes.value = Array.isArray(data?.items) ? data.items : [];
        } catch (e: any) {
            solicitudes.value = [];
            solicitudesError.value = e?.message || 'No fue posible cargar las solicitudes';
        } finally {
            loadingSolicitudes.value = false;
        }
    };

    // Resetear estado
    const resetSolicitudes = () => {
        solicitudes.value = [];
        solicitudesError.value = '';
    };

    // Inicializar
    onMounted(async () => {
        await cargarSolicitudes();
    });

    return {
        // Estado
        solicitudes,
        loadingSolicitudes,
        solicitudesError,
        flujoAprobacion,

        // Utilidades
        fmtMoney,
        fmtDate,

        // Funciones de estado
        estadoProgressPercent,
        estadoProgressClass,
        estadoBadgeClass,

        // Computed
        ultimaSolicitud,
        estadoIndexUltima,

        // Acciones
        cargarSolicitudes,
        resetSolicitudes
    };
}
