import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSimuladorWithLinea } from './useSimuladorWithLinea'
import { useTrabajador } from '~/composables/useTrabajador'
import { useSimuladorStorage } from '~/composables/useSimuladorStorage'
import { useSimuladorConConvenio } from './useSimuladorConConvenio'
import { useApi } from '~/composables/useApi'

export const useSimuladorConLineaPage = () => {
  const route = useRoute()
  const { getJson } = useApi()
  const { trabajador, salario } = useTrabajador()
  const { saveSimuladorDataSilent } = useSimuladorStorage()

  // Composable de convenio
  const {
    nitEmpresa,
    cedulaTrabajador,
    convenioVerificado,
    isElegible,
    getMensajeError,
    validarConvenioAntesDSimular
  } = useSimuladorConConvenio()

  const tipcre = computed(() => route.params.tipcre as string)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const lineaSeleccionada = ref<any>(null)

  // Cache para líneas de crédito
  const lineasCache = ref<Map<string, any>>(new Map())

  // Usar el hook especializado para líneas de crédito
  const {
    monto,
    plazoMeses,
    tasaEfectivaAnual,
    tasaMensualInput,
    tipoTasa,
    ingresosMensuales,
    descuentosMensuales,
    maxEndeudamientoPct,
    montoSan,
    plazoMesesSan,
    tasaEASan,
    tasaMensualSan,
    ingresosSan,
    ingresosBrutosSan,
    descuentosSan,
    tasaMensual,
    cuotaMensual,
    totalPagar,
    intereses,
    capacidadDisponible,
    maxCuotaPermitida,
    margen,
    apto,
    fmt,
    fmtPct,
    reset,
    cambiarTipoTasa
  } = useSimuladorWithLinea(lineaSeleccionada)

  const navigateToLineas = () => {
    navigateTo('/simulador/lineas-credito')
  }

  // Validar que el monto no exceda el valor máximo y la cantidad de dígitos
  const validarMontoMaximo = () => {
    if (lineaSeleccionada.value.valmax) {
      const valmax = Number(lineaSeleccionada.value.valmax)
      const montoActual = Number(monto.value)

      // Validar que el monto no exceda el valor máximo
      if (montoActual > valmax) {
        monto.value = valmax
      }

      // Validar que la cantidad de dígitos no sea superior a la del valmax
      if (montoActual.toString().length > valmax.toString().length) {
        monto.value = valmax
      }
    }
  }


  // Cargar datos de la línea de crédito
  const cargarLineaCredito = async () => {
    try {
      loading.value = true
      error.value = null

      // Verificar cache primero
      if (lineasCache.value.has(tipcre.value)) {
        lineaSeleccionada.value = lineasCache.value.get(tipcre.value)
        console.log('Usando cache para línea:', tipcre.value)
      } else {
        // Consultar API si no está en cache
        const response = await getJson<{
          success: boolean
          message: string
          data: any[]
        }>('/api/lineas_credito/tipo-creditos', { auth: true })

        if (response.success) {
          // Guardar todas las líneas en cache
          response.data.forEach(linea => {
            lineasCache.value.set(linea.tipcre, linea)
          })

          // Obtener la línea específica
          lineaSeleccionada.value = response.data.find(linea => linea.tipcre === tipcre.value)

          if (!lineaSeleccionada.value) {
            error.value = 'Línea de crédito no encontrada'
          }
        } else {
          error.value = response.message || 'Error al cargar la línea de crédito'
        }
      }

      // Establecer ingresos mensuales del trabajador si está disponible
      if (trabajador.value && trabajador.value.salario) {
        ingresosMensuales.value = trabajador.value.salario
      }

      // Establecer descuentos mensuales por defecto en 0
      descuentosMensuales.value = 0

      // Establecer tasa según categoría del trabajador
      if (trabajador.value?.codigo_categoria && lineaSeleccionada.value?.categorias) {
        const categoriaTrabajador = String(trabajador.value.codigo_categoria).toLowerCase()
        const categoriaLinea = lineaSeleccionada.value.categorias.find(
          (cat: any) => cat && cat.codcat && String(cat.codcat).toLowerCase() === categoriaTrabajador
        )

        if (categoriaLinea && categoriaLinea.facfin) {
          tasaEfectivaAnual.value = parseFloat(categoriaLinea.facfin)
        }
      }

      // Validar convenio automáticamente si tiene datos del trabajador
      if (trabajador.value?.empresa?.nit && trabajador.value?.cedula) {
        nitEmpresa.value = trabajador.value.empresa.nit
        cedulaTrabajador.value = trabajador.value.cedula
        await validarConvenioAntesDSimular()
      }
    } catch (err) {
      console.error('Error cargando línea crédito:', err)
      error.value = 'No se pudo cargar la línea de crédito. Por favor, intenta nuevamente.'
    } finally {
      loading.value = false
    }
  }

  // Computed para manejar el v-model del input de tasa
  const tasaInput = computed({
    get: () => tipoTasa.value === 'anual' ? tasaEfectivaAnual.value : tasaMensualInput.value,
    set: (value) => {
      if (tipoTasa.value === 'anual') {
        tasaEfectivaAnual.value = value
      } else {
        tasaMensualInput.value = value
      }
    }
  })

  // Watch para guardar datos cuando cambien los valores del simulador (con debounce para evitar recursión)
  let saveTimeout: NodeJS.Timeout | null = null

  const saveData = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
      if (lineaSeleccionada.value && monto.value > 0) {
        saveSimuladorDataSilent({
          lineaCredito: lineaSeleccionada.value,
          monto: monto.value,
          montoCredito: monto.value,
          plazoMeses: plazoMeses.value,
          tasaEfectivaAnual: tasaEfectivaAnual.value,
          ingresosMensuales: ingresosMensuales.value,
          descuentosMensuales: descuentosMensuales.value,
          maxEndeudamientoPct: maxEndeudamientoPct.value,
          tasaInteresAnual: tasaEfectivaAnual.value,
          cuotaMensual: cuotaMensual.value,
          totalIntereses: intereses.value,
          totalPagar: totalPagar.value,
          fechaSimulacion: new Date().toISOString(),
          // Datos del convenio
          tieneConvenio: isElegible.value,
          convenioVerificado: convenioVerificado.value,
          nitEmpresa: nitEmpresa.value,
          cedulaTrabajador: cedulaTrabajador.value
        })
      }
    }, 500) // 500ms de debounce
  }

  // Watch para guardar datos cuando cambien
  watch(
    [
      monto,
      plazoMeses,
      tasaEfectivaAnual,
      ingresosMensuales,
      descuentosMensuales,
      cuotaMensual,
      totalPagar,
      intereses,
      lineaSeleccionada,
      isElegible,
      convenioVerificado
    ],
    saveData,
    { deep: true }
  )

  // Cargar datos al montar el componente
  onMounted(() => {
    cargarLineaCredito()
  })

  return {
    // Estado y datos de la página
    tipcre,
    loading,
    error,
    lineaSeleccionada,
    lineasCache,
    trabajador,

    // Datos del convenio
    nitEmpresa,
    cedulaTrabajador,
    convenioVerificado,
    isElegible,
    getMensajeError,

    // Datos del simulador
    monto,
    plazoMeses,
    tasaEfectivaAnual,
    tasaMensualInput,
    tipoTasa,
    ingresosMensuales,
    descuentosMensuales,
    maxEndeudamientoPct,
    montoSan,
    plazoMesesSan,
    tasaEASan,
    tasaMensualSan,
    ingresosSan,
    ingresosBrutosSan,
    descuentosSan,
    tasaMensual,
    cuotaMensual,
    totalPagar,
    intereses,
    capacidadDisponible,
    maxCuotaPermitida,
    margen,
    apto,
    fmt,
    fmtPct,
    reset,
    cambiarTipoTasa,

    // Computed y funciones específicas
    tasaInput,
    navigateToLineas,
    cargarLineaCredito,
    saveData,
    validarMontoMaximo
  }
}
