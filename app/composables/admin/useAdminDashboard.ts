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
      const response = await getJson<any>('/api/admin/users/estadisticas', { auth: true });
      const data = response.data;

      if (data) {
        stats.value.trabajadoresRegistrados = data.trabajadores || 0;
        stats.value.usuariosPorRol = data.usuariosPorRol || [];
      }
    } catch (e: any) {
      console.error('Error cargando estadísticas de usuarios:', e);
    }
  };

  // Función para cargar estadísticas de convenios
  const cargarEstadisticasConvenios = async () => {
    try {
      const response = await getJson<any>('/api/admin/empresas-convenios', { auth: true });
      const data = response.data;

      if (Array.isArray(data)) {
        stats.value.conveniosActivos = data.filter(c => c.activo).length;
        
        // Top empresas con más trabajadores
        stats.value.topEmpresas = data
          .filter(c => c.activo)
          .sort((a, b) => (b.trabajadores_count || 0) - (a.trabajadores_count || 0))
          .slice(0, 5)
          .map(c => ({
            nombre: c.nombre_empresa,
            trabajadores: c.trabajadores_count || 0,
            convenio: c.nombre_convenio
          }));
      }
    } catch (e: any) {
      console.error('Error cargando estadísticas de convenios:', e);
    }
  };

  // Función para cargar estadísticas de solicitudes
  const cargarEstadisticasSolicitudes = async () => {
    try {
      // Cargar todas las solicitudes
      const response = await getJson<any>('/api/solicitudes-credito/all', { auth: true });
      const solicitudes = Array.isArray(response.data) ? response.data : [];

      // Calcular estadísticas
      const total = solicitudes.length;
      const aprobadas = solicitudes.filter(s => s.estado === 'APROBADA').length;
      const activas = solicitudes.filter(s => 
        s.estado !== 'FINALIZADA' && s.estado !== 'DESISTE' && s.estado !== 'RECHAZADA'
      ).length;
      const pendientesFirma = solicitudes.filter(s => 
        s.estado === 'ENVIADO_FIRMA' || s.estado === 'FIRMA_PENDIENTE'
      ).length;

      // Monto total aprobado
      const montoAprobado = solicitudes
        .filter(s => s.estado === 'APROBADA' && s.monto_aprobado)
        .reduce((sum, s) => sum + Number(s.monto_aprobado), 0);

      // Distribución por estado
      const estadosMap = new Map<string, number>();
      solicitudes.forEach(s => {
        const estado = s.estado || 'SIN_ESTADO';
        estadosMap.set(estado, (estadosMap.get(estado) || 0) + 1);
      });

      const coloresPorEstado: Record<string, string> = {
        'POSTULADO': '#F59E0B',
        'ENVIADO_VALIDACION': '#3B82F6',
        'EN_VALIDACION': '#8B5CF6',
        'APROBADA': '#10B981',
        'ENVIADO_FIRMA': '#F97316',
        'FIRMA_PENDIENTE': '#F97316',
        'FIRMADA': '#06B6D4',
        'DESEMBOLSADA': '#84CC16',
        'FINALIZADA': '#6B7280',
        'RECHAZADA': '#EF4444',
        'DESISTE': '#EF4444'
      };

      const solicitudesPorEstado = Array.from(estadosMap.entries()).map(([estado, count]) => ({
        estado,
        count,
        color: coloresPorEstado[estado] || '#6B7280'
      }));

      // Actividad reciente (últimas 5 solicitudes)
      const actividadReciente = solicitudes
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(s => ({
          id: s.numero_solicitud,
          tipo: 'Solicitud',
          descripcion: `Solicitud ${s.numero_solicitud} - ${s.estado}`,
          fecha: s.created_at
        }));

      // Actualizar estadísticas
      stats.value.totalSolicitudes = total;
      stats.value.solicitudesActivas = activas;
      stats.value.solicitudesPendientesFirma = pendientesFirma;
      stats.value.tasaAprobacion = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
      stats.value.montoTotalAprobado = montoAprobado;
      stats.value.solicitudesPorEstado = solicitudesPorEstado;
      stats.value.actividadReciente = actividadReciente;

    } catch (e: any) {
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
      // Cargar en paralelo para mejor rendimiento
      await Promise.all([
        cargarEstadisticasUsuarios(),
        cargarEstadisticasConvenios(),
        cargarEstadisticasSolicitudes()
      ]);

      lastUpdated.value = new Date();
    } catch (e: any) {
      error.value = e?.message || 'Error al cargar las estadísticas';
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
