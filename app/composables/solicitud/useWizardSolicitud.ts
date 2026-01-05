import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSolicitudCreditoForm } from '~/composables/useSolicitudCreditoForm';
import { useSolicitudXmlActions } from './useSolicitudXmlActions';
import type { WizardStep } from '~/shared/types/solicitud-credito';

export function useWizardSolicitud() {
    const router = useRouter();
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
        removeReferencia
    } = useSolicitudCreditoForm();

    const {
        loadingXml,
        xmlText,
        savedFilename,
        createdSolicitudId,
        errorMsg,
        generarXml: _generarXml,
        downloadXml
    } = useSolicitudXmlActions();

    // Steps configuration
    const steps: WizardStep[] = [
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
    ];

    // Reactive state
    const step = ref(0);
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

    // XML generation
    const generarXml = async (saveXml: boolean) => {
        const success = await _generarXml(form.value, saveXml);
        if (success && saveXml) {
            successModalOpen.value = true;
        }
    };

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
        downloadXml
    };
}
