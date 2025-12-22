// frontend/composables/solicitud/useWizardSolicitud.ts
import { computed, ref, defineComponent, h } from 'vue';
import { useRouter } from 'vue-router';
import { useSession } from '~/composables/useSession';
import { useSolicitudCreditoForm } from '~/composables/useSolicitudCreditoForm';

const FIRMA_DEFAULTS_STORAGE_KEY = 'comfaca_credito_firma_defaults';

export function useWizardSolicitud() {
    const router = useRouter();
    const { authHeader } = useSession();
    const { form } = useSolicitudCreditoForm();

    // Steps configuration
    const steps = [
        { key: 'encabezado', title: 'Encabezado', short: 'Encabezado' },
        { key: 'solicitud', title: 'Solicitud', short: 'Solicitud' },
        { key: 'producto', title: 'Producto solicitado', short: 'Producto' },
        { key: 'solicitante', title: 'Datos del solicitante', short: 'Solicitante' },
        { key: 'conyuge', title: 'Datos del cónyuge (opcional)', short: 'Cónyuge' },
        { key: 'laboral', title: 'Información laboral', short: 'Laboral' },
        { key: 'ingresos', title: 'Ingresos y descuentos', short: 'Ingresos' },
        { key: 'economica', title: 'Información económica', short: 'Económica' },
        { key: 'propiedades', title: 'Propiedades', short: 'Propiedades' },
        { key: 'deudas', title: 'Deudas', short: 'Deudas' },
        { key: 'referencias', title: 'Referencias', short: 'Referencias' },
        { key: 'revision', title: 'Revisión y generación', short: 'Revisión' }
    ] as const;

    // Reactive state
    const step = ref(0);
    const loadingXml = ref(false);
    const xmlText = ref('');
    const savedFilename = ref('');
    const createdSolicitudId = ref('');
    const errorMsg = ref('');
    const successModalOpen = ref(false);

    // Computed properties
    const prettyPayload = computed(() => JSON.stringify(form.value, null, 2));

    // Navigation functions
    const next = () => {
        step.value = Math.min(step.value + 1, steps.length - 1);
    };

    const prev = () => {
        step.value = Math.max(step.value - 1, 0);
    };

    // Form manipulation functions
    const toggleConyuge = (ev: Event) => {
        const checked = (ev.target as HTMLInputElement).checked;
        if (!checked) {
            form.value.conyuge = undefined;
            return;
        }

        form.value.conyuge = {
            identificacion: '',
            nombres_apellidos: '',
            ingresos_laborales: 0,
            trabaja: false,
            telefono_movil: ''
        };
    };

    const toggleEmpresaConyuge = (ev: Event) => {
        if (!form.value.conyuge) return;
        const checked = (ev.target as HTMLInputElement).checked;
        if (!checked) {
            form.value.conyuge.empresa = undefined;
            return;
        }
        form.value.conyuge.empresa = {
            nombre: '',
            direccion: '',
            telefono: '',
            email: ''
        };
    };

    const autocalcularIngresos = () => {
        const ing = form.value.ingresos_descuentos;
        ing.total_ingresos =
            Number(ing.salario_basico_mensual || 0) +
            Number(ing.subsidio_transporte || 0) +
            Number(ing.horas_extras || 0) +
            Number(ing.comisiones || 0) +
            Number(ing.otros_ingresos || 0);

        ing.total_descuentos =
            Number(ing.salud_pension || 0) +
            Number(ing.libranzas_comfaca || 0) +
            Number(ing.otras_libranzas || 0) +
            Number(ing.judiciales || 0) +
            Number(ing.otras_deducciones || 0);

        ing.total_neto_recibido = Math.max(ing.total_ingresos - ing.total_descuentos, 0);
    };

    // Array manipulation functions
    const addPropiedad = () => {
        form.value.propiedades.push({
            tipo_bien: 'vivienda',
            descripcion: '',
            ciudad: '',
            matricula_inmobiliaria: '',
            valor_comercial: 0
        });
    };

    const removePropiedad = (idx: number) => {
        form.value.propiedades.splice(idx, 1);
    };

    const addDeuda = () => {
        form.value.deudas.push({
            acreedor_nombre: '',
            concepto: '',
            valor_cuota: 0,
            saldo_obligacion: 0
        });
    };

    const removeDeuda = (idx: number) => {
        form.value.deudas.splice(idx, 1);
    };

    const addReferencia = (kind: 'familiares' | 'personales') => {
        form.value.referencias[kind].push({ nombre_apellidos: '', celular: '' });
    };

    const removeReferencia = (kind: 'familiares' | 'personales', idx: number) => {
        form.value.referencias[kind].splice(idx, 1);
    };

    // Modal functions
    const closeSuccessModal = () => {
        successModalOpen.value = false;
    };

    const goToHome = async () => {
        successModalOpen.value = false;
        await router.push('/');
    };

    const goToFirmas = async () => {
        const filename = savedFilename.value;
        if (!filename) return;
        successModalOpen.value = false;
        await router.push({ path: '/firmas', query: { solicitud_filename: filename } });
    };

    // XML generation and download
    const generarXml = async (saveXml: boolean) => {
        loadingXml.value = true;
        errorMsg.value = '';
        savedFilename.value = '';
        createdSolicitudId.value = '';
        successModalOpen.value = false;

        try {
            const res = await fetch('/api/solicitud-credito/xml', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    ...(authHeader.value as any)
                },
                body: JSON.stringify({
                    ...form.value,
                    save_xml: saveXml
                })
            });

            if (!res.ok) {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const data = await res.json().catch(() => null);
                    throw new Error(data?.error || `Error HTTP ${res.status}`);
                }
                const text = await res.text().catch(() => '');
                throw new Error(text || `Error HTTP ${res.status}`);
            }

            const header = res.headers.get('x-saved-filename');
            if (header) {
                savedFilename.value = header;
            }

            const solicitudHeader = res.headers.get('x-solicitud-id');
            if (solicitudHeader) {
                createdSolicitudId.value = solicitudHeader;
            }

            xmlText.value = await res.text();

            if (saveXml) {
                // Persistimos datos del firmante en localStorage
                if (process.client) {
                    try {
                        localStorage.setItem(
                            FIRMA_DEFAULTS_STORAGE_KEY,
                            JSON.stringify({
                                nombre_apellidos: String(form.value.solicitante?.nombres_apellidos || ''),
                                tipo_identificacion: String(form.value.solicitante?.tipo_identificacion || ''),
                                numero_identificacion: String(form.value.solicitante?.numero_identificacion || '')
                            })
                        );
                    } catch {
                        // noop
                    }
                }
                successModalOpen.value = true;
            }
        } catch (e: any) {
            xmlText.value = '';
            savedFilename.value = '';
            createdSolicitudId.value = '';
            errorMsg.value = e?.data?.error || e?.message || 'Error generando XML';
        } finally {
            loadingXml.value = false;
        }
    };

    const downloadXml = () => {
        if (!xmlText.value) return;
        const blob = new Blob([xmlText.value], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = savedFilename.value || 'solicitud-credito.xml';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Field component
    const Field = defineComponent({
        name: 'Field',
        props: {
            label: { type: String, required: true }
        },
        setup(props, ctx) {
            return () => {
                const attrs = ctx.attrs as Record<string, unknown>;
                return h(
                    'label',
                    {
                        ...attrs,
                        class: ['grid gap-1', attrs.class]
                    },
                    [
                        h('span', { class: 'text-sm font-medium text-zinc-700' }, props.label),
                        ...(ctx.slots.default ? ctx.slots.default() : [])
                    ]
                );
            };
        }
    });

    return {
        // Form
        form,

        // State
        step,
        loadingXml,
        xmlText,
        savedFilename,
        createdSolicitudId,
        errorMsg,
        successModalOpen,
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
        goToFirmas,

        // XML operations
        generarXml,
        downloadXml,

        // Components
        Field
    };
}
