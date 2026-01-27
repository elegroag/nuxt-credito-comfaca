import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import type { SolicitudCredito, Firmante } from '~/shared/types/solicitud-credito';

interface EstadoSolicitud {
    id: string;
    nombre: string;
    descripcion: string;
    orden: number;
    color: string;
    activo: boolean;
}

interface AccionData {
    estado: string;
    descripcion?: string;
}

export function useAccionesSolicitud() {
    const route = useRoute();
    const router = useRouter();
    const { getJson, putJson, postJson } = useApi();
    const { ready } = useSession();

    const solicitudId = computed(() => route.params.id as string);
    const solicitud = ref<SolicitudCredito | null>(null);
    const estados = ref<EstadoSolicitud[]>([]);
    const loading = ref(true);
    const loadingEstados = ref(false);
    const loadingAccion = ref(false);
    const loadingFirmado = ref(false);
    const error = ref<string | null>(null);

    // Datos del formulario
    const estadoSeleccionado = ref<string>('');
    const notificacion = ref<string>('');

    // Gestión de firmantes
    const firmantes = ref<Firmante[]>([]);
    const nuevoFirmante = ref<Firmante>({
        nombre_completo: '',
        email: '',
        numero_documento: '',
        tipo_documento: 'CC',
        rol: 'Firmante',
        telefono: ''
    });

    // Cargar datos de la solicitud
    const cargarSolicitud = async () => {
        loading.value = true;
        error.value = null;
        try {
            await ready;
            const response = await getJson<{
                success: boolean;
                data: SolicitudCredito;
            }>(`/api/solicitudes-credito/${solicitudId.value}`, { auth: true });

            solicitud.value = response.data;
            estadoSeleccionado.value = response.data.estado;

            // Cargar firmantes si existen
            if (response.data.firmantes && Array.isArray(response.data.firmantes)) {
                firmantes.value = [...response.data.firmantes];
            } else {
                firmantes.value = [];
            }
        } catch (e: any) {
            console.error('Error al cargar solicitud:', e);
            error.value = e.message || 'No se pudo cargar la información de la solicitud.';
        } finally {
            loading.value = false;
        }
    };

    // Cargar estados disponibles
    const cargarEstados = async () => {
        loadingEstados.value = true;
        try {
            await ready;
            const response = await getJson<{
                success: boolean;
                data: EstadoSolicitud[];
            }>('/api/estados-solicitud', { auth: true });

            if (response.data && Array.isArray(response.data)) {
                estados.value = response.data.sort((a, b) => a.orden - b.orden);
            }
        } catch (e: any) {
            console.error('Error al cargar estados:', e);
            error.value = e.message || 'No se pudieron cargar los estados disponibles.';
        } finally {
            loadingEstados.value = false;
        }
    };

    // Registrar acción y cambiar estado
    const registrarAccion = async () => {
        if (!estadoSeleccionado.value) {
            return {
                success: false,
                message: 'Debe seleccionar un estado'
            };
        }

        loadingAccion.value = true;
        try {
            await ready;

            const accionData: AccionData = {
                estado: estadoSeleccionado.value,
                descripcion: notificacion.value || undefined
            };

            const response = await putJson<{
                success: boolean;
                data: SolicitudCredito;
                message: string;
            }>(`/api/solicitudes-credito/${solicitudId.value}/estado`, accionData, { auth: true });

            if (response.success) {
                // Actualizar datos locales
                await cargarSolicitud();

                return {
                    success: true,
                    message: response.message || 'Estado actualizado exitosamente'
                };
            } else {
                throw new Error(response.message || 'Error al actualizar estado');
            }
        } catch (e: any) {
            console.error('Error al registrar acción:', e);
            return {
                success: false,
                message: e.message || 'Error al registrar la acción'
            };
        } finally {
            loadingAccion.value = false;
        }
    };

    // Estado actual formateado
    const estadoActualInfo = computed(() => {
        if (!solicitud.value || !estados.value.length) return null;

        return estados.value.find(e => e.id === solicitud.value?.estado);
    });

    // Validar si el estado seleccionado es diferente al actual
    const estadoCambiado = computed(() => {
        return solicitud.value && estadoSeleccionado.value !== solicitud.value.estado;
    });

    // Obtener nombre del estado
    const getNombreEstado = (estadoId: string): string => {
        const estado = estados.value.find(e => e.id === estadoId);
        return estado?.nombre || estadoId;
    };

    // Gestión de firmantes
    const agregarFirmante = () => {
        if (!nuevoFirmante.value.nombre_completo ||
            !nuevoFirmante.value.email ||
            !nuevoFirmante.value.numero_documento) {
            return {
                success: false,
                message: 'Debe completar todos los campos requeridos del firmante'
            };
        }

        firmantes.value.push({ ...nuevoFirmante.value });

        // Resetear formulario
        nuevoFirmante.value = {
            nombre_completo: '',
            email: '',
            numero_documento: '',
            tipo_documento: 'CC',
            rol: 'Firmante',
            telefono: ''
        };

        return { success: true, message: 'Firmante agregado exitosamente' };
    };

    const eliminarFirmante = (index: number) => {
        firmantes.value.splice(index, 1);
    };

    // Iniciar proceso de firmado
    const iniciarProcesoDeFirmado = async () => {
        if (firmantes.value.length === 0) {
            return {
                success: false,
                message: 'Debe tener al menos un firmante para iniciar el proceso'
            };
        }

        loadingFirmado.value = true;
        try {
            await ready;

            const response = await postJson<{
                success: boolean;
                message: string;
                data?: any;
            }>(`/api/solicitudes/${solicitudId.value}/iniciar-firmado`, {}, { auth: true });

            if (response.success) {
                await cargarSolicitud();
                return {
                    success: true,
                    message: response.message || 'Documento enviado para firma digital exitosamente'
                };
            } else {
                throw new Error(response.message || 'Error al iniciar proceso de firmado');
            }
        } catch (e: any) {
            console.error('Error al iniciar proceso de firmado:', e);
            return {
                success: false,
                message: e.message || 'Error al iniciar el proceso de firmado'
            };
        } finally {
            loadingFirmado.value = false;
        }
    };

    // Navegación
    const volverADetalle = () => {
        router.push(`/admin/solicitudes/show/${solicitudId.value}`);
    };

    const volverAListado = () => {
        router.push('/admin/solicitudes');
    };

    // Cargar datos al montar
    onMounted(async () => {
        await cargarEstados();
        await cargarSolicitud();
    });

    return {
        // Estado
        solicitud,
        solicitudId,
        estados,
        loading,
        loadingEstados,
        loadingAccion,
        loadingFirmado,
        error,

        // Formulario
        estadoSeleccionado,
        notificacion,

        // Firmantes
        firmantes,
        nuevoFirmante,

        // Computadas
        estadoActualInfo,
        estadoCambiado,

        // Funciones
        cargarSolicitud,
        cargarEstados,
        registrarAccion,
        getNombreEstado,
        volverADetalle,
        volverAListado,

        // Funciones de firmantes
        agregarFirmante,
        eliminarFirmante,
        iniciarProcesoDeFirmado,
    };
}
