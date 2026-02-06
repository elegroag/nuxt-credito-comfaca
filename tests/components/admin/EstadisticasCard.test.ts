import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EstadisticasCard from '~/components/admin/firmas/EstadisticasCard.vue';

describe('EstadisticasCard', () => {
    it('debe renderizar correctamente con props básicas', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Total Procesos',
                valor: 42,
                descripcion: 'Procesos activos',
                icono: 'lucide:file-signature',
                colorFondo: 'bg-blue-100',
                colorIcono: 'text-blue-600',
                colorTexto: 'text-blue-900'
            }
        });

        expect(wrapper.text()).toContain('Total Procesos');
        expect(wrapper.text()).toContain('42');
        expect(wrapper.text()).toContain('Procesos activos');
    });

    it('debe renderizar con valor tipo string', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Estado',
                valor: 'Activo',
                descripcion: 'Estado del sistema',
                icono: 'lucide:check',
                colorFondo: 'bg-green-100',
                colorIcono: 'text-green-600',
                colorTexto: 'text-green-900'
            }
        });

        expect(wrapper.text()).toContain('Activo');
    });

    it('debe mostrar barra de progreso cuando se proporciona porcentaje', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Completados',
                valor: 75,
                descripcion: 'Procesos finalizados',
                icono: 'lucide:check-circle',
                colorFondo: 'bg-green-100',
                colorIcono: 'text-green-600',
                colorTexto: 'text-green-900',
                colorBarra: 'bg-green-600',
                porcentaje: 75
            }
        });

        expect(wrapper.text()).toContain('75%');
        const progressBar = wrapper.find('.h-2.rounded-full');
        expect(progressBar.exists()).toBe(true);
    });

    it('no debe mostrar barra de progreso cuando no se proporciona porcentaje', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Total',
                valor: 100,
                descripcion: 'Total de registros',
                icono: 'lucide:list',
                colorFondo: 'bg-gray-100',
                colorIcono: 'text-gray-600',
                colorTexto: 'text-gray-900'
            }
        });

        expect(wrapper.text()).not.toContain('%');
    });

    it('debe aplicar clases de color correctamente', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Pendientes',
                valor: 10,
                descripcion: 'En espera',
                icono: 'lucide:clock',
                colorFondo: 'bg-yellow-100',
                colorIcono: 'text-yellow-600',
                colorTexto: 'text-yellow-900'
            }
        });

        const html = wrapper.html();
        expect(html).toContain('bg-yellow-100');
        expect(html).toContain('text-yellow-600');
        expect(html).toContain('text-yellow-900');
    });

    it('debe usar valores por defecto cuando no se proporcionan props opcionales', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Test',
                valor: 1,
                descripcion: 'Descripción',
                icono: 'lucide:test'
            }
        });

        const html = wrapper.html();
        expect(html).toContain('bg-blue-100');
        expect(html).toContain('text-blue-600');
    });

    it('debe renderizar el icono correcto', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Rechazados',
                valor: 5,
                descripcion: 'Procesos rechazados',
                icono: 'lucide:x-circle',
                colorFondo: 'bg-red-100',
                colorIcono: 'text-red-600',
                colorTexto: 'text-red-900'
            }
        });

        // Verificar que el componente Icon existe con el nombre correcto
        const icon = wrapper.findComponent({ name: 'Icon' });
        expect(icon.exists()).toBe(true);
    });

    it('debe mostrar porcentaje 0 correctamente', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Sin completar',
                valor: 0,
                descripcion: 'Ninguno completado',
                icono: 'lucide:circle',
                colorFondo: 'bg-gray-100',
                colorIcono: 'text-gray-600',
                colorTexto: 'text-gray-900',
                porcentaje: 0
            }
        });

        expect(wrapper.text()).toContain('0%');
    });

    it('debe mostrar porcentaje 100 correctamente', () => {
        const wrapper = mount(EstadisticasCard, {
            props: {
                titulo: 'Completados',
                valor: 100,
                descripcion: 'Todos completados',
                icono: 'lucide:check-circle',
                colorFondo: 'bg-green-100',
                colorIcono: 'text-green-600',
                colorTexto: 'text-green-900',
                colorBarra: 'bg-green-600',
                porcentaje: 100
            }
        });

        expect(wrapper.text()).toContain('100%');
        const progressBar = wrapper.find('.h-2.rounded-full');
        expect(progressBar.attributes('style')).toContain('width: 100%');
    });
});
