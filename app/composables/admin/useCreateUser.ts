import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import type { CreateUserForm } from '~/shared/types/admin_usuarios';

export function useCreateUser() {
    const router = useRouter();
    const { postJson } = useApi();
    const { ready } = useSession();

    // Estado del formulario
    const loading = ref(false);
    const errors = ref<Record<string, string>>({});

    // Formulario reactivo
    const form = reactive<CreateUserForm>({
        // Información básica
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol: '',
        estado: 'active',

        // Datos personales
        nombre: '',
        apellido: '',
        tipo_identificacion: '',
        numero_documento: '',
        telefono: '',
        codigo_categoria: '',

        // Datos empresa
        empresa_nit: '',
        empresa_razon_social: '',

        // Dirección
        direccion: '',
        ciudad: '',
        barrio: '',
        tipo_vivienda: '',
        personas_a_cargo: 0,
    });

    // Validaciones
    const validateForm = (): boolean => {
        errors.value = {};

        // Validar username
        if (!form.username.trim()) {
            errors.value.username = 'El nombre de usuario es requerido';
        } else if (form.username.length < 3) {
            errors.value.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim()) {
            errors.value.email = 'El email es requerido';
        } else if (!emailRegex.test(form.email)) {
            errors.value.email = 'El formato del email no es válido';
        }

        // Validar contraseña
        if (!form.password) {
            errors.value.password = 'La contraseña es requerida';
        } else if (form.password.length < 8) {
            errors.value.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        // Validar confirmación de contraseña
        if (!form.confirmPassword) {
            errors.value.confirmPassword = 'La confirmación de contraseña es requerida';
        } else if (form.password !== form.confirmPassword) {
            errors.value.confirmPassword = 'Las contraseñas no coinciden';
        }

        // Validar rol
        if (!form.rol) {
            errors.value.rol = 'Debe seleccionar un rol';
        }

        // Validar nombre
        if (!form.nombre.trim()) {
            errors.value.nombre = 'El nombre es requerido';
        }

        // Validar apellido
        if (!form.apellido.trim()) {
            errors.value.apellido = 'El apellido es requerido';
        }

        // Validar número de documento si se proporciona tipo
        if (form.tipo_identificacion && !form.numero_documento.trim()) {
            errors.value.numero_documento = 'El número de documento es requerido cuando se especifica el tipo';
        }

        return Object.keys(errors.value).length === 0;
    };

    // Enviar formulario
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        loading.value = true;
        errors.value = {};

        try {
            await ready;

            // Preparar payload para el backend
            const payload = {
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                nombre: form.nombre.trim(),
                apellido: form.apellido.trim(),
                roles: [form.rol],
                estado: form.estado,
                tipo_identificacion: form.tipo_identificacion,
                numero_documento: form.numero_documento.trim(),
                telefono: form.telefono.trim(),
                codigo_categoria: form.codigo_categoria.trim(),
                empresa_nit: form.empresa_nit.trim(),
                empresa_razon_social: form.empresa_razon_social.trim(),
                direccion: form.direccion.trim(),
                ciudad: form.ciudad.trim(),
                barrio: form.barrio.trim(),
                tipo_vivienda: form.tipo_vivienda,
                personas_a_cargo: form.personas_a_cargo || 0,
            };

            const response = await postJson<{
                success: boolean;
                message: string;
                data?: any;
            }>('/api/admin/users', payload, { auth: true });

            if (response.success) {
                // Redirigir a la página de usuarios
                router.push('/admin/users');
            } else {
                // Mostrar error genérico
                errors.value.general = response.message || 'Error al crear el usuario';
            }
        } catch (error: any) {
            console.error('Error al crear usuario:', error);

            // Manejar errores específicos del backend
            if (error.message?.includes('username')) {
                errors.value.username = 'El nombre de usuario ya existe';
            } else if (error.message?.includes('email')) {
                errors.value.email = 'El email ya está registrado';
            } else {
                errors.value.general = error.message || 'Error al crear el usuario';
            }
        } finally {
            loading.value = false;
        }
    };

    // Resetear formulario
    const resetForm = () => {
        Object.assign(form, {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            rol: '',
            estado: 'active',
            nombre: '',
            apellido: '',
            tipo_identificacion: '',
            numero_documento: '',
            telefono: '',
            codigo_categoria: '',
            empresa_nit: '',
            empresa_razon_social: '',
            direccion: '',
            ciudad: '',
            barrio: '',
            tipo_vivienda: '',
            personas_a_cargo: 0,
        });
        errors.value = {};
    };

    // Navegación
    const goBack = () => {
        router.back();
    };

    // Retornar todo lo necesario
    return {
        // Estado
        loading,
        errors,
        form,

        // Métodos
        validateForm,
        handleSubmit,
        resetForm,
        goBack,
    };
}
