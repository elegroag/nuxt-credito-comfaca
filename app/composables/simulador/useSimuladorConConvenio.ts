import { ref, computed, watch } from '#imports';
import { useConvenioValidation } from '~/composables/solicitud/useConvenioValidation';

/**
 * Extensión del simulador con validación de convenio empresarial
 * Permite calcular tasas y condiciones especiales si el trabajador tiene convenio
 */
export function useSimuladorConConvenio() {
  const {
    validarConvenio,
    isElegible,
    convenio,
    trabajador,
    loading: loadingConvenio,
    error: errorConvenio,
    getMensajeError
  } = useConvenioValidation();

  // Datos del trabajador para validación
  const nitEmpresa = ref('');
  const cedulaTrabajador = ref('');

  // Estados
  const convenioVerificado = ref(false);
  const mostrarBeneficiosConvenio = ref(false);

  // Beneficios del convenio (pueden ser configurables desde backend)
  const beneficiosConvenio = computed(() => {
    if (!isElegible.value || !convenio.value) return null;

    return {
      tasaReducida: true,
      tasaDescuento: 0.5, // 0.5% de descuento
      plazoExtendido: true,
      plazoMaximoMeses: 72, // vs 60 estándar
      montoMaximoAumentado: true,
      factorAumento: 1.2, // 20% más de monto
      requisitosFlexibles: true,
      tramiteRapido: true,
      empresaNombre: convenio.value.razon_social
    };
  });

  // Mensaje de beneficios para mostrar al usuario
  const mensajeBeneficios = computed(() => {
    const beneficios = beneficiosConvenio.value;
    if (!beneficios) return null;

    return {
      titulo: '🎉 ¡Elegible para Crédito Convenio Empresarial!',
      items: [
        beneficios.tasaReducida && `✓ Tasa de interés reducida (${beneficios.tasaDescuento}% menos)`,
        beneficios.plazoExtendido && `✓ Plazo máximo extendido a ${beneficios.plazoMaximoMeses} meses`,
        beneficios.montoMaximoAumentado && `✓ Monto máximo aumentado en ${(beneficios.factorAumento - 1) * 100}%`,
        beneficios.tramiteRapido && '✓ Trámite acelerado y simplificado',
        beneficios.requisitosFlexibles && '✓ Requisitos de aprobación más flexibles'
      ].filter(Boolean),
      empresa: beneficios.empresaNombre
    };
  });

  /**
   * Valida el convenio antes de simular
   */
  const validarConvenioAntesDSimular = async (): Promise<boolean> => {
    if (!nitEmpresa.value || !cedulaTrabajador.value) {
      return false;
    }

    const elegible = await validarConvenio(nitEmpresa.value, cedulaTrabajador.value);
    convenioVerificado.value = true;
    mostrarBeneficiosConvenio.value = elegible;

    return elegible;
  };

  /**
   * Aplica ajustes al monto según convenio
   */
  const ajustarMontoPorConvenio = (montoBase: number): number => {
    if (!isElegible.value || !beneficiosConvenio.value) {
      return montoBase;
    }

    return Math.round(montoBase * beneficiosConvenio.value.factorAumento);
  };

  /**
   * Aplica ajustes a la tasa según convenio
   */
  const ajustarTasaPorConvenio = (tasaBase: number): number => {
    if (!isElegible.value || !beneficiosConvenio.value) {
      return tasaBase;
    }

    return Math.max(0, tasaBase - beneficiosConvenio.value.tasaDescuento);
  };

  /**
   * Obtiene el plazo máximo según convenio
   */
  const obtenerPlazoMaximo = (plazoBaseMaximo: number): number => {
    if (!isElegible.value || !beneficiosConvenio.value) {
      return plazoBaseMaximo;
    }

    return beneficiosConvenio.value.plazoMaximoMeses;
  };

  /**
   * Calcula la cuota mensual con convenio aplicado
   */
  const calcularCuotaConConvenio = (
    monto: number,
    tasaNominal: number,
    plazo: number
  ): {
    cuota: number;
    tasaAplicada: number;
    montoTotal: number;
    ahorroMensual?: number;
    ahorroTotal?: number;
  } => {
    // Ajustar parámetros si tiene convenio
    const tasaAjustada = ajustarTasaPorConvenio(tasaNominal);

    // Calcular tasa mensual
    const tasaMensual = tasaAjustada / 100 / 12;

    // Fórmula de cuota con interés compuesto
    const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) /
      (Math.pow(1 + tasaMensual, plazo) - 1);

    const montoTotal = cuota * plazo;

    // Si tiene convenio, calcular ahorro vs tasa estándar
    let ahorroMensual;
    let ahorroTotal;

    if (isElegible.value && tasaNominal !== tasaAjustada) {
      const tasaMensualBase = tasaNominal / 100 / 12;
      const cuotaBase = monto * (tasaMensualBase * Math.pow(1 + tasaMensualBase, plazo)) /
        (Math.pow(1 + tasaMensualBase, plazo) - 1);

      ahorroMensual = cuotaBase - cuota;
      ahorroTotal = ahorroMensual * plazo;
    }

    return {
      cuota: Math.round(cuota),
      tasaAplicada: tasaAjustada,
      montoTotal: Math.round(montoTotal),
      ahorroMensual: ahorroMensual ? Math.round(ahorroMensual) : undefined,
      ahorroTotal: ahorroTotal ? Math.round(ahorroTotal) : undefined
    };
  };

  /**
   * Resetea el estado del convenio
   */
  const resetearConvenio = () => {
    nitEmpresa.value = '';
    cedulaTrabajador.value = '';
    convenioVerificado.value = false;
    mostrarBeneficiosConvenio.value = false;
  };

  // Watch para auto-validar cuando cambien los datos
  watch([nitEmpresa, cedulaTrabajador], () => {
    // Reset cuando cambien los datos
    if (convenioVerificado.value) {
      convenioVerificado.value = false;
      mostrarBeneficiosConvenio.value = false;
    }
  });

  return {
    // Datos de entrada
    nitEmpresa,
    cedulaTrabajador,

    // Estados
    loadingConvenio,
    errorConvenio,
    convenioVerificado,
    isElegible,
    mostrarBeneficiosConvenio,

    // Datos del convenio
    convenio,
    trabajador,
    beneficiosConvenio,
    mensajeBeneficios,
    getMensajeError,

    // Métodos
    validarConvenioAntesDSimular,
    ajustarMontoPorConvenio,
    ajustarTasaPorConvenio,
    obtenerPlazoMaximo,
    calcularCuotaConConvenio,
    resetearConvenio
  };
}
