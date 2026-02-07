import { computed } from 'vue'
import type { CiudadOption, SelectOption, SolocitanteProps } from '~/shared/types/solicitud-credito'

export const useSolicitanteStep = (props: SolocitanteProps) => {
  // Opciones para tipo persona
  const tiposPersonaOptions = computed(() => [
    { label: 'Natural', value: 'natural' },
    { label: 'Jurídica', value: 'juridica' }
  ])

  // Convertir datos a formato SelectOption
  const tiposDocumentoOptions = computed(() =>
    (props.tiposDocumento || []).map(item => ({
      label: item.detdoc,
      value: item.coddoc
    }))
  )

  const ocupacionesOptions = computed(() =>
    (props.ocupaciones || []).map(item => ({
      label: item.detalle,
      value: item.codocu
    }))
  )

  const sexosOptions = computed(() =>
    (props.sexos || []).map(item => ({
      label: item.detsex,
      value: item.codsex
    }))
  )

  const nivelesEducativosOptions = computed(() =>
    (props.nivelesEducativos || []).map(item => ({
      label: item.detalle,
      value: item.nivedu
    }))
  )

  const tiposViviendaOptions = computed(() =>
    (props.tiposVivienda || []).map(item => ({
      label: item.detalle,
      value: item.vivienda
    }))
  )

  const estadoCivilesOptions = computed(() =>
    (props.estadoCiviles || []).map(item => ({
      label: item.detest,
      value: item.estciv
    }))
  )

  const ciudadesOptions = computed(() =>
    (props.ciudades || []).map(item => ({
      label: item.detciu,
      value: item.codciu,
      description: `Código: ${item.codciu}`
    }))
  )

  // Event handlers
  const handleCiudadChange = (option: SelectOption) => {
    console.log('Ciudad seleccionada:', option)
    // Aquí puedes agregar lógica adicional cuando se selecciona una ciudad
  }

  return {
    // Opciones para los selects
    tiposPersonaOptions,
    tiposDocumentoOptions,
    ocupacionesOptions,
    sexosOptions,
    nivelesEducativosOptions,
    tiposViviendaOptions,
    estadoCivilesOptions,
    ciudadesOptions,

    // Event handlers
    handleCiudadChange
  }
}
