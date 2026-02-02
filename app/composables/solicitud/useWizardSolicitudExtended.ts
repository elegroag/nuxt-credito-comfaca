import { computed, ref, watch } from '#imports';
import { useWizardSolicitud } from '~/composables/solicitud/useWizardSolicitud';
import { useConvenioValidation } from '~/composables/solicitud/useConvenioValidation';
import { usePDFGenerator } from '~/composables/solicitud/usePDFGenerator';
import { useFirmadoDigital } from '~/composables/solicitud/useFirmadoDigital';

/**
 * Extensión del wizard de solicitud con funcionalidades de convenio, PDF y firmado digital
 */
export function useWizardSolicitudExtended() {
  // Wizard base
  const wizard = useWizardSolicitud();

  // Nuevas funcionalidades
  const convenioValidation = useConvenioValidation();
  const pdfGenerator = usePDFGenerator();
  const firmadoDigital = useFirmadoDigital();

  // Estados adicionales
  const convenioValidado = ref(false);
  const pdfGenerado = ref(false);
  const procesoFirmadoIniciado = ref(false);

  // Pasos extendidos del wizard (agregar paso de PDF y firmado)
  const stepsExtended = [
    ...wizard.steps,
    { key: 'pdf-firmado', title: 'Documento y Firma Digital', short: 'PDF/Firma' }
  ];

  // Computed: Verificar si se debe validar convenio
  const debeValidarConvenio = computed(() => {
    const nit = wizard.form.value.informacion_laboral?.empresa_nit;
    const cedula = wizard.form.value.solicitante?.numero_identificacion;
    return Boolean(nit && cedula);
  });

  // Computed: Datos para validación de convenio
  const datosConvenio = computed(() => ({
    nit: wizard.form.value.informacion_laboral?.empresa_nit || '',
    cedula: wizard.form.value.solicitante?.numero_identificacion || ''
  }));

  /**
   * Valida el convenio cuando llegue al paso final
   */
  const validarConvenioAutomatico = async () => {
    if (!debeValidarConvenio.value) {
      return false;
    }

    const elegible = await convenioValidation.validarConvenio(
      datosConvenio.value.nit,
      datosConvenio.value.cedula
    );

    convenioValidado.value = elegible;
    return elegible;
  };

  /**
   * Genera el PDF de la solicitud
   */
  const generarPDFSolicitud = async (solicitudId: string) => {
    const exito = await pdfGenerator.generarPDF(solicitudId, {
      incluirConvenio: convenioValidation.isElegible.value,
      incluirFirmantes: true
    });

    if (exito) {
      pdfGenerado.value = true;
    }

    return exito;
  };

  /**
   * Inicia el proceso de firmado digital
   */
  const iniciarProcesoFirmado = async (solicitudId: string) => {
    const exito = await firmadoDigital.iniciarFirmado(solicitudId);

    if (exito) {
      procesoFirmadoIniciado.value = true;
    }

    return exito;
  };

  /**
   * Flujo completo: Generar XML/Solicitud → Validar Convenio → Generar PDF → Iniciar Firmado
   */
  const completarSolicitudConFirmado = async (saveXml: boolean = true) => {
    try {
      // 1. Generar XML y crear solicitud (flujo original)
      await wizard.guardarSolicitud(saveXml);

      // Esperar a que se complete y verificar si se creó la solicitud
      if (!wizard.createdSolicitudId.value) {
        return false;
      }

      const solicitudId = wizard.createdSolicitudId.value;

      // 2. Validar convenio si aplica
      if (debeValidarConvenio.value) {
        await validarConvenioAutomatico();
      }

      // 3. Generar PDF
      const pdfSuccess = await generarPDFSolicitud(solicitudId);
      if (!pdfSuccess) {
        console.warn('No se pudo generar el PDF, pero la solicitud fue creada');
      }

      // 4. Iniciar firmado digital
      if (pdfSuccess) {
        const firmadoSuccess = await iniciarProcesoFirmado(solicitudId);
        if (!firmadoSuccess) {
          console.warn('No se pudo iniciar el firmado, pero el PDF fue generado');
        }
      }

      return true;
    } catch (error) {
      console.error('Error en flujo completo:', error);
      return false;
    }
  };

  /**
   * Resetea todos los estados
   */
  const resetearEstados = () => {
    convenioValidado.value = false;
    pdfGenerado.value = false;
    procesoFirmadoIniciado.value = false;
    convenioValidation.limpiarValidacion();
    pdfGenerator.limpiarEstado();
    firmadoDigital.limpiarEstado();
  };

  // Watch para validar convenio automáticamente al cambiar datos
  watch(
    () => wizard.step.value,
    async (newStep) => {
      // Si llega al paso de revisión, validar convenio automáticamente
      if (newStep === wizard.steps.length - 1 && debeValidarConvenio.value) {
        await validarConvenioAutomatico();
      }
    }
  );

  return {
    // Wizard original
    ...wizard,

    // Steps extendidos
    stepsExtended,

    // Validación de convenio
    convenioValidation,
    convenioValidado,
    debeValidarConvenio,
    validarConvenioAutomatico,

    // PDF
    pdfGenerator,
    pdfGenerado,
    generarPDFSolicitud,

    // Firmado digital
    firmadoDigital,
    procesoFirmadoIniciado,
    iniciarProcesoFirmado,

    // Flujos
    completarSolicitudConFirmado,
    resetearEstados
  };
}
