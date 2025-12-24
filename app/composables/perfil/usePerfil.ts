// frontend/pages/perfil/usePerfil.ts
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSession } from '~/composables/useSession';
import { useApi } from '~/composables/useApi';
import { $fetch } from 'ofetch';

interface Perfil {
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
}

interface PasswordData {
    password_actual: string;
    nueva_password: string;
    confirmar_password: string;
}

export function usePerfil() {
    const router = useRouter();
    const { session, setSession } = useSession();
    const { baseUrl, postJson } = useApi();

    const perfil = ref<Perfil>({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    const passwordData = ref<PasswordData>({
        password_actual: '',
        nueva_password: '',
        confirmar_password: ''
    });

    const loading = ref(false);
    const guardando = ref(false);
    const error = ref<string | null>(null);
    const success = ref(false);

    // Validar contraseña
    const validarPassword = () => {
        if (!passwordData.value.nueva_password && !passwordData.value.password_actual) {
            return true; // No se está cambiando la contraseña
        }

        if (!passwordData.value.password_actual) {
            error.value = 'Debes ingresar la contraseña actual';
            return false;
        }

        if (passwordData.value.nueva_password.length < 6) {
            error.value = 'La nueva contraseña debe tener al menos 6 caracteres';
            return false;
        }

        if (passwordData.value.nueva_password !== passwordData.value.confirmar_password) {
            error.value = 'Las contraseñas no coinciden';
            return false;
        }

        return true;
    };

    // Cargar datos del perfil
    const cargarPerfil = async () => {
        try {
            loading.value = true;

            // Obtener datos de identificación desde localStorage
            const userData = localStorage.getItem('comfaca_credito_user');
            let tipo_identificacion = '';
            let numero_identificacion = '';

            if (userData) {
                const user = JSON.parse(userData);
                tipo_identificacion = user.tipo_documento || '';
                numero_identificacion = user.numero_documento || '';
            }

            // Construir URL con query params si hay datos de identificación
            let url = '/api/auth/perfil';
            if (tipo_identificacion && numero_identificacion) {
                url += `?tipo_identificacion=${encodeURIComponent(tipo_identificacion)}&numero_identificacion=${encodeURIComponent(numero_identificacion)}`;
            }

            const data = await $fetch(url, {
                headers: session.value.accessToken ? { Authorization: `Bearer ${session.value.accessToken}` } : {}
            });

            // Actualizar perfil con los datos obtenidos
            if (data.success && data.data) {
                perfil.value = {
                    nombre: data.data.full_name || '',
                    email: data.data.email || '',
                    telefono: data.data.phone || '',
                    direccion: '' // No disponible en la respuesta actual
                };
            } else {
                // Fallback a datos existentes si el endpoint no funciona
                if (session.value.user) {
                    const user = session.value.user;
                    perfil.value = {
                        nombre: `${user.nombres || ''} ${user.apellidos || ''}`.trim(),
                        email: user.email || '',
                        telefono: '',
                        direccion: ''
                    };
                }
            }
        } catch (err) {
            console.error('Error al cargar perfil:', err);
            error.value = 'No se pudo cargar el perfil. Intenta de nuevo.';

            // Fallback a datos de sesión en caso de error
            if (session.value.user) {
                const user = session.value.user;
                perfil.value = {
                    nombre: `${user.nombres || ''} ${user.apellidos || ''}`.trim(),
                    email: user.email || '',
                    telefono: '',
                    direccion: ''
                };
            }
        } finally {
            loading.value = false;
        }
    };

    // Guardar cambios
    const guardarPerfil = async () => {
        try {
            guardando.value = true;
            error.value = null;
            success.value = false;

            // Validar contraseña si se está cambiando
            if (!validarPassword()) {
                guardando.value = false;
                return;
            }

            const payload: any = { ...perfil.value };

            // Agregar datos de contraseña solo si se está cambiando
            if (passwordData.value.nueva_password) {
                payload.password_actual = passwordData.value.password_actual;
                payload.nueva_password = passwordData.value.nueva_password;
            }

            const data = await $fetch('/api/auth/perfil', {
                method: 'PUT',
                headers: session.value.accessToken ? {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${session.value.accessToken}`
                } : { 'content-type': 'application/json' },
                body: payload
            });

            // Actualizar sesión si se devuelven datos de usuario
            if (data.usuario) {
                setSession({
                    ...session.value,
                    user: data.usuario
                });
            }

            success.value = true;

            // Limpiar campos de contraseña después de guardar
            passwordData.value = {
                password_actual: '',
                nueva_password: '',
                confirmar_password: ''
            };

            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => {
                success.value = false;
            }, 3000);

        } catch (err: any) {
            console.error('Error al guardar perfil:', err);
            error.value = err.data?.message || err.response?.data?.message || 'Error al guardar los cambios. Intenta de nuevo.';
        } finally {
            guardando.value = false;
        }
    };

    // Resetear formulario de contraseña
    const resetPasswordForm = () => {
        passwordData.value = {
            password_actual: '',
            nueva_password: '',
            confirmar_password: ''
        };
    };

    // Cargar perfil al montar el componente
    onMounted(async () => {
        if (!session.value || !session.value.user) {
            console.error('Usuario no autenticado');
            // Redirigir al login si no hay usuario
            router.push('/login');
            return;
        }

        // Inicializar con datos del usuario si existen
        if (session.value.user) {
            const user = session.value.user;
            perfil.value = {
                nombre: `${user.nombres || ''} ${user.apellidos || ''}`.trim(),
                email: user.email || '',
                telefono: '', // No disponible en SessionUser
                direccion: '' // No disponible en SessionUser
            };
        }

        await cargarPerfil();
    });

    return {
        perfil,
        passwordData,
        loading,
        guardando,
        error,
        success,
        guardarPerfil,
        resetPasswordForm
    };
}