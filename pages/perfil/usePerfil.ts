// frontend/pages/perfil/usePerfil.ts
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSession } from '~/composables/useSession';
import { useApi } from '~/composables/useApi';

interface Perfil {
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
}

export function usePerfil() {
    const router = useRouter();
    const { user, updateUser } = useSession();
    const { getJson, putJson } = useApi();

    const perfil = ref<Perfil>({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    const loading = ref(false);
    const guardando = ref(false);
    const error = ref<string | null>(null);
    const success = ref(false);

    // Cargar datos del perfil
    const cargarPerfil = async () => {
        try {
            loading.value = true;
            const data = await getJson('/api/auth/perfil');
            perfil.value = { ...perfil.value, ...data };
        } catch (err) {
            console.error('Error al cargar perfil:', err);
            error.value = 'No se pudo cargar el perfil. Intenta de nuevo.';
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

            const data = await putJson('/api/auth/perfil', perfil.value);
            updateUser(data.usuario);
            success.value = true;

            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => {
                success.value = false;
            }, 3000);

        } catch (err: any) {
            console.error('Error al guardar perfil:', err);
            error.value = err.response?.data?.message || 'Error al guardar los cambios. Intenta de nuevo.';
        } finally {
            guardando.value = false;
        }
    };

    // Cargar perfil al montar el componente
    onMounted(async () => {
        if (!user || !user.value) {
            console.error('Usuario no autenticado');
            // Redirigir al login si no hay usuario
            router.push('/login');
            return;
        }

        // Inicializar con datos del usuario si existen
        if (user.value) {
            perfil.value = {
                nombre: user.value.nombre || '',
                email: user.value.email || '',
                telefono: user.value.telefono || '',
                direccion: user.value.direccion || ''
            };
        }

        await cargarPerfil();
    });

    return {
        perfil,
        loading,
        guardando,
        error,
        success,
        guardarPerfil
    };
}