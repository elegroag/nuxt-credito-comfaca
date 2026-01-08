import { ref, watch, readonly } from 'vue'
import type { SimuladorStorageData } from '~/shared/types/simulador'

const STORAGE_KEY = 'simulador_data'

// Estado reactivo para los datos del simulador
const simuladorData = ref<SimuladorStorageData | null>(null)

// Cargar datos desde localStorage
const loadSimuladorData = (): SimuladorStorageData | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const data = JSON.parse(stored) as SimuladorStorageData
            simuladorData.value = data
            return data
        }
    } catch (error) {
        console.error('Error cargando datos del simulador:', error)
        // Limpiar datos corruptos
        localStorage.removeItem(STORAGE_KEY)
    }
    return null
}

// Guardar datos en localStorage
const saveSimuladorData = (data: SimuladorStorageData): void => {
    try {
        // Validar datos antes de guardar
        if (!data || !data.lineaCredito) {
            throw new Error('Datos del simulador inválidos')
        }

        const dataToStore: SimuladorStorageData = {
            ...data,
            fechaSimulacion: data.fechaSimulacion || new Date().toISOString()
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
        simuladorData.value = dataToStore
    } catch (error) {
        console.error('Error guardando datos del simulador:', error)
    }
}

// Guardar datos sin actualizar el estado reactivo (para evitar recursión)
const saveSimuladorDataSilent = (data: SimuladorStorageData): void => {
    try {
        if (!data || !data.lineaCredito) {
            return
        }

        const dataToStore: SimuladorStorageData = {
            ...data,
            fechaSimulacion: data.fechaSimulacion || new Date().toISOString()
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
    } catch (error) {
        console.error('Error guardando datos del simulador:', error)
    }
}

// Limpiar datos del simulador
const clearSimuladorData = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY)
        simuladorData.value = null
    } catch (error) {
        console.error('Error limpiando datos del simulador:', error)
    }
}

// Actualizar datos específicos
const updateSimuladorData = (updates: Partial<SimuladorStorageData>): void => {
    if (simuladorData.value) {
        const updatedData = { ...simuladorData.value, ...updates }
        saveSimuladorData(updatedData)
    }
}

// Obtener datos formateados para solicitud
const getDatosParaSolicitud = () => {
    const data = simuladorData.value
    if (!data) return null

    return {
        lineaCredito: data.lineaCredito,
        valorSolicitud: data.montoCredito,
        plazoMeses: data.plazoMeses,
        tasaInteres: data.tasaInteresAnual,
        cuotaMensual: data.cuotaMensual,
        totalIntereses: data.totalIntereses,
        totalPagar: data.totalPagar,
        fechaSimulacion: data.fechaSimulacion
    }
}

// Verificar si hay datos disponibles
const hasSimuladorData = (): boolean => {
    return simuladorData.value !== null
}

// Watch para persistir cambios automáticamente
watch(simuladorData, (newValue) => {
    if (newValue) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
        } catch (error) {
            console.error('Error guardando datos del simulador:', error)
        }
    }
}, { deep: true })

export const useSimuladorStorage = () => {
    // Inicializar cargando datos existentes
    if (!simuladorData.value) {
        loadSimuladorData()
    }

    return {
        // Estado
        simuladorData: readonly(simuladorData),

        // Acciones
        loadSimuladorData,
        saveSimuladorData,
        saveSimuladorDataSilent,
        clearSimuladorData,
        updateSimuladorData,

        // Utilidades
        getDatosParaSolicitud,
        hasSimuladorData
    }
}
