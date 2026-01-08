interface ConyugeResponse {
    success: boolean
    exception: number
    data: ConyugeData[]
}

interface ConyugeData {
    cedcon: string
    coddoc: string
    priape: string
    segape: string
    prinom: string
    segnom: string
    direccion: string
    telefono: string
    email: string
    codzon: string
    codcaj: string | null
    codocu: string
    nivedu: string
    captra: string
    salario: number
    tipsal: string
    fecsal: string
    tippag: string
    codcue: string
    ofides: string
    codgru: string
    codban: string
    numcue: string
    tipcue: string
    sexo: string
    estciv: string
    fecnac: string
    ciunac: string
    estado: string
    fecest: string | null
    numtar: string
    giass: string
    usuario: string
    fecact: string
    nombre: string
    cedtra: string
    comper: string
    fecafi: string
}

export const useConyugeTrabajador = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const data = ref<ConyugeData[]>([])
    const { postJson } = useApi()

    const buscarConyuge = async (cedulaTrabajador: string, estado = 'A'): Promise<ConyugeData[]> => {
        loading.value = true
        error.value = null

        try {
            const response = await postJson<ConyugeResponse>('/api/conyuge-trabajador', {
                cedtra: cedulaTrabajador,
                estado: estado || 'A'
            }, {
                auth: true,
                headers: {
                    'accept': '*/*'
                }
            })

            if (response.success && response.data && response.data.length > 0) {
                data.value = response.data
                return response.data
            } else {
                data.value = []
                return []
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
            error.value = errorMessage
            console.error('Error buscando cónyuge:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    const limpiarDatos = () => {
        data.value = []
        error.value = null
        loading.value = false
    }

    return {
        loading: readonly(loading),
        error: readonly(error),
        data: readonly(data),
        buscarConyuge,
        limpiarDatos
    }
}
