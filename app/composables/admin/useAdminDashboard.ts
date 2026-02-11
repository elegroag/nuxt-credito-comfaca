import { ref, computed, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';

export interface AdminStats {
  totalSolicitudes: number;
  solicitudesActivas: number;
  conveniosActivos: number;
  trabajadoresRegistrados: number;
  solicitudesPendientesFirma: number;
  tasaAprobacion: number;
  montoTotalAprobado: number;
  solicitudesPorEstado: Array<{ estado: string; count: number; color: string }>;
  actividadReciente: Array<{ id: string; tipo: string; descripcion: string; fecha: string }>;
  usuariosPorRol: Array<{ rol: string; count: number }>;
  topEmpresas: Array<{ nombre: string; trabajadores: number; convenio: string }>;
}

export function useAdminDashboard() {
  const { authHeader } = useSession();
  const { getJson } = useApi();

  // Estado
  const loading = ref(false);
  const error = ref('');
  const stats = ref<AdminStats>({
    totalSolicitudes: 0,
    solicitudesActivas: 0,
    conveniosActivos: 0,
    trabajadoresRegistrados: 0,
    solicitudesPendientesFirma: 0,
    tasaAprobacion: 0,
    montoTotalAprobado: 0,
    solicitudesPorEstado: [],
    actividadReciente: [],
    usuariosPorRol: [],
    topEmpresas: []
  });

  // Última actualización
  const lastUpdated = ref<Date | null>(null);

  // Utilidades de formateo
  const fmtMoney = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const fmtPercent = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const fmtNumber = (value: number) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };

  const fmtDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  // Función para cargar estadísticas de usuarios
  const cargarEstadisticasUsuarios = async () => {
    try {
      type UsuariosStatsResponse = {
        data: {
          trabajadores?: number;
          usuariosPorRol?: Array<{ rol: string; count: number }>;
        };
      };

      const response = await getJson<UsuariosStatsResponse>('/api/admin/users/estadisticas', { auth: true });
      const data = response.data;

      stats.value.trabajadoresRegistrados = data?.trabajadores ?? 0;
      stats.value.usuariosPorRol = data?.usuariosPorRol ?? [];
    } catch (e: unknown) {
      console.error('Error cargando estadísticas de usuarios:', e);
    }
  };

  // Función para cargar estadísticas de convenios
  const cargarEstadisticasConvenios = async () => {
    try {
      const response = await getJson<{ data: unknown }>('/api/admin/empresas-convenios', { auth: true });
      void response;
    } catch (e: unknown) {
      console.error('Error cargando estadísticas de convenios:', e);
    }
  };

  // Función para cargar estadísticas de solicitudes
  const cargarEstadisticasSolicitudes = async () => {
    try {
      type DashboardResponse = {
        data: {
          solicitudes?: {
            total?: number;
            activas?: number;
            pendientesFirma?: number;
            tasaAprobacion?: number;
            montoTotalAprobado?: number;
            porEstado?: Array<{ estado: string; count: number; color: string }>;
          };
          convenios?: {
            activos?: number;
            topEmpresas?: Array<{ nombre: string; convenio: string; trabajadores: number }>;
          };
          usuarios?: {
            trabajadores?: number;
            porRol?: Array<{ rol: string; count: number }>;
          };
          actividadReciente?: Array<{ id: string; tipo: string; descripcion: string; fecha: string }>;
        };
      };

      const response = await getJson<DashboardResponse>('/api/admin/dashboard/estadisticas', { auth: true });
      const data = response.data;

      const solicitudes = data?.solicitudes;
      stats.value.totalSolicitudes = solicitudes?.total ?? 0;
      stats.value.solicitudesActivas = solicitudes?.activas ?? 0;
      stats.value.solicitudesPendientesFirma = solicitudes?.pendientesFirma ?? 0;
      stats.value.tasaAprobacion = solicitudes?.tasaAprobacion ?? 0;
      stats.value.montoTotalAprobado = solicitudes?.montoTotalAprobado ?? 0;
      stats.value.solicitudesPorEstado = solicitudes?.porEstado ?? [];

      const convenios = data?.convenios;
      stats.value.conveniosActivos = convenios?.activos ?? 0;
      stats.value.topEmpresas = convenios?.topEmpresas ?? [];

      const usuarios = data?.usuarios;
      if (usuarios) {
        stats.value.trabajadoresRegistrados = usuarios.trabajadores ?? stats.value.trabajadoresRegistrados;
        stats.value.usuariosPorRol = usuarios.porRol ?? stats.value.usuariosPorRol;
      }

      stats.value.actividadReciente = data?.actividadReciente ?? [];
    } catch (e: unknown) {
      console.error('Error cargando estadísticas de solicitudes:', e);
      throw e;
    }
  };

  // Función principal para cargar todas las estadísticas
  const cargarEstadisticas = async () => {
    if (loading.value) return;

    loading.value = true;
    error.value = '';

    try {
      await cargarEstadisticasSolicitudes();

      lastUpdated.value = new Date();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar las estadísticas';
      console.error('Error en cargarEstadisticas:', e);
    } finally {
      loading.value = false;
    }
  };

  // Refrescar estadísticas
  const refrescarEstadisticas = async () => {
    await cargarEstadisticas();
  };

  // Computed properties para facilitar el uso
  const tieneDatos = computed(() =>
    stats.value.totalSolicitudes > 0 ||
    stats.value.conveniosActivos > 0 ||
    stats.value.trabajadoresRegistrados > 0
  );

  const tiempoSinActualizar = computed(() => {
    if (!lastUpdated.value) return null;
    const ahora = new Date();
    const diffMinutos = Math.floor((ahora.getTime() - lastUpdated.value.getTime()) / (1000 * 60));

    if (diffMinutos < 1) return 'Actualizado ahora';
    if (diffMinutos < 60) return `Actualizado hace ${diffMinutos} min`;

    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) return `Actualizado hace ${diffHoras} h`;

    const diffDias = Math.floor(diffHoras / 24);
    return `Actualizado hace ${diffDias} días`;
  });

  // Inicializar
  onMounted(async () => {
    await cargarEstadisticas();
  });

  return {
    // Estado
    loading,
    error,
    stats,
    lastUpdated,
    tieneDatos,
    tiempoSinActualizar,

    // Utilidades
    fmtMoney,
    fmtPercent,
    fmtNumber,
    fmtDate,

    // Acciones
    cargarEstadisticas,
    refrescarEstadisticas
  };
}
