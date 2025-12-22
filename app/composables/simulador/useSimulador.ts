// frontend/composables/simulador/useSimulador.ts
import { computed, ref } from 'vue';

interface SimuladorData {
    monto: number;
    plazoMeses: number;
    tasaEfectivaAnual: number;
    ingresosMensuales: number;
    descuentosMensuales: number;
    maxEndeudamientoPct: number;
}

export function useSimulador() {
    // Valores por defecto
    const monto = ref(5_000_000);
    const plazoMeses = ref(36);
    const tasaEfectivaAnual = ref(24);
    const ingresosMensuales = ref(2_500_000);
    const descuentosMensuales = ref(500_000);
    const maxEndeudamientoPct = ref(30);

    // Función helper para validar números
    const _num = (v: unknown) => {
        const n = typeof v === 'number' ? v : Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    // Computed properties con validación y saneamiento
    const montoSan = computed(() => Math.max(0, _num(monto.value)));
    const plazoMesesSan = computed(() => Math.max(1, Math.floor(_num(plazoMeses.value) || 1)));
    const tasaEASan = computed(() => Math.max(0, _num(tasaEfectivaAnual.value)));

    const ingresosSan = computed(() => Math.max(0, _num(ingresosMensuales.value)));
    const descuentosSan = computed(() => Math.max(0, _num(descuentosMensuales.value)));
    const maxEndeudamientoSan = computed(() => {
        const v = _num(maxEndeudamientoPct.value);
        return Math.min(100, Math.max(0, v));
    });

    // Cálculos financieros
    const tasaMensual = computed(() => {
        const ea = tasaEASan.value / 100;
        if (ea <= 0) return 0;
        return Math.pow(1 + ea, 1 / 12) - 1;
    });

    const cuotaMensual = computed(() => {
        const P = montoSan.value;
        const n = plazoMesesSan.value;
        const r = tasaMensual.value;

        if (P <= 0 || n <= 0) return 0;
        if (r <= 0) return P / n;

        const denom = 1 - Math.pow(1 + r, -n);
        if (denom <= 0) return 0;

        return (P * r) / denom;
    });

    const totalPagar = computed(() => cuotaMensual.value * plazoMesesSan.value);
    const intereses = computed(() => Math.max(0, totalPagar.value - montoSan.value));

    // Cálculos de capacidad
    const capacidadDisponible = computed(() => Math.max(0, ingresosSan.value - descuentosSan.value));
    const maxCuotaPermitida = computed(() => (capacidadDisponible.value * maxEndeudamientoSan.value) / 100);
    const margen = computed(() => maxCuotaPermitida.value - cuotaMensual.value);
    const apto = computed(() => cuotaMensual.value <= maxCuotaPermitida.value);

    // Funciones de formateo
    const fmt = (value: number) => {
        const n = Number.isFinite(value) ? value : 0;
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(n);
    };

    const fmtPct = (value: number) => {
        const n = Number.isFinite(value) ? value : 0;
        return `${n.toFixed(2)}%`;
    };

    // Función de reset
    const reset = () => {
        monto.value = 5_000_000;
        plazoMeses.value = 36;
        tasaEfectivaAnual.value = 24;
        ingresosMensuales.value = 2_500_000;
        descuentosMensuales.value = 500_000;
        maxEndeudamientoPct.value = 30;
    };

    // Función para actualizar valores
    const updateValues = (values: Partial<SimuladorData>) => {
        if (values.monto !== undefined) monto.value = values.monto;
        if (values.plazoMeses !== undefined) plazoMeses.value = values.plazoMeses;
        if (values.tasaEfectivaAnual !== undefined) tasaEfectivaAnual.value = values.tasaEfectivaAnual;
        if (values.ingresosMensuales !== undefined) ingresosMensuales.value = values.ingresosMensuales;
        if (values.descuentosMensuales !== undefined) descuentosMensuales.value = values.descuentosMensuales;
        if (values.maxEndeudamientoPct !== undefined) maxEndeudamientoPct.value = values.maxEndeudamientoPct;
    };

    return {
        // Reactive values
        monto,
        plazoMeses,
        tasaEfectivaAnual,
        ingresosMensuales,
        descuentosMensuales,
        maxEndeudamientoPct,

        // Computed properties
        montoSan,
        plazoMesesSan,
        tasaEASan,
        ingresosSan,
        descuentosSan,
        maxEndeudamientoSan,
        tasaMensual,
        cuotaMensual,
        totalPagar,
        intereses,
        capacidadDisponible,
        maxCuotaPermitida,
        margen,
        apto,

        // Functions
        fmt,
        fmtPct,
        reset,
        updateValues
    };
}
