export interface SimuladorData {
    monto: number;
    plazoMeses: number;
    tasaEfectivaAnual: number;
    ingresosMensuales: number;
    descuentosMensuales: number;
    maxEndeudamientoPct: number;
}

export interface SimuladorResultados {
    cuotaMensual: number;
    totalPagar: number;
    intereses: number;
    capacidadDisponible: number;
    maxCuotaPermitida: number;
    margen: number;
    apto: boolean;
}
