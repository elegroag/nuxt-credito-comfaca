// frontend/composables/entidad/useEntidadDigital.ts
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { navigateTo, useRuntimeConfig } from '#app';
import { useApi } from '~/composables/useApi';
import { storage } from '~/composables/useStorage';
import QRCode from 'qrcode';
import { io, Socket } from 'socket.io-client';

export function useEntidadDigital() {
    const route = useRoute();
    const config = useRuntimeConfig();
    const { postJson, getJson } = useApi();

    // Form state
    const tipoIdentificacion = ref<'CC' | 'CE' | 'NIT' | 'PAS'>('CC');
    const numeroIdentificacion = ref('');
    const clave = ref('');
    const claveConfirm = ref('');
    const overwrite = ref(false);

    // UI state
    const loading = ref(false);
    const errorMsg = ref('');
    const result = ref<any | null>(null);

    // Flow state
    const currentStep = ref<'basic' | 'qr'>('basic');
    const qrCodeUrl = ref<string>('');
    const loadingQR = ref(false);
    const tokenExpired = ref(false);
    const timeRemaining = ref(1200); // 20 minutos en segundos
    let countdownInterval: any = null;
    let socket: Socket | null = null;

    const isCapturasConfirmadas = ref(false);

    // Navigation state
    const redirectTo = ref('');

    // Computed
    const isBasicFormValid = computed(() => {
        return tipoIdentificacion.value && numeroIdentificacion.value;
    });

    const timeRemainingClass = computed(() => {
        if (timeRemaining.value <= 60) return 'text-red-600';
        if (timeRemaining.value <= 300) return 'text-yellow-600';
        return 'text-green-600';
    });

    // Initialize from query params or storage
    onMounted(async () => {
        const t = route.query.tipo_identificacion;
        const n = route.query.numero_identificacion;
        const r = route.query.redirect;

        if (typeof t === 'string' && (t === 'CC' || t === 'CE' || t === 'NIT' || t === 'PAS')) {
            tipoIdentificacion.value = t;
        }
        if (typeof n === 'string' && n.trim()) {
            numeroIdentificacion.value = n;
        }
        if (typeof r === 'string' && r.startsWith('/')) {
            redirectTo.value = r;
        }

        // Cargar datos guardados si no vienen por query
        if (!numeroIdentificacion.value) {
            const savedData = await storage.getItem('basicFormData');
            if (savedData) {
                const data = JSON.parse(savedData);
                tipoIdentificacion.value = data.tipoIdentificacion || 'CC';
                numeroIdentificacion.value = data.numeroIdentificacion || '';
            }
        }
    });

    onUnmounted(() => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        if (socket) {
            socket.disconnect();
        }
    });

    // Form validation
    const validateForm = () => {
        if (!numeroIdentificacion.value.trim()) {
            errorMsg.value = 'El número de identificación es requerido.';
            return false;
        }

        if (clave.value.length < 10) {
            errorMsg.value = 'La clave debe tener al menos 10 caracteres.';
            return false;
        }

        if (clave.value !== claveConfirm.value) {
            errorMsg.value = 'La confirmación de clave no coincide.';
            return false;
        }

        return true;
    };

    // Helper functions
    const formatTimeRemaining = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const startCountdown = (initialSeconds: number = 1200) => {
        timeRemaining.value = initialSeconds;
        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            timeRemaining.value--;
            if (timeRemaining.value <= 0) {
                tokenExpired.value = true;
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                }
            }
        }, 1000);
    };

    const initSocket = (username: string) => {
        const backendUrl = config.public.backendBaseUrl || 'http://localhost:5001';
        socket = io(backendUrl);

        socket.on('connect', () => {
            console.log('Socket conectado para:', username);
        });

        socket.on(`auth_complete_${username}`, async (data: any) => {
            console.log('Autorización recibida:', data);
            // Cuando la app móvil autoriza, pasamos al siguiente estado o mostramos éxito
            result.value = data;
            // Aquí se podría redirigir o actualizar el estado para mostrar que ya se puede continuar
        });

        socket.on(`confirma_capturas_${username}`, async (response: any) => {
            console.log('Confirmación de capturas recibida:', response);
            if (!response.success) {
                errorMsg.value = response.error || 'Error al confirmar capturas';
                return;
            }

            // Guardar los datos de captura en el storage para que confirmation.vue los use
            await storage.setItem('completeVerificationData', JSON.stringify(response.data));

            // Actualizar estado para que la UI reaccione
            result.value = response.data;
            isCapturasConfirmadas.value = true;

            // Redirigir a la página de confirmación
            await navigateTo('/entidad-digital/confirmation');
        });
    };

    const generateQR = async (canvasRef: HTMLCanvasElement | null) => {
        try {
            loadingQR.value = true;
            tokenExpired.value = false;
            errorMsg.value = '';

            // Obtener token real del backend con autenticación
            const response = await getJson<any>('/api/auth/qr-token', { auth: true });
            if (!response.success) {
                throw new Error(response.error || 'Error al obtener token');
            }

            const qrToken = response.qr_token;
            const username = response.user.username;
            const backendUrl = config.public.backendBaseUrl || 'http://localhost:5001';
            const authUrl = `${backendUrl}/api/auth/mobile/authorize/${qrToken}`;
            console.log('URL del QR:', authUrl);

            await nextTick();
            if (canvasRef) {
                await QRCode.toCanvas(canvasRef, authUrl, {
                    width: 256,
                    margin: 2,
                    color: { dark: '#000000', light: '#FFFFFF' }
                });
            }

            qrCodeUrl.value = authUrl;

            // Calcular tiempo restante basado en expires_at del backend
            const now = Math.floor(Date.now() / 1000);
            const remaining = response.expires_at - now;
            startCountdown(remaining > 0 ? remaining : 0);

            // Inicializar socket para escuchar autorización
            initSocket(username);

        } catch (error: any) {
            console.error('Error generando QR:', error);
            errorMsg.value = error.message || 'Error al generar el código QR. Por favor intenta nuevamente.';
        } finally {
            loadingQR.value = false;
        }
    };

    // Flow Actions
    const nextToQR = async (canvasRef: HTMLCanvasElement | null) => {
        if (!isBasicFormValid.value) {
            errorMsg.value = 'Por favor completa todos los campos correctamente';
            return;
        }

        const basicData = {
            tipoIdentificacion: tipoIdentificacion.value,
            numeroIdentificacion: numeroIdentificacion.value
        };
        await storage.setItem('basicFormData', JSON.stringify(basicData));

        errorMsg.value = '';
        currentStep.value = 'qr';
        await generateQR(canvasRef);
    };

    const goBack = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        currentStep.value = 'basic';
        qrCodeUrl.value = '';
        tokenExpired.value = false;
    };

    const resetForm = () => {
        tipoIdentificacion.value = 'CC';
        numeroIdentificacion.value = '';
        clave.value = '';
        claveConfirm.value = '';
        overwrite.value = false;
        errorMsg.value = '';
        result.value = null;
    };

    const crear = async () => {
        errorMsg.value = '';
        result.value = null;

        if (!validateForm()) return;

        loading.value = true;
        try {
            const userSession = await storage.getItem('comfaca_credito_user');
            let username = '';

            if (userSession) {
                const userData = JSON.parse(userSession);
                username = userData.username || '';
            }

            if (!username) throw new Error('No se encontró sesión de usuario activa');

            const completeData = await storage.getItem('completeVerificationData');
            let documentos = {};
            let selfie = '';

            if (completeData) {
                const data = JSON.parse(completeData);
                documentos = data.documents || {};
                selfie = data.selfie || '';
            }

            result.value = await postJson<any>('/api/entidad-digital/completo', {
                username: username,
                tipo_identificacion: tipoIdentificacion.value,
                numero_identificacion: numeroIdentificacion.value,
                clave: clave.value,
                documentos: documentos,
                selfie: selfie
            });

            if (redirectTo.value) {
                await navigateTo(redirectTo.value);
            }
        } catch (e: any) {
            errorMsg.value = e?.data?.error || e?.message || 'Error creando entidad digital';
        } finally {
            loading.value = false;
        }
    };

    return {
        // State
        tipoIdentificacion,
        numeroIdentificacion,
        clave,
        claveConfirm,
        overwrite,
        loading,
        errorMsg,
        result,
        currentStep,
        qrCodeUrl,
        loadingQR,
        tokenExpired,
        timeRemaining,
        isCapturasConfirmadas,

        // Computed
        isBasicFormValid,
        timeRemainingClass,

        // Actions
        crear,
        resetForm,
        validateForm,
        formatTimeRemaining,
        generateQR,
        nextToQR,
        goBack
    };
}
