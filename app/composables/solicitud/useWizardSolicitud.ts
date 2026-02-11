import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useSolicitudCreditoForm } from "~/composables/solicitud/useSolicitudCreditoForm";
import { useSimuladorStorage } from "~/composables/useSimuladorStorage";
import { useSession } from "~/composables/useSession";
import type {
    WizardStep,
    WizardProps,
    SolicitudCreditoPayload,
    GuardarSolicitudResponse,
} from "~/shared/types/solicitud-credito";

export function useWizardSolicitud(props?: WizardProps) {
    const router = useRouter();
    const { postJson } = useApi();
    const simuladorStorage = useSimuladorStorage();

    const loadingFormData = ref(false);
    const responseFormData = ref("");
    const createdSolicitudId = ref("");
    const errorMsg = ref("");
    const numeroSolicitud = ref("");
    const intervalId = ref<NodeJS.Timeout | null>(null);

    // Obtener datos del simulador
    const { hasSimuladorData, getDatosParaSolicitud } = useSimuladorStorage();

    // Obtener datos del trabajador desde la sesión
    const { session } = useSession();

    // Obtener composable de solicitud de crédito
    const {
        form,
        toggleConyuge,
        toggleEmpresaConyuge,
        autocalcularIngresos,
        addPropiedad,
        removePropiedad,
        addDeuda,
        removeDeuda,
        addReferencia,
        removeReferencia,
    } = useSolicitudCreditoForm();

    // Función para consultar número de solicitud disponible
    const consultarNumeroSolicitudDisponible = async () => {
        try {
            const datosSimulador = getDatosParaSolicitud();

            if (!datosSimulador?.lineaCredito?.tipcre) {
                console.warn(
                    "No hay línea de crédito disponible para consultar número",
                );
                return;
            }

            const payload = {
                linea_credito: datosSimulador.lineaCredito.tipcre,
            };

            const response = await postJson<{ data: string }>(
                "/api/solicitudes-credito/numero-disponible",
                payload,
                { auth: true },
            );

            if (response?.data) {
                numeroSolicitud.value = response.data;
                // Actualizar el formulario con el número disponible
                if (form.value.solicitud) {
                    form.value.solicitud.numero_solicitud = response.data;
                }
            }
        } catch (error) {
            console.error("Error consultando número de solicitud disponible:", error);
        }
    };

    // Función para iniciar la consulta recurrente
    const iniciarConsultaRecurrente = () => {
        // Limpiar intervalo existente si hay uno
        if (intervalId.value) {
            clearInterval(intervalId.value);
        }

        // Consultar inmediatamente
        consultarNumeroSolicitudDisponible();

        // Configurar consulta cada 30 segundos (ajustable según necesites)
        intervalId.value = setInterval(() => {
            consultarNumeroSolicitudDisponible();
        }, 30000); // 30 segundos
    };

    // Función para detener la consulta recurrente
    const detenerConsultaRecurrente = () => {
        if (intervalId.value) {
            clearInterval(intervalId.value);
            intervalId.value = null;
        }
    };

    // Función para cargar datos del wizard
    const loadDataWizard = () => {
        // Cargar datos del simulador
        if (hasSimuladorData()) {
            const datosSimulador = getDatosParaSolicitud();
            if (datosSimulador && form.value.solicitud) {
                // Prellenar campos del formulario con datos del simulador
                form.value.solicitud.valor_solicitud = datosSimulador.valorSolicitud;
                form.value.solicitud.cuota_mensual = Math.round(
                    datosSimulador.cuotaMensual,
                );
                form.value.solicitud.plazo_meses = datosSimulador.plazoMeses;

                // Guardar datos importantes de la línea de crédito
                if (datosSimulador.lineaCredito) {
                    form.value.linea_credito = {
                        tipcre: datosSimulador.lineaCredito.tipcre,
                        modxml4: datosSimulador.lineaCredito.modxml4,
                        detalle_modalidad: datosSimulador.lineaCredito.detalle,
                        numero_cuotas: datosSimulador.lineaCredito.numcuo,
                        estado: datosSimulador.lineaCredito.estado,
                        auxest: datosSimulador.lineaCredito.auxest,
                        estcre: datosSimulador.lineaCredito.estcre,
                        pagseg: datosSimulador.lineaCredito.pagseg,
                        tasa_interes: datosSimulador.tasaInteres,
                        total_intereses: datosSimulador.totalIntereses,
                        total_pagar: datosSimulador.totalPagar,
                    };
                    form.value.solicitud.tipcre = datosSimulador.lineaCredito.tipcre;
                    form.value.solicitud.modxml4 = datosSimulador.lineaCredito.modxml4;
                    form.value.solicitud.detalle_modalidad =
                        datosSimulador.lineaCredito.detalle;
                }
            }
        }

        // Cargar datos del trabajador desde la sesión
        if (session.value?.user?.trabajador && form.value.solicitante) {
            const trabajador = session.value.user.trabajador;

            // Mapear campos del trabajador al formulario del solicitante
            form.value.solicitante.tipo_persona = "natural"; // Por defecto persona natural
            form.value.solicitante.tipo_documento = (trabajador.tipo_documento ||
                "") as any;
            form.value.solicitante.numero_documento = trabajador.cedula || "";
            form.value.solicitante.nombres =
                trabajador.primer_nombre + " " + trabajador.segundo_nombre;
            form.value.solicitante.apellidos =
                trabajador.primer_apellido + " " + trabajador.segundo_apellido;
            form.value.solicitante.fecha_nacimiento =
                trabajador.fecha_nacimiento || "";
            form.value.solicitante.genero = (trabajador.sexo || "") as any;
            form.value.solicitante.estado_civil = trabajador.estado_civil || "";
            form.value.solicitante.nivel_educativo =
                (trabajador.nivel_educativo || "") as any;
            form.value.solicitante.profesion = trabajador.cargo || "";
            form.value.solicitante.email = trabajador.email || "";
            form.value.solicitante.telefono = trabajador.telefono || "";
            form.value.solicitante.celular = trabajador.telefono || "";
            form.value.solicitante.direccion = trabajador.direccion || "";
            form.value.solicitante.barrio = trabajador.direccion || "";
            form.value.solicitante.ciudad = trabajador.ciudad_codigo || "";
            form.value.solicitante.departamento = ""; // Necesario agregar
            form.value.solicitante.cargo = trabajador.cargo || "";
            form.value.solicitante.salario = trabajador.salario || 0;
            form.value.solicitante.codigo_categoria =
                trabajador.codigo_categoria || "";
            form.value.solicitud.categoria = trabajador.codigo_categoria || "";
            form.value.solicitante.pais_residencia = "CO";
            form.value.solicitante.departamento = "Caquetá";
            form.value.solicitante.personas_a_cargo =
                trabajador.personas_a_cargo || 0;
            form.value.solicitante.antiguedad_meses = trabajador.antiguedad_meses || 0;

            // Cargar datos de la empresa en información laboral
            if (trabajador.empresa && form.value.informacion_laboral) {
                form.value.solicitante.nit = trabajador.empresa.nit || "";
                form.value.solicitante.razon_social =
                    trabajador.empresa.razon_social || "";

                form.value.informacion_laboral.empresa_razon_social =
                    trabajador.empresa.razon_social || "";
                form.value.informacion_laboral.empresa_nit =
                    trabajador.empresa.nit || "";
                form.value.informacion_laboral.empresa_telefono =
                    trabajador.empresa.telefono || "";
                form.value.informacion_laboral.empresa_direccion =
                    trabajador.empresa.direccion || "";
                form.value.informacion_laboral.empresa_ciudad =
                    trabajador.empresa.ciudad_codigo || "";
                form.value.informacion_laboral.cargo = trabajador.cargo || "";
                form.value.informacion_laboral.fecha_ingreso =
                    trabajador.fecha_afiliacion || "";
                form.value.informacion_laboral.tiempo_servicio = 1; // Valor por defecto
                form.value.informacion_laboral.tiempo_servicio_unidad = "anios"; // Valor por defecto
            }

            // Cargar datos de ingresos y descuentos
            if (form.value.ingresos_descuentos && trabajador.salario) {
                form.value.ingresos_descuentos.salario_basico_mensual =
                    trabajador.salario;
                form.value.ingresos_descuentos.subsidio_transporte = 0; // Valor por defecto
                form.value.ingresos_descuentos.horas_extras = 0;
                form.value.ingresos_descuentos.comisiones = 0;
                form.value.ingresos_descuentos.otros_ingresos = 0;
                form.value.ingresos_descuentos.salud_pension = Math.round(
                    trabajador.salario * 0.08,
                ); // 8% salud + 8% pensión
                form.value.ingresos_descuentos.libranzas_comfaca = 0;
                form.value.ingresos_descuentos.otras_libranzas = 0;
                form.value.ingresos_descuentos.judiciales = 0;
                form.value.ingresos_descuentos.otras_deducciones = 0;
            }
        }

        // Asignar fecha de radicado al formulario
        if (form.value.solicitud && props?.fechaRadicado) {
            form.value.solicitud.fecha_radicado = props.fechaRadicado;
        }
    };

    // Cargar datos del simulador si existen
    onMounted(() => {
        loadDataWizard();
        iniciarConsultaRecurrente();
    });

    // Limpiar intervalo cuando el componente se desmonte
    onUnmounted(() => {
        detenerConsultaRecurrente();
    });

    const guardarSolicitud = async (
        form: SolicitudCreditoPayload,
    ): Promise<boolean> => {
        pdfGenerado.value = false;
        mensajeProgreso.value = "";
        mensajeProgreso.value = "Generando solicitud...";
        loadingFormData.value = true;
        errorMsg.value = "";
        createdSolicitudId.value = "";

        try {
            // Obtener datos del simulador desde localStorage
            const simuladorData = simuladorStorage.loadSimuladorData();

            // Preparar el payload con los datos del simulador
            const payload = {
                ...form,
                // Agregar datos del simulador si están disponibles, pero preservar campos financieros
                ...(simuladorData?.lineaCredito && {
                    linea_credito: {
                        ...form.linea_credito, // Preservar todos los campos existentes incluyendo financieros
                        tipcre: simuladorData.lineaCredito.tipcre,
                        modxml4: simuladorData.lineaCredito.modxml4,
                        detalle_modalidad: simuladorData.lineaCredito.detalle,
                        numero_cuotas: simuladorData.lineaCredito.numcuo,
                        estado: simuladorData.lineaCredito.estado,
                        auxest: simuladorData.lineaCredito.auxest,
                        estcre: simuladorData.lineaCredito.estcre,
                        pagseg: simuladorData.lineaCredito.pagseg,
                        repdcr: simuladorData.lineaCredito.repdcr,
                        tipfin: simuladorData.lineaCredito.tipfin,
                    },
                }),
            };

            const response = await postJson<GuardarSolicitudResponse>(
                "/api/solicitud-credito/guardar",
                payload,
                { auth: true },
            );

            if (response) {
                createdSolicitudId.value = response.data.numero_solicitud;
                responseFormData.value = response._data || "";
            } else {
                throw new Error("Respuesta inválida del servidor");
            }

            successModalOpen.value = true;
            return true;
        } catch (e: unknown) {
            responseFormData.value = "";
            const errorMessage = e instanceof Error ? e.message : "Error desconocido";
            const apiError = (e as any)?.data?.error;
            errorMsg.value = apiError || errorMessage || "Error generando XML";
            return false;
        } finally {
            loadingFormData.value = false;
        }
    };

    const steps: WizardStep[] = [
        { key: "solicitud", title: "Solicitud", short: "Solicitud" },
        {
            key: "solicitante",
            title: "Datos del solicitante",
            short: "Solicitante",
        },
        { key: "conyuge", title: "Datos del cónyuge (opcional)", short: "Cónyuge" },
        { key: "laboral", title: "Información laboral", short: "Laboral" },
        { key: "ingresos", title: "Ingresos y descuentos", short: "Ingresos" },
        { key: "economica", title: "Información económica", short: "Económica" },
        { key: "propiedades", title: "Propiedades", short: "Propiedades" },
        { key: "deudas", title: "Deudas", short: "Deudas" },
        { key: "referencias", title: "Referencias", short: "Referencias" },
        { key: "revision", title: "Revisión y generación", short: "Revisión" },
    ];

    // Reactive state
    const step = ref(0);
    const successModalOpen = ref(false);
    const pdfGenerado = ref(false);
    const mensajeProgreso = ref("");

    // Computed properties
    const prettyPayload = computed(() => JSON.stringify(form.value, null, 2));

    // Navigation functions
    const next = () => {
        step.value = Math.min(step.value + 1, steps.length - 1);
    };

    const prev = () => {
        step.value = Math.max(step.value - 1, 0);
    };

    // Modal functions
    const closeSuccessModal = () => {
        successModalOpen.value = false;
    };

    const goToHome = async () => {
        successModalOpen.value = false;
        await router.push("/");
    };

    const goToDocumentos = async () => {
        const id = createdSolicitudId.value;
        if (!id) return;
        successModalOpen.value = false;
        await router.push(`/solicitud/documentos/${id}`);
    };

    return {
        // Form
        form,

        // State
        step,
        loadingFormData,

        responseFormData,
        numeroSolicitud,
        createdSolicitudId,
        errorMsg,

        successModalOpen,
        pdfGenerado,

        mensajeProgreso,
        steps,
        prettyPayload,

        // Navigation
        next,
        prev,

        // Form manipulation
        toggleConyuge,
        toggleEmpresaConyuge,
        autocalcularIngresos,

        // Array manipulation
        addPropiedad,
        removePropiedad,
        addDeuda,
        removeDeuda,
        addReferencia,
        removeReferencia,

        // Modal
        closeSuccessModal,
        goToHome,
        goToDocumentos,

        // XML operations
        guardarSolicitud,

        // Consulta recurrente
        consultarNumeroSolicitudDisponible,
        iniciarConsultaRecurrente,
        detenerConsultaRecurrente,
    };
}
