import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';

export interface EditUserForm {
    // Información básica
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    rol: string;
    estado: string;

    // Datos personales
    nombre: string;
    apellido: string;
    tipo_identificacion: string;
    numero_documento: string;
    telefono: string;
    codigo_categoria: string;

    // Datos empresa
    empresa_nit: string;
    empresa_razon_social: string;

    // Dirección
    direccion: string;
    ciudad: string;
    barrio: string;
    tipo_vivienda: string;
    personas_a_cargo: number;
}

export function useEditUser() {
    const router = useRouter();
    const route = useRoute();
    const { getJson, putJson } = useApi();
    const { ready } = useSession();

    // Estado
    const loading = ref(false);
    const error = ref('');
    const usuario = ref<any>(null);

    // Formulario reactivo
    const form = reactive<EditUserForm>({
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

    // Errores
    const errors = ref<Record<string, string>>({});

    // Cargar usuario
    const cargarUsuario = async () => {
        loading.value = true;
        error.value = '';

        try {
            await ready;

            const response = await getJson<{
                success: boolean;
                data: any;
                message?: string;
            }>(`/api/admin/users/${route.params.id}`, { auth: true });

            if (response.success && response.data) {
                usuario.value = response.data;

                // Cargar formulario con datos del usuario
                form.username = response.data.username || '';
                form.email = response.data.email || '';
                form.nombre = response.data.nombre || '';
                form.apellido = response.data.apellido || '';
                form.rol = response.data.rol || '';
                form.estado = response.data.estado || 'active';
                form.tipo_identificacion = response.data.tipo_identificacion || '';
                form.numero_documento = response.data.numero_documento || '';
                form.telefono = response.data.telefono || '';
                form.codigo_categoria = response.data.codigo_categoria || '';
                form.empresa_nit = response.data.empresa_nit || '';
                form.empresa_razon_social = response.data.empresa_razon_social || '';
                form.direccion = response.data.direccion || '';
                form.ciudad = response.data.ciudad || '';
                form.barrio = response.data.barrio || '';
                form.tipo_vivienda = response.data.tipo_vivienda || '';
                form.personas_a_cargo = response.data.personas_a_cargo || 0;
            } else {
                error.value = response.message || 'No se pudo cargar la información del usuario';
            }
        } catch (err: any) {
            console.error('Error al cargar usuario:', err);
            error.value = err.message || 'Error al cargar el usuario';
        } finally {
            loading.value = false;
        }
    };

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

        // Validar contraseña solo si se proporciona
        if (form.password) {
            if (form.password.length < 8) {
                errors.value.password = 'La contraseña debe tener al menos 8 caracteres';
            }

            if (form.confirmPassword) {
                if (form.password !== form.confirmPassword) {
                    errors.value.confirmPassword = 'Las contraseñas no coinciden';
                }
            }
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

        try {
            await ready;

            // Preparar payload para el backend
            const payload: any = {
                username: form.username.trim(),
                email: form.email.trim(),
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

            // Agregar contraseña solo si se proporciona
            if (form.password) {
                payload.password = form.password;
            }

            const response = await putJson<{
                success: boolean;
                message: string;
            }>(`/api/admin/users/${route.params.id}`, payload, { auth: true });

            if (response.success) {
                // Redirigir a la página de detalle
                router.push(`/admin/users/show/${route.params.id}`);
            } else {
                // Mostrar error genérico
                errors.value.general = response.message || 'Error al actualizar el usuario';
            }
        } catch (error: any) {
            console.error('Error al actualizar usuario:', error);

            // Manejar errores específicos del backend
            if (error.message?.includes('username')) {
                errors.value.username = 'El nombre de usuario ya existe';
            } else if (error.message?.includes('email')) {
                errors.value.email = 'El email ya está registrado';
            } else {
                errors.value.general = error.message || 'Error al actualizar el usuario';
            }
        } finally {
            loading.value = false;
        }
    };

    // Resetear formulario a datos originales
    const resetForm = () => {
        if (usuario.value) {
            form.username = usuario.value.username || '';
            form.email = usuario.value.email || '';
            form.nombre = usuario.value.nombre || '';
            form.apellido = usuario.value.apellido || '';
            form.rol = usuario.value.rol || '';
            form.estado = usuario.value.estado || 'active';
            form.tipo_identificacion = usuario.value.tipo_identificacion || '';
            form.numero_documento = usuario.value.numero_documento || '';
            form.telefono = usuario.value.telefono || '';
            form.codigo_categoria = usuario.value.codigo_categoria || '';
            form.empresa_nit = usuario.value.empresa_nit || '';
            form.empresa_razon_social = usuario.value.empresa_razon_social || '';
            form.direccion = usuario.value.direccion || '';
            form.ciudad = usuario.value.ciudad || '';
            form.barrio = usuario.value.barrio || '';
            form.tipo_vivienda = usuario.value.tipo_vivienda || '';
            form.personas_a_cargo = usuario.value.personas_a_cargo || 0;
            form.password = '';
            form.confirmPassword = '';
        }
        errors.value = {};
    };

    // Navegación
    const goBack = () => {
        router.back();
    };

    // Lifecycle
    onMounted(() => {
        cargarUsuario();
    });

    // Retornar todo lo necesario
    return {
        // Estado
        loading,
        error,
        usuario,
        errors,
        form,

        // Métodos
        cargarUsuario,
        validateForm,
        handleSubmit,
        resetForm,
        goBack,
    };
}
