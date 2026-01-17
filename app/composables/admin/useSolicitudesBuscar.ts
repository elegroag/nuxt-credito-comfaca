/**
 * Composable para la página de búsqueda de solicitudes.
 * Encapsula la lógica de filtros y estado de carga.
 */

import type {
    FiltrosSolicitudes,
    OpcionesFiltro,
    SolicitudAdmin
} from '~/shared/types/admin-solicitudes'

type FiltrosSolicitudesReadonly = Omit<FiltrosSolicitudes, 'estados'> & {
    estados?: readonly string[]
}

interface UseSolicitudesBuscar {
    loading: Readonly<Ref<boolean>>
    filtrosActivos: Readonly<Ref<FiltrosSolicitudesReadonly>>
    tieneFiltrosActivos: ComputedRef<boolean>
    aplicarFiltros: (nuevosFiltros: Partial<FiltrosSolicitudes>) => void
    limpiarFiltros: () => void
}

export const useSolicitudesBuscar = (): UseSolicitudesBuscar => {

    const { getJson, postJson, putJson, deleteJson } = useApi()
    const loading = ref(false)
    // Filtros activos
    const filtrosActivos = ref<FiltrosSolicitudes>({
        skip: 0,
        limit: 20
    })

    // Opciones para filtros
    const opcionesFiltro = ref<OpcionesFiltro>({
        estados: [],
        usuarios: []
    })

    // Computed properties
    const tieneFiltrosActivos = computed(() => {
        const f = filtrosActivos.value
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
    const cargarSolicitudesFilter = async (): Promise<SolicitudAdmin[]> => {
        try {
            const payload = {
                ...filtrosActivos.value
            }
            const response = await postJson<any>(
                '/api/solicitudes-credito/filter',
                payload,
                { auth: true },
            )
            return handleApiResponse(response, [])
        } catch (err) {
            console.error('Error cargando todas las solicitudes:', err)
            throw new Error('Error al cargar todas las solicitudes')
        }
    }

    /**
     * Aplica filtros y recarga los datos
     */
    const aplicarFiltros = (nuevosFiltros: Partial<FiltrosSolicitudes>) => {
        filtrosActivos.value = { ...filtrosActivos.value, ...nuevosFiltros, skip: 0 }
        cargarSolicitudesFilter()
    }

    /**
     * Limpia todos los filtros
 */
    const limpiarFiltros = () => {
        filtrosActivos.value = {
            skip: 0,
            limit: 20
        }
        cargarSolicitudesFilter()
    }



    return {
        loading,
        filtrosActivos,
        tieneFiltrosActivos,
        aplicarFiltros,
        limpiarFiltros
    }
}
