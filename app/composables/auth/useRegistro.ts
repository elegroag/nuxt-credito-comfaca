// frontend/pages/auth/useRegistro.ts
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';

interface RegistroData {
    tipo_documento: string;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    email: string;
    password: string;
    confirmar_password: string;
}

export function useRegistro() {
    const router = useRouter();
    const { postJson } = useApi();

    const formData = ref<RegistroData>({
        tipo_documento: 'CC', // Valor por defecto
        numero_documento: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        password: '',
        confirmar_password: ''
    });

    const loading = ref(false);
    const error = ref<string | null>(null);
    const success = ref(false);

    const tiposDocumento = [
        { value: 'CC', label: 'Cédula de Ciudadanía' },
        { value: 'CE', label: 'Cédula de Extranjería' },
        { value: 'PASAPORTE', label: 'Pasaporte' },
        { value: 'NIT', label: 'NIT' }
    ];

    interface ResponseRegister {
        success: boolean;
        message: string;
    }

    const registrar = async () => {
        if (formData.value.password !== formData.value.confirmar_password) {
            error.value = 'Las contraseñas no coinciden';
            return false;
        }

        try {
            loading.value = true;
            error.value = null;

            // Eliminar confirmar_password antes de enviar
            const { confirmar_password, ...datosRegistro } = formData.value;

            const response = await postJson<ResponseRegister>('/api/auth/registro', datosRegistro);

            if (response && response.success) {
                success.value = true;
                return true;
            } else {
                error.value = 'Error en el registro. Por favor, inténtalo de nuevo.';
                return false;
            }
        } catch (err: any) {
            console.error('Error en el registro:', err);
            error.value = err.response?.data?.message || 'Error en el registro. Por favor, inténtalo de nuevo.';
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        formData,
        loading,
        error,
        success,
        tiposDocumento,
        registrar
    };
}