// frontend/composables/inicio/useInicio.ts
import { ref, computed, onMounted } from 'vue';
import { useSession } from '~/composables/useSession';
import { useApi } from '~/composables/useApi';
import type { SolicitudResumen, EstadoSolicitud, EstadoSolicitudData } from '~/shared/types/inicio';

export function useInicio() {
    const { session, authHeader } = useSession();
    const { getJson } = useApi();

    // Estado de solicitudes
    const solicitudes = ref<SolicitudResumen[]>([]);
    const loadingSolicitudes = ref(false);
    const solicitudesError = ref('');

    // Flujo de aprobación (se cargará dinámicamente desde la API)
    const flujoAprobacion = ref<EstadoSolicitud[]>([]);
    const estadosData = ref<EstadoSolicitudData[]>([]);
    const loadingEstados = ref(false);
    const estadosError = ref('');

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
        return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(d);
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
        return flujoAprobacion.value.findIndex((e: EstadoSolicitud) => _normalizeEstado(e) === s);
    };

    // Funciones para obtener información de estados
    const getEstadoData = (idEstado: string): EstadoSolicitudData | undefined => {
        return estadosData.value.find(estado =>
            estado.id === idEstado // Cambiado de nombre a id
        );
    };

    const getEstadoColor = (nombreEstado: string): string => {
        const estadoData = getEstadoData(nombreEstado);
        return estadoData?.color || '#6B7280';
    };

    // Funciones de estado
    const estadoProgressPercent = (estado: string) => {
        const idx = _estadoIndex(estado);
        if (idx < 0) return 0;
        if (flujoAprobacion.value.length <= 1) return 0;
        return Math.round((idx / (flujoAprobacion.value.length - 1)) * 100);
    };

    const estadoProgressClass = (estado: string) => {
        const idx = _estadoIndex(estado);
        if (idx < 0) return 'bg-zinc-300';
        if (idx <= 1) return 'bg-amber-500';
        if (idx === flujoAprobacion.value.length - 1) return 'bg-zinc-500';
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

    // Cargar estados de solicitud desde la API
    const cargarEstados = async () => {
        if (!process.client) return;
        loadingEstados.value = true;
        estadosError.value = '';
        try {
            const response = await getJson<{ data: EstadoSolicitudData[] }>('/api/estados-solicitud', { auth: true });
            const data = response.data;
            if (Array.isArray(data)) {
                // Ordenar por campo 'orden' y extraer los IDs (no los nombres)
                const estadosOrdenados = data
                    .filter(estado => estado.activo)
                    .sort((a, b) => a.orden - b.orden)
                    .map(estado => estado.id); // Cambiado de nombre a id

                estadosData.value = data;
                flujoAprobacion.value = estadosOrdenados;
            }
        } catch (e: any) {
            estadosError.value = e?.message || 'No fue posible cargar los estados de solicitud';
            // Mantener los valores por defecto si falla la carga
        } finally {
            loadingEstados.value = false;
        }
    };

    // Cargar solicitudes
    const cargarSolicitudes = async () => {
        if (!process.client) return;
        loadingSolicitudes.value = true;
        solicitudesError.value = '';
        try {
            const response = await getJson<any>('/api/solicitudes-credito/all-user', { auth: true });
            const data = response.data;
            solicitudes.value = Array.isArray(data) ? data : [];
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
        await cargarEstados();
        await cargarSolicitudes();
    });

    return {
        // Estado
        solicitudes,
        loadingSolicitudes,
        solicitudesError,
        flujoAprobacion,
        estadosData,
        loadingEstados,
        estadosError,

        // Utilidades
        fmtMoney,
        fmtDate,

        // Funciones de estado
        estadoProgressPercent,
        estadoProgressClass,
        estadoBadgeClass,
        getEstadoData,
        getEstadoColor,

        // Computed
        ultimaSolicitud,
        estadoIndexUltima,

        // Acciones
        cargarEstados,
        cargarSolicitudes,
        resetSolicitudes
    };
}
