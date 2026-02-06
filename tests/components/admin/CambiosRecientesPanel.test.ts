import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CambiosRecientesPanel from '~/components/admin/firmas/CambiosRecientesPanel.vue';

describe('CambiosRecientesPanel', () => {
    const cambiosMock = [
        {
            solicitudId: 'SOL-001',
            nombreSolicitante: 'Juan Pérez',
            estadoAnterior: 'PENDIENTE_FIRMADO',
            estadoNuevo: 'FIRMADO',
            timestamp: new Date('2024-02-04T20:30:00Z')
        },
        {
            solicitudId: 'SOL-002',
            nombreSolicitante: 'María García',
            estadoAnterior: 'PENDIENTE_FIRMADO',
            estadoNuevo: 'RECHAZADO',
            timestamp: new Date('2024-02-04T20:25:00Z')
        }
    ];

    it('debe renderizar correctamente con cambios', () => {
        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: cambiosMock
            }
        });

        expect(wrapper.text()).toContain('Cambios Recientes');
        expect(wrapper.text()).toContain('Juan Pérez');
        expect(wrapper.text()).toContain('María García');
    });

    it('debe mostrar mensaje cuando no hay cambios', () => {
        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: []
            }
        });

        expect(wrapper.text()).toContain('No hay cambios recientes');
    });

    it('debe mostrar transiciones de estado correctamente', () => {
        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: [cambiosMock[0]]
            }
        });

        expect(wrapper.text()).toContain('PENDIENTE_FIRMADO');
        expect(wrapper.text()).toContain('FIRMADO');
    });

    it('debe emitir evento ver-detalle al hacer click en el botón', async () => {
        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: [cambiosMock[0]]
            }
        });

        const button = wrapper.find('button');
        await button.trigger('click');

        expect(wrapper.emitted('ver-detalle')).toBeTruthy();
        expect(wrapper.emitted('ver-detalle')?.[0]).toEqual(['SOL-001']);
    });

    it('debe renderizar múltiples cambios', () => {
        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: cambiosMock
            }
        });

        const items = wrapper.findAll('.bg-gray-50');
        expect(items.length).toBe(2);
    });

    it('debe mostrar iconos según el estado', () => {
        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: cambiosMock
            }
        });

        const icons = wrapper.findAllComponents({ name: 'Icon' });
        expect(icons.length).toBeGreaterThan(0);
    });

    it('debe aplicar scroll cuando hay muchos cambios', () => {
        const muchosCambios = Array.from({ length: 15 }, (_, i) => ({
            solicitudId: `SOL-${i}`,
            nombreSolicitante: `Usuario ${i}`,
            estadoAnterior: 'PENDIENTE_FIRMADO',
            estadoNuevo: 'FIRMADO',
            timestamp: new Date()
        }));

        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: muchosCambios
            }
        });

        const scrollContainer = wrapper.find('.max-h-96.overflow-y-auto');
        expect(scrollContainer.exists()).toBe(true);
    });

    it('debe truncar nombres largos', () => {
        const cambioConNombreLargo = {
            solicitudId: 'SOL-003',
            nombreSolicitante: 'Nombre Muy Largo Que Debería Ser Truncado En La Interfaz',
            estadoAnterior: 'PENDIENTE_FIRMADO',
            estadoNuevo: 'FIRMADO',
            timestamp: new Date()
        };

        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: [cambioConNombreLargo]
            }
        });

        const nombreElement = wrapper.find('.truncate');
        expect(nombreElement.exists()).toBe(true);
    });

    it('debe mostrar todos los estados posibles', () => {
        const todosLosEstados = [
            {
                solicitudId: 'SOL-1',
                nombreSolicitante: 'Usuario 1',
                estadoAnterior: 'PENDIENTE_FIRMADO',
                estadoNuevo: 'FIRMADO',
                timestamp: new Date()
            },
            {
                solicitudId: 'SOL-2',
                nombreSolicitante: 'Usuario 2',
                estadoAnterior: 'PENDIENTE_FIRMADO',
                estadoNuevo: 'RECHAZADO',
                timestamp: new Date()
            },
            {
                solicitudId: 'SOL-3',
                nombreSolicitante: 'Usuario 3',
                estadoAnterior: 'PENDIENTE_FIRMADO',
                estadoNuevo: 'EXPIRADO',
                timestamp: new Date()
            },
            {
                solicitudId: 'SOL-4',
                nombreSolicitante: 'Usuario 4',
                estadoAnterior: 'PENDIENTE_FIRMADO',
                estadoNuevo: 'CANCELADO',
                timestamp: new Date()
            }
        ];

        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: todosLosEstados
            }
        });

        expect(wrapper.text()).toContain('FIRMADO');
        expect(wrapper.text()).toContain('RECHAZADO');
        expect(wrapper.text()).toContain('EXPIRADO');
        expect(wrapper.text()).toContain('CANCELADO');
    });

    it('debe formatear timestamp relativamente', () => {
        const ahoraMinusDosMinutos = new Date(Date.now() - 2 * 60 * 1000);
        
        const cambioReciente = {
            solicitudId: 'SOL-001',
            nombreSolicitante: 'Test User',
            estadoAnterior: 'PENDIENTE_FIRMADO',
            estadoNuevo: 'FIRMADO',
            timestamp: ahoraMinusDosMinutos
        };

        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: [cambioReciente]
            }
        });

        expect(wrapper.text()).toContain('Hace');
    });

    it('debe aplicar hover effect en items', () => {
        const wrapper = mount(CambiosRecientesPanel, {
            props: {
                cambios: [cambiosMock[0]]
            }
        });

        const item = wrapper.find('.hover\\:bg-gray-100');
        expect(item.exists()).toBe(true);
    });
});
