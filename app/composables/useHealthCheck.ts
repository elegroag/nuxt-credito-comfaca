import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type { HealthStatus } from '~/shared/types/layout'

export function useHealthCheck(): HealthStatus & { checkConnection: () => Promise<void> } {
    const { baseUrl } = useApi()
    const isConnected = ref(false)
    const connectionError = ref('')
    const checkingConnection = ref(true)

    const connectionMessage = computed(() => {
        if (checkingConnection.value) return 'Verificando conexión con el servidor...'
        if (connectionError.value) return `Error de conexión: ${connectionError.value}`
        if (isConnected.value) return 'Conectado'
        return 'Sin conexión'
    })

    const connectionStatusClass = computed(() => {
        if (checkingConnection.value) return 'bg-blue-50 text-blue-800 border border-blue-200'
        if (connectionError.value) return 'bg-red-50 text-red-800 border border-red-200'
        if (isConnected.value) return 'bg-green-50 text-green-800 border border-green-200'
        return 'bg-gray-50 text-gray-800 border border-gray-200'
    })

    const checkConnection = async () => {
        try {
            checkingConnection.value = true
            connectionError.value = ''

            const response = await fetch(`${baseUrl.value}/api/health`)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            await response.json()
            isConnected.value = true
        } catch (error: any) {
            isConnected.value = false
            connectionError.value = error?.message || 'No se puede conectar al servidor'
        } finally {
            checkingConnection.value = false
        }
    }

    return {
        isConnected: isConnected as any,
        connectionError: connectionError as any,
        checkingConnection: checkingConnection as any,
        connectionMessage: connectionMessage as any,
        connectionStatusClass: connectionStatusClass as any,
        checkConnection
    }
}
