// frontend/composables/auth/useLogin.ts
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import type { LoginData } from '~/shared/types/auth';

export function useLogin() {
    const router = useRouter();
    const route = useRoute();
    const { postJson } = useApi();
    const { isAuthenticated, setSession } = useSession();

    const username = ref('');
    const password = ref('');
    const loading = ref(false);
    const errorMsg = ref('');

    const login = async () => {
        loading.value = true;
        errorMsg.value = '';

        try {
            const data = await postJson<any>('/api/auth/login', {
                username: username.value,
                password: password.value
            });

            const accessToken = String(data?.access_token || '');
            const tokenType = String(data?.token_type || 'bearer');
            const user = data?.user;

            if (!accessToken) {
                throw new Error('Respuesta inválida de autenticación');
            }

            setSession({
                accessToken,
                tokenType,
                user: {
                    username: typeof user?.username === 'string' ? user.username : username.value,
                    roles: Array.isArray(user?.roles) ? user.roles : [],
                    email: typeof user?.email === 'string' ? user.email : '',
                    tipo_documento: typeof user?.tipo_documento === 'string' ? user.tipo_documento : '',
                    numero_documento: typeof user?.numero_documento === 'string' ? user.numero_documento : '',
                    nombres: typeof user?.nombres === 'string' ? user.nombres : '',
                    apellidos: typeof user?.apellidos === 'string' ? user.apellidos : '',
                }
            });

            const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
            await navigateTo(redirect.startsWith('/') ? redirect : '/');

            return true;
        } catch (e: any) {
            const status = Number(e?.statusCode || e?.response?.status || 0);
            const code = e?.data?.code;

            if (status === 404 && code === 'USER_NOT_FOUND') {
                const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
                const q = new URLSearchParams();
                if (username.value.trim()) q.set('username', username.value.trim());
                if (redirect) q.set('redirect', redirect);
                await navigateTo(`/registro?${q.toString()}`);
                return false;
            }

            errorMsg.value = e?.data?.error || e?.message || 'No fue posible iniciar sesión';
            return false;
        } finally {
            loading.value = false;
        }
    };

    const checkAuthAndRedirect = async () => {
        const { ready } = useSession()
        await ready

        if (isAuthenticated.value) {
            const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
            await navigateTo(redirect.startsWith('/') ? redirect : '/');
        }
    };

    return {
        username,
        password,
        loading,
        errorMsg,
        login,
        checkAuthAndRedirect
    };
}