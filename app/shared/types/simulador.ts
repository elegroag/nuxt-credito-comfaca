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

// Interface extendida para almacenamiento en localStorage
export interface SimuladorStorageData extends SimuladorData {
    lineaCredito: any; // Datos de la línea de crédito seleccionada
    montoCredito: number; // Alias para monto
    tasaInteresAnual: number; // Alias para tasaEfectivaAnual
    cuotaMensual: number; // Resultado del cálculo
    totalIntereses: number; // Resultado del cálculo
    totalPagar: number; // Resultado del cálculo
    fechaSimulacion: string; // Fecha de la simulación
}
