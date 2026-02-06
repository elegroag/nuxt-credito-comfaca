import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useMonitoreoFirmasRealTime } from '~/composables/admin/useMonitoreoFirmasRealTime';

// Mock de useApi
const mockGetJson = vi.fn();
const mockUseApi = vi.fn(() => ({
    getJson: mockGetJson
}));

// Mock de useSession
const mockUseSession = vi.fn(() => ({
    ready: Promise.resolve()
}));

// Mock de useRouter
const mockPush = vi.fn();
const mockUseRouter = vi.fn(() => ({
    push: mockPush
}));

vi.mock('~/composables/useApi', () => ({
    useApi: mockUseApi
}));

vi.mock('~/composables/useSession', () => ({
    useSession: mockUseSession
}));

vi.mock('vue-router', () => ({
    useRouter: mockUseRouter
}));

describe('useMonitoreoFirmasRealTime', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Inicialización', () => {
        it('debe inicializar con valores por defecto', () => {
            const {
                solicitudes,
                loading,
                error,
                totalSolicitudes,
                currentPage,
                estadoFiltro,
                pollingEnabled
            } = useMonitoreoFirmasRealTime();

            expect(solicitudes.value).toEqual([]);
            expect(loading.value).toBe(false);
            expect(error.value).toBeNull();
            expect(totalSolicitudes.value).toBe(0);
            expect(currentPage.value).toBe(1);
            expect(estadoFiltro.value).toBe('PENDIENTE_FIRMADO');
            expect(pollingEnabled.value).toBe(true);
        });

        it('debe tener estados disponibles correctos', () => {
            const { estadosDisponibles } = useMonitoreoFirmasRealTime();

            expect(estadosDisponibles.value).toHaveLength(6);
            expect(estadosDisponibles.value[0]).toEqual({
                value: 'PENDIENTE_FIRMADO',
                label: 'Pendiente de Firmar',
                icon: 'lucide:clock',
                color: 'yellow'
            });
        });
    });

    describe('cargarSolicitudes', () => {
        it('debe cargar solicitudes exitosamente', async () => {
            const mockResponse = {
                success: true,
                data: {
                    solicitudes: [
                        {
                            numero_solicitud: 'SOL-001',
                            solicitante: { nombres_apellidos: 'Juan Pérez' },
                            proceso_firmado: {
                                transaccion_id: 'TXN-001',
                                estado: 'PENDIENTE_FIRMADO',
                                firmantes_completados: 0,
                                firmantes_pendientes: 2
                            }
                        }
                    ],
                    total: 1
                },
                message: 'OK'
            };

            mockGetJson.mockResolvedValueOnce(mockResponse);

            const { cargarSolicitudes, solicitudes, totalSolicitudes, loading } = useMonitoreoFirmasRealTime();

            expect(loading.value).toBe(false);
            await cargarSolicitudes();

            expect(mockGetJson).toHaveBeenCalledWith(
                '/api/solicitudes-credito/paginado/20/0/PENDIENTE_FIRMADO',
                { auth: true }
            );
            expect(solicitudes.value).toHaveLength(1);
            expect(solicitudes.value[0].numero_solicitud).toBe('SOL-001');
            expect(totalSolicitudes.value).toBe(1);
            expect(loading.value).toBe(false);
        });

        it('debe filtrar solicitudes sin proceso_firmado', async () => {
            const mockResponse = {
                success: true,
                data: {
                    solicitudes: [
                        {
                            numero_solicitud: 'SOL-001',
                            proceso_firmado: {
                                transaccion_id: 'TXN-001',
                                estado: 'FIRMADO'
                            }
                        },
                        {
                            numero_solicitud: 'SOL-002',
                            proceso_firmado: null
                        },
                        {
                            numero_solicitud: 'SOL-003'
                        }
                    ],
                    total: 3
                },
                message: 'OK'
            };

            mockGetJson.mockResolvedValueOnce(mockResponse);

            const { cargarSolicitudes, solicitudes } = useMonitoreoFirmasRealTime();
            await cargarSolicitudes();

            expect(solicitudes.value).toHaveLength(1);
            expect(solicitudes.value[0].numero_solicitud).toBe('SOL-001');
        });

        it('debe manejar errores al cargar solicitudes', async () => {
            mockGetJson.mockRejectedValueOnce(new Error('Error de red'));

            const { cargarSolicitudes, error, solicitudes } = useMonitoreoFirmasRealTime();
            await cargarSolicitudes();

            expect(error.value).toBe('Error de red');
            expect(solicitudes.value).toEqual([]);
        });

        it('debe cargar en modo silencioso sin mostrar loading', async () => {
            const mockResponse = {
                success: true,
                data: { solicitudes: [], total: 0 },
                message: 'OK'
            };

            mockGetJson.mockResolvedValueOnce(mockResponse);

            const { cargarSolicitudes, loading } = useMonitoreoFirmasRealTime();
            
            const loadingPromise = cargarSolicitudes(true);
            expect(loading.value).toBe(false);
            await loadingPromise;
            expect(loading.value).toBe(false);
        });
    });

    describe('Estadísticas', () => {
        it('debe calcular estadísticas correctamente', async () => {
            const mockResponse = {
                success: true,
                data: {
                    solicitudes: [
                        {
                            numero_solicitud: 'SOL-001',
                            proceso_firmado: {
                                transaccion_id: 'TXN-001',
                                estado: 'PENDIENTE_FIRMADO'
                            }
                        },
                        {
                            numero_solicitud: 'SOL-002',
                            proceso_firmado: {
                                transaccion_id: 'TXN-002',
                                estado: 'FIRMADO'
                            }
                        },
                        {
                            numero_solicitud: 'SOL-003',
                            proceso_firmado: {
                                transaccion_id: 'TXN-003',
                                estado: 'FIRMADO'
                            }
                        },
                        {
                            numero_solicitud: 'SOL-004',
                            proceso_firmado: {
                                transaccion_id: 'TXN-004',
                                estado: 'RECHAZADO'
                            }
                        }
                    ],
                    total: 4
                },
                message: 'OK'
            };

            mockGetJson.mockResolvedValueOnce(mockResponse);

            const { cargarSolicitudes, estadisticas } = useMonitoreoFirmasRealTime();
            await cargarSolicitudes();

            expect(estadisticas.value.total).toBe(4);
            expect(estadisticas.value.pendientes).toBe(1);
            expect(estadisticas.value.firmados).toBe(2);
            expect(estadisticas.value.rechazados).toBe(1);
            expect(estadisticas.value.expirados).toBe(0);
            expect(estadisticas.value.porcentajeCompletado).toBe(50);
        });

        it('debe calcular porcentaje 0 cuando no hay solicitudes', () => {
            const { estadisticas } = useMonitoreoFirmasRealTime();

            expect(estadisticas.value.porcentajeCompletado).toBe(0);
        });
    });

    describe('Detección de cambios', () => {
        it('debe detectar cambios de estado', async () => {
            const mockResponse1 = {
                success: true,
                data: {
                    solicitudes: [
                        {
                            numero_solicitud: 'SOL-001',
                            solicitante: { nombres_apellidos: 'Juan Pérez' },
                            proceso_firmado: {
                                transaccion_id: 'TXN-001',
                                estado: 'PENDIENTE_FIRMADO'
                            }
                        }
                    ],
                    total: 1
                },
                message: 'OK'
            };

            const mockResponse2 = {
                success: true,
                data: {
                    solicitudes: [
                        {
                            numero_solicitud: 'SOL-001',
                            solicitante: { nombres_apellidos: 'Juan Pérez' },
                            proceso_firmado: {
                                transaccion_id: 'TXN-001',
                                estado: 'FIRMADO'
                            }
                        }
                    ],
                    total: 1
                },
                message: 'OK'
            };

            mockGetJson.mockResolvedValueOnce(mockResponse1);

            const { cargarSolicitudes, cambiosRecientes } = useMonitoreoFirmasRealTime();
            await cargarSolicitudes();

            expect(cambiosRecientes.value).toHaveLength(0);

            mockGetJson.mockResolvedValueOnce(mockResponse2);
            await cargarSolicitudes();

            expect(cambiosRecientes.value).toHaveLength(1);
            expect(cambiosRecientes.value[0]).toMatchObject({
                solicitudId: 'SOL-001',
                nombreSolicitante: 'Juan Pérez',
                estadoAnterior: 'PENDIENTE_FIRMADO',
                estadoNuevo: 'FIRMADO'
            });
        });

        it('debe mantener solo los últimos 10 cambios', async () => {
            const { cambiosRecientes } = useMonitoreoFirmasRealTime();

            // Simular 15 cambios
            for (let i = 0; i < 15; i++) {
                const mockResponse = {
                    success: true,
                    data: {
                        solicitudes: [
                            {
                                numero_solicitud: `SOL-${i}`,
                                solicitante: { nombres_apellidos: `Usuario ${i}` },
                                proceso_firmado: {
                                    transaccion_id: `TXN-${i}`,
                                    estado: i % 2 === 0 ? 'PENDIENTE_FIRMADO' : 'FIRMADO'
                                }
                            }
                        ],
                        total: 1
                    },
                    message: 'OK'
                };

                mockGetJson.mockResolvedValueOnce(mockResponse);
                await useMonitoreoFirmasRealTime().cargarSolicitudes();
            }

            expect(cambiosRecientes.value.length).toBeLessThanOrEqual(10);
        });
    });

    describe('Polling', () => {
        it('debe iniciar polling automático', () => {
            const { iniciarPolling, pollingEnabled } = useMonitoreoFirmasRealTime();

            iniciarPolling();

            expect(pollingEnabled.value).toBe(true);
        });

        it('debe detener polling', () => {
            const { iniciarPolling, detenerPolling, pollingEnabled } = useMonitoreoFirmasRealTime();

            iniciarPolling();
            expect(pollingEnabled.value).toBe(true);

            detenerPolling();
            expect(pollingEnabled.value).toBe(false);
        });

        it('debe hacer toggle de polling', () => {
            const { togglePolling, pollingEnabled } = useMonitoreoFirmasRealTime();

            const estadoInicial = pollingEnabled.value;
            togglePolling();
            expect(pollingEnabled.value).toBe(!estadoInicial);

            togglePolling();
            expect(pollingEnabled.value).toBe(estadoInicial);
        });
    });

    describe('Paginación', () => {
        it('debe cambiar de página correctamente', async () => {
            mockGetJson.mockResolvedValue({
                success: true,
                data: { solicitudes: [], total: 100 },
                message: 'OK'
            });

            const { siguientePagina, currentPage, cargarSolicitudes } = useMonitoreoFirmasRealTime();
            
            await cargarSolicitudes();
            expect(currentPage.value).toBe(1);

            siguientePagina();
            expect(currentPage.value).toBe(2);
        });

        it('debe calcular totalPages correctamente', async () => {
            mockGetJson.mockResolvedValue({
                success: true,
                data: { solicitudes: [], total: 45 },
                message: 'OK'
            });

            const { cargarSolicitudes, totalPages } = useMonitoreoFirmasRealTime();
            await cargarSolicitudes();

            expect(totalPages.value).toBe(3); // 45 / 20 = 2.25 -> 3 páginas
        });

        it('debe navegar a página anterior', async () => {
            mockGetJson.mockResolvedValue({
                success: true,
                data: { solicitudes: [], total: 100 },
                message: 'OK'
            });

            const { siguientePagina, paginaAnterior, currentPage, cargarSolicitudes } = useMonitoreoFirmasRealTime();
            
            await cargarSolicitudes();
            siguientePagina();
            expect(currentPage.value).toBe(2);

            paginaAnterior();
            expect(currentPage.value).toBe(1);
        });
    });

    describe('Filtros', () => {
        it('debe cambiar filtro de estado', async () => {
            mockGetJson.mockResolvedValue({
                success: true,
                data: { solicitudes: [], total: 0 },
                message: 'OK'
            });

            const { cambiarFiltroEstado, estadoFiltro, currentPage } = useMonitoreoFirmasRealTime();

            cambiarFiltroEstado('FIRMADO');

            expect(estadoFiltro.value).toBe('FIRMADO');
            expect(currentPage.value).toBe(1); // Reset a página 1
        });
    });

    describe('Utilidades', () => {
        it('debe formatear fecha correctamente', () => {
            const { formatearFecha } = useMonitoreoFirmasRealTime();

            const fecha = new Date('2024-02-04T20:30:00Z');
            const resultado = formatearFecha(fecha);

            expect(resultado).toContain('2024');
        });

        it('debe retornar "-" para fecha undefined', () => {
            const { formatearFecha } = useMonitoreoFirmasRealTime();

            expect(formatearFecha(undefined)).toBe('-');
        });

        it('debe obtener color correcto por estado', () => {
            const { getEstadoColor } = useMonitoreoFirmasRealTime();

            expect(getEstadoColor('PENDIENTE_FIRMADO')).toContain('yellow');
            expect(getEstadoColor('FIRMADO')).toContain('green');
            expect(getEstadoColor('RECHAZADO')).toContain('red');
            expect(getEstadoColor('EXPIRADO')).toContain('gray');
        });

        it('debe obtener icono correcto por estado', () => {
            const { getEstadoIcon } = useMonitoreoFirmasRealTime();

            expect(getEstadoIcon('PENDIENTE_FIRMADO')).toBe('lucide:clock');
            expect(getEstadoIcon('FIRMADO')).toBe('lucide:check-circle');
            expect(getEstadoIcon('RECHAZADO')).toBe('lucide:x-circle');
        });
    });

    describe('Navegación', () => {
        it('debe navegar a detalles de solicitud', () => {
            const { verDetalles } = useMonitoreoFirmasRealTime();

            verDetalles('SOL-001');

            expect(mockPush).toHaveBeenCalledWith('/admin/solicitudes/show/SOL-001');
        });
    });

    describe('consultarEstado', () => {
        it('debe consultar y actualizar estado de solicitud', async () => {
            // Primero cargar una solicitud
            const mockLoadResponse = {
                success: true,
                data: {
                    solicitudes: [
                        {
                            numero_solicitud: 'SOL-001',
                            solicitante: { nombres_apellidos: 'Juan Pérez' },
                            proceso_firmado: {
                                transaccion_id: 'TXN-001',
                                estado: 'PENDIENTE_FIRMADO',
                                firmantes_completados: 0,
                                firmantes_pendientes: 2
                            }
                        }
                    ],
                    total: 1
                },
                message: 'OK'
            };

            mockGetJson.mockResolvedValueOnce(mockLoadResponse);

            const { cargarSolicitudes, consultarEstado, solicitudes } = useMonitoreoFirmasRealTime();
            await cargarSolicitudes();

            // Ahora consultar estado
            const mockEstadoResponse = {
                success: true,
                data: {
                    solicitud_id: 'SOL-001',
                    transaccion_id: 'TXN-001',
                    estado: 'FIRMADO',
                    firmantes_completados: 2,
                    firmantes_pendientes: 0
                },
                message: 'Estado actualizado'
            };

            mockGetJson.mockResolvedValueOnce(mockEstadoResponse);

            const resultado = await consultarEstado('SOL-001');

            expect(resultado.success).toBe(true);
            expect(solicitudes.value[0].proceso_firmado?.estado).toBe('FIRMADO');
            expect(solicitudes.value[0].proceso_firmado?.firmantes_completados).toBe(2);
        });

        it('debe manejar error al consultar estado', async () => {
            mockGetJson.mockRejectedValueOnce(new Error('Error de red'));

            const { consultarEstado } = useMonitoreoFirmasRealTime();
            const resultado = await consultarEstado('SOL-001');

            expect(resultado.success).toBe(false);
            expect(resultado.message).toContain('Error');
        });
    });
});
