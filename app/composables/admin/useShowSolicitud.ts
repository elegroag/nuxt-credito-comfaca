import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import type { SolicitudCredito } from '~/shared/types/solicitud-credito';

export function useShowSolicitud() {
    const route = useRoute();
    const router = useRouter();
    const { getJson } = useApi();
    const { ready } = useSession();

    const solicitudId = route.params.id as string;
    const solicitud = ref<SolicitudCredito | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    // Funciones de utilidad
    const fmtMoney = (value: number | undefined) => {
        if (!value) return '$0';
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const fmtDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const estadoBadgeClass = (estado: string) => {
        const classes: Record<string, string> = {
            'Postulado': 'bg-gray-100 text-gray-700',
            'Documentos cargados': 'bg-yellow-100 text-yellow-700',
            'Firmado': 'bg-green-100 text-green-700',
            'Aprobado': 'bg-emerald-100 text-emerald-700',
            'Rechazado': 'bg-red-100 text-red-700'
        };
        return classes[estado] || 'bg-gray-100 text-gray-700';
    };

    const estadoProgressPercent = (estado: string) => {
        const estados = [
            'Postulado',
            'Documentos cargados',
            'Firmado',
            'Aprobado',
        ];
        const index = estados.indexOf(estado);
        return index >= 0 ? ((index + 1) / estados.length) * 100 : 0;
    };

    const getTipoIdentificacion = (tipo: string | undefined) => {
        const tipos: Record<string, string> = {
            '1': 'Cédula de Ciudadanía',
            '2': 'Cédula de Extranjería',
            '3': 'Tarjeta de Identidad',
            '4': 'Pasaporte',
        };
        return tipo ? tipos[tipo] || tipo : '';
    };

    const getCargoDescripcion = (cargo: string | undefined) => {
        const cargos: Record<string, string> = {
            '2519': 'Profesional',
            '2520': 'Técnico',
            '2521': 'Auxiliar',
            '2522': 'Operativo',
        };
        return cargo ? cargos[cargo] || cargo : '';
    };

    const getCiudadDescripcion = (ciudad: string | undefined) => {
        const ciudades: Record<string, string> = {
            '18001': 'Florencia - Caquetá',
            '73001': 'Bogotá D.C.',
            '76001': 'Cali - Valle del Cauca',
            '05001': 'Medellín - Antioquia',
            '11001': 'Bucaramanga - Santander',
            '13001': 'Cartagena - Bolívar',
            '20001': 'Valledupar - Cesar',
            '27001': 'Cúcuta - Norte de Santander',
            '41001': 'Neiva - Huila',
            '44001': 'Ibagué - Tolima',
            '47001': 'Villavicencio - Meta',
            '50001': 'Pasto - Nariño',
            '52001': 'Cúcuta - Norte de Santander',
            '54001': 'Armenia - Quindío',
            '66001': 'Pereira - Risaralda',
            '68001': 'Manizales - Caldas',
            '70001': 'Popayán - Cauca',
            '77001': 'Sincelejo - Sucre',
            '78001': 'Montería - Córdoba',
            '80001': 'Barranquilla - Atlántico',
            '85001': 'Santa Marta - Magdalena',
        };
        return ciudad ? ciudades[ciudad] || ciudad : '';
    };

    const getTipoVivienda = (tipo: string | undefined) => {
        const tipos: Record<string, string> = {
            propia: 'Propia',
            arrendada: 'Arrendada',
            familiar: 'Casa de familiar',
            otra: 'Otra',
        };
        return tipo ? tipos[tipo] || tipo : '';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Funciones de manejo de documentos
    const descargarDocumento = async (documento: any) => {
        try {
            const response = await getJson<{ url: string }>(`/api/documentos/${documento.id}/download`, { auth: true });
            if (response.url) {
                window.open(response.url, '_blank');
            }
        } catch (error) {
            console.error('Error al descargar documento:', error);
        }
    };

    const vistaPreviaDocumento = async (documento: any) => {
        try {
            const response = await getJson<{ url: string }>(`/api/documentos/${documento.id}/preview`, { auth: true });
            if (response.url) {
                window.open(response.url, '_blank');
            }
        } catch (error) {
            console.error('Error al vista previa documento:', error);
        }
    };

    // Función principal de carga
    const cargarSolicitud = async () => {
        loading.value = true;
        error.value = null;
        try {
            await ready;
            const response = await getJson<{
                success: boolean;
                data: SolicitudCredito;
            }>(`/api/solicitudes-credito/${solicitudId}`, { auth: true });
            solicitud.value = response.data;
        } catch (e: any) {
            console.error(e);
            error.value = e.message || 'No se pudo cargar la información de la solicitud.';
        } finally {
            loading.value = false;
        }
    };

    // Navegación
    const goBack = () => {
        router.back();
    };

    const goToEdit = () => {
        router.push(`/admin/solicitudes/edit/${solicitudId}`);
    };

    // Cargar datos al montar
    onMounted(() => {
        cargarSolicitud();
    });

    return {
        // Estado
        solicitud,
        loading,
        error,
        solicitudId,

        // Funciones de utilidad
        fmtMoney,
        fmtDate,
        estadoBadgeClass,
        estadoProgressPercent,
        getTipoIdentificacion,
        getCargoDescripcion,
        getCiudadDescripcion,
        getTipoVivienda,
        formatFileSize,

        // Funciones de documentos
        descargarDocumento,
        vistaPreviaDocumento,

        // Funciones de navegación
        goBack,
        goToEdit,

        // Función principal
        cargarSolicitud,
    };
}
