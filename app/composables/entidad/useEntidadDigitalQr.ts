import { ref, onUnmounted, computed, nextTick } from 'vue'
import { io, Socket } from 'socket.io-client'
import QRCode from 'qrcode'
import { useRuntimeConfig } from '#app'
import { useApi } from '~/composables/useApi'
import type { QrTokenResponse, SocketConfirmaCapturasResponse, EntidadDigitalVerificationData } from '~/shared/types/entidad'

export function useEntidadDigitalQr() {
    const config = useRuntimeConfig()
    const { getJson } = useApi()

    const qrCodeUrl = ref<string>('')
    const loadingQR = ref(false)
    const tokenExpired = ref(false)
    const timeRemaining = ref(1200)
    const isCapturasConfirmadas = ref(false)
    const socketResult = ref<any | null>(null)

    let countdownInterval: any = null
    let socket: Socket | null = null

    const timeRemainingClass = computed(() => {
        if (timeRemaining.value <= 60) return 'text-red-600'
        if (timeRemaining.value <= 300) return 'text-yellow-600'
        return 'text-green-600'
    })

    const formatTimeRemaining = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const startCountdown = (initialSeconds: number = 1200) => {
        timeRemaining.value = initialSeconds
        if (countdownInterval) clearInterval(countdownInterval)

        countdownInterval = setInterval(() => {
            timeRemaining.value--
            if (timeRemaining.value <= 0) {
                tokenExpired.value = true
                if (countdownInterval) {
                    clearInterval(countdownInterval)
                    countdownInterval = null
                }
            }
        }, 1000)
    }

    const initSocket = (username: string, onConfirm: (data: EntidadDigitalVerificationData) => void) => {
        const backendUrl = config.public.backendBaseUrl || 'http://localhost:5001'
        if (socket) socket.disconnect()

        socket = io(backendUrl)

        socket.on('connect', () => {
            console.log('Socket conectado para:', username)
        })

        socket.on(`auth_complete_${username}`, (data: any) => {
            socketResult.value = data
        })

        socket.on(`confirma_capturas_${username}`, (response: SocketConfirmaCapturasResponse) => {
            if (response.success) {
                isCapturasConfirmadas.value = true
                onConfirm(response.data)
            }
        })
    }

    const generateQR = async (username: string, canvasRef: HTMLCanvasElement | null, onConfirm: (data: EntidadDigitalVerificationData) => void) => {
        try {
            loadingQR.value = true
            tokenExpired.value = false

            const response = await getJson<QrTokenResponse>('/api/auth/qr-token', { auth: true })
            if (!response.success) throw new Error(response.error || 'Error al obtener token')

            const qrToken = response.data?.qr_token
            const backendUrl = config.public.backendBaseUrl || 'http://localhost:5001'
            const authUrl = `${backendUrl}/api/auth/mobile/authorize/${qrToken}`

            await nextTick()
            if (canvasRef) {
                await QRCode.toCanvas(canvasRef, authUrl, {
                    width: 256,
                    margin: 2,
                    color: { dark: '#000000', light: '#FFFFFF' }
                })
            }

            qrCodeUrl.value = authUrl
            const now = Math.floor(Date.now() / 1000)
            const remaining = response.data.expires_at - now
            startCountdown(remaining > 0 ? remaining : 0)

            initSocket(username, onConfirm)
        } catch (error: any) {
            console.error('Error generando QR:', error)
            throw error
        } finally {
            loadingQR.value = false
        }
    }

    const cleanup = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval)
            countdownInterval = null
        }
        if (socket) {
            socket.disconnect()
            socket = null
        }
    }

    onUnmounted(cleanup)

    return {
        qrCodeUrl,
        loadingQR,
        tokenExpired,
        timeRemaining,
        timeRemainingClass,
        isCapturasConfirmadas,
        socketResult,
        formatTimeRemaining,
        generateQR,
        cleanup
    }
}
