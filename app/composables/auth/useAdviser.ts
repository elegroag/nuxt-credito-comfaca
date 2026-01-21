// frontend/composables/auth/useAdviser.ts
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useSession } from '~/composables/useSession';
import type { LoginData } from '~/shared/types/auth';

export function useAdviser() {
  const router = useRouter();
  const route = useRoute();
  const { postJson } = useApi();
  const { isAuthenticated, setSession } = useSession();

  const adviserNumber = ref('');
  const username = ref('');
  const password = ref('');
  const loading = ref(false);
  const errorMsg = ref('');

  const login = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
      const response = await postJson<any>('/api/auth/adviser/login', {
        adviser_number: adviserNumber.value,
        username: username.value,
        password: password.value
      });

      const data = response.data;

      const accessToken = String(data?.access_token || '');
      const tokenType = String(data?.token_type || 'bearer');
      const user = data?.user;

      if (!accessToken) {
        throw new Error('Respuesta inválida de autenticación');
      }

      // Validar que el usuario tenga rol de asesor
      const userRoles = Array.isArray(user?.roles) ? user.roles : [];
      if (!userRoles.includes('adviser')) {
        throw new Error('El usuario no tiene rol de asesor');
      }

      setSession({
        accessToken,
        tokenType,
        user: {
          username: typeof user?.username === 'string' ? user.username : username.value,
          roles: userRoles,
          email: typeof user?.email === 'string' ? user.email : '',
          tipo_documento: typeof user?.tipo_documento === 'string' ? user.tipo_documento : '',
          numero_documento: typeof user?.numero_documento === 'string' ? user.numero_documento : '',
          nombres: typeof user?.nombres === 'string' ? user.nombres : '',
          apellidos: typeof user?.apellidos === 'string' ? user.apellidos : '',
          adviser_number: adviserNumber.value
        }
      });

      // Redirigir al dashboard de asesores
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/adviser/dashboard';
      await navigateTo(redirect.startsWith('/') ? redirect : '/');

      return true;
    } catch (e: any) {
      const status = Number(e?.statusCode || e?.response?.status || 0);
      const code = e?.data?.code;

      if (status === 404 && code === 'USER_NOT_FOUND') {
        errorMsg.value = 'Asesor no encontrado. Verifique el número de asesor y credenciales.';
      } else if (status === 401) {
        errorMsg.value = 'Credenciales incorrectas. Intente nuevamente.';
      } else if (status === 403) {
        errorMsg.value = 'El usuario no tiene permisos de asesor.';
      } else {
        errorMsg.value = e?.data?.error || e?.message || 'No fue posible iniciar sesión como asesor';
      }

      return false;
    } finally {
      loading.value = false;
    }
  };

  const checkAuthAndRedirect = async () => {
    const { ready } = useSession()
    await ready

    if (isAuthenticated.value) {
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/adviser/dashboard';
      await navigateTo(redirect.startsWith('/') ? redirect : '/');
    }
  };

  const validateForm = (): boolean => {
    errorMsg.value = '';

    if (!adviserNumber.value.trim()) {
      errorMsg.value = 'El número de asesor es requerido';
      return false;
    }

    if (!username.value.trim()) {
      errorMsg.value = 'El nombre de usuario es requerido';
      return false;
    }

    if (!password.value) {
      errorMsg.value = 'La contraseña es requerida';
      return false;
    }

    if (password.value.length < 6) {
      errorMsg.value = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  };

  return {
    adviserNumber,
    username,
    password,
    loading,
    errorMsg,
    login,
    checkAuthAndRedirect,
    validateForm
  };
}