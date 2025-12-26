// frontend/pages/auth/useRegistro.ts
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import { storage } from '~/composables/useStorage';

interface RegistroData {
    tipo_documento: string;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    email: string;
    username: string;
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
        username: '',
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
        access_token?: string;
        token_type?: string;
        user?: {
            username: string;
            roles: string[];
        };
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

            const response = await postJson<ResponseRegister>('/api/auth/register', datosRegistro);

            if (response) {
                success.value = true;

                // Guardar datos completos del usuario en localStorage
                const userData = {
                    username: response.user?.username || '',
                    email: formData.value.email,
                    tipo_documento: formData.value.tipo_documento,
                    numero_documento: formData.value.numero_documento,
                    nombres: formData.value.nombres,
                    apellidos: formData.value.apellidos,
                    roles: response.user?.roles || ['user']
                };

                await storage.setItem('comfaca_credito_user', JSON.stringify(userData));

                return true;
            } else {
                error.value = 'Error en el registro. Por favor, inténtalo de nuevo.';
                return false;
            }
        } catch (err: any) {
            console.error('Error en el registro:', err);

            // Manejar errores específicos del backend
            if (err.response?.status === 409) {
                error.value = 'El usuario ya existe. Por favor, usa otro nombre de usuario o inicia sesión.';
            } else if (err.response?.data?.error) {
                error.value = err.response.data.error;
            } else {
                error.value = 'Error en el registro. Por favor, inténtalo de nuevo.';
            }

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