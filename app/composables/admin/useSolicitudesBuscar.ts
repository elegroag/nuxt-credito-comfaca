/**
 * Composable para la página de búsqueda de solicitudes.
 * Encapsula la lógica de filtros y estado de carga.
 */

import type {
    FiltrosSolicitudes,
    OpcionesFiltro,
    SolicitudAdmin,
    UseSolicitudesBuscar
} from '~/shared/types/admin-solicitudes'

import { computed, onMounted, ref } from 'vue'

export const useSolicitudesBuscar = (props: { filtrosActivos: any }): UseSolicitudesBuscar => {
    const { postJson } = useApi()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const solicitudesCache = ref<SolicitudAdmin[]>([])
    const totalItems = ref(0)


    // Opciones para filtros
    const opcionesFiltro = ref<OpcionesFiltro>({
        estados: [],
        usuarios: []
    })

    // Computed properties
    const tieneFiltrosActivos = computed(() => {
        const f = props.filtrosActivos.value
        return !!(
            f.numero_documento ||
            f.nombre_usuario ||
            f.owner_username ||
            f.numero_solicitud ||
            (f.estados && f.estados.length > 0)
        )
    })

    /**
    * Maneja la respuesta del backend de forma estandarizada
    */
    const handleApiResponse = (response: any, defaultValue: any = null) => {
        if (response && response.success) {
            return response.data || defaultValue
        } else {
            throw new Error(response?.message || 'Error en la respuesta del servidor')
        }
    }


    /**
     * Carga todas las solicitudes sin paginación (para exportar, etc.)
     */
    const cargarSolicitudesFilter = async (): Promise<void> => {
        loading.value = true
        error.value = null
        try {
            const payload = {
                filters: props.filtrosActivos.value
            }
            const response = await postJson<any>(
                '/api/solicitudes-credito/filter',
                payload,
                { auth: true },
            )
            const data = handleApiResponse(response, [])
            solicitudesCache.value = Array.isArray(data) ? data : []
            totalItems.value = solicitudesCache.value.length
        } catch (err) {
            console.error('Error cargando todas las solicitudes:', err)
            error.value = 'Error al cargar las solicitudes'
            solicitudesCache.value = []
            totalItems.value = 0
        } finally {
            loading.value = false
        }
    }

    /**
     * Aplica filtros y recarga los datos
     */
    const aplicarFiltros = (nuevosFiltros: Partial<FiltrosSolicitudes>) => {
        props.filtrosActivos.value = { ...props.filtrosActivos.value, ...nuevosFiltros, skip: 0 }
        cargarSolicitudesFilter()
    }

    /**
     * Limpia todos los filtros
 */
    const limpiarFiltros = () => {
        props.filtrosActivos.value = {
            skip: 0,
            limit: 20
        }
        cargarSolicitudesFilter()
    }

    const solicitudes = computed(() => {
        return solicitudesCache.value
    })

    onMounted(() => {
        cargarSolicitudesFilter()
    })



    return {
        loading,
        error,
        solicitudes,
        totalItems,
        tieneFiltrosActivos,
        aplicarFiltros,
        limpiarFiltros
    }
}
